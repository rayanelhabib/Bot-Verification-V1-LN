// commands/unsus.js
// Commande =unsus : retirer le marquage suspect d'un utilisateur
import { hasPermission, resolveMember, logAction } from '../utils.js';
import fs from 'fs';
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
  name: 'unsus',
  description: '<:arrow:1386053533400436776> Remove suspicious mark from a user',
  usage: '=unsus @user',
  async execute(message, args) {
    if (!hasPermission(message.member, 'vg')) {
      return message.reply("Vous n'avez pas la permission d'utiliser cette commande.");
    }

    const member = await resolveMember(message, args[0]);
    if (!member) return message.reply('Utilisateur introuvable.');

    // Charger la liste des utilisateurs sus
    const susUsers = loadSusUsers();
    
    // Vérifier si l'utilisateur est marqué comme suspect
    if (!susUsers[member.id]) {
      return message.reply("❌ Cet utilisateur n'est pas marqué comme suspect.");
    }

    // Vérifier si c'est la même personne qui l'a marqué comme suspect
    if (susUsers[member.id].markedBy !== message.author.id) {
      return message.reply("❌ Seule la personne qui a marqué cet utilisateur comme suspect peut retirer le marquage.");
    }

    // Retirer le marquage suspect
    const removedUser = susUsers[member.id];
    delete susUsers[member.id];

    // Sauvegarder la liste
    saveSusUsers(susUsers);

    // Log de l'action
    logAction('unsus', `${member.user.tag} retiré de la liste des suspects par ${message.author.tag}`);

    // Log dans le salon de logs
    const logChannel = message.guild.channels.cache.get(config.channels.unsus_logs);
    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setAuthor({ name: message.client.user.username, iconURL: message.client.user.displayAvatarURL() })
        .setTitle('✅ Suspicious Mark Removed')
        .setDescription(`**A user has been removed from the suspicious list and can now be verified.**`)
        .addFields(
          { name: '👤 User', value: `${member} (${member.user.tag})`, inline: true },
          { name: '🛡️ Action', value: 'Removed from suspicious (unsus)', inline: true },
          { name: '🔧 Removed by', value: `${message.author} (${message.author.tag})`, inline: false },
          { name: '📝 Previous reason', value: removedUser.reason, inline: false }
        )
        .setThumbnail(member.user.displayAvatarURL())
        .setColor(0x4CAF50)
        .setFooter({ text: 'Suspicious User Logs • Discord Bot', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      await logChannel.send({ embeds: [logEmbed] });
    }

    // Embed de confirmation
    const embed = new EmbedBuilder()
      .setAuthor({ name: message.client.user.username, iconURL: message.client.user.displayAvatarURL() })
      .setTitle('✅ Suspicious Mark Removed')
      .setDescription(`**${member} has been removed from the suspicious list and can now be verified.**`)
      .addFields(
        { name: '👤 User', value: `${member} (${member.user.tag})`, inline: true },
        { name: '🛡️ Removed by', value: `${message.author} (${message.author.tag})`, inline: true },
        { name: '📅 Removed at', value: new Date().toLocaleString(), inline: false },
        { name: '📝 Previous reason', value: removedUser.reason, inline: false }
      )
      .setThumbnail(member.user.displayAvatarURL())
      .setColor(0x4CAF50)
      .setFooter({ text: 'Suspicious User Management • Discord Bot', iconURL: message.client.user.displayAvatarURL() })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};
