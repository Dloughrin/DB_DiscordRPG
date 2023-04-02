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
	// Auto response types for applicants
	static Ping = "Do Nothing";
	static Accept = "Auto Accepted";
	static Decline = "Auto Declined";

	// Ranks
	static Master = "Master";
	static Council = "Teacher";
	static Officer = "Senior Learner";
	static Member = "Learner";

	constructor(leader,name,styleName) {
		leader.dojo = this;
		leader.dojoRank = Dojo.Master;

		this.guildLeader = leader;
		this.guildName = name;
		this.guildStyle = styleName;
		this.guildList = new Array();
		this.guildList.push(leader);
		this.replyType = Dojo.Ping;

		this.disbanding = 0;

		this.maxSize = 100;
	}

	receiveApplication(user) {
		if(this.replyType == Dojo.ping) {
			return Dojo.ping;
		}
		else if(this.replyType == Dojo.Decline) {
			return Dojo.Decline;
		}
		else {
			addPlayer(user);
			return Dojo.Accept;
		}
	}

	addPlayer(user) { 
		for(let i = 0; i < this.guildList.length; i++) {
			if(this.guildList[i].userID === user.userID) {
				return -1;
			}
		}

		if(this.guildList.length < this.maxSize) {
			user.dojo = this;
			user.dojoRank = Dojo.Member;
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

	static passLeader(user, targetUser) {
		if(user.dojo == targetUser.dojo && user.userID !== targetUser.userID) {
			user.dojo.guildLeader = targetUser;
			user.dojoRank = targetUser.dojoRank;
			targetUser.dojoRank = Dojo.Master;
			return user.dojo;
		}
		else {
			return -1;
		}
	}

	static setRank(user, rank) {
		if(rank === Dojo.Officer || rank === Dojo.Council || rank === Dojo.Member) {
			user.dojoRank = rank;
		}
	}
}

module.exports = {
  Dojo : Dojo
}