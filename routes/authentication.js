const Router=require('express').Router();
const passport=require('passport');
const getUser=require('../helperFunction/getUser');

Router.get('/discord', passport.authenticate('discord'));
Router.get('/discord/callback', passport.authenticate('discord', {
    failureRedirect: '/error'
}), function(req, res) {
    res.redirect(`http://localhost:3000/auth/${req.user.user.discordId}/${req.user.user.userId}`) // Successful auth
});
module.exports=Router;
