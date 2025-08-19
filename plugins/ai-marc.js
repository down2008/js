const { cmd } = require('../command');
const axios = require("axios");
const franc = require("franc-min");

// ISO639‑3 -> ISO639‑1 (basique)
const langMap = {
  fra: "fr", eng: "en", spa: "es", deu: "de", ita: "it",
  por: "pt", rus: "ru", tur: "tr", ara: "ar", jpn: "ja", kor: "ko",
  hin: "hi", ben: "bn", urd: "ur", tam: "ta", ind: "id", vie: "vi"
};

// Découper un long texte pour WhatsApp
function chunk(text, size = 3500) {
  const out = [];
  for (let i = 0; i < text.length; i += size) out.push(text.slice(i, i + size));
  return out;
}

cmd({
  pattern: "ai",
  desc: "Discute avec ton IA",
  category: "AI",
  react: "🤖",
  filename: __filename
}, async (conn, mek, m, { q }) => {
  if (!q) return m.reply("❌ Donne un texte après `.ai`");

  // 1) Détection langue
  let iso3 = franc(q) || "und";
  let lang = langMap[iso3] || (/^[a-zA-Z0-9\s.,?!'"`]/.test(q) ? "en" : "fr"); // fallback
  try {
    // 2) Appel API (avec retry simple)
    const call = async () => axios.post(
      "https://chat.vezxa.com/v1/chat",
      { prompt: q },
      {
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": lang
        },
        timeout: 15000
      }
    );

    let res;
    try {
      res = await call();
    } catch (e) {
      // Retry une fois si timeout / 5xx / network
      if (e.code === "ECONNABORTED" || (e.response && e.response.status >= 500)) {
        res = await call();
      } else {
        throw e;
      }
    }

    const reply =
      (res.data && (res.data.reply || res.data.message)) ||
      "❌ Pas de réponse reçue.";

    // 3) Envoi en morceaux si nécessaire
    for (const part of chunk(reply)) {
      await m.reply(part);
    }
  } catch (e) {
    const details = e.response?.data
      ? `\n\nDétails: ${JSON.stringify(e.response.data).slice(0, 800)}`
      : "";
    console.error("Erreur API .ai:", e.message, details);
    await m.reply("⚠️ Erreur API, réessaye plus tard." + details);
  }
});
