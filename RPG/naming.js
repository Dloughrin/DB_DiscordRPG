const attbonus = require("./attributeBonus.js");

const AttributeBonus = attbonus.AttributeBonus;

class Naming {
	constructor() {
		this.standardLengths 	= [0,0,0,1,1,1,1,2,2]
		this.epicLengths 		= [1,1,2,2,2,2,3,3,3]
		this.legendaryLengths 	= [2,2,2,3,3,3,3,4,4]
		this.mythicLengths 		= [3,3,4,4,4,4,4,5,5]
		this.lengths 			= [0,0,0,1,1,1,1,2,2]

		this.imageURL = 'https://cdn.discordapp.com/attachments/832585611486691408/832868293701795850/unknown.png';
		this.weaponImageURL = 'https://cdn.discordapp.com/attachments/832585611486691408/985073790365093918/Sports_131.jpg';
		this.dogiImageURL = 'https://cdn.discordapp.com/attachments/832585611486691408/985074108863750185/unknown.png';
		this.adjectives = 
		[
			'Stupid', 'Drowsy', 'Slow', 'Fast', 'Hitchhiking', 'Flexing', 'Adorable', 'Aggressive',
			'Agreeable', 'Alert', 'Amused', 'Angry', 'Annoyed', 'Annoying', 'Anxious', 'Arrogant',
			'Ashamed', 'Attractive', 'Average', 'Awful', 'Bewildered', 'Blushing', 'Bored', 'Careful',
			'Clean', 'Dirty', 'Clumsy', 'Concerned', 'Confused', 'Creepy', 'Crazy', 'Cruel', 'Curious',
			'Cute', 'Dangerous', 'Defiant', 'Depressed', 'Determined', 'Disgusted', 'Disturbed', 'Dull',
			'Edgy', 'Eager', 'Elated', 'Elegant', 'Evil', 'Exuberant', 'Envious', 'Filthy', 'Friendly',
			'Fragile', 'Frail', 'Frantic', 'Funny', 'Frightened', 'Gentle', 'Glamorous', 'Glorious',
			'Good', 'Grieving', 'Grotesque', 'Graceful', 'Grumpy', 'Happy', 'Hungry', 'Ill', 'Important',
			'Inquisitive', 'Innocent', 'Itchy', 'Jealous', 'Jittery', 'Jolly', 'Kind', 'Horrible', 'Lazy',
			'Lucky', 'Lovely', 'Lively', 'Magnificent', 'Motionless', 'Mysterious', 'Nasty', 'Nice', 'Old',
			'Odd', 'Outrageous', 'Outstanding', 'Perfect', 'Proud', 'Prickly', 'Putrid', 'Real', 'Scary',
			'Selfish', 'Rich', 'Shiny', 'Smiling', 'Stormy', 'Super', 'Successful', 'Talented', 'Tasty',
			'Tender', 'Terrible', 'Troubled', 'Tough', 'Ugly', 'Uninterested', 'Unsightly', 'Unusual',
			'Upset', 'Uptight', 'Weary', 'Wandering', 'Worrisome', 'Witty', 'Wrong', 'Zanny', 'Zealous'
		];

		this.nouns = 
		[
			'Mailman', 'Farmer', 'Office Worker', 'Chef', 'Person', 'Rabbit', 'Waitress', 'Police Officer',
			'Waiter', 'Cashier', 'Janitor', 'Bartender', 'Contractor', 'Clerk', 'Jogger', 'Teacher', 'Librarian',
			'Mechanic', 'Carpenter', 'Electrician', 'Nurse', 'Doctor', 'Truck Driver', 'Cowboy', 'Lawyer', 'Alien',
			'Martial Artist', 'Boxer', 'Spiritualist', 'Saibamen', 'Radditz', 'Yamcha', 'Practitioner', 'Hermit', 
			'Demon', 'Frank', 'Master', 'Turtle Hermit', 'Crane Hermit', 'Galactic Patrolmen', 'Criminal', 'Hero',
			'Villain', 'Swordsmen'
		];

		this.professions =
		[
			"Spiritualist's_", "Martial_Artist's_", "Sage's_", "Magician's_", "Brawler's_", "Swordsmen's_",
			"Weapon_Master's_", "Healer's_", "Turtle_Hermit's_", "Crane_Hermit's_", "Dragon's_", "Berserker's_"
		];

		/*
		name.search(stuff)
		Strike 
			Fast Blade: Katana, Longsword, Shortsword, Dagger
			Slow Blade: Greatsword, Greataxe, Battle-axe
			Polearm: Polearm, Cane, Stave, Staff
			Fist: Unarmed, Gauntlets, Gloves, Fingerless_Gloves, Armband
			Other (Kick): Gun, Wand, Focus
		Burst
			Staff: Staff, Stave, Cane
			Wand: Rod, Wand, Scepter
			Gun: Gun, Energy_Gun
			Focus: Focus, Orb
			Other: Unarmed, Gloves, Fingerless_Gloves
		*/
		this.weapons =
		[
			"Katana", "Longsword", "Shortsword", "Dagger", "Greatsword", "Greataxe", "Battle-axe", "Gauntlets",
			 "Staff", "Stave", "Rod", "Wand", "Focus", "Armband", "Gloves", "Polearm", "Cane", "Scepter",
			  "Orb", "Fingerless_Gloves", "Gun", "Energy_Gun"
		];

		this.armors =
		[
			"Dogi","Dogi","Dogi","Armor","Battle_Armor","Robes","Clothing","Demon_Clothes","Jacket"
		];
	}

	//Weapon
	generateEpicWeapon() {
		this.lengths = this.epicLengths;
		let r = this.generateWeapon();
		this.lengths = this.standardLengths;
		return r;
	}
	generateLegendaryWeapon() {
		this.lengths = this.legendaryLengths;
		let r = this.generateWeapon();
		this.lengths = this.standardLengths;
		return r;
	}
	generateMythicWeapon() {
		this.lengths = this.mythicLengths;
		let r = this.generateWeapon();
		this.lengths = this.standardLengths;
		return r;
	}
	generateDivineWeapon() {
		this.lengths = [5,5,5,5,5,5,5,5,5];
		let r = this.generateWeapon();
		this.lengths = this.standardLengths;
		return r;
	}
	//Armor
	generateEpicDogi() {
		this.lengths = this.epicLengths;
		let r = this.generateArmor();
		this.lengths = this.standardLengths;
		return r;
	}
	generateLegendaryDogi() {
		this.lengths = this.legendaryLengths;
		let r = this.generateArmor();
		this.lengths = this.standardLengths;
		return r;
	}
	generateMythicDogi() {
		this.lengths = this.mythicLengths;
		let r = this.generateArmor();
		this.lengths = this.standardLengths;
		return r;
	}
	generateDivineDogi() {
		this.lengths = [5,5,5,5,5,5,5,5,5];
		let r = this.generateArmor();
		this.lengths = this.standardLengths;
		return r;
	}

	formName() {
		let a = Math.floor(Math.random() * this.adjectives.length);
		let n = Math.floor(Math.random() * this.nouns.length);
		if(a < 0) a = 0;
		else if(a >= this.adjectives.length) a = this.adjectives.length-1;
		if(n < 0) n = 0;
		else if(n >= this.nouns.length) n = this.nouns.length-1;
		return 'The ' + this.adjectives[a] + ' ' + this.nouns[n];
	}

	generateWeapon() {
		let pre = Math.floor(Math.random() * this.professions.length);
		if(pre<0) pre = 0;
		else if(pre>=this.professions.length) pre = this.professions.length-1;
		let type = Math.floor(Math.random() * this.weapons.length);
		if(type<0) type = 0;
		else if(type>=this.weapons.length) type = this.weapons.length-1;

		let name = ('' + this.professions[pre] + this.weapons[type]);
		let attr = new AttributeBonus(name,"Weapon");
		let weapon = this.weaponAffix(type,attr);

		let a = Math.floor(Math.random()*this.lengths.length);
		if(a<0) a = 0;
		else if(a>=this.lengths.length) a = this.lengths.length-1;
		let affixes = this.lengths[a];

		attr = weapon[0];
		let subtype = weapon[1];
		attr = this.specialAffix(pre,attr);

		for(let i = 0; i < affixes; i++) {
			let baseVal = 0.04;
			baseVal += 0.01*Math.floor(affixes/2);
			let pick = Math.floor(Math.random()*5);
			let affix = baseVal + Math.random()*(0.06+0.01*(affixes - Math.floor(affixes/2)));
			if(pick<0) pick = 0;

			if(i === 3) affix = affix*1.3;
			else if(i === 4) affix = affix*1.4;
			else if(i === 5) affix = affix*1.5;

			if(subtype === "STR") {
				if(pick === 0) attr.physicalAttack += affix;
				else if(pick === 1) attr.blockRate += affix*0.75;
				else if(pick === 2) attr.blockPower += affix;
				else if(pick === 3) attr.critDamage += affix*0.9;
			}
			else if(subtype === "DEX") {
				if(pick === 0) attr.speed += affix*0.9;
				else if(pick === 1) attr.critRate += affix*0.75;
				else if(pick === 2) attr.dodge += affix;
				else if(pick === 3) attr.critDamage += affix;
			}
			else if(subtype === "SOL") {
				if(pick === 0) attr.energyAttack += affix;
				else if(pick === 1) attr.hit += affix*0.75;
				else if(pick === 2) attr.chargeBonus += affix*0.3;
				else if(pick === 3) attr.critDamage += affix*0.9;
			}
			else if(subtype === "FOC") {
				if(pick === 0) attr.critRate += affix*0.65;
				else if(pick === 1) attr.hit += affix*0.9;
				else if(pick === 2) attr.critDamage += affix*0.9;
				else if(pick === 3) attr.magicPower += affix;
			}

			if(pick === 4) {
				attr.critRate += affix*0.33;
				affix = baseVal + Math.random()*0.06;
				attr.critDamage += affix*0.45;
			}
		}

		return [attr,affixes];
	}

	generateArmor() {
		let pre = Math.floor(Math.random() * (this.professions.length));
		if(pre<0) pre = 0;
		else if(pre>=this.professions.length) pre = this.professions.length-1;
		let type = Math.floor(Math.random() * (this.armors.length));
		if(type<0) type = 0;
		else if(type>=this.armors.length) type = this.armors.length-1;

		let name = ('' + this.professions[pre] + this.armors[type]);
		let attr = new AttributeBonus(name,"Dogi");
		let armor = this.armorAffix(type,attr);

		let a = Math.floor(Math.random()*(this.lengths.length));
		if(a<0) a = 0;
		else if(a>=this.lengths.length) a = lengths.length-1;
		let affixes = this.lengths[a];

		attr = armor[0];
		let subtype = armor[1];
		attr = this.specialAffix(pre,attr);

		for(let i = 0; i < affixes; i++) {
			let baseVal = 0.04;
			baseVal += 0.01*Math.floor(affixes/2);
			let pick = Math.floor(Math.random()*6);
			let affix = baseVal + Math.random()*(0.06+0.01*(affixes - Math.floor(affixes/2)));
			if(pick<0) pick = 0;

			if(i === 3) affix = affix*1.3;
			else if(i === 4) affix = affix*1.4;
			else if(i === 5) affix = affix*1.5;

			if(subtype === "CON") {
				if(pick === 0) attr.healthRegen += affix;
				else if(pick === 1) attr.pDefense += affix;
				else if(pick === 2) attr.blockRate += affix;
				else if(pick === 3) attr.dodge += affix*0.75;
			}
			else if(subtype === "ENG") {
				if(pick === 0) attr.energyRegen += affix;
				else if(pick === 1) attr.magicDefense += affix;
				else if(pick === 2) attr.eDefense += affix;
				else if(pick === 3) attr.chargeBonus += affix*0.2;
			}

			if(pick === 4) {
				attr.pDefense += affix*0.55;
				affix = baseVal + Math.random()*0.06;
				attr.eDefense += affix*0.45;
			}
			else if(pick === 5) {
				attr.healthRegen += affix*0.45;
				affix = baseVal + Math.random()*0.06;
				attr.energyRegen += affix*0.55;
			}
		}

		return [attr,affixes];
	}

	specialAffix(prefix,attr) {
		let pick = Math.floor(Math.random()*3);
		let affix = 0.06 + Math.random()*0.09;
		if(pick<0) pick = 0;

		if(prefix === 0) { //Spiritualist
			if(pick === 0) attr.energyAttack += affix;
			else if(pick === 1) attr.chargeBonus += affix*0.5;
			else if(pick === 2) attr.critDamage += affix;
		}
		else if(prefix === 1) { //Martial Artist
			if(pick === 0) attr.physicalAttack += affix;
			else if(pick === 1) attr.chargeBonus += affix*0.5;
			else if(pick === 2) attr.dodge += affix;
		}
		else if(prefix === 2) { //Sage
			if(pick === 0) attr.energyAttack += affix;
			else if(pick === 1) attr.dodge += affix;
			else if(pick === 2) attr.hit += affix;
		}
		else if(prefix === 3) {	 //Magician
			if(pick === 0) attr.magicPower += affix;
			else if(pick === 1) attr.magicDefense += affix;
			else if(pick === 2) attr.energyRegen += affix;
		}
		else if(prefix === 4) { //Brawler
			if(pick === 0) attr.physicalAttack += affix;
			else if(pick === 1) attr.dodge += affix;
			else if(pick === 2) attr.critRate += affix*0.8;
		}
		else if(prefix === 5) { //Swordsmen
			if(pick === 0) attr.speed += affix;
			else if(pick === 1) attr.critRate += affix*0.8;
			else if(pick === 2) attr.critDamage += affix;
		}
		else if(prefix === 6) { //Weapon_Master
			if(pick === 0) attr.physicalAttack += affix;
			else if(pick === 1) attr.hit += affix;
			else if(pick === 2) attr.critRate += affix*0.8;
		}
		else if(prefix === 7) { //Healer
			if(pick === 0) {
				attr.magicPower += affix*0.5;
				affix = 0.06 + Math.random()*0.09;
				attr.critRate += affix*0.5;
			}
			else if(pick === 1)  {
				attr.magicPower += affix*0.5;
				affix = 0.06 + Math.random()*0.09;
				attr.healthRegen += affix*0.5;
			}
			else if(pick === 2)  {
				attr.magicPower += affix*0.5;
				affix = 0.06 + Math.random()*0.09;
				attr.energyRegen += affix*0.5;
			}
		}
		else if(prefix === 8) { //Turtle_Hermit
			if(pick === 0) {
				attr.chargeBonus += affix*0.3;
				affix = 0.06 + Math.random()*0.09;
				attr.energyAttack += affix*0.4;
			}
			else if(pick === 1) {
				attr.chargeBonus += affix*0.3;
				affix = 0.06 + Math.random()*0.09;
				attr.critDamage += affix*0.4;
			}
			else if(pick === 2) {
				attr.chargeBonus += affix*0.3;
				affix = 0.06 + Math.random()*0.09;
				attr.energyRegen += affix*0.4;
			}
		}
		else if(prefix === 9) { //Crane_Hermit
			if(pick === 0) attr.magicPower += affix;
			else if(pick === 1) attr.critRate += affix;
			else if(pick === 2) attr.critDamage += affix;
		}
		else if(prefix === 10) { //Dragon
			if(pick === 0) {
				attr.chargeBonus += affix*0.3;
				affix = 0.06 + Math.random()*0.09;
				attr.critDamage += affix*0.4;
			}
			else if(pick === 1) {
				attr.critRate += affix*0.6;
				affix = 0.06 + Math.random()*0.09;
				attr.critDamage += affix*0.4;
			}
			else if(pick === 2) {
				attr.dodge += affix*0.6;
				affix = 0.06 + Math.random()*0.09;
				attr.critDamage += affix*0.4;
			}
		}
		else if(prefix === 11) { //Berserker
			if(pick === 0) {
				attr.physicalAttack += affix*0.5;
				affix = 0.06 + Math.random()*0.09;
				attr.healthRegen += affix*0.5;
			}
			else if(pick === 1) {
				attr.critRate += affix*0.5;
				affix = 0.06 + Math.random()*0.09;
				attr.healthRegen += affix*0.5;
			}
			else if(pick === 2) {
				attr.critDamage += affix*0.5;
				affix = 0.06 + Math.random()*0.09;
				attr.healthRegen += affix*0.5;
			}
		}

		return attr;
	}

	armorAffix(type,attr) {
		let subtype = '';
		if(type === 0 || type === 1 || type === 2) { //Dogi
			let r = Math.random();
			let affix = 0.05 + Math.random()*0.07;
			if(r > 0.5) {
				subtype = 'CON'
				attr.bcon = affix;
			} 
			else {
				subtype = 'ENG'
				attr.beng = affix;
			}
		}
		else if(type === 3) { //Armor
			let r = Math.random();
			let affix = 0.04 + Math.random()*0.08;
			if(r > 0.7) {
				subtype = 'CON'
				attr.bcon = affix;
			} 
			else {
				subtype = 'ENG'
				attr.beng = affix;
			}
		}
		else if(type === 4) { //Battle_Armor
			let r = Math.random();
			let affix = 0.04 + Math.random()*0.08;
			subtype = 'CON'
			attr.bcon = affix;
		}
		else if(type === 5) { //Robes
			let r = Math.random();
			let affix = 0.04 + Math.random()*0.08;
			subtype = 'ENG'
			attr.beng = affix;
		}
		else if(type === 6) { //Clothing
			let r = Math.random();
			let affix = 0.04 + Math.random()*0.08;
			subtype = 'ENG'
			attr.beng = affix*0.7;
			affix = 0.04 + Math.random()*0.08;
			attr.bcon = affix*0.3;
		}
		else if(type === 7) { //Demon_Clothes
			let r = Math.random();
			let affix = 0.04 + Math.random()*0.08;
			subtype = 'CON'
			attr.bcon = affix*0.7;
			affix = 0.04 + Math.random()*0.08;
			attr.beng = affix*0.3;
		}
		else if(type === 8) { //Jacket
			let r = Math.random();
			let affix = 0.04 + Math.random()*0.08;
			subtype = 'CON'
			attr.bcon = affix*0.55;
			affix = 0.04 + Math.random()*0.08;
			attr.beng = affix*0.45;
		}

		return [attr,subtype];
	}

	weaponAffix(type,attr) {
		let subtype = '';
		if(type === 0) { //Katana
			let r = Math.random();
			let affix = 0.03 + Math.random()*0.08;
			if(r > 0.6) {
				subtype = 'DEX'
				attr.bdex = affix;
			} 
			else {
				subtype = 'FOC'
				attr.bfoc = affix;
			}
		}
		else if(type === 1) { //Longsword
			let r = Math.random();
			let affix = 0.03 + Math.random()*0.08;
			if(r < 0.7) {
				subtype = 'STR'
				attr.bstr = affix;
			} 
			else {
				subtype = 'STR'
				attr.bdex = affix;
			}
		}
		else if(type === 2) { //Shortsword
			let r = Math.random();
			let affix = 0.03 + Math.random()*0.08;
			if(r > 0.5) {
				subtype = 'STR'
				attr.bstr = affix;
			} 
			else {
				subtype = 'DEX'
				attr.bdex = affix;
			}
		}
		else if(type === 3) { //Dagger
			let r = Math.random();
			let affix = 0.03 + Math.random()*0.08;
			if(r < 0.2) {
				subtype = 'DEX'
				attr.bfoc = affix;
			} 
			else {
				subtype = 'DEX'
				attr.bdex = affix;
			}
		}
		else if(type === 4) { //Greatsword
			let r = Math.random();
			let affix = 0.03 + Math.random()*0.08;
			if(r > 0.2) {
				subtype = 'STR'
				attr.bstr = affix;
			} 
			else {
				subtype = 'SOL'
				attr.bsol = affix;
			}
		}
		else if(type === 5) { //Greataxe
			let r = Math.random();
			let affix = 0.03 + Math.random()*0.08;
			if(r > 0.2) {
				subtype = 'STR'
				attr.bstr = affix;
			} 
			else {
				subtype = 'STR'
				attr.bfoc = affix;
			}
		}
		else if(type === 6) { //Battle-axe
			let r = Math.random();
			let affix = 0.03 + Math.random()*0.08;
			if(r > 0.4) {
				subtype = 'STR'
				attr.bstr = affix;
			} 
			else {
				subtype = 'STR'
				attr.bfoc = affix;
			}
		}
		else if(type === 7) { //Gauntlets
			let r = Math.random();
			let affix = 0.03 + Math.random()*0.08;
			if(r > 0.3) {
				subtype = 'DEX'
				attr.bdex = affix;
			} 
			else {
				subtype = 'FOC'
				attr.bfoc = affix;
			}
		}
		else if(type === 8) { //Staff
			let r = Math.random();
			let affix = 0.03 + Math.random()*0.08;
			if(r > 0.4) {
				subtype = 'SOL'
				attr.bsol = affix;
			} 
			else {
				subtype = 'DEX'
				attr.bdex = affix;
			}
		}
		else if(type === 9) { //Stave
			let r = Math.random();
			let affix = 0.03 + Math.random()*0.08;
			if(r < 0.3) {
				subtype = 'SOL'
				attr.bsol = affix;
			} 
			else {
				subtype = 'FOC'
				attr.bfoc = affix;
			}
		}
		else if(type === 10) { //Rod
			let r = Math.random();
			let affix = 0.03 + Math.random()*0.08;
			if(r > 0.3) {
				subtype = 'SOL'
				attr.bsol = affix;
			} 
			else {
				subtype = 'FOC'
				attr.bfoc = affix;
			}
		}
		else if(type === 11) { //Wand
			let r = Math.random();
			let affix = 0.03 + Math.random()*0.08;
			if(r < 0.15) {
				subtype = 'FOC'
				attr.bsol = affix;
			} 
			else {
				subtype = 'FOC'
				attr.bfoc = affix;
			}
		}
		else if(type === 12) { //Focus
			let r = Math.random();
			let affix = 0.03 + Math.random()*0.08;
			subtype = 'FOC'
			attr.bfoc = affix;
		}
		else if(type === 13) { //Armband
			let r = Math.random();
			let affix = 0.03 + Math.random()*0.08;
			if(r < 0.5) {
				subtype = 'SOL'
				attr.bsol = affix;
			} 
			else {
				subtype = 'FOC'
				attr.bfoc = affix;
			}
		}
		else if(type === 14) { //Gloves
			let r = Math.random();
			let affix = 0.03 + Math.random()*0.08;
			if(r < 0.3) {
				subtype = 'DEX'
				attr.bdex = affix;
			} 
			else {
				subtype = 'FOC'
				attr.bfoc = affix;
			}
		}
		else if(type === 15) { //Polearm
			let r = Math.random();
			let affix = 0.03 + Math.random()*0.08;
			subtype = 'DEX'
			attr.bdex = affix*0.8;
			affix = 0.03 + Math.random()*0.08;
			if(affix*0.1 >= 0.01) attr.bfoc = affix*0.2;
		}
		else if(type === 16) { //Cane
			let r = Math.random();
			let affix = 0.03 + Math.random()*0.08;
			if(r < 0.5) {
				subtype = 'FOC'
				attr.bdex = affix;
			} 
			else {
				subtype = 'SOL'
				attr.bfoc = affix;
			}
		}
		else if(type === 17) { //Scepter
			let r = Math.random();
			let affix = 0.03 + Math.random()*0.08;
			subtype = 'FOC'
			attr.bfoc = affix*0.8;
			affix = 0.03 + Math.random()*0.08;
			if(affix*0.1 >= 0.01) attr.beng = affix*0.2;
		}
		else if(type === 18) { //Orb
			let r = Math.random();
			let affix = 0.03 + Math.random()*0.08;
			subtype = 'SOL'
			attr.bsol = affix*0.8;
			affix = 0.03 + Math.random()*0.08;
			if(affix*0.1 >= 0.01) attr.beng = affix*0.2;
		}
		else if(type === 19) { //Fingerless_Gloves
			let r = Math.random();
			let affix = 0.03 + Math.random()*0.08;
			subtype = 'DEX'
			attr.bdex = affix*0.7;
			affix = 0.03 + Math.random()*0.08;
			if(affix*0.1 >= 0.01) attr.bstr = affix*0.3;
		}
		else if(type === 20) { //Gun
			let r = Math.random();
			let affix = 0.03 + Math.random()*0.08;
			subtype = 'FOC'
			if(affix*0.1 >= 0.01) attr.beng = affix*0.1;
			affix = 0.03 + Math.random()*0.08;
			attr.bfoc = affix*0.9;
		}
		else if(type === 21) { //Energy_Gun
			let r = Math.random();
			let affix = 0.03 + Math.random()*0.08;
			subtype = 'SOL'
			attr.bsol = affix*0.6;
			affix = 0.03 + Math.random()*0.08;
			if(affix*0.1 >= 0.01) attr.bfoc = affix*0.4;
		}

		return [attr,subtype];
	}
}

module.exports = {
  Naming : Naming
}