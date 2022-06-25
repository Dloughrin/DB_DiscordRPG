const char = require("./character.js");

const Character = char.Character;

/************
 * This class handles grouping players up. 
 * Every player in a dojo will have a 
 * reference to it saved. Dojo's are mostly
 * focused on helping lower level characters
 * scale up their fighting style faster,
 * and to improve the training system for
 * characters in a Dojo. Additionally provides
 * guild buffs.
************/
class Dojo {
	constructor(leader,name) {
		leader.dojo = this;
		this.guildLeader = leader;
		this.guildName = name;
		this.guildStyle = leader.styleName;
		this.guildList = new Array();
		this.guildList.push(leader);

		this.maxSize = 100;

		this.disbanding = 0;
	}

	addCharacter(newChar) { 
		for(let i = 0; i < this.guildList.length; i++) {
			if(this.guildList[i].name === newChar.name && this.guildList[i].playerID === newChar.playerID) {
				return -1;
			}
		}

		if(this.guildList.length < this.maxSize) {
			newChar.dojo = this;
			this.guildList.push(newChar);
			this.expMod = 1 - (0.1 * (this.guildList.length-1));
			return 1;
		}
		else return 0;
	}

	removeCharacter(char) { 
		for(let i = 0; i < this.guildList.length; i++) {
			if(this.guildLeader.name === char.name && this.guildLeader.playerID === char.playerID) {
				return -1;
			}
			else if(this.guildList[i].name === char.name && this.guildList[i].playerID === char.playerID) {
				this.guildList.splice(i,1);
				this.expMod = 1 - (0.1 * (this.guildList.length-1));
				return 1;
			}
		}
		return 0;
	}
}

module.exports = {
  Dojo : Dojo
}