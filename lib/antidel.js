const { isJidGroup } = require('baileys');
const { loadMessage, getAnti } = require('../data');
const config = require('../config');

const timeOptions = {
    timeZone: 'America/Port-au-Prince',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
};

const getMessageContent = (mek) => {
    if (mek.message?.conversation) return mek.message.conversation;
    if (mek.message?.extendedTextMessage?.text) return mek.message.extendedTextMessage.text;
    return '';
};

const DeletedText = async (conn, mek, jid, deleteInfo, isGroup, update) => {
    const messageContent = getMessageContent(mek);
    const alertText = `*⚠️ ᴅᴇʟᴇᴛᴇᴅ ᴍᴇssᴀɢᴇ ᴀʟᴇʀᴛ 🚨*\n${deleteInfo}\n  ◈ ᴄᴏɴᴛᴇɴᴛ ━ ${messageContent}`;

    const mentionedJid = [];
    if (isGroup) {
        if (update.key.participant) mentionedJid.push(update.key.participant);
        if (mek.key.participant) mentionedJid.push(mek.key.participant);
    } else {
        if (mek.key.participant) mentionedJid.push(mek.key.participant);
        else if (mek.key.remoteJid) mentionedJid.push(mek.key.remoteJid);
    }

    await conn.sendMessage(
        jid,
        {
            text: alertText,
            contextInfo: {
                mentionedJid: mentionedJid.length ? mentionedJid : undefined,
            },
        },
        { quoted: mek }
    );
};

const DeletedMedia = async (conn, mek, jid, deleteInfo, messageType) => {
    if (messageType === 'imageMessage' || messageType === 'videoMessage') {
        // For images/videos - put info in caption
        const antideletedmek = structuredClone(mek.message);
        if (antideletedmek[messageType]) {
            antideletedmek[messageType].caption = `*⚠️ Deleted Message Alert 🚨*\n${deleteInfo}\n*╰💬 ─✪ MEGALODON┃ MD ✪── 🔼*`;
            antideletedmek[messageType].contextInfo = {
                stanzaId: mek.key.id,
                participant: mek.key.participant || mek.key.remoteJid,
                quotedMessage: mek.message,
            };
        }
        await conn.relayMessage(jid, antideletedmek, {});
    } else {
        // For other media - send alert separately
        const alertText = `*⚠️ ᴅᴇʟᴇᴛᴇᴅ ᴍᴇssᴀɢᴇ ᴀʟᴇʀᴛ 🚨*\n${deleteInfo}`;
        await conn.sendMessage(jid, { text: alertText }, { quoted: mek });
        await conn.relayMessage(jid, mek.message, {});
    }
};

const AntiDelete = async (conn, updates) => {
    for (const update of updates) {
        if (update.update.message === null) {
            const store = await loadMessage(update.key.id);

            if (store && store.message) {
                const mek = store.message;
                const isGroup = isJidGroup(store.jid);
                const antiDeleteStatus = await getAnti();
                if (!antiDeleteStatus) continue;

                const deleteTime = new Date().toLocaleTimeString('en-GB', timeOptions).toLowerCase();

                let deleteInfo, jid;
                if (isGroup) {
                    try {
                        const groupMetadata = await conn.groupMetadata(store.jid);
                        const groupName = groupMetadata.subject || 'Unknown Group';
                        const sender = mek.key.participant?.split('@')[0] || 'Unknown';
                        const deleter = update.key.participant?.split('@')[0] || 'Unknown';

                        deleteInfo = `*╭────⬡ 𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃 ❤‍🔥 ⬡────*\n*├♻️ 𝐒𝐄𝐍𝐃𝐄𝐑:* @${sender}\n*├👥 GROUP:* ${groupName}\n*├⏰ 𝐃𝐄𝐋𝐄𝐓𝐄 𝐓𝐈𝐌𝐄:* ${deleteTime} \n*├🗑️ 𝐃𝐄𝐋𝐄𝐓𝐄𝐃 𝐁𝐘:* @${deleter}\n*├⚠️ 𝐀𝐂𝐓𝐈𝐎𝐍:* ᴅᴇʟᴇᴛᴇᴅ ᴀ ᴍᴇssᴀɢᴇ`;
                        jid = config.ANTI_DEL_PATH === "inbox" ? conn.user.id : store.jid;
                    } catch (e) {
                        console.error('Error getting group metadata:', e);
                        continue;
                    }
                } else {
                    const senderNumber = mek.key.participant?.split('@')[0] || mek.key.remoteJid?.split('@')[0] || 'Unknown';
                    const deleterNumber = update.key.participant?.split('@')[0] || update.key.remoteJid?.split('@')[0] || 'Unknown';
                    
                    deleteInfo = `*╭────⬡ 🤖 𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃 ⬡────*\n*├👤 𝐒𝐄𝐍𝐃𝐄𝐑:* @${senderNumber}\n*├⏰ 𝐃𝐄𝐋𝐄𝐓𝐄 𝐓𝐈𝐌𝐄:* ${deleteTime}\n*├🗑️ 𝐃𝐄𝐋𝐄𝐓𝐄𝐃 𝐁𝐘:* @${deleterNumber}\n*├⚠️ 𝐀𝐂𝐓𝐈𝐎𝐍:* ᴅᴇʟᴇᴛᴇᴅ ᴀ ᴍᴇssᴀɢᴇ`;
                    jid = config.ANTI_DEL_PATH === "inbox" ? conn.user.id : update.key.remoteJid || store.jid;
                }

                const messageType = mek.message ? Object.keys(mek.message)[0] : null;
                
                if (messageType === 'conversation' || messageType === 'extendedTextMessage') {
                    await DeletedText(conn, mek, jid, deleteInfo, isGroup, update);
                } else if (messageType && [
                    'imageMessage', 
                    'videoMessage', 
                    'stickerMessage', 
                    'documentMessage', 
                    'audioMessage',
                    'voiceMessage'
                ].includes(messageType)) {
                    await DeletedMedia(conn, mek, jid, deleteInfo, messageType);
                }
            }
        }
    }
};

module.exports = {
    DeletedText,
    DeletedMedia,
    AntiDelete,
};
