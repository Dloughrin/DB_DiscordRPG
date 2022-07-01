const char = require("./character.js");
const att = require("./attributes.js");
const tech = require("./technique.js");
const attbonus = require("./attributeBonus.js");
const races = require("./races.js");

const Races = races.Races;
const AttributeBonus = attbonus.AttributeBonus;
const Technique = tech.Technique;
const Attributes = att.Attributes;
const Character = char.Character;

class techniqueImprovement {
	static improvementStarts = [
			0,  //Kamehameha
			4,  //Galick Gun
			12, //Masenko
			18, //After Image Strike
			19, //Super Saiyan
			31, //Healing Wave
			34, //Kaio-ken
			51 //Full Power
	]
	static specialTechs = [
			19, //Super Saiyan
			25, //Get Angry!
			33, //Potential Unleashed
			51 //Full Power
	]

	static unloadStart(startID, char, user) {
		let options = new Array();
		if(startID === 0) {
			if(char.race.raceName === "Majin") {
				options.push([15,100]); //Majin Kamehameha, 100 tp
			}
		}
		else if(startID === 4) {
			options.push([5,100]); //Big Bang Attack, 100 tp
			if(user.ifTag(5) == 1) {
				options.push([6,200]); //Final Flash, 200 tp
			}
			if(user.ifTag(6) == 1 && user.ifTag(19) == 1 && (char.race.raceName === "Saiyan" || char.race.raceName === "Half-Saiyan")) {
				options.push([22,500]); //Majin SSJ, 500 tp
			}
		}
		else if(startID === 12) {
			options.push([41,75]); //Masenko Kai, 75 tp
			options.push([11,250]); //Special Beam Cannon, 250 tp
		}
		else if(startID === 18) {
			options.push([1,75]); //Instant Transmission Strike, 75 tp
		}
		else if(startID === 19) {
			if(char.race.raceName === "Saiyan" || char.race.raceName === "Half-Saiyan") {
				options.push([20,700]); //Perfected SSJ, 700 tp
				if(user.ifTag(20) == 1) {
					options.push([21,400]); //SSJ2, 400 tp
				}
				if(user.ifTag(21) == 1 || user.ifTag(22) == 1) {
					options.push([49,1400]); //Perfected SSJ2, 1400 tp
				}
				if(user.ifTag(49) == 1) {
					options.push([23,800]); //SSJ3, 800 tp
				}
				if(user.ifTag(23) == 1) {
					options.push([50,3000]); //Perfected SSJ3, 3000 tp
				}
			}
		}
		else if(startID === 31) {
			options.push([36,125]); //Super Healing Wave, 125 tp
			options.push([38,100]); //Guard Boost, 100 tp
			options.push([46,175]); //Energy Infusion, 175 tp
			if(char.race.raceName === "Majin") {
				options.push([29,125]); //Go Fast!, 125
			}
		}
		else if(startID === 34) {
			options.push([32,150]); //Kaio-ken Burst, 150 tp
			options.push([45,400]); //Kaio-ken x3, 400 tp
			if(user.ifTag(45) == 1) {
				options.push([48,1000]); //Kaio-ken x10, 1000 tp
			}
		}
		else if(startID === 51) {
			options.push([53,75]); //Full Power Strike, 75 tp
			options.push([52,75]); //Full Power Blast, 75 tp
			if(user.ifTag(53) == 1) {
				options.push([54,150]); //Full Power Combo, 150 tp
			}
			if(user.ifTag(52) == 1) {
				options.push([55,150]); //Full Power Finisher, 150 tp
			}
		}
		return options;
	}

	static unloadSpecial(startID, char, user) {
		let options = new Array();

		if(startID === 19) {
			if(char.race.raceName === "Saiyan" || char.race.raceName === "Half-Saiyan") {
				options.push([19,400]); //SSJ, 200 tp
			}
		}
		else if(startID === 25) {
			if(char.race.raceName === "Majin") {
				options.push([25,300]); //Get Angry!, 300 tp
			}
		}
		else if(startID === 33) {
			if(parseInt(char.potentialUnleashed) === 1) {
				options.push([33,500]); //Potential Unleashed, 700 tp
			}
		}
		else if(startID === 51) {
			if(parseInt(char.potentialUnlocked) === 1) {
				options.push([51,250]); //Full Power, 250 tp
			}
		}

		return options;
	}
}

module.exports = {
  techniqueImprovement : techniqueImprovement
}