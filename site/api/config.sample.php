<?php
// Copiez ce fichier en config.php sur le serveur et renseignez votre clé.
// config.php est ignoré par git : la clé n'est jamais versionnée.
return [
    // Clé gratuite : https://aistudio.google.com/apikey
    'gemini_api_key' => '',

    // Modèle utilisé par le service.
    'modele' => 'gemini-3.6-flash',

    // Lectures par visiteur et par jour.
    'quota_ip' => 15,

    // Lectures par jour, tous visiteurs confondus : garde le palier
    // gratuit hors de portée d'un abus.
    'quota_global' => 200,
];
