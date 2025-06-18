# Setup
The first step, after downloading the code, is to run *npm install* to rebuild the node_modules folder. Following this, you will need to go through the registration of a bot with discord, getting a token ID, then placing this at the top of the zeno.js file. 

Once that's set up, you can start the bot by running *node zeno.js* in the root folder from PowerShell or CMD. The bot will need to be invited into a discord channel in order to interact with it, and commands all start with the letter 'g'. *g help* can be used to get information on the various concepts of the game, as well as the commands and what they do within the game. Many commands open up button interfaces which you can interact with to do more.

# Grand Zeno RPG Files

## attributeBonus.js
Holds adjustment arrays for attributes, which are used by buffs, debuffs, items, races etc. These stats are always multipliers.

## attributes.js
Holds the stats for characters and calculates the advanced stats.

## battle.js
All damage calculation, turn management and other battle related functions.

## character.js
Handles the management and information for all characters, including players and NPCs.

## equipment.js
Holds information for equipable items, like weapons and dogi.

## inventory.js
Used to manage item lists for each player.

## naming.js
Utility class used to generate item names, as well as their stats, and add affixes. 

## party.js
Stores the information relating to parties (groups), which are used for raid battles.

## races.js
A container class that holds information for races in the game, including the levelup bonuses and stat multipliers.

## raid.js
Scripted battle scenarios involving the strongest enemies for the game. This is the only mode that uses group battles by default.

## technique.js
A basic container class to hold information for all skills in the game. 

## help.js
Keeps track of all messages and tops the help command will send, as well as the tutorial messages for new accounts.