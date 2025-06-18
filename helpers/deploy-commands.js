const { REST, Routes } = require('discord.js');
const { token, clientId, guildId } = require('./variables.js')

// Replace with your actual values

const commands = [
  {
    name: 'leaderboard',
    description: 'Display the top 10 strongest characters',
    options: []
  },
  {
    name: 'npclist',
    description: 'Display a list of available NPCs',
    options: []
  },
  {
    name: 'help',
    description: 'Pull up the Help dialog box to help explain various RPG or commands',
    options: []
  },
  {
    name: 'commands',
    description: 'Zeno will message you a full list of the commands available',
    options: []
  },
  {
    name: 'profile',
    description: 'Display your character list, along with other information',
    options: []
  }
  // Add more commands here as needed
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    // Re-registering cleared commands will take up to an hour. Only use if duplicates are seen.

    //console.log('Clearing old slash commands...');
    //await rest.put(Routes.applicationCommands(clientId), { body: [] });

    console.log('Registering slash commands...');

    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );

    // removes server specific commands to prevent double-up
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] });
    
    console.log('Slash commands registered successfully.');
  } catch (error) {
    console.error('Failed to register slash commands:', error);
  }
})();