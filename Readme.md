# Late Night Verification Bot

A professional Discord moderation and verification bot built with discord.js v14 (ES modules). It provides streamlined verification flows, staff/designer applications via modals, rich server statistics, AFK handling, and comprehensive moderation tools tailored for Late Night communities.

## Features
- Verification workflow (roles for verified/unverified users)
- Staff and Designer application modals with rich embeds
- Prefix commands and AFK micro-commands (supports configured prefix and `&` for AFK)
- Moderation suite: warn, jail, unjail, timeout, kick, ban, unban
- Suspicious user tracking and listing
- Voice moderation helpers (vb/vg, join)
- Server statistics with interactive buttons and detailed embeds
- Persistent AFK state and moderation logs saved to files

## Tech Stack
- Node.js 16+
- discord.js v14
- ES Modules (type: module)
- dotenv for environment variables

## Getting Started

### 1) Prerequisites
- Node.js v16 or newer
- A Discord bot application and token
- Bot invited to your server with required intents and permissions

### 2) Clone and install
```bash
git clone <your-fork-or-repo-url>
cd lateNight_Verif
npm install
```

### 3) Configure environment
Create a `.env` file next to `index.js`:
```bash
DISCORD_TOKEN=your-bot-token-here
```

### 4) Configure bot settings
Edit `config.json` to match your server. Key options:
- `prefix`: Prefix for commands (default `=`)
- `rolesPermissions`: Map of command name → allowed role IDs
- `roleIds`: IDs for server roles such as `verified`, `unverified`, `jailed`, etc.
- `channels`: Channel IDs used for verification and logs
- `applyHereChannelId`, `finishedApplyChannelId`, `designerApplyChannelId`: Channels for application flow
- `statsChannelId`, `statsUpdateInterval`: Stats display and refresh

Example snippet:
```json
{
  "prefix": "=",
  "rolesPermissions": {
    "vb": ["1372700531864109197"],
    "vg": ["1372700531864109197"],
    "warn": ["1373603481524502570"],
    "ban": ["1373624244897841162"]
  },
  "roleIds": {
    "verified": "1372701919348396175",
    "unverified": "1372701957801771149",
    "jailed": "1372700595479248927"
  }
}
```

### 5) Run the bot
```bash
npm start
```

## Usage
The bot listens to messages and supports two prefixes:
- The configured `prefix` from `config.json` (e.g., `=help`)
- `&` for AFK-related quick actions

Use `=help` to list all available commands.

## Commands
The bot auto-loads commands from `commands/`. Highlights include:
- `help`: Show all commands with usage
- `stats`: Rich server statistics embed
- `afk`: Quick AFK utilities (via `&` prefix)
- Moderation: `warn`, `ban`, `unban`, `kick`, `jail`, `unjail`, `timeout`
- Suspect management: `sus`, `unsus`, `suslist`
- Voice helpers: `vb`, `vg`, `join`
- Utility: `addemoji`

Each command file exports:
```js
export default {
  name: 'commandName',
  description: 'Short description',
  usage: '=commandName <args?>',
  async execute(message, args) { /* ... */ }
}
```

## Events
The bot auto-loads event handlers from `events/`.
- `ready`: Startup logs and server listing
- `interactionCreate`: Handles application modals and stats buttons
- `messageCreate`: Prefix command router (in `index.js`)
- Additional events: `guildMemberAdd`, `voiceStateUpdate`, `staffApply`, `statsUpdater`

## Persistent Data
- `afkUsers.json`: AFK states restored on boot
- `logs/moderation.json`: JSON array of moderation actions (appended)
- `jailedRoles.json`, `susUsers.json`: State for jail/suspicious tracking

## Permissions and Roles
`utils.js` centralizes permission checks and role changes:
- `hasPermission(member, commandName)`: Checks allowed role IDs and hierarchy
- `swapRoles`, `addRole`, `removeRole`: Safe role management helpers
- `logToFile(logEntry)`: Append moderation actions to `logs/moderation.json`

## Intents and Security
`index.js` enables required intents: `Guilds`, `GuildMessages`, `GuildMembers`, `MessageContent`, `GuildMessageReactions`, `GuildVoiceStates`, `GuildPresences`.
Ensure the same intents are enabled in the Discord Developer Portal for your bot.

Store secrets only in `.env`. Do not commit tokens or private IDs.

## Deploying
- Keep Node.js at v16+ (see `package.json` engines)
- Use a process manager (PM2, systemd, Docker) to run continuously
- Regularly back up `afkUsers.json` and `logs/`

## Troubleshooting
- Bot won’t start: check `DISCORD_TOKEN` in `.env`
- Commands not responding: verify `prefix` and role permissions in `config.json`
- Missing data: ensure channel/role IDs are valid and the bot has permissions
- Presence/voice stats empty: confirm privileged intents are enabled in the Developer Portal

## Contributing
- Fork and create feature branches
- Follow the existing code style (ESM, descriptive names)
- Keep edits focused and lint-clean

## License
Proprietary for internal community use, unless specified otherwise by the owner.
