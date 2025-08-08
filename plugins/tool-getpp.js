// SHONU X MD 🤍
// GET PP PLUGINS 💥
//======SUCCESS ========
//=================
//=====================
const { cmd } = require('../command');
const config = require('../config');


cmd({
    pattern: "getpp",
    alias: ["stealpp"],
    react: "🖼️",
    desc: "Sends the profile picture of a user by phone number (owner only)",
    category: "owner",
    use: ".getpp <phone number>",
    filename: __filename
},
async (conn, mek, m, { from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        // Check if the user is the bot owner
        if (!isOwner) return reply("🛑 ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴏɴʟʏ ғᴏʀ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ!");

        // Check if a phone number is provided
        if (!args[0]) return reply("🔥 ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴘʜᴏɴᴇ ɴᴜᴍʙᴇʀ (e.g., .ɢᴇᴛᴘᴘ 1234567890)");

        // Format the phone number to JID
        let targetJid = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";

        // Get the profile picture URL
        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(targetJid, "image");
        } catch (e) {
            return reply("🖼️ ᴛʜɪs ᴜsᴇʀ ʜᴀs ɴᴏ ᴘʀᴏғɪʟᴇ ᴘɪᴄᴛᴜʀᴇ ᴏʀ ɪᴛ ᴄᴀɴɴᴏᴛ ʙᴇ ᴀᴄᴄᴇssᴇᴅ!");
        }

        // Get the user's name or number for the caption
        let userName = targetJid.split("@")[0]; // Default to phone number
        try {
            const contact = await conn.getContact(targetJid);
            userName = contact.notify || contact.vname || userName;
        } catch {
            // Fallback to phone number if contact info is unavailable
        }

        // Send the profile picture
        await conn.sendMessage(from, { 
            image: { url: ppUrl }, 
            caption: `📌 ᴘʀᴏғɪʟᴇ ᴘɪᴄᴛᴜʀᴇ ᴏғ ${userName}` 
        });

        // Send a reaction to the command message
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (e) {
        // Reply with a generic error message and log the error
        reply("🛑 An error occurred while fetching the profile picture! Please try again later.");
        l(e); // Log the error for debugging
    }
});
