# IA-Application — Extraction d'actes de mariage manuscrits par IA

Extraction automatique de données structurées à partir de **registres d'actes de
mariage parisiens manuscrits de 1913 et 1920** (Archives de Paris, cote AD075EC),
grâce à un modèle d'IA multimodal (vision + langage).

À partir d'une photographie d'une page de registre, le pipeline transcrit
l'écriture manuscrite et en extrait 16 champs structurés : date et lieu du
mariage, noms, professions et adresses des époux ainsi que de leurs parents.

**130 actes** ont été extraits, disponibles dans [`results.json`](results.json)
et explorables via la page de démo statique dans [`site/`](site/).

| Entrée | Sortie |
|---|---|
| Photo d'une page manuscrite du registre (voir [`samples/`](samples/)) | JSON : `date_mariage`, `nom_prenom_marie`, `profession_mariee`, `nom_pere_marie`, … |

## Fonctionnement

```
Images de registres ──► Modèle vision-langage ──► JSON structuré ──► results.json ──► Page de démo
       (JPG)              (transcription +           (16 champs                          (site/)
                            extraction)               par acte)
```

Le script [`src/extract.py`](src/extract.py) parcourt un dossier d'images,
envoie chaque page au modèle avec un prompt d'extraction, valide le JSON
retourné et agrège le tout.

## Deux backends, zéro coût

| Backend | Coût | Libre ? | Prérequis |
|---|---|---|---|
| **`ollama`** (défaut) | 0 € | ✅ modèle open-weights, exécution 100 % locale | [Ollama](https://ollama.com) + `ollama pull qwen2.5vl:7b` (~6 Go, GPU ou CPU) |
| `gemini` | 0 € (palier gratuit) | ❌ API propriétaire | Clé gratuite sur [AI Studio](https://aistudio.google.com/apikey), quotas limités |

```bash
pip install -r requirements.txt

# Solution libre et locale (recommandée)
ollama pull qwen2.5vl:7b
python src/extract.py mon_dossier_images/ -o results.json

# Ou via le palier gratuit de Gemini (clé en variable d'environnement, jamais dans le code)
export GEMINI_API_KEY="votre_clé"
python src/extract.py mon_dossier_images/ --backend gemini --delay 10
```

L'option `--delay` espace les requêtes pour rester dans les quotas du palier
gratuit de Gemini.

## Page de démo

[`site/index.html`](site/index.html) est une page **100 % statique et
autonome** (les données y sont embarquées) : recherche plein texte avec ou sans
accents, filtrage par mariés / professions / adresses. Elle se déploie en
copiant simplement le dossier `site/` sur n'importe quel hébergement web —
aucun backend, aucune dépendance.

## Structure du dépôt

```
├── src/extract.py        # Pipeline d'extraction (CLI, backends ollama & gemini)
├── samples/              # Exemples de pages de registres (images allégées)
├── results.json          # Les 130 actes extraits
├── site/                 # Page de démo statique (à déployer telle quelle)
├── Rapport_IA_et_Application_2.pdf   # Rapport du projet
└── requirements.txt
```

Les archives d'images complètes (~200 Mo) ne sont pas versionnées ; seules
quelques pages d'exemple sont conservées dans `samples/`.

## Limites connues

- L'écriture manuscrite de certains officiers d'état civil reste difficile :
  quelques champs sont `null` ou approximatifs.
- Les dates extraites ne sont pas normalisées (`"quatre février 1913"` vs
  `"04/02/1913"`), une passe de post-traitement serait un bon prolongement.
