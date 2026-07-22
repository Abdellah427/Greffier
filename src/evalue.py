#!/usr/bin/env python3
"""Mesure la précision du pipeline face aux transcriptions de référence.

Compare, champ par champ, les actes extraits par le modèle aux actes de
référence transcrits par des chercheurs (jeu M-POPP, voir src/mpopp.py).
Les deux fichiers sont appariés par _source_image.

Usage :
    python src/mpopp.py --reference reference_mpopp.json --pages pages_mpopp/
    python src/extract.py pages_mpopp/ -o extraction_mpopp.json
    python src/evalue.py extraction_mpopp.json reference_mpopp.json

Un champ est compté :
  - exact   si les deux valeurs normalisées (minuscules, sans accents ni
            ponctuation) sont identiques, ou toutes deux vides ;
  - proche  si l'une contient l'autre (ex. « rue Carnot 28 » face à
            « 28 rue Carnot, Paris ») ;
  - faux    sinon.
"""

import argparse
import json
import re
import unicodedata
from pathlib import Path

CHAMPS = [
    "date_mariage", "lieu_mariage",
    "nom_prenom_marie", "profession_marie", "adresse_marie",
    "nom_prenom_mariee", "profession_mariee", "adresse_mariee",
    "nom_pere_marie", "profession_pere_marie",
    "nom_mere_marie", "profession_mere_marie",
    "nom_pere_mariee", "profession_pere_mariee",
    "nom_mere_mariee", "profession_mere_mariee",
]


def normalise(valeur):
    if valeur is None:
        return ""
    texte = unicodedata.normalize("NFD", str(valeur))
    texte = "".join(c for c in texte if unicodedata.category(c) != "Mn")
    texte = re.sub(r"[^a-z0-9 ]", " ", texte.lower())
    return re.sub(r"\s+", " ", texte).strip()


def compare(extrait, reference):
    a, b = normalise(extrait), normalise(reference)
    if a == b:
        return "exact"
    if a and b and (a in b or b in a):
        return "proche"
    return "faux"


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("extraction", help="actes produits par le pipeline")
    parser.add_argument("reference", help="actes de référence (src/mpopp.py)")
    parser.add_argument("--details", action="store_true",
                        help="montre chaque champ faux avec les deux valeurs")
    args = parser.parse_args()

    extraits = {e.get("_source_image"): e
                for e in json.loads(Path(args.extraction).read_text(encoding="utf-8"))}
    references = json.loads(Path(args.reference).read_text(encoding="utf-8"))

    # Le pipeline produit un acte par image : l'évaluation se limite donc aux
    # pages qui ne contiennent qu'un seul acte de référence.
    par_image = {}
    for r in references:
        par_image.setdefault(r.get("_source_image"), []).append(r)
    multiples = sum(1 for groupe in par_image.values() if len(groupe) > 1)
    if multiples:
        print(f"{multiples} pages à plusieurs actes écartées de l'évaluation")

    communes = [(groupe[0], extraits[image])
                for image, groupe in par_image.items()
                if len(groupe) == 1 and image in extraits]
    if not communes:
        raise SystemExit("Aucune image commune entre les deux fichiers : "
                         "le pipeline a-t-il tourné sur les pages M-POPP ?")

    bilan = {champ: {"exact": 0, "proche": 0, "faux": 0} for champ in CHAMPS}
    for reference, extrait in communes:
        for champ in CHAMPS:
            verdict = compare(extrait.get(champ), reference.get(champ))
            bilan[champ][verdict] += 1
            if verdict == "faux" and args.details:
                print(f"  {reference['_source_image']} / {champ} : "
                      f"{extrait.get(champ)!r} au lieu de {reference.get(champ)!r}")

    total = len(communes)
    print(f"\n{total} actes comparés\n")
    print(f"{'champ':<26} {'exact':>7} {'proche':>7} {'faux':>6}")
    somme_exact = somme_proche = 0
    for champ, scores in bilan.items():
        somme_exact += scores["exact"]
        somme_proche += scores["proche"]
        print(f"{champ:<26} {scores['exact'] / total:>6.0%} "
              f"{scores['proche'] / total:>6.0%} {scores['faux'] / total:>5.0%}")
    n = total * len(CHAMPS)
    print(f"\nGlobal : {somme_exact / n:.0%} exact, "
          f"{(somme_exact + somme_proche) / n:.0%} exact ou proche")


if __name__ == "__main__":
    main()
