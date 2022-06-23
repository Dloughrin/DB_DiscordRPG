const att = require("./attributes.js");
const tech = require("./technique.js");
const attbonus = require("./attributeBonus.js");
const races = require("./races.js");

const AttributeBonus = attbonus.AttributeBonus;
const Races = races.Races;
const Attributes = att.Attributes;
const Technique = tech.Technique;

class Character {
	constructor(name,race,attr,player) {
    //console.log('New Character: ' + name + ', Race - ' + race.raceName);
		this.name = name;
		this.race = race;
    this.playerID = player;
    this.image = '';
    this.personalityName = "None";
    this.personality = [1,1,1,2,2,2,1,1,1];

    this.deathCount = 0;
    this.hasZenkai = null;
    if(race.raceName === "Saiyan" || race.raceName === "Half-Saiyan") this.hasZenkai = 0;
    this.techniques = new Array(); 
    this.techCooldowns = new Array(); 
    this.transformation = -1;
    this.isTransformed = -1;
    this.scaled = -1;

    this.techniquePoints = 0;
    this.statPoints = 5;
		this.level = 1;
		this.exp = 0;
    this.totalexp = 0;
		this.nextEXP = 1;
    this.nextLevel(this.level);

    this.party = null;
    this.earnedEXP = 0;

    this.potentialUnlocked = 0;
    this.potentialUnleashed = 0;
    if(this.playerID === "Random" || this.playerID === "NPC") {
      this.potentialUnlocked = 1;
      this.race.unlockPotential();
    }

    /**********
    Equipment
    **********/

    this.dogi = null;
    this.weapon = null;
    this.styleName = "No_Style";
    this.fightingStyle = new AttributeBonus(this.styleName,"Fighting Style");
    this.techModify = 0;
    this.styleModify = 0;

    /**********
    Battle
    **********/

    this.eTarget = 0;
    this.aTarget = 0;
    this.isCharging = 0;
    this.guarded = -1;
    this.guarding = -1;

		this.attributes = attr;
    this.bonusAtt = new Attributes(0,0,0,0,0,0);
    this.battleMaxAtt = new Attributes(attr.str, attr.dex,
                                       attr.con, attr.eng,
                                       attr.sol, attr.foc);
    this.battleCurrAtt = new Attributes(this.battleMaxAtt.str, this.battleMaxAtt.dex,
                                          this.battleMaxAtt.con, this.battleMaxAtt.eng,
                                          this.battleMaxAtt.sol, this.battleMaxAtt.foc);
    this.statusUpdate(0);
	}

  clone() {
    let char = new Character(this.name,this.race,new Attributes(0,0,0,0,0,0),this.playerID);
    char.image = this.image;
    char.personalityName = this.personalityName;
    char.personality = this.personality;

    char.deathCount = this.deathCount;
    char.hasZenkai = this.hasZenkai;
    char.transformation = this.transformation;
    char.isTransformed = this.isTransformed;
    char.scaled = this.scaled;

    char.techniques = new Array(); 
    char.techCooldowns = new Array();

    for(let i = 0; i < this.techniques.length; i++) {
      char.techniques.push(this.techniques[i]);
    } 
    for(let i = 0; i < this.techCooldowns.length; i++) {
      char.techCooldowns.push(this.techCooldowns[i]);
    } 

    char.techniquePoints = this.techniquePoints;
    char.statPoints = this.statPoints;
    char.level = this.level;
    char.exp = this.exp;
    char.totalexp = this.totalexp;
    char.nextEXP = this.nextEXP;

    char.party = this.party;
    char.potentialUnlocked = this.potentialUnlocked;
    char.potentialUnleashed = this.potentialUnleashed;

    /**********
    Equipment
    **********/

    char.dogi = this.dogi;
    char.weapon = this.weapon;
    char.styleName = this.styleName;
    char.fightingStyle = this.fightingStyle;
    char.techModify = this.techModify;

    /**********
    ***********
    **********/

    char.eTarget = this.eTarget;
    char.aTarget = this.aTarget;
    char.isCharging = this.isCharging;
    char.guarded = this.guarded;
    char.guarding = this.guarding;

    char.attributes = new Attributes(this.attributes.str, this.attributes.dex,
                                       this.attributes.con, this.attributes.eng,
                                       this.attributes.sol, this.attributes.foc);
    char.bonusAtt = new Attributes(0,0,0,0,0,0);
    char.battleMaxAtt = new Attributes(char.attributes.str, char.attributes.dex,
                                       char.attributes.con, char.attributes.eng,
                                       char.attributes.sol, char.attributes.foc);
    char.battleCurrAtt = new Attributes(char.battleMaxAtt.str, char.battleMaxAtt.dex,
                                      char.battleMaxAtt.con, char.battleMaxAtt.eng,
                                      char.battleMaxAtt.sol, char.battleMaxAtt.foc);
    char.statusUpdate(0);
    return char;
  }

  unlockPotential() {
    if(parseInt(this.potentialUnlocked) === 0) {
      this.potentialUnlocked = 1;
      this.attributes.str = Math.min(Math.round(this.attributes.str * 1.1),(this.attributes.str + 10));
      this.attributes.dex = Math.min(Math.round(this.attributes.dex * 1.1),(this.attributes.dex + 10));
      this.attributes.con = Math.min(Math.round(this.attributes.con * 1.15),(this.attributes.con + 15));
      this.attributes.eng = Math.min(Math.round(this.attributes.eng * 1.15),(this.attributes.eng + 15));
      this.attributes.foc = Math.min(Math.round(this.attributes.foc * 1.1),(this.attributes.foc + 10));
      this.attributes.sol = Math.min(Math.round(this.attributes.sol * 1.1),(this.attributes.sol + 10));
      this.statusUpdate(0);
      return 1;
    }
    else return 0;
  } 

  unleashPotential(unleashing) {
    if(parseInt(this.potentialUnleashed) === 0 && parseInt(unleashing) === 1) {
      this.potentialUnleashed = 1;
      this.race.bstr += this.race.bstr/2+0.1;
      this.race.bdex += this.race.bdex/2+0.1;
      this.race.bcon += this.race.bcon/2+0.1;
      this.race.beng += this.race.beng/2+0.1;
      this.race.bsol += this.race.bsol/2+0.1;
      this.race.bfoc += this.race.bfoc/2+0.1;
      this.statusUpdate(0);
      return 1;
    }
    else return 0;
  }

  setPersonality(personalityType) {
    if(this.race.raceName === "Android" || this.race.raceName === "Majin") personalityType = this.race.raceName;
    //[strike,burst,charge,transform,strike tech,ki tech,buff,debuff,restoration]
    if(personalityType === "Striker") {
      this.personality = [2,1,1,4,2,1,1,0,0];
      this.personalityName = "Striker";
    }
    else if(personalityType === "Android") {
      this.personality = [0,0,0,2,3,3,2,2,3];
      this.personalityName = "Android";
    }
    else if(personalityType === "Majin") {
      this.personality = [2,2,2,1,0,0,1,1,2];
      this.personalityName = "Majin";
    }
    else if(personalityType === "Support") {
      this.personality = [0,2,1,1,0,1,3,2,2];
      this.personalityName = "Support";
    }
    else if(personalityType === "Healer") {
      this.personality = [0,2,1,1,0,2,2,2,5];
      this.personalityName = "Healer";
    }
    else if(personalityType === "Blaster") {
      this.personality = [1,2,1,2,1,4,0,0,1];
      this.personalityName = "Blaster";
    }
    else if(personalityType === "Tank") {
      this.personality = [2,-1,2,2,1,1,3,1,1];
      this.personalityName = "Tank";
    }
    else if(personalityType === "eTank") {
      this.personality = [-1,2,3,2,1,2,2,2,3];
      this.personalityName = "Tank";
    }
    else if(personalityType === "AllOut") {
      this.personality = [-1,-1,0,4,3,3,-1,-1,-2];
      this.personalityName = "AllOut";
    }
    else if(personalityType === "HoldBack") {
      this.personality = [3,3,1,1,2,2,-2,-2,-4];
      this.personalityName = "HoldBack";
    }
    else {
      this.personality = [1,1,1,2,2,2,1,1,1];
      this.personalityName = "None";
    }
  }

  gainZenkai() {
    if(this.battleCurrAtt.health <= this.battleMaxAtt.health*0.05 && this.race.raceName === "Saiyan" && this.hasZenkai === 0) {
      if(this.deathCount > 15) return -1;
      this.attributes.str += Math.max(1,Math.round(this.attributes.str * 0.02));
      this.attributes.dex += Math.max(1,Math.round(this.attributes.dex * 0.04));
      this.attributes.eng += Math.max(0,Math.round(this.attributes.eng * 0.01));
      this.attributes.foc += Math.max(1,Math.round(this.attributes.foc * 0.03));
      this.hasZenkai = 1;
      return 1;
    }
    else if(this.battleCurrAtt.health <= this.battleMaxAtt.health*0.03 && this.race.raceName === "Half-Saiyan" && this.hasZenkai === 0) {
      if(this.deathCount > 15) return -1;
      this.attributes.str += Math.max(1,Math.round(this.attributes.str * 0.02));
      this.attributes.dex += Math.max(0,Math.round(this.attributes.dex * 0.02));
      this.attributes.eng += Math.max(2,Math.round(this.attributes.eng * 0.04));
      this.attributes.foc += Math.max(0,Math.round(this.attributes.foc * 0.02));
      this.attributes.sol += Math.max(1,Math.round(this.attributes.sol * 0.02));
      this.hasZenkai = 1;
      return 1;
    }
    return 0;
  }

  addTechnique(tech, user) {
    if(this.techniques.length <= 5) {
      if(user === 'NPC' || user.ifTag(tech)) {
        this.techniques.push(tech);
        this.techCooldowns.push(0);
        return "Added to slot " + this.techniques.length + ".";
      }
      else {
        return "You have not unlocked this.";
      }
    }
    else return "You have the maximum amount of set techniques."
  }

  equipItem(type,item) {
    if(item === null) return;
    if(type == "Dogi") {
      this.dogi = item;
      this.battleMaxAtt.buffs.push(this.dogi.attbonus);
      this.battleMaxAtt.buffDurations.push(-1);
      this.addBuff(this.dogi.attbonus,-1);
      //this.battleCurrAtt.buffs.push(this.dogi.attbonus);
      //this.battleCurrAtt.buffDurations.push(-1);
    }
    else if(type == "Weapon") {
      this.weapon = item;
      this.battleMaxAtt.buffs.push(this.weapon.attbonus);
      this.battleMaxAtt.buffDurations.push(-1);
      this.addBuff(this.weapon.attbonus,-1);
      //this.battleCurrAtt.buffs.push(this.weapon.attbonus);
      //this.battleCurrAtt.buffDurations.push(-1);
    }
  }

  removeTechnique(id0) {
    if(this.techniques.length > 0 && this.techniques.length !== 1) {
      this.techniques.splice(id0,1);
      this.techCooldowns.splice(id0,1);
      return "Removed technique."
    }
    else return "Error?";
  }

  swapTechnique(id0,id1) {
    if(id0 >= this.techniques.length && id0 < 0 && id1 >= this.techniques.length && id1 < 0) {
      return "Out of range index.";
    }
    else {
      let tt = this.techniques[id0];
      this.techniques[id0] = this.techniques[id1];
      this.techniques[id1] = tt;
      return "Successfully swapped."
    }
  }

  setTransformation(tech, user) {
    if(tech === -1 || user === 'NPC' || user.ifTag(tech)) {
      this.transformation = tech;
      return null;
    }
    else {
      return "You have not unlocked this.";
    }
  }

  rebirth() {
    this.deathCount++;
    this.level = 1;
    this.totalexp = 0;
    this.exp = 0;
    this.techniquePoints = 0;
    this.nextLevel();
    this.statusUpdate(0);
  }
  
	nextLevel() {
		this.nextEXP = Math.round((12 * Math.pow(this.level,1.1)) / 5);
	}
  
	addEXP(num) {
    let str = "";
    if(isNaN(num)) num = 1;
		this.exp += num;
    this.totalexp += num;
    let count = 0;
		while(this.exp >= this.nextEXP) {
			this.exp -= this.nextEXP;
			this.level += 1;

			this.nextLevel(this.level);

      let statPInc = 5*(1+Math.floor(this.attributes.stotal / 75));
      let attBoostInc = 50*(1+Math.floor(this.attributes.stotal / 300));

      if(this.level % 2 === 0) this.techniquePoints += 1;
      if(this.level % statPInc === 0) this.statPoints += 1;

      if(this.level % 2 === 0 && this.level >= 600) this.techniquePoints += 3;
      else if(this.level % 2 === 0 && this.level >= 300) this.techniquePoints += 2;
      if(this.level % statPInc === 0 && this.level >= 1000) this.statPoints += 3;
      else if(this.level % statPInc === 0 && this.level >= 600) this.statPoints += 2;

      if(this.level % 2 === 0 && parseInt(this.potentialUnlocked) === 1) this.techniquePoints += 1;
      if(this.level % statPInc === 0 && parseInt(this.potentialUnlocked) === 1) this.statPoints += 1;

      if(this.level % attBoostInc === 0) {
        this.attributes.str += this.race.str;
        this.attributes.dex += this.race.dex;
        this.attributes.con += this.race.con;
        this.attributes.eng += this.race.eng;
        this.attributes.sol += this.race.sol;
        this.attributes.foc += this.race.foc;
      }
      if(this.level % (attBoostInc*5) === 0) {
        this.attributes.str += this.race.str;
        this.attributes.dex += this.race.dex;
        this.attributes.con += this.race.con;
        this.attributes.eng += this.race.eng;
        this.attributes.sol += this.race.sol;
        this.attributes.foc += this.race.foc;
      }

      if(this.attributes.str > this.race.maxStr) this.attributes.str = this.race.maxStr;
      if(this.attributes.dex > this.race.maxDex) this.attributes.dex = this.race.maxDex;
      if(this.attributes.con > this.race.maxCon) this.attributes.con = this.race.maxCon;
      if(this.attributes.eng > this.race.maxEng) this.attributes.eng = this.race.maxEng;
      if(this.attributes.sol > this.race.maxSol) this.attributes.sol = this.race.maxSol;
      if(this.attributes.foc > this.race.maxFoc) this.attributes.foc = this.race.maxFoc;

      this.statusUpdate(0);
      
      count++;
      if(count > 1) str = ('\n' + this.name.replace(/\_/g,' ') + " has leveled up " + count.toLocaleString(undefined) + " times!");
      else str = ('\n' + this.name.replace(/\_/g,' ') + " has leveled up!");
		}
    return str;
	}
  
  reAddEXP(num) {
    this.exp += num;
    this.totalexp += num;
    while(this.exp >= this.nextEXP) {
      this.exp -= this.nextEXP;
      this.level += 1;

      this.nextLevel(this.level);
      this.statusUpdate(0);
    }
  }

  calculateBonusAtt() {
    this.bonusAtt = new Attributes(this.attributes.str*this.race.bstr, this.attributes.dex*this.race.bdex,
                                   this.attributes.con*this.race.bcon, this.attributes.eng*this.race.beng,
                                   this.attributes.sol*this.race.bsol, this.attributes.foc*this.race.bfoc);
  }

  statusUpdate(chargeStart) {
      if(chargeStart === null) chargeStart = 0;
      this.race.unlockPotential(this.potentialUnlocked);
      this.race.unleashPotential(this.potentialUnleashed);

      this.attributes.calculate(this.level);
      this.attributes.stotal = this.attributes.str + this.attributes.dex + this.attributes.con + this.attributes.eng + this.attributes.sol + this.attributes.foc + 1;
      this.calculateBonusAtt();

      this.battleMaxAtt = new Attributes(this.attributes.str, this.attributes.dex,
                                          this.attributes.con, this.attributes.eng,
                                          this.attributes.sol, this.attributes.foc);
      if(this.bonusAtt !== null) {
        this.battleMaxAtt.str += this.bonusAtt.str;
        this.battleMaxAtt.dex += this.bonusAtt.dex;
        this.battleMaxAtt.con += this.bonusAtt.con;
        this.battleMaxAtt.eng += this.bonusAtt.eng;
        this.battleMaxAtt.sol += this.bonusAtt.sol;
        this.battleMaxAtt.foc += this.bonusAtt.foc;
      }
      this.battleMaxAtt.stotal = this.battleMaxAtt.str + this.battleMaxAtt.dex + this.battleMaxAtt.con + this.battleMaxAtt.eng + this.battleMaxAtt.sol + this.battleMaxAtt.foc + 1;
      this.battleMaxAtt.buffs.push(this.race.raceListBonuses);
      this.battleMaxAtt.buffDurations.push(-1);
      this.battleMaxAtt.calculate(this.level);
      
      //apply racial adjustments
      
      this.battleCurrAtt = new Attributes(this.battleMaxAtt.str, this.battleMaxAtt.dex,
                                          this.battleMaxAtt.con, this.battleMaxAtt.eng,
                                          this.battleMaxAtt.sol, this.battleMaxAtt.foc);
      this.addBuff(this.race.raceListBonuses, -1);
      //this.battleCurrAtt.buffs.push(this.race.raceListBonuses);
      //this.battleCurrAtt.buffDurations.push(-1);
      this.battleCurrAtt.calculate(this.level);

      if(this.dogi) {
        this.battleMaxAtt.buffs.push(this.dogi.attbonus);
        this.battleMaxAtt.buffDurations.push(-1);
        this.addBuff(this.dogi.attbonus,-1);
      }
      if(this.weapon) {
        this.battleMaxAtt.buffs.push(this.weapon.attbonus);
        this.battleMaxAtt.buffDurations.push(-1);
        this.addBuff(this.weapon.attbonus,-1);
      }
      if(this.fightingStyle.getTotalChange() > 0) {
        this.addBuff(this.fightingStyle, -1);
      }
      
      if(chargeStart !== null && chargeStart > 0) {
        this.battleCurrAtt.charge = chargeStart;
      }
      else {
        this.battleCurrAtt.charge = Math.round(this.battleMaxAtt.charge * 0.4);
      }

      if(this.race.raceName === "Android") {
        this.attributes.energyRegen = Math.round(this.attributes.energy*0.75);
        this.battleCurrAtt.energyRegen = Math.round(this.battleCurrAtt.energy*0.75);
        this.battleMaxAtt.energyRegen = Math.round(this.battleMaxAtt.energy*0.75);
      }
      
      this.battleCurrAtt.setChargeBonus();
  }

  addBuff(buff, duration) {
    this.battleCurrAtt.buffs.push(buff);
    this.battleCurrAtt.buffDurations.push(duration);
    this.battleCurrAtt.buffs[this.battleCurrAtt.buffs.length-1].listID = this.battleCurrAtt.buffs.length-1;

    this.battleCurrAtt.str += Math.round(this.battleMaxAtt.str*buff.bstr);
    this.battleCurrAtt.dex += Math.round(this.battleMaxAtt.dex*buff.bdex);
    this.battleCurrAtt.con += Math.round(this.battleMaxAtt.con*buff.bcon);
    this.battleCurrAtt.eng += Math.round(this.battleMaxAtt.eng*buff.beng);
    this.battleCurrAtt.sol += Math.round(this.battleMaxAtt.sol*buff.bsol);
    this.battleCurrAtt.foc += Math.round(this.battleMaxAtt.foc*buff.bfoc);
    this.battleCurrAtt.stotal = this.battleCurrAtt.str + this.battleCurrAtt.dex + this.battleCurrAtt.con + this.battleCurrAtt.eng + this.battleCurrAtt.sol + this.battleCurrAtt.foc + 1;

    this.battleCurrAtt.health = Math.round(this.battleCurrAtt.health*(1+buff.health));
    this.battleCurrAtt.energy = Math.round(this.battleCurrAtt.energy*(1+buff.energy));
    this.battleCurrAtt.charge = Math.round(this.battleCurrAtt.charge*(1+buff.charge));
    this.battleCurrAtt.battleCalc(this.level);

    if(this.race.raceName === "Android") {
        this.attributes.energyRegen = Math.round(this.attributes.energy*0.75);
        this.battleCurrAtt.energyRegen = Math.round(this.battleCurrAtt.energy*0.75);
        this.battleMaxAtt.energyRegen = Math.round(this.battleMaxAtt.energy*0.75);
    }
  }

  removeBuff(buffID) {
    if(buffID >= this.battleCurrAtt.buffs.length) {
      console.log("Buff was null.");
      return;
    }
    let buff = this.battleCurrAtt.buffs[buffID];

    this.battleCurrAtt.str -= Math.round(this.battleMaxAtt.str*buff.bstr);
    this.battleCurrAtt.dex -= Math.round(this.battleMaxAtt.dex*buff.bdex);
    this.battleCurrAtt.con -= Math.round(this.battleMaxAtt.con*buff.bcon);
    this.battleCurrAtt.eng -= Math.round(this.battleMaxAtt.eng*buff.beng);
    this.battleCurrAtt.sol -= Math.round(this.battleMaxAtt.sol*buff.bsol);
    this.battleCurrAtt.foc -= Math.round(this.battleMaxAtt.foc*buff.bfoc);
    this.battleCurrAtt.stotal = this.battleCurrAtt.str + this.battleCurrAtt.dex + this.battleCurrAtt.con + this.battleCurrAtt.eng + this.battleCurrAtt.sol + this.battleCurrAtt.foc + 1;

    this.battleCurrAtt.health = Math.round(this.battleCurrAtt.health*(1-buff.health));
    this.battleCurrAtt.energy = Math.round(this.battleCurrAtt.energy*(1-buff.energy));
    this.battleCurrAtt.charge = Math.round(this.battleCurrAtt.charge*(1-buff.charge));
    this.battleCurrAtt.buffs.splice(buffID,1);
    this.battleCurrAtt.buffDurations.splice(buffID,1);
    this.battleCurrAtt.battleCalc(this.level);

    if(this.race.raceName === "Android") {
        this.attributes.energyRegen = Math.round(this.attributes.energy*0.75);
        this.battleCurrAtt.energyRegen = Math.round(this.battleCurrAtt.energy*0.75);
        this.battleMaxAtt.energyRegen = Math.round(this.battleMaxAtt.energy*0.75);
    }
  }

  takeDamage(damage) {
    if(this.race.raceName === "Majin") {
      if(this.battleCurrAtt.health <= damage && this.battleCurrAtt.energy > 0) {
        if(this.battleCurrAtt.energy > 0) {
          damage = Math.round(damage*0.66);
          this.battleCurrAtt.energy -= damage;
          if(this.battleCurrAtt.energy < 0) {
            this.battleCurrAtt.energy = 0;
            this.battleCurrAtt.energyRegen = 0;
          }
        }
      }
      else this.battleCurrAtt.health -= damage;
    }
    else {
      this.battleCurrAtt.health -= damage;
    }

    if(this.battleCurrAtt.health < 0) this.battleCurrAtt.health = 0;
  }

  transformationCost(tech) {
    let hpcost = this.battleMaxAtt.health * (tech.healthCost/100);
    let epcost = this.battleMaxAtt.energy * (tech.energyCost/100);

    this.battleCurrAtt.health = Math.round(this.battleCurrAtt.health-hpcost);
    this.battleCurrAtt.energy = Math.round(this.battleCurrAtt.energy-epcost);

    if(this.battleCurrAtt.energy <= 0 || this.battleCurrAtt.health <= 0) {
      if(this.battleCurrAtt.energy < 0) this.battleCurrAtt.energy = 0;
      if(this.battleCurrAtt.health < 0) this.battleCurrAtt.health = 0;
      this.removeBuff(this.isTransformed);
      this.isTransformed = -1;

      let str = this.name.replace(/\_/g,' ') + ' can no longer hold their transformation!';
      return str;
    }
    else return '';
  }
  
  statRegen() {
    if(this.race.raceName === "Majin" || this.race.raceName === "Namekian" || this.race.raceName === "Dragon_Clan") {
      if(this.battleCurrAtt.energy <= Math.round(this.battleMaxAtt.energy * 0.1)) {
        this.battleCurrAtt.healthRegen = Math.round(this.battleMaxAtt.healthRegen / (this.race.raceListBonuses.healthRegen));
      }
      else {
        this.battleCurrAtt.healthRegen = this.battleMaxAtt.healthRegen;
      }
    }


    this.battleCurrAtt.health += this.battleCurrAtt.healthRegen;
    this.battleCurrAtt.energy += this.battleCurrAtt.energyRegen;
      
    if(this.battleCurrAtt.health > this.battleMaxAtt.health) {
      this.battleCurrAtt.health = this.battleMaxAtt.health;
    }
     if(this.battleCurrAtt.energy > this.battleMaxAtt.energy) {
      this.battleCurrAtt.energy = this.battleMaxAtt.energy;
    }
  }
}

module.exports = {
  Character : Character
}