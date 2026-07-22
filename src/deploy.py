#!/usr/bin/env python3
"""Déploiement du site sur l'hébergement OVH par FTP.

Les identifiants sont lus dans deploy.config.json à la racine du dépôt,
un fichier ignoré par git : ils ne sont jamais versionnés. Pour démarrer,
copiez deploy.config.sample.json vers deploy.config.json et remplissez-le.

Usage :
    python src/deploy.py            # envoie site/ vers le serveur
    python src/deploy.py --liste    # montre ce qui serait envoyé, sans rien envoyer

Le config.php du serveur (clé du mode En ligne) n'est jamais touché :
il ne fait pas partie du dépôt et le script n'efface rien à distance.
"""

import argparse
import ftplib
import json
import sys
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
SITE = RACINE / "site"
CONFIG = RACINE / "deploy.config.json"


def charge_config():
    if not CONFIG.exists():
        sys.exit(
            "deploy.config.json introuvable.\n"
            "Copiez deploy.config.sample.json vers deploy.config.json "
            "et renseignez vos identifiants FTP (le fichier est ignoré par git)."
        )
    config = json.loads(CONFIG.read_text(encoding="utf-8"))
    for cle in ("hote", "identifiant", "mot_de_passe", "dossier"):
        if not config.get(cle):
            sys.exit(f"deploy.config.json : le champ '{cle}' est vide.")
    return config


def fichiers_a_envoyer():
    """Chemins relatifs de tous les fichiers de site/, dans un ordre stable."""
    return sorted(
        chemin.relative_to(SITE)
        for chemin in SITE.rglob("*")
        if chemin.is_file() and chemin.name != "config.php"
    )


def connecte(config):
    ftp = ftplib.FTP_TLS(timeout=30) if config.get("tls", True) else ftplib.FTP(timeout=30)
    ftp.connect(config["hote"], int(config.get("port", 21)))
    ftp.login(config["identifiant"], config["mot_de_passe"])
    if isinstance(ftp, ftplib.FTP_TLS):
        ftp.prot_p()
    return ftp


def prepare_dossier(ftp, dossier):
    """Se place dans le dossier cible, en créant l'arborescence au besoin."""
    for segment in dossier.strip("/").split("/"):
        try:
            ftp.cwd(segment)
        except ftplib.error_perm:
            ftp.mkd(segment)
            ftp.cwd(segment)


def envoie(ftp, relatif):
    """Envoie un fichier en créant ses sous-dossiers distants au besoin."""
    for parent in relatif.parents:
        if parent != Path("."):
            try:
                ftp.mkd(parent.as_posix())
            except ftplib.error_perm:
                pass  # existe déjà
    with open(SITE / relatif, "rb") as flux:
        ftp.storbinary(f"STOR {relatif.as_posix()}", flux)


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--liste", action="store_true",
                        help="liste les fichiers sans les envoyer")
    args = parser.parse_args()

    fichiers = fichiers_a_envoyer()
    total = sum((SITE / f).stat().st_size for f in fichiers)
    print(f"{len(fichiers)} fichiers, {total // 1024} Ko au total")

    if args.liste:
        for f in fichiers:
            print(f"  {f.as_posix()}")
        return

    config = charge_config()
    print(f"Connexion à {config['hote']}...")
    ftp = connecte(config)
    prepare_dossier(ftp, config["dossier"])

    for i, relatif in enumerate(fichiers, 1):
        print(f"[{i}/{len(fichiers)}] {relatif.as_posix()}")
        envoie(ftp, relatif)

    ftp.quit()
    print(f"\nDéploiement terminé dans {config['dossier']}")
    print("Rappel : le config.php du mode En ligne se dépose une seule fois, "
          "à la main, dans api/ sur le serveur.")


if __name__ == "__main__":
    main()
