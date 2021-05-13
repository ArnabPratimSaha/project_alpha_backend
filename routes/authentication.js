const Router=require('express').Router();
const passport=require('passport');

Router.get('/discord', passport.authenticate('discord'));
Router.get('/discord/callback', passport.authenticate('discord', {
    failureRedirect: '/fail'
}), function(req, res) {
    console.log(req.user)
    res.redirect('/secretstuff') // Successful auth
});
module.exports=Router;
