// commands/jail.js
// Commande =jail : retire tous les rôles et ajoute 'jailed'
import { hasPermission, logAction, resolveMember, logToFile } from '../utils.js';
import fs from 'fs';
const config = JSON.parse(fs.readFileSync(new URL('../config.json', import.meta.url)));
import { EmbedBuilder } from 'discord.js';

export default {
  name: 'jail',
  description: ' <:arrow:1386053533400436776> Jail a member',
  usage: '=jail @user/id [reason]',
  async execute(message, args) {
    if (!hasPermission(message.member, 'jail')) {
      return message.reply("Vous n’avez pas la permission d’utiliser cette commande.");
    }
    const member = await resolveMember(message, args[0]);
    if (!member) return message.reply('Utilisateur introuvable.');
    // Récupérer la raison
    const reason = args.slice(1).join(' ') || 'Aucune raison spécifiée.';
    try {
      // Sauvegarder les rôles avant de jail
      const jailedRolesPath = new URL('../jailedRoles.json', import.meta.url);
      let jailedRoles = {};
      try {
        jailedRoles = JSON.parse(fs.readFileSync(jailedRolesPath));
      } catch (e) {}
      // Exclure @everyone et le rôle jail
      const rolesToSave = member.roles.cache.filter(r => r.id !== message.guild.id && r.id !== config.roleIds.jailed).map(r => r.id);
      jailedRoles[member.id] = rolesToSave;
      fs.writeFileSync(jailedRolesPath, JSON.stringify(jailedRoles, null, 2));
      // Retirer tous les rôles sauf @everyone
      const rolesToRemove = member.roles.cache.filter(r => r.id !== message.guild.id);
      await member.roles.remove(rolesToRemove);
      // Ajouter le rôle jailed
      await member.roles.add(config.roleIds.jailed);
      logAction('jail', `${member.user.tag} jailé par ${message.author.tag} (raison: ${reason})`);
      await logToFile({
        action: 'jail',
        type: 'manual',
        user: { id: member.id, tag: member.user.tag },
        by: { id: message.author.id, tag: message.author.tag },
        reason,
        date: new Date().toISOString(),
        guild: { id: message.guild.id, name: message.guild.name }
      });
      // Embed stylé
      const embed = new EmbedBuilder()
        .setAuthor({ name: message.client.user.username, iconURL: message.client.user.displayAvatarURL() })
        .setTitle('🚫 Member Jailed')
        .setDescription(`The user ${member} has been jailed!`)
        .setThumbnail(message.client.user.displayAvatarURL())
        .setColor(0xff0000)
        .addFields(
          { name: '👤 Member', value: `${member} (${member.user.tag})`, inline: true },
          { name: '🛡️ Action', value: 'Jail', inline: true },
          { name: '✍️ Jailed by', value: `${message.author} (${message.author.tag})`, inline: false },
          { name: '📝 Reason', value: reason, inline: false }
        )
        .setFooter({ text: 'Moderation • Discord Bot', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      // Embed DM personnalisé pour le membre jailé
      const jailDmEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('🚫 You have been jailed in Late Night Community')
        .setDescription(`Dear ${member},\n\nYou have been **jailed** by the moderation team.\n\n**Reason:** ${reason}\n\nWhile jailed, your access to the server is restricted. Please take this time to review the server rules and reflect on your actions.\n\nIf you believe this is a mistake or wish to appeal, you may contact the moderation team.\n\nWe hope to see you rejoin the community soon under better circumstances.`)
        .setImage('https://cdn.discordapp.com/attachments/1366652118722940981/1378407614353768578/d880a64b7b31816fec85debdf0c369d7.webp?ex=687d1720&is=687bc5a0&hm=1929ebe10bc9a6956a5fba361c01e45eb1e6d68c5ba7db1ff56b9aeee0082ecc&')
        .setTimestamp();
      try {
        await member.send({ embeds: [jailDmEmbed] });
      } catch (e) {}
      // Envoi dans le salon de preuve
      const proofChannel = message.guild.channels.cache.get(config.channels.jail_proof);
      if (proofChannel) {
        await proofChannel.send({ embeds: [embed] });
      }
      return message.reply({ embeds: [embed] });
    } catch (err) {
      console.error('[JAIL ERROR]', err);
      return message.reply('Erreur lors du jail.');
    }
  }
}; 