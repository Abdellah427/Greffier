<?php
// Copiez ce fichier en config.php sur le serveur et renseignez vos clés.
// config.php est ignoré par git : les clés ne sont jamais versionnées.
//
// Chaque entrée de 'fournisseurs' devient un bouton sur le site (démo et
// banc d'essai). Ajoutez-en autant que vous voulez : 'type' indique quelle
// API utiliser (gemini, openrouter ou mistral), 'nom' le libellé affiché.
// Seules les entrées dont la clé est renseignée sont actives.
return [
    'fournisseurs' => [
        // Clé gratuite : https://aistudio.google.com/apikey
        'gemini' => [
            'type' => 'gemini',
            'nom' => 'Gemini Flash',
            'cle' => '',
            'modele' => 'gemini-3.6-flash',
        ],
        // Clé gratuite : https://openrouter.ai/keys (la même pour les trois)
        'gemma' => [
            'type' => 'openrouter',
            'nom' => 'Gemma 26B',
            'cle' => '',
            'modele' => 'google/gemma-4-26b-a4b-it:free',
        ],
        'nemotron-vl' => [
            'type' => 'openrouter',
            'nom' => 'Nemotron 12B VL',
            'cle' => '',
            'modele' => 'nvidia/nemotron-nano-12b-v2-vl:free',
        ],
        'nemotron-omni' => [
            'type' => 'openrouter',
            'nom' => 'Nemotron 30B Omni',
            'cle' => '',
            'modele' => 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
        ],
        // Clé (palier découverte) : https://console.mistral.ai
        'mistral' => [
            'type' => 'mistral',
            'nom' => 'Mistral Medium',
            'cle' => '',
            'modele' => 'mistral-medium-latest',
        ],
    ],

    // Lectures par visiteur et par jour, tous modèles confondus.
    'quota_ip' => 15,

    // Lectures par jour, tous visiteurs confondus : garde les paliers
    // gratuits hors de portée d'un abus.
    'quota_global' => 200,
];
