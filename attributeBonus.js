class AttributeBonus {
	constructor(name,type) {
		this.name = name;
		this.type = type;
        this.listID = -1;
        this.duration = -1;

		if(this.type === "Race"){
			this.raceBonus(name);
		}
		else if(this.type === "Total") {
			this.bstr = 1;
			this.bdex = 1;
			this.bcon = 1;
			this.beng = 1;
			this.bsol = 1;
			this.bfoc = 1;

	        this.chargeBonus = 1;

			this.health = 1;
			this.energy = 1;
			this.healthRegen = 1;
			this.energyRegen = 1;
			this.charge = 1;

			this.hit = 1;
			this.dodge = 1;
			this.speed = 1;
	        this.critRate = 1;
	        this.critDamage = 1;
			this.blockRate = 1;
			this.blockPower = 1;

			this.pDefense = 1;
			this.eDefense = 1;

			this.magicPower = 1;
			this.magicDefense = 1;
	      
	        this.physicalAttack = 1;
	        this.energyAttack = 1;
		}
		else if(this.type === "Dogi") {
			this.bstr = 0;
			this.bdex = 0;
			this.bcon = 0;
			this.beng = 0;
			this.bsol = 0;
			this.bfoc = 0;

	        this.chargeBonus = 0;

			this.health = 0;
			this.energy = 0;
			this.healthRegen = 0;
			this.energyRegen = 0;
			this.charge = 0;

			this.hit = 0;
			this.dodge = 0;
			this.speed = 0;
	        this.critRate = 0;
	        this.critDamage = 0;
			this.blockRate = 0;
			this.blockPower = 0;

			this.pDefense = 0;
			this.eDefense = 0;

			this.magicPower = 0;
			this.magicDefense = 0;
	      
	        this.physicalAttack = 0;
	        this.energyAttack = 0;
		}
		else if(this.type === "Weapon") {
			this.bstr = 0;
			this.bdex = 0;
			this.bcon = 0;
			this.beng = 0;
			this.bsol = 0;
			this.bfoc = 0;

	        this.chargeBonus = 0;

			this.health = 0;
			this.energy = 0;
			this.healthRegen = 0;
			this.energyRegen = 0;
			this.charge = 0;

			this.hit = 0;
			this.dodge = 0;
			this.speed = 0;
	        this.critRate = 0;
	        this.critDamage = 0;
			this.blockRate = 0;
			this.blockPower = 0;

			this.pDefense = 0;
			this.eDefense = 0;

			this.magicPower = 0;
			this.magicDefense = 0;
	      
	        this.physicalAttack = 0;
	        this.energyAttack = 0;
		}
		else {
			this.bstr = 0;
			this.bdex = 0;
			this.bcon = 0;
			this.beng = 0;
			this.bsol = 0;
			this.bfoc = 0;

	        this.chargeBonus = 0;

			this.health = 0;
			this.energy = 0;
			this.healthRegen = 0;
			this.energyRegen = 0;
			this.charge = 0;

			this.hit = 0;
			this.dodge = 0;
			this.speed = 0;
	        this.critRate = 0;
	        this.critDamage = 0;
			this.blockRate = 0;
			this.blockPower = 0;

			this.pDefense = 0;
			this.eDefense = 0;

			this.magicPower = 0;
			this.magicDefense = 0;
	      
	        this.physicalAttack = 0;
	        this.energyAttack = 0;
		}
	}

	loadBonuses(bstr,bdex,bcon,beng,bsol,bfoc,chargeBonus,health,energy,healthRegen,energyRegen,
		charge,hit,dodge,speed,critRate,critDamage,blockRate,blockPower,pDefense,eDefense,magicPower,
		magicDefense,physicalAttack,energyAttack) {
			this.bstr = Number(bstr);
			this.bdex = Number(bdex);
			this.bcon = Number(bcon);
			this.beng = Number(beng);
			this.bsol = Number(bsol);
			this.bfoc = Number(bfoc);

	        this.chargeBonus = Number(chargeBonus);

			this.health = Number(health);
			this.energy = Number(energy);
			this.healthRegen = Number(healthRegen);
			this.energyRegen = Number(energyRegen);
			this.charge = Number(charge);

			this.hit = Number(hit);
			this.dodge = Number(dodge);
			this.speed = Number(speed);
	        this.critRate = Number(critRate);
	        this.critDamage = Number(critDamage);
			this.blockRate = Number(blockRate);
			this.blockPower = Number(blockPower);

			this.pDefense = Number(pDefense);
			this.eDefense = Number(eDefense);

			this.magicPower = Number(magicPower);
			this.magicDefense = Number(magicDefense);
	      
	        this.physicalAttack = Number(physicalAttack);
	        this.energyAttack = Number(energyAttack);
	}

	outputBonusStr() {
		let str = '';
        if(this.bstr != 0) str = str + '\n' + (this.bstr*100).toFixed(2).toLocaleString(undefined) + '% STR';
        if(this.bdex != 0) str = str + '\n' + (this.bdex*100).toFixed(2) + '% DEX';
        if(this.bcon != 0) str = str + '\n' + (this.bcon*100).toFixed(2) + '% CON';
        if(this.beng != 0) str = str + '\n' + (this.beng*100).toFixed(2) + '% ENG';
        if(this.bsol != 0) str = str + '\n' + (this.bsol*100).toFixed(2) + '% SOL';
        if(this.bfoc != 0) str = str + '\n' + (this.bfoc*100).toFixed(2) + '% FOC';

	    if(this.chargeBonus != 0) str = str + '\n' + (this.chargeBonus*100).toFixed(2).toLocaleString(undefined) + '% Charge Bonus';
	    if(this.charge != 0) str = str + '\n' + (this.charge*100).toFixed(2).toLocaleString(undefined) + '% Charge';
	    if(this.health != 0) str = str + '\n' + (this.health*100).toFixed(2).toLocaleString(undefined) + '% Health';
	    if(this.energy != 0) str = str + '\n' + (this.energy*100).toFixed(2).toLocaleString(undefined) + '% Energy';
	    if(this.healthRegen != 0) str = str + '\n' + (this.healthRegen*100).toFixed(2).toLocaleString(undefined) + '% Health Regen';
	    if(this.energyRegen != 0) str = str + '\n' + (this.energyRegen*100).toFixed(2).toLocaleString(undefined) + '% Energy Regen';

	    if(this.hit != 0) str = str + '\n' + (this.hit*100).toFixed(2).toLocaleString(undefined) + '% Hit Rate';
	    if(this.dodge != 0) str = str + '\n' + (this.dodge*100).toFixed(2).toLocaleString(undefined) + '% Dodge Rate';
	    if(this.speed != 0) str = str + '\n' + (this.speed*100).toFixed(2).toLocaleString(undefined) + '% Speed';
	    if(this.critRate != 0) str = str + '\n' + (this.critRate*100).toFixed(2).toLocaleString(undefined) + '% Crit Rate';
	    if(this.critDamage != 0) str = str + '\n' + (this.critDamage*100).toFixed(2).toLocaleString(undefined) + '% Crit Damage';
	    if(this.blockRate != 0) str = str + '\n' + (this.blockRate*100).toFixed(2).toLocaleString(undefined) + '% Block Rate';
	    if(this.blockPower != 0) str = str + '\n' + (this.blockPower*100).toFixed(2).toLocaleString(undefined) + '% Block Power';

	    if(this.pDefense != 0) str = str + '\n' + (this.pDefense*100).toFixed(2).toLocaleString(undefined) + '% Physical Defense';
	    if(this.eDefense != 0) str = str + '\n' + (this.eDefense*100).toFixed(2).toLocaleString(undefined) + '% Energy Defense';

	    if(this.magicPower != 0) str = str + '\n' + (this.magicPower*100).toFixed(2).toLocaleString(undefined) + '% Magic Power';
	    if(this.magicDefense != 0) str = str + '\n' + (this.magicDefense*100).toFixed(2).toLocaleString(undefined) + '% Magic Defense';

	    if(this.physicalAttack != 0) str = str + '\n' + (this.physicalAttack*100).toFixed(2).toLocaleString(undefined) + '% Physical Attack';
	    if(this.energyAttack != 0) str = str + '\n' + (this.energyAttack*100).toFixed(2).toLocaleString(undefined) + '% Energy Attack';

        return str;
	}

	outputBonusArray() {
		let n = new Array();
        if(this.bstr != 0) n.push(["Str",(this.bstr*100).toFixed(2).toLocaleString(undefined)]);
        if(this.bdex != 0) n.push(["Dex",(this.bdex*100).toFixed(2).toLocaleString(undefined)]);
        if(this.bcon != 0) n.push(["Con",(this.bcon*100).toFixed(2).toLocaleString(undefined)]);
        if(this.beng != 0) n.push(["Eng",(this.beng*100).toFixed(2).toLocaleString(undefined)]);
        if(this.bsol != 0) n.push(["Sol",(this.bsol*100).toFixed(2).toLocaleString(undefined)]);
        if(this.bfoc != 0) n.push(["Foc",(this.bfoc*100).toFixed(2).toLocaleString(undefined)]);

	    if(this.chargeBonus != 0) n.push(["Charge Bonus",(this.chargeBonus*100).toFixed(2).toLocaleString(undefined)]);
	    if(this.charge != 0) n.push(["Charge",(this.charge*100).toFixed(2).toLocaleString(undefined)]);
	    if(this.health != 0) n.push(["Health",(this.health*100).toFixed(2).toLocaleString(undefined)]);
	    if(this.energy != 0) n.push(["Energy",(this.energy*100).toFixed(2).toLocaleString(undefined)]);
	    if(this.healthRegen != 0) n.push(["Health Regen",(this.healthRegen*100).toFixed(2).toLocaleString(undefined)]);
	    if(this.energyRegen != 0) n.push(["Energy Regen",(this.energyRegen*100).toFixed(2).toLocaleString(undefined)]);

	    if(this.hit != 0) n.push(["Hit Rate",(this.hit*100).toFixed(2).toLocaleString(undefined)]);
	    if(this.dodge != 0) n.push(["Dodge",(this.dodge*100).toFixed(2).toLocaleString(undefined)]);
	    if(this.speed != 0) n.push(["Speed",(this.speed*100).toFixed(2).toLocaleString(undefined)]);
	    if(this.critRate != 0) n.push(["Crit Rate",(this.critRate*100).toFixed(2).toLocaleString(undefined)]);
	    if(this.critDamage != 0) n.push(["Crit Damage",(this.critDamage*100).toFixed(2).toLocaleString(undefined)]);
	    if(this.blockRate != 0) n.push(["Block Rate",(this.blockRate*100).toFixed(2).toLocaleString(undefined)]);
	    if(this.blockPower != 0) n.push(["Block Power",(this.blockPower*100).toFixed(2).toLocaleString(undefined)]);

	    if(this.pDefense != 0) n.push(["Physical Defense",(this.pDefense*100).toFixed(2).toLocaleString(undefined)]);
	    if(this.eDefense != 0) n.push(["Energy Defense",(this.eDefense*100).toFixed(2).toLocaleString(undefined)]);

	    if(this.magicPower != 0) n.push(["Magic Power",(this.magicPower*100).toFixed(2).toLocaleString(undefined)]);
	    if(this.magicDefense != 0) n.push(["Magic Defense",(this.magicDefense*100).toFixed(2).toLocaleString(undefined)]);

	    if(this.physicalAttack != 0) n.push(["Physical Attack",(this.physicalAttack*100).toFixed(2).toLocaleString(undefined)]);
	    if(this.energyAttack != 0) n.push(["Energy Attack",(this.energyAttack*100).toFixed(2).toLocaleString(undefined)]);

        return n;
	}

	getTotalChange() {
		let total = this.bstr + this.bdex + this.bcon + this.beng + this.bsol + this.bfoc + this.chargeBonus + this.health;
		total += this.energy + this.healthRegen + this.energyRegen + this.charge + this.hit + this.dodge;
		total += this.speed + this.critRate + this.critDamage + this.blockRate + this.blockPower + this.pDefense;
		total += this.eDefense + this.magicPower + this.magicDefense + this.physicalAttack + this.energyAttack;
		return Math.round(100*total);
	}

	calcAffixCost(str,typeNum) {
		let affix = 25000;
		affix += 25000*typeNum;

		if(typeNum === 3) affix = affix*5;
		else if(typeNum === 4) affix = affix*8;
		else if(typeNum === 5) affix = affix*10;

        if(str === "str" && this.bstr == 0) {
        	affix = affix*1.75;
        	return affix;
        }
        if(str === "dex" && this.bdex == 0) {
        	affix = affix*1.75;
        	return affix;
        }
        if(str === "con" && this.bcon == 0) {
        	affix = affix*1.15;
        	return affix;
        }
        if(str === "eng" && this.beng == 0) {
        	affix = affix*1.15;
        	return affix;
        }
        if(str === "sol" && this.bsol == 0) {
        	affix = affix*1.75;
        	return affix;
        }
        if(str === "foc" && this.bfoc == 0) {
        	affix = affix*1.75;
        	return affix;
        }

	    if(str === "chargebonus" && this.chargeBonus == 0) {
        	affix = affix*1.5;
        	return affix;
        }
	    if(str === "healthregen" && this.healthRegen == 0) {
        	return affix;
        }
	    if(str === "energyregen" && this.energyRegen == 0) {
        	return affix;
        }

	    if(str === "hit" && this.hit == 0) {
        	affix = affix*1.25;
        	return affix;
        }
	    if(str === "dodge" && this.dodge == 0) {
        	affix = affix*1.25;
        	return affix;
        }
	    if(str === "speed" && this.speed == 0) {
        	return affix;
        }
	    if(str === "critrate" && this.critRate == 0) {
        	affix = affix*1.25;
        	return affix;
        }
	    if(str === "critdamage" && this.critDamage == 0) {
        	affix = affix*1.25;
        	return affix;
        }
	    if(str === "blockrate" && this.blockRate == 0) {
        	return affix;
        }
	    if(str === "blockpower" && this.blockPower == 0) {
        	return affix;
        }

	    if(str === "pdefense" && this.pDefense == 0) {
        	return affix;
        }
	    if(str === "edefense" && this.eDefense == 0) {
        	return affix;
        }

	    if(str === "magicpower" && this.magicPower == 0) {
        	return affix;
        }
	    if(str === "magicdefense" && this.magicDefense == 0) {
        	return affix;
        }

	    if(str === "physicalattack" && this.physicalAttack == 0) {
        	return affix*1.4;
        }
	    if(str === "energyattack" && this.energyAttack == 0) {
        	return affix*1.4;
        }
	    return -1;
	}

	ifZero(str,typeNum) {
		let baseVal = 0.04;
		baseVal += 0.01*Math.floor(typeNum/2);
		let affix = baseVal + Math.random()*(0.06+0.01*(typeNum - Math.floor(typeNum/2)));

		if(typeNum === 3) affix = affix*1.3;
		else if(typeNum === 4) affix = affix*1.4;
		else if(typeNum === 5) affix = affix*1.5;

        if(str === "str" && this.bstr == 0) {
        	this.bstr += affix*0.75;
        	return 1;
        }
        if(str === "dex" && this.bdex == 0) {
        	this.bdex += affix*0.75;
        	return 1;
        }
        if(str === "con" && this.bcon == 0) {
        	this.bcon += affix*0.75;
        	return 1;
        }
        if(str === "eng" && this.beng == 0) {
        	this.beng += affix*0.75;
        	return 1;
        }
        if(str === "sol" && this.bsol == 0) {
        	this.bsol += affix*0.75;
        	return 1;
        }
        if(str === "foc" && this.bfoc == 0) {
        	this.bfoc += affix*0.75;
        	return 1;
        }

	    if(str === "chargebonus" && this.chargeBonus == 0) {
        	this.chargeBonus += affix*0.4;
        	return 1;
        }
	    if(str === "healthregen" && this.healthRegen == 0) {
        	this.healthRegen += affix;
        	return 1;
        }
	    if(str === "energyregen" && this.energyRegen == 0) {
        	this.energyRegen += affix;
        	return 1;
        }

	    if(str === "hit" && this.hit == 0) {
        	this.hit += affix;
        	return 1;
        }
	    if(str === "dodge" && this.dodge == 0) {
        	this.dodge += affix;
        	return 1;
        }
	    if(str === "speed" && this.speed == 0) {
        	this.speed += affix;
        	return 1;
        }
	    if(str === "critrate" && this.critRate == 0) {
        	this.critRate += affix*0.8;
        	return 1;
        }
	    if(str === "critdamage" && this.critDamage == 0) {
        	this.critDamage += affix;
        	return 1;
        }
	    if(str === "blockrate" && this.blockRate == 0) {
        	this.blockRate += affix;
        	return 1;
        }
	    if(str === "blockpower" && this.blockPower == 0) {
        	this.blockPower += affix;
        	return 1;
        }

	    if(str === "pdefense" && this.pDefense == 0) {
        	this.pDefense += affix;
        	return 1;
        }
	    if(str === "edefense" && this.eDefense == 0) {
        	this.eDefense += affix;
        	return 1;
        }

	    if(str === "magicpower" && this.magicPower == 0) {
        	this.magicPower += affix;
        	return 1;
        }
	    if(str === "magicdefense" && this.magicDefense == 0) {
        	this.magicDefense += affix;
        	return 1;
        }

	    if(str === "physicalattack" && this.physicalAttack == 0) {
        	this.physicalAttack += affix;
        	return 1;
        }
	    if(str === "energyattack" && this.energyAttack == 0) {
        	this.energyAttack += affix;
        	return 1;
        }
	    return 0;
	}

	itemSocketed(quality) {
		let mod = 0;
		if(quality < 3) {
			mod = 0.01;
		}
		else if(quality === 3) {
			mod = 0.02;
		}
		else if(quality === 4) {
			mod = 0.04;
		}
		else if(quality === 5) {
			mod = 0.06;
		}

        if(this.bstr != 0) this.bstr += mod;
        if(this.bdex != 0) this.bdex += mod;
        if(this.bcon != 0) this.bcon += mod;
        if(this.beng != 0) this.beng += mod;
        if(this.bsol != 0) this.bsol += mod;
        if(this.bfoc != 0) this.bfoc += mod;

	    if(this.chargeBonus != 0) this.chargeBonus += mod*0.4;
	    if(this.charge != 0) this.charge += mod;
	    if(this.health != 0) this.health += mod;
	    if(this.energy != 0) this.energy += mod;
	    if(this.healthRegen != 0) this.healthRegen += mod;
	    if(this.energyRegen != 0) this.energyRegen += mod;

	    if(this.hit != 0) this.hit += mod;
	    if(this.dodge != 0) this.dodge += mod;
	    if(this.speed != 0) this.speed += mod;
	    if(this.critRate != 0) this.critRate += mod*0.8;
	    if(this.critDamage != 0) this.critDamage += mod;
	    if(this.blockRate != 0) this.blockRate += mod;
	    if(this.blockPower != 0) this.blockPower += mod;

	    if(this.pDefense != 0) this.pDefense += mod;
	    if(this.eDefense != 0) this.eDefense += mod;

	    if(this.magicPower != 0) this.magicPower += mod;
	    if(this.magicDefense != 0) this.magicDefense += mod;

	    if(this.physicalAttack != 0) this.physicalAttack += mod;
	    if(this.energyAttack != 0) this.energyAttack += mod;
	}

	raceBonus(name) {
		//This will all be % multipliers (1 = 100%)
		if(name === "Arcosian") {
			this.bstr = 0;
			this.bdex = 0;
			this.bcon = 0;
			this.beng = 0;
			this.bsol = 0;
			this.bfoc = 0;

	        this.chargeBonus = 0;

			this.health = 0;
			this.energy = 0;
			this.healthRegen = 0;
			this.energyRegen = 0;
			this.charge = 0;

			this.hit = 0;
			this.dodge = 0;
			this.speed = 0.2;
	        this.critRate = 0;
	        this.critDamage = 0;
			this.blockRate = 0;
			this.blockPower = 0;

			this.pDefense = 0;
			this.eDefense = 0.25;

			this.magicPower = 0;
			this.magicDefense = 0.15;
	      
	        this.physicalAttack = 0;
	        this.energyAttack = 0.1;
		}
		else if(name === "Human") {
			this.bstr = 0;
			this.bdex = 0;
			this.bcon = 0;
			this.beng = 0;
			this.bsol = 0;
			this.bfoc = 0;

	        this.chargeBonus = 0.1;

			this.health = 0;
			this.energy = 0.15;
			this.healthRegen = 0;
			this.energyRegen = 0;
			this.charge = 0;

			this.hit = 0.3;
			this.dodge = 0;
			this.speed = 0;
	        this.critRate = 0;
	        this.critDamage = 0;
			this.blockRate = 0;
			this.blockPower = 0;

			this.pDefense = 0;
			this.eDefense = 0;

			this.magicPower = 0.25;
			this.magicDefense = 0.25;
	      
	        this.physicalAttack = 0;
	        this.energyAttack = 0;
		}
		else if(name === "Saiyan") {
			this.bstr = 0;
			this.bdex = 0;
			this.bcon = 0;
			this.beng = 0;
			this.bsol = 0;
			this.bfoc = 0;

	        this.chargeBonus = 0;

			this.health = -0.1;
			this.energy = 0;
			this.healthRegen = 0;
			this.energyRegen = 0;
			this.charge = 0.1;

			this.hit = 0;
			this.dodge = 0;
			this.speed = 0;
	        this.critRate = 0;
	        this.critDamage = 0.15;
			this.blockRate = 0.1;
			this.blockPower = 0;

			this.pDefense = 0;
			this.eDefense = 0;

			this.magicPower = -1;
			this.magicDefense = -0.25;
	      
	        this.physicalAttack = 0;
	        this.energyAttack = 0;
		}
		else if(name === "Half-Saiyan") {
			this.bstr = 0;
			this.bdex = 0;
			this.bcon = 0;
			this.beng = 0;
			this.bsol = 0;
			this.bfoc = 0;

	        this.chargeBonus = 0.1;

			this.health = -0.05;
			this.energy = 0;
			this.healthRegen = 0;
			this.energyRegen = 0.1;
			this.charge = 0;

			this.hit = 0.15;
			this.dodge = 0;
			this.speed = 0;
	        this.critRate = 0;
	        this.critDamage = 0;
			this.blockRate = 0.1;
			this.blockPower = 0;

			this.pDefense = 0;
			this.eDefense = 0;

			this.magicPower = 0;
			this.magicDefense = 0;
	      
	        this.physicalAttack = 0;
	        this.energyAttack = 0;
		}
		else if(name === "Android") {
			this.bstr = 0;
			this.bdex = 0;
			this.bcon = 0;
			this.beng = 0;
			this.bsol = 0;
			this.bfoc = 0;

	        this.chargeBonus = 0;

			this.health = 0;
			this.energy = -0.6;
			this.healthRegen = 0;
			this.energyRegen = 0;
			this.charge = 0;

			this.hit = 0;
			this.dodge = 0;
			this.speed = 0;
	        this.critRate = 0;
	        this.critDamage = 0;
			this.blockRate = 0;
			this.blockPower = 0;

			this.pDefense = 0;
			this.eDefense = 0.25;

			this.magicPower = -1;
			this.magicDefense = 0.5;
	      
	        this.physicalAttack = 0;
	        this.energyAttack = 0;
		}
		else if(name === "Majin") {
			this.bstr = 0;
			this.bdex = 0;
			this.bcon = 0;
			this.beng = 0;
			this.bsol = 0;
			this.bfoc = 0;

	        this.chargeBonus = 0;

			this.health = 0;
			this.energy = 0;
			this.healthRegen = 2;
			this.energyRegen = -0.25;
			this.charge = 0;

			this.hit = 0;
			this.dodge = 0;
			this.speed = 0;
	        this.critRate = 0;
	        this.critDamage = 0;
			this.blockRate = 0;
			this.blockPower = 0;

			this.pDefense = 0.2;
			this.eDefense = 0;

			this.magicPower = 2;
			this.magicDefense = 1;
	      
	        this.physicalAttack = 0;
	        this.energyAttack = 0;
		}
		else if(name === "Namekian") {
			this.bstr = 0;
			this.bdex = 0;
			this.bcon = 0;
			this.beng = 0;
			this.bsol = 0;
			this.bfoc = 0;

	        this.chargeBonus = 0;

			this.health = 0;
			this.energy = 0;
			this.healthRegen = 1;
			this.energyRegen = 0;
			this.charge = 0;

			this.hit = 0;
			this.dodge = 0;
			this.speed = 0;
	        this.critRate = 0;
	        this.critDamage = 0;
			this.blockRate = 0.1;
			this.blockPower = 0.1;

			this.pDefense = 0.2;
			this.eDefense = 0.2;

			this.magicPower = 0;
			this.magicDefense = 0.25;
	      
	        this.physicalAttack = 0;
	        this.energyAttack = 0;
		}
		else if(name === "Dragon_Clan") {
			this.bstr = 0;
			this.bdex = 0;
			this.bcon = 0;
			this.beng = 0;
			this.bsol = 0;
			this.bfoc = 0;

	        this.chargeBonus = 0;

			this.health = 0;
			this.energy = 0;
			this.healthRegen = 0.5;
			this.energyRegen = 0.15;
			this.charge = 0;

			this.hit = 0;
			this.dodge = 0;
			this.speed = 0;
	        this.critRate = 0;
	        this.critDamage = 0;
			this.blockRate = 0;
			this.blockPower = 0;

			this.pDefense = 0;
			this.eDefense = 0;

			this.magicPower = 1.5;
			this.magicDefense = 0.5;
	      
	        this.physicalAttack = -0.25;
	        this.energyAttack = -0.2;
		}
		else if(name === "Legendary_Super_Saiyan") {
			this.bstr = 0;
			this.bdex = 0;
			this.bcon = 0;
			this.beng = 0;
			this.bsol = 0;
			this.bfoc = 0;

	        this.chargeBonus = 0.15;

			this.health = 0;
			this.energy = 0;
			this.healthRegen = -3;
			this.energyRegen = -1.1;
			this.charge = 0.15;

			this.hit = 0;
			this.dodge = 0;
			this.speed = 0.1;
	        this.critRate = 0.15;
	        this.critDamage = 0.25;
			this.blockRate = 0;
			this.blockPower = 0;

			this.pDefense = 0.1;
			this.eDefense = 0.1;

			this.magicPower = -1;
			this.magicDefense = -0.25;
	      
	        this.physicalAttack = 0;
	        this.energyAttack = 0;
		}
		else {
			this.bstr = 0;
			this.bdex = 0;
			this.bcon = 0;
			this.beng = 0;
			this.bsol = 0;
			this.bfoc = 0;

	        this.chargeBonus = 0.1;

			this.health = 0.1;
			this.energy = 0.1;
			this.healthRegen = 0.2;
			this.energyRegen = 0.2;
			this.charge = 0.1;

			this.hit = 0;
			this.dodge = 0;
			this.speed = 0;
	        this.critRate = 0.1;
	        this.critDamage = 0;
			this.blockRate = 0;
			this.blockPower = 0;

			this.pDefense = 0;
			this.eDefense = 0;

			this.magicPower = 0;
			this.magicDefense = 0;
	      
	        this.physicalAttack = 0;
	        this.energyAttack = 0;
		}
	}

	addBuff(addedBuff) {
		this.bstr += addedBuff.bstr;
		this.bdex += addedBuff.bdex;
		this.bcon += addedBuff.bcon;
		this.beng += addedBuff.beng;
		this.bsol += addedBuff.bsol;
		this.bfoc += addedBuff.bfoc;

	    this.chargeBonus += addedBuff.chargeBonus;

		this.health += addedBuff.health;
		this.energy += addedBuff.energy;
		this.healthRegen += addedBuff.healthRegen;
		this.energyRegen += addedBuff.energyRegen;
		this.charge += addedBuff.charge;

		this.hit += addedBuff.hit;
		this.dodge += addedBuff.dodge;
		this.speed += addedBuff.speed;
	    this.critRate += addedBuff.critRate;
	    this.critDamage += addedBuff.critDamage;
		this.blockRate += addedBuff.blockRate;
		this.blockPower += addedBuff.blockPower;

		this.pDefense += addedBuff.pDefense;
		this.eDefense += addedBuff.eDefense;

		this.magicPower += addedBuff.magicPower;
		this.magicDefense += addedBuff.magicDefense;
	      
	    this.physicalAttack += addedBuff.physicalAttack;
	    this.energyAttack += addedBuff.energyAttack;
	}
}

module.exports = {
	AttributeBonus : AttributeBonus
}