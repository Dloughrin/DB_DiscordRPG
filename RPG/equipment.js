const attbonus = require("./attributeBonus.js");

const AttributeBonus = attbonus.AttributeBonus;

class Equipment {
	constructor(uid, name, type) {
		this.uid = uid;
		this.name = name[0].name;
		this.type = type;
		this.attbonus = name[0];
		this.addedAffixes = 0;

		if(name[1] === 0) {
			this.quality = "Standard";
			this.maxAddedAffix = 1;
		} 
		else if(name[1] === 1){ 
			this.quality = "High";
			this.maxAddedAffix = 1;
		}
		else if(name[1] === 2) {
			this.quality = "Epic";
			this.maxAddedAffix = 2;
		}
		/*
		Rarities above Epic gain special affixes. Divines will have divine, mythic and legendary affixes,
		mythics will have mythic and legendary affixes, and legendary will only have one legendary affix.
			- Legendary: +30% affix value
			- Mythic: +40% affix value
			- Divine: +50% affix value
		*/
		else if(name[1] === 3) {
			this.quality = "Legendary";
			this.maxAddedAffix = 2;
		}
		else if(name[1] === 4) {
			this.quality = "Mythic";
			this.maxAddedAffix = 1;
		}
		else if(name[1] === 5) {
			this.quality = "Divine";
			this.maxAddedAffix = 1;
		}

	}
	
	loadObject(obj) {
		for(var prop in obj) {
			if(typeof this[prop] !== 'undefined') this[prop] = obj[prop];
		}
	}

	printequipment() {
		return [this.name, this.type, this.attbonus.outputBonusStr()]
	}

	canAffix(){
		if(this.addedAffixes >= this.maxAddedAffix) return -1;
		else return 1;
	}

	getQual() {
		let qual = 0;		
		if(this.quality === "Standard") {
			qual = 0;
		} 
		else if(this.quality === "High"){ 
			qual = 1;
		}
		else if(this.quality === "Epic") {
			qual = 2;
		}
		else if(this.quality === "Legendary") {
			qual = 3;
		}
		else if(this.quality === "Mythic") {
			qual = 4;
		}
		else if(this.quality === "Divine") {
			qual = 5;
		}

		return qual;
	}

	getAffixCost(str) {
		let qual = this.getQual();

		return this.attbonus.calcAffixCost(str,qual);
	}

/*
		Return -1 => Can't add more affixes
		Return 0 => Affix can't be added
		Return 1 => Affix was added
*/
	addAffix(affType) {
		if(this.addedAffixes >= this.maxAddedAffix) return -1;

		let qual = this.getQual();
		if(this.attbonus.ifZero(affType,qual)) {
			this.attbonus.itemSocketed(qual);
			this.addedAffixes++;
			return 1;
		}
		return 0;
	}
}

module.exports = {
	Equipment : Equipment
}