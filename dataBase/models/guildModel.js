const mongoose=require('mongoose');
const guildSchema=require("../schemas/guildSchema");

const GuildModel=mongoose.model('GuildModel',guildSchema);

module.exports=GuildModel;