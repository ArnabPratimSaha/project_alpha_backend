const Router=require('express').Router();
const getUser = require('../helperFunction/getUser');

Router.get('/info',async(req,res)=>{
    const type=req.query.type;
    const value=req.query.value;
    try {
        const {error,response}=await getUser(value,type)
        if(error)
            throw error;
        if(!response)
        {
            return res.sendStatus(404);
        }
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