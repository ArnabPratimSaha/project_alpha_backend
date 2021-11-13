const mongoose=require('mongoose');
const { messageSchema } = require('../schemas/messageSchema');

const MessageModel=mongoose.model('messageModel',messageSchema);

module.exports={MessageModel};