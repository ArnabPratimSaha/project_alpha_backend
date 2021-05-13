require('dotenv').config()
const express = require('express');
const app = express();
const cors=require('cors');
const passport=require('passport');
const DiscordStrategy = require('passport-discord').Strategy;

const mongoose = require('mongoose');
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
function(accessToken, refreshToken, profile, cb) {
    try {
        cb(null,{user:profile})
    } catch (error) {
        cb(error,null)
    }
}));

const port = 5000 || process.env.PORT

const authentication=require('./routes/authentication');


// ==============Routes==================
app.use('/auth',authentication);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
