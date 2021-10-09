const {Client,Intents} = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES,],ws: { intents: ['GUILD_MEMBERS', Intents.NON_PRIVILEGED] } });
client.login(process.env.TOKEN);

const start=async()=>{
    try {
        const newClient=await client.login(process.env.TOKEN);
        console.log(newClient);
    } catch (error) {
        console.log(error);
    }
}
module.exports={client,start}