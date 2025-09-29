// commands/afk.js
// Commande &afk : permet de se mettre en mode AFK avec une raison
import { EmbedBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';

export default {
  name: 'afk',
  description: ' <:arrow:1386053533400436776> Se mettre en mode AFK avec une raison',
  usage: '&afk [raison]',
  async execute(message, args) {
    const reason = args.join(' ') || 'Aucune raison spécifiée';
    const userId = message.author.id;
    
    // Charger les utilisateurs AFK depuis le fichier
    const afkFilePath = path.join(process.cwd(), 'afkUsers.json');
    let afkUsers = {};
    
    try {
      if (fs.existsSync(afkFilePath)) {
        afkUsers = JSON.parse(fs.readFileSync(afkFilePath, 'utf8'));
      }
    } catch (error) {
      console.error('Erreur lors du chargement du fichier AFK:', error);
      afkUsers = {};
    }
    
    // Enregistrer l'utilisateur comme AFK
    afkUsers[userId] = {
      reason: reason,
      timestamp: Date.now(),
      channelId: message.channel.id,
      username: message.author.username
    };
    
    // Sauvegarder dans le fichier
    try {
      fs.writeFileSync(afkFilePath, JSON.stringify(afkUsers, null, 2));
      // Mettre à jour la Map en mémoire aussi
      if (!message.client.afkUsers) {
        message.client.afkUsers = new Map();
      }
      message.client.afkUsers.set(userId, afkUsers[userId]);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde AFK:', error);
      await message.reply('❌ Erreur lors de l\'activation du mode AFK.');
      return;
    }
    
    const embed = new EmbedBuilder()
      .setTitle('🟡 Mode AFK Activé')
      .setDescription(`**${message.author.username}** est maintenant en mode AFK`)
      .addFields(
        { name: 'Raison', value: reason, inline: true },
        { name: 'Depuis', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
      )
      .setColor(0xFFA500)
      .setThumbnail(message.author.displayAvatarURL())
      .setTimestamp();
    
    await message.reply({ embeds: [embed] });
  }
};
