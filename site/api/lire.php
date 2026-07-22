<?php
// Service de lecture en ligne : reçoit une image de registre, la fait lire
// par le palier gratuit de Gemini et renvoie le texte du modèle en streaming.
// La clé reste côté serveur (config.php, jamais versionné) et des quotas
// journaliers protègent le palier gratuit.
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
if (!is_array($config) || empty($config['gemini_api_key'])) {
    refuse(503, "Le service en ligne n'est pas configuré sur cet hébergement. "
              . "Utilisez le mode Replay, Navigateur ou Ollama.");
}
// Page de diagnostic : /api/lire.php?diagnostic=1 vérifie toute la chaîne
// (PHP, curl, configuration, joignabilité de l'API) sans révéler la clé.
if (isset($_GET['diagnostic'])) {
    $etat = [
        'php' => PHP_VERSION,
        'curl' => function_exists('curl_init'),
        'cle_presente' => true,
        'modele' => $config['modele'] ?? 'gemini-2.5-flash',
    ];
    $curl = curl_init('https://generativelanguage.googleapis.com/v1beta/models?pageSize=1');
    curl_setopt_array($curl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_HTTPHEADER => ['x-goog-api-key: ' . $config['gemini_api_key']],
    ]);
    $reponse = curl_exec($curl);
    $etat['api_code_http'] = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    $etat['api_erreur_reseau'] = curl_error($curl) ?: null;
    curl_close($curl);
    if ($reponse !== false && $etat['api_code_http'] >= 400) {
        $detail = json_decode($reponse, true);
        $etat['api_message'] = $detail['error']['message'] ?? substr($reponse, 0, 300);
    }
    $etat['verdict'] = ($etat['api_code_http'] === 200)
        ? 'Tout fonctionne : la clé est valide et l\'API répond.'
        : 'L\'API ne répond pas correctement, voir api_message ou api_erreur_reseau.';
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($etat, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    refuse(405, "Ce service s'utilise depuis la page demo.html (mode En ligne), "
              . "qui lui envoie l'image à lire. Pour vérifier l'installation, "
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

$modele = $config['modele'] ?? 'gemini-2.5-flash';
$requete = json_encode([
    'contents' => [[
        'parts' => [
            ['text' => $prompt],
            ['inline_data' => ['mime_type' => 'image/jpeg', 'data' => $image]],
        ],
    ]],
], JSON_UNESCAPED_UNICODE);

set_time_limit(180);
while (ob_get_level() > 0) {
    ob_end_flush();
}

$tampon = '';
$brut = '';
$envoye = false;

$curl = curl_init(
    "https://generativelanguage.googleapis.com/v1beta/models/$modele:streamGenerateContent?alt=sse"
);
curl_setopt_array($curl, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $requete,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'x-goog-api-key: ' . $config['gemini_api_key'],
    ],
    CURLOPT_TIMEOUT => 170,
    // Relaye chaque fragment SSE au navigateur dès son arrivée.
    CURLOPT_WRITEFUNCTION => function ($curl, string $fragment) use (&$tampon, &$brut, &$envoye): int {
        if (strlen($brut) < 8192) {
            $brut .= $fragment;   // conservé pour le détail d'une éventuelle erreur
        }
        $tampon .= $fragment;
        while (($fin = strpos($tampon, "\n")) !== false) {
            $ligne = trim(substr($tampon, 0, $fin));
            $tampon = substr($tampon, $fin + 1);
            if (!str_starts_with($ligne, 'data: ')) {
                continue;
            }
            $donnees = json_decode(substr($ligne, 6), true);
            foreach ($donnees['candidates'][0]['content']['parts'] ?? [] as $part) {
                if (isset($part['text'])) {
                    echo $part['text'];
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

if (!$envoye && ($ok === false || $statut >= 400)) {
    $detail = json_decode($brut, true);
    $message = $detail['error']['message'] ?? $detail[0]['error']['message'] ?? null;
    refuse(502, 'Le modèle a refusé la demande'
              . ($message ? ' : ' . substr($message, 0, 300) : ' (voir api/lire.php?diagnostic=1).')
              . ' Les modes Navigateur et Ollama restent disponibles.');
}
