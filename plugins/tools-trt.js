const config = require('../config')
const { cmd } = require('../command')
const axios = require("axios")

cmd({
    pattern: "trt",
    alias: ["translate", "trad"],
    desc: "🌍 Translate any text into English",
    react: "⚡",
    category: "convert",
    filename: __filename
},
async (conn, mek, m, { q, reply }) => {
    try {
        // Case 1: user replies to a message
        if (m.quoted) {
            const textToTranslate = m.quoted.text;
            if (!textToTranslate) return reply("❗ ᴛʜᴇ ʀᴇᴘʟɪᴇᴅ ᴍᴇssᴀɢᴇ ʜᴀs ɴᴏ ᴛᴇxᴛ.");

            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=auto|en`;
            const response = await axios.get(url);
            const translation = response.data.responseData.translatedText;

            return reply(translation);
        }

        // Case 2: direct text
        if (!q) return reply("❗ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴍᴇssᴀɢᴇ.\n\nUsage: `.ᴛʀᴛ ʜᴇʟʟᴏ ᴡᴏʀʟᴅ`");

        const textToTranslate = q;
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=auto|en`;
        const response = await axios.get(url);
        const translation = response.data.responseData.translatedText;

        return reply(translation);

    } catch (e) {
        console.log(e);
        return reply("⚠️ Error while translating, please try again later 🤕");
    }
});
