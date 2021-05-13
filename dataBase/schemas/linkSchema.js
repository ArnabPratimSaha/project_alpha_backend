const mongoose=require('mongoose');

const linkSchema=new mongoose.Schema({
    userID:{ type:String,required:true},
    entryID:{type:String,required:true},
    entryTime:{type:Date,required:true}
});
module.exports={linkSchema};