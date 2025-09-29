// commands/warn.js
// Commande =warn : gestion des warns (first_warn, last_warn, jail)
import { hasPermission, addRole, removeRole, logAction, resolveMember, logToFile } from '../utils.js';
import fs from 'fs';
const config = JSON.parse(fs.readFileSync(new URL('../config.json', import.meta.url)));
import { EmbedBuilder } from 'discord.js';

export default {
  name: 'warn',
  description: '<:arrow:1386053533400436776> Warn a member.',
  usage: '=warn @user/id [reason]',
  async execute(message, args) {
    if (!hasPermission(message.member, 'warn')) {
      return message.reply("Vous n’avez pas la permission d’utiliser cette commande.");
    }
    const member = await resolveMember(message, args[0]);
    if (!member) return message.reply('Utilisateur introuvable.');
    const reason = args.slice(1).join(' ') || 'Aucune raison spécifiée.';
    const hasFirst = member.roles.cache.has(config.roleIds.first_warn);
    const hasLast = member.roles.cache.has(config.roleIds.last_warn);
    if (!hasFirst && !hasLast) {
      await addRole(member, config.roleIds.first_warn);
      logAction('warn', `${member.user.tag} reçoit first_warn par ${message.author.tag}`);
      await logToFile({
        action: 'warn',
        type: 'first',
        user: { id: member.id, tag: member.user.tag },
        by: { id: message.author.id, tag: message.author.tag },
        reason,
        date: new Date().toISOString(),
        guild: { id: message.guild.id, name: message.guild.name }
      });
      // Embed stylé
      const embed = new EmbedBuilder()
        .setAuthor({ name: message.client.user.username, iconURL: message.client.user.displayAvatarURL() })
        .setTitle('⚠️ Warn Issued')
        .setDescription(`**A first warning has been issued!**`)
        .addFields(
          { name: '👤 Member', value: `${member} ( ${member.user.tag})`, inline: true },
          { name: '🛡️ Action', value: 'First warning', inline: true },
          { name: '✍️ Warned by', value: `${message.author} ( ${message.author.tag})`, inline: false },
          { name: '📝 Reason', value: reason, inline: false }
        )
        .setThumbnail(message.client.user.displayAvatarURL())
        .setColor(0xffcc00)
        .setFooter({ text: 'Moderation Logs • Discord Bot', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      try {
        await member.send({ embeds: [embed] });
      } catch (e) {}
      // Envoi dans le salon de preuve
      const proofChannel = message.guild.channels.cache.get(config.channels.warn_proof);
      if (proofChannel) {
        await proofChannel.send({ embeds: [embed] });
      }
      return message.reply({ embeds: [embed] });
    } else if (hasFirst && !hasLast) {
      await addRole(member, config.roleIds.last_warn);
      logAction('warn', `${member.user.tag} reçoit last_warn par ${message.author.tag}`);
      await logToFile({
        action: 'warn',
        type: 'last',
        user: { id: member.id, tag: member.user.tag },
        by: { id: message.author.id, tag: message.author.tag },
        reason,
        date: new Date().toISOString(),
        guild: { id: message.guild.id, name: message.guild.name }
      });
      // Embed stylé
      const embed = new EmbedBuilder()
        .setAuthor({ name: message.client.user.username, iconURL: message.client.user.displayAvatarURL() })
        .setTitle('⚠️ Warn Issued')
        .setDescription(`**A last warning has been issued!**`)
        .addFields(
          { name: '👤 Member', value: `${member} ( ${member.user.tag})`, inline: true },
          { name: '🛡️ Action', value: 'Last warning', inline: true },
          { name: '✍️ Warned by', value: `${message.author} ( ${message.author.tag})`, inline: false },
          { name: '📝 Reason', value: reason, inline: false }
        )
        .setThumbnail(message.client.user.displayAvatarURL())
        .setColor(0xff6600)
        .setFooter({ text: 'Moderation Logs • Discord Bot', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      try {
        await member.send({ embeds: [embed] });
      } catch (e) {}
      // Envoi dans le salon de preuve
      const proofChannel = message.guild.channels.cache.get(config.channels.warn_proof);
      if (proofChannel) {
        await proofChannel.send({ embeds: [embed] });
      }
      return message.reply({ embeds: [embed] });
    } else if (hasFirst && hasLast) {
      // Retirer tous les rôles de vérification
      const rolesToRemove = [
        config.roleIds.unverified,
        config.roleIds.verified,
        config.roleIds.verified_female,
        config.roleIds.first_warn,
        config.roleIds.last_warn
      ].filter(roleId => member.roles.cache.has(roleId));
      if (rolesToRemove.length > 0) {
        await member.roles.remove(rolesToRemove);
      }
      // Ajouter le rôle jailed
      await addRole(member, config.roleIds.jailed);
      logAction('warn', `${member.user.tag} jailé après 2 warns par ${message.author.tag}`);
      await logToFile({
        action: 'jail',
        type: 'warn',
        user: { id: member.id, tag: member.user.tag },
        by: { id: message.author.id, tag: message.author.tag },
        reason,
        date: new Date().toISOString(),
        guild: { id: message.guild.id, name: message.guild.name }
      });
      // Embed stylé
      const embed = new EmbedBuilder()
        .setAuthor({ name: message.client.user.username, iconURL: message.client.user.displayAvatarURL() })
        .setTitle('🚫 Jailed')
        .setDescription(`**A member has been jailed after two warnings!**`)
        .addFields(
          { name: '👤 Member', value: `${member} ( ${member.user.tag})`, inline: true },
          { name: '🛡️ Action', value: 'Jailed after 2 warns', inline: true },
          { name: '✍️ Jailed by', value: `${message.author} ( ${message.author.tag})`, inline: false }
        )
        .setThumbnail(message.client.user.displayAvatarURL())
        .setColor(0xff0000)
        .setFooter({ text: 'Moderation Logs • Discord Bot', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      try {
        await member.send({ embeds: [embed] });
      } catch (e) {}
      // Envoi dans le salon de preuve
      const proofChannel = message.guild.channels.cache.get(config.channels.warn_proof);
      if (proofChannel) {
        await proofChannel.send({ embeds: [embed] });
      }
      return message.reply({ embeds: [embed] });
    }
  }
}; 