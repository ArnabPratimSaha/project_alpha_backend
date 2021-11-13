const mongoose=require('mongoose');

const logSchema=new mongoose.Schema({
    messageId:String,
    targetGuild:String,
    type:String,
    channels:Array,
    members:Array,
    role:Array,
    title:String,
    message:String,
    sender:String,
    time:Date,
    preview:Boolean,
    status:String,
    favourite:Boolean
});
module.exports={logSchema};