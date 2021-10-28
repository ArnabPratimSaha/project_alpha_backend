const mongoose=require('mongoose');

const linkSchema=new mongoose.Schema({
    discordId:{ type:String,required:true},
    entryId:{type:String,required:true},
    entryTime:{type:Date,required:true}
});
module.exports={linkSchema};