// commands/unban.js
// Commande =unban : débannir un utilisateur par ID
import { hasPermission, logAction, logToFile } from '../utils.js';
import fs from 'fs';
const config = JSON.parse(fs.readFileSync(new URL('../config.json', import.meta.url)));
import { EmbedBuilder } from 'discord.js';

export default {
  name: 'unban',
  description: '<:arrow:1386053533400436776> Unban a member ',
  usage: '=unban user_id',
  async execute(message, args) {
    if (!hasPermission(message.member, 'unban')) {
      return message.reply("Vous n’avez pas la permission d’utiliser cette commande.");
    }
    const userId = args[0];
    if (!userId) return message.reply('Veuillez fournir un ID utilisateur.');
    try {
      await message.guild.members.unban(userId);
      // Envoi du DM à l'utilisateur unban
      try {
        const user = await message.client.users.fetch(userId);
        const dmEmbed = new EmbedBuilder()
          .setTitle('✅ Unban Notification')
          .setDescription(`Hello ${user},\n\nYou have been unbanned from **Late Night Community**.`)
          .setFooter({ text: `Action by: ${message.author.tag}` })
          .setThumbnail(message.client.user.displayAvatarURL())
          .setColor(0x43b581)
          .setTimestamp();
        await user.send({ embeds: [dmEmbed] });
      } catch (dmError) {
        // Si le DM échoue (DM fermés, etc.), on ignore l'erreur
      }
      logAction('unban', `ID ${userId} débanni par ${message.author.tag}`);
      await logToFile({
        action: 'unban',
        user: { id: userId },
        by: { id: message.author.id, tag: message.author.tag },
        date: new Date().toISOString(),
        guild: { id: message.guild.id, name: message.guild.name }
      });
      // Embed stylé
      const embed = new EmbedBuilder()
        .setAuthor({ name: message.client.user.username, iconURL: message.client.user.displayAvatarURL() })
        .setTitle('✅ Member Unbanned')
        .setDescription(`The user with ID ${userId} has been unbanned!`)
        .setThumbnail(message.client.user.displayAvatarURL())
        .setColor(0x43b581)
        .setFooter({ text: 'Moderation • Discord Bot', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    } catch (err) {
      return message.reply('Erreur lors du débannissement ou utilisateur non banni.');
    }
  }
}; 