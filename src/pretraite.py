#!/usr/bin/env python3
"""Chaîne de prétraitement d'images de registres d'état civil.

Cinq étapes composables, conçues pour les défauts récurrents des
numérisations d'archives (bords noirs, pages penchées, papier jauni,
encre pâlie, flou de numérisation) :

  recadre    supprime les bords sombres autour de la page
  redresse   corrige l'inclinaison de la page (au dixième de degré)
  fond       aplanit le fond (correction par division : jaunissement,
             ombres de reliure) et fait ressortir l'encre
  contraste  étire l'histogramme en écartant les valeurs extrêmes
  nettete    accentue les traits (masque flou)

Chaque étape s'active ou non : on peut ainsi mesurer l'apport de
chacune avec src/evalue.py (étude d'ablation).

Usage :
    python src/pretraite.py pages/ -o pages_pretraitees/
    python src/pretraite.py pages/ -o sortie/ --etapes recadre,fond
    python src/pretraite.py pages/ -o sortie/ --apercu avant_apres.png
"""

import argparse
import sys
from pathlib import Path

try:
    import numpy as np
    from PIL import Image, ImageFilter, ImageOps
except ImportError:
    sys.exit("Ce module demande Pillow et numpy : pip install pillow numpy")

ETAPES_DISPONIBLES = ["recadre", "redresse", "fond", "contraste", "nettete"]


def etape_recadre(image):
    """Rogne les bords sombres (fond du scanner, tranche du livre)."""
    gris = np.asarray(image.convert("L"), dtype=np.float32)
    # Seuil entre le fond sombre et le papier clair : à mi-chemin entre
    # les pixels les plus sombres et les plus clairs de l'image.
    sombre = np.percentile(gris, 5)
    clair = np.percentile(gris, 95)
    if clair - sombre < 40:
        return image                      # image plate : rien à rogner
    seuil = (sombre + clair) / 2
    masque = gris > seuil
    lignes = np.where(masque.mean(axis=1) > 0.35)[0]
    colonnes = np.where(masque.mean(axis=0) > 0.35)[0]
    if not len(lignes) or not len(colonnes):
        return image
    marge = int(0.01 * max(image.size))
    haut = max(0, lignes[0] - marge)
    bas = min(image.height, lignes[-1] + marge)
    gauche = max(0, colonnes[0] - marge)
    droite = min(image.width, colonnes[-1] + marge)
    if (bas - haut) < image.height * 0.5 or (droite - gauche) < image.width * 0.3:
        return image                      # détection improbable : prudence
    return image.crop((gauche, haut, droite, bas))


def etape_redresse(image):
    """Redresse la page en maximisant le contraste du profil des lignes.

    Quand les lignes d'écriture sont horizontales, la projection
    horizontale de l'encre alterne fortement entre lignes et interlignes :
    on cherche l'angle (à ±3 degrés) qui maximise cette alternance.
    """
    petit = image.convert("L").resize(
        (600, max(1, int(600 * image.height / image.width))))
    encre = 255 - np.asarray(petit, dtype=np.float32)
    encre -= encre.mean()

    def score(angle):
        tourne = Image.fromarray(encre).rotate(angle, expand=False,
                                               fillcolor=0)
        profil = np.asarray(tourne, dtype=np.float32).sum(axis=1)
        return profil.var()

    angles = np.arange(-3.0, 3.01, 0.1)
    meilleur = max(angles, key=score)
    if abs(meilleur) < 0.15:
        return image
    fond = int(np.percentile(np.asarray(image.convert("L")), 60))
    return image.rotate(meilleur, expand=False, fillcolor=(fond,) * 3,
                        resample=Image.BICUBIC)


def etape_fond(image):
    """Correction de fond par division : le papier redevient uniforme."""
    gris = np.asarray(image.convert("L"), dtype=np.float32) + 1.0
    rayon = max(image.size) // 40
    flou = Image.fromarray(gris.astype(np.uint8)).filter(
        ImageFilter.GaussianBlur(rayon))
    fond = np.asarray(flou, dtype=np.float32) + 1.0
    plat = gris / fond
    plat = np.clip(plat / np.percentile(plat, 90) * 255.0, 0, 255)
    return Image.fromarray(plat.astype(np.uint8)).convert("RGB")


def etape_contraste(image):
    """Étire l'histogramme en écartant 1 % de valeurs extrêmes."""
    return ImageOps.autocontrast(image, cutoff=1)


def etape_nettete(image):
    """Accentue les traits d'encre (masque flou doux)."""
    return image.filter(ImageFilter.UnsharpMask(radius=2, percent=120,
                                                threshold=2))


ETAPES = {
    "recadre": etape_recadre,
    "redresse": etape_redresse,
    "fond": etape_fond,
    "contraste": etape_contraste,
    "nettete": etape_nettete,
}


def pretraite(image, etapes):
    for nom in etapes:
        image = ETAPES[nom](image)
    return image


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("dossier", help="Dossier d'images à prétraiter")
    parser.add_argument("-o", "--sortie", required=True,
                        help="Dossier des images prétraitées")
    parser.add_argument("--etapes", default=",".join(ETAPES_DISPONIBLES),
                        help="Étapes à appliquer, dans l'ordre, séparées par "
                             f"des virgules (défaut : toutes ; choix : "
                             f"{', '.join(ETAPES_DISPONIBLES)})")
    parser.add_argument("--apercu", metavar="FICHIER",
                        help="écrit un avant/après de la première image")
    args = parser.parse_args()

    etapes = [e.strip() for e in args.etapes.split(",") if e.strip()]
    inconnues = [e for e in etapes if e not in ETAPES]
    if inconnues:
        sys.exit(f"Étapes inconnues : {', '.join(inconnues)}")

    dossier = Path(args.dossier)
    sortie = Path(args.sortie)
    sortie.mkdir(parents=True, exist_ok=True)
    images = sorted(p for p in dossier.iterdir()
                    if p.suffix.lower() in (".jpg", ".jpeg", ".png"))
    if not images:
        sys.exit(f"Aucune image dans {dossier}")

    print(f"Étapes : {' -> '.join(etapes)}")
    for i, chemin in enumerate(images, 1):
        cible = sortie / (chemin.stem + ".jpg")
        if cible.exists():
            continue
        image = Image.open(chemin).convert("RGB")
        resultat = pretraite(image, etapes)
        resultat.save(cible, quality=88, optimize=True)
        if args.apercu and i == 1:
            avant = image.resize(
                (700, max(1, int(700 * image.height / image.width))))
            apres = resultat.resize(
                (700, max(1, int(700 * resultat.height / resultat.width))))
            planche = Image.new("RGB",
                                (1410, max(avant.height, apres.height)),
                                "white")
            planche.paste(avant, (0, 0))
            planche.paste(apres, (710, 0))
            planche.save(args.apercu)
        if i % 20 == 0 or i == len(images):
            print(f"  {i}/{len(images)}")
    print(f"Images prétraitées -> {sortie}/")


if __name__ == "__main__":
    main()
