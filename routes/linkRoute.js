const Router = require('express').Router();
const { LinkModel } = require('../dataBase/models/linkModel');
const { userModel } = require('../dataBase/models/userModel');
const Discord = require('discord.js');
const { client, start } = require('../bot/botStart');
const otpGenerator = require('otp-generator')
const { v4: uuidv4 } = require('uuid');


Router.get('/info', async (req, res) => {
    const discordId = req.query.did;
    const sessionId = req.query.sid;
    let timeCutoff = 2;
    try {
        const link = await LinkModel.findOne({ discordId: discordId, entryId: sessionId })
        if (!link) {
            return res.sendStatus(404);
        }
        if (!client) await start();
        const user = await client.users.fetch(discordId)
        if (new Date() - new Date(link.entryTime) > 1000 * 60 * timeCutoff)
            return res.sendStatus(404);
        const response = {
            discordId: user.id,
            avatar: user.displayAvatarURL(),
            userName: user.username,
            userTag: user.discriminator
        }
        return res.status(200).json(JSON.stringify(response))
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});
Router.get('/check', async (req, res) => {
    const discordId = req.query.did;
    const sessionId = req.query.sid;
    try {
        if (!client) await start();
        const user = await client.users.fetch(discordId);
        if(!user)return res.sendStatus(404);
        const link = await LinkModel.findOne({ discordId: discordId, entryId: sessionId })
        if (!link) return res.sendStatus(404);
        const response=await userModel.findOne({discordId:discordId});
        let data;
        if(!response)
        {
            const discordUser = new userModel({
                userName: user.username,
                userTag: user.discriminator,
                userId: uuidv4(),
                accessToken: 'null',
                discordId: user.id,
                avatar: user ? user.displayAvatarURL() : 'https://cdn.discordapp.com/embed/avatars/4.png'
            });
            const savedUser=await discordUser.save();
            data={
                userName:savedUser.userName,
                userTag:savedUser.userTag,
                discordId:savedUser.discordId,
                avatar:savedUser.avatar,
                userId:savedUser.userId
            }
            return res.status(200).json(data);
        }
        data={
            userName:response.userName,
            userTag:response.userTag,
            discordId:response.discordId,
            avatar:response.avatar,
            userId:response.userId
        }
        res.status(200).json(data);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})
Router.get('/sendcode', async (req, res) => {
    const did = req.query.id;
    const entryId = req.query.en;
    try {
        const link = await LinkModel.findOne({ discordId: did, entryId: entryId })
        if (!link) {
            return res.sendStatus(404);
        }
        if (!client) await start();
        const user = await client.users.fetch(did);
        if(link.OTP)return res.sendStatus(200);
        const otp = otpGenerator.generate(6, { upperCase: true, specialChars: false });
        link.OTP = otp;
        const embededMessage = new Discord.MessageEmbed();
        embededMessage.setTitle('OPT')
        embededMessage.setDescription(otp);
        embededMessage.setFooter(`Created By VIVI`);
        embededMessage.setTimestamp(new Date());
        embededMessage.setColor('GREEN')
        const response = await user.send({ content: 'Code generated', embeds: [embededMessage] });
        await link.save();
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})
Router.get('/validate', async (req, res) => {
    const did = req.query.id;
    const entryId = req.query.en;
    const code = req.query.c;
    try {
        const link = await LinkModel.findOne({ discordId: did, entryId: entryId })
        if (!link) {
            return res.sendStatus(404);
        }
        if (!client) await start();
        if(code===link.OTP)
        {
            await LinkModel.findOneAndDelete({ discordId: did, entryId: entryId })
            return res.sendStatus(200);
        }
        res.sendStatus(400);
    } catch (error) {
        console.log(error);
    }

})
module.exports = Router