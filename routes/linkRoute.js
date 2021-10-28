const Router=require('express').Router();
const {LinkModel} =require('../dataBase/models/linkModel');
const Discord = require('discord.js');
const {client,start}=require('../bot/botStart');

Router.get('/info',async(req,res)=>{
    const discordId=req.query.did;
    const sessionId=req.query.sid;
    try {
        const link=await LinkModel.findOne({discordId:discordId,entryId:sessionId})
        if(!link)
        {
            return res.sendStatus(404);
        }
        if(!client)await start();
        const user=await client.users.fetch(discordId)
        const response={
            discordId:user.id,
            avatar:user.avatar,
            userName:user.username,
            userTag:user.discriminator
        }
        return res.status(200).json(JSON.stringify(response))
    } catch (error) {
        console.log(error);
        res.sendStatus(500)
    }
})
module.exports=Router