// events/guildMemberAdd.js
// Gère l'arrivée de nouveaux membres et restaure le statut jailé si nécessaire
import { EmbedBuilder } from 'discord.js';
import fs from 'fs';
const config = JSON.parse(fs.readFileSync(new URL('../config.json', import.meta.url)));

export default (client) => {
  client.on('guildMemberAdd', async (member) => {
    try {
      // Vérifier si le membre était jailé
      const jailedRolesPath = new URL('../jailedRoles.json', import.meta.url);
      let jailedRoles = {};
      
      try {
        jailedRoles = JSON.parse(fs.readFileSync(jailedRolesPath));
      } catch (e) {
        // Fichier vide ou inexistant, on continue
      }

      // Si le membre était jailé
      if (jailedRoles[member.id]) {
        // Lui redonner le rôle jailed
        await member.roles.add(config.roleIds.jailed);
        
        // Log de l'action
        console.log(`[JAIL RESTORE] ${member.user.tag} (${member.id}) a rejoint le serveur et a été re-jailé automatiquement`);
        
        // Envoyer un embed dans le salon de logs
        const logChannel = member.guild.channels.cache.get(config.channels.verification_logs);
        if (logChannel) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
            .setTitle('🚫 Jail Status Restored')
            .setDescription(`**A previously jailed member has rejoined the server!**`)
            .addFields(
              { name: '👤 Member', value: `${member} (${member.user.tag})`, inline: true },
              { name: '🛡️ Action', value: 'Auto-jail restore', inline: true },
              { name: '📝 Status', value: 'Previously jailed member', inline: false }
            )
            .setThumbnail(client.user.displayAvatarURL())
            .setColor(0xff0000)
            .setFooter({ text: 'Auto-Moderation • Discord Bot', iconURL: client.user.displayAvatarURL() })
            .setTimestamp();
          
          await logChannel.send({ embeds: [embed] });
        }
        
        // Envoyer un DM au membre
        try {
          const dmEmbed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('🚫 Jail Status Restored')
            .setDescription(`Hello ${member},\n\nYou have rejoined **Late Night Community**, but your previous jail status has been automatically restored.\n\nYou are still under moderation restrictions. Please contact the moderation team if you believe this is an error or wish to appeal your previous punishment.\n\nThank you for understanding.`)
            .setTimestamp();
          
          await member.send({ embeds: [dmEmbed] });
        } catch (dmError) {
          // DM fermés, on ignore
        }
        
      } else {
        // Nouveau membre, lui donner le rôle unverified
        await member.roles.add(config.roleIds.unverified);
        
        console.log(`[NEW MEMBER] ${member.user.tag} (${member.id}) a rejoint le serveur et a reçu le rôle unverified`);
        
        // Envoyer un embed de bienvenue dans le salon de logs
        const logChannel = member.guild.channels.cache.get(config.channels.verification_logs);
        if (logChannel) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
            .setTitle('👋 New Member Joined')
            .setDescription(`**A new member has joined the server!**`)
            .addFields(
              { name: '👤 Member', value: `${member} (${member.user.tag})`, inline: true },
              { name: '🛡️ Action', value: 'Auto-unverified', inline: true },
              { name: '📝 Status', value: 'Awaiting verification', inline: false }
            )
            .setThumbnail(client.user.displayAvatarURL())
            .setColor(0x5865F2)
            .setFooter({ text: 'Verification System • Discord Bot', iconURL: client.user.displayAvatarURL() })
            .setTimestamp();
          
          await logChannel.send({ embeds: [embed] });
        }
      }
      
    } catch (error) {
      console.error('[GUILD_MEMBER_ADD ERROR]', error);
    }
  });
}; 