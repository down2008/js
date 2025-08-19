const { cmd } = require('../command');
const axios = require('axios');
const franc = require('franc-min');

// Conversion ISO639-3 → ISO639-1 (basique)
const langMap = {
  fra: 'fr', eng: 'en', spa: 'es', deu: 'de', ita: 'it',
  por: 'pt', rus: 'ru', tur: 'tr', ara: 'ar', jpn: 'ja', kor: 'ko'
};

// util: coupe un long texte en messages WhatsApp safe
function splitLong(txt, size = 3000) {
  if (!txt || txt.length <= size) return [txt];
  const parts = [];
  for (let i = 0; i < txt.length; i += size) parts.push(txt.slice(i, i + size));
  return parts;
}

cmd({
  pattern: 'marc',
  desc: 'Discute avec ton IA',
  category: 'ai',
  react: '🤖',
  filename: __filename
}, async (conn, mek, m, { q }) => {
  if (!q) return m.reply('❌ Donne un texte après `.ai`');

  // présence "en train d’écrire"
  await conn.sendPresenceUpdate?.('composing', m.chat).catch(() => {});

  try {
    // Détection automatique de la langue
    const iso639_3 = franc(q) || 'fra';
    const lang = langMap[iso639_3] || 'fr'; // défaut FR

    // Appel API
    const res = await axios.post(
      'https://chat.vezxa.com/v1/chat',
      { prompt: q, max_tokens: 200 },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': lang
        },
        timeout: 20000 // 20s
      }
    );

    const data = res.data || {};
    const reply = data.reply || data.message || '❌ Pas de réponse reçue.';

    // Envoie en plusieurs messages si c’est long
    for (const part of splitLong(reply)) {
      await m.reply(part);
    }

  } catch (e) {
    // Log détaillé serveur
    const apiErr = e?.response?.data;
    console.error('Erreur API .ai =>', apiErr || e.message);

    // Message utilisateur propre
    let msg = '⚠️ Erreur API, réessaye plus tard.';
    if (apiErr?.details) msg = '⚠️ ' + apiErr.details;
    else if (apiErr?.error) msg = '⚠️ ' + apiErr.error;

    await m.reply(msg);
  } finally {
    await conn.sendPresenceUpdate?.('paused', m.chat).catch(() => {});
  }
});
