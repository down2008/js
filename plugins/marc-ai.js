const { cmd } = require('../command');
const axios = require("axios");
const franc = require("franc-min"); 

// Conversion ISO639-3 → ISO639-1 (basique)
const langMap = {
    fra: "fr",
    eng: "en",
    spa: "es",
    deu: "de",
    ita: "it",
    por: "pt",
    rus: "ru",
    tur: "tr",
    ara: "ar",
    jpn: "ja",
    kor: "ko"
};

cmd({
    pattern: "marc",
    desc: "Discute avec ton IA",
    category: "AI",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { q }) => {
    if (!q) return m.reply("❌ Donne un texte après `.ai`");

    try {
        // Détection automatique de la langue
        let langDetected = franc(q);
        let lang = langMap[langDetected] || "fr"; // défaut FR

        // Appel API avec timeout
        let res = await axios.post("https://chat.vezxa.com/v1/chat", {
            prompt: q
        }, { 
            headers: { 
                "Content-Type": "application/json", 
                "Accept-Language": lang 
            },
            timeout: 15000 // 15 sec max
        });

        let reply = res.data.reply || res.data.message || "❌ Pas de réponse reçue.";

        await m.reply(reply);

    } catch (e) {
        console.error("Erreur API .ai:", e.message);
        await m.reply("⚠️ Erreur API, réessaye plus tard.");
    }
});
