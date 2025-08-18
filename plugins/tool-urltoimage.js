const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "getimage",
    alias: ["tophoto","url2image","urltoimage"],
    desc: "Convert image URL to WhatsApp image",
    alias: ["imagefromurl", "fetchimage"],
    category: "media",
    react: "🖼️",
    filename: __filename
}, async (conn, mek, m, { from, reply, text }) => {
    try {
        if (!text) return reply('Please ᴘʀᴏᴠɪᴅᴇ ᴀɴ ɪᴍᴀɢᴇ ᴜʀʟ\nᴇxᴀᴍᴘʟᴇ: !ɢᴇᴛɪᴍᴀɢᴇ https://example.com/image.jpg');

        const imageUrl = text.trim();

        // Validate URL
        if (!imageUrl.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)) {
            return reply('❌ ɪɴᴠᴀʟɪᴅ ɪᴍᴀɢᴇ ᴜʀʟ! ᴍᴜsᴛ ʙᴇ ᴅɪʀᴇᴄᴛ ʟɪɴᴋ ᴛᴏ ɪᴍᴀɢᴇ (ᴊᴘɢ/ᴘɴɢ/ɢɪғ/ᴡᴇʙᴘ)');
        }

        // Verify the image exists
        try {
            const response = await axios.head(imageUrl);
            if (!response.headers['content-type']?.startsWith('image/')) {
                return reply('❌ ᴜʀʟ ᴅᴏᴇs ɴᴏᴛ ᴘᴏɪɴᴛ ᴛᴏ ᴀ ᴠᴀʟɪᴅ ɪᴍᴀɢᴇ');
            }
        } catch (e) {
            return reply('❌ ᴄᴏᴜʟᴅ ɴᴏᴛ ᴀᴄᴄᴇss ɪᴍᴀɢᴇ ᴜʀʟ. ᴘʟᴇᴀsᴇ ᴄʜᴇᴄᴋ ᴛʜᴇ ʟɪɴᴋ');
        }

        // Send the image
        await conn.sendMessage(from, {
            image: { url: imageUrl },
            caption: 'ʜᴇʀᴇ ɪs ʏᴏᴜʀ ɪᴍᴀɢᴇ ғʀᴏᴍ ᴛʜᴇ ᴜʀʟ'
        }, { quoted: mek });

    } catch (error) {
        console.error('GetImage Error:', error);
        reply('❌ Failed to process image. Error: ' + error.message);
    }
});
