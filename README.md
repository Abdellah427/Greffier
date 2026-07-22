# IA-Application — Extraction d'actes de mariage manuscrits par IA

Extraction automatique de données structurées à partir de **registres d'actes de
mariage parisiens manuscrits de 1913 et 1920** (Archives de Paris, cote AD075EC),
grâce à un modèle d'IA multimodal (vision + langage).

À partir d'une photographie d'une page de registre, le pipeline transcrit
l'écriture manuscrite et en extrait 16 champs structurés : date et lieu du
mariage, noms, professions et adresses des époux ainsi que de leurs parents.
**130 actes** ont été extraits ([`results.json`](results.json)).

Le projet ne coûte rien à faire tourner ni à héberger, et repose sur des
modèles libres : voir [« Deux backends, zéro coût »](#deux-backends-zéro-coût).

## Le site de démonstration

Le dossier [`site/`](site/) est un site **100 % statique** — il se déploie en
copiant simplement le dossier sur n'importe quel hébergement web, sans backend.

- **`demo.html` — la machine lit le registre, en direct.** On dépose la
  photographie d'une page (ou on choisit un feuillet d'exemple) et on regarde
  le modèle la transcrire en streaming, pendant que la fiche de mariage
  s'écrit champ par champ. Trois modes, aucun ne demande de clé ni de compte :
  - **Replay** : rejoue une extraction réelle enregistrée — fonctionne
    instantanément pour n'importe quel visiteur ;
  - **Navigateur (WebGPU)** : un modèle vision ouvert (Qwen2-VL 2B, ≈ 1,2 Go
    téléchargés une fois puis mis en cache) tourne *dans* le navigateur du
    visiteur — rien ne quitte sa machine ;
  - **Ollama local** : la page dialogue avec l'Ollama du visiteur
    (`qwen2.5vl:7b`) — la meilleure qualité de lecture, entièrement locale
    et libre. Une seule préparation :
    `ollama pull qwen2.5vl:7b` puis `OLLAMA_ORIGINS="*" ollama serve`.
- **`index.html` — l'explorateur.** Les 130 actes extraits, avec recherche
  plein texte insensible aux accents et filtres par champ et par année.

Pour l'essayer en local : `python -m http.server -d site` puis ouvrir
http://localhost:8000/demo.html (les modes réels ont besoin d'être servis en
HTTP, pas en `file://`).

## Le pipeline d'extraction

```
Images de registres ──► Modèle vision-langage ──► JSON structuré ──► results.json ──► site/
       (JPG)              (transcription +           (16 champs        + normalisation
                            extraction)               par acte)          des dates
```

| Script | Rôle |
|---|---|
| [`src/extract.py`](src/extract.py) | Parcourt un dossier d'images, interroge le modèle, agrège le JSON |
| [`src/normalize.py`](src/normalize.py) | Ajoute `date_iso` et `annee` aux actes (dates manuscrites → ISO) |
| [`src/build_site.py`](src/build_site.py) | Régénère `site/data.js` à partir de `results.json` |

```bash
pip install -r requirements.txt
python src/extract.py mon_dossier_images/ -o results.json
python src/normalize.py results.json
python src/build_site.py
```

## Deux backends, zéro coût

| Backend | Coût | Libre ? | Prérequis |
|---|---|---|---|
| **`ollama`** (défaut) | 0 € | oui, modèle open-weights, exécution 100 % locale | [Ollama](https://ollama.com) + `ollama pull qwen2.5vl:7b` (~6 Go, GPU ou CPU) |
| `gemini` | 0 € (palier gratuit) | non, API propriétaire | Clé gratuite sur [AI Studio](https://aistudio.google.com/apikey), quotas limités |

```bash
# Solution libre et locale (recommandée)
python src/extract.py mon_dossier_images/

# Ou via le palier gratuit de Gemini (clé en variable d'environnement, jamais dans le code)
export GEMINI_API_KEY="votre_clé"
python src/extract.py mon_dossier_images/ --backend gemini --delay 10
```

L'option `--delay` espace les requêtes pour rester dans les quotas du palier
gratuit de Gemini. Côté site, aucun backend propriétaire : le visiteur n'entre
jamais de clé.

## Structure du dépôt

```
├── src/
│   ├── extract.py        # Pipeline d'extraction (CLI, backends ollama & gemini)
│   ├── normalize.py      # Normalisation des dates extraites
│   └── build_site.py     # Génération de site/data.js
├── samples/              # Pages de registres d'exemple (images allégées)
├── results.json          # Les 130 actes extraits (+ date_iso, annee)
├── site/                 # Site statique : demo.html, index.html, data.js
├── Rapport_IA_et_Application_2.pdf   # Rapport du projet
└── requirements.txt
```

Les archives d'images complètes (~200 Mo) ne sont pas versionnées ; seules
quelques pages d'exemple sont conservées dans `samples/`.

## Limites connues

- L'écriture manuscrite de certains officiers d'état civil reste difficile :
  quelques champs sont `null` ou approximatifs, et certaines années lues sont
  manifestement erronées.
- Le mode « Navigateur » est expérimental : le modèle 2B lit les manuscrits
  moins bien que le 7B d'Ollama, et WebGPU est nécessaire.
