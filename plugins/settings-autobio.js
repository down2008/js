const { cmd } = require('../command');
const config = require('../config');

let bioInterval;
const defaultBio = "⚡ 𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍 𝐌𝐃 | 𝐎𝐍𝐋𝐈𝐍𝐄 🕒 {time}";
const timeZone = 'America/Port-au-Prince';

cmd({
    pattern: "autobio",
    alias: ["autoabout"],
    desc: "Toggle automatic bio updates",
    category: "misc",
    filename: __filename,
    usage: `${config.PREFIX}autobio [on/off]`
}, async (conn, mek, m, { args, reply, isOwner }) => {
    if (!isOwner) return reply("❌ ᴏɴʟʏ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ");

    const [action, ...bioParts] = args;
    const customBio = bioParts.join(' ');

    try {
        if (action === 'on') {
            if (config.AUTO_BIO === "true") {
                return reply("ℹ️ ᴀᴜᴛᴏ-ʙɪᴏ ɪs ᴀʟʀᴇᴀᴅʏ ᴇɴᴀʙʟᴇᴅ");
            }

            // Update config
            config.AUTO_BIO = "true";
            if (customBio) {
                // Store custom bio in memory only (not in env)
                config.AUTO_BIO_TEXT = customBio;
            } else {
                config.AUTO_BIO_TEXT = defaultBio;
            }

            // Start updating bio
            startAutoBio(conn, config.AUTO_BIO_TEXT);
            return reply(`✅ ᴀᴜᴛᴏ-ʙɪᴏ ᴇɴᴀʙʟᴇᴅ\nᴄᴜʀʀᴇɴᴛ ᴛᴇxᴛ: "${config.AUTO_BIO_TEXT}"`);

        } else if (action === 'off') {
            if (config.AUTO_BIO !== "true") {
                return reply("ℹ️ ᴀᴜᴛᴏ-ʙɪᴏ ɪs ᴀʟʀᴇᴀᴅʏ ᴅɪsᴀʙʟᴇᴅ");
            }
            
            // Update config
            config.AUTO_BIO = "false";
            
            // Stop updating bio
            stopAutoBio();
            return reply("✅ ᴀᴜᴛᴏ-ʙɪᴏ ᴅɪsᴀʙʟᴇᴅ");

        } else {
            return reply(`ᴜsᴀɢᴇ:\n` +
                `${config.PREFIX}autobio on [text] - ᴇɴᴀʙʟᴇ ᴡɪᴛʜ ᴏᴘᴛɪᴏɴᴀʟ ᴄᴜsᴛᴏᴍ ᴛᴇxᴛ\n` +
                `${config.PREFIX}autobio off - ᴅɪsᴀʙʟᴇ ᴀᴜᴛᴏ-ʙɪᴏ\n\n` +
                `ᴀᴠᴀɪʟᴀʙʟᴇ ᴘʟᴀᴄᴇʜᴏʟᴅᴇʀs:\n` +
                `{time} - ᴄᴜʀʀᴇɴᴛ ᴛɪᴍᴇ\n` +
                `ᴄᴜʀʀᴇɴᴛ sᴛᴀᴛᴜs: ${config.AUTO_BIO === "true" ? 'ON' : 'OFF'}\n` +
                `ᴄᴜʀʀᴇɴᴛ ᴛᴇxᴛ: "${config.AUTO_BIO_TEXT || defaultBio}"`);
        }
    } catch (error) {
        console.error('Auto-bio error:', error);
        return reply("❌ Failed to update auto-bio settings");
    }
});

// Start auto-bio updates
function startAutoBio(conn, bioText) {
    stopAutoBio(); // Clear any existing interval
    
    bioInterval = setInterval(async () => {
        try {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { timeZone });
            const formattedBio = bioText.replace('{time}', timeString);
            await conn.updateProfileStatus(formattedBio);
        } catch (error) {
            console.error('Bio update error:', error);
            stopAutoBio();
        }
    }, 10 * 1000);
}

// Stop auto-bio updates
function stopAutoBio() {
    if (bioInterval) {
        clearInterval(bioInterval);
        bioInterval = null;
    }
}

// Initialize auto-bio if enabled in config
module.exports.init = (conn) => {
    if (config.AUTO_BIO === "true") {
        const bioText = config.AUTO_BIO_TEXT || defaultBio;
        startAutoBio(conn, bioText);
    }
};
