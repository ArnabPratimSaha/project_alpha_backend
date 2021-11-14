require('dotenv').config()
const Router=require('express').Router();
const GuildModel=require('../dataBase/models/guildModel');
const Heroku = require('heroku-client');
const heroku = new Heroku({ token: process.env.HEROKU_API_TOKEN });
const http=require('http')

Router.get('/',async(req,res)=>{
    const count=req.query.c;
    if(!count)return res.sendStatus(400);
    try {
        const allGuilds=await GuildModel.find();
        let info=[];
        let highestValue=0;
        let lowestValue=0;
        for (let i = 0; i < allGuilds.length; i++) {
            const g = allGuilds[i];
            let currentValue = g.guildMemberCount;
            if (i === 0) {
                highestValue = currentValue;
                lowestValue = currentValue;
            }
            if (info.length < count)
                info.push({ name: g.guildName, avater: g.guildAvater, memberCount: g.guildMemberCount,isPartnerd:g.isPartnered });
            else if (info.length >= count && currentValue > lowestValue) {
                info = info.filter(i => i.memberCount > lowestValue)
                info.push({ name: g.guildName, avater: g.guildAvater, memberCount: g.guildMemberCount,isPartnerd:g.isPartnered });
            }
            if (currentValue > highestValue) highestValue = currentValue;
            if (currentValue < lowestValue) lowestValue = currentValue;
        }
        res.status(200).json(info)
    } catch (error) {
        console.log(error);
        res.sendStatus(500)
    }
})
Router.get('/botstatus',async(req,res)=>{
    try {
       heroku.get(`/apps/${process.env.DISCORD_BOT_PROJECT_NAME_HEROKU}/dynos/${process.env.DISCORD_BOT_PROJECT_DYNOS_HEROKU}`).then(response=>{
        if(response){
            if(response)
                return res.status(200).json({'state':response.state});//current status of process (either: crashed, down, idle, starting, or up)
            return res.sendStatus(503);//service unavilable
        }
       }).catch((err)=>{
        return res.status(200).json({'state':'failed'});//service unaviable
       })
    } catch (error) {
        console.log(error);
        res.sendStatus(500)
    }
})

module.exports=Router;