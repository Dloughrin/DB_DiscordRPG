const char = require("./character.js");
const att = require("./attributes.js");
const tech = require("./technique.js");

const Character = char.Character;
const Attributes = att.Attributes;
const Technique = tech.Technique;

class Battle {
  static defenseScalar = 100;
  static blockModifier = 4;

	constructor(players, npcs, ID, techList) {
      this.ID = ID;
      this.techList = techList;
      this.expMod = 1;
      this.deathChance = 0;
      this.zeniRisk = 0;
      this.itemBox = "None";
      this.raid = 0;

      this.pCombatants = new Array();
      for(let i = 0; i < players.length; i++) {
        this.pCombatants.push(players[i]);
      }
      this.NPCombatants = new Array();
      for(let i = 0; i < npcs.length; i++) {
        this.NPCombatants.push(npcs[i]);
      }

      this.actions = new Array();
      this.NPCactions = new Array();
    }
  
    /* outdated
    getStatus(combatant) {
      let str = '';
      str = str + ('Name: ' + combatant.name + ', race: ' + combatant.race);
      str = str + '\n' + ('Level: ' + combatant.level + ', ' + combatant.exp + '/' + combatant.nextEXP + ' XP');
      str = str + '\n' + ('Power level ' + combatant.battleCurrAtt.scanPowerLevel(1, combatant.level));
      str = str + '\n' + ('HP ' + combatant.battleCurrAtt.health + '/' + combatant.battleMaxAtt.health);
      str = str + '\n' + ('EN ' + combatant.battleCurrAtt.energy + '/' + combatant.battleMaxAtt.energy);
      str = str + '\n' + ('Charge ' + combatant.battleCurrAtt.charge + '/' + combatant.battleMaxAtt.charge);
      str = str + '\n' + ('STR ' + combatant.battleCurrAtt.str);
      str = str + '\n' + ('DEX ' + combatant.battleCurrAtt.dex);
      str = str + '\n' + ('CON ' + combatant.battleCurrAtt.con);
      str = str + '\n' + ('ENG ' + combatant.battleCurrAtt.eng);
      str = str + '\n' + ('SOL ' + combatant.battleCurrAtt.sol);
      str = str + '\n' + ('FOC ' + combatant.battleCurrAtt.foc);
      return str;
    } */

    teamDead(set) {
      for(let i = 0; i < set.length; i++) {
        if(this.deathChance > 0) set[i].gainZenkai();
        if(set[i].battleCurrAtt.health > 0) {
          return 0;
        }
      }
      return 1;
    }

    //will skip those with 0 or less HP
    hasActed(userID) {
      for(let i = 0; i < this.pCombatants.length; i++) {
        if(userID === this.pCombatants[i].playerID) {
          if(this.pCombatants[i].battleCurrAtt.health <= 0) {
            return 2;
          }
        }
      }

      for(let i = 0; i < this.NPCombatants.length; i++) {
        if(userID === this.NPCombatants[i].playerID) {
          if(this.pCombatants[i].battleCurrAtt.health <= 0) {
            return 2;
          }
        }this.NPCactions
      }

      for(let i = 0; i < this.actions.length; i++) {
        if(userID === this.pCombatants[this.actions[i][2]]) {
          return 1;
        }
      }

      for(let i = 0; i < this.NPCactions.length; i++) {
        if(userID === this.NPCombatants[this.NPCactions[i][2]]) {
          return 1;
        }
      }

      return 0;
    }

    coolDownTick() {
      for(let i = 0; i < this.pCombatants.length; i++) {
        for(let j = 0; j < this.pCombatants[i].techCooldowns.length; j++) {
          if(this.pCombatants[i].techCooldowns[j] > 0) this.pCombatants[i].techCooldowns[j] -= 1;
        }
      }

      for(let i = 0; i < this.NPCombatants.length; i++) {
        for(let j = 0; j < this.NPCombatants[i].techCooldowns; j++) {
          if(this.NPCombatants[i].techCooldowns[j] > 0) this.NPCombatants[i].techCooldowns[j] -= 1;
        }
      }
    }

    //also sets the NPC actions when all players have acted; zenkai checked here
    allActed() {
      this.coolDownTick();

      let deadI = 0;
      for(let i = 0; i < this.pCombatants.length; i++) {
        if(this.pCombatants[i].battleCurrAtt.health <= 0) {
          deadI++;
        }
      }

      if(this.pCombatants.length <= (this.actions.length + deadI)) {
        deadI = 0;
        for(let i = 0; i < this.NPCombatants.length; i++) {
          if(this.NPCombatants[i].battleCurrAtt.health <= 0) {
             deadI++;
          }
          else if(this.NPCombatants[i].playerID === "NPC" || this.NPCombatants[i].playerID === "Random" ) {
            let target = -1;
            while(target === -1) {
              target = Math.round(Math.random() * (this.pCombatants.length-1));
              if(this.pCombatants[target].battleCurrAtt.health <= 0) target = -1;
            }
            let action = this.AI(this.NPCombatants[i].personality, this.NPCombatants[i],this.pCombatants[target]);
            action.push(i);
            action.push(target);
            this.NPCactions.push(action);
          }
          else if(this.NPCombatants.length > (this.NPCactions.length + deadI)) {
            return 0;
          }
        }
        return 1;
      }
      return 0;
    }

    AI(personality, npc, target) {
      let choices = new Array();
      let techPref = new Array();
      choices.push(["Strike",Number(personality[0])]); //strike
      choices.push(["Burst",Number(personality[1])]); //burst
      choices.push(["Charge",Number(personality[2])]); //charge
      choices.push(["Transform",Number(personality[3])]); //transform
      choices.push(["Strike Tech",Number(personality[4])]); //strike technique
      choices.push(["Ki Tech",Number(personality[5])]); //ki technique
      choices.push(["Buff",Number(personality[6])]); //buff technique
      choices.push(["Debuff",Number(personality[7])]); //debuff technique
      choices.push(["Restoration",Number(personality[8])]); //healing technique

      let phys = this.defenseCalc(npc.battleCurrAtt.physicalAttack, target.battleCurrAtt.pDefense);
      let energy = this.defenseCalc(npc.battleCurrAtt.energyAttack, target.battleCurrAtt.eDefense);

      if(phys > energy) {
        choices[0][1] += 2;
        choices[1][1] -= 4;
        choices[4][1] += 2;
        choices[5][1] -= 4;
        choices[8][1] -= 2;
      }
      else {
        choices[0][1] -= 4;
        choices[1][1] += 2;
        choices[4][1] -= 4;
        choices[5][1] += 2;
        choices[8][1] += 2;
      }

      if(npc.battleCurrAtt.speed > target.battleCurrAtt.speed*2) {
        choices[0][1] += 1+Math.round(npc.battleCurrAtt.speed/target.battleCurrAtt.speed);
        choices[1][1] += 1+Math.round(npc.battleCurrAtt.speed/target.battleCurrAtt.speed);
      }

      if(npc.battleCurrAtt.charge === npc.battleMaxAtt.charge) {
        choices[2][1] -= 3;
      }
      else if(npc.battleCurrAtt.charge >= npc.battleMaxAtt.charge*0.8) {
        choices[2][1] -= 2;
      }
      if(npc.battleCurrAtt.charge < target.battleCurrAtt.charge*0.9) {
        choices[2][1] += 2;
      }
      if(npc.battleCurrAtt.charge < npc.battleMaxAtt.charge*0.5) {
        choices[2][1] += 2;
      }

      if(npc.battleCurrAtt.energy <= npc.battleMaxAtt.energy*0.1) {
        choices[2][1] += 1;
        choices[3][1] -= 2;
        choices[4][1] -= 2;
        choices[5][1] -= 2;
        choices[6][1] -= 2;
        choices[7][1] -= 2;
      }
      if(npc.battleCurrAtt.health <= npc.battleMaxAtt.health*0.2) {
        choices[3][1] -= 3;
        choices[8][1] += 3;
      }


      if(npc.transformation === -1 || npc.isTransformed != -1) {
        choices[3][1] -= 100;
      }
      else {
        choices[3][1] += 2*Math.round(this.techList[npc.transformation].attBonus.getTotalChange()/100);
      }
      if(npc.transformation !== -1 && npc.battleCurrAtt.health < 0.5 * npc.battleMaxAtt.health && npc.battleCurrAtt.energy < 3 * npc.battleMaxAtt.energy * (this.techList[npc.transformation].energyCost/100)) {
        if(npc.transformation === -1 || npc.isTransformed != -1) choices[3][1] += 102;
        else choices[3][1] -= 100;
      } 
      if(npc.battleCurrAtt.health <= npc.battleMaxAtt.health*0.8) {
        choices[3][1] += 2;
      }

      if(npc.battleCurrAtt.stotal*npc.level*npc.battleCurrAtt.chargeBonus*2 < target.battleCurrAtt.stotal*target.battleCurrAtt.chargeBonus*target.level) {
        choices[3][1] += 6;
        choices[2][1] += 3;
      }
      else if(npc.battleCurrAtt.stotal*npc.level*1.6 < target.battleCurrAtt.stotal*target.level*target.battleCurrAtt.chargeBonus) {
        choices[3][1] += 4;
        choices[2][1] += 2;
      }
      else if(npc.battleCurrAtt.stotal*npc.level*1.2 < target.battleCurrAtt.stotal*target.level*target.battleCurrAtt.chargeBonus) {
        choices[3][1] += 2;
        choices[2][1] += 1;
      }
      else if(npc.battleCurrAtt.stotal*npc.level > 1.4*target.battleCurrAtt.stotal*target.level*target.battleCurrAtt.chargeBonus) {
        choices[3][1] -= 4;
        choices[2][1] -= 2;
      }


      if(npc.race.raceName === "Human" || npc.race.raceName === "Majin" || npc.race.raceName === "Dragon_Clan") {
        choices[7][1] += 1;
        choices[8][1] += 1;
      }
      else if(npc.race.raceName === "Saiyan" || npc.race.raceName === "Android") {
        choices[7][1] -= 100;
        choices[8][1] -= 100;
      }

      let chosenTech = null;
      let scaler = Math.round((npc.level+npc.battleCurrAtt.stotal)/2);
      if(npc.techniques.length === 0) {
        choices[4][1] -= 100;
        choices[5][1] -= 100;
        choices[6][1] -= 100;
        choices[7][1] -= 100;
        choices[8][1] -= 100;
      }
      else {
        for(let i = 0; i < npc.techniques.length; i++) {
          techPref.push([npc.techniques[i],0,i]);
          if(npc.techCooldowns[i] !== 0) techPref[i][1] -= 1000;
          if(this.techList[techPref[i][0]].techType === "Ki") {
            techPref[i][1] += Number(choices[5][1]);
          }
          else if(this.techList[techPref[i][0]].techType === "Strike") {
            techPref[i][1] += Number(choices[4][1]);
          }
          else if(this.techList[techPref[i][0]].techType === "Buff") {
            techPref[i][1] += Number(choices[6][1]);
          }
          else if(this.techList[techPref[i][0]].techType === "Debuff") {
            techPref[i][1] += Number(choices[7][1]);
          }
          else if(this.techList[techPref[i][0]].techType === "Restoration") {
            techPref[i][1] += Number(choices[8][1]);

            if(npc.battleCurrAtt.energy < npc.battleMaxAtt.energy*0.25 && this.techList[techPref[i][0]].energy != 0) techPref[i][1] += 4;
            else if(npc.battleCurrAtt.energy < npc.battleMaxAtt.energy*0.5 && this.techList[techPref[i][0]].energy != 0) techPref[i][1] += 2;

            if(npc.battleCurrAtt.health < npc.battleMaxAtt.health*0.25 && this.techList[techPref[i][0]].health != 0) techPref[i][1] += 5;
            else if(npc.battleCurrAtt.health < npc.battleMaxAtt.health*0.5 && this.techList[techPref[i][0]].health != 0) techPref[i][1] += 2;
          }

          if(this.techList[techPref[i][0]].energyCost*scaler*2 >= npc.battleCurrAtt.energy || this.techList[techPref[i][0]].healthCost*scaler*3 >= npc.battleCurrAtt.health) {
            techPref[i][1] -= 100;
          }
          else if(this.techList[techPref[i][0]].techType === "Ki" || this.techList[techPref[i][0]].techType === "Strike") {
            techPref[i][1] += Math.round(Number(this.techList[techPref[i][0]].scalePercent));
            techPref[i][1] += Math.round(this.techList[techPref[i][0]].flatDamage/40);
            techPref[i][1] -= Math.round(this.techList[techPref[i][0]].energyCost/75);
            techPref[i][1] -= Math.round(this.techList[techPref[i][0]].healthCost/50);
            techPref[i][1] += Math.round(this.techList[techPref[i][0]].hitRate/25);
            techPref[i][1] += Math.round(this.techList[techPref[i][0]].critRate/10);
            techPref[i][1] += Math.round(this.techList[techPref[i][0]].armorPen/10);
            techPref[i][1] += Math.round(this.techList[techPref[i][0]].hits/2);
            if(this.techList[techPref[i][0]].allowCharge > 0) techPref[i][1] += 1;
          }
          else if(this.techList[techPref[i][0]].techType === "Buff" || this.techList[techPref[i][0]].techType === "Debuff") {
            techPref[i][1] -= Math.round(this.techList[techPref[i][0]].energyCost/50);
            techPref[i][1] -= Math.round(this.techList[techPref[i][0]].healthCost/25);
            if(this.techList[techPref[i][0]].techType === "Buff") techPref[i][1] += 2*Math.round(this.techList[techPref[i][0]].attBonus.getTotalChange()/100);
            else {
              techPref[i][1] += Math.round(this.techList[techPref[i][0]].attBonus.getTotalChange()/100);
            }
          }
          else if(this.techList[techPref[i][0]].techType === "Restoration") {
            techPref[i][1] += Math.round(Number(this.techList[techPref[i][0]].scalePercent));
            techPref[i][1] += Math.round(this.techList[techPref[i][0]].flatDamage/30);
            techPref[i][1] -= Math.round(this.techList[techPref[i][0]].energyCost/75);
            techPref[i][1] -= Math.round(this.techList[techPref[i][0]].healthCost/50);
          }
          else {
            techPref[i][1] += Number(this.techList[techPref[i][0]].scalePercent);
            techPref[i][1] += Math.round(this.techList[techPref[i][0]].flatDamage/20);
            techPref[i][1] -= Math.round(this.techList[techPref[i][0]].energyCost/50);
            techPref[i][1] -= Math.round(this.techList[techPref[i][0]].healthCost/50);
          }
        }
        techPref.sort(function(a,b) {return b[1] - a[1]});
        if(techPref[0][1] < 0) chosenTech = null;
        else {
          chosenTech = techPref[0][0];
          if(choices[4][1] < choices[5][1] && this.techList[chosenTech].techType === "Strike") {
            choices[4][1] -= 1;
            choices[5][1] -= 1;
          }
          else if(choices[4][1] > choices[5][1] && this.techList[chosenTech].techType === "Ki") {
            choices[4][1] -= 1;
            choices[5][1] -= 1;
          }
        }
      }

      if(chosenTech === null) {
        choices[4][1] -= 100;
        choices[5][1] -= 100;
        choices[6][1] -= 100;
        choices[7][1] -= 100;
        choices[8][1] -= 100;
      }

      choices.sort(function(a,b) {return b[1] - a[1]});
      let choice = choices[0][0];

      if(choice === "Strike") {
        return this.strike(npc,target);
      }
      else if(choice === "Burst") {
        return this.burst(npc,target);
      }
      else if(choice === "Charge") {
        return this.charge(npc);
      }
      else if(choice === "Transform") {
        return this.transform(npc);
      }
      else {
        npc.techCooldowns[techPref[0][2]] = this.techList[chosenTech].coolDown;
        let t;
        if(this.techList[chosenTech].techType === "Buff" || this.techList[chosenTech].techType === "Restoration") t = npc;
        else t = target;
        if(npc.battleCurrAtt.charge > (npc.battleMaxAtt.charge * 0.2 * this.techList[chosenTech].allowCharge) && npc.battleCurrAtt.charge > 0) return this.skill(npc, t, this.techList[chosenTech], 1);
        else return this.skill(npc, t, this.techList[chosenTech], 0);
        
      }
    }

    executeActions() {
      for(let i = 0; i < this.actions.length; i++) {
        if(this.pCombatants[this.actions[i][2]].isTransformed != -1) {
          this.actions[i][1] += '\n' + this.pCombatants[this.actions[i][2]].transformationCost(this.techList[this.pCombatants[this.actions[i][2]].transformation]);
        }
        for(let j = 0; j < this.pCombatants[this.actions[i][2]].battleCurrAtt.buffDurations.length; j++) {
          if(this.pCombatants[this.actions[i][2]].battleCurrAtt.buffDurations[j] > 0) this.pCombatants[this.actions[i][2]].battleCurrAtt.buffDurations[j] -= 1;
          else if(this.pCombatants[this.actions[i][2]].battleCurrAtt.buffDurations[j] === 0) {
            this.actions[i][1] = this.actions[i][1] + "\n" + this.pCombatants[this.actions[i][2]].battleCurrAtt.buffs[j].name.replace(/\_/g,' ') + " has worn off.";
            this.pCombatants[this.actions[i][2]].removeBuff(j);
          }
        }

        if(this.pCombatants[this.actions[i][2]].battleCurrAtt.health > 0) {
          if(this.actions[i][0] === -1) {
            if(this.pCombatants[i].battleCurrAtt.charge >= this.pCombatants[i].battleMaxAtt.charge) {
              this.pCombatants[i].battleCurrAtt.charge = this.pCombatants[i].battleMaxAtt.charge;
            }
            this.pCombatants[this.actions[i][2]].statRegen();
            this.pCombatants[this.actions[i][2]].statRegen();
          }
          else if(this.actions[i][0] === -2) {
            this.pCombatants[this.actions[i][2]].statRegen();
            this.pCombatants[this.actions[i][2]].statRegen();
          }
          else {
            this.pCombatants[this.actions[i][2]].statRegen();
            this.NPCombatants[this.actions[i][3]].takeDamage(this.actions[i][0]);

            if(this.NPCombatants[this.actions[i][3]].battleCurrAtt.health <= 0) {
              this.actions[i][1] = this.actions[i][1] + "\n" + this.NPCombatants[this.actions[i][3]].name.replace(/\_/g,' ') + " has been defeated by ";
              this.actions[i][1] = this.actions[i][1] + this.pCombatants[this.actions[i][2]].name.replace(/\_/g,' ') + "!";
            }
          }
        }
      }

      for(let i = 0; i < this.NPCactions.length; i++) {
        if(this.NPCombatants[this.NPCactions[i][2]].isTransformed != -1) {
          this.NPCactions[i][1] += '\n' + this.NPCombatants[this.NPCactions[i][2]].transformationCost(this.techList[this.NPCombatants[this.NPCactions[i][2]].transformation]);
        }
        for(let j = 0; j < this.NPCombatants[this.NPCactions[i][2]].battleCurrAtt.buffDurations.length; j++) {
          if(this.NPCombatants[this.NPCactions[i][2]].battleCurrAtt.buffDurations[j] > 0) this.NPCombatants[this.NPCactions[i][2]].battleCurrAtt.buffDurations[j] -= 1;
          else if(this.NPCombatants[this.NPCactions[i][2]].battleCurrAtt.buffDurations[j] === 0) {
            this.NPCactions[i][1] = this.NPCactions[i][1] + "\n" + this.NPCombatants[this.NPCactions[i][2]].battleCurrAtt.buffs[j].name.replace(/\_/g,' ') + " has worn off.";
            this.NPCombatants[this.NPCactions[i][2]].removeBuff(j);
          }
        }

        if(this.NPCombatants[this.NPCactions[i][2]].battleCurrAtt.health > 0) {
          if(this.NPCactions[i][0] === -1) {
            if(this.NPCombatants[i].battleCurrAtt.charge >= this.NPCombatants[i].battleMaxAtt.charge) {
                this.NPCombatants[i].battleCurrAtt.charge = this.NPCombatants[i].battleMaxAtt.charge;
            }
            this.NPCombatants[this.NPCactions[i][2]].statRegen();
            this.NPCombatants[this.NPCactions[i][2]].statRegen();
          }
          else if(this.NPCactions[i][0] === -2) {
            this.NPCombatants[this.NPCactions[i][2]].statRegen();
            this.NPCombatants[this.NPCactions[i][2]].statRegen();
          }
          else {
            this.NPCombatants[this.NPCactions[i][2]].statRegen();
            this.pCombatants[this.NPCactions[i][3]].takeDamage(this.NPCactions[i][0]);

            if(this.pCombatants[this.NPCactions[i][3]].battleCurrAtt.health <= 0) {
              this.NPCactions[i][1] = this.NPCactions[i][1] + "\n" + this.pCombatants[this.NPCactions[i][3]].name.replace(/\_/g,' ') + " has been defeated by ";
              this.NPCactions[i][1] = this.NPCactions[i][1] + this.NPCombatants[this.NPCactions[i][2]].name.replace(/\_/g,' ') + "!";
            }
          }

        }
      }
    }
  
    /*defenseCalc(level, stotal, defense) {
      let reduction = 0;
      let maxReduction = Math.round(1 + ((stotal / 2) * level)*0.5 );
      console.log(maxReduction)
      let flatReduction = defense - maxReduction;
      let percent = 0.6 + 0.3*Math.min(1,(stotal*level)/(300*50)) + 0.09*Math.min(1,(stotal*level)/(1300*500));
      reduction = defense/maxReduction;
      if(reduction > percent) reduction = percent;
      if(flatReduction < 0) flatReduction = 0;
      return [reduction,flatReduction];
    }*/

    /*************************
     * For every defenseScalar amount that a character has in (e/p)Defense, 
     * they reduce damage by 50%. The same happens again with blocks, except  
     * the scalar is multiplied by blockModifier.
     ************************/
    defenseCalc(attack, defense) {
      return attack*(Battle.defenseScalar/(Battle.defenseScalar+defense));
    }
  
    dodgeCalc(hit, dodge) {
      return ((hit/dodge) - 0.2) * 100;
    }
  
    transform(user) {
      let transformation = this.techList[user.transformation];
      let str;
      if(user.isTransformed === -1) {
        user.addBuff(transformation.attBonus,-1);
        user.isTransformed = user.battleCurrAtt.buffs.length-1;

        str = user.name.replace(/\_/g,' ') + ' has transformed using ' + transformation.name.replace(/\_/g,' ') + '!';
        str = str + '\n' + transformation.attBonus.outputBonusStr();
      }
      else {
        user.removeBuff(user.isTransformed);
        user.isTransformed = -1;

        str = user.name.replace(/\_/g,' ') + ' has dropped their transformation!';
      }
      return [-2,str];
    }

    strike(attacker, target) {
      let str = '';
      let cHit = Math.round(Math.random() * 100) + 1;
      let hit = Math.round(Math.random() * 100) + 1;
      let block = Math.round(Math.random() * 100) + 1;
      let damR = Math.random() * 0.2 + 0.9;
      let calcHit = this.dodgeCalc(1.2*attacker.battleCurrAtt.hit*attacker.battleCurrAtt.chargeBonus, target.battleCurrAtt.dodge*target.battleCurrAtt.chargeBonus);
      
      if(hit >= calcHit) {
        str = str + '\n' + (attacker.name.replace(/\_/g,' ') + ' missed!')
        return [0,str];
      }
      
      let damage = attacker.battleCurrAtt.physicalAttack*1.3*attacker.battleCurrAtt.chargeBonus;
      //let r = this.defenseCalc(attacker.level, attacker.battleCurrAtt.stotal, target.battleCurrAtt.pDefense*target.battleCurrAtt.chargeBonus);
      damage = this.defenseCalc(damage, target.battleCurrAtt.pDefense*target.battleCurrAtt.chargeBonus);
      //damage = Math.round(damage * (1 + r[0]));
      damage *= damR;

      //apply flat reduction
      //if(r[1] > damage*0.85) r[1] = damage*0.85;
      //damage = damage-r[1];
      
      let s = Math.round((1.3 * attacker.battleCurrAtt.speed * attacker.battleCurrAtt.chargeBonus) / (0.7 * target.battleCurrAtt.speed * target.battleCurrAtt.chargeBonus));
      
      if(s < 2) {
        s = 2;
      }
      damage *= s;
      
      let dod1 = target.battleCurrAtt.dodge*target.battleCurrAtt.chargeBonus;
      let dod2 = attacker.battleCurrAtt.hit*attacker.battleCurrAtt.chargeBonus - 0.8*target.battleCurrAtt.dodge*target.battleCurrAtt.chargeBonus;
      let adjustment = Math.max(0,dod2/dod1)*100;
      let blockPow = 0;
      if(block <= (target.battleCurrAtt.blockRate - adjustment)) {
        str = str + '\n' + (target.name.replace(/\_/g,' ') + ' blocked!');
        blockPow = target.battleCurrAtt.blockPower*target.battleCurrAtt.chargeBonus/Battle.blockModifier;
        damage = this.defenseCalc(damage,blockPow);
      }
      

      if(cHit <= attacker.battleCurrAtt.critRate) {
        str = str + '\n' + ('Critical!')
        damage = damage * attacker.battleCurrAtt.critDamage;
      }

      damage = Math.round(damage);
      if(damage <= 0) damage = 0;
      else if(blockPow === 0 && damage < target.battleMaxAtt.health*0.1 && attacker.battleCurrAtt.str >= attacker.battleCurrAtt.sol) {
        damage = Math.round(target.battleMaxAtt.health*0.1);
        s = 1;
      } 
      else if(damage < target.battleMaxAtt.health*0.1 && attacker.battleCurrAtt.str >= attacker.battleCurrAtt.sol){
        damage = Math.round(target.battleMaxAtt.health*0.08);
        s = 1;
      }
      str = str + '\n' + (attacker.name.replace(/\_/g,' ') + " used a strike and dealt " + damage.toLocaleString(undefined) + ' damage in ' + s + ' hits!');
      return [damage,str];
    }
  
    burst(attacker, target) {
      let str = '';
      let cHit = Math.round(Math.random() * 100) + 1;
      let hit = Math.round(Math.random() * 100) + 1;
      let block = Math.round(Math.random() * 100) + 1;
      let damR = Math.random() * 0.2 + 0.9;
      let calcHit = this.dodgeCalc(1.15*attacker.battleCurrAtt.hit*attacker.battleCurrAtt.chargeBonus, target.battleCurrAtt.dodge*target.battleCurrAtt.chargeBonus);
      
      //check for dodge, return 0
      if(hit >= calcHit) {
        str = str + '\n' + (attacker.name.replace(/\_/g,' ') + ' missed!')
        return [0,str];
      }
      
      //calculate base damage
      let damage = attacker.battleCurrAtt.energyAttack*0.9*attacker.battleCurrAtt.chargeBonus;
      //let r = this.defenseCalc(attacker.level, attacker.battleCurrAtt.stotal, target.battleCurrAtt.eDefense*target.battleCurrAtt.chargeBonus);
      damage = this.defenseCalc(damage, target.battleCurrAtt.eDefense*target.battleCurrAtt.chargeBonus);
      damage *= 2;
      //damage = Math.round(damage * (1 - r[0]));
      damage *= damR;

      //apply flat reduction
      //if(r[1] > damage*0.85) r[1] = damage*0.85;
      //damage = damage-r[1];
      
      //number of hits calculation
      let s = Math.round((1.3 * attacker.battleCurrAtt.speed * attacker.battleCurrAtt.chargeBonus) / (0.7 * target.battleCurrAtt.speed * target.battleCurrAtt.chargeBonus * 1.1));
      if(s < 3) {
        s = 3;
      }
      damage *= s;

      //block calculation
      let dod1 = target.battleCurrAtt.dodge*target.battleCurrAtt.chargeBonus;
      let dod2 = attacker.battleCurrAtt.hit*attacker.battleCurrAtt.chargeBonus - 0.8*target.battleCurrAtt.dodge*target.battleCurrAtt.chargeBonus;
      let adjustment = Math.max(0,dod2/dod1)*100;
      let blockPow = 0;
      if(block <= (target.battleCurrAtt.blockRate - adjustment)) {
        str = str + '\n' + (target.name.replace(/\_/g,' ') + ' blocked!');
        blockPow = target.battleCurrAtt.blockPower;
        blockPow = target.battleCurrAtt.blockPower*target.battleCurrAtt.chargeBonus/Battle.blockModifier;
        damage = this.defenseCalc(damage,blockPow);
      }

      //check for critical
      if(cHit <= attacker.battleCurrAtt.critRate) {
        str = str + '\n' + ('Critical!')
        damage = damage * attacker.battleCurrAtt.critDamage;
      }
      
      //clean up and msg.channel.send
      damage = Math.round(damage);
      if(damage < 0) damage = 0;
      else if(blockPow === 0 && damage < target.battleMaxAtt.health*0.1 && attacker.battleCurrAtt.str < attacker.battleCurrAtt.sol) {
        damage = Math.round(target.battleMaxAtt.health*0.1);
        s = 1;
      }
      else if(damage < target.battleMaxAtt.health*0.1 && attacker.battleCurrAtt.str < attacker.battleCurrAtt.sol){
        damage = Math.round(target.battleMaxAtt.health*0.08);
        s = 1;
      }
      str = str + '\n' + (attacker.name.replace(/\_/g,' ') + " used a burst and dealt " + damage.toLocaleString(undefined) + ' damage in ' + s + ' hits!');
      return [damage,str];
    }
  
    skill(attacker, target, technique, charge) {
      if(technique.techType == 'Ki' || technique.techType == 'Strike') {
        let str = '';
        let chargeBoost = charge;
        let cHit = Math.round(Math.random() * 100) + 1;
        let hit = Math.round(Math.random() * 100) + 1;
        let block = Math.round(Math.random() * 100) + 1;
        let damR = Math.random() * 0.2 + 0.9;
        let scaleLvl = Math.round((attacker.battleCurrAtt.stotal + attacker.level)/1.5);
        let calcHit = this.dodgeCalc((1+technique.hitRate/100)*attacker.battleCurrAtt.hit*attacker.battleCurrAtt.chargeBonus, target.battleCurrAtt.dodge*target.battleCurrAtt.chargeBonus);

        if(attacker.battleCurrAtt.health < technique.healthCost*scaleLvl || attacker.battleCurrAtt.energy < technique.energyCost*scaleLvl) {
          str = attacker.name.replace(/\_/g,' ') + ' can no longer use ' + technique.name.replace(/\_/g,' ') + ' on ' + target.name.replace(/\_/g,' ') + '!';
          return [0,str];
        }

        if(chargeBoost === null) chargeBoost = 0;

        str = str + (attacker.name.replace(/\_/g,' ') + ' uses ' + technique.name.replace(/\_/g,' ') + '!');
        
        attacker.battleCurrAtt.health -= technique.healthCost*scaleLvl;
        attacker.battleCurrAtt.energy -= technique.energyCost*scaleLvl;
        attacker.battleCurrAtt.charge -= Math.round(attacker.battleMaxAtt.charge * 0.2 * chargeBoost * technique.allowCharge); 

        //if(chargeBoost === 1) chargeBoost = 1 + ((technique.allowCharge-1)/3);
        if(chargeBoost >= 1) chargeBoost = 1 + chargeBoost * 0.33;
        
        //check for dodge, return 0
        if(hit >= calcHit) {
          str = str + '\n' + attacker.name.replace(/\_/g,' ') + ' missed!';
          return [0,str];
        }
        
        //calculate base damage
        let damage;
        let r;
        
        if(technique.techType == 'Ki') {
          damage = 0.8*attacker.battleCurrAtt.energyAttack*attacker.battleCurrAtt.chargeBonus;
          damage += Math.round(technique.flatDamage*scaleLvl*0.8);
          //r = this.defenseCalc(attacker.level, attacker.battleCurrAtt.stotal, (1-technique.armorPen/100)*target.battleCurrAtt.eDefense*target.battleCurrAtt.chargeBonus);
          damage = this.defenseCalc(damage, (1-technique.armorPen/100)*target.battleCurrAtt.eDefense*target.battleCurrAtt.chargeBonus);
        }
        else if(technique.techType == 'Strike') {
          damage = attacker.battleCurrAtt.physicalAttack*attacker.battleCurrAtt.chargeBonus;
          damage += Math.round(technique.flatDamage*scaleLvl*0.8);
          //r = this.defenseCalc(attacker.level, attacker.battleCurrAtt.stotal, (1-technique.armorPen/100)*target.battleCurrAtt.pDefense*target.battleCurrAtt.chargeBonus);
          damage = this.defenseCalc(damage, (1-technique.armorPen/100)*target.battleCurrAtt.pDefense*target.battleCurrAtt.chargeBonus);
        }      
        damage *= technique.scalePercent;
        //damage = Math.round(damage * (1 - r[0]));
        damage *= damR;
        if(chargeBoost != 0) damage *= chargeBoost;

        //Flat reduction from higher defenses
        //r[1] = r[1]*(1-technique.armorPen/100);
        //if(r[1] > damage*0.8) r[1] = damage*0.8;
        //damage = damage-r[1];
        
        //number of hits calculation
        let s = technique.hits;
        damage *= s;
        
        //block calculation
        let dod1 = target.battleCurrAtt.dodge*target.battleCurrAtt.chargeBonus;
        let dod2 = attacker.battleCurrAtt.hit*attacker.battleCurrAtt.chargeBonus - 0.8*target.battleCurrAtt.dodge*target.battleCurrAtt.chargeBonus;
        let adjustment = Math.min(1.1,Math.max(0,dod2/dod1))*100;
        if(block <= (target.battleCurrAtt.blockRate - adjustment)) {
          str = str + '\n' + target.name.replace(/\_/g,' ') + ' blocked!';
          let blockPow = target.battleCurrAtt.blockPower*target.battleCurrAtt.chargeBonus/Battle.blockModifier;
          damage = this.defenseCalc(damage,(1-technique.armorPen/150)*blockPow);
        }

        //check for critical
        if(cHit <= Number(attacker.battleCurrAtt.critRate)+Number(technique.critRate)) {
          str = str + '\n' + ('Critical!')
          damage = damage * attacker.battleCurrAtt.critDamage;
        }
        
        //clean up and msg.channel.send
        damage = Math.round(damage);
        if(damage < 0) damage = 0;
        str = str + '\n' + damage.toLocaleString(undefined) + ' damage taken in ' + s + ' hits!';
        return [damage,str];
      }
      else if(technique.techType == 'Buff') {
        let str = '';
        let scaleLvl = Math.round((attacker.battleCurrAtt.stotal + attacker.level)/2);

        if(attacker.battleCurrAtt.health < technique.healthCost*scaleLvl || attacker.battleCurrAtt.energy < technique.energyCost*scaleLvl) {
          str = attacker.name.replace(/\_/g,' ') + ' can no longer use ' + technique.name.replace(/\_/g,' ') + '!';
          return [0,str];
        }

        str = str + (attacker.name.replace(/\_/g,' ') + ' uses ' + technique.name.replace(/\_/g,' ') + ' on ' + target.name.replace(/\_/g,' ') + '!');
        
        attacker.battleCurrAtt.health -= technique.healthCost*scaleLvl;
        attacker.battleCurrAtt.energy -= technique.energyCost*scaleLvl;

        str = str + '\n' + technique.attBonus.outputBonusStr();
        if(technique.duration !== null) target.addBuff(technique.attBonus, technique.duration);
        else target.addBuff(technique.attBonus, -1);
        return [0,str];
      }
      else if(technique.techType == 'Debuff') {
        let str = '';
        let hit = Math.round(Math.random() * 100) + 1;
        let resist = Math.round(Math.random() * 100) + 1;
        let scaleLvl = Math.round((attacker.battleCurrAtt.stotal + attacker.level)/2);
        let calcHit = this.dodgeCalc(attacker.battleCurrAtt.hit*attacker.battleCurrAtt.chargeBonus, target.battleCurrAtt.dodge*target.battleCurrAtt.chargeBonus);
        let calcResist = this.defenseCalc(attacker.level, attacker.battleCurrAtt.stotal, target.battleCurrAtt.magicDefense*target.battleCurrAtt.chargeBonus);

        if(attacker.battleCurrAtt.health < technique.healthCost*scaleLvl || attacker.battleCurrAtt.energy < technique.energyCost*scaleLvl) {
          str = attacker.name.replace(/\_/g,' ') + ' can no longer use ' + technique.name.replace(/\_/g,' ') + '!';
          return [0,str];
        }

        str = str + (attacker.name.replace(/\_/g,' ') + ' uses ' + technique.name.replace(/\_/g,' ') + ' on ' + target.name.replace(/\_/g,' ') + '!');
        
        attacker.battleCurrAtt.health -= technique.healthCost*scaleLvl;
        attacker.battleCurrAtt.energy -= technique.energyCost*scaleLvl;  

        //check for dodge, return 0
        if(hit >= calcHit) {
          str = str + '\n' + attacker.name.replace(/\_/g,' ') + ' missed!';
          return [0,str];
        }  

        //check for resist, return 0
        calcResist = (1 - calcResist[0]) * 100;
        if(resist >= calcResist) {
          str = str + '\n' + attacker.name.replace(/\_/g,' ') + "'s technique was resisted!";
          return [0,str];
        }

        str = str + '\n' + technique.attBonus.outputBonusStr();
        if(technique.duration !== null) target.addBuff(technique.attBonus, technique.duration);
        else target.addBuff(technique.attBonus, -1);
        return [0,str];
      }
      else if(technique.techType == 'Restoration') {
        let str = '';
        let chargeBoost = charge;
        let cHit = Math.round(Math.random() * 100) + 1;
        let healR = Math.random() * 0.2 + 0.9;
        let scaleLvl = Math.round((attacker.battleCurrAtt.stotal + attacker.level)/2);

        if(attacker.battleCurrAtt.health < technique.healthCost*scaleLvl || attacker.battleCurrAtt.energy < technique.energyCost*scaleLvl) {
          str = attacker.name.replace(/\_/g,' ') + ' can no longer use ' + technique.name.replace(/\_/g,' ') + '!';
          return [0,str];
        }

        if(chargeBoost === null) chargeBoost = 0;

        str = str + (attacker.name.replace(/\_/g,' ') + ' uses ' + technique.name.replace(/\_/g,' ') + ' on ' + target.name.replace(/\_/g,' ') + '!');
        
        attacker.battleCurrAtt.health -= technique.healthCost*scaleLvl;
        attacker.battleCurrAtt.energy -= technique.energyCost*scaleLvl;
        
        //calculate base heal
        let restore;
        restore = attacker.battleCurrAtt.magicPower*attacker.battleCurrAtt.chargeBonus*technique.scalePercent;
        restore += Math.round(technique.flatDamage*scaleLvl*attacker.battleCurrAtt.chargeBonus);
     
        //check for critical
        if(cHit <= Number(attacker.battleCurrAtt.critRate)+Number(technique.critRate)) {
          str = str + '\n' + ('Critical!')
          restore = Math.round(restore * attacker.battleCurrAtt.critDamage);
        }

        target.battleCurrAtt.health += Math.round(technique.health*restore);
        target.battleCurrAtt.energy += Math.round(technique.energy*restore);

        if(technique.health*restore > 0) str = str + '\n' + Math.round(technique.health*restore).toLocaleString(undefined) + ' health restored!';
        if(technique.energy*restore > 0) str = str + '\n' + Math.round(technique.energy*restore).toLocaleString(undefined) + ' energy restored!';
        return [0,str];
      }
    }

    charge(user) {
      let boost = Math.round(user.battleMaxAtt.charge * 0.2);
      if(boost <= 0) boost = 1;

      user.battleCurrAtt.charge += boost;
      if(user.battleCurrAtt.charge > user.battleMaxAtt.charge) user.battleCurrAtt.charge = user.battleMaxAtt.charge;
      user.battleCurrAtt.setChargeBonus();
      let str = user.name.replace(/\_/g,' ') + " charges their energy."
      return [-1,str];
    }  
}

module.exports = {
  Battle : Battle
}