const {userModel}=require('../dataBase/models/userModel');

module.exports=getUser=async(data,action)=>{
    let user=null;
    try {
        if(action==='accessToken')
        {
            user=await userModel.findOne({accessToken:data});
        }
        else if(action==='userId')
        user=await userModel.findOne({userId:data});
        else 
            throw new Error('have to give a vaild action');
        return {error:null,response:user}
    } catch (error) {
        return {error:error,response:null}
    }
}