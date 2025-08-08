const { cmd } = require('../command');
const axios = require('axios');
const Config = require('../config');

cmd(
    {
        pattern: 'ainfo',
        alias: ['animeinfo', 'anidetails'],
        desc: 'Get anime information from MyAnimeList',
        category: 'search',
        react: '🌸',
        use: '<anime title>',
        filename: __filename,
    },
    async (conn, mek, m, { text, reply }) => {
        try {
            if (!text) return reply(`🌸 *ᴜsᴀɢᴇ:* ${Config.PREFIX}mal <anime title>\nExample: ${Config.PREFIX}mal Summertime Render`);

            await conn.sendMessage(mek.chat, { react: { text: "⏳", key: mek.key } });

            // Fetch MAL data
            const apiUrl = `https://lance-frank-asta.onrender.com/api/mal?title=${encodeURIComponent(text)}`;
            const { data } = await axios.get(apiUrl);

            if (!data?.title) {
                return reply('🌸 *ᴀɴɪᴍᴇ ɴᴏᴛ ғᴏᴜɴᴅ!* ᴛʀʏ ᴀ ᴅɪғғᴇʀᴇɴᴛ ᴛɪᴛʟᴇ');
            }

            // Format the information
            const malInfo = `🎌 *${data.title}* (${data.japanese || 'N/A'})\n\n` +
                           `📺 *ᴛʏᴘᴇ:* ${data.type || 'N/A'}\n` +
                           `📊 *sᴛᴀᴛᴜs:* ${data.status || 'N/A'}\n` +
                           `🗓 *ᴀɪʀᴇᴅ:* ${data.aired || 'N/A'}\n` +
                           `🎞 *ᴇᴘɪsᴏᴅᴇs:* ${data.episodes || 'N/A'} (${data.duration || 'N/A'})\n\n` +
                           `⭐ *sᴄᴏʀᴇ:* ${data.score || 'N/A'} (${data.scoreStats || 'N/A'})\n` +
                           `🏆 *ʀᴀɴᴋᴇᴅ:* ${data.ranked || 'N/A'}\n` +
                           `👥 *ᴍᴇᴍʙᴇʀs:* ${data.members || 'N/A'}\n\n` +
                           `🎭 *ɢᴇɴʀᴇs:* ${data.genres || 'N/A'}\n` +
                           `🏢 *sᴛᴜᴅɪᴏs:* ${data.studios || 'N/A'}\n\n` +
                           `📜 *ᴅᴇsᴄʀɪᴘᴛɪᴏɴ:* ${data.description?.substring(0, 200) || 'No description'}${data.description?.length > 200 ? '...' : ''}\n\n` +
                           `🔗 *ᴍᴀʟ ᴜʀʟ:* ${data.url || 'Not available'}\n\n` +
                           `> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅʏʙʏ ᴛᴇᴄʜ`;

            // Send the anime info with poster
            await conn.sendMessage(mek.chat, {
                image: { url: data.picture || 'https://i.imgur.com/3QNxQ4a.png' },
                caption: malInfo,
                contextInfo: {
                    externalAdReply: {
                        title: data.title,
                        body: `⭐ ${data.score} | ${data.type}`,
                        thumbnailUrl: data.picture || 'https://i.imgur.com/3QNxQ4a.png',
                        mediaType: 1,
                        mediaUrl: data.url,
                        sourceUrl: data.url
                    }
                }
            }, { quoted: mek });

            await conn.sendMessage(mek.chat, { react: { text: "✅", key: mek.key } });

        } catch (error) {
            console.error('MAL Error:', error);
            await conn.sendMessage(mek.chat, { react: { text: "❌", key: mek.key } });
            reply('🌸 *Error:* ' + (error.message || 'Failed to fetch MAL data'));
        }
    }
);
