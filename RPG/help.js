
class Help {
	static tutorialReward = 50000;
	//all commands players can use -> selectbox
	//"npcstat", "npcastat",
	static commands = [
		"help", "ping", "top", 
		"npclist", "newchar","overwrite", 
		"mychar", "setchar", "setcharimage", 
		"statup", "stat", "astat", 
		"deaths", "train", "trial",
		"buffs", "party", "battle", 
		"spar", "npcspar", "suppress", 
		"forfeit", "inv", "equips", 
		"trashitem", "equipitem", "unequipitem", 
		"sellitem", "givezeni", "shop", 
		"affixitem", "utech", "ctech", 
		"settrans", "rtrans", "settech", 
		"removetech", "swaptech", "style",
		"enemybuffs", "battlebuffs", 
	];

	//list of valid topics for the help command -> selectbox
	static rpg = [
		"Basic Stats", "Advanced Stats", "Races", 
		"Power Level", "Reading Techniques", "Learning Techniques", 
		"Parties", "Raids", "What to do with technique points", 
		"Fighting Style", "What do I lose on death?", 
		"What is shared between characters?", "What to do with zeni", "Item Affixing"
	];

	//find appropriate string to return and print for a given topic/mechanic -> setdescription
	static helpRequest(topic, choice) {
		if(choice === "commands") {
			if(topic === "help") {
				return ["help","This command opens the help menu. Add 'list' to the end of the command to have the full list of commands sent to you."]
			}
			else if(topic === "train") {
				return ["train\ntraining log","Opens the training menu, or displays the results of training since the last time the command was used."]
			}
			else if(topic === "trial") {
				return ["trial\ntrial [name]","Displays a list of available trial encounters, or starts the trial with [name]."]
			}
			else if(topic === "enemybuffs") {
				return ["enemybuffs","Displays the buff list for every enemy while in battle."]
			}
			else if(topic === "battlebuffs") {
				return ["battlebuffs","Displays the buff list for every ally while in battle."]
			}
			else if(topic === "ping") {
				return ["ping","Zeno returns a pong to check latency."]
			}
			else if(topic === "top") {
				return ["top","Prints a list of the 10 strongest characters (NPC/Player)."]
			}
			else if(topic === "npclist") {
				return ["npclist","Prints a list with every NPC name and how strong they are (approximately)."]
			}
			else if(topic === "newchar") {
				return ["newchar [character name] [race]","Creates a new character, as well as creating the player's account initially and starting the tutorial messages."]
			}
			else if(topic === "overwrite") {
				return ["overwrite [character name] [race] [slot to replace]","Creates a new character, in the slot specified by the player. You have to use this twice to do it."]
			}
			else if(topic === "mychar") {
				return ["mychar","Prints a list of all the player's characters."]
			}
			else if(topic === "setchar") {
				return ["setchar [character slot]","Changes current character to the given slot number."]
			}
			else if(topic === "setcharimage") {
				return ["setcharimage [url]","Changes current character's image to the given URL. Works best with discord image links."]
			}
			else if(topic === "statup") {
				return ["statup [stat] [amount]","Increases the given stat by the given amount, if you have enough stat points."]
			}
			else if(topic === "stat") {
				return ["stat [optional: target]","Displays the target character's basic stats. Displays current character when no arguments given."]
			}
			else if(topic === "astat") {
				return ["astat [optional: target]","Displays the target character's advanced stats. Displays current character when no arguments given."]
			}
			else if(topic === "npcstat") {
				return ["npcstat [target]","Displays the target NPC's basic stats."]
			}
			else if(topic === "npcastat") {
				return ["npcastat [target]","Displays the target NPC's advanced stats."]
			}
			else if(topic === "deaths") {
				return ["deaths","Displays the current character's death count. Useful for Saiyans to know how long they will continue to gain zenkai."]
			}
			else if(topic === "buffs") {
				return ["buffs [optional:target]","Displays the target's buffs. Target can be a player or an NPC, and when no argument is given it displays the current character's buffs."]
			}
			else if(topic === "party") {
				return ["party\nparty [kick/leave/disband]\nparty [invite/apply] [target]\nparty create [name]",
				"*Displays* the current party list with no arguments. \n*With* one argument, you can leave or disband a party, or open the kick player menu; when disbanding, you must use it twice before it will do so. \n*With* two arguments, you can apply to someone's party or invite someone to your party. Parties can only have 3 members."]
			}
			else if(topic === "battle") {
				return ["battle [easy/normal/hard/challenge]","Basic combat command for leveling up, learning techniques or farming item boxes. Challenge can only be accessed with 100+ base stats."]
			}
			else if(topic === "spar") {
				return ["spar [player] [optional:zeni bet]","Start a safe battle with another player, and optionally risk zeni on the outcome."]
			}
			else if(topic === "npcspar") {
				return ["npcspar [NPC name]","Start a safe battle with an NPC."]
			}
			else if(topic === "trial") {
				return ["trial\ntrial [name]","Use this command without argumens to see the list of trials available. Trials are single player battles against strong enemy groups with certain garaunteed rewards for first time clears."]
			}
			else if(topic === "suppress") {
				return ["suppress [optional: percent reduction]","Adds a buff that reduces all stats outside CON and ENG to match either the enemy or to an arbitrary percent given."]
			}
			else if(topic === "forfeit") {
				return ["forfeit","Gives up the current battle. If you're in a non safe battle, you have a high chance of death."]
			}
			else if(topic === "inv") {
				return ["inv\ninv sort [optional:name/quality/affixes/totalbonus]","*Displays* player's inventory. \n*If* sort is used with no arguments, it sorts by item creation date, with oldest first. Otherwise, it will sort by whatever argument is given."]
			}
			else if(topic === "equips") {
				return ["equips [optional:target]","When no arguments are given, displays current character's dogi and weapon. Otherwise, displays the target's current dogi and weapon; target can be NPCs or players."]
			}
			else if(topic === "trashitem") {
				return ["equips [inventory slot]","Destroys the item in your inventory at given slot."]
			}
			else if(topic === "equipitem") {
				return ["equipitem [inventory slot]","Equips the item in the given inventory slot."]
			}
			else if(topic === "unequipitem") {
				return ["unequipitem [dogi/weapon]","Unequips either the current character's dogi or weapon."]
			}
			else if(topic === "sellitem") {
				return ["sellitem [inventory slot] [sell amount] [target player]","Offers the item in the given inventory slot at the given sell amount to the given player."]
			}
			else if(topic === "givezeni") {
				return ["givezeni [zeni amount] [target player]","Give the zeni amount to the target player."]
			}
			else if(topic === "shop") {
				return ["shop","Opens the shop interface."]
			}
			else if(topic === "affixitem") {
				return ["affixitem [item slot]","Opens the affixing interface for the item at the given slot."]
			}
			else if(topic === "utech") {
				return ["unlockedtech","Displays all techniques available for the user's characters."]
			}
			else if(topic === "ctech") {
				return ["currenttech","Displays the techniques and transformation set for the current character."]
			}
			else if(topic === "settrans") {
				return ["settransformation [technique ID]","Sets the current character's transformation to the given technique ID (displayed in utech command)."]
			}
			else if(topic === "rtrans") {
				return ["removetransformation","Unsets the current character's transformation."]
			}
			else if(topic === "settech") {
				return ["settech [technique ID]","Adds the given technique ID (displayed in utech command) to the current character's technique list, if they have less than 5 techniques set."]
			}
			else if(topic === "removetech") {
				return ["settech [slot]","Removes the given technique (displayed in ctech command) from the current character's technique list, if they have more than 1 technique set."]
			}
			else if(topic === "swaptech") {
				return ["swaptech [swap from slot] [swap to slot]","Swaps the two given slots on the current character's technique list."]
			}
			else if(topic === "style") {
				return ["style [optional:target] \nstyle [modify] [optional:increase amount] \nstyle create [name] [mainstat1] [mainstat2] [mainstat3]\nstyle create [new name]","*With* a target NPC/character, displays their style stats. With no arguments, it prints your current character's style stats. \n*Using* the modify subcommand opens the modify menu to add the amount (optionally) given to a given stat or add a new one. \n*The* create subcommand creates a style for your character using the 3 (different) mainstats given. If you already have a fighting style, the create command changes the name."]
			}
		}
		else if(choice === "rpg") {
			if(topic === "Basic Stats") {
				let str = "Basic Stats"
				let stats = new Array();
				stats.push("Str");
				stats.push("Dex");
				stats.push("Con");
				stats.push("Eng");
				stats.push("Sol");
				stats.push("Foc");
				return [str, stats];
			}
			else if(topic === "Advanced Stats") {
				let str = "Advanced Stats"
				let stats = new Array();
				stats.push("Health");
				stats.push("Energy");
				stats.push("Health Regen");
				stats.push("Energy Regen");
				stats.push("Charge");
				stats.push("Charge Bonus");

				stats.push("Hit Rate");
				stats.push("Dodge Rate");
				stats.push("Speed");
				stats.push("Crit Rate");
				stats.push("Crit Damage");

				stats.push("Block Rate");
				stats.push("Block Power");
				stats.push("Physical/Energy Defense");

				stats.push("Physical/Energy Attack");
				stats.push("Magic Power");
				stats.push("Magical Defense");
				return [str, stats];
			}
			else if(topic === "Races") {
				let str = "Races"
				let races = new Array();
				races.push("Human");
				races.push("Half-Saiyan");
				races.push("Saiyan");
				races.push("Android");
				races.push("Majin");
				races.push("Arcosian");
				races.push("Namekian");
				races.push("Dragon Clan");
				races.push("Alien");
				return [str, races];
			}
			else if(topic === "Power Level") {
				let str = "**Power** level is a rough measurement of how strong a character is. The value is approximately a character's level multiplied by their base stats (weighted), multiplied by their charge value."
				return [str,null];
			}
			else if(topic === "Learning Techniques") {
				let str = "**In** general, you will learn techniques by beating enemies in fights. After every fight, if your enemy has a technique you don't know, you have a chance to learn it, though only one per victory."
				return [str,null];
			}
			else if(topic === "Parties") {
				let str = "**Parties** are a small group of players that work together to do raids, or just to get stronger. Up to 3 characters can be in a party, and for every character after the first, exp for everyone is reduced by 10%. However, everyone shares 30% of their exp with everyone else."
				return [str,null];
			}
			else if(topic === "Raids") {
				let str = "**Raids** are the main difficult content available. They're balanced with the idea that there will be 3 PCs (not necessarily at the same strength) working together with the NPC allies to defeat empowered bosses.";
				str = str + "\n**The** difficulty of the raid scales based on the strongest player in the group, but everyone earns a random Mythic tier item box on victory. Be careful, though, because raids have a 100% death rate on loss.";
				str = str + "\n**Additionally**, every character in the party must be at least level 200 when entering.";
				return [str,null];
			}
			else if(topic === "What to do with technique points") {
				let str = "**The** main use for technique points is to create, and modify, fighting styles. Fighting Styles can be managed with the style sub commands. They require 150 TP to create, and an increasing amount to improve over time."
				return [str,null];
			}
			else if(topic === "Fighting Style") {
				let str = "**Fighting** Styles are a customized set of bonuses a character can manage through the style commands. On creation, you choose 3 main stats which will have a 5% boost each."
				str = str + "\n**From** there, you can either increase the existing stats by 1% each upgrade, or add new stats at 75, 100 and 125 TP each. Each new stat also starts at 5%, but you can only have 6 stats total, so be careful in when or what you chose."
				str = str + "\n**Fighting** styles max out at 200% total bonuses, and individual stats can only go up to 50% each."; 
				//subject to change
				return [str,null];
			}
			else if(topic === "What do I lose on death?") {
				let str = "**Not** much! You lose all your current exp, and pay a zeni penalty to revive, but keep all your current stats, items, etc. So why worry? Well, reaching higher levels gives more flat stats faster!"
				return [str,null];
			}
			else if(topic === "What is shared between characters?") {
				let str = "Practically everything important, really. You share zeni, items, and unlocked techniques."
				return [str,null];
			}
			else if(topic === "What to do with zeni") {
				let str = "**Affix** your items, buy item boxes, or buy things from other players. If you already have your perfect items fully affixed, purchase buffs to clear raids."
				return [str,null];
			}
			else if(topic === "Item Affixing") {
				let str = "**Item** affixing is essentially just adding an extra stat roll onto an item that you can pick. This cannot be something already on the item, but all existing stat lines on an item increase based on the quality of the item."
				str = str + "\n**Additionally**, legendary+ (legendary, mythic, divine) quality items have boosted affixes, though the cost is also proportionally boosted.";
				return [str,null];
			}
			else if(topic === "Reading Techniques") {
				let str = "**TechID** This is used for setting techniques. The number doesn't mean anything, it's arbitrary."
				str = str + "\n**EP/HP Cost** For transformations, these are a % of the max a character has. For everything else, it's multiplied by the average of level and stat total."
				str = str + "\n**Damage Scaling** Multiplies associated attack stat by the scale percent. Flat Scaling is added as a bonus (scaling with level/stat total) to the attack before scaling and reduction."
				str = str + "\n**Hit Number** Amount of times this technique hits on use."
				str = str + "\n**Armor Pen/Bonus Hit/Bonus Crit** These are bonuses added to your stats on skill use. Armor pen reduces the enemy's defenses. Not Displayed on dropdown menu in battle."
				str = str + "\n**Cooldown** How long you need to wait between uses."
				return [str,null];
			}
		}
		else if(choice === "Basic Stats") { 
			if(topic === "Str") {
				let str = "**Main Contributor For:** *Physical Attack, Block Rate, Max Charge*"
				str = str + "\n**Partial Contributor For:** *Crit Damage, Block Power, Physical Defense, Energy Defense*"
				str = str + "\n**Str** is an important stat for both physical damage dealers, and tanks. It has a good balance of offensive and defensive boosts."
				return [str,null];
			}
			else if(topic === "Dex") {
				let str = "**Main Contributor For:** *Dodge, Crit Rate, Speed*"
				str = str + "\n**Partial Contributor For:** *Max Charge, Crit Damage, Hit Rate, Block Rate, Physical Defense, Physical Attack*"
				str = str + "\n**Dex** is primarily used by damage builds, but tanks focusing on blocking would find Dex to be particularly useful to reduce the effect Hit Chance has on their Block Rate."
				return [str,null];
			}
			else if(topic === "Con") {
				let str = "**Main Contributor For:** *Health, Health Regen, Block Power, Physical Defense*"
				str = str + "\n**Partial Contributor For:** *Max Charge*"
				str = str + "\n**Con** is an essential stat for every build, though the amount each character takes depends on their overall needs.*"
				return [str,null];
			}
			else if(topic === "Eng") {
				let str = "**Main Contributor For:** *Energy, Energy Regen, Energy Defense*"
				str = str + "\n**Partial Contributor For:** *Magic Power, Max Charge*"
				str = str + "\n**Eng** is a useful stat for most builds, though some may prefer to focus purely on Strikes and Bursts. At any rate, it's helpful especially for support builds."
				return [str,null];
			}
			else if(topic === "Foc") {
				let str = "**Main Contributor For:** *Hit Rate, Crit Damage, Magic Power*"
				str = str + "\n**Partial Contributor For:** *Max Charge, Energy Attack, Physical Defense, Energy Defense, Speed, Dodge, Block Rate, Crit Rate*"
				str = str + "\n**Foc** is the most versatile stat in the game, though the bonuses it gives are small in most cases. Most characters will want at least partial investment in Foc in case they go up against high dodge enemies."
				return [str,null];
			}
			else if(topic === "Sol") {
				let str = "**Main Contributor For:** *Max Charge, Energy Attack, Magic Defense*"
				str = str + "\n**Partial Contributor For:** *Energy Regen, Crit Damage, Block Power, Physical Defense, Energy Defense*"
				str = str + "\n**Sol** is primarily for energy based damage builds, but it can be helpful to boost a character's Magic Defense while increasing their Max Charge as well."
				return [str,null];
			}
		}
		else if(choice === "Advanced Stats") { 
			if(topic === "Health") {
				let str = "Measurement of how much of a beating a character can take."
				return [str,null];
			}
			else if(topic === "Energy") {
				let str = "Measurement of how Ki a character can channel in a short amount of time."
				return [str,null];
			}
			else if(topic === "Health Regen") {
				let str = "How fast a character recovers from wounds."
				return [str,null];
			}
			else if(topic === "Energy Regen") {
				let str = "How fast a character can recover Ki."
				return [str,null];
			}
			else if(topic === "Charge") {
				let str = "A measurement of how much Ki a character can use to empower themselves. The amount of charge you have is used to calculate Charge Bonus, before being applied to increase many of the other advanced stats in battle."
				return [str,null];
			}
			else if(topic === "Charge Bonus") {
				let str = "How effective a character's charge stacks are. This is a multiplier for many stats during combat."
				return [str,null];
			}
			else if(topic === "Hit Rate") {
				let str = "How accurate a character is. This stat reduces the likelyhood a character is to evade an attack."
				return [str,null];
			}
			else if(topic === "Dodge Rate") {
				let str = "How good a character is at evading attacks."
				return [str,null];
			}
			else if(topic === "Speed") {
				let str = "How fast a character moves. This is mainly used for Strike and Burst attacks. If your speed is high enough over another's, you will get more hits with Strike and Burst."
				return [str,null];
			}
			else if(topic === "Crit Rate") {
				let str = "Measurement of how often a character strikes vital/weak areas on an enemy. When it triggers, Crit Damage multiplies the base damage of an attack. Caps at 70%."
				return [str,null];
			}
			else if(topic === "Crit Damage") {
				let str = "How hard a character strikes vital/weak points. When you crit, this is the multiplier used to increase damage."
				return [str,null];
			}
			else if(topic === "Block Rate") {
				let str = "Percent chance of blocking incoming damage."
				return [str,null];
			}
			else if(topic === "Block Power") {
				let str = "Measures how much damage is reduced when you block attacks. Damage is reduced by 50% for every 400 block power."
				return [str,null];
			}
			else if(topic === "Physical/Energy Defense") {
				let str = "Measures how much damage is reduced when taking hits. Damage is reduced by 50% for every 100 Physical/Energy Defense."
				return [str,null];
			}
			else if(topic === "Physical/Energy Attack") {
				let str = "Measures how hard your attacks hit. Strikes use Physical and Ki/Burst uses Energy."
				return [str,null];
			}
			else if(topic === "Magic Power") {
				let str = "Magic Power effects how powerful restoration skills are."
				return [str,null];
			}
			else if(topic === "Magical Defense") {
				let str = "Measures how resistant a character is to incoming debuff effects."
				return [str,null];
			}
		}
		else if(choice === "Races") { 
			if(topic === "Human") {
				let str = "**Mainstat Multipliers** 10% Str, 10% Dex, 15% Con, 15% Eng, 10% Sol, 10% Foc"
				str = str + "\n**Other Bonuses** 15% Energy, 10% Charge Bonus, 30% Hit%, 25% Magic Stats"
				str = str + "\n**Levelup Bonus** 2 Str, 2 Dex, 2 Con, 2 Eng, 2 Sol, 2 Foc"
				str = str + "\n**Overall**, humans (Earthlings) are balanced fighters that can fit into practically any role. Though they lack powerful racial passives or boosts, they have high stat growth with time."
				return [str,null];
			}
			else if(topic === "Saiyan") {
				let str = "**Mainstat Multipliers** 0% Str, 20% Dex, 0% Con, 10% Eng, 20% Sol, 0% Foc"
				str = str + "\n**Other Bonuses** -10% HP, -100% Magic Power, -25% Magic Defense, 10% Charge Max, 15% Crit Damage, 10% Block Rate"
				str = str + "\n**Levelup Bonus** 1 Str, 3 Dex, 1 Con, 2 Eng, 1 Sol, 3 Foc"
				str = str + "\n**Racial Mechanic** Zenkai Boost (Pureblood); Gain high boost to Foc and Dex, with small boosts to Str and Eng when near death or dying during risky battles."
				str = str + "\n**Saiyans** are powerful not only due to the Super Saiyan transformation line, but due to their Zenkai boosts that can create extremely quick power increases. Saiyans make good damage focused characters, but not much else."
				return [str,null];
			}
			else if(topic === "Half-Saiyan") {
				let str = "**Mainstat Multipliers** 10% Str, 20% Dex, 0% Con, 10% Eng, 0% Sol, 10% Foc"
				str = str + "\n**Other Bonuses** -5% HP, 10% Charge Bonus, 10% Energy Regen, 15% Hit Rate, 10% Block Rate"
				str = str + "\n**Levelup Bonus** 2 Str, 3 Dex, 1 Con, 2 Eng, 1 Sol, 2 Foc"
				str = str + "\n**Racial Mechanic** Zenkai Boost (Diluted); Gain high boost to Eng, and small boosts to every other stat when near death or dying during risky battles."
				str = str + "\n**Half-Saiyans** come closer in line with Humans in versatility, but a strong tilt towards damage roles remains. Unlike pureblood saiyans, however, Half-Saiyans have a strong lean towards physical builds."
				return [str,null];
			}
			else if(topic === "Android") {
				let str = "**Mainstat Multipliers** 20% Str, 5% Dex, 20% Con, -20% Eng, 10% Sol, 5% Foc"
				str = str + "\n**Other Bonuses** -100% Magic Power, -60% Energy, 25% Energy Defense, 50% Magic Defense"
				str = str + "\n**Levelup Bonus** 3 Str, 2 Dex, 2 Con, 1 Eng, 2 Sol, 2 Foc"
				str = str + "\n**Racial Mechanic** Unlimited Energy; Androids regain nearly all of their energy pool every turn."
				str = str + "\n**Androids** have a heavily reduced Energy pool, with 20% of their Eng stat being reduced, as well as the Eng stat scaling 60% worse than other races. However, with Unlimited Energy, they can use as many techniques as they wish and never run into issues. They can make decent tanks, or any kind of technique spammer."
				return [str,null];
			}
			else if(topic === "Majin") {
				let str = "**Mainstat Multipliers** 0% Str, 0% Dex, 30% Con, 10% Eng, 10% Sol, 0% Foc"
				str = str + "\n**Other Bonuses** -25% Energy Regen, 200% Health Regen, 20% Physical Defense, 200% Magic Power, 100% Magic Defense"
				str = str + "\n**Levelup Bonus** 1 Str, 1 Dex, 4 Con, 2 Eng, 2 Sol, 1 Foc"
				str = str + "\n**Racial Mechanic** Majin Reselience; Majins are beings of pure energy, and as such you must reduce both their HP and EN pools before they can die."
				str = str + "\n**Majins** are an obvious choice for either a tank or a support character, prefering magical techniques over energy based ones."
				return [str,null];
			}
			else if(topic === "Namekian") {
				let str = "**Mainstat Multipliers** 20% Str, 0% Dex, 10% Con, 10% Eng, 0% Sol, 10% Foc"
				str = str + "\n**Other Bonuses** 100% Health Regen, 10% Block Rate, 10% Block Power, 20% Defenses, 25% Magic Defense"
				str = str + "\n**Levelup Bonus** 2 Str, 1 Dex, 3 Con, 2 Eng, 1 Sol, 2 Foc"
				str = str + "\n**This** version of the Namekian race is the warrior type, focusing mostly on physical stats. They can be decent physical damage dealers, or versatile tanks."
				return [str,null];
			}
			else if(topic === "Dragon Clan") {
				let str = "**Mainstat Multipliers** 0% Str, 0% Dex, 0% Con, 30% Eng, 10% Sol, 10% Foc"
				str = str + "\n**Other Bonuses** -25% Physical Attack, -20% Energy Attack, 50% Health Regen, 15% Energy Regen, 150% Magic Power, 50% Magic Defense"
				str = str + "\n**Levelup Bonus** 1 Str, 1 Dex, 1 Con, 4 Eng, 2 Sol, 2 Foc"
				str = str + "\n**Dragon Clan** Namekians are known mostly as sages or spellcasters, but they're fairly competent with energy techniques as well."
				return [str,null];
			}
			else if(topic === "Arcosian") {
				let str = "**Mainstat Multipliers** 0% Str, 20% Dex, 0% Con, 20% Eng, 0% Sol, 10% Foc"
				str = str + "\n**Other Bonuses** 20% Speed, 25% Energy Defense, 15% Magic Defense, 10% Energy Attack"
				str = str + "\n**Levelup Bonus** 1 Str, 3 Dex, 1 Con, 3 Eng, 1 Sol, 2 Foc"
				str = str + "\n**Arcosians**, or Frieza's race, are a fast, energy resistant group. They work best with high dex to take advantage of their high speed, but energy based builds could work as well."
				return [str,null];
			}
			else if(topic === "Alien") {
				let str = "**Mainstat Multipliers** 10% Str, 10% Dex, 20% Con, 20% Eng, 0% Sol, 10% Foc"
				str = str + "\n**Other Bonuses** 10% Charge Bonus, 10% Max Charge, 10% Health, 10% Energy, 20% Regen, 10% Crit Rate"
				str = str + "\n**Levelup Bonus** 2 Str, 1 Dex, 3 Con, 3 Eng, 1 Sol, 2 Foc"
				str = str + "\n**'Alien'** is the catch-all group for any race either unnamed or unlisted for the game. They're a fairly versatile race, similar to Earthlings, but work better as tanks than support."
				return [str,null];
			}
			else if(topic === "Core Person") {
				let str = "**Mainstat Multipliers** 10% Str, 15% Dex, 0% Con, 10% Eng, 15% Sol, 30% Foc"
				str = str + "\n**Other Bonuses** 30% Charge Max, 10% Hit chance, 10% Crit Damage, 20% Magic Power, 50% Magic Defense"
				str = str + "\n**Levelup Bonus** 1 Str, 3 Dex, 2 Con, 2 Eng, 2 Sol, 4 Foc"
				str = str + "\n**Core People** are best known as their role for managing the galaxy as Kais. They are few in number, but have powerful magical potential. They work well as supports, or damage dealers, but are only available to those who have proven themselves to the Kais."
				return [str,null];
			}
		}
		else return ["?", "?"]
	}

	//returns the string for a given tutorial type
	static tutorial(set) {
		if(set === 1) {
			return "Great! Now you're ready to try out battles. Try using **g battle easy** to start."
		}
		else if(set === 2) {
			return "\nNice job! You can earn techniques, zeni (money), exp and items from these battles, though items only come from the Challenge difficulty. Speaking of items, let's try buying one from the **g shop**."
		}
		else if(set === 3) {
			return "\nGreat. Items can make a big difference in your stats, especially once you start affixing them. Let's try equipping this one, now. You can open your inventory by using **g inv** to check which slot, then **g equipitem [itemslot]** to equip that first slot."
		}
		else if(set === 4) {
			return "\nLooking good. Last thing! You can open the help menu with the **g help** command. I'll display most information you might need, you merely need to look. Try it out!"
		}
		else if(set === 5) {
			return "\nThat's all! Thanks for sticking it out, and enjoy yourself. Here's " + Help.tutorialReward.toLocaleString(undefined) + " zeni for your troubles."
		}
		else return "?";
	}
}

module.exports = {
  Help : Help
}