const mongoose=require('mongoose');

const guildSchema=new mongoose.Schema({
    guildName:{type:String,required:true},
    guildID:{type:String,required:true},
    roleID:{type:String,required:true}
});
module.exports=guildSchema;