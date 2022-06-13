const equipment = require("./equipment.js");

const Equipment = equipment.Equipment;

class Inventory {
	constructor(uid, userID) {
		this.maxSize = 20;
		this.uid = uid;
		this.userID = userID;
		this.items = new Array();
	}

	addItem(item) {
		if(this.items.length >= this.maxSize) {
			return 0;
		}
		else {
			this.items.push(item);
			return 1;
		}
	}

	removeItem(id) {
		if(id < 0 || id >= this.items.length) {
			return 0;
		}
		else {
			this.items.splice((id-1),1);
			return 1;
		}
	}

	printItem(id) {
		if(id < 0 || id >= this.items.length) {
			return null;
		}
		else {
			let str = this.items[(id-1)].attbonus.outputBonusStr();
			return str;
		}
	}

	getItem(id) {
		if(id < 0 || id >= this.items.length) {
			return null;
		}
		else {
			return this.items[(id-1)];
		}
	}
}

module.exports = {
	Inventory : Inventory
}