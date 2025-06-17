const char = require("./character.js");
const att = require("./attributes.js");
const tech = require("./technique.js");
const party = require("./party.js");
const races = require("./races.js");
const attbonus = require("./attributeBonus.js");
const batt = require("./battle.js");
const equip = require("./equipment.js");

const Equipment = equip.Equipment;
const AttributeBonus = attbonus.AttributeBonus;
const Battle = batt.Battle;
const Races = races.Races;
const Party = party.Party;
const Character = char.Character;
const Attributes = att.Attributes;
const Technique = tech.Technique;

/*****************
 * Despite the name, this class doesn't handle
 * raid encounters. It's used to generate the 
 * special enemies used in raid encounters and
 * return the battle to start the raid.
******************/
class Raid {
	constructor(choice) { 
	}

	static scaleStats(char, stotal) { 
		let scalar = stotal/char.attributes.stotal;
		char.attributes.str *= scalar;
		char.attributes.dex *= scalar;
		char.attributes.con *= scalar;
		char.attributes.eng *= scalar;
		char.attributes.foc *= scalar;
		char.attributes.sol *= scalar;
		char.statusUpdate(0);
		return char;
	}

	static raidReward(raidID, char, user) { 
		let str = ""
		// Sage, flat stats + stat caps
		if(raidID === 1) {
				if(parseInt(char.potentialUnlocked) === 0) {
					let z = char.unlockPotential();
					char.statusUpdate(0);
					if(z === 1) str = char.name + " has unlocked their potential! Boost to all attributes, and increased maximum value for fighting styles!";
				}
		} // Kaioshin, race + stat caps
		else if(raidID === 2) {
			if(char.potentialUnleashed === 0) {
				let z = char.unleashPotential(1);
				if(z === 1) str = char.name + " has unleashed their potential! Their racial bonuses are now increased drastically.";
				if(parseInt(user.kai) === 0) {
					user.kai = 1;
					str += "\n**Additionally, you can now make characters with the Core Person race.**"
				}
			}
		} // Krillin, inv slots
		else if(raidID === 3) {
			if(user.itemInventory.inv1 === 0) {
				user.itemInventory.inv1 = 1;
				user.itemInventory.maxSize += 5;
			}
		}
		else { }

		return str;
	}

	//Item Inventory size increase #1
	static krillinTrial(techList, char, ID, Krillin) { 
  	let level = Math.max(400,char.level);
		let kClone = Krillin.clone();
		kClone.level = level;
		kClone = Raid.scaleStats(kClone,Math.max(350,200+char.attributes.stotal*0.75));
		kClone.fightingStyle.scaleStats(Math.min(100,char.fightingStyle.getTotalChange())/kClone.fightingStyle.getTotalChange());
		kClone.statusUpdate(0);
		kClone.raidBoss();

		let trial = new Battle([char],[kClone],ID,techList);
		trial.raid = 3;
		trial.expMod = 2;
		trial.itemBox = "Standard";

		return trial;
	}

	//potential unlocked: epic box reward for first time, as well as the tag to double stat/technique point gain. small 'zenkai'-like boost
	static sageTrial(techList, char, ID) { 
  		let level = Math.max(400,char.level);
		let attr = new Attributes(50,50,100,180,130,220);
  		let elder = new Character("Grand_Elder",new Races("Dragon_Clan"),attr,"Random");
		let fighting = new AttributeBonus("Sage_Style","Fighting Style");
		fighting.loadBonuses(0,0,0.1,0.1,0,0.2,0,0,0,0,0.2,0,0,0,0,0,0,0,0,0,0,0.2,0,0,0);
		elder.fightingStyle = fighting;
		elder.styleName = "Sage_Style";
	  	elder.level = level;
	  	elder.image = "https://cdn.discordapp.com/attachments/832585611486691408/988682923148443658/unknown.png";
		elder.setPersonality("Healer");
		elder.addTechnique(31, 'NPC');
		elder.addTechnique(36, 'NPC');
		elder.addTechnique(37, 'NPC');
		elder.addTechnique(38, 'NPC');
		elder.addTechnique(12, 'NPC');
		elder.statusUpdate(0);
		elder.raidBoss();


		attr = new Attributes(150,90,120,150,70,130);
  		let elderGuard = new Character("Grand_Elder's_Bodyguard",new Races("Namekian"),attr,"Random");
		fighting = new AttributeBonus("Guardian_Style","Fighting Style");
		fighting.loadBonuses(0.1,0.1,0.1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.1,0,0.2,0.2,0,0,0,0);
		elderGuard.fightingStyle = fighting;
		elderGuard.styleName = "Guardian_Style";
	  	elderGuard.level = level;
	  	elderGuard.image = "https://cdn.discordapp.com/attachments/832585611486691408/988683220881137724/unknown.png";
		elderGuard.setPersonality("Tank");
		elderGuard.addTechnique(39, 'NPC');
		elderGuard.addTechnique(14, 'NPC');
		elderGuard.addTechnique(14, 'NPC');
		elderGuard.addTechnique(16, 'NPC');
		elderGuard.addTechnique(41, 'NPC');
		elderGuard.setTransformation(24, 'NPC');
		elderGuard.statusUpdate(0);
		elderGuard.raidBoss();

		let party = new Party(elder,"Trial");
		party.partyList.push(elderGuard);

		attr = new Attributes(50,50,140,180,130,220);
  		let supporter = new Character("Elder's_Apprentice",new Races("Dragon_Clan"),attr,"Random");
		fighting = new AttributeBonus("Sage_Style","Fighting Style");
		fighting.loadBonuses(0,0,0.1,0.1,0,0.15,0,0,0,0,0.1,0,0,0,0,0,0,0,0,0,0,0.15,0,0,0);
		supporter.fightingStyle = fighting;
		supporter.styleName = "Sage_Style";
	  	supporter.level = level-40;
	  	supporter.image = "https://cdn.discordapp.com/attachments/832585611486691408/988683624419307530/unknown.png";
		supporter.setPersonality("Healer");
		supporter.addTechnique(31, 'NPC');
		supporter.addTechnique(37, 'NPC');
		supporter.addTechnique(12, 'NPC');
		supporter.statusUpdate(0);

		//[char,supporter]
		let trial = new Battle([char,supporter],party.partyList,ID,techList);
		trial.raid = 1;
		trial.expMod = 1.5;
		if(char.potentialUnlocked === 0) {
			trial.expMod += 0.25;
			trial.itemBox = "Epic";
		}
		else trial.itemBox = "Standard";

		return trial;
	}

	//potential unleashed: mythic box reward for first time, as well as the tag to gain potential unleashed passive (10% all stats + 50% of racial bonus)
	static kaioshinTrial(techList, char, ID, Gohan) { //techList, char, ID
															//str,dex,c,e,sol,foc
  		let level = Math.max(400,char.level);
		let attr = new Attributes(150,340,220,150,300,740);
  		let kaioshin = new Character("Supreme_Kai",new Races("Core_Person"),attr,"Random");
		let fighting = new AttributeBonus("Sage_Style","Fighting Style");
		fighting.loadBonuses(0,0.2,0,0,0.05,0.5,0,0,0,0,0,0,0,0,0,0,0.25,0,0,0,0,0,0,0,0.25);
		kaioshin.fightingStyle = fighting;
		kaioshin.styleName = "Kai_Style";
	  	kaioshin.level = level;
	  	kaioshin.image = "https://cdn.discordapp.com/attachments/986234335051018340/989266058160529459/unknown.png";
		kaioshin.setPersonality("Blaster");
		kaioshin.setTransformation(33, 'NPC');
		kaioshin.addTechnique(42, 'NPC'); 
		kaioshin.addTechnique(43, 'NPC'); 
		kaioshin.addTechnique(44, 'NPC'); 
		kaioshin.addTechnique(32, 'NPC'); 
		kaioshin.addTechnique(36, 'NPC'); 

		let equipThing = new AttributeBonus("Kaioshin's_Dogi","Dogi")
		equipThing.loadBonuses(0,0,0.10,0.10,0,0.12,0,0,0,0,0,0,0,0,0,0.10,0.15,0.15,0,0,0,0,0,0,0.2);
		let kdogi = new Equipment(-1,[equipThing,5], "Dogi");
		kaioshin.dogi = kdogi;

		equipThing = new AttributeBonus("Kaioshin's_Orb","Weapon")
		equipThing.loadBonuses(0,0,0,0,0,0.15,0.1,0,0,0,0,
			0,0,0,0,0.1,0.12,0,0,0.9,0,0.1,
			0,0,0.15);
		let wep = new Equipment(-1,[equipThing,5], "Weapon");
		kaioshin.weapon = wep;
		kaioshin.statusUpdate(0);
		kaioshin.raidBoss();

		attr = new Attributes(100,240,260,175,270,700);
  		let kaiApprentice = new Character("Apprentice_Kai",new Races("Core_Person"),attr,"Random");
		fighting = new AttributeBonus("Sage_Style","Fighting Style");
		fighting.loadBonuses(0,0.15,0,0,0.05,0.35,0,0,0,0,0,0,0,0,0,0,0.2,0,0,0,0,0,0,0,0.2);
		kaiApprentice.fightingStyle = fighting;
		kaiApprentice.styleName = "Kai_Style";
	  	kaiApprentice.level = level-30;
	  	kaiApprentice.image = "https://cdn.discordapp.com/attachments/986234335051018340/989268135527989318/unknown.png";
		kaiApprentice.setPersonality("Healer");
		kaiApprentice.addTechnique(45, 'NPC');
		kaiApprentice.addTechnique(36, 'NPC');
		kaiApprentice.addTechnique(37, 'NPC');
		kaiApprentice.addTechnique(46, 'NPC');
		kaiApprentice.addTechnique(42, 'NPC'); 
		kaiApprentice.setTransformation(33, 'NPC');

		equipThing = new AttributeBonus("Apprentices's_Dogi","Dogi")
		equipThing.loadBonuses(0,0,0.20,0,0,0.09,0,0,0,0,0,0,0,0,0,0.08,0.12,0,0,0,0,0,0,0,0.17);
		let dogi = new Equipment(-1, [equipThing,4], "Dogi");
		kaiApprentice.dogi = dogi;


		equipThing = new AttributeBonus("Apprentice's_Orb","Weapon")
		equipThing.loadBonuses(0,0,0,0,0,0.12,0.1,0,0,0,0,
			0,0,0,0,0.12,0,0,0,0,0.1,0.1,
			0,0,0.11);
		wep = new Equipment(-1,[equipThing,5], "Weapon");
		kaiApprentice.weapon = wep;
		kaiApprentice.statusUpdate(0);
		kaiApprentice.raidBoss();

		attr = new Attributes(280,600,300,280,150,360);
  		let kaiAttendant = new Character("Kaioshin's_Attendant",new Races("Core_Person"),attr,"Random");
		fighting = new AttributeBonus("Core_Style","Fighting Style");
		fighting.loadBonuses(0,0.4,0.15,0,0,0.1,0,0,0,0,0,0,0,0,0,0.1,0,0.4,0,0,0,0,0,0.1,0);
		kaiAttendant.fightingStyle = fighting;
		kaiAttendant.styleName = "Core_Style";
	  	kaiAttendant.level = level;
	  	kaiAttendant.image = "https://cdn.discordapp.com/attachments/986234335051018340/989265767402995752/unknown.png";
		kaiAttendant.setPersonality("Tank");
		kaiAttendant.addTechnique(45, 'NPC');
		kaiAttendant.addTechnique(47, 'NPC');
		kaiAttendant.addTechnique(42, 'NPC'); 
		kaiAttendant.addTechnique(27, 'NPC'); 
		kaiAttendant.addTechnique(32, 'NPC'); 
		kaiAttendant.setTransformation(33, 'NPC');

		equipThing = new AttributeBonus("Assistant's_Dogi","Dogi")
		equipThing.loadBonuses(0,0.12,0.22,0.17,0,0,0,0,0,0,0,0,0,0,0,0,0,0.2,0,0.15,0.15,0,0,0.1,0);
		dogi = new Equipment(-1,[equipThing,5], "Dogi");
		kaiAttendant.dogi = dogi;

		equipThing = new AttributeBonus("Attendant's_Sword","Weapon")
		equipThing.loadBonuses(0.12,0.1,0,0,0,0,0.1,0,0,0.1,0,
			0,0,0,0,0.1,0,0.12,0.1,0,0.1,0,
			0,0.15,0);
		wep = new Equipment(-1,[equipThing,5], "Weapon");
		kaiAttendant.weapon = wep;
		kaiAttendant.statusUpdate(0);
		kaiAttendant.raidBoss();

		let party = new Party(kaioshin,"Trial");
		party.partyList.push(kaiApprentice);
		party.partyList.push(kaiAttendant);

		let gohanClone = Gohan.clone();
		gohanClone.level = level;
		gohanClone = Raid.scaleStats(gohanClone,kaioshin.attributes.stotal*1.05);
		gohanClone.fightingStyle.scaleStats(kaioshin.fightingStyle.getTotalChange()/gohanClone.fightingStyle.getTotalChange());


		//[char,gohanClone]
		let trial = new Battle([char,gohanClone],party.partyList,ID,techList);
		trial.raid = 2;
		trial.expMod = 1.5;
		if(char.potentialUnleashed === 0) {
			trial.expMod += 0.5;
			trial.itemBox = "Legendary";
		}
		else trial.itemBox = "Epic";

		return trial;
	}

	// Chance of unlocking Legendary SS, only 1 limited race per account
	broly(npcList, techList, party) { 
		let attr = new Attributes(65,45,60,55,85,100);
  		let broly = new Character("Broly",new Races("Legendary_Super_Saiyan"),attr,"Random");
		let fighting = new AttributeBonus("Legendary_Super_Saiyan","Fighting Style");
		fighting.loadBonuses(0.1,0,0.25,0.1,0.25,0.4,0,
	/* health,energy,healthRegen,energyRegen, */ 5,1,0.25,5,
		0,0.5,0,0,0.5,0,0.25,0,0.25,0.25,0,  0.25,0,0);
		broly.fightingStyle = fighting;
		broly.styleName = "Legendary_Super_Saiyan";
		broly.setPersonality("AllOut");

		//set Legendary_Super_Saiyan transformation
		//Gigantic Meteor (ki),Blaster Shell (ki), Gigantic Omega (strike), Blaster Meteor (ki), Overwealming Power (buff)

	}

	// Chance of unlocking Bio Android, only 1 limited race per account
	cell() { }

	// Chance of unlocking Legendary Majin, only 1 limited race per account
	superBuu() { }

	// Chance of unlocking Legendary Core Person, only 1 limited race per account
	zamasu() { }
}

module.exports = {
  Raid : Raid
}