// commands/kick.js
// Commande =kick : expulser un membre avec raison
import { hasPermission, logAction, resolveMember, logToFile } from '../utils.js';
import fs from 'fs';
const config = JSON.parse(fs.readFileSync(new URL('../config.json', import.meta.url)));
import { EmbedBuilder } from 'discord.js';

export default {
  name: 'kick',
  description: ' <:arrow:1386053533400436776> Kick a member.',
  usage: '=kick @user [reason]',
  async execute(message, args) {
    if (!hasPermission(message.member, 'kick')) {
      return message.reply("Vous n’avez pas la permission d’utiliser cette commande.");
    }
    const member = await resolveMember(message, args[0]);
    if (!member) return message.reply('Utilisateur introuvable.');
    const reason = args.slice(1).join(' ') || 'Aucune raison spécifiée.';
    try {
      await member.kick(reason);
      logAction('kick', `${member.user.tag} expulsé par ${message.author.tag} (raison: ${reason})`);
      await logToFile({
        action: 'kick',
        user: { id: member.id, tag: member.user.tag },
        by: { id: message.author.id, tag: message.author.tag },
        reason,
        date: new Date().toISOString(),
        guild: { id: message.guild.id, name: message.guild.name }
      });
      // Embed stylé
      const embed = new EmbedBuilder()
        .setAuthor({ name: message.client.user.username, iconURL: message.client.user.displayAvatarURL() })
        .setTitle('👢 Member Kicked')
        .setDescription(`The user ${member} has been kicked from the server!`)
        .setThumbnail(message.client.user.displayAvatarURL())
        .setColor(0xff6600)
        .addFields(
          { name: '📝 Reason', value: reason, inline: false }
        )
        .setFooter({ text: 'Moderation • Discord Bot', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    } catch (err) {
      return message.reply('Erreur lors de l’expulsion.');
    }
  }
}; 