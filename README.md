# Setup
The first step, after downloading the code, is to run *npm install* to rebuild the node_modules folder. Following this, you will need to register your bot with Discord to obtain the token and application IDs. These values are stored in **variables.js** in the project root.

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
Provides descriptions for each help topic returned by the help command, and stores the tutorial messages shown to new accounts.

## dojo.js
Introduces a dojo system, allowing players to form guilds for cooperative training and shared buffs.

## techniqueImprovement.js
Handles upgrade paths for techniques, enabling stronger skills once prerequisites are met.

## loader.js
Responsible for loading and saving all character, item and user data. Also contains backup utilities.

## user.js
Tracks individual player accounts, including currency and unlocked races.

## variables.js
Holds token and application IDs used to connect the bot to Discord. Edit this file with your own credentials.

## zeno.js
The main entry point for the bot. Coordinates loading data, handling commands and running game logic.

### helpers
Miscellaneous utilities used by the bot live under **helpers/**:
* **helpers.js** - Common helper functions and item generators.
* **battleMaster.js** - Skeleton for UI-driven combat flow (work in progress).
* **deploy-commands.js** - Registers slash commands with Discord.
