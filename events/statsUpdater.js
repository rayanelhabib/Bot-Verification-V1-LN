// events/statsUpdater.js
// Événement pour mettre à jour automatiquement les statistiques du serveur
import { EmbedBuilder } from 'discord.js';
import fs from 'fs';
const config = JSON.parse(fs.readFileSync(new URL('../config.json', import.meta.url)));

export default {
  name: 'ready',
  once: true,
  async execute(client) {
    // Fonction pour envoyer les statistiques
    const sendStats = async () => {
      try {
        const statsChannel = await client.channels.fetch(config.statsChannelId).catch(() => null);
        if (!statsChannel || !statsChannel.isTextBased()) {
          console.error('[StatsUpdater] Salon stats introuvable ou non textuel:', config.statsChannelId);
          return;
        }

        // Récupérer les données du serveur
        const guild = statsChannel.guild;
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

        // Créer l'embed avec les statistiques (format comme dans l'image)
        const statsEmbed = new EmbedBuilder()
          .setAuthor({
            name: 'Late Night Community - Stats',
            iconURL: 'https://images-ext-1.discordapp.net/external/RnJ9tKs4hnxCVWKoAJLZIrKlpQOBB7d3QWsFAdvj8T4/%3Fsize%3D256/https/cdn.discordapp.com/icons/1366177830551162985/a_205db0dad201aa0645e8d9bffdac9a99.gif?width=160&height=160'
          })
          .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
          .setColor(0x949494)
          .setDescription(`
> <:groupchat:1393654024989048923> **Members** : ${totalMembers.toLocaleString()}
> <:on:1413201613325078569> **Online** : ${onlineMembers.toLocaleString()}
> <:volume:1393654026780016720> **In Voice** : ${voiceMembers.toLocaleString()}
> <:nitroln:1398010589435138102> **Boosts** : ${boostCount.toLocaleString()}
          `)
          .setFooter({ 
            text: `Late Night • Stats • ${new Date().toLocaleString('fr-FR')}`, 
            iconURL: client.user.displayAvatarURL() 
          });

        // Chercher le message de stats existant
        const messages = await statsChannel.messages.fetch({ limit: 10 });
        const existingStatsMessage = messages.find(msg => 
          msg.author.id === client.user.id && 
          msg.embeds.length > 0 && 
          msg.embeds[0].title?.includes('Statistiques')
        );

        if (existingStatsMessage) {
          // Mettre à jour le message existant
          await existingStatsMessage.edit({ embeds: [statsEmbed] });
          console.log(`[StatsUpdater] Statistiques mises à jour dans ${statsChannel.name}`);
        } else {
          // Créer un nouveau message si aucun n'existe
          await statsChannel.send({ embeds: [statsEmbed] });
          console.log(`[StatsUpdater] Nouveau message de statistiques créé dans ${statsChannel.name}`);
        }

      } catch (error) {
        console.error('[StatsUpdater] Erreur lors de l\'envoi des statistiques:', error);
      }
    };

    // Envoyer les stats immédiatement au démarrage
    await sendStats();

    // Envoyer les stats selon l'intervalle configuré (par défaut 5 minutes)
    const interval = config.statsUpdateInterval || 300000;
    setInterval(sendStats, interval);

    const intervalMinutes = Math.round(interval / 60000);
    console.log(`[StatsUpdater] Système de statistiques automatiques activé (mise à jour toutes les ${intervalMinutes} minutes)`);
  }
};
