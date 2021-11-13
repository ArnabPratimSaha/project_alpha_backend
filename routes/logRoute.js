require('dotenv').config()
const Router = require('express').Router();
const toggleIndex = ['all', 'sent', 'processing', 'cancelled']
const { start, client } = require('../bot/botStart');
const { logModel, status } = require('../dataBase/models/logModel');
const getArray=collection=>{
    let array=[];
    collection.each(g=>{
        array.push(g);
    })
    return array;
}
const getGuildByQuery = async (info, query, client) => {
    let item = [];
    if (!info) {
        return item;
    }
    if (!query || query.trim().length === 0) {
        for (let i = 0; i < info.length; i++) {
            const e = info[i];
            try {
                const guild = await client.guilds.fetch(e.targetGuild)
                item.push({messageId:e.messageId,message:e.message,targetGuild:e.targetGuild,role:e.role,channels:e.channels,members:e.members, time:e.time,title:e.title,favourite:e.favourite,status:e.status, guildName: guild.name, guildAvatar: guild.iconURL(),messageType:e.type })
            } catch (error) {

            }
        }
        return item.reverse();
        
    }
    for (let i = 0; i < info.length; i++) {
        const e = info[i];
        try {
            const guild = await client.guilds.fetch(e.targetGuild)
            const searchQuery = query.trim().toLowerCase();
            if (searchQuery === guild.name.slice(0, searchQuery.length).trim().toLowerCase()) {
                item.push({messageId:e.messageId,message:e.message,targetGuild:e.targetGuild,role:e.role,channels:e.channels,members:e.members, time:e.time,title:e.title,favourite:e.favourite,status:e.status, guildName: guild.name, guildAvatar: guild.iconURL(),messageType:e.type })
            }
        } catch (error) {

        }
    }
    return item.reverse();
}
Router.get('/searchinfo', async (req, res) => {
    const limit = parseInt(req.query.limit);
    const page = parseInt(req.query.page);
    const type = req.query.type;
    const id = req.query.did;
    const startIndex = (page - 1) * limit;
    const endIndex = limit * page;
    const favourite = req.query.fav;
    const query = req.query.query?req.query.query.toString().trim():undefined;
    try {
        if (!client) await start();
        if (favourite === 'false') {
            if (type === toggleIndex[0]) {
                const allLog = await logModel.find({ sender: id });
                const matchContent = await getGuildByQuery(allLog, query, client)
                res.json(matchContent.slice(startIndex, endIndex))
            }
            else if (type === toggleIndex[1]) {
                const allLog = await logModel.find({ status: status.SENT, sender: id });
                const matchContent = await getGuildByQuery(allLog, query, client)
                res.json(matchContent.slice(startIndex, endIndex))
            }
            else if (type === toggleIndex[2]) {
                const allLog = await logModel.find({ status: status.PROCESSING, sender: id });
                const matchContent = await getGuildByQuery(allLog, query, client)
                res.json(matchContent.slice(startIndex, endIndex))
            }
            else if (type === toggleIndex[3]) {
                const allLog = await logModel.find({ status: status.CANCELLED, sender: id });
                const matchContent = await getGuildByQuery(allLog, query, client)
                res.json(matchContent.slice(startIndex, endIndex))
            }
            else {
                res.sendStatus(404);
            }
        }
        else {
            if (type === toggleIndex[0]) {
                const allLog = await logModel.find({ favourite: true, sender: id });
                const matchContent = await getGuildByQuery(allLog, query, client)
                res.json(matchContent.slice(startIndex, endIndex))
            }
            else if (type === toggleIndex[1]) {
                const allLog = await logModel.find({ favourite: true, status: status.SENT, sender: id });
                const matchContent = await getGuildByQuery(allLog, query, client)
                res.json(matchContent.slice(startIndex, endIndex))
            }
            else if (type === toggleIndex[2]) {
                const allLog = await logModel.find({ status: status.PROCESSING, favourite: true, sender: id });
                const matchContent = await getGuildByQuery(allLog, query, client)
                res.json(matchContent.slice(startIndex, endIndex))
            }
            else if (type === toggleIndex[3]) {
                const allLog = await logModel.find({ status: status.CANCELLED, favourite: true, sender: id });
                const matchContent = await getGuildByQuery(allLog, query, client)
                res.json(matchContent.slice(startIndex, endIndex))
            }
            else {
                res.sendStatus(404);
            }
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500)
    }
})
Router.patch('/', async (req, res) => {
    const messageId=req.query.mid;
    try {
       const log=await logModel.findOne({messageId:messageId})
        if(!log)return res.sendStatus(404);
        if(log.favourite)
            log.favourite=false;
        else
            log.favourite=true;
        await log.save()
        res.sendStatus(200)
    } catch (error) {
        console.log(error);
        res.sendStatus(500)
    }
})

const getName=async(client,id)=>{
    let names=[]
    for (let i = 0; i < id.length; i++) {
        const e = id[i];
        const user=await client.users.fetch(e)
        names.push(user?{userName:user.username,userTag:user.tag,avater:user.displayAvatarURL()}:null)
    }
    return names;
}
const getRoles=async(guild,id)=>{
    let roles=[]
    for (let i = 0; i < id.length; i++) {
        const e = id[i];
        const role=await guild.roles.fetch(e)
        if(role)
            roles.push({roleName:role.name,roleId:role.id,isAdmin:role.permissions.has('ADMINISTRATOR')})
        else
            roles.push({roleName:null,roleId:null,isAdmin:null})
    }
    return roles;
}
const getChannels=async(guild,id)=>{
    let validChannels=[]
    for (let i = 0; i < id.length; i++) {
        const e = id[i];
        let length=validChannels.length;
        const channels=getArray(guild.channels.cache);
        for (let j = 0; j < channels.length; j++) {
            if (e===channels[j].id) {
                validChannels.push(channels[j].name)
            }
        }
        if(length===validChannels.length)
        {
            validChannels.push(null)
        }
    }
    return validChannels;
}
//route for getting the message
Router.get('/', async (req, res) => {
    const discordId = req.query.did;
    const messageId = req.query.mid;
    let info={
        title:'not available',
        message:'not available',
        guildName:null,
        avater:null,
        type:null,
        roles:[],
        channels:[],
        members:[],
        status:null,
        time:null,
        status:null
    }
    try {
        if (!messageId || !discordId) {
            return res.sendStatus(404);
        }
        if (!client) await start();
        const data = await logModel.findOne({ messageId: messageId })
        if (!data) return res.sendStatus(400);
        const guild=await client.guilds.fetch(data.targetGuild)
        info.guildName=guild?guild.name:null;
        info.message=data.message;
        info.title=data.title;
        info.time=data.time;
        info.type=data.type;
        info.status=data.status;
        if(guild)
        {
            info.members=await getName(client,data.members);
            info.roles=roles=await getRoles(guild,data.role);
            info.channels=await getChannels(guild,data.channels)
            info.avater=guild.iconURL();
        }
        res.status(200).json(info)

    } catch (error) {
        console.log(error);
        res.sendStatus(500)
    }
})
Router.patch('/status',async(req,res)=>{
    const messageId=req.query.id;
    const status=req.query.status;
    try {
        const log=await logModel.findOne({messageId:messageId});
        if(!log)
            return res.sendStatus(404);
        else
        {
            log.status=status;
            await log.save();
            res.sendStatus(200);
        }
        
    } catch (error) {
        console.log(error);
        res.sendStatus(500)
    }
})
module.exports = Router;