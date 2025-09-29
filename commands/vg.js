// commands/vg.js
// Commande =vg : vérification féminine (ajoute 'verified' et 'verified_female', retire 'unverified')
import { hasPermission, addRole, swapRoles, logAction, resolveMember } from '../utils.js';
import fs from 'fs';
const config = JSON.parse(fs.readFileSync(new URL('../config.json', import.meta.url)));
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
  name: 'vg',
  description: '<:arrow:1386053533400436776> Verify a female member. ',
  usage: '=vg @user',
  async execute(message, args) {
    if (!hasPermission(message.member, 'vg')) {
      return message.reply("Vous n’avez pas la permission d’utiliser cette commande.");
    }
    const member = await resolveMember(message, args[0]);
    if (!member) return message.reply('Utilisateur introuvable.');
    
    // Vérifier si l'utilisateur est marqué comme suspect
    const susUsers = loadSusUsers();
    if (susUsers[member.id]) {
      const embed = new EmbedBuilder()
        .setAuthor({ name: message.client.user.username, iconURL: message.client.user.displayAvatarURL() })
        .setTitle('🚨 Verification Blocked - User is Suspicious')
        .setDescription(`**${member} cannot be verified because they are marked as suspicious.**\n\n⚠️ **To verify this user, the person who marked them as suspicious must first use \`=unsus @${member.user.username}\`**`)
        .addFields(
          { name: '👤 User', value: `${member} (${member.user.tag})`, inline: true },
          { name: '🚫 Reason', value: susUsers[member.id].reason, inline: true },
          { name: '🛡️ Marked by', value: `<@${susUsers[member.id].markedBy}> (${susUsers[member.id].markedByTag})`, inline: false },
          { name: '📅 Marked at', value: new Date(susUsers[member.id].markedAt).toLocaleString(), inline: false },
          { name: '🔓 How to unblock', value: `Only <@${susUsers[member.id].markedBy}> can use \`=unsus @${member.user.username}\` to remove the suspicious mark.`, inline: false }
        )
        .setThumbnail(member.user.displayAvatarURL())
        .setColor(0xFF6B6B)
        .setFooter({ text: 'Verification Blocked • Discord Bot', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      
      return message.reply({ embeds: [embed] });
    }
    
    await swapRoles(member, config.roleIds.verified, config.roleIds.unverified);
    await addRole(member, config.roleIds.verified_female);
    logAction('vg', `${member.user.tag} vérifié (féminin) par ${message.author.tag}`);
    // Log dans le salon de logs
    const logChannel = message.guild.channels.cache.get(config.channels.verification_logs);
    if (logChannel) {
      const embed = new EmbedBuilder()
        .setAuthor({ name: message.client.user.username, iconURL: message.client.user.displayAvatarURL() })
        .setTitle('✅ Verification Successfully')
        .setDescription(`**A user has been verified as female!**`)
        .addFields(
          { name: '👤 Member', value: `${member} ( ${member.user.tag})`, inline: true },
          { name: '🛡️ Action', value: 'Female verification (vg)', inline: true },
          { name: '🔧 Verified by', value: `${message.author} ( ${message.author.tag})`, inline: false }
        )
        .setThumbnail(message.client.user.displayAvatarURL())
        .setColor(0xf47fff)
        .setFooter({ text: 'Verification Logs • Discord Bot', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();
      await logChannel.send({ embeds: [embed] });
    }
    // Embed stylé personnalisé pour la réponse utilisateur (DM)
    const welcomeEmbed = new EmbedBuilder()
      .setColor(0xF47FFF)
      .setTitle('🌟 Welcome to Our Community! 🌟')
      .setDescription(`Dear ${member},\n\n🎉 **Congratulations on being verified in Late Night Community!** 🎉\n\nWe're thrilled to have you as part of our community. You now have access to all member channels where you can:\n• 💬 Chat with other members\n• 🤝 Make new friends\n• 🎮 Join fun activities\n• 🎭 Participate in server events\n\nFeel free to explore and engage with our wonderful community!\n\nWelcome aboard! 🚀`)
      .setImage('https://cdn.discordapp.com/attachments/1366652118722940981/1378407614353768578/d880a64b7b31816fec85debdf0c369d7.webp?ex=687d1720&is=687bc5a0&hm=1929ebe10bc9a6956a5fba361c01e45eb1e6d68c5ba7db1ff56b9aeee0082ecc&')
      .setTimestamp();
    // Ancien embed pour la réponse dans le salon
    const replyEmbed = new EmbedBuilder()
      .setAuthor({ name: message.client.user.username, iconURL: message.client.user.displayAvatarURL() })
      .setTitle('✅ Verification Successful')
      .setDescription(`The user ${member} has been verified as female!`)
      .setThumbnail(message.client.user.displayAvatarURL())
      .setColor(0xf47fff)
      .setFooter({ text: 'Verification • Discord Bot', iconURL: message.client.user.displayAvatarURL() })
      .setTimestamp();
    try {
      await member.send({ embeds: [welcomeEmbed] });
    } catch (e) {}
    return message.reply({ embeds: [replyEmbed] });
  }
}; 