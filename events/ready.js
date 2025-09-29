// events/ready.js
// Événement déclenché quand le bot est prêt
export default (client) => {
  client.on('ready', () => {
    console.log(`Bot prêt ! Connecté en tant que ${client.user.tag}`);
    if (client.guilds.cache.size === 0) {
      console.log('Le bot n\'est sur aucun serveur.');
    } else {
      client.guilds.cache.forEach(guild => {
        const name = guild?.name || 'Inconnu';
        const count = guild?.memberCount ?? 'Inconnu';
        console.log(`Serveur: ${name} | Membres: ${count}`);
      });
    }
  });
}; 