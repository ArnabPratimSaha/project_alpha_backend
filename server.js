require('dotenv').config()
const express = require('express');
const app = express();
const cors=require('cors');
const passport=require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const getUser = require('./helperFunction/getUser');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const { userModel } = require('./dataBase/models/userModel');
const authentication=require('./routes/authentication');
const link = require('./routes/linkRoute');
const user= require('./routes/userRoute');
const discord=require('./routes/discordRoute')
const log=require('./routes/logRoute');
const info=require('./routes/information');
const connectMongo=async()=>{
  try {
    const response=await mongoose.connect(process.env.DATABASE, {useNewUrlParser: true, useUnifiedTopology: true});
    console.log(`Successfully Connected to ${response.connection.client.s.options.dbName}`)
  } catch (error) {
    console.log('could not connect to mongoDB ATLAS');
  }
}
connectMongo();

const scopes = ['identify', 'email', 'guilds'];

app.use(cors());
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function (id, done) {
    done(null, id);
});

passport.use(new DiscordStrategy({
    clientID: process.env.CLIENTID,
    clientSecret: process.env.SECRET,
    callbackURL: process.env.CALLBACKURL,
    scope: scopes
},
async function (accessToken, refreshToken, profile, cb){
    try {
        const {error,response} = await getUser(accessToken,'accessToken');
        if(error)
          throw error;
        if(!response)
        {
          const user=new userModel({
            userName: profile.username,
            userTag: profile.discriminator,
            userId: uuidv4(),
            accessToken: profile.accessToken,
            discordId: profile.id,
            avatar:profile.avatar
          });
          const savedUser=await user.save();
          cb(null,{user:savedUser});
        }
        else
        {
          cb(null,{user:response});
        }
    } catch (error) {
        cb(error,null)
    }
}));

const port = 5000 || process.env.PORT



// ==============Routes==================
app.use('/auth',authentication);
app.use('/link',link);
app.use('/user',user);
app.use('/discord',discord);
app.use('/log',log);
app.use('/info',info)


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
//https://cdn.discordapp.com/avatars/