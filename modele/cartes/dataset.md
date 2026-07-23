---
license: cc-by-4.0
language:
- fr
task_categories:
- image-to-text
tags:
- htr
- handwritten-text-recognition
- information-extraction
- etat-civil
- historical-documents
- greffier
pretty_name: Greffier, actes harmonises
size_categories:
- n<1K
---

# Greffier, actes harmonises

Version harmonisee d'actes d'etat civil manuscrits pour la lecture (reconnaissance
de texte) et l'extraction d'informations. Chaque page est ramenee a un format
unique, commun a toutes les sources du projet, pour entrainer et evaluer un
modele specialise.

Ce jeu fait partie du projet **Greffier**. Code et methode :
https://github.com/Abdellah427/Greffier · Page du projet :
https://abdellah-hassani.fr/greffier/modele.html

## Provenance et credit

Ce jeu est **derive de M-POPP**, produit par le projet **EXO-POPP** (INSA Rouen),
sous licence CC-BY 4.0. Il ne s'agit pas de donnees originales : les images et les
transcriptions viennent de M-POPP, seule leur mise en forme change (harmonisation
vers un schema commun d'entites). Merci de citer la source d'origine :

> Tarride, Boillet, Kermorvant et al. « End-to-end information extraction in
> handwritten documents: Understanding Paris marriage records from 1880 to 1940 »,
> ICDAR 2024. Jeu M-POPP : https://zenodo.org/records/10980636

## Contenu

- **Origine** : M-POPP, actes de mariage parisiens manuscrits, 1880 a 1940.
- **Langue** : francais.
- **Taille** : 314 pages annotees.
- **Decoupage** (fourni par la source, separation par page, aucune fuite) :
  250 train · 32 validation · 32 test.

Chaque exemple est un enregistrement au format commun :

| Champ | Type | Description |
|---|---|---|
| `source` | texte | jeu d'origine, ici `m-popp` |
| `langue` | texte | `fr` |
| `split` | texte | `train`, `validation` ou `test` |
| `image` | image | la page manuscrite |
| `texte` | texte | la transcription brute, reference pour le CER et le WER |
| `entites` | liste de `[type, valeur]` | les informations extraites, schema ci-dessous |

## Les douze informations extraites

`date`, `lieu`, `epoux_prenom`, `epoux_nom`, `epoux_metier`, `epouse_prenom`,
`epouse_nom`, `epouse_metier`, `pere_epoux`, `mere_epoux`, `pere_epouse`,
`mere_epouse`.

Dans M-POPP, ces informations sont encodees par des symboles places apres chaque
mot. Un module maison (`extrait_entites_mpopp` dans le depot) les traduit vers ce
schema commun.

## Comment il est construit

Le notebook `02_donnees_harmonisees.ipynb` du depot lit M-POPP, produit un
enregistrement par page via `construit_record`, verifie l'absence de fuite entre
les decoupages, puis publie le tout ici. Tout est reproductible.

## Limites et honnetete

- Petit jeu : 314 pages, dont 32 seulement pour le test. Les scores mesures
  dessus seront a lire avec prudence.
- Francais uniquement pour l'instant. La couverture espagnole du projet passera
  par des actes synthetiques, ajoutes plus tard, jamais melanges en douce avec le
  reel.
- Domaine borne : actes de mariage d'une periode et de regions donnees, pas
  n'importe quel manuscrit.

## Liens

- Code et methode : https://github.com/Abdellah427/Greffier
- Modele entraine dessus : https://huggingface.co/Abdellah427/greffier-actes
- Page du projet : https://abdellah-hassani.fr/greffier/modele.html
