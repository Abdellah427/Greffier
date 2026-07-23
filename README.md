# Greffier : registres d'état civil manuscrits lus par des modèles de vision

Lecture automatique de **registres d'actes de mariage parisiens manuscrits**
par des modèles de vision : le modèle transcrit l'écriture d'une photographie
de registre, puis en extrait 16 champs structurés (date et lieu du mariage,
noms, professions et adresses des époux et de leurs parents).

Deux collections se côtoient :

- les actes des années **1913 et 1920** photographiés aux
  [Archives de Paris](https://archives.paris.fr) (cote AD075EC), que le
  pipeline dépouille : **130 actes** extraits ([`results.json`](results.json)) ;
- les pages annotées du jeu de recherche
  [M-POPP](https://zenodo.org/records/10980636) (Paris et sa banlieue,
  1880 à 1940, CC-BY 4.0), transcrites mot à mot par des chercheurs, qui
  servent à mesurer les modèles.

**Le site est en ligne : <https://abdellah-hassani.fr/greffier/demo.html>**

- [Démonstration](https://abdellah-hassani.fr/greffier/demo.html) : la
  machine lit une page en direct ;
- [Banc d'essai](https://abdellah-hassani.fr/greffier/banc.html) : les
  modèles notés face aux transcriptions des chercheurs ;
- [Explorateur](https://abdellah-hassani.fr/greffier/index.html) : les
  130 actes extraits, avec les registres en face à face.

## Le site de démonstration

Le dossier [`site/`](site/) se déploie en copiant simplement le dossier sur
n'importe quel hébergement web.

- **`demo.html` : la machine lit le registre, en direct.** On dépose la
  photographie d'une page (ou on choisit un feuillet d'exemple) et on regarde
  le modèle la transcrire en streaming, pendant que la fiche de mariage
  s'écrit champ par champ. Quatre modes, aucun ne demande de clé ni de compte
  au visiteur :
  - **Replay** : rejoue une extraction réelle enregistrée.
    Fonctionne instantanément, même sans le service en ligne ;
  - **En ligne** : le test le plus rapide avec sa propre image. La lecture
    passe par un petit service PHP hébergé avec le site, qui garde la clé
    côté serveur et impose un quota journalier (voir plus bas) ;
  - **Navigateur (WebGPU)** : un modèle de vision open weight (Qwen2-VL 2B,
    environ 2,7 Go téléchargés une fois puis mis en cache) tourne dans le
    navigateur du visiteur, rien ne quitte sa machine. Une pastille de
    compatibilité passe d'abord la machine en revue (WebGPU, processeur
    graphique, mémoire, espace disque) et bloque le lancement si elle est
    trop juste ;
  - **Ollama local** : la page dialogue avec l'Ollama du visiteur
    (`qwen2.5vl:7b`). La meilleure qualité de lecture locale, avec un
    modèle open weight. Une seule préparation :
    `ollama pull qwen2.5vl:7b` puis `OLLAMA_ORIGINS="https://votre-domaine" ollama serve`
    (Windows : `set OLLAMA_ORIGINS=https://votre-domaine` puis `ollama serve`,
    après avoir quitté l'Ollama de la barre des tâches).

  Dans tous les modes de lecture, un interrupteur applique la chaîne de
  prétraitement maison (exécutée par le serveur, curseur avant/après sur
  l'image), et un chronomètre montre l'avancement des étapes longues.
- **`banc.html` : le banc d'essai.** Six pages de registres transcrites mot à
  mot par des chercheurs (jeu M-POPP, CC-BY 4.0) : on lance la lecture et la
  fiche extraite est comparée champ par champ à leur transcription de
  référence, avec pourcentage de correspondance et erreurs surlignées.
  Les modèles configurés dans le `config.php` du serveur (voir
  `config.sample.php`) apparaissent en boutons, et l'Ollama local du
  visiteur s'y ajoute : on en coche un ou plusieurs, le palmarès s'affiche
  côte à côte, meilleure lecture mise en avant. Les scores de chaque essai
  alimentent un registre public anonyme qui désigne le meilleur modèle au
  fil des lectures.
- **`index.html` : l'explorateur.** Les 130 actes extraits, avec recherche
  plein texte insensible aux accents et filtres par champ et par année.
- **`origines.html` : pourquoi ce projet existe.** Mon prénom s'écrit
  Abdellah ou Abdallah selon les papiers ; la réponse était dans les
  documents que ma famille a portés de Marnia (Algérie) jusqu'en France.
  La page raconte l'enquête, document par document (un décret de 1965, un
  acte de mariage de 1940, une carte du combattant de 1936...), chaque
  pièce lue avec les outils du site puis vérifiée à la main, et dresse
  l'arbre de cinq générations relié à ses sources, avec une option pour
  masquer les personnes vivantes. Un atelier protégé par clé
  (`site/api/portrait.php`, clé `cle_atelier` du `config.php` serveur)
  permet de déposer un portrait sur chaque fiche ; les photographies
  restent sur le serveur, jamais dans le dépôt.

Pour l'essayer en local : `php -S localhost:8000 -t site` (ou
`python -m http.server -d site` sans le mode En ligne), puis ouvrir
http://localhost:8000/demo.html.

### Activer le mode En ligne sur son hébergement

Le service [`site/api/lire.php`](site/api/lire.php) (PHP 8, présent sur tout
hébergement mutualisé courant) relaie l'image vers les paliers gratuits des
API de vision (Gemini, OpenRouter, Mistral) et renvoie la réponse en
streaming. Les clés n'apparaissent jamais dans le navigateur ni dans le dépôt :

1. copier `site/api/config.sample.php` vers `site/api/config.php` sur le
   serveur (jamais dans git, il est ignoré) ;
2. y renseigner une ou plusieurs clés gratuites
   ([AI Studio](https://aistudio.google.com/apikey) pour Gemini,
   [openrouter.ai/keys](https://openrouter.ai/keys) pour Gemma et les
   Nemotron, [console.mistral.ai](https://console.mistral.ai) pour
   Mistral) : chaque entrée renseignée devient un bouton de modèle sur la
   démonstration et le banc d'essai ;
3. ajuster si besoin les quotas (`quota_ip`, `quota_global`) qui protègent
   les paliers gratuits d'un abus ; le site affiche à chaque visiteur le
   nombre de lectures qu'il lui reste pour la journée.

Sans `config.php`, le mode En ligne affiche un message clair et les trois
autres modes restent disponibles.

### Déployer sur son hébergement

Le script [`src/deploy.py`](src/deploy.py) envoie `site/` sur le serveur :

1. copier `deploy.config.sample.json` vers `deploy.config.json` à la racine
   et y renseigner l'hôte, l'identifiant, le mot de passe et le dossier
   cible (par exemple `www/greffier`). Ce fichier est ignoré par git : les
   identifiants ne sont jamais versionnés ;
2. lancer `python src/deploy.py` (ou `--liste` pour voir ce qui partirait).

Trois protocoles via le champ `"protocole"` : `sftp` (recommandé, chiffré,
port 22, demande `pip install paramiko`), `ftps` (bibliothèque standard,
retombe en FTP simple si le serveur ne le propose pas) ou `ftp`.

Le script crée l'arborescence distante au besoin et ne touche jamais au
`config.php` du serveur : celui-ci se dépose une seule fois, à la main.

## Le pipeline d'extraction

```
Images de registres --> Modèle de vision --> JSON structuré --> results.json --> site/
       (JPG)             (transcription +       (16 champs        + normalisation
                           extraction)           par acte)          des dates
```

| Script | Rôle |
|---|---|
| [`src/extract.py`](src/extract.py) | Parcourt un dossier d'images, interroge le modèle, agrège le JSON |
| [`src/normalize.py`](src/normalize.py) | Ajoute `date_iso` et `annee` aux actes (dates manuscrites vers ISO) |
| [`src/mpopp.py`](src/mpopp.py) | Télécharge le jeu M-POPP, prépare pages et transcriptions de référence |
| [`src/evalue.py`](src/evalue.py) | Mesure la précision de l'extraction face aux références, champ par champ |
| [`src/pretraite.py`](src/pretraite.py) | Chaîne de prétraitement des images (cinq étapes composables) |
| [`src/build_site.py`](src/build_site.py) | Régénère `site/data.js` à partir de `results.json` |
| [`src/deploy.py`](src/deploy.py) | Met le site en ligne (SFTP, FTPS ou FTP) |

```bash
pip install -r requirements.txt
python src/extract.py mon_dossier_images/ -o results.json
python src/normalize.py results.json
python src/build_site.py
```

### Agrandir le corpus

Le corpus grandit lot par lot : téléchargez de nouvelles pages de registres
sur le site des [Archives de Paris](https://archives.paris.fr) (état civil
numérisé), puis :

```bash
python src/extract.py nouvelles_pages/ --ajouter     # s'ajoute à results.json
python src/normalize.py results.json
python src/build_site.py
python src/deploy.py                                 # mise en ligne
```

Avec `--ajouter`, les actes existants sont conservés et les images déjà
traitées (reconnues par leur nom de fichier) sont sautées : on peut relancer
le même dossier sans créer de doublons. Plus le corpus grandit, plus la
recherche par nom de famille de l'explorateur devient intéressante pour les
visiteurs.

Autre gisement prêt à l'emploi : le jeu de recherche
[M-POPP](https://zenodo.org/records/10980636) (licence CC-BY 4.0), plus de
300 pages manuscrites d'actes de mariage de Paris et sa banlieue
(1880-1940). `python src/mpopp.py --pages pages_mpopp/` télécharge le jeu
et prépare les images pour le pipeline.

### Mesurer la précision du pipeline

M-POPP fournit aussi la transcription de référence de chaque acte, réalisée
par des chercheurs. On peut donc mesurer objectivement la qualité de
l'extraction, champ par champ :

```bash
python src/mpopp.py --pages pages_mpopp/ --reference reference_mpopp.json
python src/extract.py pages_mpopp/ -o extraction_mpopp.json
python src/evalue.py extraction_mpopp.json reference_mpopp.json
```

`src/evalue.py` apparie les actes par image, normalise les valeurs
(minuscules, accents, ponctuation) et classe chaque champ en exact, proche
(l'une des valeurs contient l'autre) ou faux, avec un tableau par champ et
un score global. L'option `--details` liste chaque désaccord.

### Prétraitement des images : la chaîne maison

[`src/pretraite.py`](src/pretraite.py) applique une chaîne de cinq
traitements conçus pour les défauts récurrents des numérisations
d'archives : `recadre` (bords noirs), `redresse` (page penchée), `fond`
(jaunissement et ombres de reliure, correction par division), `contraste`
et `nettete`. Chaque étape s'active ou non, ce qui permet une étude
d'ablation : mesurer l'apport de chacune, preuve à l'appui.

```bash
python src/pretraite.py pages_mpopp/ -o pages_pretraitees/ --apercu avant_apres.png
python src/extract.py pages_pretraitees/ -o extraction_pretraite.json --ajouter
python src/evalue.py extraction_pretraite.json reference_mpopp.json
```

En comparant ce score à celui des pages brutes, on obtient le gain (ou la
perte) de chaque configuration. Sur le banc d'essai du site,
l'interrupteur « Prétraitement » applique la même chaîne et un curseur
avant/après fait constater la différence sur l'image elle-même.

La chaîne existe aussi en PHP ([`site/api/pretraite.php`](site/api/pretraite.php),
bibliothèque GD, mêmes étapes et mêmes seuils) : sur la démonstration,
l'interrupteur « Prétraitement » du mode En ligne l'exécute sur le serveur
pour n'importe quelle page déposée, avant d'envoyer l'image au modèle,
avec le même curseur avant/après.

Données M-POPP : projet EXO-POPP, université de Rouen Normandie et
partenaires, sous licence CC-BY 4.0.

## Quatre backends pour le pipeline

| Backend | Coût | Libre ? | Prérequis |
|---|---|---|---|
| **`ollama`** (défaut) | 0 € | oui, modèle open weight, exécution 100 % locale | [Ollama](https://ollama.com) + `ollama pull qwen2.5vl:7b` (~6 Go, GPU ou CPU) |
| `gemini` | 0 € (palier gratuit) | non, API propriétaire | Clé gratuite sur [AI Studio](https://aistudio.google.com/apikey), dans `gemini.key` (ignoré par git) |
| `openrouter` | 0 € (environ 50 lectures/jour) | selon le modèle choisi | Clé gratuite sur [openrouter.ai/keys](https://openrouter.ai/keys), dans `openrouter.key` (ignoré par git) |
| `mistral` | 0 € (palier découverte) | non, API propriétaire | Clé sur [console.mistral.ai](https://console.mistral.ai), dans `mistral.key` (ignoré par git) |

```bash
# Solution libre et locale (recommandée)
python src/extract.py mon_dossier_images/

# Ou via le palier gratuit de Gemini (clé en variable d'environnement, jamais dans le code)
export GEMINI_API_KEY="votre_clé"
python src/extract.py mon_dossier_images/ --backend gemini --delay 10
```

L'option `--delay` espace les requêtes pour rester dans les quotas du palier
gratuit de Gemini.

## Structure du dépôt

```
├── src/
│   ├── extract.py        # Pipeline d'extraction (backends ollama, gemini, openrouter, mistral)
│   ├── normalize.py      # Normalisation des dates extraites
│   ├── mpopp.py          # Jeu M-POPP : téléchargement, pages, références
│   ├── evalue.py         # Précision face aux transcriptions de référence
│   ├── pretraite.py      # Chaîne de prétraitement des images
│   ├── build_site.py     # Génération de site/data.js
│   └── deploy.py         # Mise en ligne du site
├── samples/              # Pages de registres d'exemple (images allégées)
├── results.json          # Les 130 actes extraits (+ date_iso, annee)
├── site/                 # Le site : demo.html, banc.html, index.html, mentions.html
│   ├── banc/             # Pages annotées M-POPP (brutes et prétraitées)
│   └── api/              # Services PHP 8 : lire.php, pretraite.php, releve.php
└── requirements.txt
```

Les archives d'images complètes (~200 Mo) ne sont pas versionnées ; seules
quelques pages d'exemple sont conservées dans `samples/`.

## Limites connues

- L'écriture manuscrite de certains officiers d'état civil reste difficile :
  quelques champs sont `null` ou approximatifs, et certaines années lues sont
  manifestement erronées (elles sont signalées dans l'explorateur).
- Le mode Navigateur est expérimental : le modèle 2B lit les manuscrits
  moins bien que le 7B d'Ollama, et WebGPU est nécessaire.

## Contact

Abdellah Hassani : abdellah.hassani2002@gmail.com
