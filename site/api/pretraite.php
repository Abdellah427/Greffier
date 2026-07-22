<?php
// Prétraitement d'une page de registre, exécuté sur le serveur (bibliothèque
// GD, présente sur tout hébergement mutualisé courant). Port de la chaîne
// maison src/pretraite.py : recadrage, redressement, fond aplani (correction
// par division), contraste, netteté. Mêmes étapes, mêmes seuils.
//
// POST {image: base64} -> {image: base64 JPEG prétraité}
// L'image est traitée en mémoire et jamais écrite sur le disque.
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function refuse(int $code, string $message): void
{
    http_response_code($code);
    echo json_encode(['erreur' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    refuse(405, 'Méthode non autorisée.');
}
if (!function_exists('imagecreatefromstring')) {
    refuse(503, "La bibliothèque GD n'est pas disponible sur ce serveur.");
}

// Garde-fous : le prétraitement coûte du calcul. Une quarantaine par jour
// et par visiteur couvre un usage réel, et un plafond global protège le
// serveur mutualisé si la fréquentation s'emballe.
$ip = $_SERVER['REMOTE_ADDR'] ?? 'inconnue';
$compteur = sys_get_temp_dir() . '/greffier_pretraite_' . md5($ip) . '_' . date('Ymd');
$n = (int) @file_get_contents($compteur);
if ($n >= 40) {
    refuse(429, 'Assez de prétraitements pour aujourd\'hui : revenez demain.');
}
$global = sys_get_temp_dir() . '/greffier_pretraite_global_' . date('Ymd');
$g = (int) @file_get_contents($global);
if ($g >= 300) {
    refuse(429, 'Le service de prétraitement a beaucoup servi aujourd\'hui : '
              . 'revenez demain, la lecture reste possible sur la page brute.');
}
@file_put_contents($compteur, (string) ($n + 1), LOCK_EX);
@file_put_contents($global, (string) ($g + 1), LOCK_EX);

$corps = json_decode((string) file_get_contents('php://input'), true);
$brut = base64_decode((string) ($corps['image'] ?? ''), true);
if ($brut === false || strlen($brut) < 100) {
    refuse(400, 'Image illisible.');
}
if (strlen($brut) > 8 * 1024 * 1024) {
    refuse(413, 'Image trop lourde (8 Mo maximum).');
}
$image = @imagecreatefromstring($brut);
if (!$image) {
    refuse(400, "Format d'image non reconnu (JPG, PNG ou WebP attendu).");
}
unset($brut);
@set_time_limit(120);

/* ---------- outils d'analyse (sur vignette, pour rester rapide) ---------- */

function gris_reduit(GdImage $img, int $largeur): GdImage
{
    $petit = imagescale($img, $largeur, -1, IMG_BILINEAR_FIXED);
    imagefilter($petit, IMG_FILTER_GRAYSCALE);
    return $petit;
}

function histogramme(GdImage $img): array
{
    $histo = array_fill(0, 256, 0);
    $w = imagesx($img);
    $h = imagesy($img);
    for ($y = 0; $y < $h; $y++) {
        for ($x = 0; $x < $w; $x++) {
            $histo[imagecolorat($img, $x, $y) & 0xFF]++;
        }
    }
    return $histo;
}

function percentile(array $histo, float $p): int
{
    $seuil = array_sum($histo) * $p / 100;
    $cumul = 0;
    for ($v = 0; $v < 256; $v++) {
        $cumul += $histo[$v];
        if ($cumul >= $seuil) {
            return $v;
        }
    }
    return 255;
}

/* ---------- les cinq étapes de la chaîne ---------- */

// Rogne les bords sombres (fond du scanner, tranche du livre).
function etape_recadre(GdImage $image): GdImage
{
    $W = imagesx($image);
    $H = imagesy($image);
    $petit = gris_reduit($image, 240);
    $pw = imagesx($petit);
    $ph = imagesy($petit);
    $histo = histogramme($petit);
    $sombre = percentile($histo, 5);
    $clair = percentile($histo, 95);
    if ($clair - $sombre < 40) {          // image plate : rien à rogner
        imagedestroy($petit);
        return $image;
    }
    $seuil = ($sombre + $clair) / 2;
    $colonnes = array_fill(0, $pw, 0);
    $lignes = [];
    for ($y = 0; $y < $ph; $y++) {
        $somme = 0;
        for ($x = 0; $x < $pw; $x++) {
            if ((imagecolorat($petit, $x, $y) & 0xFF) > $seuil) {
                $somme++;
                $colonnes[$x]++;
            }
        }
        $lignes[$y] = $somme / $pw;
    }
    imagedestroy($petit);
    $idxL = array_keys(array_filter($lignes, fn($m) => $m > 0.35));
    $idxC = array_keys(array_filter($colonnes, fn($c) => $c / $ph > 0.35));
    if (!$idxL || !$idxC) {
        return $image;
    }
    $marge = (int) (0.01 * max($W, $H));
    $haut = max(0, (int) ($idxL[0] * $H / $ph) - $marge);
    $bas = min($H, (int) ((end($idxL) + 1) * $H / $ph) + $marge);
    $gauche = max(0, (int) ($idxC[0] * $W / $pw) - $marge);
    $droite = min($W, (int) ((end($idxC) + 1) * $W / $pw) + $marge);
    if (($bas - $haut) < $H * 0.5 || ($droite - $gauche) < $W * 0.3) {
        return $image;                    // détection improbable : prudence
    }
    $rogne = imagecrop($image, ['x' => $gauche, 'y' => $haut,
                                'width' => $droite - $gauche,
                                'height' => $bas - $haut]);
    if (!$rogne) {
        return $image;
    }
    imagedestroy($image);
    return $rogne;
}

// Redresse la page : l'angle (à ±3 degrés) qui maximise l'alternance
// lignes/interlignes de la projection horizontale de l'encre.
function etape_redresse(GdImage $image): GdImage
{
    $petit = gris_reduit($image, 200);
    imagefilter($petit, IMG_FILTER_NEGATE);   // image d'encre
    $pw = imagesx($petit);
    $ph = imagesy($petit);
    $histo = histogramme($petit);
    $total = max(1, array_sum($histo));
    $somme = 0;
    foreach ($histo as $v => $c) {
        $somme += $v * $c;
    }
    $moyenne = (int) round($somme / $total);
    $fond_encre = ($moyenne << 16) | ($moyenne << 8) | $moyenne;

    $score = function (float $angle) use ($petit, $fond_encre, $pw, $ph): float {
        $tourne = imagerotate($petit, $angle, $fond_encre);
        $ox = intdiv(imagesx($tourne) - $pw, 2);
        $oy = intdiv(imagesy($tourne) - $ph, 2);
        $sommes = [];
        for ($y = 0; $y < $ph; $y++) {
            $s = 0;
            for ($x = 0; $x < $pw; $x++) {
                $s += imagecolorat($tourne, $ox + $x, $oy + $y) & 0xFF;
            }
            $sommes[] = $s;
        }
        imagedestroy($tourne);
        $m = array_sum($sommes) / $ph;
        $v = 0.0;
        foreach ($sommes as $s) {
            $v += ($s - $m) ** 2;
        }
        return $v / $ph;
    };

    // Recherche grossière puis affinage autour du meilleur angle.
    $meilleur = 0.0;
    $max = -1.0;
    for ($a = -3.0; $a <= 3.01; $a += 0.5) {
        $s = $score($a);
        if ($s > $max) {
            $max = $s;
            $meilleur = $a;
        }
    }
    for ($a = $meilleur - 0.4; $a <= $meilleur + 0.41; $a += 0.1) {
        $s = $score($a);
        if ($s > $max) {
            $max = $s;
            $meilleur = $a;
        }
    }
    imagedestroy($petit);
    if (abs($meilleur) < 0.15) {
        return $image;
    }

    $gris = gris_reduit($image, 200);
    $papier = percentile(histogramme($gris), 60);
    imagedestroy($gris);
    $W = imagesx($image);
    $H = imagesy($image);
    $tourne = imagerotate($image, $meilleur,
                          ($papier << 16) | ($papier << 8) | $papier);
    imagedestroy($image);
    // imagerotate agrandit le cadre : on recentre à la taille d'origine.
    $cadre = imagecrop($tourne, [
        'x' => intdiv(imagesx($tourne) - $W, 2),
        'y' => intdiv(imagesy($tourne) - $H, 2),
        'width' => $W,
        'height' => $H,
    ]);
    if (!$cadre) {
        return $tourne;
    }
    imagedestroy($tourne);
    return $cadre;
}

// Fond aplani (division par le fond flouté) et contraste étiré, en une
// seule passe sur les pixels : le papier redevient uniforme, l'encre ressort.
function etape_fond_contraste(GdImage $image): GdImage
{
    $W = imagesx($image);
    $H = imagesy($image);

    // Carte du fond : vignette fortement floutée, relue en tableau PHP.
    $bw = 64;
    $fond = gris_reduit($image, $bw);
    for ($i = 0; $i < 4; $i++) {
        imagefilter($fond, IMG_FILTER_GAUSSIAN_BLUR);
    }
    $bh = imagesy($fond);
    $carte = [];
    for ($y = 0; $y < $bh; $y++) {
        $ligne = [];
        for ($x = 0; $x < $bw; $x++) {
            $ligne[] = max(1, imagecolorat($fond, $x, $y) & 0xFF);
        }
        $carte[] = $ligne;
    }
    imagedestroy($fond);
    $mapx = [];
    for ($x = 0; $x < $W; $x++) {
        $mapx[$x] = min($bw - 1, intdiv($x * $bw, $W));
    }
    $mapy = [];
    for ($y = 0; $y < $H; $y++) {
        $mapy[$y] = min($bh - 1, intdiv($y * $bh, $H));
    }

    // Échantillonnage : percentile 90 du rapport gris/fond (normalisation),
    // puis bornes à 1 % pour l'étirement du contraste.
    $pas = max(2, (int) sqrt($W * $H / 40000));
    $ratios = array_fill(0, 512, 0);
    for ($y = 0; $y < $H; $y += $pas) {
        $cf = $carte[$mapy[$y]];
        for ($x = 0; $x < $W; $x += $pas) {
            $c = imagecolorat($image, $x, $y);
            $g = (299 * (($c >> 16) & 0xFF) + 587 * (($c >> 8) & 0xFF)
                  + 114 * ($c & 0xFF)) / 1000;
            $ratios[min(511, (int) ($g / $cf[$mapx[$x]] * 256))]++;
        }
    }
    $p90 = max(1, percentile_large($ratios, 90));
    $echelle = 255.0 * 256.0 / ($p90 * 1.0);   // rapport -> valeur 0..255

    $valeurs = array_fill(0, 256, 0);
    for ($y = 0; $y < $H; $y += $pas) {
        $cf = $carte[$mapy[$y]];
        for ($x = 0; $x < $W; $x += $pas) {
            $c = imagecolorat($image, $x, $y);
            $g = (299 * (($c >> 16) & 0xFF) + 587 * (($c >> 8) & 0xFF)
                  + 114 * ($c & 0xFF)) / 1000;
            $v = (int) ($g / $cf[$mapx[$x]] * $echelle);
            $valeurs[max(0, min(255, $v))]++;
        }
    }
    $bas = percentile($valeurs, 1);
    $haut = max($bas + 1, percentile($valeurs, 99));
    $gain = 255.0 / ($haut - $bas);

    // La passe principale : division par le fond puis étirement, pixel à pixel.
    $sortie = imagecreatetruecolor($W, $H);
    for ($y = 0; $y < $H; $y++) {
        $cf = $carte[$mapy[$y]];
        for ($x = 0; $x < $W; $x++) {
            $c = imagecolorat($image, $x, $y);
            $g = (299 * (($c >> 16) & 0xFF) + 587 * (($c >> 8) & 0xFF)
                  + 114 * ($c & 0xFF)) / 1000;
            $v = (int) (($g / $cf[$mapx[$x]] * $echelle - $bas) * $gain);
            $v = $v < 0 ? 0 : ($v > 255 ? 255 : $v);
            imagesetpixel($sortie, $x, $y, ($v << 16) | ($v << 8) | $v);
        }
    }
    imagedestroy($image);
    return $sortie;
}

function percentile_large(array $histo, float $p): int
{
    $seuil = array_sum($histo) * $p / 100;
    $cumul = 0;
    foreach ($histo as $v => $c) {
        $cumul += $c;
        if ($cumul >= $seuil) {
            return $v;
        }
    }
    return count($histo) - 1;
}

// Accentue les traits d'encre (équivalent d'un masque flou doux).
function etape_nettete(GdImage $image): GdImage
{
    if (function_exists('imageconvolution')) {
        imageconvolution($image, [[-0.4, -0.4, -0.4],
                                  [-0.4,  4.2, -0.4],
                                  [-0.4, -0.4, -0.4]], 1.0, 0.0);
    } else {
        imagefilter($image, IMG_FILTER_SMOOTH, -4);
    }
    return $image;
}

/* ---------- la chaîne ---------- */

$W = imagesx($image);
$H = imagesy($image);
$long = max($W, $H);
if ($long > 1300) {                       // borne le temps de calcul
    $reduit = imagescale($image, (int) round($W * 1300 / $long), -1,
                         IMG_BILINEAR_FIXED);
    imagedestroy($image);
    $image = $reduit;
}

$image = etape_recadre($image);
$image = etape_redresse($image);
$image = etape_fond_contraste($image);
$image = etape_nettete($image);

ob_start();
imagejpeg($image, null, 88);
$jpeg = ob_get_clean();
imagedestroy($image);

echo json_encode(['image' => base64_encode($jpeg)]);
