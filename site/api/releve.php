<?php
// Registre des lectures publiques : chaque essai du banc (page annotée,
// modèle, score face à la référence) est consigné, et les moyennes
// cumulées sont servies au site. Aucune donnée personnelle : seulement
// les pages annotées du site et des comptes de champs.
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$fichier = __DIR__ . '/releves.jsonl';
$FOURNISSEURS = ['gemini', 'openrouter', 'mistral'];

function refuse(int $code, string $message): void
{
    http_response_code($code);
    echo json_encode(['erreur' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

// GET : les moyennes par modèle, calculées sur tout le registre.
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') {
    $bilan = [];
    foreach (@file($fichier, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $ligne) {
        $releve = json_decode($ligne, true);
        if (!is_array($releve)) {
            continue;
        }
        $nom = $releve['fournisseur'] ?? '';
        $bilan[$nom]['lectures'] = ($bilan[$nom]['lectures'] ?? 0) + 1;
        $bilan[$nom]['exacts'] = ($bilan[$nom]['exacts'] ?? 0) + (int) $releve['exacts'];
        $bilan[$nom]['proches'] = ($bilan[$nom]['proches'] ?? 0) + (int) $releve['proches'];
    }
    $sortie = [];
    foreach ($bilan as $nom => $b) {
        $total = $b['lectures'] * 16;
        $sortie[$nom] = [
            'lectures' => $b['lectures'],
            'exact_pourcent' => (int) round(100 * $b['exacts'] / $total),
            'exact_ou_proche_pourcent' => (int) round(100 * ($b['exacts'] + $b['proches']) / $total),
        ];
    }
    echo json_encode(['releves' => $sortie], JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    refuse(405, 'Méthode non autorisée.');
}

// Garde-fou : une trentaine de dépôts par visiteur et par jour suffit.
$ip = $_SERVER['REMOTE_ADDR'] ?? 'inconnue';
$compteur = sys_get_temp_dir() . '/greffier_releve_' . md5($ip) . '_' . date('Ymd');
$n = (int) @file_get_contents($compteur);
if ($n >= 30) {
    refuse(429, 'Assez de relevés pour aujourd\'hui.');
}
@file_put_contents($compteur, (string) ($n + 1), LOCK_EX);

$corps = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($corps)) {
    refuse(400, 'Relevé invalide.');
}
$page = (string) ($corps['page'] ?? '');
$fournisseur = (string) ($corps['fournisseur'] ?? '');
$exacts = $corps['exacts'] ?? null;
$proches = $corps['proches'] ?? null;
$faux = $corps['faux'] ?? null;

if (!in_array($fournisseur, $FOURNISSEURS, true)
        || !preg_match('#^banc/[A-Za-z0-9_.-]{1,80}\.jpg$#', $page)
        || !is_int($exacts) || !is_int($proches) || !is_int($faux)
        || $exacts < 0 || $proches < 0 || $faux < 0
        || $exacts + $proches + $faux !== 16) {
    refuse(400, 'Relevé invalide.');
}

$config = @include __DIR__ . '/config.php';
$modele = $config['fournisseurs'][$fournisseur]['modele'] ?? '';

$releve = [
    'date' => date('c'),
    'page' => $page,
    'fournisseur' => $fournisseur,
    'modele' => $modele,
    'exacts' => $exacts,
    'proches' => $proches,
    'faux' => $faux,
];
@file_put_contents($fichier, json_encode($releve, JSON_UNESCAPED_UNICODE) . "\n",
                   FILE_APPEND | LOCK_EX);
echo json_encode(['enregistre' => true]);
