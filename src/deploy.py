#!/usr/bin/env python3
"""Déploiement du site sur l'hébergement OVH.

Les identifiants sont lus dans deploy.config.json à la racine du dépôt,
un fichier ignoré par git : ils ne sont jamais versionnés. Pour démarrer,
copiez deploy.config.sample.json vers deploy.config.json et remplissez-le.

Trois protocoles, choisis par le champ "protocole" de la configuration :
  - "sftp" (recommandé, chiffré, port 22) : nécessite `pip install paramiko`
  - "ftps" (FTP chiffré) : bibliothèque standard, retombe en FTP simple
    si le serveur ne le propose pas
  - "ftp"  (non chiffré) : bibliothèque standard

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
            "et renseignez vos identifiants (le fichier est ignoré par git)."
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
        if chemin.is_file() and chemin.name not in ("config.php", "releves.jsonl")
    )


class TransportSftp:
    def __init__(self, config):
        try:
            import paramiko
        except ImportError:
            sys.exit("Le protocole sftp demande la bibliothèque paramiko : "
                     "pip install paramiko")
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(
            config["hote"],
            port=int(config.get("port", 22)),
            username=config["identifiant"],
            password=config["mot_de_passe"],
            allow_agent=False,
            look_for_keys=False,
        )
        self.client = client
        self.sftp = client.open_sftp()

    def prepare_dossier(self, dossier):
        for segment in dossier.strip("/").split("/"):
            try:
                self.sftp.chdir(segment)
            except IOError:
                self.sftp.mkdir(segment)
                self.sftp.chdir(segment)

    def envoie(self, relatif):
        for parent in reversed(relatif.parents):
            if parent != Path("."):
                try:
                    self.sftp.mkdir(parent.as_posix())
                except IOError:
                    pass  # existe déjà
        self.sftp.put(str(SITE / relatif), relatif.as_posix())

    def ferme(self):
        self.sftp.close()
        self.client.close()


class TransportFtp:
    def __init__(self, config, chiffre):
        hote = config["hote"]
        port = int(config.get("port", 21))
        ftp = None

        if chiffre:
            try:
                ftp = ftplib.FTP_TLS(timeout=30)
                ftp.connect(hote, port)
                ftp.login(config["identifiant"], config["mot_de_passe"])
                ftp.prot_p()
            except ftplib.error_perm:
                # Certains hébergements mutualisés ne proposent pas le FTPS
                # explicite : on retombe sur du FTP simple en le signalant.
                print("Le serveur ne propose pas le FTPS, bascule en FTP simple.")
                ftp = None

        if ftp is None:
            ftp = ftplib.FTP(timeout=30)
            ftp.connect(hote, port)
            ftp.login(config["identifiant"], config["mot_de_passe"])
        self.ftp = ftp

    def prepare_dossier(self, dossier):
        for segment in dossier.strip("/").split("/"):
            try:
                self.ftp.cwd(segment)
            except ftplib.error_perm:
                self.ftp.mkd(segment)
                self.ftp.cwd(segment)

    def envoie(self, relatif):
        for parent in reversed(relatif.parents):
            if parent != Path("."):
                try:
                    self.ftp.mkd(parent.as_posix())
                except ftplib.error_perm:
                    pass  # existe déjà
        with open(SITE / relatif, "rb") as flux:
            self.ftp.storbinary(f"STOR {relatif.as_posix()}", flux)

    def ferme(self):
        self.ftp.quit()


def connecte(config):
    protocole = config.get("protocole")
    if protocole is None:
        # Anciennes configurations : le champ "tls" pilotait le choix.
        protocole = "ftps" if config.get("tls", True) else "ftp"
    if protocole == "sftp":
        return TransportSftp(config)
    if protocole in ("ftps", "ftp"):
        return TransportFtp(config, chiffre=protocole == "ftps")
    sys.exit(f"Protocole inconnu : {protocole} (attendu : sftp, ftps ou ftp)")


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
    transport = connecte(config)
    transport.prepare_dossier(config["dossier"])

    for i, relatif in enumerate(fichiers, 1):
        print(f"[{i}/{len(fichiers)}] {relatif.as_posix()}")
        transport.envoie(relatif)

    transport.ferme()
    print(f"\nDéploiement terminé dans {config['dossier']}")
    print("Rappel : le config.php du mode En ligne se dépose une seule fois, "
          "à la main, dans api/ sur le serveur.")


if __name__ == "__main__":
    main()
