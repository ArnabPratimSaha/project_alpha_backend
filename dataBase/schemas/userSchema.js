const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    userName:{type:String,required:true},
    userTag:{type:String,required:true},
    userId:{type:String,required:true},
    accessToken:{type:String,required:true},
    discordId:{type:String,required:true},
    avatar:{type:String}
});
module.exports={userSchema};