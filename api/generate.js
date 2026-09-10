export default async function handler(req, res) {
 if (req.method !== "POST") {
   return res.status(405).json({ error: "Méthode non autorisée" });
 }
 const { docType, activity, details } = req.body;
 const prompts = {
   description:
     "Rédige une description d'activité professionnelle claire et vendeuse (4-5 phrases), destinée à être utilisée sur un site, une facture ou un formulaire d'inscription en tant qu'auto-entrepreneur.",
   facture:
     "Rédige un modèle de facture texte pour auto-entrepreneur en France, avec toutes les mentions obligatoires (numéro de facture, date, coordonnées vendeur/client à remplir, désignation de la prestation, montant HT, mention TVA non applicable art. 293B du CGI, conditions de paiement). Utilise des crochets [Comme ça] pour les champs à remplir.",
   checklist:
     "Rédige une check-list concrète et actionnable (8 à 10 étapes numérotées) pour démarrer une activité d'auto-entrepreneur adaptée à ce secteur précis, de l'inscription jusqu'à la première vente.",
 };
 const systemPrompt =
   "Tu génères uniquement des MODÈLES vierges à personnaliser pour des auto-entrepreneurs (facture type, description d'activité générique, check-list). Règles strictes : n'invente jamais de vraies informations d'identité, de SIRET, de nom d'entreprise réel ou de montants réels — utilise uniquement des placeholders entre crochets comme [Nom du client]. Refuse et explique poliment si la demande vise à usurper l'identité d'un tiers, falsifier un document déjà existant, produire un document à valeur légale trompeuse, ou toute autre utilisation frauduleuse. Dans ce cas, réponds uniquement par : 'Je ne peux pas générer ce contenu, car il ressemble à une demande de document falsifié ou trompeur.'";
 try {
   const response = await fetch("https://api.anthropic.com/v1/messages", {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
       "x-api-key": process.env.ANTHROPIC_API_KEY,
       "anthropic-version": "2023-06-01",
     },
     body: JSON.stringify({
       model: "claude-sonnet-4-6",
       max_tokens: 1000,
       system: systemPrompt,
       messages: [
         {
           role: "user",
           content: `${prompts[docType]}\n\nActivité : ${activity}\n${
             details ? `Précisions supplémentaires : ${details}\n` : ""
           }\nRéponds uniquement avec le contenu du document, sans préambule ni commentaire, en français.`,
         },
       ],
     }),
   });
   const data = await response.json();
   const text = data.content.map((b) => b.text || "").join("\n");
   res.status(200).json({ text: text.trim() });
 } catch (err) {
   res.status(500).json({ error: "Erreur de génération" });
 }
}
Dispose d’un menu contextuel

