// Web Worker du mode Navigateur : le modèle tourne ici, hors du fil
// principal, pour que la page reste réactive (et que le bouton
// Interrompre fonctionne) pendant le téléchargement et la génération.

const CHAMPS = [
  'date_mariage', 'lieu_mariage',
  'nom_prenom_marie', 'profession_marie', 'adresse_marie',
  'nom_prenom_mariee', 'profession_mariee', 'adresse_mariee',
  'nom_pere_marie', 'profession_pere_marie',
  'nom_mere_marie', 'profession_mere_marie',
  'nom_pere_mariee', 'profession_pere_mariee',
  'nom_mere_mariee', 'profession_mere_mariee',
];

const PROMPT = `Tu es un expert en paléographie et en état civil français.
Cette image est une page d'un registre d'actes de mariage parisien (début XXe siècle),
rédigée à la main. Transcris l'acte puis extrais les informations suivantes.

Réponds UNIQUEMENT avec un objet JSON (sans texte autour) contenant exactement ces clés :
${JSON.stringify(CHAMPS, null, 2)}

Si une information est absente ou illisible, mets null. N'invente rien.`;

let t = null;
let moteur = null;
let arret = null;

self.onmessage = async (evenement) => {
  const message = evenement.data;

  if (message.type === 'interrompre') {
    if (arret) arret.interrupt();
    return;
  }
  if (message.type !== 'lit') return;

  try {
    if (!t) {
      t = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.1');
    }
    if (!moteur) {
      const idModele = 'onnx-community/Qwen2-VL-2B-Instruct';
      const progres = p => {
        if (p.status === 'progress' && p.file && p.total) {
          self.postMessage({ type: 'progres', fichier: p.file,
                             recu: p.loaded || 0, total: p.total });
        }
      };
      const processor = await t.AutoProcessor.from_pretrained(idModele,
                          { progress_callback: progres });
      // fp16 pour la vision et les embeddings, q4f16 pour le décodeur : la
      // quantification q4 uniforme dégrade l'encodeur vision de Qwen2-VL.
      const model = await t.Qwen2VLForConditionalGeneration.from_pretrained(idModele,
                          { dtype: { embed_tokens: 'fp16', vision_encoder: 'fp16',
                                     decoder_model_merged: 'q4f16' },
                            device: 'webgpu', progress_callback: progres });
      moteur = { processor, model };
      self.postMessage({ type: 'pret' });
    }

    const { processor, model } = moteur;
    let image = await t.RawImage.fromURL(message.dataUrl);
    // Qwen2-VL est à résolution dynamique : sans borne, un feuillet de 1600 px
    // produit environ 2500 tokens visuels. On limite le grand côté à 784 px
    // (multiple de 28) pour contenir la mémoire GPU et la latence.
    const COTE_MAX = 784;
    const ratio = COTE_MAX / Math.max(image.width, image.height);
    if (ratio < 1) {
      image = await image.resize(Math.round(image.width * ratio),
                                 Math.round(image.height * ratio));
    }

    const conversation = [{ role: 'user',
      content: [{ type: 'image' }, { type: 'text', text: PROMPT }] }];
    const texte = processor.apply_chat_template(conversation, { add_generation_prompt: true });
    const entrees = await processor(texte, image);
    const streamer = new t.TextStreamer(processor.tokenizer, {
      skip_prompt: true,
      skip_special_tokens: true,
      callback_function: morceau => self.postMessage({ type: 'morceau', texte: morceau }),
    });
    arret = new t.InterruptableStoppingCriteria();
    await model.generate({ ...entrees, max_new_tokens: 512, streamer,
                           stopping_criteria: arret });
    self.postMessage({ type: 'fini', interrompu: arret.interrupted === true });
    arret = null;
  } catch (erreur) {
    self.postMessage({ type: 'erreur',
                       message: String((erreur && erreur.message) || erreur) });
  }
};
