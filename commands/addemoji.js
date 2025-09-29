// commands/addemoji.js
// Commande =addemoji : ajoute un emoji personnalisé à ce serveur à partir d'un autre serveur
import { hasPermission, logError } from '../utils.js';
import fs from 'fs';
const config = JSON.parse(fs.readFileSync(new URL('../config.json', import.meta.url)));
import { EmbedBuilder } from 'discord.js';

export default {
  name: 'addemoji',
  description: 'Ajoute un emoji personnalisé à ce serveur à partir d\'un autre serveur. Usage : =addemoji <emoji> <nom>',
  usage: '=addemoji <emoji> <nom>',
  async execute(message, args) {
    // Permission : Gérer les emojis OU administrateur
    if (!message.member.permissions.has('ManageEmojisAndStickers') && !message.member.permissions.has('Administrator')) {
      return message.reply("Vous n\'avez pas la permission d\'ajouter des emojis sur ce serveur.");
    }
    if (args.length < 2) {
      return message.reply("Utilisation : =addemoji <emoji> <nom>");
    }
    const emojiArg = args[0];
    const emojiName = args[1];
    // Regex pour extraire l'ID de l'emoji
    const match = emojiArg.match(/^<a?:\w+:(\d+)>$/);
    if (!match) {
      return message.reply("Merci de coller un emoji personnalisé valide (ex: <:nom:id> ou <a:nom:id>)");
    }
    const emojiId = match[1];
    const isAnimated = emojiArg.startsWith('<a:');
    const ext = isAnimated ? 'gif' : 'png';
    const url = `https://cdn.discordapp.com/emojis/${emojiId}.${ext}`;
    try {
      // Correction : syntaxe compatible Discord.js v14
      const emoji = await message.guild.emojis.create({
        attachment: url,
        name: emojiName
      });
      const embed = new EmbedBuilder()
        .setTitle('✅ Emoji ajouté !')
        .setDescription(`L'emoji ${emoji} a été ajouté avec le nom : **${emojiName}**`)
        .setThumbnail(url)
        .setColor(0x43b581)
        .setFooter({ text: 'Gestion des emojis • Discord Bot', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    } catch (err) {
      console.error('[AddEmoji ERROR]', err);
      logError('addemoji', err);
      return message.reply("Erreur lors de l'ajout de l'emoji. Vérifiez que le serveur n'a pas atteint la limite d'emojis, que le bot a la permission, ou que l'URL de l'emoji est valide.");
    }
  }
}; 