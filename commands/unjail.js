// commands/unjail.js
// Commande =unjail : retire 'jailed' et remet 'unverified'
import { hasPermission, addRole, removeRole, logAction, resolveMember, logToFile } from '../utils.js';
import fs from 'fs';
const config = JSON.parse(fs.readFileSync(new URL('../config.json', import.meta.url)));
import { EmbedBuilder } from 'discord.js';

export default {
  name: 'unjail',
  description: '<:arrow:1386053533400436776> Remove jail role from a member.',
  usage: '=unjail @user',
  async execute(message, args) {
    if (!hasPermission(message.member, 'unjail')) {
      return message.reply("Vous n’avez pas la permission d’utiliser cette commande.");
    }
    const member = await resolveMember(message, args[0]);
    if (!member) return message.reply('Utilisateur introuvable.');
    try {
      // Retirer le rôle jail
      await removeRole(member, config.roleIds.jailed);
      // Restaurer les rôles sauvegardés
      const jailedRolesPath = new URL('../jailedRoles.json', import.meta.url);
      let jailedRoles = {};
      try {
        jailedRoles = JSON.parse(fs.readFileSync(jailedRolesPath));
      } catch (e) {}
      const rolesToRestore = jailedRoles[member.id];
      if (rolesToRestore && Array.isArray(rolesToRestore) && rolesToRestore.length > 0) {
        // Vérifier que les rôles existent toujours
        const validRoles = rolesToRestore.filter(roleId => message.guild.roles.cache.has(roleId));
        if (validRoles.length > 0) {
          await member.roles.add(validRoles);
        }
        // Supprimer l'entrée du membre dans le fichier
        delete jailedRoles[member.id];
        fs.writeFileSync(jailedRolesPath, JSON.stringify(jailedRoles, null, 2));
      } else {
        // Si pas de rôles sauvegardés, on met juste unverified
        await addRole(member, config.roleIds.unverified);
      }
      // Envoi du DM à l'utilisateur unjail
      try {
        const dmEmbed = new EmbedBuilder()
          .setTitle('✅ Unjail Notification')
          .setDescription(`Hello ${member},\n\nYou have been unjailed on **Late Night Community**. You are now set as unverified.`)
          .setFooter({ text: `Action by: ${message.author.tag}` })
          .setThumbnail(message.client.user.displayAvatarURL())
          .setColor(0x43b581)
          .setTimestamp();
        await member.send({ embeds: [dmEmbed] });
      } catch (dmError) {
        // Si le DM échoue (DM fermés, etc.), on ignore l'erreur
      }
      await logToFile({
        action: 'unjail',
        user: { id: member.id, tag: member.user.tag },
        by: { id: message.author.id, tag: message.author.tag },
        date: new Date().toISOString(),
        guild: { id: message.guild.id, name: message.guild.name }
      });
      // Embed stylé
      const embed = new EmbedBuilder()
        .setAuthor({ name: message.client.user.username, iconURL: message.client.user.displayAvatarURL() })
        .setTitle('✅ Member Unjailed')
        .setDescription(`The user ${member} has been unjailed and set as unverified!`)
        .setThumbnail(message.client.user.displayAvatarURL())
        .setColor(0x43b581)
        .addFields(
          { name: '👤 Member', value: `${member} (${member.user.tag})`, inline: true },
          { name: '🛡️ Action', value: 'Unjail', inline: true },
          { name: '✍️ Unjailed by', value: `${message.author} (${message.author.tag})`, inline: false }
        )
        .setFooter({ text: 'Moderation • Discord Bot', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      // Envoi dans le salon de preuve
      const proofChannel = message.guild.channels.cache.get(config.channels.unjail_proof);
      if (proofChannel) {
        await proofChannel.send({ embeds: [embed] });
      }
      return message.reply({ embeds: [embed] });
    } catch (err) {
      return message.reply('Erreur lors du unjail.');
    }
  }
}; 