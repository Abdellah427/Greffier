<?php
// L'atelier des portraits de la page Origines : dépôt et retrait des
// photographies qui illustrent les personnes de l'arbre.
// Réservé au détenteur de la clé 'cle_atelier' du config.php serveur.
//
// POST {cle, personne, image: base64}   -> enregistre le portrait
// POST {cle, personne, supprimer: true} -> retire le portrait
// GET  ?liste=1                         -> liste des portraits existants
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$dossier = dirname(__DIR__) . '/origines/portraits';

function refuse(int $code, string $message): void
{
    http_response_code($code);
    echo json_encode(['erreur' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

// La liste des portraits est publique : la page en a besoin pour l'affichage.
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') {
    $portraits = [];
    foreach (glob($dossier . '/*.jpg') ?: [] as $fichier) {
        $portraits[] = basename($fichier, '.jpg');
    }
    echo json_encode(['portraits' => $portraits]);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    refuse(405, 'Méthode non autorisée.');
}

$config = @include __DIR__ . '/config.php';
$cle_attendue = (string) ($config['cle_atelier'] ?? '');
if ($cle_attendue === '') {
    refuse(503, "L'atelier n'est pas activé : renseignez 'cle_atelier' dans config.php.");
}

$corps = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($corps)) {
    refuse(400, 'Requête invalide.');
}
if (!hash_equals($cle_attendue, (string) ($corps['cle'] ?? ''))) {
    refuse(403, 'Clé de l\'atelier incorrecte.');
}
$personne = (string) ($corps['personne'] ?? '');
if (!preg_match('/^[a-z0-9-]{1,40}$/', $personne)) {
    refuse(400, 'Identifiant de personne invalide.');
}
$chemin = $dossier . '/' . $personne . '.jpg';

if (!empty($corps['supprimer'])) {
    if (is_file($chemin)) {
        @unlink($chemin);
    }
    echo json_encode(['retire' => true]);
    exit;
}

$brut = base64_decode((string) ($corps['image'] ?? ''), true);
if ($brut === false || strlen($brut) < 100) {
    refuse(400, 'Image illisible.');
}
if (strlen($brut) > 6 * 1024 * 1024) {
    refuse(413, 'Image trop lourde (6 Mo maximum).');
}
if (!function_exists('imagecreatefromstring')) {
    refuse(503, "La bibliothèque GD n'est pas disponible sur ce serveur.");
}
$image = @imagecreatefromstring($brut);
if (!$image) {
    refuse(400, "Format d'image non reconnu (JPG, PNG ou WebP attendu).");
}

// Réduction : les portraits de l'arbre n'ont pas besoin de plus de 700 px.
$long = max(imagesx($image), imagesy($image));
if ($long > 700) {
    $reduit = imagescale($image, (int) round(imagesx($image) * 700 / $long),
                         -1, IMG_BILINEAR_FIXED);
    imagedestroy($image);
    $image = $reduit;
}

if (!is_dir($dossier)) {
    @mkdir($dossier, 0755, true);
}
ob_start();
imagejpeg($image, null, 86);
$jpeg = ob_get_clean();
imagedestroy($image);
if (@file_put_contents($chemin, $jpeg) === false) {
    refuse(500, 'Impossible d\'écrire le portrait sur le serveur.');
}
echo json_encode(['enregistre' => true, 'personne' => $personne]);
