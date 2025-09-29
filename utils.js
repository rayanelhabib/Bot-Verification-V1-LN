// utils.js
// Fonctions utilitaires pour la gestion des rôles, permissions et logs
import fs from 'fs';
import path from 'path';

const config = JSON.parse(fs.readFileSync(new URL('./config.json', import.meta.url)));

/**
 * Vérifie si un membre possède au moins un des rôles autorisés pour une commande,
 * ou un rôle supérieur dans la hiérarchie Discord.
 * @param {GuildMember} member - Le membre Discord
 * @param {string} commandName - Nom de la commande
 * @returns {boolean}
 */
export function hasPermission(member, commandName) {
  const allowedRoles = config.rolesPermissions[commandName] || [];
  // Si le membre a explicitement un des rôles autorisés
  if (member.roles.cache.some(role => allowedRoles.includes(role.id))) return true;
  // Vérifie la hiérarchie : le membre a-t-il un rôle supérieur à un des rôles autorisés ?
  const guildRoles = member.guild.roles.cache;
  // Trouve la position la plus haute parmi les rôles autorisés
  const maxAllowedPosition = Math.max(
    ...allowedRoles
      .map(id => guildRoles.get(id))
      .filter(Boolean)
      .map(role => role.position)
  );
  // Le membre a-t-il un rôle d'une position supérieure ou égale ?
  return member.roles.cache.some(role => role.position >= maxAllowedPosition);
}

/**
 * Ajoute un rôle à un membre et retire un autre rôle (optionnel).
 * @param {GuildMember} member
 * @param {string} addRoleId
 * @param {string} [removeRoleId]
 */
export async function swapRoles(member, addRoleId, removeRoleId) {
  try {
    if (removeRoleId && member.roles.cache.has(removeRoleId)) {
      await member.roles.remove(removeRoleId);
    }
    if (!member.roles.cache.has(addRoleId)) {
      await member.roles.add(addRoleId);
    }
  } catch (err) {
    logError('swapRoles', err);
  }
}

/**
 * Ajoute un rôle à un membre.
 */
export async function addRole(member, roleId) {
  try {
    if (!member.roles.cache.has(roleId)) {
      await member.roles.add(roleId);
    }
  } catch (err) {
    logError('addRole', err);
  }
}

/**
 * Retire un rôle à un membre.
 */
export async function removeRole(member, roleId) {
  try {
    if (member.roles.cache.has(roleId)) {
      await member.roles.remove(roleId);
    }
  } catch (err) {
    logError('removeRole', err);
  }
}

/**
 * Log d'une action dans la console.
 */
export function logAction(action, details) {
  console.log(`[ACTION] ${action}:`, details);
}

/**
 * Log d'une erreur dans la console.
 */
export function logError(context, error) {
  console.error(`[ERROR] [${context}]`, error);
}

/**
 * Ajoute une entrée de log dans logs/moderation.json (append, asynchrone)
 * @param {object} logEntry
 */
export async function logToFile(logEntry) {
  const logsDir = path.resolve('logs');
  const logFile = path.join(logsDir, 'moderation.json');
  try {
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);
    let logs = [];
    if (fs.existsSync(logFile)) {
      const content = fs.readFileSync(logFile, 'utf8');
      if (content) logs = JSON.parse(content);
    }
    logs.push(logEntry);
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
  } catch (e) {
    console.error('[LOG FILE ERROR]', e);
  }
}

/**
 * Récupère un membre par mention ou ID, avec fetch si besoin.
 * @param {Message} message
 * @param {string} arg
 * @returns {Promise<GuildMember|null>}
 */
export async function resolveMember(message, arg) {
  let member = message.mentions.members.first() || message.guild.members.cache.get(arg);
  if (!member && arg) {
    try {
      member = await message.guild.members.fetch(arg);
    } catch (e) {
      member = null;
    }
  }
  return member;
} 