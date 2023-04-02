const char = require("./character.js");

const Character = char.Character;

/************
 * This class handles grouping players up. 
 * Every player in a party holds a copy of
 * the group, to make passing it to the 
 * battle class easier.
************/
class Party {
	constructor(teamlead,name) {
		teamlead.party = this;
		
		this.partyLeader = teamlead;
		this.partyName = name;
		this.partyList = new Array();
		this.partyList.push(teamlead);

		this.maxSize = 3;
		this.expShare = 0.3;
		this.expMod = 1 - (0.1 * (this.partyList.length-1));

		this.disbanding = 0;
	}

	//clone the party and return it for the battle
	clone() { 
		let newParty = new Party(this.partyLeader.clone(), this.name);
		for(let i = 1; i < this.partyList.length; i++) {
			newParty.addCharacter(this.partyList[i].clone());
		}
		return newParty;
	}

	addEXP(charList, char, xp) { 
		for(let i = 0; i < this.partyList.length; i++) {
			if(this.partyList[i].name !== char.name || this.partyList[i].playerID !== char.playerID) {
				let z = charList.map(function(e) { return e.playerID+e.name; }).indexOf(this.partyList[i].playerID+this.partyList[i].name);
	      if(z !== -1) charList[z].addEXP(Math.round(xp*this.expShare));
			}
		}
	}

	addCharacter(newChar) { 
		for(let i = 0; i < this.partyList.length; i++) {
			if(this.partyList[i].name === newChar.name && this.partyList[i].playerID === newChar.playerID) {
				return -1;
			}
		}

		if(this.partyList.length < this.maxSize) {
			newChar.party = this;
			this.partyList.push(newChar);
			this.expMod = 1 - (0.1 * (this.partyList.length-1));
			return 1;
		}
		else return 0;
	}

	removeCharacter(char) { 
		for(let i = 0; i < this.partyList.length; i++) {
			if(this.partyLeader.name === char.name && this.partyLeader.playerID === char.playerID) {
				return -1;
			}
			else if(this.partyList[i].name === char.name && this.partyList[i].playerID === char.playerID) {
				this.partyList.splice(i,1);
				this.expMod = 1 - (0.1 * (this.partyList.length-1));
				return 1;
			}
		}
		return 0;
	}
}

module.exports = {
  Party : Party
}