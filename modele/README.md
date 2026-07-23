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

- **M-POPP** (INSA Rouen, projet EXO-POPP) : actes de mariage parisiens
  1880-1940, reconnaissance de texte et extraction d'entités. ~300 pages
  annotées, licence CC-BY 4.0. https://zenodo.org/records/10980636
- **Esposalles / IEHHR** : actes de mariage de Barcelone, XVIIe siècle, catalan.
  125 pages, 1221 actes.

Les deux couvrent la France et l'Espagne, les deux rives de la famille à
l'origine de ce projet. Les annotations diffèrent : elles seront harmonisées
vers un jeu commun d'entités (époux, épouse, parents, métier, lieu, date).

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

## Les notebooks

1. `01_exploration_mpopp.ipynb` : télécharger et regarder M-POPP en vrai
   (structure, exemples, format des entités, statistiques). Aucun entraînement.

À venir : exploration d'Esposalles et harmonisation des étiquettes, générateur
synthétique, pré-entraînement, fine-tuning, évaluation et explicabilité.

Les notebooks sont prévus pour Google Colab (GPU gratuit).
