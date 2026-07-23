---
license: apache-2.0
language:
- fr
- es
library_name: transformers
pipeline_tag: image-text-to-text
tags:
- htr
- handwritten-text-recognition
- information-extraction
- etat-civil
- historical-documents
- greffier
datasets:
- Abdellah427/greffier-actes-harmonise
metrics:
- cer
- wer
- f1
base_model:
- Qwen/Qwen2-VL-2B-Instruct
---

# Greffier, le modele

> Statut : en cours. Le modele n'est pas encore entraine, donc aucun poids ni
> aucun score n'est publie pour l'instant. Cette carte decrit le projet et sera
> completee quand l'entrainement et l'evaluation auront tourne.

Modele specialise dans la lecture et l'extraction d'informations des actes
d'etat civil manuscrits, France et Espagne. Il prend une photographie d'acte et
en produit la transcription puis douze informations structurees (les epoux,
leurs parents, metiers, la date, le lieu).

Projet complet, code et methode : https://github.com/Abdellah427/Greffier ·
Page du projet : https://abdellah-hassani.fr/greffier/modele.html

## L'idee

Un modele **maison, leger, beaucoup entraine grace a un generateur de donnees
synthetiques**, qui vise a egaler ou depasser un gros modele generaliste sur ces
actes precis, tout en etant nettement plus leger et rapide. Le tout mesure
honnetement, memes donnees de test et memes metriques pour tous les modeles
compares.

## Usage prevu et limites

- **Fait pour** : les actes de mariage manuscrits du domaine (M-POPP, Paris et
  banlieue, 1880 a 1940), et par extension des actes proches.
- **Pas fait pour** : n'importe quel manuscrit. Le domaine est borne.
- **Espagne** : couverte par des actes synthetiques, non evaluee sur du reel
  faute de jeu annote accessible. A prendre comme une extension, pas comme une
  performance mesuree.

## Comment l'utiliser (des que les poids seront publies)

```python
from transformers import AutoProcessor, AutoModelForVision2Seq
from PIL import Image

processor = AutoProcessor.from_pretrained("Abdellah427/greffier-actes")
model = AutoModelForVision2Seq.from_pretrained("Abdellah427/greffier-actes")

image = Image.open("acte.jpg")
# ... voir le notebook du depot pour l'inference complete et le decodage des entites
```

Tant que le depot ne contient pas de poids, cet extrait est donne a titre
indicatif. Le code d'inference et de decodage des entites vit dans le depot
GitHub.

## Donnees d'entrainement

- **Reel** : [Abdellah427/greffier-actes-harmonise](https://huggingface.co/datasets/Abdellah427/greffier-actes-harmonise),
  version harmonisee de **M-POPP** (projet EXO-POPP, INSA Rouen, CC-BY 4.0),
  314 pages, decoupage par page 250 / 32 / 32.
- **Synthetique** : actes generes a la volee (francais et espagnol) pour
  l'entrainement a grande echelle. Generateur dans le depot.

## Procedure d'entrainement (prevue)

Modele de base : un petit modele vision-langage (candidats
`Qwen/Qwen2-VL-2B-Instruct` ou `microsoft/Florence-2-base`). Pre-entrainement sur
les actes synthetiques, puis affinage sur les vrais actes M-POPP. Hyperparametres
publies ici une fois l'entrainement lance. La licence suivra celle du modele de
base retenu.

## Evaluation

A venir. Aucun score n'est publie tant que l'evaluation n'a pas tourne.

Protocole prevu : meme jeu de test que le generaliste (32 pages de M-POPP,
jamais vues a l'entrainement), separation par page, memes metriques pour tous
(CER et WER pour la lecture, precision, rappel et F1 par information pour
l'extraction). Jeu de test petit, donc scores a lire avec prudence, intervalle
de confiance large. Les echecs seront montres, pas seulement les reussites.

Les memes chiffres, une fois disponibles, figureront a l'identique ici, dans le
README du depot et sur la page du site.

## Credit

Donnees reelles derivees de M-POPP (projet EXO-POPP, INSA Rouen), CC-BY 4.0 :

> Tarride, Boillet, Kermorvant et al. « End-to-end information extraction in
> handwritten documents: Understanding Paris marriage records from 1880 to 1940 »,
> ICDAR 2024. https://zenodo.org/records/10980636

Ce projet s'appuie sur la tache et le jeu de ces equipes de recherche. Il ne
s'attribue pas leur travail : il mene un projet applique de bout en bout.

## Liens

- Code et methode : https://github.com/Abdellah427/Greffier
- Jeu de donnees : https://huggingface.co/datasets/Abdellah427/greffier-actes-harmonise
- Page du projet : https://abdellah-hassani.fr/greffier/modele.html
