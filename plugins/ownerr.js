const fs = require("fs");
const { cmd, commands } = require('../command');
const config = require('../config');
const axios = require('axios');
const prefix = config.PREFIX;
const AdmZip = require("adm-zip");
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions2');
const { writeFileSync } = require('fs');
const path = require('path');




const OWNER_PATH = path.join(__dirname, "../lib/sudo.json");

// مطمئن شو فایل owner.json هست
const ensureOwnerFile = () => {
  if (!fs.existsSync(OWNER_PATH)) {
    fs.writeFileSync(OWNER_PATH, JSON.stringify([]));
  }
};

// افزودن شماره به owner.json
cmd({
    pattern: "setsudo",
    alias: ["addsudo"],
    desc: "Add a temporary owner",
    category: "owner",
    react: "👑",
    filename: __filename
}, async (conn, mek, m, { from, args, q, isCreator, reply, isOwner }) => {
    try {
        if (!isCreator) return reply("📛 *ᴄᴏᴍᴍᴀɴᴅ ʀᴇsᴇʀᴠᴇᴅ ғᴏʀ ᴏᴡɴᴇʀ ᴀɴᴅ ᴏɴʟʏ!*");

        // Target
        let target = m.mentionedJid?.[0] 
            || (m.quoted?.sender ?? null)
            || (args[0]?.replace(/[^0-9]/g, '') + "@s.whatsapp.net");

        if (!target) return reply("*ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ɴᴜᴍʙᴇʀ ᴏʀ ᴛᴀɢ/ʀᴇᴘʟʏ ᴀ ᴜsᴇʀ.*");

        let own = JSON.parse(fs.readFileSync("./lib/sudo.json", "utf-8"));

        if (own.includes(target)) {
            return reply("ᴛʜɪs ᴜsᴇʀ ɪs ᴀʟʀᴇᴀᴅʏ ᴀ ᴛᴇᴍᴘᴏʀᴀʀʏ ᴏᴡɴᴇʀ.");
        }

        own.push(target);
        const uniqueOwners = [...new Set(own)];
        fs.writeFileSync("./lib/sudo.json", JSON.stringify(uniqueOwners, null, 2));

        const dec = `✅ @${target.split("@")[0]} ʜᴀs ʙᴇᴇɴ ᴀᴅᴅᴇᴅ ᴀs ᴀ ᴛᴇᴍᴘᴏʀᴀʀʏ ᴏᴡɴᴇʀ`;

        await conn.sendMessage(from, {
            image: { url: config.MENU_IMAGE_URL },
            caption: dec,
            mentions: [target] // 🔥 Ceci active le tag du user
        }, { quoted: mek });

    } catch (err) {
        console.error(err);
        reply("❌ Error: " + err.message);
    }
});

// حذف شماره از owner.json
cmd({
    pattern: "delsudo",
    alias: ["sudodel"],
    desc: "Remove a temporary owner",
    category: "owner",
    react: "🫩",
    filename: __filename
}, async (conn, mek, m, { from, args, q, isCreator, reply, isOwner }) => {
    try {
        if (!isCreator) return reply("📛 *ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ʙʏ ᴍʏ ᴏᴡɴᴇʀ !*");

        let target = m.mentionedJid?.[0] 
            || (m.quoted?.sender ?? null)
            || (args[0]?.replace(/[^0-9]/g, '') + "@s.whatsapp.net");

        // اگر هیچ هدفی وارد نشده بود، پیام خطا بده
        if (!target) return reply("ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ɴᴜᴍʙᴇʀ ᴏʀ ᴛᴀɢ/ʀᴇᴘʟʏ ᴀ ᴜsᴇʀ.");

        let own = JSON.parse(fs.readFileSync("./lib/sudo.json", "utf-8"));

        if (!own.includes(target)) {
            return reply("❌ ᴜsᴇʀ ɴᴏᴛ ғᴏᴜɴᴅ ɪɴ ᴏᴡɴᴇʀ ʟɪsᴛ.");
        }

        const updated = own.filter(x => x !== target);
        fs.writeFileSync("./lib/sudo.json", JSON.stringify(updated, null, 2));

        const dec = "✅ sᴜᴄᴄᴇssғᴜʟʟʏ ʀᴇᴍᴏᴠᴇᴅ User ᴀs ᴛᴇᴍᴘᴏʀᴀʀʏ ᴏᴡɴᴇʀ";
        await conn.sendMessage(from, {  // استفاده از await در اینجا درست است
            image: { url: config.MENU_IMAGE_URL },
            caption: dec
        }, { quoted: mek });
    } catch (err) {
        console.error(err);
        reply("❌ Error: " + err.message);
    }
});

cmd({
    pattern: "getsudo",
    alias: ["listsudo"],
    desc: "List all temporary owners",
    category: "owner",
    react: "📋",
    filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply, isOwner }) => {
    try {
    if (!isCreator) return reply("📛 *ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ʙʏ ᴍʏ ᴏᴡɴᴇʀ !*");
        // Check if the user is the owner
        if (!isOwner) {
            return reply("❌ ʏᴏᴜ ᴀʀᴇ ɴᴏᴛ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ.");
        }

        // Read the owner list from the file and remove duplicates
        let own = JSON.parse(fs.readFileSync("./lib/sudo.json", "utf-8"));
        own = [...new Set(own)]; // Remove duplicates

        // If no temporary owners exist
        if (own.length === 0) {
            return reply("❌ ɴᴏ ᴛᴇᴍᴘᴏʀᴀʀʏ ᴏᴡɴᴇʀs ғᴏᴜɴᴅ.");
        }

        // Create the message with owner list
        let listMessage = "*ʟɪsᴛ ᴏғ ᴛᴇᴍᴘᴏʀᴀʀʏ ᴏᴡɴᴇʀs:*\n\n";
        own.forEach((owner, index) => {
            listMessage += `${index + 1}. ${owner.replace("@s.whatsapp.net", "")}\n`;
        });

        // Send the message with an image and formatted caption
        await conn.sendMessage(from, {
            image: { url: config.MENU_IMAGE_URL },
            caption: listMessage
        }, { quoted: mek });
    } catch (err) {
        // Handle errors
        console.error(err);
        reply("❌ Error: " + err.message);
    }
});

cmd({
    pattern: "block",
    desc: "Blocks a person",
    category: "owner",
    react: "🚫",
    filename: __filename
},
async (conn, m, { reply, q, react }) => {
    // Get the bot owner's number dynamically
    const botOwner = conn.user.id.split(":")[0] + "@s.whatsapp.net";
    
    if (m.sender !== botOwner) {
        await react("❌");
        return reply("ᴏɴʟʏ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");
    }

    let jid;
    if (m.quoted) {
        jid = m.quoted.sender; // If replying to a message, get sender JID
    } else if (m.mentionedJid.length > 0) {
        jid = m.mentionedJid[0]; // If mentioning a user, get their JID
    } else if (q && q.includes("@")) {
        jid = q.replace(/[@\s]/g, '') + "@s.whatsapp.net"; // If manually typing a JID
    } else {
        await react("❌");
        return reply("ᴘʟᴇᴀsᴇ ᴍᴇɴᴛɪᴏɴ ᴀ ᴜsᴇʀ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ ᴛʜᴇɪʀ ᴍᴇssᴀɢᴇ.");
    }

    try {
        await conn.updateBlockStatus(jid, "block");
        await react("✅");
        reply(`sᴜᴄᴄᴇssғᴜʟʟʏ ʙʟᴏᴄᴋᴇᴅ @${jid.split("@")[0]}`, { mentions: [jid] });
    } catch (error) {
        console.error("Block command error:", error);
        await react("❌");
        reply("Failed to block the user.");
    }
});

cmd({
    pattern: "unblock",
    desc: "Unblocks a person",
    category: "owner",
    react: "🔓",
    filename: __filename
},
async (conn, m, { reply, q, react }) => {
    // Get the bot owner's number dynamically
    const botOwner = conn.user.id.split(":")[0] + "@s.whatsapp.net";

    if (m.sender !== botOwner) {
        await react("❌");
        return reply("ᴏɴʟʏ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");
    }

    let jid;
    if (m.quoted) {
        jid = m.quoted.sender;
    } else if (m.mentionedJid.length > 0) {
        jid = m.mentionedJid[0];
    } else if (q && q.includes("@")) {
        jid = q.replace(/[@\s]/g, '') + "@s.whatsapp.net";
    } else {
        await react("❌");
        return reply("ᴘʟᴇᴀsᴇ ᴍᴇɴᴛɪᴏɴ ᴀ ᴜsᴇʀ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ ᴛʜᴇɪʀ ᴍᴇssᴀɢᴇ.");
    }

    try {
        await conn.updateBlockStatus(jid, "unblock");
        await react("✅");
        reply(`sᴜᴄᴄᴇssғᴜʟʟʏ ᴜɴʙʟᴏᴄᴋᴇᴅ @${jid.split("@")[0]}`, { mentions: [jid] });
    } catch (error) {
        console.error("Unblock command error:", error);
        await react("❌");
        reply("Failed to unblock the user.");
    }
});           

cmd({
    pattern: "mode",
    alias: ["setmode"],
    react: "🫟",
    desc: "Set bot mode to private or public.",
    category: "owner",
    filename: __filename,
}, async (conn, mek, m, { from, args, isCreator, reply, isOwner }) => {
    if (!isOwner && !isCreator) return reply("_*❗ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ʙʏ ᴍʏ ᴏᴡɴᴇʀ !*_");

    if (!args[0]) {
        const text = `> *𝐌𝐎𝐃𝐄 𝐒𝐄𝐓𝐓𝐈𝐍𝐆𝐒*\n\n> ᴄᴜʀʀᴇɴᴛ ᴍᴏᴅᴇ: *ᴘᴜʙʟɪᴄ*\n\nʀᴇᴘʟʏ ᴡɪᴛʜ:\n\n*1.* ᴛᴏ ᴇɴᴀʙʟᴇ ᴘᴜʙʟɪᴄ ᴍᴏᴅᴇ\n*2.* ᴛᴏ ᴇɴᴀʙʟᴇ ᴘʀɪᴠᴀᴛᴇ ᴍᴏᴅᴇ\n*3.* ᴛᴏ ᴇɴᴀʙʟᴇ ɪɴʙᴏx ᴍᴏᴅᴇ\n*4.* ᴛᴏ ᴇɴᴀʙʟᴇ ɢʀᴏᴜᴘs ᴍᴏᴅᴇ\n\n╭────────────────\n│ *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*\n╰─────────────────◆`;

        const sentMsg = await conn.sendMessage(from, {
            image: { url: config.MENU_IMAGE_URL },  // تصویر منوی مد
            caption: text
        }, { quoted: mek });

        const messageID = sentMsg.key.id;

        const handler = async (msgData) => {
            try {
                const receivedMsg = msgData.messages[0];
                if (!receivedMsg?.message || !receivedMsg.key?.remoteJid) return;

                const quoted = receivedMsg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                const quotedId = receivedMsg.message?.extendedTextMessage?.contextInfo?.stanzaId;

                const isReply = quotedId === messageID;
                if (!isReply) return;

                const replyText =
                    receivedMsg.message?.conversation ||
                    receivedMsg.message?.extendedTextMessage?.text ||
                    "";

                const sender = receivedMsg.key.remoteJid;

                let newMode = "";
                if (replyText === "1") newMode = "public";
                else if (replyText === "2") newMode = "private";
                else if (replyText === "3") newMode = "inbox";
                else if (replyText === "4") newMode = "groups";

                if (newMode) {
                    config.MODE = newMode;
                    await conn.sendMessage(sender, {
                        text: `✅ ʙᴏᴛ ᴍᴏᴅᴇ ɪs ɴᴏᴡ sᴇᴛ ᴛᴏ *${newMode.toUpperCase()}*.`
                    }, { quoted: receivedMsg });
                } else {
                    await conn.sendMessage(sender, {
                        text: "❌ ɪɴᴠᴀʟɪᴅ ᴏᴘᴛɪᴏɴ. ᴘʟᴇᴀsᴇ ʀᴇᴘʟʏ ᴡɪᴛʜ *1*, *2*, *3* or *4*."
                    }, { quoted: receivedMsg });
                }

                conn.ev.off("messages.upsert", handler);
            } catch (e) {
                console.log("Mode handler error:", e);
            }
        };

        conn.ev.on("messages.upsert", handler);

        setTimeout(() => {
            conn.ev.off("messages.upsert", handler);
        }, 600000);

        return;
    }

    const modeArg = args[0].toLowerCase();

    if (["public", "private", "inbox", "groups"].includes(modeArg)) {
      config.MODE = modeArg;
      return reply(`✅ ʙᴏᴛ ᴍᴏᴅᴇ ɪs ɴᴏᴡ sᴇᴛ ᴛᴏ *${modeArg.toUpperCase()}*.`);
    } else {
      return reply("❌ ɪɴᴠᴀʟɪᴅ ᴍᴏᴅᴇ. ᴘʟᴇᴀsᴇ ᴜsᴇ `.ᴍᴏᴅᴇ ᴘᴜʙʟɪᴄ`, `.ᴍᴏᴅᴇ ᴘʀɪᴠᴀᴛᴇ`, `.ᴍᴏᴅᴇ ɪɴʙᴏx`, ᴏʀ `.ᴍᴏᴅᴇ ɢʀᴏᴜᴘs`.");
    }
});

cmd({
    pattern: "auto-typing",
    alias: ["typing", "autotyping"],
    description: "Enable or disable auto-typing feature.",
    category: "owner",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply, isOwner }) => {
    if (!isOwner && !isCreator) return reply("_*❗ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ʙʏ ᴍʏ ᴏᴡɴᴇʀ !*_");

    const status = args[0]?.toLowerCase();
    if (!["on", "off"].includes(status)) {
        return reply("*🫟 ᴇxᴀᴍᴘʟᴇ:  .ᴀᴜᴛᴏ-ᴛʏᴘɪɴɢ ᴏɴ*");
    }

    config.AUTO_TYPING = status === "on" ? "true" : "false";
    return reply(`ᴀᴜᴛᴏ ᴛʏᴘɪɴɢ ʜᴀs ʙᴇᴇɴ ᴛᴜʀɴᴇᴅ ${status}.`);
});

//--------------------------------------------
// ALWAYS_ONLINE COMMANDS
//--------------------------------------------
cmd({
    pattern: "always-online",
    alias: ["alwaysonline"],
    desc: "Enable or disable the always online mode",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, args, isCreator, reply, isOwner }) => {
    if (!isOwner && !isCreator) return reply("_*❗ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ʙʏ ᴍʏ ᴏᴡɴᴇʀ !*_");

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.ALWAYS_ONLINE = "true";
        await reply("*✅ ᴀʟᴡᴀʏs ᴏɴʟɪɴᴇ ᴍᴏᴅᴇ ɪs now ᴇɴᴀʙʟᴇᴅ.*");
    } else if (status === "off") {
        config.ALWAYS_ONLINE = "false";
        await reply("*❌ ᴀʟᴡᴀʏs ᴏɴʟɪɴᴇ ᴍᴏᴅᴇ ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ.*");
    } else {
        await reply(`*🛠️ ᴇxᴀᴍᴘʟᴇ: .ᴀʟᴡᴀʏs-ᴏɴʟɪɴᴇ ᴏɴ*`);
    }
});

//--------------------------------------------
//  AUTO_RECORDING COMMANDS
//--------------------------------------------
cmd({
    pattern: "auto-recording",
    alias: ["autorecoding", "recording"],
    description: "Enable or disable auto-recording feature.",
    category: "owner",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply, isOwner }) => {
    if (!isOwner && !isCreator) return reply("_*❗ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ʙʏ ᴍʏ ᴏᴡɴᴇʀ !*_");

    const status = args[0]?.toLowerCase();
    if (!["on", "off"].includes(status)) {
        return reply("*🫟 ᴇxᴀᴍᴘʟᴇ: .ᴀᴜᴛᴏ-ʀᴇᴄᴏʀᴅɪɴɢ ᴏɴ*");
    }

    config.AUTO_RECORDING = status === "on" ? "true" : "false";
    if (status === "on") {
        await conn.sendPresenceUpdate("recording", from);
        return reply("ᴀᴜᴛᴏo ʀᴇᴄᴏʀᴅɪɴɢ ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ. ʙᴏᴛ ɪs ʀᴇᴄᴏʀᴅɪɴɢ...");
    } else {
        await conn.sendPresenceUpdate("available", from);
        return reply("ᴀᴜᴛᴏ ʀᴇᴄᴏʀᴅɪɴɢ ʜᴀs ʙᴇᴇɴ ᴅɪsᴀʙʟᴇᴅ.");
    }
});
//--------------------------------------------
// AUTO_VIEW_STATUS COMMANDS
//--------------------------------------------
cmd({
    pattern: "auto-seen",
    alias: ["autostatusview", "autoviewstatus"],
    desc: "Enable or disable auto-viewing of statuses",
    category: "owner",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply, isOwner }) => {
    if (!isOwner && !isCreator) return reply("_*❗ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ʙʏ ᴍʏ ᴏᴡɴᴇʀ !*_");

    const status = args[0]?.toLowerCase();
    // Default value for AUTO_VIEW_STATUS is "false"
    if (args[0] === "on") {
        config.AUTO_STATUS_SEEN = "true";
        return reply("ᴀᴜᴛᴏ-ᴠɪᴇᴡɪɴɢ ᴏғ sᴛᴀᴛᴜsᴇs ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ.");
    } else if (args[0] === "off") {
        config.AUTO_STATUS_SEEN = "false";
        return reply("ᴀᴜᴛᴏ-ᴠɪᴇᴡɪɴɢ ᴏғ sᴛᴀᴛᴜsᴇs ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ.");
    } else {
        return reply(`*🫟 ᴇxᴀᴍᴘʟᴇ:  .ᴀᴜᴛᴏ-sᴇᴇɴ ᴏɴ*`);
    }
}); 
//--------------------------------------------
// AUTO_LIKE_STATUS COMMANDS
//--------------------------------------------
cmd({
    pattern: "status-react",
    alias: ["statusreaction", "statusreact", "reactstatus", "react-status"],
    desc: "Enable or disable auto-liking of statuses",
    category: "owner",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply, isOwner }) => {
    if (!isOwner && !isCreator) return reply("_*❗ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ʙʏ ᴍʏ ᴏᴡɴᴇʀ !*_");

    const status = args[0]?.toLowerCase();
    // Default value for AUTO_LIKE_STATUS is "false"
    if (args[0] === "on") {
        config.AUTO_STATUS_REACT = "true";
        return reply("ᴀᴜᴛᴏ-ʟɪᴋɪɴɢ ᴏғ sᴛᴀᴛᴜsᴇs ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ.");
    } else if (args[0] === "off") {
        config.AUTO_STATUS_REACT = "false";
        return reply("ᴀᴜᴛᴏ-ʟɪᴋɪɴɢ ᴏғ sᴛᴀᴛᴜsᴇs ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ.");
    } else {
        return reply(`ᴇxᴀᴍᴘʟᴇ: . sᴛᴀᴛᴜs-ʀᴇᴀᴄᴛ ᴏɴ`);
    }
});

//--------------------------------------------
//  READ-MESSAGE COMMANDS
//--------------------------------------------
cmd({
    pattern: "read-message",
    alias: ["autoread"],
    desc: "enable or disable readmessage.",
    category: "owner",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply, isOwner }) => {
    if (!isOwner && !isCreator) return reply("_*❗ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ʙʏ ᴍʏ ᴏᴡɴᴇʀ !*_");

    const status = args[0]?.toLowerCase();
    // Check the argument for enabling or disabling the anticall feature
    if (args[0] === "on") {
        config.READ_MESSAGE = "true";
        return reply("ʀᴇᴀᴅᴍᴇssᴀɢᴇ ғᴇᴀᴛᴜʀᴇ ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ.");
    } else if (args[0] === "off") {
        config.READ_MESSAGE = "false";
        return reply("ʀᴇᴀᴅᴍᴇssᴀɢᴇ ғᴇᴀᴛᴜʀᴇ ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ.");
    } else {
        return reply(`_ᴇxᴀᴍᴘʟᴇ:  .ʀᴇᴀᴅᴍᴇssᴀɢᴇ ᴏɴ_`);
    }
});




//--------------------------------------------
//   AUTO-REACT COMMANDS
//--------------------------------------------
cmd({
    pattern: "auto-react",
    alias: ["autoreact"],
    desc: "Enable or disable the autoreact feature",
    category: "owner",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply, isOwner }) => {
    if (!isOwner && !isCreator) return reply("_*❗ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ʙʏ ᴍʏ ᴏᴡɴᴇʀ !*_");

    const status = args[0]?.toLowerCase();
    // Check the argument for enabling or disabling the anticall feature
    if (args[0] === "on") {
        config.AUTO_REACT = "true";
        await reply("*ᴀᴜᴛᴏʀᴇᴀᴄᴛ ғᴇᴀᴛᴜʀᴇ ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ ✔.*");
    } else if (args[0] === "off") {
        config.AUTO_REACT = "false";
        await reply("ᴀᴜᴛᴏʀᴇᴀᴄᴛ ғᴇᴀᴛᴜʀᴇ ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ.");
    } else {
        await reply(`*🫟 ᴇxᴀᴍᴘʟᴇ: .ᴀᴜᴛᴏ-ʀᴇᴀᴄᴛ ᴏɴ*`);
    }
});
//--------------------------------
//  STATUS-REPLY COMMANDS
//--------------------------------------------
cmd({
    pattern: "status-reply",
    alias: ["autostatusreply"],
    desc: "enable or disable status-reply.",
    category: "owner",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply, isOwner }) => {
    if (!isOwner && !isCreator) return reply("_*❗ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ʙʏ ᴍʏ ᴏᴡɴᴇʀ !*_");

    const status = args[0]?.toLowerCase();
    // Check the argument for enabling or disabling the anticall feature
    if (args[0] === "on") {
        config.AUTO_STATUS_REPLY = "true";
        return reply("sᴛᴀᴛᴜs-ʀᴇᴘʟʏ ғᴇᴀᴛᴜʀᴇ ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ.");
    } else if (args[0] === "off") {
        config.AUTO_STATUS_REPLY = "false";
        return reply("sᴛᴀᴛᴜs-ʀᴇᴘʟʏ ғᴇᴀᴛᴜʀᴇ ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ.");
    } else {
        return reply(`*🫟 ᴇxᴀᴍᴘʟᴇ:  .sᴛᴀᴛᴜs-ʀᴇᴘʟʏ ᴏɴ*`);
    }
});
//--------------------------------------------
//  ANTI-LINK COMMANDS
//--------------------------------------------
cmd({
  pattern: "antilink",
  desc: "Configure ANTILINK system with menu",
  category: "owner",
  react: "🛡️",
  filename: __filename
}, async (conn, mek, m, { isOwner, isCreator, reply }) => {
  if (!isOwner && !isCreator)
    return reply("_*❗ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ʙʏ ᴍʏ ᴏᴡɴᴇʀ !*_");

  const currentMode =
    config.ANTILINK_KICK === "true"
      ? "ʀᴇᴍᴏᴠᴇ/ᴋɪᴄᴋ"
      : config.ANTILINK_WARN === "true"
      ? "ᴡᴀʀɴ"
      : config.ANTILINK === "true"
      ? "ᴅᴇʟᴇᴛᴇ"
      : "ᴅɪsᴀʙʟᴇᴅ";

  const text = `> *𝐀𝐍ᴛɪʟɪɴᴋ 𝐒ᴇᴛᴛɪɴɢs*\n\n> ᴄᴜʀʀᴇɴᴛ ᴍᴏᴅᴇ: *${currentMode}*\n\nʀᴇᴘʟʏ ᴡɪᴛʜ:\n*1.* ᴡᴀʀɴ ⚠️\n*2.* ᴅᴇʟᴇᴛᴇ 🗑️\n*3.* ʀᴇᴍᴏᴠᴇ/ᴋɪᴄᴋ 🚫\n*4.* ᴅɪsᴀʙʟᴇ ᴀʟʟ ❌\n\n╭────────────────\n│ *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ*\n╰─────────────────◆`;

  const sentMsg = await conn.sendMessage(m.from, {
    image: { url: config.MENU_IMAGE_URL },
    caption: text
  }, { quoted: mek });

  const messageID = sentMsg.key.id;

  const handler = async (msgData) => {
    try {
      const receivedMsg = msgData.messages[0];
      if (!receivedMsg?.message || !receivedMsg.key?.remoteJid) return;
      const quotedId = receivedMsg.message?.extendedTextMessage?.contextInfo?.stanzaId;
      if (quotedId !== messageID) return;

      const replyText = receivedMsg.message?.conversation || receivedMsg.message?.extendedTextMessage?.text || "";
      const sender = receivedMsg.key.remoteJid;

      // Reset modes
      config.ANTILINK = "false";
      config.ANTILINK_WARN = "false";
      config.ANTILINK_KICK = "false";

      switch (replyText) {
        case "1":
          config.ANTILINK_WARN = "true";
          await conn.sendMessage(sender, { text: "✅ ᴀɴᴛɪʟɪɴᴋ 'ᴡᴀʀɴ' ᴇɴᴀʙʟᴇᴅ." }, { quoted: receivedMsg });
          break;
        case "2":
          config.ANTILINK = "true";
          await conn.sendMessage(sender, { text: "✅ ᴀɴᴛɪʟɪɴᴋ 'ᴅᴇʟᴇᴛᴇ' ᴇɴᴀʙʟᴇᴅ." }, { quoted: receivedMsg });
          break;
        case "3":
          config.ANTILINK_KICK = "true";
          await conn.sendMessage(sender, { text: "✅ ᴀɴᴛɪʟɪɴᴋ 'ʀᴇᴍᴏᴠᴇ/ᴋɪᴄᴋ' ᴇɴᴀʙʟᴇᴅ." }, { quoted: receivedMsg });
          break;
        case "4":
          await conn.sendMessage(sender, { text: "❌ ᴀʟʟ ᴀɴᴛɪʟɪɴᴋ ᴍᴏᴅᴇs ᴅɪsᴀʙʟᴇᴅ." }, { quoted: receivedMsg });
          break;
        default:
          await conn.sendMessage(sender, { text: "❌ ɪɴᴠᴀʟɪᴅ ᴏᴘᴛɪᴏɴ. ʀᴇᴘʟʏ ᴡɪᴛʜ 1, 2, 3, ᴏʀ 4." }, { quoted: receivedMsg });
      }

      conn.ev.off("messages.upsert", handler);
    } catch (err) {
      console.error("Antilink menu handler error:", err);
    }
  };

  conn.ev.on("messages.upsert", handler);
  setTimeout(() => conn.ev.off("messages.upsert", handler), 600000);
});

// --------------------
// ANTI-LINK MESSAGE HANDLER
// --------------------
cmd({
  on: "body"
}, async (conn, m, store, { from, body, sender, isGroup, isAdmins, isBotAdmins, reply }) => {
  if (!isGroup || isAdmins || !isBotAdmins) return;

  const linkPatterns = [
    /https?:\/\/(?:chat\.whatsapp\.com|wa\.me)\/\S+/gi,
    /wa\.me\/\S+/gi,
    /https?:\/\/(?:t\.me|telegram\.me)\/\S+/gi,
    /https?:\/\/(?:www\.)?youtube\.com\/\S+/gi,
    /https?:\/\/youtu\.be\/\S+/gi,
    /https?:\/\/(?:www\.)?facebook\.com\/\S+/gi,
    /https?:\/\/(?:www\.)?instagram\.com\/\S+/gi
  ];

  const containsLink = linkPatterns.some(p => p.test(body));

  if (!containsLink) return;

  if (config.ANTILINK === "true") {
    await conn.sendMessage(from, { delete: m.key }, { quoted: m });
    await conn.sendMessage(from, {
      text: `⚠️ ʏᴏ ʟɪɴᴋs ᴀʀᴇ ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ! @${sender.split("@")[0]}`,
      mentions: [sender]
    }, { quoted: m });
  } else if (config.ANTILINK_WARN === "true") {
    global.warnings = global.warnings || {};
    global.warnings[sender] = (global.warnings[sender] || 0) + 1;
    const count = global.warnings[sender];

    await conn.sendMessage(from, { delete: m.key }, { quoted: m });
    if (count < 4) {
      await conn.sendMessage(from, {
        text: `⚠️ ʏᴏ ᴡᴀʀɴɪɴɢ!\n*ᴜsᴇʀ:* @${sender.split("@")[0]}\n*ᴄᴏᴜɴᴛ:* ${count}/4\n*ʀᴇᴀsᴏɴ:* ʟɪɴᴋ sᴇɴᴅɪɴɢ`,
        mentions: [sender]
      });
    } else {
      await conn.sendMessage(from, {
        text: `🚫 ʏᴏ @${sender.split("@")[0]} ʜᴀs ʙᴇᴇɴ ʀᴇᴍᴏᴠᴇᴅ - ᴡᴀʀɴ ʟɪᴍɪᴛ ᴇxᴄᴇᴇᴅᴇᴅ!`,
        mentions: [sender]
      });
      await conn.groupParticipantsUpdate(from, [sender], "remove");
      delete global.warnings[sender];
    }
  } else if (config.ANTILINK_KICK === "true") {
    await conn.sendMessage(from, { delete: m.key }, { quoted: m });
    await conn.sendMessage(from, {
      text: `🚫 ʏᴏ ʟɪɴᴋs ᴀʀᴇ ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ! @${sender.split("@")[0]} ʜᴀs ʙᴇᴇɴ ʀᴇᴍᴏᴠᴇᴅ`,
      mentions: [sender]
    }, { quoted: m });
    await conn.groupParticipantsUpdate(from, [sender], "remove");
  }
});

// --------------------
// ANTI-BAD WORDS COMMAND
// --------------------
cmd({
  pattern: "anti-bad",
  alias: ["antibadword"],
  desc: "Enable or disable antibad.",
  category: "owner",
  filename: __filename
}, async (conn, mek, m, { args, isOwner, isCreator, reply }) => {
  if (!isOwner && !isCreator)
    return reply("_*❗ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ʙʏ ᴍʏ ᴏᴡɴᴇʀ !*_");

  const status = args[0]?.toLowerCase();
  if (status === "on") {
    config.ANTI_BAD_WORD = "true";
    return reply("✅ ʏᴏ ᴀɴᴛɪ-ʙᴀᴅ ᴡᴏʀᴅs ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ.");
  } else if (status === "off") {
    config.ANTI_BAD_WORD = "false";
    return reply("❌ ʏᴏ ᴀɴᴛɪ-ʙᴀᴅ ᴡᴏʀᴅs ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ.");
  } else {
    return reply("_ᴇxᴀᴍᴘʟᴇ: .antibad on_");
  }
});

// --------------------
// ANTI-BAD WORDS MESSAGE HANDLER
// --------------------
cmd({
  on: "body"
}, async (conn, m, store, { from, body, isGroup, isAdmins, isBotAdmins, reply }) => {
  if (!isGroup || isAdmins || !isBotAdmins) return;
  if (config.ANTI_BAD_WORD !== "true") return;

  const badWords = new Set(["wtf","mia","xxx","fuck","sex","huththa","pakaya","ponnaya","hutto"]);
  const messageText = body.toLowerCase();
  const containsBadWord = messageText.split(/\s+/).some(word => badWords.has(word));

  if (containsBadWord) {
    await conn.sendMessage(from, { delete: m.key }, { quoted: m });
    await conn.sendMessage(from, { text: "🚫⚠️ ʏᴏ ʙᴀᴅ ᴡᴏʀᴅs ᴀʀᴇ ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ!" }, { quoted: m });
  }
});
