#!/usr/bin/env python3
"""Extraction automatique de données d'actes de mariage manuscrits (Paris, 1913 & 1920).

Deux backends au choix :
  - ollama (défaut) : 100 % libre et gratuit, tourne en local via Ollama
    (modèle vision open-weights, ex. qwen2.5vl:7b).
  - gemini : API Google Gemini via son palier gratuit. La clé est lue dans
    la variable d'environnement GEMINI_API_KEY, jamais écrite dans le code.

Usage :
    python src/extract.py samples/ -o results.json
    python src/extract.py Archives_1913/ --backend gemini
"""

import argparse
import base64
import json
import os
import re
import sys
import time
from pathlib import Path

import requests

FIELDS = [
    "date_mariage", "lieu_mariage",
    "nom_prenom_marie", "profession_marie", "adresse_marie",
    "nom_prenom_mariee", "profession_mariee", "adresse_mariee",
    "nom_pere_marie", "profession_pere_marie",
    "nom_mere_marie", "profession_mere_marie",
    "nom_pere_mariee", "profession_pere_mariee",
    "nom_mere_mariee", "profession_mere_mariee",
]

PROMPT = f"""Tu es un expert en paléographie et en état civil français.
Cette image est une page d'un registre d'actes de mariage parisien (début XXe siècle),
rédigée à la main. Transcris l'acte puis extrais les informations suivantes.

Réponds UNIQUEMENT avec un objet JSON (sans texte autour) contenant exactement ces clés :
{json.dumps(FIELDS, ensure_ascii=False, indent=2)}

Si une information est absente ou illisible, mets null. N'invente rien."""


def image_to_base64(path):
    return base64.b64encode(Path(path).read_bytes()).decode("utf-8")


def parse_json_response(text):
    """Extrait l'objet JSON de la réponse du modèle (tolère les balises ```json)."""
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ValueError(f"Pas de JSON dans la réponse : {text[:200]}")
    data = json.loads(match.group(0))
    return {key: data.get(key) for key in FIELDS}


def extract_ollama(image_path, model="qwen2.5vl:7b", host="http://localhost:11434"):
    response = requests.post(
        f"{host}/api/generate",
        json={
            "model": model,
            "prompt": PROMPT,
            "images": [image_to_base64(image_path)],
            "format": "json",
            "stream": False,
        },
        timeout=600,
    )
    response.raise_for_status()
    return parse_json_response(response.json()["response"])


def extract_gemini(image_path, model="gemini-3.6-flash"):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        sys.exit("Erreur : définissez la variable d'environnement GEMINI_API_KEY "
                 "(clé gratuite sur https://aistudio.google.com/apikey).")
    response = requests.post(
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
        headers={"x-goog-api-key": api_key, "Content-Type": "application/json"},
        json={
            "contents": [{
                "parts": [
                    {"text": PROMPT},
                    {"inline_data": {
                        "mime_type": "image/jpeg",
                        "data": image_to_base64(image_path),
                    }},
                ],
            }],
        },
        timeout=300,
    )
    response.raise_for_status()
    text = response.json()["candidates"][0]["content"]["parts"][0]["text"]
    return parse_json_response(text)


BACKENDS = {"ollama": extract_ollama, "gemini": extract_gemini}


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("folder", help="Dossier contenant les images à traiter")
    parser.add_argument("-o", "--output", default="results.json")
    parser.add_argument("--ajouter", action="store_true",
                        help="ajoute les actes au fichier de sortie existant au "
                             "lieu de l'écraser (les images déjà présentes, "
                             "reconnues par _source_image, sont sautées)")
    parser.add_argument("--max", type=int, metavar="N",
                        help="traite au plus N images cette session, pour garder "
                             "une marge de quota (reprendre ensuite avec --ajouter)")
    parser.add_argument("--backend", choices=BACKENDS, default="ollama")
    parser.add_argument("--model", help="Nom du modèle (défaut selon le backend)")
    parser.add_argument("--delay", type=float, default=0.0,
                        help="Pause en secondes entre deux images (utile pour "
                             "respecter les quotas du palier gratuit Gemini)")
    args = parser.parse_args()

    extract = BACKENDS[args.backend]
    kwargs = {"model": args.model} if args.model else {}

    images = sorted(
        p for p in Path(args.folder).iterdir()
        if p.suffix.lower() in (".jpg", ".jpeg", ".png")
    )
    if not images:
        sys.exit(f"Aucune image trouvée dans {args.folder}")

    results = []
    deja = 0
    if args.ajouter and Path(args.output).exists():
        results = json.loads(Path(args.output).read_text(encoding="utf-8"))
        deja_traitees = {e.get("_source_image") for e in results}
        avant = len(images)
        images = [i for i in images if i.name not in deja_traitees]
        deja = avant - len(images)
        if deja:
            print(f"{deja} images déjà traitées, ignorées")
        print(f"{len(results)} actes existants conservés")

    total_corpus = deja + len(images)
    restantes_apres = 0
    if args.max and args.max < len(images):
        restantes_apres = len(images) - args.max
        images = images[:args.max]
        print(f"Session limitée à {args.max} images "
              f"({restantes_apres} resteront à faire)")

    def barre(position):
        plein = round(20 * position / total_corpus) if total_corpus else 0
        return "#" * plein + "-" * (20 - plein)

    interrompu = False
    for i, image in enumerate(images, 1):
        print(f"[{barre(deja + i)} {deja + i}/{total_corpus}] {image.name} ... ",
              end="", flush=True)
        try:
            entry = extract(image, **kwargs)
            entry["_source_image"] = image.name
            results.append(entry)
            print("ok")
        except requests.exceptions.HTTPError as exc:
            if exc.response is not None and exc.response.status_code == 429:
                print("quota épuisé")
                interrompu = True
                break
            print(f"échec ({exc})")
        except Exception as exc:
            print(f"échec ({exc})")
        if args.delay and i < len(images):
            time.sleep(args.delay)

    Path(args.output).write_text(
        json.dumps(results, ensure_ascii=False, indent=4), encoding="utf-8"
    )
    print(f"\n{len(results)} actes au total -> {args.output}")
    if interrompu:
        print("Quota du jour épuisé : tout ce qui est fait est sauvegardé. "
              "Relancez la même commande demain avec --ajouter pour continuer "
              "là où ça s'est arrêté.")
    elif restantes_apres:
        print(f"Marge de quota préservée : {restantes_apres} images restantes. "
              "Relancez la même commande avec --ajouter pour continuer.")


if __name__ == "__main__":
    main()
