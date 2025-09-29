// index.js
// Point d'entrée du bot Discord.js v14+ (ES6)
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
// Remove the static import of config.json
// import config from './config.json' assert { type: 'json' };

// Dynamically load config.json using path and fs
const configPath = path.join(path.resolve(), 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Chargement des variables d'environnement
dotenv.config();

// Création du client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,     // <--- ici
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences
  ]
});

// Collection des commandes
client.commands = new Collection();

// Chargement dynamique des commandes
const commandsPath = path.resolve('./commands');
for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
  const command = (await import(`./commands/${file}`)).default;
  client.commands.set(command.name, command);
}

// Initialiser la collection des utilisateurs AFK et charger depuis le fichier
client.afkUsers = new Map();
const afkFilePath = path.join(process.cwd(), 'afkUsers.json');
try {
  if (fs.existsSync(afkFilePath)) {
    const afkUsers = JSON.parse(fs.readFileSync(afkFilePath, 'utf8'));
    for (const [userId, afkData] of Object.entries(afkUsers)) {
      client.afkUsers.set(userId, afkData);
    }
    console.log(`✅ ${client.afkUsers.size} utilisateur(s) AFK chargé(s) depuis le fichier`);
  }
} catch (error) {
  console.error('❌ Erreur lors du chargement des utilisateurs AFK:', error);
}

// Chargement des événements
const eventsPath = path.resolve('./events');
for (const file of fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'))) {
  const event = (await import(`./events/${file}`)).default;
  if (typeof event === 'function') {
    // Ancienne méthode (ex: interactionCreate.js)
    if (file === 'interactionCreate.js') {
      event(client, client.commands);
    } else {
      event(client);
    }
  } else if (event && typeof event.execute === 'function') {
    // Nouvelle méthode (ex: staffApply.js)
    if (event.once) {
      client.once(event.name, (...args) => event.execute(client, ...args));
    } else {
      client.on(event.name, (...args) => event.execute(client, ...args));
    }
  }
}

// Handler des commandes préfixées
client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;
  
  // Vérifier les deux préfixes : le préfixe configuré et &
  let prefix = null;
  let args = null;
  let commandName = null;
  
  if (message.content.startsWith(config.prefix)) {
    prefix = config.prefix;
    args = message.content.slice(config.prefix.length).trim().split(/ +/);
    commandName = args.shift().toLowerCase();
  } else if (message.content.startsWith('&')) {
    prefix = '&';
    args = message.content.slice(1).trim().split(/ +/);
    commandName = args.shift().toLowerCase();
  }
  
  if (!prefix) return;
  
  const command = client.commands.get(commandName);
  if (!command) return;
  
  try {
    await command.execute(message, args);
  } catch (err) {
    console.error(err);
    message.reply('Erreur lors de l\'exécution de la commande.');
  }
});

// Connexion du bot
client.login(process.env.DISCORD_TOKEN); 