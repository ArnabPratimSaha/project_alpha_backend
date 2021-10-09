const mongoose=require('mongoose');
const { logSchema } = require('../schemas/logSchema');
const status={
    PROCESSING:'PROCESSING',
    CANCELLED:'CANCELLED',
    SENT:'SENT',
}

const logModel=mongoose.model('logModel',logSchema);

module.exports={logModel,status};