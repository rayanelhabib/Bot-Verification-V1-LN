// events/interactionCreate.js
// Squelette pour gérer les interactions (slash commands, optionnel)
import { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } from 'discord.js';
import fs from 'fs';
const config = JSON.parse(fs.readFileSync(new URL('../config.json', import.meta.url)));

const questions = [
  { customId: 'realName', label: 'Real Name', style: TextInputStyle.Short, required: true },
  { customId: 'age', label: 'Age', style: TextInputStyle.Short, required: true },
  { customId: 'whyStaff', label: 'Why should you be staff?', style: TextInputStyle.Paragraph, required: true },
  { customId: 'experience', label: 'Relevant Experience', style: TextInputStyle.Paragraph, required: true },
  { customId: 'availability', label: 'Availability', style: TextInputStyle.Short, required: true },
];

const designerQuestions = [
  { customId: 'designExperience', label: 'Design/animation experience?', style: TextInputStyle.Paragraph, required: true, placeholder: 'What design or animation experience do you have?' },
  { customId: 'alignValues', label: 'Align with community values?', style: TextInputStyle.Paragraph, required: true, placeholder: 'How would you ensure that your designs align with the community\'s values?' },
  { customId: 'tools', label: 'Design tools/software?', style: TextInputStyle.Short, required: true, placeholder: 'What design tools and software are you proficient in using?' },
  { customId: 'prioritize', label: 'Prioritize requests?', style: TextInputStyle.Paragraph, required: true, placeholder: 'How would you prioritize design requests from the community?' }
];

export default (client, commands) => {
  client.on('interactionCreate', async interaction => {
    // Gestion du bouton Staff Apply
    if (interaction.isButton() && interaction.customId === 'staff_apply') {
      const modal = new ModalBuilder()
        .setCustomId('staff_apply_modal')
        .setTitle('Staff Application');
      questions.forEach(q => {
        modal.addComponents(new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId(q.customId)
            .setLabel(q.label)
            .setStyle(q.style)
            .setRequired(q.required)
        ));
      });
      return await interaction.showModal(modal);
    }
    // Gestion de la soumission du modal
    if (interaction.isModalSubmit() && interaction.customId === 'staff_apply_modal') {
      const realName = interaction.fields.getTextInputValue('realName');
      const age = interaction.fields.getTextInputValue('age');
      const whyStaff = interaction.fields.getTextInputValue('whyStaff');
      const experience = interaction.fields.getTextInputValue('experience');
      const availability = interaction.fields.getTextInputValue('availability');
      const user = interaction.user;
      const now = new Date();
      const dateLocale = now.toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' });
      const embed = new EmbedBuilder()
        .setTitle('🟢 New Staff Application')
        .setColor(0x43b581)
        .setThumbnail(user.displayAvatarURL())
        .setDescription(
          `__**🧑‍💼 Applicant Information**__\n` +
          `**Name:** <@${user.id}>\n` +
          `**ID:** ${user.id}\n` +
          `**Application Date:** ${dateLocale}\n\n` +
          `📝 **Real Name**\n${realName}\n\n` +
          `🎂 **Age**\n${age}\n\n` +
          `❓ **Why should you be staff?**\n${whyStaff}\n\n` +
          `🧰 **Relevant Experience**\n${experience}\n\n` +
          `⏰ **Availability**\n${availability}`
        )
        .setFooter({ text: `Application ID: ${user.id} • Submitted at ${now.toLocaleString('en-GB')}`, iconURL: user.displayAvatarURL() })
        .setTimestamp();
      const finishedChannel = await interaction.client.channels.fetch(config.finishedApplyChannelId).catch(() => null);
      if (finishedChannel && finishedChannel.isTextBased()) {
        await finishedChannel.send({ embeds: [embed] });
      }
      return await interaction.reply({ content: 'Your application has been submitted!', ephemeral: true });
    }
    // Gestion du bouton Designer Apply
    if (interaction.isButton() && interaction.customId === 'designer_apply') {
      const modal = new ModalBuilder()
        .setCustomId('designer_apply_modal')
        .setTitle('Designer Application');
      designerQuestions.forEach(q => {
        modal.addComponents(new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId(q.customId)
            .setLabel(q.label)
            .setStyle(q.style)
            .setRequired(q.required)
            .setPlaceholder(q.placeholder)
        ));
      });
      return await interaction.showModal(modal);
    }
    // Gestion de la soumission du modal Designer
    if (interaction.isModalSubmit() && interaction.customId === 'designer_apply_modal') {
      const user = interaction.user;
      const now = new Date();
      const dateLocale = now.toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' });
      const answers = designerQuestions.map(q => ({
        label: q.label,
        value: interaction.fields.getTextInputValue(q.customId)
      }));
      const embed = new EmbedBuilder()
        .setTitle('🎨 New Designer Application')
        .setColor(0xf47fff)
        .setThumbnail(user.displayAvatarURL())
        .setDescription(
          `__**👤 Applicant Information**__\n` +
          `**Name:** <@${user.id}>\n` +
          `**ID:** ${user.id}\n` +
          `**Application Date:** ${dateLocale}\n\n` +
          answers.map(a => `**${a.label}**\n${a.value}`).join('\n\n')
        )
        .setFooter({ text: `Designer Application • ${user.tag}`, iconURL: user.displayAvatarURL() })
        .setTimestamp();
      const designerChannel = await interaction.client.channels.fetch(config.designerApplyChannelId).catch(() => null);
      if (designerChannel && designerChannel.isTextBased()) {
        await designerChannel.send({ embeds: [embed] });
      }
      return await interaction.reply({ content: 'Your designer application has been submitted!', ephemeral: true });
    }
    
    // Gestion des boutons des statistiques
    if (interaction.isButton()) {
      if (interaction.customId === 'refresh_stats') {
        // Actualiser les statistiques
        const statsChannel = await interaction.client.channels.fetch(config.statsChannelId).catch(() => null);
        if (statsChannel) {
          await interaction.reply({ content: '🔄 Actualisation des statistiques en cours...', ephemeral: true });
          // Déclencher une mise à jour immédiate
          interaction.client.emit('statsUpdate');
        }
        return;
      }
      
      if (interaction.customId === 'server_info') {
        // Afficher les informations détaillées du serveur
        const guild = interaction.guild;
        const embed = new EmbedBuilder()
          .setTitle(`ℹ️ Informations détaillées - ${guild.name}`)
          .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
          .setColor(0x00ff00)
          .addFields(
            { name: '🆔 ID du serveur', value: guild.id, inline: true },
            { name: '👑 Propriétaire', value: `<@${guild.ownerId}>`, inline: true },
            { name: '📅 Créé le', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
            { name: '🌍 Région', value: guild.preferredLocale || 'Non défini', inline: true },
            { name: '🔒 Niveau de vérification', value: `${guild.verificationLevel}`, inline: true },
            { name: '🎭 Nombre de rôles', value: `${guild.roles.cache.size}`, inline: true },
            { name: '📺 Nombre de salons', value: `${guild.channels.cache.size}`, inline: true },
            { name: '🚀 Niveau de boost', value: `${guild.premiumTier}/3`, inline: true },
            { name: '⭐ Nombre de boosts', value: `${guild.premiumSubscriptionCount}`, inline: true }
          )
          .setFooter({ text: 'Informations serveur • Statistiques', iconURL: interaction.client.user.displayAvatarURL() })
          .setTimestamp();
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }
      
      if (interaction.customId === 'member_list') {
        // Afficher la liste des membres en ligne
        const guild = interaction.guild;
        const onlineMembers = guild.members.cache.filter(member => 
          member.presence?.status === 'online' || 
          member.presence?.status === 'idle' || 
          member.presence?.status === 'dnd'
        ).first(10); // Limiter à 10 membres
        
        const embed = new EmbedBuilder()
          .setTitle(`👥 Membres en ligne - ${guild.name}`)
          .setColor(0x00ff00)
          .setDescription(
            onlineMembers.length > 0 
              ? onlineMembers.map(member => 
                  `**${member.presence?.status === 'online' ? '🟢' : member.presence?.status === 'idle' ? '🟡' : '🔴'}** ${member.user.tag}`
                ).join('\n')
              : 'Aucun membre en ligne actuellement.'
          )
          .setFooter({ text: `Affichage de ${onlineMembers.length} membres sur ${guild.memberCount}`, iconURL: interaction.client.user.displayAvatarURL() })
          .setTimestamp();
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }
    }
    
    // Gestion commandes existantes
    if (!interaction.isChatInputCommand()) return;
    const command = commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.executeInteraction(interaction);
    } catch (err) {
      await interaction.reply({ content: 'Erreur lors de l’exécution de la commande.', ephemeral: true });
    }
  });
}; 