const char = require("./character.js");
const att = require("./attributes.js");
const tech = require("./technique.js");
const party = require("./party.js");
const races = require("./races.js");
const attbonus = require("./attributeBonus.js");
const batt = require("./battle.js");

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
		/*this.raidBoss = null;
		this.subBoss = null;
		this.subBossNum = 0;
		this.multi = 1;

		this.allyNames = new Array();

		/*if(choice === 0) {
			this.raidBoss = this.broly();
			this.multi = 1.2;
			this.allyNames.push(["Future_Trunks",0.55]);
			this.allyNames.push(["Goku",0.65]);
			this.allyNames.push(["Vegeta",0.6]);
		}
		else if(choice === 1) {
			this.raidBoss = this.cell();
			this.subBoss = this.cellJR();
			this.subBossNum = 3;
			this.allyNames.push(["Future_Trunks",0.6]);
			this.allyNames.push(["Teen_Gohan",1.05]);
			this.allyNames.push(["Goku",0.85]);
			this.allyNames.push(["Vegeta",0.7]);
			this.allyNames.push(["Piccolo",0.5]);
		}
		else if(choice === 2) {
			this.raidBoss = this.superBuu();
			this.multi = 1.2;
			this.allyNames.push(["Gotenks",0.8]);
			this.allyNames.push(["Piccolo",0.6]);
		}
		else if(choice === 3) {
			this.raidBoss = this.gokuBlack();
			this.subBoss = this.zamasu();
			this.multi = 1.25;
			this.subBossNum = 1;
			this.allyNames.push(["Goku",0.8]);
			this.allyNames.push(["Vegeta",0.8]);
			this.allyNames.push(["Future_Trunks",0.5]);
		}*/
	}

	scaleStats(party, npcList) { 
		let statTotal = 0;
		for(let i = 0; i < party.partyList.length; i++) {
			statTotal += party.partyList[i].attributes.stotal;
		}
		statTotal = statTotal/party.partyList.length;

		for(let i = 0; i < npcList.partyList.length; i++) {
			let scalar = statTotal/npcList.partyList[i].attributes.stotal;
			npcList.partyList[i].attributes.str *= scalar;
			npcList.partyList[i].attributes.dex *= scalar;
			npcList.partyList[i].attributes.con *= scalar;
			npcList.partyList[i].attributes.eng *= scalar;
			npcList.partyList[i].attributes.foc *= scalar;
			npcList.partyList[i].attributes.sol *= scalar;
			npcList.partyList[i].statusUpdate(0);
		}
		return npcList;
	}

	//potential unlocked: epic box reward for first time, as well as the tag to double stat/technique point gain. small 'zenkai'-like boost
	static namekianTrial(techList, char, ID) { 
		let attr = new Attributes(30,30,70,120,80,130);
  	let elder = new Character("Grand_Elder",new Races("Dragon_Clan"),attr,"Random");
		let fighting = new AttributeBonus("Sage_Style","Fighting Style");
		fighting.loadBonuses(0,0,0.05,0.05,0,0.15,0,0,0,0,0.1,0,0,0,0,0,0,0,0,0,0,0.15,0,0,0);
		elder.fightingStyle = fighting;
		elder.styleName = "Sage_Style";
  	elder.level = char.level;
		elder.setPersonality("Support");
		elder.addTechnique(31, 'NPC');
		elder.addTechnique(36, 'NPC');
		elder.addTechnique(37, 'NPC');
		elder.addTechnique(38, 'NPC');
		elder.statusUpdate(0);


		attr = new Attributes(90,60,130,80,40,80);
  	let elderGuard = new Character("Grand_Elder's_Bodyguard",new Races("Namekian"),attr,"Random");
		fighting = new AttributeBonus("Guardian_Style","Fighting Style");
		fighting.loadBonuses(0.05,0.05,0.05,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.05,0,0.15,0.15,0,0,0,0);
		elderGuard.fightingStyle = fighting;
		elderGuard.styleName = "Guardian_Style";
  	elderGuard.level = char.level;
		elderGuard.setPersonality("Tank");
		elderGuard.addTechnique(39, 'NPC');
		elderGuard.addTechnique(14, 'NPC');
		elderGuard.addTechnique(40, 'NPC');
		elderGuard.setTransformation(24, 'NPC');
		elderGuard.statusUpdate(0);

		let party = new Party(elder,"Trial");
		party.partyList.push(elderGuard);

		attr = new Attributes(20,20,60,90,60,100);
  	let supporter = new Character("Elder's_Apprentice",new Races("Dragon_Clan"),attr,"Random");
		fighting = new AttributeBonus("Sage_Style","Fighting Style");
		fighting.loadBonuses(0,0,0.05,0.05,0,0.1,0,0,0,0,0.05,0,0,0,0,0,0,0,0,0,0,0.1,0,0,0);
		supporter.fightingStyle = fighting;
		supporter.styleName = "Sage_Style";
  	supporter.level = char.level;
		supporter.setPersonality("Support");
		supporter.addTechnique(31, 'NPC');
		supporter.addTechnique(37, 'NPC');
		supporter.statusUpdate(0);

		let trial = new Battle([char,supporter],party.partyList,ID,techList);
		trial.raid = 1;
		return trial;
	}

	//potential unleashed: mythic box reward for first time, as well as the tag to gain potential unleashed passive (10% all stats + 50% of racial bonus)
	static kaioshinTrial() { }

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

	cell() { }

	cellJR() { }

	superBuu() { }

	gokuBlack() { }

	zamasu() { }
}

module.exports = {
  Raid : Raid
}