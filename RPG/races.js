const attbonus = require("./attributeBonus.js");

const AttributeBonus = attbonus.AttributeBonus;

class Races {
	static max = 200;
	constructor(raceName) {
		if(raceName === 7) raceName = Math.floor(Math.random() * 9)

		if(raceName === 0 && !isNaN(raceName)) raceName = "Human";
		else if(raceName === 1 && !isNaN(raceName)) raceName = "Saiyan";
		else if(raceName === 2 && !isNaN(raceName)) raceName = "Half-Saiyan";
		else if(raceName === 3 && !isNaN(raceName)) raceName = "Android";
		else if(raceName === 7 && !isNaN(raceName)) raceName = "Majin";
		else if(raceName === 5 && !isNaN(raceName)) raceName = "Namekian";
		else if(raceName === 6 && !isNaN(raceName)) raceName = "Dragon_Clan";
		else if(raceName === 4 && !isNaN(raceName)) raceName = "Arcosian";
		else if(!isNaN(raceName)) raceName = "Alien";

		if(raceName === "Half-saiyan") raceName = "Half-Saiyan";
		else if (raceName === "Dragon_clan") raceName = "Dragon_Clan";
		else if (raceName === "Core_person") raceName = "Core_Person";

		this.raceName = raceName;
		this.bstr = 0;
		this.bdex = 0;
		this.bcon = 0;
		this.beng = 0;
		this.bsol = 0;
		this.bfoc = 0;

		//Primal Majin, Core People (kaioshin), Bio Android, Fused (Racename)
		if(this.raceName === "Human") { this.raceListBonuses = (this.setUpRace(2,2,2,2,2,2,"Human")); } //6
		else if(this.raceName === "Saiyan") { this.raceListBonuses = (this.setUpRace(1,3,1,2,1,3,"Saiyan")); } //5
		else if(this.raceName === "Half-Saiyan") { this.raceListBonuses = (this.setUpRace(2,3,1,2,1,2,"Half-Saiyan")); } //5
		else if(this.raceName === "Android") { this.raceListBonuses = (this.setUpRace(3,2,2,1,2,2,"Android")); } //6
		else if(this.raceName === "Majin") { this.raceListBonuses = (this.setUpRace(1,1,4,2,2,1,"Majin")); } //5
		else if(this.raceName === "Namekian") { this.raceListBonuses = (this.setUpRace(2,1,3,2,1,2,"Namekian")); } //5
		else if(this.raceName === "Dragon_Clan") { this.raceListBonuses = (this.setUpRace(1,1,1,4,2,2,"Dragon_Clan")); } //5
		else if(this.raceName === "Arcosian") { this.raceListBonuses = (this.setUpRace(1,3,1,3,1,2,"Arcosian")); } //5
		else if(this.raceName === "Legendary_Super_Saiyan") { this.raceListBonuses = (this.setUpRace(3,3,1,1,3,3,"Legendary_Super_Saiyan")); } //8
		else if(this.raceName === "Core_Person") { this.raceListBonuses = (this.setUpRace(1,3,2,2,2,4,"Core_Person")); }
		else {
			this.raceName = "Alien";
			this.raceListBonuses = (this.setUpRace(2,1,3,3,1,2,"Alien")); //6
		}


		this.isUnlocked = 0;
		this.isUnleashed = 0;
		this.maxStr = Races.max+Races.max*(this.bstr+this.bdex)*3;
		this.maxDex = Races.max+Races.max*(this.bstr+this.bdex)*3;
		this.maxCon = Races.max+Races.max*(this.bcon+this.beng)*3;
		this.maxEng = Races.max+Races.max*(this.bcon+this.beng)*3;
		this.maxSol = Races.max+Races.max*(this.bfoc+this.bsol)*3;
		this.maxFoc = Races.max+Races.max*(this.bfoc+this.bsol)*3;
	}

	outputRacialBonus() {
		let str = '';
        if(this.bstr != 0) str = str + '\n' + (this.bstr*100).toFixed(2).toLocaleString(undefined) + '% STR';
        if(this.bdex != 0) str = str + '\n' + (this.bdex*100).toFixed(2) + '% DEX';
        if(this.bcon != 0) str = str + '\n' + (this.bcon*100).toFixed(2) + '% CON';
        if(this.beng != 0) str = str + '\n' + (this.beng*100).toFixed(2) + '% ENG';
        if(this.bsol != 0) str = str + '\n' + (this.bsol*100).toFixed(2) + '% SOL';
        if(this.bfoc != 0) str = str + '\n' + (this.bfoc*100).toFixed(2) + '% FOC';
        return str;
	}

	unlockPotential(unlocked) {
		if(this.isUnlocked === 1 || unlocked === 0) return;
		this.maxStr *= 1+2*unlocked;
		this.maxDex *= 1+2*unlocked;
		this.maxCon *= 1+2*unlocked;
		this.maxEng *= 1+2*unlocked;
		this.maxSol *= 1+2*unlocked;
		this.maxFoc *= 1+2*unlocked;
		this.isUnlocked = 1;
	}

	unleashPotential(unleashed) {
		if(this.isUnleashed === 1 || unleashed === 0) return;
		this.maxStr *= 1+(1+Math.ceil(this.bstr+this.bdex))*unleashed;
		this.maxDex *= 1+(1+Math.ceil(this.bstr+this.bdex))*unleashed;
		this.maxCon *= 1+(1+Math.ceil(this.bcon+this.beng))*unleashed;
		this.maxEng *= 1+(1+Math.ceil(this.bcon+this.beng))*unleashed;
		this.maxSol *= 1+(1+Math.ceil(this.bfoc+this.bsol))*unleashed;
		this.maxFoc *= 1+(1+Math.ceil(this.bfoc+this.bsol))*unleashed;
		this.isUnleashed = 1;
	}

	setUpRace(s, d, c, e, so, f, name) {
		this.str = s;
		this.dex = d;
		this.con = c;
		this.eng = e;
		this.sol = so;
		this.foc = f;
		if(name == "Arcosian") {
			this.bstr = 0;
			this.bdex = 0.2;
			this.bcon = 0;
			this.beng = 0.2;
			this.bsol = 0;
			this.bfoc = 0.1;
		}
		else if(name == "Human") {
			this.bstr = 0.1;
			this.bdex = 0.1;
			this.bcon = 0.15;
			this.beng = 0.15;
			this.bsol = 0.1;
			this.bfoc = 0.1;
		}
		else if(name == "Saiyan") {
			this.bstr = 0;
			this.bdex = 0.2;
			this.bcon = 0;
			this.beng = 0.1;
			this.bsol = 0.2;
			this.bfoc = 0;
		}
		else if(name == "Half-Saiyan") {
			this.bstr = 0.1;
			this.bdex = 0.2;
			this.bcon = 0;
			this.beng = 0.1;
			this.bsol = 0;
			this.bfoc = 0.1;
		}
		else if(name == "Android") {
			this.bstr = 0.2;
			this.bdex = 0.05;
			this.bcon = 0.2;
			this.beng = -0.2;
			this.bsol = 0.1;
			this.bfoc = 0.05;
		}
		else if(name == "Majin") {
			this.bstr = 0;
			this.bdex = 0;
			this.bcon = 0.3;
			this.beng = 0.1;
			this.bsol = 0.1;
			this.bfoc = 0;
		}
		else if(name == "Namekian") {
			this.bstr = 0.2;
			this.bdex = 0;
			this.bcon = 0.1;
			this.beng = 0.1;
			this.bsol = 0;
			this.bfoc = 0.1;
		}
		else if(name == "Dragon_Clan") {
			this.bstr = 0;
			this.bdex = 0;
			this.bcon = 0;
			this.beng = 0.3;
			this.bsol = 0.1;
			this.bfoc = 0.1;
		}
		else if(name == "Legendary_Super_Saiyan") {
			this.bstr = 0.15;
			this.bdex = 0.15;
			this.bcon = 0.1;
			this.beng = 0.1;
			this.bsol = 0.15;
			this.bfoc = 0.15;
		}
		else if(name == "Core_Person") {
			this.bstr = 0.1;
			this.bdex = 0.15;
			this.bcon = 0;
			this.beng = 0.1;
			this.bsol = 0.15;
			this.bfoc = 0.3;
		}
		else {
			this.bstr = 0.1;
			this.bdex = 0.1;
			this.bcon = 0.2;
			this.beng = 0.2;
			this.bsol = 0;
			this.bfoc = 0.1;
		}
		return new AttributeBonus(name,"Race");
	}
}

module.exports = {
	Races : Races
}