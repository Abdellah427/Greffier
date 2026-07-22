#!/usr/bin/env python3
"""Prépare le jeu de données M-POPP (actes de mariage parisiens, 1880-1940).

M-POPP est un jeu de recherche publié sous licence CC-BY 4.0 : plus de 300
pages manuscrites de registres de mariage de Paris et sa banlieue, avec la
transcription de référence de chaque acte, mot à mot, annotée par des
chercheurs (projet EXO-POPP, https://zenodo.org/records/10980636).

Ce script en tire deux choses :
  - un dossier d'images prêtes pour le pipeline d'extraction
    (python src/extract.py pages_mpopp/ --ajouter) ;
  - un fichier d'actes de référence, issus des transcriptions humaines,
    qui sert d'étalon pour mesurer la précision du pipeline
    (python src/evalue.py resultats.json reference_mpopp.json).

Usage :
    python src/mpopp.py --pages pages_mpopp/ --reference reference_mpopp.json

Le téléchargement (≈ 1 Go, une seule fois) reprend là où il s'était arrêté
en cas de coupure. Les données brutes restent dans mpopp_data/, ignoré par git.
"""

import argparse
import json
import re
import sys
import unicodedata
import zipfile
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
CACHE = RACINE / "mpopp_data"
ZIP = CACHE / "m-popp_datasets.zip"
URL = "https://zenodo.org/records/10980636/files/m-popp_datasets.zip?download=1"

# Balises emoji de l'encodage 1 : chaque mot annoté est précédé des emojis
# décrivant le champ (💬 prénom, 🗨 nom, 🔧 profession...) et la personne
# (📖 l'acte lui-même, 👨 l'époux, 👰 l'épouse, 👴 père, 👵 mère).
PERSONNES = {"👨": "marie", "👰": "mariee"}
SOUS_ADRESSE = {"🛣", "🔠", "🔟", "🌇", "🗺"}


def _champ_du_tag(tag):
    """Traduit un jeu d'emojis en nom de champ de notre schéma, ou None."""
    if "📖" in tag:
        if "🌞" in tag: return "_jour"
        if "📅" in tag: return "_mois"
        if "🗓" in tag: return "_annee"
        if "🌇" in tag: return "lieu_mariage"
        return None
    for emoji, role in PERSONNES.items():
        if emoji not in tag:
            continue
        if "🏥" in tag or "🥸" in tag:      # lieu de naissance, témoins : hors schéma
            return None
        if "👴" in tag or "👵" in tag:      # parents
            if "🏠" in tag:
                return None                  # adresse des parents : hors schéma
            parent = "pere" if "👴" in tag and "👵" not in tag else \
                     "mere" if "👵" in tag and "👴" not in tag else "les_deux"
            if "💬" in tag or "🗨" in tag:
                return None if parent == "les_deux" else f"nom_{parent}_{role}"
            if "🔧" in tag:
                return f"profession_{parent}_{role}"
            return None
        if "🏠" in tag and tag & SOUS_ADRESSE:
            return f"adresse_{role}"
        if "💬" in tag or "🗨" in tag:
            return f"nom_prenom_{role}"
        if "🔧" in tag:
            return f"profession_{role}"
        return None
    return None


def _tokenise(texte):
    """Découpe le texte annoté en couples (tag emoji, mot)."""
    for brut in texte.split():
        mot = brut.replace("️", "")
        tag = set()
        while mot and ord(mot[0]) > 0x2100:
            tag.add(mot[0])
            mot = mot[1:]
        mot = mot.strip(",;./()")
        if mot:
            yield frozenset(tag), mot


def _acte_depuis_corps(corps):
    """Convertit le corps annoté d'un acte en dictionnaire de champs.

    Un acte répète souvent les noms (comparution, consentement, signature) :
    chaque champ ne retient que sa première mention. L'adresse est découpée
    par sous-partie (voie, numéro, commune...) pour la même raison.
    """
    seaux = {}
    clos = set()
    precedent = None
    for tag, mot in _tokenise(corps):
        champ = _champ_du_tag(tag)
        cle = champ
        if champ and champ.startswith("adresse_"):
            sous = tag & SOUS_ADRESSE
            cle = champ + next(iter(sous), "")
        if cle != precedent and cle in seaux:
            clos.add(cle)
        if cle and cle not in clos:
            seaux.setdefault(cle, []).append(mot)
        precedent = cle

    def texte(champ):
        cles = [c for c in seaux if c == champ or
                (champ.startswith("adresse_") and c.startswith(champ))]
        mots = [m for c in cles for m in seaux[c]]
        return " ".join(mots) if mots else None

    date = " ".join(filter(None, (texte("_jour"), texte("_mois"), texte("_annee"))))
    acte = {"date_mariage": date or None, "lieu_mariage": texte("lieu_mariage")}
    for role in ("marie", "mariee"):
        acte[f"nom_prenom_{role}"] = texte(f"nom_prenom_{role}")
        acte[f"profession_{role}"] = texte(f"profession_{role}")
        acte[f"adresse_{role}"] = texte(f"adresse_{role}")
        for parent in ("pere", "mere"):
            acte[f"nom_{parent}_{role}"] = texte(f"nom_{parent}_{role}")
            acte[f"profession_{parent}_{role}"] = texte(f"profession_{parent}_{role}")
    return acte


def telecharger():
    """Récupère l'archive Zenodo, avec reprise si le fichier est incomplet."""
    import requests

    CACHE.mkdir(exist_ok=True)
    if ZIP.exists() and zipfile.is_zipfile(ZIP):
        return
    for tentative in range(10):
        deja = ZIP.stat().st_size if ZIP.exists() else 0
        entetes = {"Range": f"bytes={deja}-"} if deja else {}
        print(f"Téléchargement de M-POPP (≈ 1 Go), repris à {deja // 1_000_000} Mo...")
        with requests.get(URL, headers=entetes, stream=True, timeout=60) as reponse:
            if reponse.status_code not in (200, 206):
                sys.exit(f"Téléchargement refusé ({reponse.status_code}).")
            mode = "ab" if reponse.status_code == 206 else "wb"
            with open(ZIP, mode) as sortie:
                try:
                    for morceau in reponse.iter_content(1 << 20):
                        sortie.write(morceau)
                except Exception as incident:
                    print(f"Coupure ({incident}), reprise...")
                    continue
        if zipfile.is_zipfile(ZIP):
            return
    sys.exit("Impossible de télécharger une archive complète.")


def charge_annotations():
    telecharger()
    with zipfile.ZipFile(ZIP) as archive:
        with archive.open(
            "m-popp_datasets/handwritten/labels/labels-handwritten-encoding-1.json"
        ) as flux:
            return json.load(flux)["ground_truth"]


def construit_reference(sortie):
    annotations = charge_annotations()
    actes = []
    for pages in annotations.values():
        for nom_page, page in pages.items():
            texte_page = page["text"]
            position = 0
            while True:
                debut = texte_page.find("ⓑ", position)
                if debut == -1:
                    break
                fin = texte_page.find("Ⓑ", debut)
                if fin == -1:
                    break               # acte à cheval sur la page suivante : ignoré
                acte = _acte_depuis_corps(texte_page[debut + 1:fin])
                if acte["nom_prenom_marie"] or acte["nom_prenom_mariee"]:
                    acte["_source_image"] = Path(nom_page).stem + ".jpg"
                    actes.append(acte)
                position = fin + 1
    Path(sortie).write_text(json.dumps(actes, ensure_ascii=False, indent=4),
                            encoding="utf-8")
    print(f"{len(actes)} actes de référence -> {sortie}")


def prepare_pages(dossier):
    try:
        from PIL import Image
    except ImportError:
        sys.exit("La préparation des images demande Pillow : pip install pillow")

    telecharger()
    dossier = Path(dossier)
    dossier.mkdir(exist_ok=True)
    with zipfile.ZipFile(ZIP) as archive:
        pages = [n for n in archive.namelist()
                 if "/handwritten/images/" in n and n.endswith(".png")]
        for i, nom in enumerate(pages, 1):
            cible = dossier / (Path(nom).stem + ".jpg")
            if cible.exists():
                continue
            with archive.open(nom) as flux:
                image = Image.open(flux).convert("RGB")
                image.thumbnail((1600, 1600))
                image.save(cible, quality=85, optimize=True)
            if i % 25 == 0 or i == len(pages):
                print(f"  {i}/{len(pages)} pages préparées")
    print(f"Pages prêtes dans {dossier}/ "
          f"(ensuite : python src/extract.py {dossier}/ --ajouter)")


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--pages", metavar="DOSSIER",
                        help="prépare les images des registres dans ce dossier")
    parser.add_argument("--reference", metavar="FICHIER",
                        help="écrit les actes de référence (transcriptions humaines)")
    args = parser.parse_args()
    if not args.pages and not args.reference:
        parser.error("indiquez --pages et/ou --reference")
    if args.reference:
        construit_reference(args.reference)
    if args.pages:
        prepare_pages(args.pages)


if __name__ == "__main__":
    main()
