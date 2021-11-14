const mongoose=require('mongoose');

const roleSchema=new mongoose.Schema({
    guildId:String,
    roleId:String,
    guildStatus:Boolean,
    validMembers:Array
});
module.exports={roleSchema};