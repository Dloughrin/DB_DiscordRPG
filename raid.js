const char = require("./character.js");
const att = require("./attributes.js");
const tech = require("./technique.js");

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
		this.raidBoss = null;
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

	scaleStats() { }

	broly(npcList, techList, party) { 
		let attr = new Attributes(65,45,60,55,85,100);
      	let broly = new Character("Broly",new Races("Legendary_Super_Saiyan"),attr,"NPC");
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