const Router=require('express').Router();
const passport=require('passport');

Router.get('/discord', passport.authenticate('discord'));
Router.get('/discord/callback', passport.authenticate('discord', {
    failureRedirect: '/error'
}), function(req, res) {
    res.redirect(`${process.env.FRONTENDURL}auth/${req.user.user.discordId}/${req.user.user.userId}`) // Successful auth
});
module.exports=Router;
