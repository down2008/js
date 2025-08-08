const { cmd } = require('../command');

cmd({
    pattern: "hack",
    desc: "Displays a dynamic and playful 'Hacking' message for fun.",
    category: "fun",
    filename: __filename
},
async (conn, mek, m, { 
    from, quoted, body, isCmd, command, args, q, isGroup, senderNumber, reply 
}) => {
    try {
        // Get the bot owner's number dynamically from conn.user.id
        const botOwner = conn.user.id.split(":")[0]; // Extract the bot owner's number
        if (senderNumber !== botOwner) {
            return reply("ᴏɴʟʏ ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");
        }

        const steps = [
            '💻 *𝐇𝐀𝐂𝐊 𝐒𝐓𝐀𝐑𝐓𝐈𝐍𝐆...* 💻',
            
            '*ɪɴɪᴛɪᴀʟɪᴢɪɴɢ ʜᴀᴄᴋɪɴɢ ᴛᴏᴏʟs...* 🛠️',
            '*ᴄᴏɴɴᴇᴄᴛɪɴɢ ᴛᴏ ʀᴇᴍᴏᴛᴇ sᴇʀᴠᴇʀs...* 🌐',
            
            '```[██████████] 10%``` ⏳'                                            ,
            '```[███████████████████] 20%``` ⏳'                                   ,
            '```[███████████████████████] 30%``` ⏳'                               ,
            '```[██████████████████████████] 40%``` ⏳'                            ,
            '```[███████████████████████████████] 50%``` ⏳'                       ,
            '```[█████████████████████████████████████] 60%``` ⏳'                 ,
            '```[██████████████████████████████████████████] 70%``` ⏳'            ,
            '```[██████████████████████████████████████████████] 80%``` ⏳'        ,
            '```[██████████████████████████████████████████████████] 90%``` ⏳'    ,
            '```[████████████████████████████████████████████████████] 100%``` ✅',
            
            '🔒 *sʏsᴛᴇᴍ ʙʀᴇᴀᴄʜ: sᴜᴄᴄᴇssғᴜʟ!* 🔓',
            '🚀 *ᴄᴏᴍᴍᴀɴᴅ ᴇxᴇᴄᴜᴛɪᴏɴ: ᴄᴏᴍᴘʟᴇᴛᴇ!* 🎯',
            
            '*📡 ᴛʀᴀɴsᴍɪᴛᴛɪɴɢ ᴅᴀᴛᴀ...* 📤',
            '_🕵️‍♂️ ᴇɴsᴜʀɪɴɢ sᴛᴇᴀʟᴛʜ..._ 🤫',
            '*🔧 ғɪɴᴀʟɪᴢɪɴɢ ᴏᴘᴇʀᴀᴛɪᴏɴs...* 🏁',
            
            '⚠️ *ɴᴏᴛᴇ:* ᴀʟʟ ᴀᴄᴛɪᴏɴs ᴀʀᴇ ғᴏʀ ᴅᴇᴍᴏɴsᴛʀᴀᴛɪᴏɴ ᴘᴜʀᴘᴏsᴇs ᴏɴʟʏ.',
            '⚠️ *ʀᴇᴍɪɴᴅᴇʀ:* ᴇᴛʜɪᴄᴀʟ ʜᴀᴄᴋɪɴɢ ɪs ᴛʜᴇ ᴏɴʟʏ ᴡᴀʏ ᴛᴏ ᴇɴsᴜʀᴇ sᴇᴄᴜʀɪᴛʏ.',
            
            '> *𝐌𝐄𝐆𝐀𝐋𝐎𝐃𝐎𝐍-𝐌𝐃 -𝐇𝐀𝐂𝐊𝐈𝐍𝐆-𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐄𝐃 ☣*'
        ];

        for (const line of steps) {
            await conn.sendMessage(from, { text: line }, { quoted: mek });
            await new Promise(resolve => setTimeout(resolve, 1000)); // Adjust the delay as needed
        }
    } catch (e) {
        console.error(e);
        reply(`❌ *Error:* ${e.message}`);
    }
});
