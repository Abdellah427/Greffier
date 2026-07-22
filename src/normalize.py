#!/usr/bin/env python3
"""Normalisation des dates extraites des actes de mariage.

Le modèle restitue les dates telles qu'écrites dans les registres :
"quatre février 1913", "04/02/1913", "1920-01-03", "trois janvier mil neuf
cent vingt"... Ce script ajoute à chaque acte deux champs calculés :

  - date_iso : la date au format YYYY-MM-DD quand elle est entièrement lisible
  - annee    : l'année seule (entier), plus souvent récupérable

Les champs d'origine ne sont jamais modifiés.

Usage :
    python src/normalize.py results.json
"""

import argparse
import datetime
import json
import re
import unicodedata

MOIS = {
    "janvier": 1, "fevrier": 2, "mars": 3, "avril": 4, "mai": 5, "juin": 6,
    "juillet": 7, "aout": 8, "septembre": 9, "octobre": 10, "novembre": 11,
    "decembre": 12,
}

# Nombres en toutes lettres (0-99), tels qu'on les trouve dans les actes.
UNITES = {
    "premier": 1, "un": 1, "deux": 2, "trois": 3, "quatre": 4, "cinq": 5,
    "six": 6, "sept": 7, "huit": 8, "neuf": 9, "dix": 10, "onze": 11,
    "douze": 12, "treize": 13, "quatorze": 14, "quinze": 15, "seize": 16,
}
DIZAINES = {"vingt": 20, "trente": 30, "quarante": 40, "cinquante": 50,
            "soixante": 60, "quatre-vingt": 80, "quatre-vingts": 80}


def _sans_accents(texte):
    return "".join(c for c in unicodedata.normalize("NFD", texte)
                   if unicodedata.category(c) != "Mn").lower()


def _mots_vers_nombre(mots):
    """Convertit une suite de mots français en nombre (0-99). None si échec."""
    total = 0
    for mot in mots:
        if mot in ("et",):
            continue
        if mot in UNITES:
            total += UNITES[mot]
        elif mot in DIZAINES:
            total += DIZAINES[mot]
        elif mot == "dix-sept":
            total += 17
        elif mot == "dix-huit":
            total += 18
        elif mot == "dix-neuf":
            total += 19
        else:
            return None
    return total or None


def _annee_en_lettres(texte):
    """Repère "mil(le) neuf cent(s) [vingt(-)...]" et renvoie l'année."""
    match = re.search(r"\bmil(?:le)?\s+neuf\s+cents?\b\s*((?:[a-z-]+\s*){0,4})", texte)
    if not match:
        return None
    reste = [m for m in re.split(r"[\s-]+", match.group(1).strip()) if m]
    if not reste:
        return 1900
    complement = _mots_vers_nombre(reste)
    return 1900 + complement if complement else 1900


def _iso_valide(annee, mois, jour):
    """Formate YYYY-MM-DD si le triplet est une date calendaire réelle, sinon None."""
    try:
        datetime.date(annee, mois, jour)
    except ValueError:
        return None
    return f"{annee:04d}-{mois:02d}-{jour:02d}"


def parse_date(brut):
    """Renvoie (date_iso, annee) à partir de la date brute extraite."""
    if not brut:
        return None, None
    texte = _sans_accents(str(brut))

    # Formats numériques : 1920-01-03 ou 04/02/1913
    match = re.search(r"\b(\d{4})-(\d{2})-(\d{2})\b", texte)
    if match:
        annee, mois, jour = map(int, match.groups())
        return _iso_valide(annee, mois, jour), annee
    match = re.search(r"\b(\d{1,2})/(\d{1,2})/(\d{4})\b", texte)
    if match:
        jour, mois, annee = map(int, match.groups())
        return _iso_valide(annee, mois, jour), annee

    # Année : en chiffres, sinon en toutes lettres
    match = re.search(r"\b(1[89]\d{2})\b", texte)
    annee = int(match.group(1)) if match else _annee_en_lettres(texte)

    # Jour + mois : "4 fevrier", "1er fevrier" ou "quatre fevrier"
    jour = mois = None
    for nom, numero in MOIS.items():
        match = re.search(r"([a-z\d][a-z\d\s-]*?)\s+" + nom + r"\b", texte)
        if match:
            mois = numero
            devant = re.split(r"[\s-]+", match.group(1).strip())[-3:]
            chiffre = re.fullmatch(r"(\d{1,2})(?:er)?", devant[-1])
            if chiffre:
                jour = int(chiffre.group(1))
            else:
                jour = _mots_vers_nombre(devant)
            break

    if annee and mois and jour:
        return _iso_valide(annee, mois, jour), annee
    return None, annee


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("fichier", help="Fichier JSON des actes (modifié en place)")
    args = parser.parse_args()

    with open(args.fichier, encoding="utf-8") as f:
        actes = json.load(f)

    completes = annees = 0
    for acte in actes:
        date_iso, annee = parse_date(acte.get("date_mariage"))
        acte["date_iso"] = date_iso
        acte["annee"] = annee
        completes += bool(date_iso)
        annees += bool(annee)

    with open(args.fichier, "w", encoding="utf-8") as f:
        json.dump(actes, f, ensure_ascii=False, indent=4)

    print(f"{len(actes)} actes : {completes} dates complètes, "
          f"{annees} années identifiées -> {args.fichier}")


if __name__ == "__main__":
    main()
