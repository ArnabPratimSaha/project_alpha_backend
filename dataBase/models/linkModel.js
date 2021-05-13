const mongoose=require('mongoose');
const { linkSchema } = require('../schemas/linkSchema');

const LinkModel=mongoose.model('LinkModel',linkSchema);

module.exports={LinkModel};