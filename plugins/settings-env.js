const { cmd, commands } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;
const fs = require('fs');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions');
const { writeFileSync } = require('fs');
const path = require('path');

let antilinkAction = "off"; // Default state
let warnCount = {}; // Track warnings per user

const os = require('os');
const { exec } = require('child_process');
const axios = require('axios');
const FormData = require('form-data');

let antibotAction = "off"; // Default action is off
let warnings = {}; // Store warning counts per user


cmd({
    pattern: "welcome",
    alias: ["setwelcome"],
    react: "✅",
    desc: "Enable or disable welcome messages for new members",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, args, isCreator, reply }) => {
    if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.WELCOME = "true";
        return reply("✅ ᴡᴇʟᴄᴏᴍᴇ ᴍᴇssᴀɢᴇs ᴀʀᴇ ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ.");
    } else if (status === "off") {
        config.WELCOME = "false";
        return reply("❌ ᴡᴇʟᴄᴏᴍᴇ ᴍᴇssᴀɢᴇs ᴀʀᴇ ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ.");
    } else {
        return reply(`ᴇxᴀᴍᴘʟᴇ: .ᴡᴇʟᴄᴏᴍᴇ ᴏɴ`);
    }
});


// WELCOME
cmd({
    pattern: "goodbye",
    alias: ["setgoodbye"],
    react: "✅",
    desc: "Enable or disable welcome messages for new members",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, args, isCreator, reply }) => {
    if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.GOODBYE = "true";
        return reply("✅ ɢᴏᴏᴅʙʏᴇ ᴍᴇssᴀɢᴇs ᴀʀᴇ ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ.");
    } else if (status === "off") {
        config.GOODBYE = "false";
        return reply("❌ ɢᴏᴏᴅʙʏᴇ ᴍᴇssᴀɢᴇs ᴀʀᴇ ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ.");
    } else {
        return reply(`ᴇxᴀᴍᴘʟᴇ: .ᴡᴇʟᴄᴏᴍᴇ ᴏɴ`);
    }
});

cmd({
    pattern: "antibot",
    react: "🫟",
    alias: ["antibot"],
    desc: "Enable Antibot and set action (off/warn/delete/kick)",
    category: "group",
    filename: __filename
}, async (conn, mek, m, { q, reply, isGroup, isAdmins, isOwner }) => {

    if (!isGroup) return reply("❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs.");
    if (!isAdmins && !isOwner) return reply("⛔ ᴏɴʟʏ ᴀᴅᴍɪɴs ᴏʀ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");

    if (!q) {
        return reply(`*📛 ᴄᴜʀʀᴇɴᴛ ᴀɴᴛɪʙᴏᴛ ᴀᴄᴛɪᴏɴ:* ${antibotAction.toUpperCase()}\n\n*🧪 Usage:* .antibot off / warn / delete / kick`);
    }

    const action = q.toLowerCase();
    if (["off", "warn", "delete", "kick"].includes(action)) {
        antibotAction = action;
        return reply(`✅ *ᴀɴᴛɪʙᴏᴛ ᴀᴄᴛɪᴏɴ sᴇᴛ ᴛᴏ:* ${action.toUpperCase()}`);
    } else {
        return reply("❌ *Invalid action.*\n\n*🫟 ᴇxᴀᴍᴘʟᴇ:* .ᴀɴᴛɪʙᴏᴛ ᴏɴ / ᴡᴀʀɴ / ᴅᴇʟᴇᴛᴇ / ᴋɪᴄᴋ");
    }
});

// Détection de messages suspects (bots joints au groupe)
cmd({
    on: "body"
}, async (conn, mek, m, { from, isGroup, sender, isBotAdmins, isAdmins, reply }) => {
    if (!isGroup || antibotAction === "off") return;

    const messageId = mek?.key?.id || "";
    if (!messageId.startsWith("31F")) return; // messages typiques des bots (ajustable selon tes besoins)

    if (!isBotAdmins) return reply("*❌ ɪ'ᴍ ɴᴏᴛ ᴀɴ ᴀᴅᴍɪɴ, sᴏ ɪ ᴄᴀɴ'ᴛ ᴛᴀᴋᴇ ᴀᴄᴛɪᴏɴ!*");
    if (isAdmins) return; // Ignore les admins

    // Supprimer le message
    await conn.sendMessage(from, { delete: mek.key });

    switch (antibotAction) {
        case "kick":
            await conn.groupParticipantsUpdate(from, [sender], "remove");
            break;

        case "warn":
            warnings[sender] = (warnings[sender] || 0) + 1;
            if (warnings[sender] >= 3) {
                delete warnings[sender];
                await conn.groupParticipantsUpdate(from, [sender], "remove");
            } else {
                return reply(`⚠️ @${sender.split("@")[0]}, ᴡᴀʀɴɪɴɢ ${warnings[sender]}/3! ʙᴏᴛs ᴀʀᴇ ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ!`, {
                    mentions: [sender]
                });
            }
            break;

        case "delete":
            // Message déjà supprimé, pas besoin d'autre action
            break;
    }
});
