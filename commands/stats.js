// commands/stats.js
// Commande =stats : affiche les statistiques du serveur
import { EmbedBuilder } from 'discord.js';
import fs from 'fs';
const config = JSON.parse(fs.readFileSync(new URL('../config.json', import.meta.url)));

export default {
  name: 'stats',
  description: '<:arrow:1386053533400436776> Affiche les statistiques du serveur',
  usage: '=stats',
  async execute(message) {
    try {
      const guild = message.guild;
      
      // Récupérer les données du serveur
      const totalMembers = guild.memberCount;
      const onlineMembers = guild.members.cache.filter(member => 
        member.presence?.status === 'online' || 
        member.presence?.status === 'idle' || 
        member.presence?.status === 'dnd'
      ).size;
      const voiceMembers = guild.members.cache.filter(member => 
        member.voice.channel && !member.user.bot
      ).size;
      const boostLevel = guild.premiumTier;
      const boostCount = guild.premiumSubscriptionCount;
      const boosters = guild.members.cache.filter(member => member.premiumSince).size;
      const botCount = guild.members.cache.filter(member => member.user.bot).size;
      const humanCount = totalMembers - botCount;

      // Calculer les pourcentages
      const onlinePercentage = Math.round((onlineMembers / totalMembers) * 100);
      const voicePercentage = Math.round((voiceMembers / totalMembers) * 100);
      const humanPercentage = Math.round((humanCount / totalMembers) * 100);

              // Créer l'embed avec les statistiques (champs verticaux)
        const statsEmbed = new EmbedBuilder()
          .setTitle(`📊 ${guild.name} - Statistiques`)
          .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
          .setColor(0x5865F2)
          .addFields(
            { 
              name: '👥 Membres', 
              value: `**Total:** ${totalMembers.toLocaleString()}\n**Humains:** ${humanCount.toLocaleString()} (${humanPercentage}%)\n**Bots:** ${botCount.toLocaleString()}\n**En ligne:** ${onlineMembers.toLocaleString()} (${onlinePercentage}%)`, 
              inline: false 
            },
            { 
              name: '🎵 Vocal', 
              value: `**En vocal:** ${voiceMembers.toLocaleString()}\n**Pourcentage:** ${voicePercentage}%`, 
              inline: false 
            },
            { 
              name: '🚀 Boost', 
              value: `**Niveau:** ${boostLevel}/3\n**Boosts:** ${boostCount.toLocaleString()}\n**Boosters:** ${boosters.toLocaleString()}`, 
              inline: false 
            },
            { 
              name: '📅 Création', 
              value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, 
              inline: false 
            },
            { 
              name: '👑 Propriétaire', 
              value: `<@${guild.ownerId}>`, 
              inline: false 
            },
            { 
              name: '🎭 Rôles & Salons', 
              value: `**Rôles:** ${guild.roles.cache.size}\n**Salons:** ${guild.channels.cache.size}`, 
              inline: false 
            }
          )
          .setFooter({ 
            text: `Serveur complet • Statistiques • ${new Date().toLocaleString('fr-FR')}`, 
            iconURL: message.client.user.displayAvatarURL() 
          })
          .setTimestamp();

        await message.reply({ embeds: [statsEmbed] });
      
    } catch (error) {
      console.error('[Stats Command] Erreur:', error);
      await message.reply('❌ Erreur lors de la récupération des statistiques.');
    }
  }
};
