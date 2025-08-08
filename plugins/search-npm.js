const axios = require("axios");
const { cmd } = require("../command");

cmd({
    pattern: "npm",
    alias: ["npmpkg", "npmsearch"],
    react: "📦",
    desc: "Search for NPM packages",
    category: "search",
    use: ".npm <package-name>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀɴ ɴᴘᴍ ᴘᴀᴄᴋᴀɢᴇ ɴᴀᴍᴇ!");

        const processingMsg = await reply("🔍 sᴇᴀʀᴄʜɪɴɢ ɴᴘᴍ ʀᴇɢɪsᴛʀʏ...");

        const apiUrl = `https://api.giftedtech.web.id/api/search/npmsearch?apikey=gifted&packagename=${encodeURIComponent(q)}`;
        const response = await axios.get(apiUrl, { timeout: 10000 });

        if (!response.data?.success || !response.data?.result) {
            return reply("❌ ᴘᴀᴄᴋᴀɢᴇ ɴᴏᴛ ғᴏᴜɴᴅ ᴏʀ ᴀᴘɪ ᴇʀʀᴏʀ");
        }

        const pkg = response.data.result;
        
        let message = `📦 \`𝐍𝐏𝐌 𝐏𝐀𝐂𝐊𝐀𝐆𝐄 𝐈𝐍𝐅𝐎\` \n\n` +
                     `✨ *ɴᴀᴍᴇ:* ${pkg.name || "N/A"}\n` +
                     `📝 *ᴅᴇsᴄʀɪᴘᴛɪᴏɴ:* ${pkg.description || "N/A"}\n` +
                     `🏷️ *ᴠᴇʀsɪᴏɴ:* ${pkg.version || "N/A"}\n` +
                     `📅 *ᴘᴜʙʟɪsʜᴇᴅ:* ${pkg.publishedDate || "N/A"}\n` +
                     `👤 *ᴏᴡɴᴇʀ:* ${pkg.owner || "N/A"}\n` +
                     `📜 *ʟɪᴄᴇɴsᴇ:* ${pkg.license || "N/A"}\n\n` +
                     `🔗 *ᴘᴀᴄᴋᴀɢᴇ ʟɪɴᴋ:* ${pkg.packageLink || "N/A"}\n` +
                     `🏠 *ʜᴏᴍᴇᴘᴀɢᴇ:* ${pkg.homepage || "N/A"}\n` +
                     `📥 *ᴅᴏᴡɴʟᴏᴀᴅ:* ${pkg.downloadLink || "N/A"}\n\n`;

        if (pkg.keywords?.length > 0) {
            message += `🏷️ *ᴋᴇʏᴡᴏʀᴅs:* ${pkg.keywords.join(", ")}\n`;
        }

        message += `\n> ɢᴇɴᴇʀᴀᴛᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ`;

        // Send the result
        await conn.sendMessage(from, { 
            text: message,
            contextInfo: {
                externalAdReply: {
                    title: pkg.name,
                    body: pkg.description || "NPM package",
                    thumbnail: await (await axios.get('https://files.catbox.moe/w1l8b0.jpg', { responseType: 'arraybuffer' })).data,
                    sourceUrl: pkg.packageLink || "https://www.npmjs.com"
                }
            }
        }, { quoted: mek });

        // Delete processing message
        await conn.sendMessage(from, { delete: processingMsg.key });

    } catch (error) {
        console.error("NPM search error:", error);
       // reply(`❌ Error: ${error.response?.status === 404 ? "Package not found" : "Search failed"}`);
    }
});
