# Greffier, le modèle

Sous-projet : entraîner un modèle spécialisé dans la lecture et l'extraction
d'informations des actes d'état civil manuscrits, France et Espagne. C'est la
suite logique du site : là où les fiches sont aujourd'hui produites par des
modèles généralistes, l'objectif est un modèle **maison**, plus léger, dont on
sait exactement comment il a été entraîné et ce qu'il vaut.

## L'idée en une phrase

Un modèle spécialisé, beaucoup entraîné grâce à un générateur de données
synthétiques, qui égale ou dépasse un gros modèle généraliste sur les actes,
tout en étant nettement plus léger et rapide. On le mesure honnêtement.

## Le fil conducteur

1. Un prénom illisible sur un acte de ma famille.
2. Je teste les modèles généralistes : bluffants, mais pas assez précis sur ces
   écritures.
3. Je trouve les jeux de données du domaine.
4. Je construis un générateur d'actes synthétiques pour entraîner à grande
   échelle, puis j'affine sur les vrais actes.
5. Je prouve, chiffres à l'appui, que le modèle spécialisé tient tête au
   généraliste, et je l'explique.

## Les données

Une seule source **réelle**, choisie parce qu'elle colle exactement à la tâche
(page entière, entités annotées) :

- **M-POPP** (INSA Rouen, projet EXO-POPP) : actes de mariage parisiens
  1880-1940, reconnaissance de texte et extraction d'entités. 314 pages
  manuscrites annotées (250 / 32 / 32 en train / validation / test), licence
  CC-BY 4.0. https://zenodo.org/records/10980636

Le volume vient ensuite du **générateur synthétique** (notebook 03), y compris
pour la partie espagnole de la famille. Pourquoi pas un deuxième jeu réel
espagnol : la version d'Esposalles annotée en entités (compétition IEHHR) est
derrière une inscription au CVC de Barcelone, et la version librement
accessible est au niveau ligne, sans entités. On reste donc honnête : M-POPP
pour le réel, le synthétique pour l'échelle et l'espagnol. Esposalles resterait
un jeu de validation si on obtenait l'accès.

Les entités sont harmonisées vers un jeu commun (époux, épouse, parents,
métier, lieu, date), défini dans `outils.py` et `config.json`.

## Principes d'honnêteté

- Séparation train / validation / test **par page**, jamais de fuite.
- Tous les scores annoncés viennent du **jeu de test**, jamais vu à
  l'entraînement.
- Même protocole et même métrique pour tous les modèles comparés.
- On rapporte aussi les échecs et les limites. Aucun exemple choisi pour être
  beau.
- Jeu de données petit : scores annoncés avec prudence, d'où l'intérêt du
  synthétique.
- On ne s'attribue pas le travail des équipes de recherche (DAN, DANIEL) : on
  s'appuie sur leur tâche et leur dataset, on mène le projet de bout en bout.

## Organisation technique (sans Google Drive)

Trois espaces gratuits, chacun son rôle. Rien sur le Drive personnel.

- **Google Colab** (`/content`) : le plan de travail. Grand disque temporaire,
  effacé à chaque session. On y télécharge les données et on y entraîne.
- **Hugging Face Hub** : le stockage persistant des gros artefacts, le modèle
  final et le dataset harmonisé. Gratuit, versionné, et c'est de là que le site
  servira le modèle. Les checkpoints y sont poussés en cours d'entraînement pour
  survivre à une coupure de session.
- **GitHub** (ce dépôt) : le code, la config, et les résultats (petits fichiers
  JSON et figures) qui alimenteront la page « À propos du modèle » du site.

Les données synthétiques sont **générées à la volée** pendant l'entraînement :
aucun dossier de milliers d'images à stocker.

Le token Hugging Face se met dans les secrets de Colab, jamais dans le code.

## Le contrat entre notebooks

Les notebooks ne partagent pas de mémoire : ils se passent des fichiers à des
emplacements convenus (voir `config.json`).

| Notebook | Lit | Écrit |
|---|---|---|
| 01 exploration | M-POPP | schéma d'entités confirmé |
| 02 données | M-POPP | dataset harmonisé (HF) |
| 03 synthétique | config | générateur d'actes FR + ES (code) |
| 04 entraînement | harmonisé + synthétique | modèle (HF) |
| 05 évaluation | modèle + jeu de test | résultats (`modele/resultats/`) |

## Ouvrir les notebooks

Ils vivent tous dans ce dossier `modele/`. Colab ouvre un notebook à la fois,
mais on peut les voir tous d'un coup : dans Colab, `Fichier > Ouvrir le
notebook > onglet GitHub`, entrer `Abdellah427/Greffier`, et la liste complète
s'affiche (c'est la « barre » de Jupyter). JupyterLab, lui, les ouvre en
onglets côte à côte, mais sans GPU gratuit, d'où le choix de Colab pour
l'entraînement. Liens directs (dépôt public) :

- [01 exploration M-POPP](https://colab.research.google.com/github/Abdellah427/Greffier/blob/main/modele/01_exploration_mpopp.ipynb)
- [02 données harmonisées](https://colab.research.google.com/github/Abdellah427/Greffier/blob/main/modele/02_donnees_harmonisees.ipynb)

## Fichiers

- `config.json` : la source de vérité partagée (entités cibles, chemins, dépôts).
- `outils.py` : fonctions communes (graine, CER, WER, score d'entités, lecture
  et harmonisation M-POPP). Testé avec `python modele/outils.py`.
- `requirements.txt` : dépendances des notebooks.
- `01_exploration_mpopp.ipynb` : télécharger et regarder M-POPP en vrai. Aucun
  entraînement.
- `02_donnees_harmonisees.ipynb` : construire le dataset harmonisé et le publier
  sur Hugging Face.

À venir : générateur synthétique (FR + ES), pré-entraînement, fine-tuning,
évaluation et explicabilité.

Les notebooks sont prévus pour Google Colab (GPU gratuit).
