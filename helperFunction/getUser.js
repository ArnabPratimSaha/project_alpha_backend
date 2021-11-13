const { userModel } = require('../dataBase/models/userModel');
const { start, client } = require('../bot/botStart');
const getUser = async (id) => {
    let user = null;
    try {
        user = await userModel.findOne({ discordId: id });
        if(!user)return null;
        const discordUser = await getUserFromDiscord(id);
        user.userName = discordUser.username;
        user.userTag = discordUser.discriminator;
        user.discordId = id;
        user.avatar = discordUser.displayAvatarURL()
        await user.save();
        return user;
    } catch (error) {
        return null;
    }
}
const getUserFromDiscord = async(id) => {
    try {
        if (!client) await start();
        const discordUser = await client.users.fetch(id)
        return discordUser;
    } catch (error) {
        console.log(error);
    }
}
module.exports = { getUser ,getUserFromDiscord}