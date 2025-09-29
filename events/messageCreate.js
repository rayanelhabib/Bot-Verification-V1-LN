// events/messageCreate.js
// Événement pour gérer les mentions d'utilisateurs AFK
import { EmbedBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';

export default {
  name: 'messageCreate',
  once: false,
  async execute(client, message) {
    if (message.author.bot || !message.guild) return;
    
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
    
    // Vérifier si l'utilisateur qui envoie le message était AFK et le retirer du mode AFK
    if (afkUsers[message.author.id]) {
      const afkData = afkUsers[message.author.id];
      const timeAfk = Date.now() - afkData.timestamp;
      const minutesAfk = Math.floor(timeAfk / (1000 * 60));
      
      const embed = new EmbedBuilder()
        .setTitle('🟢 Mode AFK Désactivé')
        .setDescription(`**${message.author.username}** n'est plus en mode AFK`)
        .addFields(
          { name: 'Raison AFK', value: afkData.reason, inline: true },
          { name: 'Durée AFK', value: `${minutesAfk} minute(s)`, inline: true }
        )
        .setColor(0x00FF00)
        .setThumbnail(message.author.displayAvatarURL())
        .setTimestamp();
      
      await message.reply({ embeds: [embed] });
      
      // Retirer l'utilisateur du mode AFK du fichier
      delete afkUsers[message.author.id];
      
      // Sauvegarder le fichier mis à jour
      try {
        fs.writeFileSync(afkFilePath, JSON.stringify(afkUsers, null, 2));
        // Mettre à jour la Map en mémoire aussi
        if (client.afkUsers) {
          client.afkUsers.delete(message.author.id);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression AFK:', error);
      }
    }
    
    // Vérifier si le message contient des mentions et si ces utilisateurs sont AFK
    if (message.mentions.users.size > 0) {
      for (const [userId, afkData] of Object.entries(afkUsers)) {
        if (message.mentions.users.has(userId)) {
          const mentionedUser = message.mentions.users.get(userId);
          const timeAfk = Date.now() - afkData.timestamp;
          const minutesAfk = Math.floor(timeAfk / (1000 * 60));
          
          const embed = new EmbedBuilder()
            .setTitle('🟡 Utilisateur AFK')
            .setDescription(`**${mentionedUser.username}** est actuellement en mode AFK`)
            .addFields(
              { name: 'Raison', value: afkData.reason, inline: true },
              { name: 'Depuis', value: `${minutesAfk} minute(s)`, inline: true }
            )
            .setColor(0xFFA500)
            .setThumbnail(mentionedUser.displayAvatarURL())
            .setTimestamp();
          
          await message.reply({ embeds: [embed] });
        }
      }
    }
  }
};
