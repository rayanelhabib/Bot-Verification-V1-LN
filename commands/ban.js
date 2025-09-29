// commands/ban.js
// Commande =ban : bannir un membre avec raison
import { hasPermission, logAction, resolveMember, logToFile } from '../utils.js';
import fs from 'fs';
const config = JSON.parse(fs.readFileSync(new URL('../config.json', import.meta.url)));
import { EmbedBuilder } from 'discord.js';

export default {
  name: 'ban',
  description: ' <:arrow:1386053533400436776> Ban a member.',
  usage: '=ban @user [reason]',
  async execute(message, args) {
    if (!hasPermission(message.member, 'ban')) {
      return message.reply("Vous n’avez pas la permission d’utiliser cette commande.");
    }
    const member = await resolveMember(message, args[0]);
    if (!member) return message.reply('Utilisateur introuvable.');
    const reason = args.slice(1).join(' ') || 'Aucune raison spécifiée.';
    try {
      await member.ban({ reason });
      // Envoi du DM à l'utilisateur banni
      try {
        const dmEmbed = new EmbedBuilder()
          .setTitle('⛔ Ban Notification')
          .setDescription(`Hello ${member},\n\nYou have been banned from **Late Night Community**.`)
          .addFields(
            { name: 'Reason', value: reason || 'No reason provided.', inline: false },
          )
          .setFooter({ text: `Action by: ${message.author.tag}` })
          .setThumbnail(message.client.user.displayAvatarURL())
          .setColor(0xff0000)
          .setTimestamp();
        await member.send({ embeds: [dmEmbed] });
      } catch (dmError) {
        // Si le DM échoue (DM fermés, etc.), on ignore l'erreur
      }
      logAction('ban', `${member.user.tag} banni par ${message.author.tag} (raison: ${reason})`);
      await logToFile({
        action: 'ban',
        user: { id: member.id, tag: member.user.tag },
        by: { id: message.author.id, tag: message.author.tag },
        reason,
        date: new Date().toISOString(),
        guild: { id: message.guild.id, name: message.guild.name }
      });
      // Embed stylé
      const embed = new EmbedBuilder()
        .setAuthor({ name: message.client.user.username, iconURL: message.client.user.displayAvatarURL() })
        .setTitle('🔨 Ban Successfully')
        .setDescription(`**A member has been banned!**`)
        .addFields(
          { name: '👤 Member', value: `${member} ( ${member.user.tag})`, inline: true },
          { name: '🛡️ Action', value: 'Ban', inline: true },
          { name: '✍️ Banned by', value: `${message.author} ( ${message.author.tag})`, inline: false },
          { name: '📝 Reason', value: reason, inline: false }
        )
        .setThumbnail(message.client.user.displayAvatarURL())
        .setColor(0xff0000)
        .setFooter({ text: 'Moderation Logs • Discord Bot', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      return message.reply({ embeds: [embed] });
      // Envoi dans le salon de preuve
      const proofChannel = message.guild.channels.cache.get(config.channels.ban_proof);
      if (proofChannel) {
        await proofChannel.send({ embeds: [embed] });
      }
    } catch (err) {
      return message.reply('Erreur lors du bannissement.');
    }
  }
}; 