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
	constructor(leader,name,styleName) {
		leader.dojo = this;
		this.guildLeader = leader;
		this.guildName = name;
		this.guildStyle = styleName;
		this.guildList = new Array();
		this.guildList.push(leader);

		this.maxSize = 100;
	}

	addPlayer(user) { 
		for(let i = 0; i < this.guildList.length; i++) {
			if(this.guildList[i].userID === user.userID) {
				return -1;
			}
		}

		if(this.guildList.length < this.maxSize) {
			user.dojo = this;
			this.guildList.push(user);
			return 1;
		}
		else return 0;
	}

	removePlayer(user) { 
		for(let i = 0; i < this.guildList.length; i++) {
			if(this.guildLeader.userID === user.userID) {
				return -1;
			}
			else if(this.guildList[i].userID === user.userID) {
				this.guildList.splice(i,1);
				return 1;
			}
		}
		return 0;
	}
}

module.exports = {
  Dojo : Dojo
}