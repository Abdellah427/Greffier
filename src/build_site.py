#!/usr/bin/env python3
"""Génère site/data.js à partir de results.json.

Le site (site/) est entièrement statique : les pages lisent les données via
ce fichier JavaScript, ce qui permet de les ouvrir aussi bien en local
(file://) que sur n'importe quel hébergement web, sans backend.

Usage :
    python src/build_site.py
"""

import json
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent

# Correspondance page d'exemple -> acte extrait, pour le mode replay
# de la démonstration (index dans results.json).
REPLAYS = [
    {
        "image": "samples/archives_ad075ec_01m1913-1_0001.jpg",
        "titre": "Registre de 1913, premier feuillet",
        "cote": "AD075EC 01M1913-1 · f. 1",
        "index": 0,
    },
    {
        "image": "samples/archives_ad075ec_01m1913-1_0002.jpg",
        "titre": "Registre de 1913, deuxième feuillet",
        "cote": "AD075EC 01M1913-1 · f. 2",
        "index": 1,
    },
    {
        "image": "samples/archives_ad075ec_01m1920-1_0001.jpg",
        "titre": "Registre de 1920, premier feuillet",
        "cote": "AD075EC 01M1920-1 · f. 1",
        "index": 59,
    },
]


def main():
    actes = json.loads((RACINE / "results.json").read_text(encoding="utf-8"))

    # Rattache chaque acte à l'image de registre dont il provient, quand
    # elle est présente dans le site : les fiches deviennent cliquables
    # dans l'explorateur, avec le manuscrit face aux informations extraites.
    for replay in REPLAYS:
        actes[replay["index"]]["image"] = replay["image"]
    for acte in actes:
        source = acte.get("_source_image")
        if source and "image" not in acte:
            for dossier in ("pages", "banc", "samples"):
                if (RACINE / "site" / dossier / source).exists():
                    acte["image"] = f"{dossier}/{source}"
                    break

    replays = []
    for replay in REPLAYS:
        entree = {k: v for k, v in actes[replay["index"]].items()
                  if k not in ("date_iso", "annee")}
        replays.append({
            "image": replay["image"],
            "titre": replay["titre"],
            "cote": replay["cote"],
            "entree": entree,
        })

    contenu = (
        "// Fichier généré par src/build_site.py, ne pas éditer à la main.\n"
        f"window.ACTES = {json.dumps(actes, ensure_ascii=False)};\n"
        f"window.REPLAYS = {json.dumps(replays, ensure_ascii=False)};\n"
    )
    sortie = RACINE / "site" / "data.js"
    sortie.write_text(contenu, encoding="utf-8")
    print(f"{len(actes)} actes, {len(replays)} replays -> {sortie}")


if __name__ == "__main__":
    main()
