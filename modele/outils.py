"""Outils communs aux notebooks du projet modele (Greffier).

Ce module rassemble les fonctions partagees pour ne pas les recopier :
reproductibilite, metriques de reconnaissance (CER, WER), extraction et
evaluation des entites. Chaque notebook Colab clone le depot et fait
    from modele.outils import cer, wer, score_entites, charge_config, fixe_graine

Volontairement sans dependance lourde : les metriques sont implementees en
Python pur (distance de Levenshtein) pour rester testables partout.
"""

from __future__ import annotations
import json
import random
import unicodedata
from pathlib import Path


# --------------------------------------------------------------------------
# Reproductibilite
# --------------------------------------------------------------------------
def fixe_graine(graine: int = 42) -> None:
    """Fixe les graines aleatoires (Python, NumPy, PyTorch si presents)."""
    random.seed(graine)
    try:
        import numpy as np
        np.random.seed(graine)
    except ImportError:
        pass
    try:
        import torch
        torch.manual_seed(graine)
        if torch.cuda.is_available():
            torch.cuda.manual_seed_all(graine)
    except ImportError:
        pass


def charge_config(chemin: str | Path = None) -> dict:
    """Charge modele/config.json (la source de verite partagee)."""
    if chemin is None:
        chemin = Path(__file__).with_name("config.json")
    return json.loads(Path(chemin).read_text(encoding="utf-8"))


# --------------------------------------------------------------------------
# Distance de Levenshtein et metriques
# --------------------------------------------------------------------------
def _levenshtein(a: list, b: list) -> int:
    """Distance d'edition entre deux sequences (caracteres ou mots)."""
    if a == b:
        return 0
    if not a:
        return len(b)
    if not b:
        return len(a)
    precedente = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        courante = [i]
        for j, cb in enumerate(b, 1):
            cout = 0 if ca == cb else 1
            courante.append(min(
                precedente[j] + 1,       # suppression
                courante[j - 1] + 1,     # insertion
                precedente[j - 1] + cout  # substitution
            ))
        precedente = courante
    return precedente[-1]


def cer(reference: str, hypothese: str) -> float:
    """Taux d'erreur caractere : distance d'edition / nb de caracteres de reference."""
    if not reference:
        return 0.0 if not hypothese else 1.0
    return _levenshtein(list(reference), list(hypothese)) / len(reference)


def wer(reference: str, hypothese: str) -> float:
    """Taux d'erreur mot : distance d'edition sur les mots / nb de mots de reference."""
    ref = reference.split()
    hyp = hypothese.split()
    if not ref:
        return 0.0 if not hyp else 1.0
    return _levenshtein(ref, hyp) / len(ref)


def cer_moyen(references: list[str], hypotheses: list[str]) -> float:
    """CER agrege sur un jeu (micro-moyenne : total des erreurs / total des caracteres)."""
    err = tot = 0
    for r, h in zip(references, hypotheses):
        err += _levenshtein(list(r), list(h))
        tot += len(r)
    return err / tot if tot else 0.0


# --------------------------------------------------------------------------
# Evaluation des entites (extraction d'information)
# --------------------------------------------------------------------------
def score_entites(gold: list[tuple], pred: list[tuple]) -> dict:
    """Precision / rappel / F1 sur des ensembles d'entites (type, valeur).

    Comparaison exacte sur le couple (type, valeur normalisee). C'est la
    metrique honnete : une entite ne compte que si le type ET le texte sont
    corrects. Renvoie aussi le detail vrais positifs / faux positifs / faux
    negatifs pour l'analyse d'erreurs.
    """
    def norme(x):
        return (x[0], " ".join(str(x[1]).lower().split()))

    g = [norme(x) for x in gold]
    p = [norme(x) for x in pred]
    restant = list(g)
    vp = 0
    for e in p:
        if e in restant:
            restant.remove(e)
            vp += 1
    fp = len(p) - vp
    fn = len(restant)
    precision = vp / (vp + fp) if (vp + fp) else 0.0
    rappel = vp / (vp + fn) if (vp + fn) else 0.0
    f1 = 2 * precision * rappel / (precision + rappel) if (precision + rappel) else 0.0
    return {"precision": precision, "rappel": rappel, "f1": f1,
            "vp": vp, "fp": fp, "fn": fn}


def agrege_entites(scores: list[dict]) -> dict:
    """Micro-moyenne des scores d'entites sur un jeu (somme des vp/fp/fn)."""
    vp = sum(s["vp"] for s in scores)
    fp = sum(s["fp"] for s in scores)
    fn = sum(s["fn"] for s in scores)
    precision = vp / (vp + fp) if (vp + fp) else 0.0
    rappel = vp / (vp + fn) if (vp + fn) else 0.0
    f1 = 2 * precision * rappel / (precision + rappel) if (precision + rappel) else 0.0
    return {"precision": precision, "rappel": rappel, "f1": f1,
            "vp": vp, "fp": fp, "fn": fn}


# --------------------------------------------------------------------------
# Lecture des annotations M-POPP (encodage 2 : emojis apres chaque mot)
# --------------------------------------------------------------------------
# M-POPP balise chaque mot par une suite d'emojis (un "chemin") lue directement
# dans le dataset. Exemples reels :
#   Charles👨💬  -> epoux + prenom
#   Itsweire👨🗨 -> epoux + nom
#   cocher👨🔧   -> epoux + metier
#   Henri👨👴💬  -> epoux + son pere + prenom
#   Paris📖🌇    -> acte + lieu
# Les roles observes : 👨 epoux, 👰 epouse, 👴 pere, 👵 mere, 🥸 temoin,
# 📖 corps de l'acte. Les champs feuilles : 💬 prenom, 🗨 nom, 🔧 metier,
# 🌇 ville, 🗺 departement, ⌛ age. Evenements : 🏥 naissance, 🏠 residence.
# Dates : 🌞 jour, 📅 mois, 🗓 millesime.
MPOPP_ROLES = {"👨": "epoux", "👰": "epouse", "👴": "pere", "👵": "mere",
               "🥸": "temoin", "📖": "acte"}
MPOPP_CHAMPS = {"💬": "prenom", "🗨": "nom", "🔧": "metier"}
MPOPP_DATES = {"🌞", "📅", "🗓"}


def _est_tag(c: str) -> bool:
    """Vrai si le caractere est un emoji-etiquette (categorie Unicode 'So')."""
    return unicodedata.category(c) == "So"


def separe_mot_tags(token: str) -> tuple[str, str]:
    """Separe un token en (mot lisible, suite d'emojis d'etiquette)."""
    mot = "".join(c for c in token if not _est_tag(c))
    tags = "".join(c for c in token if _est_tag(c))
    return mot, tags


def texte_propre_mpopp(texte: str) -> str:
    """Retire toutes les etiquettes : donne le texte brut (reference pour le CER)."""
    mots = [separe_mot_tags(t)[0] for t in texte.split()]
    return " ".join(m for m in mots if m)


def _entite_depuis_tags(tags: str) -> str | None:
    """Traduit une suite d'emojis en entite cible (schema a 12 entites) ou None."""
    roles = [MPOPP_ROLES[c] for c in tags if c in MPOPP_ROLES]
    champs = [MPOPP_CHAMPS[c] for c in tags if c in MPOPP_CHAMPS]
    a_date = any(c in MPOPP_DATES for c in tags)
    a_ville = "🌇" in tags
    # Corps de l'acte : on ne retient que la date et le lieu principaux.
    if "acte" in roles:
        if a_date:
            return "date"
        if a_ville:
            return "lieu"
        return None
    # Un des deux epoux (ou un de leurs parents).
    principal = "epoux" if "epoux" in roles else ("epouse" if "epouse" in roles else None)
    if principal is None:
        return None  # temoin, etc. : hors schema
    # Parents : on ne retient que leur nom (prenom + nom), pas metier ni domicile,
    # pour rester aligne sur le schema (pere_epoux / mere_epouse = une personne).
    if "pere" in roles or "mere" in roles:
        if champs and champs[-1] in ("prenom", "nom"):
            return f"{'pere' if 'pere' in roles else 'mere'}_{principal}"
        return None
    if champs:
        return f"{principal}_{champs[-1]}"
    return None


def charge_mpopp(dossier: str | Path, encodage: int = 2) -> dict:
    """Charge les labels M-POPP depuis un dossier decompresse.

    M-POPP ne stocke pas un label par image : tout est dans un seul JSON
    (handwritten/labels/labels-handwritten-encoding-N.json) dont la racine
    'ground_truth' est deja decoupee en train / valid / test. On renvoie
    directement ce dictionnaire {split: {nom_image: {"text": ..., "nb_cols": ...}}}.

    `dossier` peut pointer sur la racine decompressee ou sur m-popp_datasets.
    """
    dossier = Path(dossier)
    motif = f"labels-handwritten-encoding-{encodage}.json"
    trouves = list(dossier.rglob(motif))
    if not trouves:
        raise FileNotFoundError(f"{motif} introuvable sous {dossier}")
    data = json.loads(trouves[0].read_text(encoding="utf-8"))
    return data["ground_truth"]


def extrait_entites_mpopp(texte: str) -> list[tuple[str, str]]:
    """Transforme un texte balise M-POPP en liste (type_entite, valeur).

    Les mots consecutifs partageant la meme entite sont fusionnes en une seule
    valeur (ex. "Charles👨💬 Louis👨💬" -> ("epoux_prenom", "Charles Louis")).
    Le resultat alimente directement score_entites.
    """
    entites: list[tuple[str, str]] = []
    courant: str | None = None
    mots: list[str] = []
    for token in texte.split():
        mot, tags = separe_mot_tags(token)
        mot = mot.strip(",.;:()[]")  # ponctuation de bord, non pertinente pour l'entite
        entite = _entite_depuis_tags(tags) if tags else None
        if entite == courant and entite is not None:
            if mot:
                mots.append(mot)
        else:
            if courant is not None and mots:
                entites.append((courant, " ".join(mots)))
            courant, mots = entite, ([mot] if (entite and mot) else [])
    if courant is not None and mots:
        entites.append((courant, " ".join(mots)))
    return entites


if __name__ == "__main__":
    # Petits tests de coherence (executes avec: python modele/outils.py)
    assert cer("abcde", "abcde") == 0.0
    assert abs(cer("chat", "chien") - _levenshtein(list("chat"), list("chien")) / 4) < 1e-9
    assert wer("le chat noir", "le chien noir") == 1 / 3
    s = score_entites([("date", "1911"), ("lieu", "Marnia")],
                      [("date", "1911"), ("lieu", "Maghnia")])
    assert s["vp"] == 1 and s["fp"] == 1 and s["fn"] == 1

    # M-POPP : lecture des etiquettes emojis (extrait reel d'un acte parisien).
    ex = ("Charles👨💬 Louis👨💬 Itsweire👨🗨, cocher👨🔧 "
          "fils de Henri👨👴💬 Itsweire👨👴🗨 "
          "vingt📖🌞 trois📖🌞 Septembre📖📅 a Paris📖🌇")
    assert texte_propre_mpopp(ex) == (
        "Charles Louis Itsweire, cocher fils de Henri Itsweire "
        "vingt trois Septembre a Paris")
    ents = dict(extrait_entites_mpopp(ex))
    assert ents["epoux_prenom"] == "Charles Louis", ents
    assert ents["epoux_nom"] == "Itsweire", ents
    assert ents["epoux_metier"] == "cocher", ents
    assert ents["pere_epoux"] == "Henri Itsweire", ents
    assert ents["date"] == "vingt trois Septembre", ents
    assert ents["lieu"] == "Paris", ents
    print("outils.py : tous les tests passent")
