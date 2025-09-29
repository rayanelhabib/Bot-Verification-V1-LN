// commands/timeout.js
// Commande =timeout : mute temporaire avec durée et raison
import { hasPermission, logAction, resolveMember, logToFile } from '../utils.js';
import fs from 'fs';
const config = JSON.parse(fs.readFileSync(new URL('../config.json', import.meta.url)));
import { EmbedBuilder } from 'discord.js';

export default {
  name: 'timeout',
  description: ' <:arrow:1386053533400436776> Timeout a member for a period.',
  usage: '=timeout @user [minutes] [reason]',
  async execute(message, args) {
    if (!hasPermission(message.member, 'timeout')) {
      return message.reply("Vous n’avez pas la permission d’utiliser cette commande.");
    }
    const member = await resolveMember(message, args[0]);
    if (!member) return message.reply('Utilisateur introuvable.');
    const minutes = parseInt(args[1], 10);
    if (isNaN(minutes) || minutes < 1) return message.reply('Veuillez spécifier une durée en minutes.');
    const reason = args.slice(2).join(' ') || 'Aucune raison spécifiée.';
    try {
      await member.timeout(minutes * 60 * 1000, reason);
      await logToFile({
        action: 'timeout',
        user: { id: member.id, tag: member.user.tag },
        by: { id: message.author.id, tag: message.author.tag },
        reason,
        duration: minutes,
        date: new Date().toISOString(),
        guild: { id: message.guild.id, name: message.guild.name }
      });
      logAction('timeout', `${member.user.tag} timeout ${minutes}min par ${message.author.tag} (raison: ${reason})`);
      // Embed stylé
      const embed = new EmbedBuilder()
        .setAuthor({ name: message.client.user.username, iconURL: message.client.user.displayAvatarURL() })
        .setTitle('⏰ Timeout Issued')
        .setDescription(`The user ${member} has been muted for ${minutes} minutes!`)
        .setThumbnail(message.client.user.displayAvatarURL())
        .setColor(0xffcc00)
        .addFields(
          { name: '📝 Reason', value: reason, inline: false }
        )
        .setFooter({ text: 'Moderation • Discord Bot', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    } catch (err) {
      return message.reply('Erreur lors du timeout.');
    }
  }
}; 