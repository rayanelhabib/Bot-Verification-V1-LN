// commands/join.js
// Commande =join : fait rejoindre le bot dans un salon vocal
import { 
  joinVoiceChannel, 
  createAudioPlayer, 
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState
} from '@discordjs/voice';
import { EmbedBuilder } from 'discord.js';

export default {
  name: 'join',
  description: ' <:arrow:1386053533400436776> Fait rejoindre le bot dans un salon vocal',
  usage: '=join [salon]',
  async execute(message, args) {
    // Vérifier si l'utilisateur est dans un salon vocal
    const member = message.member;
    if (!member.voice.channel) {
      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('❌ Erreur')
        .setDescription('Vous devez être dans un salon vocal pour utiliser cette commande !')
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    // Vérifier si le bot a les permissions nécessaires
    const permissions = member.voice.channel.permissionsFor(message.client.user);
    if (!permissions.has('Connect') || !permissions.has('Speak')) {
      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('❌ Erreur de permissions')
        .setDescription('Je n\'ai pas les permissions nécessaires pour rejoindre ce salon vocal.')
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    try {
      // Rejoindre le salon vocal
      const connection = joinVoiceChannel({
        channelId: member.voice.channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false
      });

      // Attendre que la connexion soit établie
      await entersState(connection, VoiceConnectionStatus.Ready, 30_000);

      const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('✅ Connecté !')
        .setDescription(`J'ai rejoint le salon vocal **${member.voice.channel.name}**`)
        .setThumbnail(message.client.user.displayAvatarURL())
        .setTimestamp();

      await message.reply({ embeds: [embed] });

      // Gérer les événements de déconnexion
      connection.on(VoiceConnectionStatus.Disconnected, async () => {
        try {
          await Promise.race([
            entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
            entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
          ]);
        } catch (error) {
          connection.destroy();
        }
      });

    } catch (error) {
      console.error('Erreur lors de la connexion au salon vocal:', error);
      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('❌ Erreur')
        .setDescription('Une erreur est survenue lors de la connexion au salon vocal.')
        .setTimestamp();
      await message.reply({ embeds: [embed] });
    }
  }
}; 