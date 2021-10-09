require('dotenv').config()
const Router=require('express').Router();
const GuildModel=require('../dataBase/models/guildModel');

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
            console.log(`currentvalue ${currentValue} highestValue ${highestValue} lowestValue ${lowestValue}`);
            if (info.length < count)
                info.push({ name: g.guildName, avater: g.guildAvater, memberCount: g.guildMemberCount });
            else if (info.length >= count && currentValue > lowestValue) {
                info = info.filter(i => i.memberCount > lowestValue)
                info.push({ name: g.guildName, avater: g.guildAvater, memberCount: g.guildMemberCount });
            }
            if (currentValue > highestValue) highestValue = currentValue;
            if (currentValue < lowestValue) lowestValue = currentValue;
w
        }
        res.status(200).json(info)
    } catch (error) {
        console.log(error);
        res.sendStatus(500)
    }
})
// info.push({
//     name:g.guildName,
//     avater:g.guildAvater,
//     memberCount:g.guildMemberCount,
// })

module.exports=Router;