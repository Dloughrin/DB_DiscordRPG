// rpg/techniqueImprovement.js
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
        0,  // Kamehameha
        4,  // Galick Gun
        12, // Masenko
        18, // After Image Strike
        19, // Super Saiyan
        31, // Healing Wave
        34, // Kaio-ken
        51  // Full Power
    ];
    static specialTechs = [
        19, // Super Saiyan
        25, // Get Angry!
        33, // Potential Unleashed
        51  // Full Power
    ];

    static unloadStart(startID, char, user) {
        let options = [];
        if (!this.hasTechnique(user, startID)) return options; // Check if user has the base technique

        if (startID === 0) {
            if (char.race.raceName === "Majin") {
                if (!this.hasTechnique(user, 15)) options.push([15, 100, "Majin Kamehameha"]); // [techID, tpCost, name]
            }
        } else if (startID === 4) {
            if (!this.hasTechnique(user, 5)) options.push([5, 100, "Big Bang Attack"]);
            if (user.ifTag(5) == 1) {
                if (!this.hasTechnique(user, 6)) options.push([6, 200, "Final Flash"]);
            }
            if (user.ifTag(6) == 1 && user.ifTag(19) == 1 && (char.race.raceName === "Saiyan" || char.race.raceName === "Half-Saiyan")) {
                if (!this.hasTechnique(user, 22)) options.push([22, 500, "Majin SSJ"]);
            }
        } else if (startID === 12) {
            if (!this.hasTechnique(user, 41))options.push([41, 75, "Masenko Kai"]);
            if (!this.hasTechnique(user, 11))options.push([11, 250, "Special Beam Cannon"]);
        } else if (startID === 18) {
            if (!this.hasTechnique(user, 1)) options.push([1, 75, "Instant Transmission Strike"]);
        } else if (startID === 19) {
            if (char.race.raceName === "Saiyan" || char.race.raceName === "Half-Saiyan") {
                if (!this.hasTechnique(user, 20)) options.push([20, 700, "Perfected SSJ"]);
                if (user.ifTag(20) == 1) {
                    if (!this.hasTechnique(user, 21)) options.push([21, 400, "SSJ2"]);
                }
                if (user.ifTag(21) == 1 || user.ifTag(22) == 1) {
                    if (!this.hasTechnique(user, 49)) options.push([49, 1400, "Perfected SSJ2"]);
                }
                if (user.ifTag(49) == 1) {
                    if (!this.hasTechnique(user, 23)) options.push([23, 800, "SSJ3"]);
                }
                if (user.ifTag(23) == 1) {
                    if (!this.hasTechnique(user, 50)) options.push([50, 3000, "Perfected SSJ3"]);
                }
            }
        } else if (startID === 31) {
            if (!this.hasTechnique(user, 36)) options.push([36, 125, "Super Healing Wave"]);
            if (!this.hasTechnique(user, 38)) options.push([38, 100, "Guard Boost"]);
            if (!this.hasTechnique(user, 46)) options.push([46, 175, "Energy Infusion"]);
            if (char.race.raceName === "Majin") {
                if (!this.hasTechnique(user, 29)) options.push([29, 125, "Go Fast!"]);
            }
        } else if (startID === 34) {
            if (!this.hasTechnique(user, 32)) options.push([32, 150, "Kaio-ken Burst"]);
            if (!this.hasTechnique(user, 45)) options.push([45, 400, "Kaio-ken x3"]);
            if (user.ifTag(45) == 1) {
                if (!this.hasTechnique(user, 48)) options.push([48, 1000, "Kaio-ken x10"]);
            }
        } else if (startID === 51) {
            if (!this.hasTechnique(user, 53)) options.push([53, 75, "Full Power Strike"]);
            if (!this.hasTechnique(user, 52)) options.push([52, 75, "Full Power Blast"]);
            if (user.ifTag(53) == 1) {
                if (!this.hasTechnique(user, 54)) options.push([54, 150, "Full Power Combo"]);
            }
            if (user.ifTag(52) == 1) {
                if (!this.hasTechnique(user, 55)) options.push([55, 150, "Full Power Finisher"]);
            }
        }
        return options;
    }

    static unloadSpecial(startID, char, user) {
        let options = [];
        if (startID === 19 && (char.race.raceName === "Saiyan" || char.race.raceName === "Half-Saiyan")) {
            if (!this.hasTechnique(user, 19)) options.push([19, 400, "Super Saiyan"]);
        } else if (startID === 25 && char.race.raceName === "Majin") {
            if (!this.hasTechnique(user, 25)) options.push([25, 300, "Get Angry!"]);
        } else if (startID === 33 && parseInt(char.potentialUnleashed) === 1) {
            if (!this.hasTechnique(user, 33)) options.push([33, 500, "Potential Unleashed"]);
        } else if (startID === 51 && parseInt(char.potentialUnlocked) === 1) {
            if (!this.hasTechnique(user, 51)) options.push([51, 250, "Full Power"]);
        }
        return options;
    }

    // New helper method to check if user has a technique
    static hasTechnique(user, techID) {
        return user.tags.includes(techID);
    }

    // New method to apply technique improvement
    static applyImprovement(char, user, techID, techCost) {
        if (char.techniquePoints >= techCost && user.addTag(techID) === -1) {
            char.techniquePoints -= techCost;
            return true;
        }
        return false;
    }

    static unloadAllTechs(char, user) {
    	let techsList = [];
    	let newTechsList = [];

			this.improvementStarts.forEach(startID => {
	        techsList = techsList.concat(this.unloadStart(startID, char, user));
	    });
	    this.specialTechs.forEach(startID => {
	        techsList = techsList.concat(this.unloadSpecial(startID, char, user));
	    });

    	return techsList;
    }
}

module.exports = {
    techniqueImprovement: techniqueImprovement
};