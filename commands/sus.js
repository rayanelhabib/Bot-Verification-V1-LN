// commands/sus.js
// Commande =sus : marquer un utilisateur comme suspect (empêche la vérification)
import { hasPermission, resolveMember, logAction } from '../utils.js';
import fs from 'fs';
import path from 'path';
import { EmbedBuilder } from 'discord.js';

const config = JSON.parse(fs.readFileSync(new URL('../config.json', import.meta.url)));

const susFile = './susUsers.json';

// Fonction pour charger la liste des utilisateurs sus
function loadSusUsers() {
  try {
    if (fs.existsSync(susFile)) {
      const data = fs.readFileSync(susFile, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs sus:', error);
  }
  return {};
}

// Fonction pour sauvegarder la liste des utilisateurs sus
function saveSusUsers(susUsers) {
  try {
    fs.writeFileSync(susFile, JSON.stringify(susUsers, null, 2));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des utilisateurs sus:', error);
  }
}

export default {
  name: 'sus',
  description: '<:arrow:1386053533400436776> Mark a user as suspicious (prevents verification)',
  usage: '=sus @user',
  async execute(message, args) {
    if (!hasPermission(message.member, 'vg')) {
      return message.reply("Vous n'avez pas la permission d'utiliser cette commande.");
    }

    const member = await resolveMember(message, args[0]);
    if (!member) return message.reply('Utilisateur introuvable.');

    // Vérifier si l'utilisateur est déjà vérifié
    if (member.roles.cache.has('1372701919348396175') || member.roles.cache.has('1372701747440652309')) {
      return message.reply("❌ Cet utilisateur est déjà vérifié et ne peut pas être marqué comme suspect.");
    }

    // Charger la liste des utilisateurs sus
    const susUsers = loadSusUsers();
    
    // Vérifier si l'utilisateur est déjà marqué comme suspect
    if (susUsers[member.id]) {
      return message.reply("❌ Cet utilisateur est déjà marqué comme suspect.");
    }

    // Marquer l'utilisateur comme suspect
    susUsers[member.id] = {
      userId: member.id,
      userTag: member.user.tag,
      markedBy: message.author.id,
      markedByTag: message.author.tag,
      markedAt: new Date().toISOString(),
      reason: args.slice(1).join(' ') || 'Aucune raison spécifiée'
    };

    // Sauvegarder la liste
    saveSusUsers(susUsers);

    // Log de l'action
    logAction('sus', `${member.user.tag} marqué comme suspect par ${message.author.tag}`);

    // Log dans le salon de logs
    const logChannel = message.guild.channels.cache.get(config.channels.sus_logs);
    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setAuthor({ name: message.client.user.username, iconURL: message.client.user.displayAvatarURL() })
        .setTitle('🚨 User Marked as Suspicious')
        .setDescription(`**A user has been marked as suspicious and cannot be verified.**`)
        .addFields(
          { name: '👤 User', value: `${member} (${member.user.tag})`, inline: true },
          { name: '🛡️ Action', value: 'Marked as suspicious (sus)', inline: true },
          { name: '🔧 Marked by', value: `${message.author} (${message.author.tag})`, inline: false },
          { name: '📝 Reason', value: susUsers[member.id].reason, inline: false }
        )
        .setThumbnail(member.user.displayAvatarURL())
        .setColor(0xFF6B6B)
        .setFooter({ text: 'Suspicious User Logs • Discord Bot', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      await logChannel.send({ embeds: [logEmbed] });
    }

    // Embed de confirmation
    const embed = new EmbedBuilder()
      .setAuthor({ name: message.client.user.username, iconURL: message.client.user.displayAvatarURL() })
      .setTitle('🚨 User Marked as Suspicious')
      .setDescription(`**${member} has been marked as suspicious and cannot be verified.**`)
      .addFields(
        { name: '👤 User', value: `${member} (${member.user.tag})`, inline: true },
        { name: '🛡️ Marked by', value: `${message.author} (${message.author.tag})`, inline: true },
        { name: '📅 Marked at', value: new Date().toLocaleString(), inline: false },
        { name: '📝 Reason', value: susUsers[member.id].reason, inline: false }
      )
      .setThumbnail(member.user.displayAvatarURL())
      .setColor(0xFF6B6B)
      .setFooter({ text: 'Suspicious User Management • Discord Bot', iconURL: message.client.user.displayAvatarURL() })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};
