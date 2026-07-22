<?php
// Service de lecture en ligne : reçoit une image de registre, la fait lire
// par le modèle demandé et renvoie le texte en streaming. Les clés restent
// côté serveur (config.php, jamais versionné) et des quotas journaliers
// protègent les paliers gratuits.
declare(strict_types=1);

header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: no-cache');
header('X-Accel-Buffering: no');

function refuse(int $code, string $message): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['erreur' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

$config = @include __DIR__ . '/config.php';
if (!is_array($config)) {
    $config = [];
}

// Fournisseurs disponibles. Nouvelle forme : $config['fournisseurs'] donne,
// par nom, la clé et le modèle. L'ancienne forme (gemini_api_key + modele)
// reste comprise.
$fournisseurs = $config['fournisseurs'] ?? [];
if (!$fournisseurs && !empty($config['gemini_api_key'])) {
    $fournisseurs = ['gemini' => [
        'cle' => $config['gemini_api_key'],
        'modele' => $config['modele'] ?? 'gemini-3.6-flash',
    ]];
}
$fournisseurs = array_filter($fournisseurs, fn($f) => !empty($f['cle']));

if (!$fournisseurs) {
    refuse(503, "Le service en ligne n'est pas configuré sur cet hébergement. "
              . "Utilisez le mode Replay, Navigateur ou Ollama.");
}

// Liste publique des fournisseurs configurés (aucun secret) : la page du
// banc d'essai s'en sert pour griser les modèles absents.
if (isset($_GET['fournisseurs'])) {
    header('Content-Type: application/json; charset=utf-8');
    $ip_visiteur = $_SERVER['REMOTE_ADDR'] ?? 'inconnue';
    $compteur = sys_get_temp_dir() . '/greffier_ip_' . md5($ip_visiteur) . '_' . date('Ymd');
    $utilisees = (int) @file_get_contents($compteur);
    $par_jour = (int) ($config['quota_ip'] ?? 15);
    echo json_encode([
        'fournisseurs' => array_map(
            fn($f) => ['modele' => $f['modele'] ?? '', 'libelle' => $f['nom'] ?? ''],
            $fournisseurs),
        'quota' => ['par_jour' => $par_jour,
                    'restantes' => max(0, $par_jour - $utilisees)],
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Page de diagnostic : /api/lire.php?diagnostic=1 vérifie toute la chaîne
// pour chaque fournisseur configuré (validité des clés comprise), sans
// jamais révéler les clés.
if (isset($_GET['diagnostic'])) {
    $etat = [
        'php' => PHP_VERSION,
        'curl' => function_exists('curl_init'),
    ];

    // Pour chaque fournisseur, un appel léger qui exige la clé : la réponse
    // dit si elle est valide, sans consommer de lecture.
    $verifications = [
        'gemini' => fn($cle) => ['https://generativelanguage.googleapis.com/v1beta/models?pageSize=1',
                                 ['x-goog-api-key: ' . $cle]],
        'openrouter' => fn($cle) => ['https://openrouter.ai/api/v1/key',
                                     ['Authorization: Bearer ' . $cle]],
        'mistral' => fn($cle) => ['https://api.mistral.ai/v1/models',
                                  ['Authorization: Bearer ' . $cle]],
    ];
    $tout_va = true;
    foreach ($fournisseurs as $nom => $fournisseur) {
        $type = $fournisseur['type'] ?? $nom;
        $bilan = ['modele' => $fournisseur['modele'] ?? ''];
        if (!isset($verifications[$type])) {
            $bilan['etat'] = 'fournisseur inconnu du diagnostic';
            $etat['fournisseurs'][$nom] = $bilan;
            $tout_va = false;
            continue;
        }
        [$url, $entetes] = $verifications[$type]($fournisseur['cle']);
        $curl = curl_init($url);
        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 20,
            CURLOPT_HTTPHEADER => $entetes,
        ]);
        $reponse = curl_exec($curl);
        $code = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
        $erreur_reseau = curl_error($curl) ?: null;
        curl_close($curl);
        $bilan['code_http'] = $code;
        if ($erreur_reseau) {
            $bilan['etat'] = "erreur réseau : $erreur_reseau";
            $tout_va = false;
        } elseif ($code === 200) {
            $bilan['etat'] = 'clé valide, API joignable';
        } else {
            $detail = json_decode((string) $reponse, true);
            $bilan['etat'] = 'refusé : ' . substr(
                (string) ($detail['error']['message'] ?? $detail['message']
                          ?? substr((string) $reponse, 0, 200)), 0, 200);
            $tout_va = false;
        }
        $etat['fournisseurs'][$nom] = $bilan;
    }
    $etat['verdict'] = $tout_va
        ? 'Tout fonctionne : toutes les clés configurées sont valides.'
        : 'Au moins un fournisseur pose problème, voir le détail ci-dessus.';
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($etat, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    refuse(405, "Ce service s'utilise depuis les pages demo.html et banc.html, "
              . "qui lui envoient l'image à lire. Pour vérifier l'installation, "
              . "ouvrez api/lire.php?diagnostic=1");
}

// Quotas journaliers : un compteur par visiteur et un compteur global,
// remis à zéro chaque jour par la date incluse dans le nom du fichier.
function quota_atteint(string $cle, int $max): bool
{
    $fichier = sys_get_temp_dir() . '/greffier_' . $cle . '_' . date('Ymd');
    $n = (int) @file_get_contents($fichier);
    if ($n >= $max) {
        return true;
    }
    @file_put_contents($fichier, (string) ($n + 1), LOCK_EX);
    return false;
}

$ip = $_SERVER['REMOTE_ADDR'] ?? 'inconnue';
if (quota_atteint('ip_' . md5($ip), (int) ($config['quota_ip'] ?? 15))) {
    refuse(429, 'Vous avez épuisé votre quota de lectures pour aujourd\'hui. '
              . 'Revenez demain, ou utilisez le mode Navigateur ou Ollama.');
}
if (quota_atteint('global', (int) ($config['quota_global'] ?? 200))) {
    refuse(429, 'Le quota gratuit du jour est épuisé pour tout le monde. '
              . 'Revenez demain, ou utilisez le mode Navigateur ou Ollama.');
}

$corps = json_decode((string) file_get_contents('php://input'), true);
$image = is_array($corps) ? (string) ($corps['image'] ?? '') : '';
if ($image === '' || strlen($image) > 6 * 1024 * 1024
        || !preg_match('#^[A-Za-z0-9+/=]+$#', $image)) {
    refuse(400, 'Image absente ou invalide.');
}
$nom_fournisseur = is_array($corps) ? (string) ($corps['fournisseur'] ?? 'gemini') : 'gemini';
if (!isset($fournisseurs[$nom_fournisseur])) {
    refuse(400, "Le modèle demandé ($nom_fournisseur) n'est pas configuré sur ce site.");
}
$fournisseur = $fournisseurs[$nom_fournisseur];
$type_fournisseur = $fournisseur['type'] ?? $nom_fournisseur;

$champs = ['date_mariage', 'lieu_mariage',
    'nom_prenom_marie', 'profession_marie', 'adresse_marie',
    'nom_prenom_mariee', 'profession_mariee', 'adresse_mariee',
    'nom_pere_marie', 'profession_pere_marie',
    'nom_mere_marie', 'profession_mere_marie',
    'nom_pere_mariee', 'profession_pere_mariee',
    'nom_mere_mariee', 'profession_mere_mariee'];

$prompt = "Tu es un expert en paléographie et en état civil français.\n"
    . "Cette image est une page d'un registre d'actes de mariage parisien (début XXe siècle),\n"
    . "rédigée à la main. Transcris l'acte puis extrais les informations suivantes.\n\n"
    . "Réponds UNIQUEMENT avec un objet JSON (sans texte autour) contenant exactement ces clés :\n"
    . json_encode($champs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n"
    . "Si une information est absente ou illisible, mets null. N'invente rien.";

// Prépare la requête selon le fournisseur : Gemini a son API propre, les
// autres suivent le format de chat compatible OpenAI.
if ($type_fournisseur === 'gemini') {
    $modele = $fournisseur['modele'] ?? 'gemini-3.6-flash';
    $url = "https://generativelanguage.googleapis.com/v1beta/models/$modele:streamGenerateContent?alt=sse";
    $entetes = ['Content-Type: application/json',
                'x-goog-api-key: ' . $fournisseur['cle']];
    $requete = json_encode([
        'contents' => [[
            'parts' => [
                ['text' => $prompt],
                ['inline_data' => ['mime_type' => 'image/jpeg', 'data' => $image]],
            ],
        ]],
    ], JSON_UNESCAPED_UNICODE);
} else {
    $bases = ['openrouter' => 'https://openrouter.ai/api/v1',
              'mistral' => 'https://api.mistral.ai/v1'];
    $url = ($fournisseur['base'] ?? $bases[$type_fournisseur] ?? '') . '/chat/completions';
    if ($url === '/chat/completions') {
        refuse(400, "Fournisseur inconnu : $nom_fournisseur.");
    }
    $entetes = ['Content-Type: application/json',
                'Authorization: Bearer ' . $fournisseur['cle']];
    $requete = json_encode([
        'model' => $fournisseur['modele'] ?? '',
        'stream' => true,
        'messages' => [[
            'role' => 'user',
            'content' => [
                ['type' => 'text', 'text' => $prompt],
                ['type' => 'image_url', 'image_url' => [
                    'url' => 'data:image/jpeg;base64,' . $image,
                ]],
            ],
        ]],
    ], JSON_UNESCAPED_UNICODE);
}

set_time_limit(180);
while (ob_get_level() > 0) {
    ob_end_flush();
}

$tampon = '';
$brut = '';
$envoye = false;

$curl = curl_init($url);
curl_setopt_array($curl, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $requete,
    CURLOPT_HTTPHEADER => $entetes,
    CURLOPT_TIMEOUT => 170,
    // Relaye chaque fragment SSE au navigateur dès son arrivée.
    CURLOPT_WRITEFUNCTION => function ($curl, string $fragment)
            use (&$tampon, &$brut, &$envoye, $type_fournisseur): int {
        if (strlen($brut) < 8192) {
            $brut .= $fragment;   // conservé pour le détail d'une éventuelle erreur
        }
        $tampon .= $fragment;
        while (($fin = strpos($tampon, "\n")) !== false) {
            $ligne = trim(substr($tampon, 0, $fin));
            $tampon = substr($tampon, $fin + 1);
            if (!str_starts_with($ligne, 'data: ') || $ligne === 'data: [DONE]') {
                continue;
            }
            $donnees = json_decode(substr($ligne, 6), true);
            if ($type_fournisseur === 'gemini') {
                foreach ($donnees['candidates'][0]['content']['parts'] ?? [] as $part) {
                    if (isset($part['text'])) {
                        echo $part['text'];
                        $envoye = true;
                        flush();
                    }
                }
            } else {
                $texte = $donnees['choices'][0]['delta']['content']
                    ?? $donnees['choices'][0]['message']['content'] ?? null;
                if ($texte !== null && $texte !== '') {
                    echo $texte;
                    $envoye = true;
                    flush();
                }
            }
        }
        return strlen($fragment);
    },
]);

$ok = curl_exec($curl);
$statut = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
curl_close($curl);

if (!$envoye && $ok !== false && $statut === 200) {
    // Fournisseur qui a ignoré le mode streaming : réponse JSON d'un bloc.
    $entier = json_decode($brut, true);
    $texte = $entier['choices'][0]['message']['content']
        ?? $entier['candidates'][0]['content']['parts'][0]['text'] ?? null;
    if ($texte) {
        echo $texte;
        $envoye = true;
    }
}

if (!$envoye && ($ok === false || $statut >= 400)) {
    $detail = json_decode($brut, true);
    $message = $detail['error']['message'] ?? $detail[0]['error']['message'] ?? null;
    refuse(502, 'Le modèle a refusé la demande'
              . ($message ? ' : ' . substr($message, 0, 300) : ' (voir api/lire.php?diagnostic=1).')
              . ' Les modes Navigateur et Ollama restent disponibles.');
}
