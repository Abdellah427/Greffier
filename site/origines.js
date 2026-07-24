// Les données de la page Origines : les personnes, les unions et les
// documents qui les prouvent. Chaque information de l'arbre pointe vers
// sa source ; les lectures incertaines sont signalées.
window.ORIGINES = {

personnes: [
  // Génération des aïeux nés sous le Second Empire et la IIIe République
  { id: "martinez-pere", sexe: "h", prenom: "Bernard", nom: "Martinez",
    detail: "décédé avant 1940", vivant: false, generation: 0,
    sources: ["acte-mariage-1940", "decret-ampliation"] },
  { id: "montesinos-maria", sexe: "f", prenom: "Maria", nom: "Montesinos",
    detail: "décédée avant 1940", vivant: false, generation: 0,
    sources: ["acte-mariage-1940", "decret-ampliation"] },
  { id: "bensalah", sexe: "h", prenom: "Bensalah", nom: "",
    detail: "décédé avant 1940", vivant: false, generation: 0,
    sources: ["acte-mariage-1940"] },
  { id: "diab-fatma", sexe: "f", prenom: "Fatma", nom: "Diab",
    detail: "de Marnia", vivant: false, generation: 0,
    sources: ["acte-mariage-1940", "affiche-diab"] },

  // L'homme aux deux noms et son épouse
  { id: "abdallah", sexe: "h", prenom: "Bernard Joseph", nom: "Martinez",
    detail: "devenu Abdallah Benabderrahmane en 1965 · 1886-1967 · Aïn Témouchent puis Marnia",
    vivant: false, generation: 1,
    sources: ["acte-naissance-1886", "matricule-1907", "matricule-campagnes",
              "decret-1965", "decret-ampliation", "decret-lettre",
              "jo-1965-decret", "loi-1963",
              "acte-mariage-1940", "livret-famille-mariage",
              "carte-combattant-1936", "fascicule-mobilisation",
              "carte-ouvrier-1947", "carnet-finances-1963"] },
  { id: "jeanne-bollet", sexe: "f", prenom: "Jeanne", nom: "Polliet [?]",
    detail: "première épouse, mariée à Marnia en 1911", vivant: false, generation: 1,
    sources: ["acte-naissance-1886"] },
  { id: "fatima-semordi", sexe: "f", prenom: "Fatima", nom: "Semordi",
    detail: "deuxième épouse, mariée à Tlemcen en 1930, morte avant 1940",
    vivant: false, generation: 1,
    sources: ["acte-naissance-1886", "acte-mariage-1940"] },
  { id: "zahra", sexe: "f", prenom: "Zahra", nom: "Morsli",
    detail: "vers 1917-2009 · Marnia", vivant: false, generation: 1,
    sources: ["acte-mariage-1940", "livret-famille-mariage"] },

  // Les enfants de Marnia
  { id: "benamar", sexe: "h", prenom: "Benamar", nom: "Benabderrahmane",
    detail: "vers 1938-2022", vivant: false, generation: 2,
    sources: ["livret-famille-enfants"] },
  { id: "mostefa", sexe: "h", prenom: "Mostefa", nom: "Benabderrahmane",
    detail: "1940-2023 · Marnia", vivant: false, generation: 2,
    sources: ["livret-famille-enfants", "livret-militaire-mostefa"] },
  { id: "khadoudja", sexe: "f", prenom: "Khadoudja", nom: "Benabderrahmane",
    detail: "née en 1942 à Marnia", vivant: true, generation: 2,
    sources: ["livret-famille-enfants"] },
  { id: "arfa-abdelkader", sexe: "h", prenom: "Abdelkader", nom: "Arfa",
    detail: "1925-1967", vivant: false, generation: 2, sources: [] },
  { id: "mezouar-ahmed", sexe: "h", prenom: "Ahmed", nom: "Mezouar",
    detail: "1925-2005", vivant: false, generation: 2, sources: [] },

  // La génération née à Maghnia
  { id: "arfa-amine", sexe: "h", prenom: "Amine", nom: "Arfa",
    detail: "né en 1963", vivant: true, generation: 3, sources: [] },
  { id: "arfa-latifa", sexe: "f", prenom: "Latifa", nom: "Arfa",
    detail: "née en 1967", vivant: true, generation: 3, sources: [] },
  { id: "hassiba", sexe: "f", prenom: "Hassiba", nom: "Arfa",
    detail: "née en 1964 à Maghnia", vivant: true, generation: 3,
    sources: ["acte-naissance-amina"] },
  { id: "soltani-mohamed", sexe: "h", prenom: "Mohamed", nom: "Soltani",
    detail: "né en 1958 à Tolga", vivant: true, generation: 3,
    sources: ["acte-naissance-amina"] },

  // Mes parents
  { id: "amina", sexe: "f", prenom: "Amina Schéhérazade", nom: "Soltani",
    detail: "née en 1984 à Argenteuil", vivant: true, generation: 4,
    sources: ["acte-naissance-amina", "acte-naissance-abdellah"] },
  { id: "hassani-mohammed", sexe: "h", prenom: "Mohammed", nom: "Hassani",
    detail: "né en 1973 à Hadjadj", vivant: true, generation: 4,
    sources: ["acte-naissance-abdellah"] },

  // Moi et les miens
  { id: "khadija", sexe: "f", prenom: "Maïssen", nom: "Hassani",
    detail: "née en 1999", vivant: true, generation: 5, sources: [] },
  { id: "moi", sexe: "h", prenom: "Abdellah Souleyman", nom: "Hassani",
    detail: "né en 2002 à Nanterre · moi", vivant: true, generation: 5,
    sources: ["acte-naissance-abdellah"] },
  { id: "assia", sexe: "f", prenom: "Assia", nom: "Hassani",
    detail: "née en 2004", vivant: true, generation: 5, sources: [] },
],

unions: [
  { parents: ["martinez-pere", "montesinos-maria"], enfants: ["abdallah"] },
  { parents: ["abdallah", "jeanne-bollet"], enfants: [],
    note: "mariés à Marnia le 27 mai 1911" },
  { parents: ["abdallah", "fatima-semordi"], enfants: [],
    note: "mariés à Tlemcen le 22 novembre 1930" },
  { parents: ["bensalah", "diab-fatma"], enfants: ["zahra"] },
  { parents: ["abdallah", "zahra"],
    enfants: ["benamar", "mostefa", "khadoudja"],
    note: "mariés à Marnia le 11 janvier 1940", acte: "acte-mariage-1940" },
  { parents: ["arfa-abdelkader", "khadoudja"],
    enfants: ["arfa-amine", "hassiba", "arfa-latifa"] },
  { parents: ["mezouar-ahmed", "khadoudja"], enfants: [],
    note: "second mariage" },
  { parents: ["soltani-mohamed", "hassiba"], enfants: ["amina"] },
  { parents: ["hassani-mohammed", "amina"],
    enfants: ["khadija", "moi", "assia"] },
],

documents: [
  { id: "acte-naissance-1886",
    image: "origines/acte-naissance-1886.jpg",
    titre: "L'acte de naissance de 1886, et toute une vie en marge",
    date: "27 mai 1886",
    lieu: "registre d'Aïn Témouchent, acte n° 74 · ANOM, vue 02S267-0538",
    transcription:
`N° 74. Naissance de Martinez Bernard Joseph [rayé en 1965 et remplacé
par :] Benabderrahmane Abdallah.
L'an mil huit cent quatre-vingt-six, le [vingt-huit mai] du matin, par
devant nous Chabaud Camille, maire de la commune d'Aïn-Temouchent,
arrondissement et département d'Oran, remplissant les fonctions
d'officier de l'état civil, [...] lequel nous a présenté un enfant
[...] être né le jour d'hier [...] son domicile [...] comparant et de
[...] été faites en présence [...] et de Jules [...] tous deux
domiciliés [...] et aux témoins [...] le sieur Joseph [...]

Mentions marginales :
Par acte en date du vingt sept mai mil neuf cent onze, inscrit le même
jour à la mairie de Marnia (Oran), Martinez Bernard Joseph, dont la
naissance est constatée dans l'acte ci-contre, a contracté mariage avec
Polliet Jeanne [?]. Mention faite par nous, greffier du tribunal d'Oran.
Marié le 22 novembre 1930 à Tlemcen avec Fatima Semordi. Oran, le
27 novembre 1930, le greffier.
Marié le 11 janvier 1940 à Marnia avec Morsli Zahra bent Bensalah.
Oran, le 1er juin 1940 [?].
[Feuillet collé sur l'acte :] Rectification administrative (art. 99 du
Code civil). Décret du 27 février 1965 [...] est naturalisé Algérien
[...] Mr Martinez Bernard Joseph né le 27 mai 1886 à Aïn Temouchent et
portera désormais le nom de : Benabderrahmane, prénom : Abdallah [...]
Le 7 juin 1965.`,
    releve: [
      { champ: "Naissance", valeur: "27 mai 1886 (« né le jour d'hier »), acte dressé devant le maire Camille Chabaud", personnes: ["abdallah"] },
      { champ: "1er mariage", valeur: "27 mai 1911 à Marnia, avec Jeanne Polliet [?], le jour de ses 25 ans", personnes: ["abdallah", "jeanne-bollet"] },
      { champ: "2e mariage", valeur: "22 novembre 1930 à Tlemcen, avec Fatima Semordi", personnes: ["abdallah", "fatima-semordi"] },
      { champ: "3e mariage", valeur: "11 janvier 1940 à Marnia, avec Morsli Zahra bent Bensalah", personnes: ["abdallah", "zahra"] },
      { champ: "Rectification", valeur: "1965 : le nom est rayé sur l'acte même, Benabderrahmane Abdallah écrit à la place", personnes: ["abdallah"] },
    ],
    contexte:
`L'état civil français reporte en marge de l'acte de naissance les
grands actes de la vie : c'est le système des mentions marginales. Sur
cette page du registre d'Aïn Témouchent, numérisée par les Archives
nationales d'outre-mer, la marge du n° 74 contient ainsi trois mariages
et une naturalisation, de 1911 à 1965. Le feuillet de rectification
collé sur l'acte est celui dont la famille conservait la photographie.
Autour de lui, les actes voisins disent la ville : Vinas, Nieto,
Delgado, Mengual. L'index de l'ANOM enregistre l'homme sous ses deux noms.
En 1886, l'année de cette naissance, la province d'Oran comptait plus
d'Espagnols que de Français, quatre-vingt-douze mille contre
quatre-vingt mille, venus surtout de Murcie, d'Almería, d'Alicante et
de Valence fuir la sécheresse et la crise agraire du Levant espagnol :
les Martinez et les Montesinos étaient de ceux-là (Juan Bautista Vilar,
« Los españoles en la Argelia francesa », Murcie, 1989).`,
    commentaire:
`La pièce que je pensais introuvable : son acte de naissance, avec sa
vie entière écrite autour. Un premier mariage le jour de ses
vingt-cinq ans avec une Européenne, un deuxième à Tlemcen, le
troisième avec mon arrière-arrière-grand-mère, et en 1965 son ancien
nom rayé à l'encre sur l'acte même qui l'avait vu naître.` },

  { id: "matricule-1907",
    image: "origines/matricule-1907.jpg",
    titre: "La fiche matricule : une vie en une page",
    date: "classe 1907, matricule 2276",
    lieu: "bureau de recrutement d'Oran · ANOM, registre 02RM0118",
    transcription:
`Martinez, prénoms : Bernard. Numéro matricule du recrutement : 2276.
Classe de mobilisation : 1907.
État civil : né le 27 mai 1886 à Aïn Temouchent, canton dudit,
département d'Oran, résidant à Marnia, profession de maçon, fils de
Martinez Bernard et de Maria Montesino, domiciliés à Marnia, canton
dudit, département d'Oran.
Signalement : cheveux châtains, sourcils châtains, yeux gris, front
ordinaire, nez moyen, bouche moyenne, menton rond, visage ovale.
Taille : 1 m 69. Degré d'instruction générale : 1.
Décision du conseil de révision : classé dans la 1re partie de la
liste en 1908. Bon.
Détail des services : incorporé au 2e régiment de zouaves à compter du
5 octobre 1908, arrivé au corps et soldat de 2e classe ledit jour.
Envoyé en congé le 24 septembre 1910, se retire à Marnia (Oran),
certificat de bonne conduite accordé. A obéi à la mobilisation
générale, au 2e régiment de zouaves, le 3 août 1914. Passé au 2e
groupe d'artillerie de campagne (17 avril 1917), puis au 6e groupe
d'artillerie à pied, puis au 10e régiment d'artillerie à pied. Classé
service auxiliaire par décision de la commission de réforme de Tlemcen
du 21 juin 1918, pour bronchite chronique, inapte définitif au port
des armes. Envoyé en congé illimité le 14 avril 1919, se retire à
Mascara. Carte du combattant le 14/12/30. Dégagé de toute obligation
militaire le 13-10-1935.
Condamnations : condamné par jugement du tribunal correctionnel
d'Oudjda en date du 3 juin 1930 à un an d'emprisonnement avec sursis,
pour abus de confiance.
Localités successives habitées : 1911, Bel-Abbès, rue du Soleil, chez
M. Polliet [?] ; 1912, Marnia, maçon ; 1916 [?], Bel-Abbès, rue du Soleil ;
1919, Mascara ; 1921, Marnia, ferme Riant [?] ; 1922 [?], Tlemcen,
faubourg [?] ; 1933, Marnia, rue Jean-Jacques Rousseau.`,
    releve: [
      { champ: "Régiment", valeur: "2e régiment de zouaves, incorporé en 1908, rappelé le 3 août 1914", personnes: ["abdallah"] },
      { champ: "Signalement", valeur: "1,69 m, cheveux châtains, yeux gris, visage ovale", personnes: ["abdallah"] },
      { champ: "Fin de guerre", valeur: "service auxiliaire en 1918 pour bronchite chronique, congé le 14 avril 1919", personnes: ["abdallah"] },
      { champ: "Chez les Polliet", valeur: "domicilié en 1911 rue du Soleil à Bel-Abbès, chez M. Polliet [?], son beau-père", personnes: ["abdallah", "jeanne-bollet"] },
    ],
    contexte:
`Le registre matricule est la biographie administrative d'un soldat,
tenue toute sa vie par le bureau de recrutement. Celui d'Oran, conservé
aux ANOM et consultable en ligne, suit Bernard Martinez de ses vingt ans
à ses cinquante ans, et raconte sans le vouloir une vie entière. Maçon
incorporé au 2e régiment de zouaves, rappelé dès le 3 août 1914, il est
versé en 1918 dans le service auxiliaire pour une bronchite chronique qui
le déclare inapte au port des armes. Vient ensuite un accroc avec la
justice : en 1930, le tribunal d'Oudjda le condamne à un an de prison
avec sursis pour abus de confiance, une peine qui reste suspendue. Et une
vie sans repos, une douzaine d'adresses en vingt ans, de Bel-Abbès à
Tlemcen en passant par Mascara et Marnia, dont cette année 1911 où il
loge rue du Soleil chez son beau-père Polliet. Le fascicule de
mobilisation gardé par la famille porte le même numéro, 2276 : les deux
documents se répondent à un siècle de distance.`,
    commentaire:
`Une page d'écriture serrée qui contient plus de vie que bien des
livres : on y apprend jusqu'à la couleur de ses yeux. Gris.` },

  { id: "matricule-campagnes",
    image: "origines/matricule-campagnes.jpg",
    titre: "Blessé devant Monastir",
    date: "20 octobre 1916",
    lieu: "front d'Orient, Macédoine · feuillet des campagnes de la fiche matricule",
    transcription:
`Campagnes : contre l'Allemagne du 3 août 1914 ; aux armées,
campagne double, au 14-9-1916 ; Orient, du 2-9-1916 au 28-2-1917 ;
Algérie, du 1-3-1917 ; campagne double au 20-10-1917 ; Algérie du
21-10-1917, campagne simple, au 11-11-1918.
Blessures, citations, décorations, etc. : Blessé le 20 octobre 1916,
plaie pénétrante à l'épaule droite par balle, au combat de Kénali
(Monastir).
Médaille commémorative de la grande guerre. Médaille de la Victoire.`,
    releve: [
      { champ: "Blessure", valeur: "20 octobre 1916, balle à l'épaule droite, combat de Kenali, devant Monastir", personnes: ["abdallah"] },
      { champ: "Décorations", valeur: "médaille commémorative de la Grande Guerre, médaille de la Victoire", personnes: ["abdallah"] },
    ],
    contexte:
`À l'automne 1916, l'armée d'Orient, débarquée à Salonique, attaque en
Macédoine pour reprendre Monastir. Le combat de Kenali, où les zouaves
et l'armée serbe affrontent les lignes bulgares et allemandes, est un
des plus durs de l'offensive : Monastir tombera le 19 novembre 1916.
Le maçon d'Aïn Témouchent y reçoit une balle dans l'épaule droite,
à trois mille kilomètres de chez lui.`,
    commentaire:
`La famille savait qu'il avait « fait la guerre » ; personne ne savait
plus laquelle, ni où. C'était la Macédoine, et il y a laissé du sang
le 20 octobre 1916.` },

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
    contexte:
`À l'indépendance, le code de la nationalité algérienne (loi 63-96
du 27 mars 1963) réserve la nationalité de plein droit aux personnes dont
deux ascendants paternels sont nés en Algérie avec le statut musulman.
Les Européens restés au pays, très minoritaires après le grand départ de
1962, doivent passer par la naturalisation : c'est l'article 13 visé par
ce décret. La naturalisation pouvait s'accompagner, à la demande de
l'intéressé, d'un changement de nom et de prénom : Bernard Joseph
Martinez devient ainsi Abdallah Benabderrahmane, par décision publiée et
reportée en marge de son acte de mariage.`,
    commentaire:
`La pièce qui donne son sens à toute la page : à 78 ans, l'arrière-arrière-
grand-père change officiellement de nom et de nationalité. La mention
marginale de la copie française du même acte écrit « Abdellah » ; celle-ci
écrit « Abdallah ». Les deux orthographes de mon prénom viennent de là.` },

  { id: "decret-ampliation",
    image: "origines/decret-ampliation.jpg",
    titre: "Le décret n° 4171, la pièce elle-même",
    date: "27 février 1965",
    lieu: "Alger, ministère de la Justice",
    transcription:
`République Algérienne Démocratique et Populaire. Ministère de la
Justice, direction des Affaires judiciaires, bureau de la Nationalité.
N° 4171/B.N. Décret de naturalisation. Le Président de la République,
Président du Conseil, sur le rapport du Ministre de la Justice, Garde
des Sceaux, vu la loi n° 63-96 du 27 mars 1963, portant Code de la
Nationalité Algérienne, notamment l'article 13, vu la demande formulée
par Monsieur MARTINEZ Bernard Joseph, décrète.
Article 1er : Est naturalisé algérien, dans les conditions de
l'article 13 du Code de la Nationalité Algérienne sus-visé, Monsieur
MARTINEZ Bernard Joseph, né le 27 mai 1886 à Aïn-Témouchent (Oran),
fils de MARTINEZ Bernard et de Maria MONTESINO, exerçant la profession
de maçon, demeurant à Maghnia, 33 rue de Martimprey.
Article 2 : M. MARTINEZ Bernard Joseph s'appellera désormais :
BENABDERRAHMANE Abd[a/e]llah.
Article 3 : Le Ministre de la Justice, Garde des Sceaux, est chargé de
l'exécution du présent décret, qui sera publié au Journal officiel de
la République Algérienne Démocratique et Populaire.
Fait à Alger, le 27 février 1965. Signé : A. Ben Bella. Pour
ampliation, le directeur des Affaires judiciaires, A. Derradji.`,
    releve: [
      { champ: "Nom d'origine", valeur: "Martinez Bernard Joseph, né le 27 mai 1886 à Aïn Témouchent", personnes: ["abdallah"] },
      { champ: "Filiation", valeur: "fils de Martinez Bernard et de Maria Montesino", personnes: ["martinez-pere", "montesinos-maria"] },
      { champ: "Profession et domicile", valeur: "maçon, 33 rue de Martimprey à Maghnia", personnes: ["abdallah"] },
      { champ: "Nouveau nom", valeur: "Benabderrahmane Abdallah, la voyelle du prénom étant disputée (voir la pièce suivante)", personnes: ["abdallah"] },
      { champ: "Signature", valeur: "Ahmed Ben Bella, président de la République", personnes: [] },
    ],
    contexte:
`Voici le décret lui-même, dont le registre de Marnia et le Journal
officiel ne donnaient que l'écho : l'ampliation, c'est-à-dire la copie
officielle délivrée à l'intéressé, conservée depuis par la famille. Il
porte la signature d'Ahmed Ben Bella, premier président de la
République algérienne, qui sera renversé quatre mois plus tard, le
19 juin 1965. La rue de Martimprey, du nom d'un général du Second
Empire, ancre l'adresse dans le Maghnia d'alors, où les noms de rues
français étaient encore en usage.`,
    commentaire:
`La pièce mère de toute la première partie de cette page : c'est elle
que le greffier de Marnia recopie en marge du registre, elle que le
Journal officiel du 12 mars 1965 imprime page 232. Et c'est sur elle
que la voyelle de mon prénom devient illisible.` },

  { id: "decret-lettre",
    image: "origines/decret-lettre.jpg",
    titre: "La lettre disputée : a ou e ?",
    date: "27 février 1965",
    lieu: "décret n° 4171, article 2",
    transcription:
`« M. MARTINEZ Bernard Joseph s'appellera désormais :
BENABDERRAHMANE Abd?llah. » Sur l'ampliation dactylographiée, la
voyelle centrale du prénom est un pâté d'encre : la frappe est trop
chargée pour trancher à l'œil entre Abdallah et Abdellah.`,
    releve: [
      { champ: "Lecture du Journal officiel (1965)", valeur: "Abdallah, en caractères d'imprimerie", personnes: ["abdallah"] },
      { champ: "Lecture de la copie de Nantes (2013)", valeur: "Abdellah, à la main, en marge de l'acte de 1940", personnes: ["abdallah"] },
      { champ: "Corrélation avec les a du décret", valeur: "95 % avec le a final du même mot", personnes: [] },
      { champ: "Corrélation avec les e du décret", valeur: "79 % au mieux", personnes: [] },
      { champ: "Verdict", valeur: "a probable, environ trois chances sur quatre", personnes: ["abdallah", "moi"] },
    ],
    contexte:
`Pour départager les deux lectures, la lettre en cause a été comparée
pixel par pixel aux autres lettres frappées par la même machine sur le
même décret : les glyphes sont binarisés, recadrés, ramenés à la même
taille, puis corrélés. Le pâté s'apparie à 95 % avec le a final du même
mot, frappé dans les mêmes conditions d'encrage, contre 79 % pour le
meilleur e du document : environ trois chances sur quatre pour le a. Le
Journal officiel, composé en imprimerie par un typographe qui avait le
décret sous les yeux, a lu Abdallah ; l'officier d'état civil de Nantes
qui recopiait la mention en 2013 a lu Abdellah. L'ambiguïté ne date pas
de moi : elle est dans la frappe d'origine.`,
    commentaire:
`Toute cette page est née d'une hésitation entre deux voyelles, et la
pièce fondatrice hésite elle-même : la machine à écrire du ministère a
frappé une lettre que personne ne peut lire avec certitude. Abdallah à
l'imprimerie d'Alger, Abdellah à l'état civil de Nantes, et moi entre
les deux.` },

  { id: "jo-1965-decret",
    image: "origines/jo-1965-decret.jpg",
    titre: "Le Journal officiel du 12 mars 1965",
    date: "12 mars 1965",
    lieu: "Journal officiel de la République algérienne, n° 21, page 232",
    transcription:
`Décrets du 27 février 1965 portant acquisition de la nationalité
algérienne. Par décrets en date du 27 février 1965 sont naturalisés
algériens et jouissent de tous les droits attachés à la qualité
d'Algérien, dans les conditions de l'article 13 de la loi n° 63-96 du
27 mars 1963 portant code de la nationalité algérienne : [...]
Martinez Bernard Joseph, né le 27 mai 1886 à Aïn-Temouchent (Oran),
qui s'appellera désormais, Benabderrahmane Abdallah, [...]`,
    releve: [
      { champ: "Publication", valeur: "JORA n° 21 du vendredi 12 mars 1965, page 232", personnes: ["abdallah"] },
      { champ: "Décision", valeur: "naturalisé algérien, s'appellera désormais Benabderrahmane Abdallah", personnes: ["abdallah"] },
    ],
    contexte:
`La version imprimée du décret dont la famille ne connaissait que la
mention manuscrite : la liste des naturalisés du 27 février 1965,
publiée deux semaines plus tard au Journal officiel. Autour de son nom,
d'autres Européens restés en Algérie font le même choix ce jour-là :
un Amblard devenu Abderrahmane, une Yvelin devenue Malika, une
Georgette, une Blanche, une Léa. Les archives du Journal officiel
algérien sont consultables en ligne sur joradp.dz.`,
    commentaire:
`Retrouver ce nom dans le journal imprimé de l'État, soixante ans
après, a été le moment le plus fort de cette enquête : la mention
manuscrite du livret et la page officielle disent exactement la même
chose, chacune de son côté de la Méditerranée.` },

  { id: "loi-1963",
    image: "origines/loi-1963.jpg",
    titre: "La loi qui a permis le choix",
    date: "27 mars 1963",
    lieu: "Journal officiel de la République algérienne, n° 18 du 2 avril 1963, page 307",
    transcription:
`Loi n° 63-96 du 27 mars 1963 portant code de la nationalité algérienne.
Art. 13. L'étranger qui en formule la demande peut acquérir la
nationalité algérienne à condition : 1° d'avoir sa résidence en Algérie
depuis 5 ans au moins au jour de la demande ; 2° d'avoir sa résidence
en Algérie au moment de la signature du décret accordant la
naturalisation ; 3° d'être majeur ; 4° d'être de bonne vie et mœurs et
de n'avoir fait l'objet d'aucune condamnation infamante ; 5° de
justifier de moyens d'existence suffisants ; 6° d'être sain de corps
et d'esprit. [...]
Art. 15. La naturalisation est accordée par décret. L'acte de
naturalisation pourra, à la demande de l'intéressé, modifier ses nom
et prénoms. Sur simple production de l'acte de naturalisation,
l'officier d'état civil rectifie sur ses registres toutes les mentions
relatives à la naturalisation et éventuellement aux nom et prénoms.`,
    releve: [
      { champ: "Article 13", valeur: "les conditions de la naturalisation, celles remplies par l'aïeul", personnes: ["abdallah"] },
      { champ: "Article 15", valeur: "le changement de nom se fait à la demande de l'intéressé", personnes: ["abdallah"] },
    ],
    contexte:
`Le texte fondateur cité par le décret. Son article 15 précise que la
modification du nom se fait « à la demande de l'intéressé » : devenir
Abdallah n'était pas une obligation de la loi, c'était sa demande. Et
la rectification portée à la main sur le registre de Marnia, celle que
la famille conserve, est exactement la procédure que cet article
décrit.`,
    commentaire:
`L'article 15 change la lecture de toute l'histoire : le prénom que je
porte n'a pas été imposé à mon aïeul, il l'a choisi.` },

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
    contexte:
`Dans l'Algérie coloniale, l'état civil distinguait les statuts :
l'acte précise les origines de chacun, et les unions entre un Européen
et une Algérienne musulmane étaient rares et socialement exposées. Ce
mariage de janvier 1940, entre un maçon de 53 ans issu de l'immigration
espagnole et une jeune femme de Marnia, en dit long sur la vie réelle
des quartiers populaires, loin des séparations officielles. La copie a
été délivrée en 2013 par le service central d'état civil de Nantes, qui
conserve les registres des Français nés hors de France.`,
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
    contexte:
`Le livret de famille, créé en France en 1877, suivait les familles
dans tous leurs actes. Celui-ci, imprimé pour le département d'Oran,
montre l'administration coloniale au quotidien : mêmes imprimés qu'en
métropole, mêmes tampons, pour une famille qui ne ressemblait à aucune
autre du registre.`,
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
    contexte:
`Trois enfants déclarés sous le patronyme espagnol Martinez, mais
avec des prénoms arabes : Benamar, Mostefa, Khadoudja. Dans l'Algérie
des années 1940, ce choix de prénoms pour les enfants d'un Européen et
d'une Algérienne musulmane annonce déjà, vingt-cinq ans avant le décret,
de quel côté la famille construisait sa vie.`,
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
    contexte:
`La carte du combattant est créée par la loi du 19 décembre 1926
pour les anciens de la Grande Guerre ; l'insigne de la Croix du
combattant, mentionné au verso, date du décret du 24 août 1930. Elle
ouvrait des droits concrets : retraite du combattant, emplois réservés,
tarifs spéciaux. La délivrer à Oran en 1936 à un maçon de Marnia, c'est
reconnaître vingt ans après sa part dans une guerre menée à des milliers
de kilomètres de chez lui.`,
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
    contexte:
`Les Européens d'Algérie étaient soumis à la conscription comme ceux
de métropole ; environ 155 000 d'entre eux furent mobilisés en 1914-1918,
aux côtés d'environ 173 000 Algériens musulmans. La classe 1907
correspond aux hommes nés en 1886-1887, atteints par la Grande Guerre à
la fin de la vingtaine. Le « service auxiliaire » désigne les hommes
jugés aptes aux tâches hors combat : dépôts, travaux, logistique.`,
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
    contexte:
`Les congés payés de 1936 et les allocations familiales furent
étendus par étapes aux territoires d'outre-mer : cette carte de la
Caisse sociale des travaux publics et du bâtiment en Algérie servait
précisément à faire valoir ces droits sur les chantiers. À soixante ans
passés, l'ancien combattant pose encore des murs.`,
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
    contexte:
`En 1962, l'immense majorité des Européens d'Algérie, près de huit
cent mille personnes, quitte le pays en quelques mois. Rester est un
choix rare. Ce carnet du ministère algérien des Finances, tamponné à
Alger en novembre 1963, montre un homme de 77 ans qui refait ses
démarches de pension dans l'administration du nouvel État, deux ans
avant sa naturalisation.`,
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
    contexte:
`La classe 1960 rassemble les jeunes gens nés en 1940. Mostefa est
appelé le 2 mars 1962 : les accords d'Évian sont signés le 18 mars, le
cessez-le-feu prend effet le lendemain. Son passage sous les drapeaux
français aura duré le temps de la fin d'une guerre, avant un retour
rapide dans ses foyers. Son livret porte encore le nom Martinez.`,
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
17 décembre de 14 h à 19 heures. » Texte bilingue français-arabe ;
la partie en arabe, qui reprend l'appel, a été lue avec un modèle en
ligne, l'atelier du site ne lisant pour l'instant que le français.`,
    releve: [
      { champ: "Mémoire familiale", valeur: "Mohamed Diab serait un parent de l'arrière-grand-mère Khadoudja, par la famille Diab de Marnia", personnes: ["diab-fatma", "khadoudja"] },
    ],
    contexte:
`Mohamed Diab, chauffeur-livreur algérien, père de quatre enfants,
installé à Versailles, est interpellé le 29 novembre 1972 à l'hôpital
où sa mère est soignée, parce qu'il refuse de quitter sa chambre.
Conduit au commissariat de la caserne de Noailles, il y est abattu par
le brigadier René Marquet, qui invoque la légitime défense ; les
récits divergent jusque sur l'arme, trois balles selon les uns, une
rafale de pistolet-mitrailleur selon la contre-enquête. Sa famille
refuse le silence : sa veuve Zara Diab témoigne au journal télévisé,
sa sœur Fatna lance l'appel reproduit ici, et le Comité de défense de
la vie et des droits des travailleurs immigrés publie sa
contre-enquête dès 1973. Une « semaine de deuil et d'action » culmine
les 16 et 17 décembre 1972 : la marche du 16, interdite, part quand
même de Bonne-Nouvelle vers Barbès ; Michel Foucault, Jean Genet et
Claude Mauriac y sont interpellés, et cent trente-sept personnalités,
dont Sartre et Simone de Beauvoir, signent l'appel. Le 30 mai 1980,
après sept ans et demi de procédure, le policier bénéficie d'un
non-lieu. Une affiche jumelle de celle-ci est conservée au Musée
national de l'histoire de l'immigration (cote 2009.14.01), la
contre-enquête de 1973 a été rééditée en 2017, et l'historien Philippe
Artières a consacré un livre à l'affaire en 2024, « À bout portant.
Versailles 1972 » (Gallimard).`,
    liens: [
      { titre: "Les images de 1972 et le témoignage de Zara Diab (INA)",
        url: "https://www.ina.fr/ina-eclaire-actu/video/s985812_001/racisme-dans-la-police-des-accusations-repetees-depuis-le-debut-des-annees-70" },
      { titre: "L'affiche de la semaine de deuil au Musée de l'histoire de l'immigration",
        url: "https://www.histoire-immigration.fr/collections/semaine-de-deuil-et-d-action" },
      { titre: "L'affaire Mohamed Diab racontée par le Musée (Google Arts et Culture)",
        url: "https://artsandculture.google.com/asset/l-affaire-mohamed-diab/0QE3JMr5wggSqA" },
      { titre: "La contre-enquête de 1973, « Vérité et justice pour Mohamed Diab », rééditée en 2017",
        url: "https://quartierslibres.wordpress.com/2017/04/08/le-livre-du-samedi-verite-et-justice-pour-mohamed-diab/" },
      { titre: "Philippe Artières, À bout portant. Versailles 1972 (Gallimard, 2024)",
        url: "https://books.google.fr/books/about/%C3%80_bout_portant_Versailles_1972.html?id=h74WEQAAQBAJ" },
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
