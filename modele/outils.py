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


if __name__ == "__main__":
    # Petits tests de coherence (executes avec: python modele/outils.py)
    assert cer("abcde", "abcde") == 0.0
    assert abs(cer("chat", "chien") - _levenshtein(list("chat"), list("chien")) / 4) < 1e-9
    assert wer("le chat noir", "le chien noir") == 1 / 3
    s = score_entites([("date", "1911"), ("lieu", "Marnia")],
                      [("date", "1911"), ("lieu", "Maghnia")])
    assert s["vp"] == 1 and s["fp"] == 1 and s["fn"] == 1
    print("outils.py : tous les tests passent")
