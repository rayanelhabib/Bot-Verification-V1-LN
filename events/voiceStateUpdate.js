// events/voiceStateUpdate.js
// Détecte l'entrée dans le salon vocal de vérification et envoie une alerte dans le salon textuel
import { EmbedBuilder, ChannelType } from 'discord.js';
import fs from 'fs';
const config = JSON.parse(fs.readFileSync(new URL('../config.json', import.meta.url)));

export default (client) => {
  client.on('voiceStateUpdate', async (oldState, newState) => {
    // Vérifie si l'utilisateur vient de rejoindre le salon vocal de vérification
    if (
      oldState.channelId !== config.channels.verification_voice &&
      newState.channelId === config.channels.verification_voice
    ) {
      const guild = newState.guild;
      const textChannel = guild.channels.cache.get(config.channels.verification_text);
      if (!textChannel || textChannel.type !== ChannelType.GuildText) return;
      const member = newState.member;
      // Mention du rôle vérificateur
      const roleMention = `<@&${config.roleIds.verificator}>`;
      // Création de l'embed
      const embed = new EmbedBuilder()
        .setTitle('Verification Alert')
        .setDescription('An unverified user has joined the verification voice channel.')
        .addFields(
          { name: 'User', value: `${member} (${member.user.tag})`, inline: true },
          { name: 'Voice Channel', value: `<#${config.channels.verification_voice}>`, inline: true }
        )
        .setColor(0x5865F2)
        .setFooter({ text: 'Verification System • Discord Bot', iconURL: client.user.displayAvatarURL() })
        .setTimestamp();
      // Envoi du message
      await textChannel.send({ content: `${roleMention}`, embeds: [embed] });
    }
  });
}; 