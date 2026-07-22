<?php
// Copiez ce fichier en config.php sur le serveur et renseignez vos clés.
// config.php est ignoré par git : les clés ne sont jamais versionnées.
return [
    // Modèles proposés par le service en ligne. Seuls ceux dont la clé est
    // renseignée sont actifs ; les autres apparaissent grisés sur le site.
    'fournisseurs' => [
        // Clé gratuite : https://aistudio.google.com/apikey
        'gemini' => [
            'cle' => '',
            'modele' => 'gemini-3.6-flash',
        ],
        // Clé gratuite : https://openrouter.ai/keys
        'openrouter' => [
            'cle' => '',
            'modele' => 'google/gemma-4-31b-it:free',
        ],
        // Clé (palier découverte) : https://console.mistral.ai
        'mistral' => [
            'cle' => '',
            'modele' => 'mistral-small-latest',
        ],
    ],

    // Lectures par visiteur et par jour, tous modèles confondus.
    'quota_ip' => 15,

    // Lectures par jour, tous visiteurs confondus : garde les paliers
    // gratuits hors de portée d'un abus.
    'quota_global' => 200,
];
