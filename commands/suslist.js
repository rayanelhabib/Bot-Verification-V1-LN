// commands/suslist.js
// Commande =suslist : afficher la liste des utilisateurs suspects
import { hasPermission, logAction } from '../utils.js';
import fs from 'fs';
import { EmbedBuilder } from 'discord.js';

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

export default {
  name: 'suslist',
  description: '<:arrow:1386053533400436776> Show list of all suspicious users',
  usage: '=suslist',
  async execute(message, args) {
    if (!hasPermission(message.member, 'vg')) {
      return message.reply("Vous n'avez pas la permission d'utiliser cette commande.");
    }

    // Charger la liste des utilisateurs sus
    const susUsers = loadSusUsers();
    
    // Log de l'action
    logAction('suslist', `Liste des suspects consultée par ${message.author.tag}`);

    // Si aucun utilisateur suspect
    if (Object.keys(susUsers).length === 0) {
      const embed = new EmbedBuilder()
        .setAuthor({ name: message.client.user.username, iconURL: message.client.user.displayAvatarURL() })
        .setTitle('📋 Suspicious Users List')
        .setDescription('**Aucun utilisateur n\'est actuellement marqué comme suspect.**')
        .setColor(0x4CAF50)
        .setFooter({ text: 'Suspicious User Management • Discord Bot', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      
      return message.reply({ embeds: [embed] });
    }

    // Créer l'embed avec la liste
    const embed = new EmbedBuilder()
      .setAuthor({ name: message.client.user.username, iconURL: message.client.user.displayAvatarURL() })
      .setTitle('🚨 Suspicious Users List')
      .setDescription(`**${Object.keys(susUsers).length} utilisateur(s) marqué(s) comme suspect(s)**`)
      .setColor(0xFF6B6B)
      .setFooter({ text: 'Suspicious User Management • Discord Bot', iconURL: message.client.user.displayAvatarURL() })
      .setTimestamp();

    // Ajouter chaque utilisateur suspect
    for (const [userId, userData] of Object.entries(susUsers)) {
      const markedAt = new Date(userData.markedAt).toLocaleString();
      
      embed.addFields({
        name: `👤 ${userData.userTag}`,
        value: `**ID:** ${userId}\n**Marqué par:** <@${userData.markedBy}> (${userData.markedByTag})\n**Date:** ${markedAt}\n**Raison:** ${userData.reason}`,
        inline: false
      });
    }

    return message.reply({ embeds: [embed] });
  }
};
