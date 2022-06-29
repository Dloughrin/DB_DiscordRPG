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
      this.turn = 0;

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
      let pCombPC = 0;
      let NPCombPC = 0;
      for(let i = 0; i < this.pCombatants.length; i++) {
        if(this.pCombatants[i].playerID !== "NPC" && this.pCombatants[i].playerID !== "Random" && this.pCombatants[i].battleCurrAtt.health > 0) pCombPC++;
      }
      for(let i = 0; i < this.NPCombatants.length; i++) {
        if(this.NPCombatants[i].playerID !== "NPC" && this.NPCombatants[i].playerID !== "Random" && this.NPCombatants[i].battleCurrAtt.health > 0 ) NPCombPC++;
      }
      for(let i = 0; i < this.actions.length; i++) {
        if(this.actions[i][0] === -5) pCombPC++;
      }
      for(let i = 0; i < this.NPCactions.length; i++) {
        if(this.NPCactions[i][0] === -5) NPCombPC++;
      }

      let deadI = 0;
      for(let i = 0; i < this.pCombatants.length; i++) {
        if(this.pCombatants[i].battleCurrAtt.health <= 0) {
          deadI++;
        }
        else if(pCombPC > this.actions.length || NPCombPC > this.NPCactions.length) {
        }
        else if(this.pCombatants[i].playerID === "NPC" || this.pCombatants[i].playerID === "Random" ) {
          /*let target = -1;
          let targets = new Array();
          for(let z = 0; z < this.NPCombatants.length; z++) {
            targets.push([z,this.NPCombatants[z].battleCurrAtt.con+this.NPCombatants[z].battleCurrAtt.eng/2+this.NPCombatants[z].battleCurrAtt.stotal/15+this.NPCombatants[z].level/20]);
          }
          targets.sort(function(a,b) {return b[1] - a[1]});
          let ind = 0;
          while(target === -1) {
            target = targets[ind][0];
            if(this.NPCombatants[target].battleCurrAtt.health <= 0) {
              target = -1;
              ind++;
            }
          }
          this.pCombatants[i].eTarget = target;

          target = -1;
          targets = new Array();
          let healerI = -1;
          let tHP = -1;
          let restoreI = -1;
          let tEP = -1;
          for(let z = 0; z < this.pCombatants.length; z++) {
            let priority = 5*this.pCombatants[z].battleMaxAtt.health/(1+this.pCombatants[z].battleCurrAtt.health) + this.pCombatants[z].battleMaxAtt.energy/(1+this.pCombatants[z].battleCurrAtt.energy);
            priority *= (this.pCombatants[z].battleCurrAtt.stotal+this.pCombatants[z].level)/2;
            if(this.pCombatants[i].personality == "Healer") { 
              if(tHP == -1 || this.pCombatants[z].battleCurrAtt.health/this.pCombatants[z].battleMaxAtt.health < tHP) {
                tHP = this.pCombatants[z].battleCurrAtt.health/this.pCombatants[z].battleMaxAtt.health;
                healerI = z;
              }
              if(tEP == -1 || this.pCombatants[z].battleCurrAtt.energy/this.pCombatants[z].battleMaxAtt.energy < tEP) {
                tEP = this.pCombatants[z].battleCurrAtt.energy/this.pCombatants[z].battleMaxAtt.energy;
                restoreI = z;
              }
            }
            if(this.pCombatants[i].name+this.pCombatants[i].playerID === this.pCombatants[z].name+this.pCombatants[z].playerID) priority = priority*0.85;
            targets.push([z,priority]);
          }
          if(this.pCombatants[i].personality == "Healer" && healerI !== -1 && tHP <= 0.75) targets[healerI] *= 50;
          else if(this.pCombatants[i].personality == "Healer" && healerI !== -1 && tEP <= 0.75) targets[restoreI] *= 50;
          targets.sort(function(a,b) {return b[1] - a[1]});
          ind = 0;
          while(target === -1) {
            target = targets[ind][0];
            if(this.pCombatants[target].battleCurrAtt.health <= 0) {
              target = -1;
              ind++;
            }
          }
          this.pCombatants[i].aTarget = target;*/

          let aiChoice = this.nAI(this.pCombatants[i].personality, this.pCombatants[i],this.NPCombatants,this.pCombatants);
          let action = aiChoice[1];
          action.push(i);
          if(aiChoice[0] === 'e') {
            action.push(this.pCombatants[i].eTarget);
          }
          else if(aiChoice[0] === 'a') {
            action.push(-3);
          }
          else {
            action.push(aiChoice[0]);
          }

          this.actions.push(action);
        }
      }
/********************************************************************************/
      let deadJ = 0;
      for(let i = 0; i < this.NPCombatants.length; i++) {
        if(this.NPCombatants[i].battleCurrAtt.health <= 0) {
          deadJ++;
        }
        else if(NPCombPC > this.NPCactions.length || pCombPC > this.actions.length) {
        }
        else if(this.NPCombatants[i].playerID === "NPC" || this.NPCombatants[i].playerID === "Random" ) {
          /*let target = -1;
          let targets = new Array();
          for(let z = 0; z < this.pCombatants.length; z++) {
            targets.push([z,this.pCombatants[z].battleCurrAtt.con+this.pCombatants[z].battleCurrAtt.eng/2+this.pCombatants[z].battleCurrAtt.stotal/15+this.pCombatants[z].level/20]);
          }
          targets.sort(function(a,b) {return b[1] - a[1]});
          let ind = 0;
          while(target === -1) {
            target = targets[ind][0];
            if(this.pCombatants[target].battleCurrAtt.health <= 0) {
              target = -1;
              ind++;
            }
          }
          this.NPCombatants[i].eTarget = target;

          target = -1;
          targets = new Array();
          let healerI = -1;
          let tHP = -1;
          let restoreI = -1;
          let tEP = -1;
          for(let z = 0; z < this.NPCombatants.length; z++) {
            let priority = 5*this.NPCombatants[z].battleMaxAtt.health/(1+this.NPCombatants[z].battleCurrAtt.health) + this.NPCombatants[z].battleMaxAtt.energy/(1+this.NPCombatants[z].battleCurrAtt.energy);
            priority *= (this.NPCombatants[z].battleCurrAtt.stotal+this.NPCombatants[z].level)/2;
            if(this.NPCombatants[i].personality == "Healer") {
              if(tHP == -1 || this.NPCombatants[z].battleCurrAtt.health/this.NPCombatants[z].battleMaxAtt.health < tHP) {
                tHP = this.NPCombatants[z].battleCurrAtt.health/this.NPCombatants[z].battleMaxAtt.health;
                healerI = z;
              }
              if(tEP == -1 || this.NPCombatants[z].battleCurrAtt.energy/this.NPCombatants[z].battleMaxAtt.energy < tEP) {
                tEP = this.NPCombatants[z].battleCurrAtt.energy/this.NPCombatants[z].battleMaxAtt.energy;
                restoreI = z;
              }
            }
            if(this.NPCombatants[i].name+this.NPCombatants[i].playerID === this.NPCombatants[z].name+this.NPCombatants[z].playerID) priority = priority*0.85;
            targets.push([z,priority]);
          }
          if(this.NPCombatants[i].personality == "Healer" && healerI !== -1 && tHP <= 0.75) targets[healerI] *= 50;
          else if(this.NPCombatants[i].personality == "Healer" && restoreI !== -1 && tEP <= 0.75) targets[restoreI] *= 50;
          targets.sort(function(a,b) {return b[1] - a[1]});
          ind = 0;
          while(target === -1) {
            target = targets[ind][0];
            if(this.NPCombatants[target].battleCurrAtt.health <= 0) {
              target = -1;
              ind++;
            }
          }
          this.NPCombatants[i].aTarget = target;*/

          let aiChoice = this.nAI(this.NPCombatants[i].personality, this.NPCombatants[i],this.pCombatants,this.NPCombatants);
          let action = aiChoice[1];
          action.push(i);
          if(aiChoice[0] === 'e') {
            action.push(this.NPCombatants[i].eTarget);
          }
          else if(aiChoice[0] === 'a') {
            action.push(-3);
          }
          else {
            action.push(aiChoice[0]);
          }

          this.NPCactions.push(action);
        }
      }
      if(this.NPCombatants.length <= (this.NPCactions.length + deadJ) && (this.pCombatants.length <= (this.actions.length + deadI))) return 1;
      else return 0;
    }

    nAI(personality, npc, enemies, party) {
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


      if(npc.battleCurrAtt.charge === npc.battleMaxAtt.charge) {
        choices[2][1] -= 5;
      }
      else if(npc.battleCurrAtt.charge < npc.battleMaxAtt.charge*0.60) {
        choices[2][1] += 3;
      }
      else if(npc.battleCurrAtt.charge < npc.battleMaxAtt.charge*0.80) {
        choices[2][1] += 1;
      }
      else choices[2][1] -= 2

      if(npc.transformation === -1 || npc.isTransformed != -1) {
        choices[3][1] -= 100;
      }
      else {
        choices[3][1] += 2*Math.round(this.techList[npc.transformation].attBonus.getTotalChange()/100);
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
        let attacks = new Array();
        let buffs = new Array();
        let debuffs = new Array();
        let heals = new Array();

        for(let i = 0; i < npc.techniques.length; i++) {
          if(npc.techCooldowns[i] !== 0)  { }
          else if(this.techList[npc.techniques[i]].techType === "Buff") {
            if(scaler*this.techList[npc.techniques[i]].energyCost <= npc.battleCurrAtt.energy &&
              scaler*this.techList[npc.techniques[i]].healthCost <= npc.battleCurrAtt.health) { buffs.push(this.techList[npc.techniques[i]]); }
          }
          else if(this.techList[npc.techniques[i]].techType === "Debuff") {
            if(scaler*this.techList[npc.techniques[i]].energyCost <= npc.battleCurrAtt.energy &&
              scaler*this.techList[npc.techniques[i]].healthCost <= npc.battleCurrAtt.health) { debuffs.push(this.techList[npc.techniques[i]]); }
          }
          else if(this.techList[npc.techniques[i]].techType === "Restoration") {
            if(scaler*this.techList[npc.techniques[i]].energyCost <= npc.battleCurrAtt.energy &&
              scaler*this.techList[npc.techniques[i]].healthCost <= npc.battleCurrAtt.health) { heals.push(this.techList[npc.techniques[i]]); }
          }
          else if(this.techList[npc.techniques[i]].techType === "Ki" || this.techList[npc.techniques[i]].techType === "Strike") {
            if(scaler*this.techList[npc.techniques[i]].energyCost <= npc.battleCurrAtt.energy &&
              scaler*this.techList[npc.techniques[i]].healthCost <= npc.battleCurrAtt.health) { attacks.push(this.techList[npc.techniques[i]]); }
          }
        }

        let topPrio = new Array();
        for(let i = 0; i < enemies.length; i++) {
          if(enemies[i].battleCurrAtt.health <= 0) continue;
          else if(npc.battleCurrAtt.charge/npc.battleMaxAtt.charge < enemies[i].battleCurrAtt.charge/enemies[i].battleMaxAtt.charge) choices[2][1] += 1;

          let threat = (enemies[i].battleCurrAtt.stotal+enemies[i].battleCurrAtt.con+enemies[i].level) / (npc.battleCurrAtt.stotal+npc.level)

          let choiceMods = new Array();
          for(let j = 0; j < choices.length; j++) choiceMods.push(choices[j]);
          let aprio = new Array();

          for(let j = 0; j < attacks.length; j++) {
            //index, priority(damage), type, target
            let dam = this.quickCalc(npc,enemies[i],attacks[j]);
            if(attacks[j].energyCost > 0) dam *= (npc.battleCurrAtt.energy-scaler*attacks[j].energyCost*0.9)/npc.battleCurrAtt.energy;
            if(attacks[j].healthCost > 0) dam *= (npc.battleCurrAtt.energy-scaler*attacks[j].healthCost*1.5)/npc.battleCurrAtt.health;
            dam *= threat;
            if(attacks[j].techType == "Ki") aprio.push([j,dam,"Ki Tech",i]);
            else aprio.push([j,this.quickCalc(npc,enemies[i],attacks[j]),"Strike Tech",i]);
          }
          let dam = this.quickCalc(npc,enemies[i],this.setBurst(npc, enemies[i]))
          dam *= threat;
          aprio.push([-1,dam,"Burst",i]);
          dam = this.quickCalc(npc,enemies[i],this.setStrike(npc, enemies[i]));
          dam *= threat;
          aprio.push([-2,dam,"Strike",i]);
          aprio.sort(function(a,b) {return b[1] - a[1]});
          aprio = aprio[0];

          let debuffprio = new Array();
          for(let j = 0; j < debuffs.length; j++) {
            //index, priority, type, target
            let change = debuffs[j].attBonus.getTotalChange()
            if(debuffs[j].energyCost > 0) change *= (npc.battleCurrAtt.energy-scaler*debuffs[j].energyCost*0.9)/npc.battleCurrAtt.energy;
            if(debuffs[j].healthCost > 0) change *= (npc.battleCurrAtt.energy-scaler*debuffs[j].healthCost*1.5)/npc.battleCurrAtt.health;
            change *= (1 - this.defenseCalc(1, enemies[i].battleCurrAtt.magicDefense));
            change *= debuffs[j].duration/5;
            change *= threat;
            debuffprio.push([j,change,"Debuff",i])
          }

          if(debuffprio.length === 0) {
            choices[7][1] -= 100;
            topPrio.push(aprio);
          }
          else {
            debuffprio.sort(function(a,b) {return b[1] - a[1]});
            debuffprio = debuffprio[0];

            if(aprio[2] === "Burst") {
              if(choiceMods[7][1] > choiceMods[1][1]) topPrio.push(debuffprio);
              else topPrio.push(aprio);
            }
            else if(aprio[2] === "Strike") {
              if(choiceMods[7][1] > choiceMods[0][1]) topPrio.push(debuffprio);
              else topPrio.push(aprio);
            }
            else if(attacks[aprio[0]].techType === "Ki") {
              if(choiceMods[7][1] > choiceMods[5][1]) topPrio.push(debuffprio);
              else topPrio.push(aprio);
            }
            else {
              if(choiceMods[7][1] > choiceMods[4][1]) topPrio.push(debuffprio);
              else topPrio.push(aprio);
            }
          }
        }

        let highestRecover = 0;
        for(let i = 0; i < party.length; i++) {
          if(party[i].battleCurrAtt.health <= 0) continue;
          if(heals.length === 0 && buffs.length === 0) {
            choices[6][1] -= 100;
            choices[8][1] -= 100;
            break;
          }

          let choiceMods = new Array();
          for(let j = 0; j < choices.length; j++) choiceMods.push(choices[j]);
          let healprio = new Array();

          for(let j = 0; j < heals.length; j++) {
            //index, priority(healing), type, target
            let heal = (npc.battleCurrAtt.magicPower+heals[j].flatDamage)*heals[j].scalePercent;
            let healmod = 1;
            if(parseInt(heals[j].health) == 1) healmod *= ((party[i].battleMaxAtt.health-party[i].battleCurrAtt.health)/party[i].battleMaxAtt.health);
            if(parseInt(heals[j].energy) == 1) healmod *= 0.7*((party[i].battleMaxAtt.energy-party[i].battleCurrAtt.energy)/party[i].battleMaxAtt.energy);
            if(healmod > highestRecover) highestRecover = healmod;
            heal *= healmod;
            if(heals[j].energyCost > 0) heal *= (npc.battleCurrAtt.energy-scaler*heals[j].energyCost*0.8)/npc.battleCurrAtt.energy;
            if(heals[j].healthCost > 0) heal *= (npc.battleCurrAtt.energy-scaler*heals[j].healthCost*1.5)/npc.battleCurrAtt.health;
            if(npc.personality !== "Support" || npc.personality !== "Healer" &&
               npc.name+npc.playerID === party[i].name+party[i].playerID) {
              heal *= 1.5;
            }
            else if(npc.name+npc.playerID === party[i].name+party[i].playerID) heal *= 0.75;
            if(heal > 0) healprio.push([j,heal,"Restoration",i]);
          }

          let buffprio = new Array();
          for(let j = 0; j < buffs.length; j++) {
            //index, priority, type, target
            let change = buffs[j].attBonus.getTotalChange();
            if(buffs[j].energyCost > 0) change *= (npc.battleCurrAtt.energy-scaler*buffs[j].energyCost*0.9)/npc.battleCurrAtt.energy;
            if(buffs[j].healthCost > 0) change *= (npc.battleCurrAtt.energy-scaler*buffs[j].healthCost*1.5)/npc.battleCurrAtt.health;
            change *= buffs[j].duration/5;
            if(npc.personality !== "Support" || npc.personality !== "Healer" &&
               npc.name+npc.playerID === party[i].name+party[i].playerID) {
              change *= 1.5;
            }
            else if(npc.name+npc.playerID === party[i].name+party[i].playerID) change *= 0.75;
            if(buffs[j].guardTarget !== 0 && npc.personality == "Tank" && npc.name+npc.playerID !== party[i].name+party[i].playerID) {
              change *= 2;
              choices[6][1] += 1;
            }
            buffprio.push([j,change,"Buff",i])
          }
          if(buffprio.length !== 0) {
            buffprio.sort(function(a,b) {return b[1] - a[1]});
            buffprio = buffprio[0];
          }
          if(healprio.length !== 0) {
            healprio.sort(function(a,b) {return b[1] - a[1]});
            healprio = healprio[0];
          }

          if(buffprio.length === 0) {
            topPrio.push(healprio);
          }
          else if(healprio === 0) {
            topPrio.push(buffprio);
          }
          else {
            if(choiceMods[6][1] > choiceMods[8][1]) topPrio.push(buffprio);
            else topPrio.push(healprio);
          }
        }
        if(highestRecover > 0) choices[8][1] += Math.floor(7*(highestRecover-0.33));
        else choices[8][1] -= 5;

        if(highestRecover < 0.15) choices[8][1] -= 2;

        choices.sort(function(a,b) {return b[1] - a[1]});
        if(choices[0][0] === "Charge" || choices[0][0] === "Transform") {
          if(choices[0][0] === "Charge") {
            return [-1, this.charge(npc)];
          }
          else if(choices[0][0] === "Transform") {
            return [-2, this.transform(npc)];
          }
        }
        else {
          let choice = null;
          topPrio.sort(function(a,b) {return b[1] - a[1]});
          for(let i = 0; i < choices.length; i++) {
            for(let j = 0; j < topPrio.length; j++) {
              let compareC = choices[i][0];
              let compareP = topPrio[j][2];
              if(compareC == "Ki Tech" || compareC == "Strike Tech" || compareC == "Strike" || compareC == "Burst") compareC = "Attack";
              if(compareP == "Ki Tech" || compareP == "Strike Tech" || compareP == "Strike" || compareP == "Burst") compareP = "Attack";
              if(compareP == compareC) {
                choice = topPrio[j];
                break;
              }
            }
            if(choice !== null) break;
          }

          if(choice[2] === "Restoration" || choice[2] === "Buff") {
            npc.aTarget = choice[3];
            if(choice[2] === "Buff") {
              return ['a', this.skill(npc, party[choice[3]], buffs[choice[0]], 0)];
            }
            else {
              return ['a', this.skill(npc, party[choice[3]], heals[choice[0]], 0)];
            }
          }
          else {
            npc.eTarget = choice[3];
            if(choice[2] === "Strike" || choice[0] == -2) {
              return ['e', this.strike(npc, enemies[choice[3]])];
            }
            else if(choice[2] === "Burst" || choice[0] == -1) {
              return ['e', this.burst(npc, enemies[choice[3]])];
            }
            else if(choice[2] === "Debuff") {
              return ['e', this.skill(npc, enemies[choice[3]], debuffs[choice[0]], 0)];
            }
            else {
              if(npc.battleCurrAtt.charge > enemies[choice[3]].battleCurrAtt.charge*0.75 && 
                npc.battleCurrAtt.charge >= npc.battleMaxAtt.charge*0.2*attacks[choice[0]].allowCharge) {
                return ['e', this.skill(npc, enemies[choice[3]], attacks[choice[0]], 1)];
              }
              else return ['e', this.skill(npc, enemies[choice[3]], attacks[choice[0]], 0)];
            }
          }
        }
      }
    }

    quickCalc(attacker, target, technique) {
      let scaleLvl = Math.round((attacker.battleCurrAtt.stotal + attacker.level)/2);
      let damage;
      if(technique.techType == 'Ki') {
        damage = 0.95*attacker.battleCurrAtt.energyAttack;
        damage += Math.round(technique.flatDamage*scaleLvl);
        damage = this.defenseCalc(damage, (1-technique.armorPen/100)*target.battleCurrAtt.eDefense);
      }
      else if(technique.techType == 'Strike') {
        damage = attacker.battleCurrAtt.physicalAttack;
        damage += Math.round(technique.flatDamage*scaleLvl);
        damage = this.defenseCalc(damage, (1-technique.armorPen/100)*target.battleCurrAtt.pDefense);
      }      
      damage *= technique.scalePercent;
      damage *= technique.hits;
      damage *= Math.min(100,((Number(attacker.battleCurrAtt.critRate)+Number(technique.critRate))/100));
      damage *= (this.dodgeCalc((1+technique.hitRate/100)*attacker.battleCurrAtt.hit,target.battleCurrAtt.dodge)/100);
      return damage;
    }

    AI(personality, npc, target, ally) {
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

      if(target.battleCurrAtt.blockRate > 50) {
        let nphys = this.defenseCalc(phys, target.battleCurrAtt.blockPower);
        let nenergy = this.defenseCalc(0.8*energy, target.battleCurrAtt.blockPower);
        if(nphys*2 < target.battleCurrAtt.health*0.1) {
          choices[0][1] -= 1;
          choices[4][1] += 1;
        }
        else choices[0][1] += 1;

        if(nenergy*3 < target.battleCurrAtt.health*0.1) {
          choices[1][1] -= 1;
          choices[5][1] += 1;
        }
        else choices[1][1] += 1;
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
        choices[6][1] += 1;
        choices[7][1] += 2;
        choices[8][1] += 2;
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
            if(ally.battleCurrAtt.stotal > npc.battleCurrAtt.stotal * 1.5) techPref[i][1] += 3;
          }
          else if(this.techList[techPref[i][0]].techType === "Debuff") {
            techPref[i][1] += Number(choices[7][1]);
          }
          else if(this.techList[techPref[i][0]].techType === "Restoration") {
            techPref[i][1] += Number(choices[8][1]);

            if(ally.battleCurrAtt.energy < ally.battleMaxAtt.energy && this.techList[techPref[i][0]].energy != 0) techPref[i][1] += Math.round(5*(ally.battleMaxAtt.energy-ally.battleCurrAtt.energy)/ally.battleMaxAtt.energy);
            else techPref[i][1] -= 4;
            if(this.techList[techPref[i][0]].energy != 0) techPref[i][1] -= 4;

            if(ally.battleCurrAtt.health < ally.battleMaxAtt.health && this.techList[techPref[i][0]].health != 0) techPref[i][1] += Math.round(8*(ally.battleMaxAtt.health-ally.battleCurrAtt.health)/ally.battleMaxAtt.health);
            else techPref[i][1] -= 4;
            if(this.techList[techPref[i][0]].health != 0) techPref[i][1] -= 4;
          }

          if(this.techList[techPref[i][0]].energyCost*scaler*2 >= npc.battleCurrAtt.energy || this.techList[techPref[i][0]].healthCost*scaler*3 >= npc.battleCurrAtt.health) {
            techPref[i][1] -= 100;
          }
          else if(this.techList[techPref[i][0]].techType === "Ki" || this.techList[techPref[i][0]].techType === "Strike") {
            if(this.techList[techPref[i][0]].techType === "Strike" && target.battleCurrAtt.blockRate >= 50 &&
              target.battleCurrAtt.health*0.1 > this.techList[techPref[i][0]].hits*this.defenseCalc(phys+this.techList[techPref[i][0]].flatDamage*scaler, target.battleCurrAtt.blockPower)) {
              techPref[i][1] -= 5;
            }
            else if(this.techList[techPref[i][0]].techType === "Ki" && target.battleCurrAtt.blockRate >= 50 &&
              target.battleCurrAtt.health*0.1 > this.techList[techPref[i][0]].hits*this.defenseCalc(energy+this.techList[techPref[i][0]].flatDamage*scaler, target.battleCurrAtt.blockPower)) {
              techPref[i][1] -= 5;
            }
            techPref[i][1] += Math.round(3*Number(this.techList[techPref[i][0]].scalePercent)/5);
            techPref[i][1] += Math.round(this.techList[techPref[i][0]].flatDamage/50);
            if(npc.race.raceName === "Majin") techPref[i][1] -= Math.round(this.techList[techPref[i][0]].energyCost/75);
            techPref[i][1] -= Math.round(this.techList[techPref[i][0]].healthCost/50);
            techPref[i][1] += Math.round(2*this.techList[techPref[i][0]].hitRate/50);
            techPref[i][1] += Math.round(3*this.techList[techPref[i][0]].critRate/50);
            techPref[i][1] += Math.round(this.techList[techPref[i][0]].armorPen/25);
            techPref[i][1] += Math.round(this.techList[techPref[i][0]].hits/2.5);
            if(this.techList[techPref[i][0]].allowCharge > 0) techPref[i][1] += 1;
          }
          else if(this.techList[techPref[i][0]].techType === "Buff" || this.techList[techPref[i][0]].techType === "Debuff") {
            techPref[i][1] -= Math.round(this.techList[techPref[i][0]].energyCost/50);
            techPref[i][1] -= Math.round(this.techList[techPref[i][0]].healthCost/25);
            if(this.techList[techPref[i][0]].techType === "Buff") {
              if(ally.name+ally.playerID === npc.name+npc.playerID) {
                techPref[i][1] -= this.techList[techPref[i][0]].guardTarget * 500;
              }
              else if(ally.guarded === -1 && npc.guarding === -1) {
                techPref[i][1] += this.techList[techPref[i][0]].guardTarget * 10;
                choices[6][1] += this.techList[techPref[i][0]].guardTarget * 10;
              }
              else if(ally.guarded !== -1 && ally.battleCurrAtt.health < ally.battleMaxAtt.health*0.5) {
                techPref[i][1] += this.techList[techPref[i][0]].guardTarget * 12;
                choices[6][1] += this.techList[techPref[i][0]].guardTarget * 12;
              }

              if(npc.battleCurrAtt.health < npc.battleMaxAtt.health*0.33) {
                techPref[i][1] -= this.techList[techPref[i][0]].guardTarget * 10;
                choices[6][1] -= this.techList[techPref[i][0]].guardTarget * 10;
              }

              techPref[i][1] += Math.round(2.5*this.techList[techPref[i][0]].attBonus.getTotalChange()/100);
            }
            else {
              techPref[i][1] += Math.round(this.techList[techPref[i][0]].attBonus.getTotalChange()/100);
            }
          }
          else if(this.techList[techPref[i][0]].techType === "Restoration") {
            techPref[i][1] += Math.round(Number(this.techList[techPref[i][0]].scalePercent)/4);
            techPref[i][1] += Math.round(this.techList[techPref[i][0]].flatDamage/40);
            if(npc.race.raceName === "Majin") techPref[i][1] -= Math.round(this.techList[techPref[i][0]].energyCost/50);
            techPref[i][1] -= Math.round(this.techList[techPref[i][0]].healthCost/50);
          }
          else {
            techPref[i][1] += Number(this.techList[techPref[i][0]].scalePercent);
            techPref[i][1] += Math.round(this.techList[techPref[i][0]].flatDamage/20);
            if(npc.race.raceName === "Majin") techPref[i][1] -= Math.round(this.techList[techPref[i][0]].energyCost/50);
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
        return ['e', this.strike(npc,target)];
      }
      else if(choice === "Burst") {
        return ['e', this.burst(npc,target)];
      }
      else if(choice === "Charge") {
        return [-1, this.charge(npc)];
      }
      else if(choice === "Transform") {
        return [-2, this.transform(npc)];
      }
      else {
        npc.techCooldowns[techPref[0][2]] = this.techList[chosenTech].coolDown;
        if(this.techList[chosenTech].techType === "Buff" || this.techList[chosenTech].techType === "Restoration") {
          return ['a', this.skill(npc, ally, this.techList[chosenTech], 0)];
        }
        else {
          if(npc.battleCurrAtt.charge > target.battleCurrAtt.charge*0.75 && npc.battleCurrAtt.charge >= npc.battleMaxAtt.charge*0.2*this.techList[chosenTech].allowCharge) return ['e', this.skill(npc, target, this.techList[chosenTech], 1)];
          else return ['e', this.skill(npc, target, this.techList[chosenTech], 0)];
        }
      }
    }

    executeActions() {
      this.turn++;
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
          else if(this.actions[i][0] === -5) {
          }
          else if(this.actions[i][3] !== -3) {
            this.pCombatants[this.actions[i][2]].statRegen();
            if(this.actions[i][3] >= this.NPCombatants.length || this.actions[i][0] === 0) { }
            else {
              if(this.NPCombatants[this.actions[i][3]].guarded === -1) this.NPCombatants[this.actions[i][3]].takeDamage(this.actions[i][0]);
              else {
                let index = this.NPCombatants.map(function(e) { return e.name+e.playerID; }).indexOf(this.NPCombatants[this.actions[i][3]].guarded);
                if(this.NPCombatants[index].battleCurrAtt.health <= 0) {
                  this.NPCombatants[this.actions[i][3]].takeDamage(this.actions[i][0]);
                  this.NPCombatants[this.actions[i][3]].guarded = -1;
                  this.NPCombatants[index].guarding = -1;
                }
                else {
                  let guardDam = Math.round(this.actions[i][0]*0.15);
                  let damReduct = Math.round(this.actions[i][0]*0.25).toLocaleString(undefined);
                  this.actions[i][0] = this.actions[i][0]*0.75;
                  this.NPCombatants[this.actions[i][3]].takeDamage(this.actions[i][0]);
                  this.NPCombatants[index].takeDamage(guardDam);
                  this.actions[i][1] = this.actions[i][1] + "\nBut " + this.pCombatants[this.actions[i][2]].name.replace(/\_/g,' ') + "'s attack has been guarded, and the damage was reduced by " + damReduct + "!"
                  this.actions[i][1] = this.actions[i][1] + "\n" + this.NPCombatants[index].name.replace(/\_/g,' ') + " takes " + guardDam.toLocaleString(undefined) + " of the damage."
                }
              }

              if(this.NPCombatants[this.actions[i][3]].battleCurrAtt.health <= 0) {
                this.actions[i][1] = this.actions[i][1] + "\n" + this.NPCombatants[this.actions[i][3]].name.replace(/\_/g,' ') + " has been defeated by ";
                this.actions[i][1] = this.actions[i][1] + this.pCombatants[this.actions[i][2]].name.replace(/\_/g,' ') + "!";
              }
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
          else if(this.NPCactions[i][0] === -5) {
          }
          else if(this.NPCactions[i][3] !== -3) {
            this.NPCombatants[this.NPCactions[i][2]].statRegen();
            if(this.NPCactions[i][3] >= this.pCombatants.length || this.NPCactions[i][0] === 0) { }
            else {
              if(this.pCombatants[this.NPCactions[i][3]].guarded === -1) this.pCombatants[this.NPCactions[i][3]].takeDamage(this.NPCactions[i][0]);
              else {
                let index = this.pCombatants.map(function(e) { return e.name+e.playerID; }).indexOf(this.pCombatants[this.NPCactions[i][3]].guarded);
                if(this.pCombatants[index].battleCurrAtt.health <= 0) {
                  this.pCombatants[this.NPCactions[i][3]].takeDamage(this.NPCactions[i][0]);
                  this.pCombatants[this.NPCactions[i][3]].guarded = -1;
                  this.pCombatants[index].guarding = -1;
                }
                else {
                  let guardDam = Math.round(this.NPCactions[i][0]*0.15);
                  let damReduct = Math.round(this.NPCactions[i][0]*0.25).toLocaleString(undefined);
                  this.NPCactions[i][0] = Math.round(this.NPCactions[i][0]*0.75);
                  this.pCombatants[this.NPCactions[i][3]].takeDamage(this.NPCactions[i][0]);
                  this.pCombatants[index].takeDamage(guardDam);
                  this.NPCactions[i][1] = this.NPCactions[i][1] + "\nBut " + this.NPCombatants[this.NPCactions[i][2]].name.replace(/\_/g,' ') + "'s attack has been guarded, and the damage was reduced by " + damReduct + "!"
                  this.NPCactions[i][1] = this.NPCactions[i][1] + "\n" + this.pCombatants[index].name.replace(/\_/g,' ') + " takes " + guardDam.toLocaleString(undefined) + " of the damage."
                }
              }

              if(this.pCombatants[this.NPCactions[i][3]].battleCurrAtt.health <= 0) {
                this.NPCactions[i][1] = this.NPCactions[i][1] + "\n" + this.pCombatants[this.NPCactions[i][3]].name.replace(/\_/g,' ') + " has been defeated by ";
                this.NPCactions[i][1] = this.NPCactions[i][1] + this.NPCombatants[this.NPCactions[i][2]].name.replace(/\_/g,' ') + "!";
              }
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
      return attack*Math.max(0.05,(Battle.defenseScalar/(Battle.defenseScalar+defense)));
    }
  
    dodgeCalc(hit, dodge) {
      return Math.min(100,(((hit/dodge) - 0.2) * 100));
    }

    wait() {
      return [-5,""];
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
      //calc hits
      let strike = this.setStrike(attacker, target);
      let out = this.skill(attacker, target, strike, 0);
      if(parseInt(out[0]) === 0) {
      }
      else if(parseInt(out[0]) < target.battleMaxAtt.health*0.08 && attacker.battleCurrAtt.str > attacker.battleCurrAtt.sol) {
        out[0] = Math.round(target.battleMaxAtt.health*0.08);
        out[1] += '\nBut ' + attacker.name.replace(/\_/g,' ') + "'s attack powered through and dealt " + out[0].toLocaleString(undefined) + " instead!";
      }

      //str = str + '\n' + (attacker.name.replace(/\_/g,' ') + " used a burst and dealt " + out[0].toLocaleString(undefined) + ' damage in ' + s + ' hits to ' + target.name.replace(/\_/g,' ') + '!');
      return out;
    }

    burst(attacker, target) {
      //calc hits
      let burst = this.setBurst(attacker, target);
      let out = this.skill(attacker, target, burst, 0);
      if(parseInt(out[0]) === 0) {
      }
      else if(parseInt(out[0]) < target.battleMaxAtt.health*0.08 && attacker.battleCurrAtt.str < attacker.battleCurrAtt.sol) {
        out[0] = Math.round(target.battleMaxAtt.health*0.08);
        out[1] += '\nBut ' + attacker.name.replace(/\_/g,' ')  + "'s attack powered through and dealt " + out[0].toLocaleString(undefined) + " instead!";
      }

      //str = str + '\n' + (attacker.name.replace(/\_/g,' ') + " used a burst and dealt " + out[0].toLocaleString(undefined) + ' damage in ' + s + ' hits to ' + target.name.replace(/\_/g,' ') + '!');
      return out;
    }
  
    skill(attacker, target, technique, charge) {
      if(technique.coolDown !== 0) {
        for(let i = 0; i < attacker.techniques.length; i++) {
          if(this.techList[attacker.techniques[i]].name === technique.name) {
            attacker.techCooldowns[i] = technique.coolDown;
          }
        }
      }
      if(technique.aoe !== 0) {
        let npc = 0;
        for(let i = 0; i < this.pCombatants.length; i++) {
          if(this.pCombatants[i].name+this.pCombatants[i].playerID === target.name+target.playerID) {
            npc = 1;
            target = this.pCombatants;
            break;
          }
        }
        if(npc === 0) target = this.NPCombatants;
        return aoeSkill(attacker,target,technique,charge);
      }
      else if(technique.techType == 'Ki' || technique.techType == 'Strike') {
        let str = '';
        let chargeBoost = charge;
        let cHit = Math.round(Math.random() * 100) + 1;
        let hit = Math.round(Math.random() * 100) + 1;
        let block = Math.round(Math.random() * 100) + 1;
        let damR = Math.random() * 0.2 + 0.9;
        let scaleLvl = Math.round((attacker.battleCurrAtt.stotal + attacker.level)/2);
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
          damage = 0.95*attacker.battleCurrAtt.energyAttack*attacker.battleCurrAtt.chargeBonus;
          damage += Math.round(technique.flatDamage*scaleLvl);
          damage = this.defenseCalc(damage, (1-technique.armorPen/100)*target.battleCurrAtt.eDefense*target.battleCurrAtt.chargeBonus);
        }
        else if(technique.techType == 'Strike') {
          damage = attacker.battleCurrAtt.physicalAttack*attacker.battleCurrAtt.chargeBonus;
          damage += Math.round(technique.flatDamage*scaleLvl);
          damage = this.defenseCalc(damage, (1-technique.armorPen/100)*target.battleCurrAtt.pDefense*target.battleCurrAtt.chargeBonus);
        }      
        damage *= technique.scalePercent;
        damage *= damR;
        if(chargeBoost != 0) damage *= chargeBoost;

        let s = technique.hits;
        damage *= s;
        
        if(block <= (target.battleCurrAtt.blockRate)) {
          str = str + '\n' + target.name.replace(/\_/g,' ') + ' blocked!';
          let blockPow = target.battleCurrAtt.blockPower/Battle.blockModifier;
          damage = this.defenseCalc(damage,(1-technique.armorPen/100)*blockPow);
        }

        //check for critical
        if(cHit <= Number(attacker.battleCurrAtt.critRate)+Number(technique.critRate)) {
          str = str + '\n' + ('Critical!')
          damage = damage * attacker.battleCurrAtt.critDamage;
        }
        
        //clean up and msg.channel.send
        damage = Math.round(damage);
        if(damage < 0) damage = 0;
        str = str + '\n' + damage.toLocaleString(undefined) + ' damage taken in ' + s + ' hits to ' + target.name.replace(/\_/g,' ') + '!';
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
        if(technique.guardTarget !== 0) {
          if(target.name+target.playerID === attacker.name+attacker.playerID) {
            str = str + "\n" + attacker.name.replace(/\_/g,' ') + " can't guard themselves!";
          }
          else if(target.name+target.playerID === attacker.guarding) {
            str = str + "\n" + attacker.name.replace(/\_/g,' ') + " is no longer guarding " + target.name.replace(/\_/g,' ') + "!";
            attacker.guarding = -1;
            target.guarded = -1;
          }
          else {
            let index = this.NPCombatants.map(function(e) { return e.guarded; }).indexOf(attacker.name+attacker.playerID);
            if(index !== -1) {
              str = str + "\n" + attacker.name.replace(/\_/g,' ') + " is no longer guarding " + this.NPCombatants[index].name.replace(/\_/g,' ') + "!";
              this.NPCombatants[index].guarded = -1;
            }
            else index = this.pCombatants.map(function(e) { return e.guarded; }).indexOf(attacker.name+attacker.playerID);

            if(index !== -1) {
              str = str + "\n" + attacker.name.replace(/\_/g,' ') + " is no longer guarding " + this.pCombatants[index].name.replace(/\_/g,' ') + "!";
              this.pCombatants[index].guarded = -1;
            }

            str = str + "\n" + attacker.name.replace(/\_/g,' ') + " guards " + target.name.replace(/\_/g,' ') + "!";
            attacker.guarding = target.name+target.playerID;
            target.guarded = attacker.name+attacker.playerID;

          }
        }
        
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
        let calcResist = this.defenseCalc(1, target.battleCurrAtt.magicDefense*target.battleCurrAtt.chargeBonus);

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
        calcResist = (1 - calcResist) * 100;
        if(resist >= calcResist) {
          str = str + '\n' + attacker.name.replace(/\_/g,' ') + "'s technique was resisted by " + target.name.replace(/\_/g,' ') + "!";
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
        restore = attacker.battleCurrAtt.magicPower+technique.flatDamage*scaleLvl;
        restore *= attacker.battleCurrAtt.chargeBonus*technique.scalePercent;
     
        //check for critical
        if(cHit <= Number(attacker.battleCurrAtt.critRate)+Number(technique.critRate)) {
          str = str + '\n' + ('Critical!')
          restore = Math.round(restore * attacker.battleCurrAtt.critDamage);
        }

        //todo: new variable hpRestore/epRestore to apply on regen instead?
        target.battleCurrAtt.health += Math.round(technique.health*restore);
        target.battleCurrAtt.energy += Math.round(technique.energy*restore);
        target.battleCurrAtt.health = Math.min(target.battleCurrAtt.health,target.battleMaxAtt.health);
        target.battleCurrAtt.energy = Math.min(target.battleCurrAtt.energy,target.battleMaxAtt.energy);

        if(technique.health*restore > 0) str = str + '\n' + Math.round(technique.health*restore).toLocaleString(undefined) + ' health restored!';
        if(technique.energy*restore > 0) str = str + '\n' + Math.round(technique.energy*restore).toLocaleString(undefined) + ' energy restored!';
        return [0,str];
      }
    }

    aoeSkill(attacker, targetTeam, technique, charge) {
      if(technique.techType == 'Buff') {
        let str = '';
        let scaleLvl = Math.round((attacker.battleCurrAtt.stotal + attacker.level)/2);

        if(attacker.battleCurrAtt.health < technique.healthCost*scaleLvl || attacker.battleCurrAtt.energy < technique.energyCost*scaleLvl) {
          str = attacker.name.replace(/\_/g,' ') + ' can no longer use ' + technique.name.replace(/\_/g,' ') + '!';
          return [0,str];
        }

        str = str + (attacker.name.replace(/\_/g,' ') + ' uses ' + technique.name.replace(/\_/g,' ') + 'on their team!');
        
        attacker.battleCurrAtt.health -= technique.healthCost*scaleLvl;
        attacker.battleCurrAtt.energy -= technique.energyCost*scaleLvl;


        str = str + '\n' + technique.attBonus.outputBonusStr();
        for(let i = 0; i < targetTeam.length; i++) {
          if(technique.duration !== null) targetTeam[i].addBuff(technique.attBonus, technique.duration);
          else targetTeam[i].addBuff(technique.attBonus, -1);
        }
        return [0,str];
      }
      else if(technique.techType == 'Debuff') {
        let str = '';
        let hit = Math.round(Math.random() * 100) + 1;
        let resist = Math.round(Math.random() * 100) + 1;
        let scaleLvl = Math.round((attacker.battleCurrAtt.stotal + attacker.level)/2);
        let calcResist;

        if(attacker.battleCurrAtt.health < technique.healthCost*scaleLvl || attacker.battleCurrAtt.energy < technique.energyCost*scaleLvl) {
          str = attacker.name.replace(/\_/g,' ') + ' can no longer use ' + technique.name.replace(/\_/g,' ') + '!';
          return [0,str];
        }

        str = str + (attacker.name.replace(/\_/g,' ') + ' uses ' + technique.name.replace(/\_/g,' ') + '!');
        
        attacker.battleCurrAtt.health -= technique.healthCost*scaleLvl;
        attacker.battleCurrAtt.energy -= technique.energyCost*scaleLvl;  


        for(let i = 0; i < targetTeam.length; i++) {
          calcResist = this.defenseCalc(attacker.level, attacker.battleCurrAtt.stotal, targetTeam[i].battleCurrAtt.magicDefense*targetTeam[i].battleCurrAtt.chargeBonus);
          //check for resist, return 0
          calcResist = (1 - calcResist[0]) * 100;
          if(resist >= calcResist) {
            str = str + '\n' + attacker.name.replace(/\_/g,' ') + "'s technique was resisted by " + targetTeam[i].name.replace(/\_/g,' ') + "!";
          }
          else if(technique.duration !== null) targetTeam[i].addBuff(technique.attBonus, technique.duration);
          else targetTeam[i].addBuff(technique.attBonus, -1);
        }
        str = str + '\n' + technique.attBonus.outputBonusStr();
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

        str = str + (attacker.name.replace(/\_/g,' ') + ' uses ' + technique.name.replace(/\_/g,' ') + '!');
        
        attacker.battleCurrAtt.health -= technique.healthCost*scaleLvl;
        attacker.battleCurrAtt.energy -= technique.energyCost*scaleLvl;
        
        //calculate base heal
        let restore;
        restore = attacker.battleCurrAtt.magicPower*attacker.battleCurrAtt.chargeBonus*technique.scalePercent;
        restore += Math.round(technique.flatDamage*scaleLvl*attacker.battleCurrAtt.chargeBonus);

        for(let i = 0; i < targetTeam.length; i++) {
          //todo: new variable hpRestore/epRestore to apply on regen instead?
          targetTeam[i].battleCurrAtt.health += Math.round(technique.health*restore);
          targetTeam[i].battleCurrAtt.energy += Math.round(technique.energy*restore);
          targetTeam[i].battleCurrAtt.health = Math.min(targetTeam[i].battleCurrAtt.health,targetTeam[i].battleMaxAtt.health);
          targetTeam[i].battleCurrAtt.energy = Math.min(targetTeam[i].battleCurrAtt.energy,targetTeam[i].battleMaxAtt.energy);

          if(technique.health*restore > 0) str = str + '\n' + Math.round(technique.health*restore).toLocaleString(undefined) + ' health restored to ' + targetTeam[i].name.replace(/\_/g,' ') + '!';
          if(technique.energy*restore > 0) str = str + '\n' + Math.round(technique.energy*restore).toLocaleString(undefined) + ' energy restored to ' + targetTeam[i].name.replace(/\_/g,' ') + '!';
        }

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

    setBurst(attacker, target) { 
      let s;
      let burst;

      //staff weapons
      if(attacker.weapon !== null && (attacker.weapon.name.toLowerCase().search("staff") !== -1 || attacker.weapon.name.toLowerCase().search("stave") !== -1 || attacker.weapon.name.toLowerCase().search("cane") !== -1)) { 
        s = Math.round((1.3 * attacker.battleCurrAtt.speed * attacker.battleCurrAtt.chargeBonus) / (0.9 * target.battleCurrAtt.speed * target.battleCurrAtt.chargeBonus));
        if(s < 2) s = 2;
        burst = new Technique(-1, "Ki Beam", "Ki", 0, 0, 20, 1, s);
        burst.hitRate = 0.1;
        burst.armorPen = 0.35;
        burst.critRate = 0.05;
      } //rod weapons
      else if(attacker.weapon !== null && (attacker.weapon.name.toLowerCase().search("rod") !== -1 || attacker.weapon.name.toLowerCase().search("wand") !== -1 || attacker.weapon.name.toLowerCase().search("scepter") !== -1)) {
        s = Math.round((1.35 * attacker.battleCurrAtt.speed * attacker.battleCurrAtt.chargeBonus) / (0.9 * target.battleCurrAtt.speed * target.battleCurrAtt.chargeBonus));
        if(s < 2) s = 2;
        burst = new Technique(-1, "Ki Ray", "Ki", 0, 0, 60, 0.8, s);
        burst.hitRate = 0.15;
        burst.armorPen = 0.25;
        burst.critRate = 0.1;
      }//firearm weapons
      else if(attacker.weapon !== null && attacker.weapon.name.toLowerCase().search("gun") !== -1) {
        s = Math.round((1.55 * attacker.battleCurrAtt.speed * attacker.battleCurrAtt.chargeBonus) / (0.85 * target.battleCurrAtt.speed * target.battleCurrAtt.chargeBonus));
        if(s < 3) s = 3;
        burst = new Technique(-1, "Ki Shot", "Ki", 0, 0, 75, 0.5, s);
        burst.hitRate = 0.25;
        burst.armorPen = 0.25;
        burst.critRate = 0.1;
      }//ki focus weapons
      else if(attacker.weapon !== null && (attacker.weapon.name.toLowerCase().search("focus") !== -1 || attacker.weapon.name.toLowerCase().search("orb") !== -1)) {
        s = Math.round((1.2 * attacker.battleCurrAtt.speed * attacker.battleCurrAtt.chargeBonus) / (target.battleCurrAtt.speed * target.battleCurrAtt.chargeBonus));
        if(s < 1) s = 1;
        burst = new Technique(-1, "Ki Ball", "Ki", 0, 0, 5, 3, s);
        burst.armorPen = 0.05;
        burst.critRate = 0.05;
      }//weapons without a category
      else {
        s = Math.round((1.45 * attacker.battleCurrAtt.speed * attacker.battleCurrAtt.chargeBonus) / (0.9 * target.battleCurrAtt.speed * target.battleCurrAtt.chargeBonus));
        if(s < 3) s = 3;
        burst = new Technique(-1, "Ki Burst", "Ki", 0, 0, 30, 0.7, s);
        burst.hitRate = 0.2;
        burst.armorPen = 0.15;
        burst.critRate = 0.05;
      }

      return burst;
    }

    setStrike(attacker, target) {
      let s;
      let strike;

      //Quick blades (Katana/dagger)
      if(attacker.weapon !== null && (attacker.weapon.name.toLowerCase().search("katana") !== -1 || attacker.weapon.name.toLowerCase().search("dagger") !== -1 || attacker.weapon.name.toLowerCase().search("longsword") !== -1 || attacker.weapon.name.toLowerCase().search("shortsword") !== -1)) { 
        let s = Math.round((1.6 * attacker.battleCurrAtt.speed * attacker.battleCurrAtt.chargeBonus) / (0.85 * target.battleCurrAtt.speed * target.battleCurrAtt.chargeBonus));
        if(s < 1) s = 1;
        strike = new Technique(-1, "Blade Rush", "Strike", 0, 0, 15, 0.9, s);
        strike.hitRate = 0.15;
        strike.armorPen = 0.10;
        strike.critRate = 0.05;
      } //Heavy blades (Greatswords/Axes)
      else if(attacker.weapon !== null && (attacker.weapon.name.toLowerCase().search("greatsword") !== -1 || attacker.weapon.name.toLowerCase().search("axe") !== -1 || attacker.weapon.name.toLowerCase().search("scepter") !== -1)) {
        let s = Math.round((0.85 * attacker.battleCurrAtt.speed * attacker.battleCurrAtt.chargeBonus) / (target.battleCurrAtt.speed * target.battleCurrAtt.chargeBonus));
        if(s < 1) s = 1;
        strike = new Technique(-1, "Blade Crush", "Strike", 0, 0, 40, 2, s);
        strike.hitRate = -0.15;
        strike.armorPen = 0.25;
        strike.critRate = -0.1;
      } //Firearms
      else if(attacker.weapon !== null && attacker.weapon.name.toLowerCase().search("gun") !== -1) {
        let s = Math.round((1.15 * attacker.battleCurrAtt.speed * attacker.battleCurrAtt.chargeBonus) / (target.battleCurrAtt.speed * target.battleCurrAtt.chargeBonus));
        if(s < 1) s = 1;
        strike = new Technique(-1, "Buttstroke", "Strike", 0, 0, 60, 1.3, s);
        strike.armorPen = 0.25;
      } //Polearms
      else if(attacker.weapon !== null && (attacker.weapon.name.toLowerCase().search("polearm") !== -1 || attacker.weapon.name.toLowerCase().search("cane") !== -1 || attacker.weapon.name.toLowerCase().search("staff") !== -1 || attacker.weapon.name.toLowerCase().search("stave") !== -1)) {
        let s = Math.round((1.35 * attacker.battleCurrAtt.speed * attacker.battleCurrAtt.chargeBonus) / (target.battleCurrAtt.speed * target.battleCurrAtt.chargeBonus));
        if(s < 4) s = 4;
        strike = new Technique(-1, "Thrust Flurry", "Strike", 0, 0, 5, 0.5, s);
        strike.hitRate = 0.05;
        strike.armorPen = 0.05;
      } //Wands/Focus (kicking)
      else if(attacker.weapon !== null && (attacker.weapon.name.toLowerCase().search("focus") !== -1 || attacker.weapon.name.toLowerCase().search("orb") !== -1 || attacker.weapon.name.toLowerCase().search("rod") !== -1 || attacker.weapon.name.toLowerCase().search("wand") !== -1 || attacker.weapon.name.toLowerCase().search("scepter") !== -1)) {
        let s = Math.round((1.15 * attacker.battleCurrAtt.speed * attacker.battleCurrAtt.chargeBonus) / (0.8 * target.battleCurrAtt.speed * target.battleCurrAtt.chargeBonus));
        if(s < 2) s = 2;
        strike = new Technique(-1, "Kicking Flurry", "Strike", 0, 0, 70, 0.6, s);
        strike.hitRate = 0.15;
        strike.armorPen = 0;
        strike.critRate = 0.05;
      } //No category (Punching)
      else {
        let s = Math.round((1.45 * attacker.battleCurrAtt.speed * attacker.battleCurrAtt.chargeBonus) / (0.9 * target.battleCurrAtt.speed * target.battleCurrAtt.chargeBonus));
        if(s < 2) s = 2;
        strike = new Technique(-1, "Strike Rush", "Strike", 0, 0, 15, 0.8, s);
        strike.hitRate = 0.15;
        strike.armorPen = 0.15;
        strike.critRate = 0.05;
      }

      return strike;
    }

    calcTech(attacker, target, technique) {
      let damage;
      let scaleLvl = Math.round((attacker.battleCurrAtt.stotal + attacker.level)/2);
      if(technique.techType == 'Ki') {
        damage = 0.95*attacker.battleCurrAtt.energyAttack;
        damage += Math.round(technique.flatDamage*scaleLvl);
        damage = this.defenseCalc(damage, (1-technique.armorPen/100)*target.battleCurrAtt.eDefense*target.battleCurrAtt.chargeBonus);
      }
      else if(technique.techType == 'Strike') {
        damage = attacker.battleCurrAtt.physicalAttack;
        damage += Math.round(technique.flatDamage*scaleLvl);
        damage = this.defenseCalc(damage, (1-technique.armorPen/100)*target.battleCurrAtt.pDefense*target.battleCurrAtt.chargeBonus);
      }      
      else if(technique.techType == 'Restoration') {
        damage = attacker.battleCurrAtt.magicPower;
        damage += Math.round(technique.flatDamage*scaleLvl);
      }     
      damage *= attacker.battleCurrAtt.chargeBonus;
      damage *= technique.scalePercent;
      if(technique.techType !== 'Restoration') damage *= technique.hits;

      let cdamage = damage * attacker.battleCurrAtt.critDamage;

      let blockPow = target.battleCurrAtt.blockPower/Battle.blockModifier;
      let bdamage = this.defenseCalc(damage,(1-technique.armorPen/100)*blockPow);

      let critRate = Number(attacker.battleCurrAtt.critRate)+Number(technique.critRate);
      let hitRate = this.dodgeCalc((1+technique.hitRate/100)*attacker.battleCurrAtt.hit*attacker.battleCurrAtt.chargeBonus, target.battleCurrAtt.dodge*target.battleCurrAtt.chargeBonus);

      return [technique.name, damage, cdamage, bdamage, technique.hits, hitRate, critRate];
    }

    calcBurst(attacker, target) {
      let burst = this.setBurst(attacker, target);
      let out = this.calcTech(attacker, target, burst);
      return out;
    }

    calcStrike(attacker, target) {
      let strike = this.setStrike(attacker, target);
      let out = this.calcTech(attacker, target, strike);
      return out;
    }
}

module.exports = {
  Battle : Battle
}