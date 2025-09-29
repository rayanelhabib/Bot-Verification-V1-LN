// commands/help.js
// Commande =help : affiche la liste des commandes du bot
import fs from 'fs';
const config = JSON.parse(fs.readFileSync(new URL('../config.json', import.meta.url)));
import { EmbedBuilder } from 'discord.js';

export default {
  name: 'help',
  description: ' <:arrow:1386053533400436776> Affiche la liste des commandes du bot',
  usage: '=help',
  async execute(message) {
    // Récupère toutes les commandes chargées
    const commands = message.client.commands;
    const embed = new EmbedBuilder()
      .setTitle('Bot Commands')
      .setDescription('Here is the list of available commands :')
      .setThumbnail(message.client.user.displayAvatarURL())
      .setColor(0x5865F2)
      .setFooter({ text: 'Help • Ryn Bot Discord', iconURL: message.client.user.displayAvatarURL() })
      .setTimestamp();
    
    // Séparer les commandes par préfixe
    const prefixCommands = [];
    const afkCommands = [];
    
    for (const command of commands.values()) {
      if (command.name === 'afk') {
        afkCommands.push(command);
      } else {
        prefixCommands.push(command);
      }
    }
    
    // Ajouter les commandes avec le préfixe configuré
    for (const command of prefixCommands) {
      embed.addFields({
        name: `${config.prefix}${command.name}`,
        value: `${command.description}\n<:Command_Neon:1395771443442356274> ${command.usage}`,
        inline: false
      });
    }
    
    // Ajouter les commandes avec le préfixe &
    for (const command of afkCommands) {
      embed.addFields({
        name: `&${command.name}`,
        value: `${command.description}\n<:Command_Neon:1395771443442356274> ${command.usage}`,
        inline: false
      });
    }
    
    await message.reply({ embeds: [embed] });
  }
}; 