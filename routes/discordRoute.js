require('dotenv').config()
const Router = require('express').Router();
const GuildModel = require('../dataBase/models/guildModel');
const randomColor = require('randomcolor')
const { start, client } = require('../bot/botStart');
const { MessageModel } = require('../dataBase/models/messageModel');
const Discord = require('discord.js');
const { logModel, status } = require('../dataBase/models/logModel');
const { v4: uuidv4 } = require('uuid');
const { RoleModel } = require('../dataBase/models/roleModel');
const getArray = collection => {
    let array = [];
    collection.each(g => {
        array.push(g);
    })
    return array;
}
Router.get('/permission', async (req, res) => {
    const did = req.query.discordId;
    let roleGuilds = [];
    try {
        if (!did) return res.sendStatus(404);
        if (!client) await start();
        const allData = await RoleModel.find({ guildStatus: true });
        if (!allData) return res.status(200).json({ "guilds": roleGuilds });
        for (let i = 0; i < allData.length; i++) {
            const data = allData[i];
            if (data.validMembers.includes(did)) {
                const guild = await client.fetchGuildPreview(data.guildId);
                if (guild) {
                    roleGuilds.push({
                        guildName: guild.name,
                        guildId: guild.id,
                        guildAvatar: guild.iconURL(),
                        guildColor: randomColor()
                    })
                }
            }
        }
        return res.status(200).json({ "guilds": roleGuilds })
    } catch (error) {
        console.log(error);
        return res.sendStatus(500)
    }
})
Router.get('/channel', async (req, res) => {
    const discordId = req.query.did;
    const guildId = req.query.gid;
    const query = req.query.q;
    try {
        if (!client) await start();
        let validChannels = [];
        const guild = client.guilds.cache.find((e) => e.id === guildId)
        const channels = getArray(guild.channels.cache);
        if (channels) {
            for (let i = 0; i < channels.length; i++) {
                const channel = channels[i];
                if (channel.type === 'GUILD_TEXT')//for text channels only
                {
                    if (query === undefined || query.length === 0) {
                        if (validChannels.length <= 20) {
                            validChannels.push({
                                channelName: channel.name,
                                channelId: channel.id,
                                channelColor: randomColor()
                            })
                        }
                    }
                    else {
                        if (channel.name.slice(0, query.length).toLocaleLowerCase() === query.toLocaleLowerCase()) {
                            validChannels.push({
                                channelName: channel.name,
                                channelId: channel.id,
                                channelColor: randomColor()
                            })
                        }
                    }
                }
            }
        }
        res.status(200).json({ 'channels': validChannels })
    } catch (error) {
        console.log(error);
        res.sendStatus(500)
    }
})
Router.get('/role', async (req, res) => {
    const discordId = req.query.did;
    const guildId = req.query.gid;
    const query = req.query.q;
    try {
        if (!client) await start();
        const guild = client.guilds.cache.find((e) => e.id === guildId)
        const roles = getArray(guild.roles.cache);
        let validRoles = [];
        if (roles) {
            for (let i = 0; i < roles.length; i++) {
                const role = roles[i];
                if (query === undefined || query.length === 0) {
                    if (validRoles.length <= 20) {
                        validRoles.push({
                            roleName: role.name,
                            roleId: role.id,
                            roleColor: role.hexColor,
                            isAdmin: role.permissions.has('ADMINISTRATOR')
                        })
                    }
                }
                else {
                    if (role.name.slice(0, query.length).toLocaleLowerCase() === query.toLocaleLowerCase()) {
                        validRoles.push({
                            roleName: role.name,
                            roleId: role.id,
                            roleColor: role.hexColor,
                            isAdmin: role.permissions.has('ADMINISTRATOR')
                        })
                    }
                }
            }
        }
        res.status(200).json({ 'roles': validRoles })
    } catch (error) {
        console.log(error);
        res.sendStatus(500)
    }
})
Router.get('/member', async (req, res) => {
    const discordId = req.query.did;
    const guildId = req.query.gid;
    const query = req.query.q;
    try {
        if (!client) await start();
        let validMembers = [];
        if (query === undefined || query.length === 0) return res.status(200).json({ 'members': validMembers });
        const guild = client.guilds.cache.find((e) => e.id === guildId)
        if (!guild) return res.sendStatus(404);
        const members = await guild.members.fetch({ query: query, limit: 20 });
        members.forEach(e => {
            let role = [];
            if (!e.user.bot) {
                role = [];
                e.roles.cache.forEach(j => { role.push(j.id) })
                validMembers.push(
                    {
                        memberNickName: e.nickname,
                        memberUserName: e.user.username,
                        memberUserTag: e.user.discriminator,
                        memberId: e.id,
                        memberAvatar: e.user.avatarURL(),
                        memberRoles: role,
                        isAdmin: e.permissions.has('ADMINISTRATOR')
                    }
                )
            }
        })
        res.status(200).json({ 'members': validMembers })
    } catch (error) {
        console.log(error);
        res.sendStatus(500)
    }
})

const extractChannelId = (channels) => {
    let id = [];
    for (let i = 0; i < channels.length; i++) {
        const e = channels[i];
        id.push(e.channelId)
    }
    return id;
}
const extractRoleId = (roles) => {
    let id = [];
    for (let i = 0; i < roles.length; i++) {
        const e = roles[i];
        id.push(e.roleId)
    }
    return id;
}
const extractMemberId = (members) => {
    let id = [];
    for (let i = 0; i < members.length; i++) {
        const e = members[i];
        id.push(e.memberId)
    }
    return id;
}

Router.post('/post', async (req, res) => {
    const selectedMembers = req.body.selectedMembers;
    const selectedRoles = req.body.selectedRoles;
    const selectedChannels = req.body.selectedChannels;
    const selectedTime = req.body.selectedTime;
    const preview = req.body.preview;
    const title = req.body.title;
    const message = req.body.message;
    const guildId = req.query.gid;
    const userId = req.query.did;
    const type = req.body.type;
    try {
        if (selectedChannels.length === 0 && selectedRoles.length === 0 && selectedMembers.length === 0)
            return res.sendStatus(204);
        if (!client) await start();
        const uid = uuidv4();
        const model = new MessageModel({
            messageId: uid,
            targetGuild: guildId,
            channels: extractChannelId(selectedChannels),
            members: extractMemberId(selectedMembers),
            role: extractRoleId(selectedRoles),
            message: message,
            title: title,
            sender: userId,
            time: selectedTime,
            preview: preview,
            type: type
        })
        const log = new logModel({
            messageId: uid,
            targetGuild: guildId,
            channels: extractChannelId(selectedChannels),
            members: extractMemberId(selectedMembers),
            role: extractRoleId(selectedRoles),
            message: message,
            title: title,
            sender: userId,
            time: selectedTime,
            preview: preview,
            status: status.PROCESSING,
            type: type,
            favourite: false
        })
        await log.save()
        await model.save();
        if (preview) {
            if (!client) await start();
            const user = await client.users.fetch(userId)
            const embeded = new Discord.MessageEmbed();
            embeded.setTitle(title)
            embeded.addField('Message Body:', message)
            embeded.setColor('BLURPLE')
            embeded.setFooter(`message sent by ${user.username}`)
            const row = new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomId('primary')
                        .setLabel('CANCEL')
                        .setStyle('PRIMARY'),
                );
            await user.send({ content: 'PREVIEW', embeds: [embeded] });
        }
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500)
    }
})
Router.delete('/', async (req, res) => {
    const messageId = req.query.id;
    try {
        const response = await MessageModel.findOneAndDelete({ messageId: messageId })
        if (!response)
            return res.sendStatus(404);
        else
            return res.sendStatus(200);

    } catch (error) {
        console.log(error);
        res.sendStatus(500)
    }
})
module.exports = Router;


