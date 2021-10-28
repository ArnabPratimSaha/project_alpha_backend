const Router=require('express').Router();
const {getUser} = require('../helperFunction/getUser');
const { userModel } = require('../dataBase/models/userModel');

Router.get('/info',async(req,res)=>{
    const discordId=req.query.id;
    try {
        const response=await userModel.findOne({discordId:discordId})
        if(!response)return res.sendStatus(404);
        const data={
            userName:response.userName,
            userTag:response.userTag,
            discordId:response.discordId,
            avatar:response.avatar,
            userId:response.userId
        }
        res.status(200).json(JSON.stringify(data))
    } catch (error) {
        console.log(error);
        res.sendStatus(500)
    }
})


module.exports=Router;