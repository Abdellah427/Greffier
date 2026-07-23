// Les données de la page Origines : les personnes, les unions et les
// documents qui les prouvent. Chaque information de l'arbre pointe vers
// sa source ; les lectures incertaines sont signalées.
window.ORIGINES = {

personnes: [
  // Génération des aïeux nés sous le Second Empire et la IIIe République
  { id: "martinez-pere", prenom: "Bernard", nom: "Martinez",
    detail: "décédé avant 1940", vivant: false, generation: 0,
    sources: ["acte-mariage-1940"] },
  { id: "montesinos-maria", prenom: "Maria", nom: "Montesinos",
    detail: "décédée avant 1940", vivant: false, generation: 0,
    sources: ["acte-mariage-1940"] },
  { id: "bensalah", prenom: "Bensalah", nom: "",
    detail: "décédé avant 1940", vivant: false, generation: 0,
    sources: ["acte-mariage-1940"] },
  { id: "diab-fatma", prenom: "Fatma", nom: "Diab",
    detail: "de Marnia", vivant: false, generation: 0,
    sources: ["acte-mariage-1940", "affiche-diab"] },

  // L'homme aux deux noms et son épouse
  { id: "abdallah", prenom: "Bernard Joseph", nom: "Martinez",
    detail: "devenu Abdallah Benabderrahmane en 1965 · 1886-1967 · Aïn Témouchent puis Marnia",
    vivant: false, generation: 1,
    sources: ["decret-1965", "acte-mariage-1940", "livret-famille-mariage",
              "carte-combattant-1936", "fascicule-mobilisation",
              "carte-ouvrier-1947", "carnet-finances-1963"] },
  { id: "zahra", prenom: "Zahra", nom: "Morsli",
    detail: "vers 1917-2009 · Marnia", vivant: false, generation: 1,
    sources: ["acte-mariage-1940", "livret-famille-mariage"] },

  // Les enfants de Marnia
  { id: "benamar", prenom: "Benamar", nom: "Benabderrahmane",
    detail: "vers 1938-2022", vivant: false, generation: 2,
    sources: ["livret-famille-enfants"] },
  { id: "mostefa", prenom: "Mostefa", nom: "Benabderrahmane",
    detail: "1940-2023 · Marnia", vivant: false, generation: 2,
    sources: ["livret-famille-enfants", "livret-militaire-mostefa"] },
  { id: "khadoudja", prenom: "Khadoudja", nom: "Benabderrahmane",
    detail: "née en 1942 à Marnia", vivant: true, generation: 2,
    sources: ["livret-famille-enfants"] },
  { id: "arfa-abdelkader", prenom: "Abdelkader", nom: "Arfa",
    detail: "1925-1967", vivant: false, generation: 2, sources: [] },
  { id: "mezouar-ahmed", prenom: "Ahmed", nom: "Mezouar",
    detail: "1925-2005", vivant: false, generation: 2, sources: [] },

  // La génération née à Maghnia
  { id: "arfa-amine", prenom: "Amine", nom: "Arfa",
    detail: "né en 1963", vivant: true, generation: 3, sources: [] },
  { id: "hassiba", prenom: "Hassiba", nom: "Arfa",
    detail: "née en 1964 à Maghnia", vivant: true, generation: 3,
    sources: ["acte-naissance-amina"] },
  { id: "arfa-latifa", prenom: "Latifa", nom: "Arfa",
    detail: "née en 1967", vivant: true, generation: 3, sources: [] },
  { id: "soltani-mohamed", prenom: "Mohamed", nom: "Soltani",
    detail: "né en 1958 à Tolga", vivant: true, generation: 3,
    sources: ["acte-naissance-amina"] },

  // Mes parents
  { id: "amina", prenom: "Amina Schéhérazade", nom: "Soltani",
    detail: "née en 1984 à Argenteuil", vivant: true, generation: 4,
    sources: ["acte-naissance-amina", "acte-naissance-abdellah"] },
  { id: "hassani-mohammed", prenom: "Mohammed", nom: "Hassani",
    detail: "né en 1973 à Hadjadj", vivant: true, generation: 4,
    sources: ["acte-naissance-abdellah"] },

  // Moi et les miens
  { id: "khadija", prenom: "Khadija", nom: "Hassani",
    detail: "née en 1999", vivant: true, generation: 5, sources: [] },
  { id: "moi", prenom: "Abdellah Souleyman", nom: "Hassani",
    detail: "né en 2002 à Nanterre · moi", vivant: true, generation: 5,
    sources: ["acte-naissance-abdellah"] },
  { id: "assia", prenom: "Assia", nom: "Hassani",
    detail: "née en 2004", vivant: true, generation: 5, sources: [] },
],

unions: [
  { parents: ["martinez-pere", "montesinos-maria"], enfants: ["abdallah"] },
  { parents: ["bensalah", "diab-fatma"], enfants: ["zahra"] },
  { parents: ["abdallah", "zahra"],
    enfants: ["benamar", "mostefa", "khadoudja"],
    note: "mariés à Marnia le 11 janvier 1940" },
  { parents: ["arfa-abdelkader", "khadoudja"],
    enfants: ["arfa-amine", "hassiba", "arfa-latifa"] },
  { parents: ["mezouar-ahmed", "khadoudja"], enfants: [],
    note: "second mariage" },
  { parents: ["soltani-mohamed", "hassiba"], enfants: ["amina"] },
  { parents: ["hassani-mohammed", "amina"],
    enfants: ["khadija", "moi", "assia"] },
],

documents: [
  { id: "decret-1965",
    image: "origines/decret-1965.jpg",
    titre: "Le décret de 1965 : un nom pour un autre",
    date: "27 février 1965",
    lieu: "mention portée sur le registre de Marnia",
    transcription:
`Par décret du 27 février 1965 [...] l'acte ci-contre sera rectifié en ce
sens que : Est naturalisé Algérien dans les conditions de l'article 13 du
code de la nationalité Algérienne sus visé : Mr Martinez Bernard Joseph
né le 27 mai 1886 à Aïn Temouchent et portera désormais le nom de :
Benabderrahmane. Prénom : Abdallah.
Conformément à l'article 15 de la loi 63-96 du 27 mars 1963, Journal
officiel n° 18 du 2 avril 1963, paragraphe II.
Le 7 juin 1965. Le chef [...]`,
    releve: [
      { champ: "Nom d'origine", valeur: "Martinez Bernard Joseph", personnes: ["abdallah"] },
      { champ: "Naissance", valeur: "27 mai 1886 à Aïn Témouchent", personnes: ["abdallah"] },
      { champ: "Nouveau nom", valeur: "Benabderrahmane Abdallah", personnes: ["abdallah"] },
      { champ: "Fondement", valeur: "article 13 du code de la nationalité algérienne, loi 63-96 du 27 mars 1963", personnes: [] },
    ],
    commentaire:
`La pièce qui donne son sens à toute la page : à 78 ans, l'arrière-arrière-
grand-père change officiellement de nom et de nationalité. La mention
marginale de la copie française du même acte écrit « Abdellah » ; celle-ci
écrit « Abdallah ». Les deux orthographes de mon prénom viennent de là.` },

  { id: "acte-mariage-1940",
    image: "origines/acte-mariage-1940.jpg",
    titre: "L'acte de mariage de 1940",
    date: "11 janvier 1940",
    lieu: "Marnia (Oran) · copie délivrée par Nantes en 2013",
    transcription:
`Le onze janvier mil neuf cent quarante à dix heures [...] devant nous
Bucharam ou Boité [?], conseiller municipal, officier de l'état civil de
Marnia [...] ont comparu publiquement en la maison commune : Martinez
Bernard Joseph, né le vingt sept mai mil huit cent quatre vingt six à
Aïn Témouchent (Oran), maçon, domicilié et résidant à Marnia, fils
majeur de feu Martinez Bernard et de feu Montesinos Maria, veuf en
deuxièmes noces de Semordi Sabrina bent Larbi [?], morte à Marnia
(Oran) [...] d'une part.
Et demoiselle Morsli Zahra, née à Marnia (Oran) présumée en mil neuf
cent dix huit [...] sans profession, domiciliée et résidante à Marnia,
fille mineure de feu Bensalah ould Bordelai [?] et de Diab Fatma [...]
La mère de la future épouse et les témoins ont approuvé [...] Il n'a pas
été fait de contrat de mariage.
En marge : l'époux a été autorisé à porter dorénavant le nom de
BENABDERRAHMANE Abdellah en application du décret de naturalisation
du 27 février 1965 [...] Nantes, le 22 novembre [...].
Copie d'acte délivrée selon procédé informatisé, Nantes, le 29 août 2013,
l'officier de l'état civil, Annie Chouin.`,
    releve: [
      { champ: "Époux", valeur: "Martinez Bernard Joseph, maçon, 53 ans", personnes: ["abdallah"] },
      { champ: "Épouse", valeur: "Morsli Zahra, née vers 1918 à Marnia", personnes: ["zahra"] },
      { champ: "Parents de l'époux", valeur: "feu Martinez Bernard et feu Montesinos Maria", personnes: ["martinez-pere", "montesinos-maria"] },
      { champ: "Parents de l'épouse", valeur: "feu Bensalah et Diab Fatma", personnes: ["bensalah", "diab-fatma"] },
    ],
    commentaire:
`Écriture serrée d'un officier d'état civil de 1940, recopiée par le
service central de Nantes soixante-treize ans plus tard : le genre de
page exactement dans le domaine de l'atelier de lecture de ce site.
Les passages incertains sont marqués [?].` },

  { id: "livret-famille-mariage",
    image: "origines/livret-famille-mariage.jpg",
    titre: "Le livret de famille de Marnia",
    date: "délivré le 11 mars 1940",
    lieu: "ville de Marnia, département d'Oran",
    transcription:
`Livret de famille. Département d'Oran, ville de Marnia. Martinez B.
Mariage. Année 1940, registre n° 1, du onze janvier mil neuf cent
quarante, commune de Marnia, département d'Oran.
Entre Martinez Bernard Joseph, né le 27 mai 1886 à Aïn Témouchent,
département d'Oran, profession de maçon, domicilié à Marnia, fils de feu
Bernard et de feue Montesinos Maria [...]
Et Morsli Zahra, née en 1918 à Marnia, fille de feu Bensalah et de
Diab Fatma [...] Contrat de mariage : néant.
Délivré le 11 mars 1940, l'officier de l'état civil.`,
    releve: [
      { champ: "Mariage", valeur: "11 janvier 1940 à Marnia", personnes: ["abdallah", "zahra"] },
    ],
    commentaire:
`Le petit carnet que la famille a gardé pendant huit décennies et
plusieurs déménagements, de Marnia jusqu'en France.` },

  { id: "livret-famille-enfants",
    image: "origines/livret-famille-enfants.jpg",
    titre: "Les enfants, pages 2 et 3 du livret",
    date: "années 1940",
    lieu: "mairie de Marnia",
    transcription:
`Naissance et décès des enfants issus du mariage.
1° Martinez Benamar, né le 21 septembre 1943 [lecture incertaine] à
Marnia, n° 25. Timbre et signature de l'officier de l'état civil.
2° Martinez Mostefa, né le 27 février 1940 à Marnia, n° 13.
3° Martinez Hadoudja, née le 31 octobre 1942 à Marnia, n° 17.
Cachet : mairie de Marnia.`,
    releve: [
      { champ: "1er enfant", valeur: "Benamar (l'arbre familial indique plutôt 1938 : point à confirmer)", personnes: ["benamar"] },
      { champ: "2e enfant", valeur: "Mostefa, né le 27 février 1940", personnes: ["mostefa"] },
      { champ: "3e enfant", valeur: "Khadoudja, née le 31 octobre 1942", personnes: ["khadoudja"] },
    ],
    commentaire:
`Trois enfants déclarés sous le nom Martinez : le décret de 1965 fera
d'eux des Benabderrahmane. La date de Benamar diverge entre ce livret
et l'arbre dressé par la famille ; le document est pâli, la question
reste ouverte.` },

  { id: "carte-combattant-1936",
    image: "origines/carte-combattant-1936.jpg",
    titre: "La carte du combattant",
    date: "25 mars 1936",
    lieu: "Oran",
    transcription:
`République française. Office national des mutilés, combattants et
victimes de la guerre. Comité départemental d'Oran.
Carte du combattant n° 15868, valable du 25 mars 1936 au 24 mars 1941.
M. Martinez, prénoms Bernard, né le 27 mai 1886 à Aïn Témouchent,
département d'Oran, domicilié à Marnia, rue J.-J. Rousseau.
À Oran, le 25 mars 1936. Le président du Comité départemental,
le chef des services administratifs. Photographie du titulaire.
Au verso : Croix du combattant, observations importantes.`,
    releve: [
      { champ: "Titulaire", valeur: "Martinez Bernard, ancien combattant de la Grande Guerre", personnes: ["abdallah"] },
      { champ: "Domicile", valeur: "Marnia, rue J.-J. Rousseau", personnes: ["abdallah"] },
    ],
    commentaire:
`La seule photographie que nous ayons de lui : un visage franc, la
cinquantaine, vingt ans après les tranchées.` },

  { id: "fascicule-mobilisation",
    image: "origines/fascicule-mobilisation.jpg",
    titre: "Le fascicule de mobilisation",
    date: "classe 1907",
    lieu: "bureau de recrutement d'Oran",
    transcription:
`Fascicule de mobilisation (modèle A). Classe de mobilisation 1907,
bureau de recrutement d'Oran, numéro au registre 2246 [?].
Nom et prénoms : Martinez Bernard, né le 27 mai 1886 à Aïn Témouchent.
Profession : maçon. Grade : 2e classe, service auxiliaire.
Domicilié à Marnia, canton de Marnia, département d'Oran, 19e région.
Est placé dans la position « sans affectation ».
Voir l'ordre pour le cas de mobilisation page 3 du présent fascicule.`,
    releve: [
      { champ: "Classe", valeur: "1907 (ses vingt ans)", personnes: ["abdallah"] },
      { champ: "Service", valeur: "2e classe, service auxiliaire", personnes: ["abdallah"] },
    ],
    commentaire:
`Le livret du soldat, usé aux pliures : il l'aura porté de la Grande
Guerre à la réserve, jusqu'à la carte du combattant de 1936.` },

  { id: "carte-ouvrier-1947",
    image: "origines/carte-ouvrier-1947.jpg",
    titre: "La carte d'employé ouvrier",
    date: "21 février 1947",
    lieu: "Alger · délivrée par Marnia",
    transcription:
`Caisse sociale des travaux publics et du bâtiment en Algérie,
Alger, 2 boulevard Baudin. Carte « employé ouvrier » n° 680.487.
Nom : Martinez. Prénoms : Bernard.
Date et lieu de naissance : 27 [mai] 1886 à Aïn Témouchent.
Pièces d'identité : livret de famille. Délivrée par : Marnia.
Alger, le 21 février 1947.
Au verso : cette carte est strictement personnelle, sa production sera
exigée pour le payement des congés payés et des allocations familiales.`,
    releve: [
      { champ: "Métier", valeur: "ouvrier du bâtiment, encore en activité à 60 ans", personnes: ["abdallah"] },
    ],
    commentaire:
`Un maçon de soixante ans qui fait valoir ses congés payés : la vie
matérielle, entre les grands actes.` },

  { id: "carnet-finances-1963",
    image: "origines/carnet-finances-1963.jpg",
    titre: "Le carnet des finances, novembre 1963",
    date: "20 novembre 1963",
    lieu: "Alger · Marnia",
    transcription:
`République [algérienne], ministère des Finances, direction [...]
Carnet de pension [?]. Cachets : Alger, 20 novembre 1963 ; Marnia.
Mentions manuscrites : Bernard [...] n° 508 347 [?] ; Marnia, rue [...] ;
Alger.`,
    releve: [
      { champ: "Date", valeur: "un an après l'indépendance, deux ans avant le décret", personnes: ["abdallah"] },
    ],
    commentaire:
`Le carnet est presque illisible, rongé par les manipulations : c'est
typiquement le document qui met les modèles de lecture en difficulté,
et celui pour lequel la chaîne de prétraitement du site a été pensée.` },

  { id: "livret-militaire-mostefa",
    image: "origines/livret-militaire-mostefa.jpg",
    titre: "Le livret militaire de Mostefa",
    date: "classe 1960",
    lieu: "direction régionale d'Oran",
    transcription:
`Ministère de la Guerre. Livret individuel. Classe 1960.
Nom : Martinez. Prénoms : Mostefa.
Né le 27 février 1940 à Marnia, canton de Marnia, département de
Tlemcen [?], résidant à Marnia, rue n° 41 [?].
Fils de [Martinez Bernard] et de [Morsli Zahra], domiciliés à Marnia.
Décisions ou actes : appelé à l'activité le 2 mars 1962 ; renvoyé dans
ses foyers le [...] 1962. Cachet du bureau de recrutement d'Oran,
1er mai 1959.`,
    releve: [
      { champ: "Titulaire", valeur: "Mostefa, fils aîné du second mariage, appelé en 1962", personnes: ["mostefa"] },
    ],
    commentaire:
`Le fils porte encore le nom Martinez sur son livret militaire : appelé
en mars 1962, dans les tout derniers mois de la guerre d'Algérie, puis
renvoyé dans ses foyers. Trois ans plus tard, le décret fera de lui un
Benabderrahmane.` },

  { id: "affiche-diab",
    image: "origines/affiche-diab.jpg",
    titre: "L'affiche conservée par la famille",
    date: "décembre 1972",
    lieu: "Paris",
    transcription:
`Appel de Fatna, sœur de Mohamed Diab, assassiné au commissariat de
Versailles par un policier. « Je dis à tout le monde : arrêtez de
mentir ! Seules les déclarations que j'ai faites sont la vérité. Je veux
que tous les gens m'aident à faire la vérité et la justice. Mon frère
est mort. On ment. La famille en est malade. J'appelle avec le Comité de
défense des droits et de la vie des immigrés, tous ceux qui veulent
m'aider, au rassemblement de tous les habitants de France, Français et
immigrés épris de justice. Ancienne gare de la Bastille, dimanche
17 décembre de 14 h à 19 heures. » Texte bilingue français-arabe.`,
    releve: [
      { champ: "Mémoire familiale", valeur: "Mohamed Diab serait un parent de l'arrière-grand-mère Khadoudja, par la famille Diab de Marnia", personnes: ["diab-fatma", "khadoudja"] },
    ],
    commentaire:
`Ce document historique des luttes de l'immigration (Mohamed Diab est
mort au commissariat de Versailles le 29 novembre 1972) a été conservé
dans les papiers de la famille. Le nom Diab est celui de la mère de
Morsli Zahra ; selon la mémoire familiale, Mohamed Diab était un cousin
ou un oncle de Khadoudja. Aucun acte ne l'établit à ce jour : l'affiche
est reproduite ici comme un document d'histoire, et comme une piste.` },

  // Sources sans image publiée (actes récents, personnes vivantes)
  { id: "acte-naissance-amina", sansImage: true,
    titre: "Acte de naissance n° 651/1984, Argenteuil",
    date: "20 avril 1984", lieu: "Argenteuil (Val-d'Oise)",
    transcription: "",
    releve: [
      { champ: "Mère", valeur: "Hassiba Arfa, née le 31 décembre 1964 à Maghnia (Algérie)", personnes: ["hassiba"] },
      { champ: "Père", valeur: "Mohamed Soltani, né en 1958 à Tolga (Algérie)", personnes: ["soltani-mohamed"] },
    ],
    commentaire:
`Acte conservé par la famille ; il n'est pas reproduit ici car il
concerne des personnes vivantes. C'est lui qui relie Argenteuil à
Maghnia, l'ancienne Marnia.` },
  { id: "acte-naissance-abdellah", sansImage: true,
    titre: "Acte de naissance, Nanterre",
    date: "26 juillet 2002", lieu: "Nanterre (Hauts-de-Seine)",
    transcription: "",
    releve: [
      { champ: "Naissance", valeur: "Abdellah Souleyman Hassani, 26 juillet 2002 à Nanterre", personnes: ["moi"] },
    ],
    commentaire:
`Mon propre acte, non reproduit. Le prénom y est écrit Abdellah ;
le décret de 1965 écrivait Abdallah.` },
],

};
