class User {
	constructor(uid, inv) {
		this.userID = uid;
		this.charIDs = new Array();
		this.currentChar = 0;
		this.tags = new Array();
		this.over = -1;
    this.itemInventory = inv;
		this.zeni = 15000;

		this.shopping = 0;
		this.affixing = 0;
		this.trading = 0;
		this.sparOffer = 0;
		this.tutorial = 1;
		this.tutorialNearEnd = 0;

		// Dojo stuff
		this.dojo = null;
		this.dojoRank = null;

		//Race unlocks
		this.kai = 0;
		this.legendary = 0;

		this.trainingLog = "";
	}

	getMaxChar() {
		return 5 + 2*this.kai + 2* this.legendary;
	}

	checkTrainingLog() {
		let str = this.trainingLog;
		this.trainingLog = "";
		return str;
	}

	getCurrentChar() {
		return this.charIDs[this.currentChar];
	}
	
	addTag(tag) {
		let obtained = -1;
		for(let i = 0; i < this.tags.length; i++) {
			if(Number(tag) === Number(this.tags[i])) obtained = 1;
		}
		if(obtained === -1) {
			this.tags.push(tag);
			this.tags.sort(function(a,b) { return a - b });
		}
		else return obtained;
		return obtained;
	}

	ifTag(tag) {
		for(let i = 0; i < this.tags.length; i++) {
			if(Number(tag) === Number(this.tags[i])) {
				return 1;
			}
		}
		return 0;
	}

	overwrite(cindex) {
		if(this.over === -1) {
			this.over = cindex;
			return -1;
		}
		else if(this.over !== cindex) {
			this.over = cindex;
			return -1;
		}
		else if(this.over === cindex) {
			this.over = -1;
			return 1;
		}
	}
}

module.exports = {
  User : User
}