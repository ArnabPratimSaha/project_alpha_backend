const mongoose=require('mongoose');
const { userSchema } = require('../schemas/userSchema');


const userModel=mongoose.model('UserModel',userSchema);

module.exports={userModel};