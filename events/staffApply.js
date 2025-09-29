import { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import fs from 'fs';
const config = JSON.parse(fs.readFileSync(new URL('../config.json', import.meta.url)));

const questions = [
  { customId: 'realName', label: 'Real Name', style: TextInputStyle.Short, required: true },
  { customId: 'age', label: 'Age', style: TextInputStyle.Short, required: true },
  { customId: 'whyStaff', label: 'Why should you be staff?', style: TextInputStyle.Paragraph, required: true },
  { customId: 'experience', label: 'Relevant Experience', style: TextInputStyle.Paragraph, required: true },
  { customId: 'availability', label: 'Availability', style: TextInputStyle.Short, required: true },
];

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    try {
      const applyChannel = await client.channels.fetch(config.applyHereChannelId).catch(() => null);
      if (!applyChannel) {
        console.error('[StaffApply] Salon applyHereChannelId introuvable:', config.applyHereChannelId);
        return;
      }
      if (!applyChannel.isTextBased()) {
        console.error('[StaffApply] Le salon applyHereChannelId n\'est pas un salon textuel:', config.applyHereChannelId);
        return;
      }
      // Vérifier si l'embed existe déjà (par le titre)
      const messages = await applyChannel.messages.fetch({ limit: 10 });
      const alreadySent = messages.find(m => m.embeds[0]?.title === '🎭 Staff Applications');
      if (!alreadySent) {
        const embed = new EmbedBuilder()
          .setTitle('🎭 Staff & Designer Applications')
          .setDescription(
            'Welcome to the application center!\n\n' +
            '📋 **Staff Requirements:**\n' +
            '• 16+ years old\n' +
            '• Experience in server management\n' +
            '• Daily availability\n' +
            '• Commitment to rules\n\n' +
            '🎨 **Designer Requirements:**\n' +
            '• Portfolio or design experience\n' +
            '• Creativity and originality\n' +
            '• Ability to work with feedback\n\n' +
            '💡 **What you get:**\n' +
            '• Exclusive roles & permissions\n' +
            '• Growth opportunities\n' +
            '• Be part of a dynamic team\n\n' +
            '👇 **Choose your application type below!**'
          )
          .setColor(0x5865F2)
          .setFooter({ text: 'Moderation • Discord Bot', iconURL: client.user.displayAvatarURL() })
          .setThumbnail(client.user.displayAvatarURL())
          .setImage('https://cdn.discordapp.com/attachments/1376272876298043525/1396191644742586368/d880a64b7b31816fec85debdf0c369d7.webp?ex=687dd90c&is=687c878c&hm=e6c0a44f75812c80b9136e2e23e7866940dffd8a953ef19ee05984fe172b6b6a&')
          .setTimestamp();
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('staff_apply')
            .setLabel('Staff Apply')
            .setEmoji('<:mod:1389002052075782374>')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('designer_apply')
            .setLabel('Designer Apply')
            .setEmoji('🎨')
            .setStyle(ButtonStyle.Secondary)
        );
        await applyChannel.send({ embeds: [embed], components: [row] });
        console.log('[StaffApply] Embed Staff Applications envoyé dans le salon', config.applyHereChannelId);
      } else {
        console.log('[StaffApply] Embed Staff Applications déjà présent dans le salon', config.applyHereChannelId);
      }
    } catch (err) {
      console.error('[StaffApply] Erreur lors de l\'envoi de l\'embed Staff Applications:', err);
    }
  },
};

// Gestion du bouton et du modal dans interactionCreate.js
// Ajoute ce code dans events/interactionCreate.js :
// (à fusionner dans le handler existant)
//
// if (interaction.isButton() && interaction.customId === 'staff_apply') {
//   const modal = new ModalBuilder()
//     .setCustomId('staff_apply_modal')
//     .setTitle('Staff Application');
//   questions.forEach(q => {
//     modal.addComponents(new ActionRowBuilder().addComponents(
//       new TextInputBuilder()
//         .setCustomId(q.customId)
//         .setLabel(q.label)
//         .setStyle(q.style)
//         .setRequired(q.required)
//     ));
//   });
//   await interaction.showModal(modal);
// }
//
// if (interaction.isModalSubmit() && interaction.customId === 'staff_apply_modal') {
//   const answers = questions.map(q => ({
//     label: q.label,
//     value: interaction.fields.getTextInputValue(q.customId)
//   }));
//   const embed = new EmbedBuilder()
//     .setTitle('📨 New Staff Application')
//     .setDescription(answers.map(a => `**${a.label}:**\n${a.value}`).join('\n\n'))
//     .setFooter({ text: `From: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
//     .setTimestamp();
//   const finishedChannel = await interaction.client.channels.fetch(config.finishedApplyChannelId).catch(() => null);
//   if (finishedChannel && finishedChannel.isTextBased()) {
//     await finishedChannel.send({ embeds: [embed] });
//   }
//   await interaction.reply({ content: 'Your application has been submitted!', ephemeral: true });
// } 