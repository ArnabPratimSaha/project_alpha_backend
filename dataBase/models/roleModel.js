const mongoose=require('mongoose');
const { roleSchema } = require('../schemas/roleSchema');
const RoleModel=mongoose.model('roleModel',roleSchema);

module.exports={RoleModel};