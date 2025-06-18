// A class that will handle combat flow and UI
// The constructor accepts references to the main data arrays so that
// modifications inside this class update the game state in zeno.js.
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder, EmbedBuilder } = require('discord.js');
const { Helpers } = require('./helpers');
const { Raid } = require('../RPG/raid.js');
const { Help } = require('../RPG/help.js');

class BattleMaster {
  constructor(options) {
    this.charList = options.charList;
    this.activeCombatList = options.activeCombatList;
    this.techList = options.techList;
    this.statusEmbed = options.statusEmbed;
    this.messageEmbed = options.messageEmbed;
    this.users = options.users;
    this.npcList = options.npcList;
    this.itemList = options.itemList;
    this.invList = options.invList;
    this.loader = options.loader;
    this.printItem = options.printItem;
    this.statEXP = options.statEXP;
    this.levelEXP = options.levelEXP;
    this.npcEXPMulti = options.npcEXPMulti;
  }

  /**
   * Sends a short battle related message to the provided channel
   * @param {Object} channel - discord.js TextBasedChannel
   * @param {string} text - message contents
   */
  battleMessage(channel, text) {
    const currEmbed = new EmbedBuilder(this.messageEmbed);
    currEmbed.setDescription(text);
    channel.send({ embeds: [currEmbed] });
  }

  /**
   * Builds an embed containing combat stats and available actions for a player
   * This replicates the old playerEmbed function from zeno.js but operates
   * using the data references passed to the BattleMaster instance.
   */
  playerEmbed(ID, placement, battleEnd, team, msg) {
    const index = ID;
    const bcheck = require('./helpers').Helpers.getCurrentBattle(
      this.charList[index].playerID,
      this.charList[index].name,
      this.activeCombatList
    );

    let char;
    const combatList = [];
    const selectTarget = new SelectMenuBuilder();
    selectTarget.setCustomId('target');
    selectTarget.setPlaceholder('Select Target');

    for (let i = 0; i < this.activeCombatList[bcheck].pCombatants.length; i++) {
      combatList.push(this.activeCombatList[bcheck].pCombatants[i]);
    }
    for (let i = 0; i < this.activeCombatList[bcheck].NPCombatants.length; i++) {
      combatList.push(this.activeCombatList[bcheck].NPCombatants[i]);
    }
    for (let i = 0; i < combatList.length; i++) {
      if (combatList[i].name === this.charList[index].name) {
        char = combatList[i];
        break;
      }
    }

    const name = char.name.replace(/\_/g, ' ');
    const embed = new EmbedBuilder(this.statusEmbed).setTitle(name);
    if (char.image === '' || char.image === null) embed.setThumbnail(msg.author.avatarURL());
    else embed.setThumbnail(char.image);

    const row1 = new ActionRowBuilder();
    const row2 = new ActionRowBuilder();
    const select = new SelectMenuBuilder();
    select.setCustomId('techs');
    select.setPlaceholder('Select Technique');
    row2.addComponents(
      new ButtonBuilder().setCustomId('strike').setLabel('Strike').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('burst').setLabel('Burst').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('charge').setLabel('Charge').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('techcharge').setLabel('Toggle Charge').setStyle(ButtonStyle.Danger)
    );

    let row3 = null;
    if (this.activeCombatList[bcheck].raid === 0) {
      row1.addComponents(select);
    } else {
      row1.addComponents(select);
      row3 = new ActionRowBuilder();
      row3.addComponents(selectTarget);
    }

    return [embed, row1, row2, row3];
  }
}
  battleTurn(battleID, msg) {
    if(this.activeCombatList[battleID].allActed() === 1) {
      this.activeCombatList[battleID].executeActions();      
      this.battleMessage(msg.channel, "Turn " + this.activeCombatList[battleID].turn + " end.")
      let playersDead = this.activeCombatList[battleID].teamDead(this.activeCombatList[battleID].pCombatants);
      let npcsDead = this.activeCombatList[battleID].teamDead(this.activeCombatList[battleID].NPCombatants);
      let playerteamoutput = "";
      for(let i = 0; i < this.activeCombatList[battleID].NPCactions.length; i++) {
        let pcOrNPC = -1;
        let z = this.activeCombatList[battleID].NPCombatants[this.activeCombatList[battleID].NPCactions[i][2]];
        if(this.activeCombatList[battleID].NPCombatants[this.activeCombatList[battleID].NPCactions[i][2]].playerID !== 'NPC' && this.activeCombatList[battleID].NPCombatants[this.activeCombatList[battleID].NPCactions[i][2]].playerID !== 'Random') {
          pcOrNPC = 1;
          z = this.charList.map(function(e) 
            { return e.playerID+e.name; }
            ).indexOf(this.activeCombatList[battleID].NPCombatants[this.activeCombatList[battleID].NPCactions[i][2]].playerID+this.activeCombatList[battleID].NPCombatants[this.activeCombatList[battleID].NPCactions[i][2]].name);
        }
        if(playersDead === 1 || npcsDead === 1) {
          this.battlePrint(pcOrNPC,z,this.activeCombatList[battleID].NPCactions[i][2],1);
        }
        else this.battlePrint(pcOrNPC,z,this.activeCombatList[battleID].NPCactions[i][2]);
        if(this.activeCombatList[battleID].NPCombatants[this.activeCombatList[battleID].NPCactions[i][2]].battleCurrAtt.health > 0) playerteamoutput += this.activeCombatList[battleID].NPCactions[i][1] + '\n\n';
      }
      if(playerteamoutput !== "") this.battleMessage(msg.channel, playerteamoutput);
      this.activeCombatList[battleID].NPCactions = new Array();
      let npcteamoutput = "";
      for(let i = 0; i < this.activeCombatList[battleID].actions.length; i++) {
        //let z = this.charList.indexOf(this.activeCombatList[battleID].pCombatants[this.activeCombatList[battleID].actions[i][2]]);
        let pcOrNPC = -1;
        let z = this.activeCombatList[battleID].pCombatants[this.activeCombatList[battleID].actions[i][2]];
        if(this.activeCombatList[battleID].pCombatants[this.activeCombatList[battleID].actions[i][2]].playerID !== 'NPC' && this.activeCombatList[battleID].pCombatants[this.activeCombatList[battleID].actions[i][2]].playerID !== 'Random') {
          pcOrNPC = 1;
          z = this.charList.map(function(e) 
            { return e.playerID+e.name; }
            ).indexOf(this.activeCombatList[battleID].pCombatants[this.activeCombatList[battleID].actions[i][2]].playerID+this.activeCombatList[battleID].pCombatants[this.activeCombatList[battleID].actions[i][2]].name);
        }
        if(playersDead === 1 || npcsDead === 1) this.battlePrint(pcOrNPC,z,this.activeCombatList[battleID].actions[i][2], 1);
        else this.battlePrint(pcOrNPC,z,this.activeCombatList[battleID].actions[i][2]);
        npcteamoutput += this.activeCombatList[battleID].actions[i][1] + '\n\n';
      }
      if(npcteamoutput !== "") this.battleMessage(msg.channel, npcteamoutput);
      this.activeCombatList[battleID].actions = new Array();

      if(playersDead === 1) {
        this.battleMessage(msg.channel, "All challengers have been defeated.");
        let exp = 0;
        let pplv = 0;
        let zeni = 0;
        for(let i = 0; i < this.activeCombatList[battleID].pCombatants.length; i++) {
          let chance = Math.round(Math.random() * 99 + 1);
          if(this.activeCombatList[battleID].deathChance != 0 && chance < this.activeCombatList[battleID].deathChance) {
            let user = Helpers.getCharList(this.activeCombatList[battleID].pCombatants[i].playerID, this.users);
            let zeni = (this.activeCombatList[battleID].pCombatants[i].level+this.activeCombatList[battleID].pCombatants[i].attributes.stotal)*15;
            user.zeni = user.zeni - zeni;
            let z = this.charList.map(function(e) { return e.playerID+e.name; }).indexOf(this.activeCombatList[battleID].pCombatants[i].playerID+this.activeCombatList[battleID].pCombatants[i].name);
            this.charList[z].rebirth();
            this.battleMessage(msg.channel, this.activeCombatList[battleID].pCombatants[i].name + " has died. They will be ressurected, but must pay " + zeni.toLocaleString(undefined)  + " zeni. No Technique Points will be retained.");
            if(user.zeni < 0) user.zeni = 0;
            this.activeCombatList[battleID].pCombatants[i].earnedEXP = 0;
          }
          else {
            zeni += 1000 + Math.round(Math.min((this.activeCombatList[battleID].pCombatants[i].battleMaxAtt.stotal+1),750)*this.activeCombatList[battleID].pCombatants[i].level/10);
            exp += (1+this.activeCombatList[battleID].pCombatants[i].battleMaxAtt.stotal)*statEXP;
            exp += (1+this.activeCombatList[battleID].pCombatants[i].level)*levelEXP;
            pplv += this.activeCombatList[battleID].pCombatants[i].level;

            let str = "";
            let texp;
            if(this.activeCombatList[battleID].pCombatants[i].party === null)  {
              texp = Math.max(1,Math.round((this.activeCombatList[battleID].expMod*exp*0.04+1)));
              //str += texp.toLocaleString(undefined)
              str += this.activeCombatList[battleID].pCombatants[i].name.replace(/\_/g,' ') + " gains " + texp.toLocaleString(undefined) + " EXP!";
              str += this.activeCombatList[battleID].pCombatants[i].addEXP(texp);
              this.activeCombatList[battleID].pCombatants[i].earnedEXP = texp;
            }
            else {
              texp = Math.max(1,Math.round((this.activeCombatList[battleID].expMod*exp*0.04+1)*this.activeCombatList[battleID].pCombatants[i].party.expMod));
              str += this.activeCombatList[battleID].pCombatants[i].name.replace(/\_/g,' ') + " gains " + texp.toLocaleString(undefined) + " EXP!";
              str += this.activeCombatList[battleID].pCombatants[i].addEXP(texp);
              this.activeCombatList[battleID].pCombatants[i].earnedEXP = texp;

              if(this.activeCombatList[battleID].pCombatants[i].party.partyList.length > 1) {
                this.activeCombatList[battleID].pCombatants[i].party.addEXP(this.charList,this.activeCombatList[battleID].pCombatants[i],texp);
                str += '\n' + this.activeCombatList[battleID].pCombatants[i].name.replace(/\_/g,' ') + "'s other party members gained " +  Math.round(texp*this.activeCombatList[battleID].pCombatants[i].party.expShare).toLocaleString(undefined) + " exp!\n"
              }
            }
            this.battleMessage(msg.channel, str);
          }

          if(this.activeCombatList[battleID].pCombatants[i].zenkaiTriggered === 1 && this.activeCombatList[battleID].deathChance > 0) {
            this.battleMessage(msg.channel, this.activeCombatList[battleID].pCombatants[i].name + " has gained a zenkai boost!");
          }
        }
        pplv = pplv/this.activeCombatList[battleID].pCombatants.length;
        for(let i = 0; i < this.activeCombatList[battleID].NPCombatants.length; i++) {
          let xp = 1+Math.round(this.activeCombatList[battleID].expMod * exp * (pplv / this.activeCombatList[battleID].NPCombatants[i].level) / 2);
          if(this.activeCombatList[battleID].NPCombatants.userID === 'NPC') xp = xp*npcEXPMulti;
          let str = "";

          if(this.activeCombatList[battleID].NPCombatants[i].playerID !== "NPC" && this.activeCombatList[battleID].NPCombatants[i].playerID !== "Random") {
            let user = Helpers.getCharList(this.activeCombatList[battleID].NPCombatants[i].playerID, this.users);
            let chance = Math.round(Math.random() * 100);
            let availableTechs = new Array();

            for(let j = 0; j < this.activeCombatList[battleID].pCombatants[i].techniques.length; j++) {
              if(this.techList[this.activeCombatList[battleID].pCombatants[i].techniques[j]].tag !== "Common" && this.techList[this.activeCombatList[battleID].pCombatants[i].techniques[j]].tag !== "Uncommon") {  }
              else availableTechs.push(this.activeCombatList[battleID].pCombatants[i].techniques[j]);
            }
            if(this.activeCombatList[battleID].pCombatants[i].transformation != -1) {
              if(this.techList[this.activeCombatList[battleID].pCombatants[i].transformation].tag !== "Common") {  }
              else availableTechs.push(this.activeCombatList[battleID].pCombatants[i].transformation);
            }

            if(this.activeCombatList[battleID].zeniRisk > 0) zeni += this.activeCombatList[battleID].zeniRisk*2;
            if(this.activeCombatList[battleID].raid !== 0) zeni *= 1.25;
            else if(this.activeCombatList[battleID].itemBox !== "None") zeni *= this.activeCombatList[battleID].expMod;
            user.zeni = Math.round(user.zeni + zeni);

            while(chance >= 60) {
              let index = Math.floor(Math.random()*availableTechs.length);
              cTech = availableTechs[index];

              let yes = user.addTag(cTech);
              if(yes === -1) {
                 chance = -1;
                 str += this.activeCombatList[battleID].NPCombatants[i].name.replace(/\_/g,' ') + ' managed to learn ';
                 str += this.techList[cTech].name.replace(/\_/g,' ') + ' from their enemies!\n';
              }
              else availableTechs.splice(index,1);

              if(availableTechs.length === 0) chance = -1;
            } 

            //battleMessage(output);
            str += this.activeCombatList[battleID].NPCombatants[i].name.replace(/\_/g,' ') + " gains " + parseInt(zeni).toLocaleString(undefined) + ' <:zeni:833538647768694794>!\n'
          }

          /*battleMessage(this.activeCombatList[battleID].NPCombatants[i].name.replace(/\_/g,' ') + " gains " + xp.toLocaleString(undefined) + " EXP!");

          let str = this.activeCombatList[battleID].NPCombatants[i].addEXP(xp);*/

          //let str = "";
          if(this.activeCombatList[battleID].NPCombatants[i].party === null)  {
            //str += xp.toLocaleString(undefined)
          }
          else {
            xp = Math.max(1,Math.round(xp*this.activeCombatList[battleID].NPCombatants[i].party.expMod));
            if(this.activeCombatList[battleID].NPCombatants[i].party.partyList.length > 1) {
              this.activeCombatList[battleID].NPCombatants[i].party.addEXP(this.charList,this.activeCombatList[battleID].NPCombatants[i],xp);
              str += '\n' + this.activeCombatList[battleID].NPCombatants[i].name.replace(/\_/g,' ') + "'s other party members gained " +  Math.round(xp*this.activeCombatList[battleID].NPCombatants[i].party.expShare).toLocaleString(undefined) + " exp!\n"
            }
          }
          str += this.activeCombatList[battleID].NPCombatants[i].name.replace(/\_/g,' ') + " gains " + xp.toLocaleString(undefined) + " EXP!";
          str += this.activeCombatList[battleID].NPCombatants[i].addEXP(xp);
          this.activeCombatList[battleID].NPCombatants[i].earnedEXP = xp;
          this.battleMessage(msg.channel, str);

          if(this.activeCombatList[battleID].NPCombatants[i].zenkaiTriggered === 1 && this.activeCombatList[battleID].deathChance > 0) {
            this.battleMessage(msg.channel, this.activeCombatList[battleID].NPCombatants[i].name + " has gained a zenkai boost!");
          }
        }
        this.endBattle(battleID, 0);
      }
      else if(npcsDead === 1) {
        this.battleMessage(msg.channel, "The challengers have defeated all defending combatants.");
        let exp = 1;
        let nplv = 0;
        let zeni = 0;
        let availableTechs = new Array();
        for(let i = 0; i < this.activeCombatList[battleID].NPCombatants.length; i++) {
          let str = "";
          zeni += Math.round(Math.min((this.activeCombatList[battleID].NPCombatants[i].battleMaxAtt.stotal+1),750)*this.activeCombatList[battleID].NPCombatants[i].level/10);
          exp += 1+this.activeCombatList[battleID].NPCombatants[i].battleMaxAtt.stotal*statEXP;
          exp += 1+this.activeCombatList[battleID].NPCombatants[i].level*levelEXP;
          nplv += this.activeCombatList[battleID].NPCombatants[i].level;

          for(let j = 0; j < this.activeCombatList[battleID].NPCombatants[i].techniques.length; j++) {
            if(this.techList[this.activeCombatList[battleID].NPCombatants[i].techniques[j]].tag !== "Common" && this.techList[this.activeCombatList[battleID].NPCombatants[i].techniques[j]].tag !== "Uncommon") {  }
            else availableTechs.push(this.activeCombatList[battleID].NPCombatants[i].techniques[j]);
          }
          if(this.activeCombatList[battleID].NPCombatants[i].transformation != -1) {
            if(this.techList[this.activeCombatList[battleID].NPCombatants[i].transformation].tag !== "Common") {  }
            else availableTechs.push(this.activeCombatList[battleID].NPCombatants[i].transformation);
          }
          
          /*let txp = Math.round(this.activeCombatList[battleID].expMod*exp*0.04+1);
          if(this.activeCombatList[battleID].NPCombatants.userID === 'NPC') txp = txp*npcEXPMulti;

          this.battleMessage(msg.channel, this.activeCombatList[battleID].NPCombatants[i].name.replace(/\_/g,' ') + " gains " + txp.toLocaleString(undefined) + " EXP!");
          let str = this.activeCombatList[battleID].NPCombatants[i].addEXP(Math.round((this.activeCombatList[battleID].expMod*exp*0.04+1)));
          if(str !== null) this.battleMessage(msg.channel, str);*/
          let texp = Math.round(this.activeCombatList[battleID].expMod*exp*0.04+1);
          if(this.activeCombatList[battleID].NPCombatants.userID === 'NPC') txp = txp*npcEXPMulti;

          if(this.activeCombatList[battleID].NPCombatants[i].party === null)  {
            //str += texp.toLocaleString(undefined)
          }
          else {
            texp = Math.max(1,texp*this.activeCombatList[battleID].NPCombatants[i].party.expMod);
            if(this.activeCombatList[battleID].NPCombatants[i].party !== null && this.activeCombatList[battleID].NPCombatants[i].party.partyList.length > 1) {
              this.activeCombatList[battleID].NPCombatants[i].party.addEXP(this.charList,this.activeCombatList[battleID].NPCombatants[i],texp);
              str += '\n' + this.activeCombatList[battleID].NPCombatants[i].name.replace(/\_/g,' ') + "'s other party members gained " +  Math.round(texp*this.activeCombatList[battleID].NPCombatants[i].party.expShare).toLocaleString(undefined) + " exp!\n"
            }
          }
          str += this.activeCombatList[battleID].NPCombatants[i].name.replace(/\_/g,' ') + " gains " + texp.toLocaleString(undefined) + " EXP!";
          str += this.activeCombatList[battleID].NPCombatants[i].addEXP(texp);
          this.activeCombatList[battleID].NPCombatants[i].earnedEXP = texp;
          this.battleMessage(msg.channel, str);
        }
        nplv = nplv/this.activeCombatList[battleID].NPCombatants.length;
        for(let i = 0; i < this.activeCombatList[battleID].pCombatants.length; i++) {
          if(this.activeCombatList[battleID].pCombatants[i] == null) {
            console.log("Null, i value: " + i);
            continue;
          }        
          let str = "";
          let xp = 1+Math.round(this.activeCombatList[battleID].expMod * exp * (nplv / this.activeCombatList[battleID].pCombatants[i].level) / 2);
          //let str = this.activeCombatList[battleID].pCombatants[i].addEXP(xp);
          let user = Helpers.getCharList(this.activeCombatList[battleID].pCombatants[i].playerID, this.users);
          let chance = Math.round(Math.random() * 100);

          if(this.activeCombatList[battleID].zeniRisk > 0) zeni += this.activeCombatList[battleID].zeniRisk*2;
          if(this.activeCombatList[battleID].itemBox !== "None") zeni *= this.activeCombatList[battleID].expMod;
          if(user !== null) user.zeni = Math.round(user.zeni + zeni);

          while(chance >= 60 && user !== null) {
            let index = Math.floor(Math.random()*availableTechs.length);
            cTech = availableTechs[index];

            let yes = user.addTag(cTech);
            if(yes === -1) {
                 chance = -1;
                 str += this.activeCombatList[battleID].pCombatants[i].name.replace(/\_/g,' ') + ' managed to learn ';
                 str += this.techList[cTech].name.replace(/\_/g,' ') + ' from their enemies!\n';
            }
            else availableTechs.splice(index,1);

            if(availableTechs.length === 0) chance = -1;
          }
          /*output += this.activeCombatList[battleID].pCombatants[i].name.replace(/\_/g,' ') + " gains " + xp.toLocaleString(undefined) + " EXP!\n " + this.activeCombatList[battleID].pCombatants[i].name.replace(/\_/g,' ') + " gains " + parseInt(zeni).toLocaleString(undefined) + ' <:zeni:833538647768694794>!'

          this.battleMessage(msg.channel, output);
          if(str !== null) this.battleMessage(msg.channel, str);*/
          str += this.activeCombatList[battleID].pCombatants[i].name.replace(/\_/g,' ') + " gains " + parseInt(zeni).toLocaleString(undefined) + ' <:zeni:833538647768694794>!\n'
          if(this.activeCombatList[battleID].pCombatants[i].party === null)  {
            //str += xp.toLocaleString(undefined)
          }
          else {
            xp = Math.round(xp*this.activeCombatList[battleID].pCombatants[i].party.expMod);
            if(this.activeCombatList[battleID].pCombatants[i].party.partyList.length > 1) {
              this.activeCombatList[battleID].pCombatants[i].party.addEXP(this.charList,this.activeCombatList[battleID].pCombatants[i],xp);
              str += '\n' + this.activeCombatList[battleID].pCombatants[i].name.replace(/\_/g,' ') + "'s other party members gained " +  Math.round(xp*this.activeCombatList[battleID].pCombatants[i].party.expShare).toLocaleString(undefined) + " exp!\n"
            }
          }
          str += this.activeCombatList[battleID].pCombatants[i].name.replace(/\_/g,' ') + " gains " + xp.toLocaleString(undefined) + " EXP!";
          str += this.activeCombatList[battleID].pCombatants[i].addEXP(xp);
          this.activeCombatList[battleID].pCombatants[i].earnedEXP = xp;
          this.battleMessage(msg.channel, str);

          if(this.activeCombatList[battleID].pCombatants[i].zenkaiTriggered === 1 && this.activeCombatList[battleID].deathChance > 0) {
            this.battleMessage(msg.channel, this.activeCombatList[battleID].pCombatants[i].name + " has gained a zenkai boost!");
          }

          if(user !== null && this.activeCombatList[battleID].itemBox !== "None") {
            let rng = Math.random() < 0.5 ? "weapon" : "dogi";
            let item = Helpers.makeItem(rng, this.activeCombatList[battleID].itemBox.toLowerCase(), this.itemList);

            if(user.itemInventory.addItem(item) === 1) {
              this.battleMessage(msg.channel, this.activeCombatList[battleID].pCombatants[i].name + " has earned an item! You have " + (user.itemInventory.maxSize - user.itemInventory.items.length) + " item slots left.");
              this.printItem(item);
              this.itemList.push(item);

              this.loader.itemSaver(this.itemList);
              this.loader.inventorySaver(this.invList);
            }
            else {
              this.battleMessage(msg.channel, this.activeCombatList[battleID].pCombatants[i].name + " has earned an item, but had no room for it!");
              this.printItem(item);
            }
          }
        }
        this.endBattle(battleID, 1);
      }
    }
    else {
      msg.channel.send("Action set.");
    }
  }

  endBattle(battleID, playerWin) {
    let danger = this.activeCombatList[battleID].deathChance;
    for(let i = 0; i < this.activeCombatList[battleID].pCombatants.length; i++) {
      this.activeCombatList[battleID].pCombatants[i].isTransformed = -1
      this.activeCombatList[battleID].pCombatants[i].scaled = -1;
      this.activeCombatList[battleID].pCombatants[i].statusUpdate(0); 

      for(let j = 0; j < this.activeCombatList[battleID].pCombatants[i].techCooldowns.length; j++) {
        this.activeCombatList[battleID].pCombatants[i].techCooldowns[j] = 0;
      }
      if(this.activeCombatList[battleID].pCombatants[i].playerID === "NPC") {
        let z = this.npcList.map(function(e) { return e.name; }).indexOf(this.activeCombatList[battleID].pCombatants[i].name);
        if(z !== -1) this.npcList[z].addEXP(this.activeCombatList[battleID].pCombatants[i].earnedEXP);
        else console.log("pCombatants: NPC save failed.")
        this.npcList[z].earnedEXP = 0;
      }
      else if(this.activeCombatList[battleID].pCombatants[i].playerID !== "Random") {
        let z = this.charList.map(function(e) { return e.playerID+e.name; }).indexOf(this.activeCombatList[battleID].pCombatants[i].playerID+this.activeCombatList[battleID].pCombatants[i].name);
        if(z !== -1) {
          this.charList[z].addEXP(this.activeCombatList[battleID].pCombatants[i].earnedEXP);
          if(danger > 0) {
            this.charList[z].zenkaiTriggered = this.activeCombatList[battleID].pCombatants[i].zenkaiTriggered;
            this.charList[z].gainZenkai();
          } 
          let index = Helpers.getCharListIndex(this.charList[z].playerID, this.users);
          if(this.users[index].tutorial === 1) {
            let str = Help.tutorial(2);
            let currEmbed = new Discord.EmbedBuilder(statusEmbed).setTitle('Tutorial: ' + this.charList[z].name.replace(/\_/g,' '));
            currEmbed.setThumbnail("https://cdn.discordapp.com/attachments/986234335051018340/988244698265161728/unknown.png")
            currEmbed.setDescription(str);
            msg.channel.send({ embeds: [currEmbed] });
          }
          if(this.activeCombatList[battleID].raid !== 0 && playerWin === 1) {
            let ui = Helpers.getCharListIndex(this.charList[z].playerID, this.users);
            let str = Raid.raidReward(this.activeCombatList[battleID].raid,this.charList[z],this.users[ui]);
            if(str !== "") {
              let currEmbed = new Discord.EmbedBuilder(statusEmbed).setTitle('Congratulations ' + this.charList[z].name.replace(/\_/g,' '));
              currEmbed.setDescription(str);
              msg.channel.send({ embeds: [currEmbed] });
            }
          }
        }
        else console.log("pCombatants: Player save failed.")
        this.charList[z].earnedEXP = 0;
      }
    }
    for(let i = 0; i < this.activeCombatList[battleID].NPCombatants.length; i++) {
      this.activeCombatList[battleID].NPCombatants[i].isTransformed = -1;
      this.activeCombatList[battleID].NPCombatants[i].scaled = -1;
      this.activeCombatList[battleID].NPCombatants[i].statusUpdate(0);

      for(let j = 0; j < this.activeCombatList[battleID].NPCombatants[i].techCooldowns.length; j++) {
        this.activeCombatList[battleID].NPCombatants[i].techCooldowns[j] = 0;
      }
      if(this.activeCombatList[battleID].NPCombatants[i].playerID === "NPC") {
        let z = this.npcList.map(function(e) { return e.name; }).indexOf(this.activeCombatList[battleID].NPCombatants[i].name);
        if(z !== -1) this.npcList[z].addEXP(this.activeCombatList[battleID].NPCombatants[i].earnedEXP);
        else console.log("NPCombatants: NPC save failed.")
        this.npcList[z].earnedEXP = 0;
      }
      else if(this.activeCombatList[battleID].NPCombatants[i].playerID !== "Random") {
        let z = this.charList.map(function(e) { return e.playerID+e.name; }).indexOf(this.activeCombatList[battleID].NPCombatants[i].playerID+this.activeCombatList[battleID].NPCombatants[i].name);
        if(z !== -1) this.charList[z].addEXP(this.activeCombatList[battleID].NPCombatants[i].earnedEXP);
        if(z !== -1 && danger > 0) {
            this.charList[z].zenkaiTriggered = this.activeCombatList[battleID].NPCombatants[i].zenkaiTriggered;
            this.charList[z].gainZenkai();
          } 
        else console.log("NPCombatants: Player save failed.")
        this.charList[z].earnedEXP = 0;
      }
    }
    this.activeCombatList.splice(battleID,1);
    this.loader.inventorySaver(this.invList);
    this.loader.characterSaver(this.charList);
    this.loader.npcSaver(this.npcList);
    this.loader.userSaver(this.users);
  }
printBattleList(battle, battleEnd, msg) {
  for(let i = 0; i < battle.NPCombatants.length; i++) {
    if(battle.NPCombatants[i].playerID === 'NPC' || battle.NPCombatants[i].playerID === 'Random') {
      this.battlePrint(-1,battle.NPCombatants[i],i,battleEnd, msg);
    }
    else {
      let z = this.charList.map(function(e) { return e.playerID+e.name; }).indexOf(battle.NPCombatants[i].playerID+battle.NPCombatants[i].name);
      //let z = this.charList.indexOf(battle.NPCombatants[i])
      this.battlePrint(1,z,i,battleEnd, msg);
    }
  }
  for(let i = 0; i < battle.pCombatants.length; i++) {
    if(battle.pCombatants[i].playerID === 'NPC' || battle.pCombatants[i].playerID === 'Random') {
      this.battlePrint(-1,battle.pCombatants[i],i,battleEnd, msg);
    }
    else {
      let z = this.charList.map(function(e) { return e.playerID+e.name; }).indexOf(battle.pCombatants[i].playerID+battle.pCombatants[i].name);
      //let z = this.charList.indexOf(battle.pCombatants[i])
      this.battlePrint(1,z,i,battleEnd, msg);
    }
  }
}


/********************
  this.battlePrint : Prints the stats of a combatant in a battle
      - pcOrNPC   : Given a value between 0, 1 and -1 which will print assuming the ID is a reference for an NPC, a player or that it's a character object respectively
      - ID        : This ID is either a reference to this.npcList/this.charList or a character object which will be used to print the relevant stats
      - Placement : The placement in the battle's character list. This is for displaying to people for targetting with skills
********************/
battlePrint(pcOrNPC, ID, placement, battleEnd, msg) {
  if(battleEnd !== 1) battleEnd = -1;

  if(pcOrNPC === 1) {
    let team = -5;
    let bcheck = Helpers.getCurrentBattle(this.charList[ID].playerID, this.charList[ID].name);
    let char;
    let combatList = new Array();
    for(let i = 0; i < this.activeCombatList[bcheck].pCombatants.length; i++) {
        combatList.push(this.activeCombatList[bcheck].pCombatants[i]);
    }
    for(let i = 0; i < this.activeCombatList[bcheck].NPCombatants.length; i++) {
      combatList.push(this.activeCombatList[bcheck].NPCombatants[i]);
    }
    for(let i = 0; i < combatList.length; i++) {
      if(combatList[i].name === this.charList[ID].name) {
        char = combatList[i];
        break;
      }
    }
    let charName = char.name;

    let combatI = this.activeCombatList[bcheck].pCombatants.map(function(e) { return e.playerID; }).indexOf(this.charList[ID].playerID);
    if(combatI === -1) {
      combatI = this.activeCombatList[bcheck].NPCombatants.map(function(e) { return e.playerID; }).indexOf(this.charList[ID].playerID);
      team = 1; //NPC team
    }
    else team = 0; //player team
    let embed = this.playerEmbed(ID,placement,battleEnd, team, msg);
    let components = new Array();
    components.push(embed[1]);
    if(embed[3] !== null) components.push(embed[3]);
    //if(embed[4] !== null) components.push(embed[4]);
    components.push(embed[2]);

    if(team === 0 && this.activeCombatList[bcheck].pCombatants[combatI].battleCurrAtt.health <= 0) {
      components = new Array()
      let newRow = new ActionRowBuilder;
      newRow.addComponents(
        new ButtonBuilder()
          .setCustomId('wait')
          .setLabel('Wait')
          .setStyle(ButtonStyle.Danger)
          );
      components.push(newRow);
    }

    if(battleEnd === 1) msg.channel.send({ embeds: [embed[0]], components: []});
    else msg.channel.send({ embeds: [embed[0]], components: components})
      .then(message => {
        const filter = (i) => {
            let z = Helpers.findID(i.user.id, this.charList, this.users)
            if(i.user.id === char.playerID && message.id === i.message.id) {
              bcheck = Helpers.getCurrentBattle(this.charList[z].playerID, this.charList[z].name);
              return true;
            }
            else return false;
        };

    const collector = msg.channel.createMessageComponentCollector({ filter, time: 1000*60*60*24, max: 1 });
    collector.on('collect', async i => { 
      ID = Helpers.findID(i.user.id, this.charList, this.users)
      if(bcheck === -1) {
        collector.stop();
        i.update({ embeds: [embed[0]], components: [] });
        return;
      }
      else if(i.customId === 'wait') {
        let index = -1;
        for(let i = 0; i < this.activeCombatList[bcheck].pCombatants.length; i++) {
              if(this.activeCombatList[bcheck].pCombatants[i].playerID+this.activeCombatList[bcheck].pCombatants[i].name === char.playerID+char.name) {
            index = i;
            break;
          }
        }

        let action = this.activeCombatList[bcheck].wait();
        action.push(index);
        action.push(-1);
        this.activeCombatList[bcheck].actions.push(action);

        collector.stop();
        i.update({ embeds: [embed[0]], components: [] });
        this.battleTurn(bcheck, msg);
      }
      else if(i.customId === 'target') {
        let index = -1;
        for(let i = 0; i < this.activeCombatList[bcheck].pCombatants.length; i++) {
              if(this.activeCombatList[bcheck].pCombatants[i].playerID+this.activeCombatList[bcheck].pCombatants[i].name === char.playerID+char.name) {
            index = i;
            break;
          }
        }
        if(index === -1) {
            for(let i = 0; i < this.activeCombatList[bcheck].NPCombatants.length; i++) {
              if(this.activeCombatList[bcheck].NPCombatants[i].playerID+this.activeCombatList[bcheck].NPCombatants[i].name === char.playerID+char.name) {
              index = i;
              break;
            }
          }
        }

        message.delete();
        this.battlePrint(pcOrNPC, ID, placement, battleEnd, msg);
        if(i.values[0].charAt(0) === "a") {
          if(team === 0) this.activeCombatList[bcheck].pCombatants[index].aTarget = i.values[0].charAt(1);
          else this.activeCombatList[bcheck].NPCombatants[index].aTarget = i.values[0].charAt(1);
          msg.channel.send("Ally Target set to " + i.values[0].charAt(1) + ".");
        }
        else {
          if(team === 0) this.activeCombatList[bcheck].pCombatants[index].eTarget = i.values[0].charAt(1);
          else this.activeCombatList[bcheck].NPCombatants[index].eTarget = i.values[0].charAt(1);
          msg.channel.send("Enemy Target set to " + i.values[0].charAt(1) + ".");
        }
      }
      else if(i.customId === 'techcharge') {
        let index = 0;
        if(team === 0) {
          for(let i = 0; i < this.activeCombatList[bcheck].pCombatants.length; i++) {
              if(this.activeCombatList[bcheck].pCombatants[i].playerID+this.activeCombatList[bcheck].pCombatants[i].name === char.playerID+char.name) {
              index = i;
              break;
            }
          }
          if(this.activeCombatList[bcheck].pCombatants[index].isCharging === 1) {
            this.activeCombatList[bcheck].pCombatants[index].isCharging = 0;
            message.delete();
            this.battlePrint(pcOrNPC, ID, placement, battleEnd, msg);
            msg.channel.send("No longer using charge to empower techniques.");
          }
          else {
            this.activeCombatList[bcheck].pCombatants[index].isCharging = 1;
            message.delete();
            this.battlePrint(pcOrNPC, ID, placement, battleEnd, msg);
            msg.channel.send("Now using charge to empower techniques.");
          }
          return;
        }
        else {
          let index = 0;
          for(let i = 0; i < this.activeCombatList[bcheck].NPCombatants.length; i++) {
              if(this.activeCombatList[bcheck].NPCombatants[i].playerID+this.activeCombatList[bcheck].NPCombatants[i].name === char.playerID+char.name) {
              index = i;
              break;
            }
          }
          if(this.activeCombatList[bcheck].NPCombatants[index].isCharging === 1) {
            this.activeCombatList[bcheck].NPCombatants[index].isCharging = 0;
            message.delete();
            this.battlePrint(pcOrNPC, ID, placement, battleEnd, msg);
            msg.channel.send("No longer using charge to empower techniques.");
          }
          else {
            this.activeCombatList[bcheck].NPCombatants[index].isCharging = 1;
            message.delete();
            this.battlePrint(pcOrNPC, ID, placement, battleEnd, msg);
            msg.channel.send("Now using charge to empower techniques.");
          }
          return;
        }
      }
      else if(i.customId === 'techs') {
        if(team === 1) {
          if(this.techList[i.values[0]].techType === "Transform") {
            let index = 0;
            for(let i = 0; i < this.activeCombatList[bcheck].NPCombatants.length; i++) {
              if(this.activeCombatList[bcheck].NPCombatants[i].playerID+this.activeCombatList[bcheck].NPCombatants[i].name === char.playerID+char.name) {
                index = i;
                break;
              }
            }
            let action = this.activeCombatList[bcheck].transform(this.activeCombatList[bcheck].NPCombatants[index]);
            action.push(index);
            action.push(-1);
            this.activeCombatList[bcheck].NPCactions.push(action);

            collector.stop();
            try {
              i.update({ embeds: [embed[0]], components: [] })
                      .then(this.battleTurn(bcheck, msg));
            } catch (error) { console.error(error); }
          }
          else {
            let index = 0;
            for(let i = 0; i < this.activeCombatList[bcheck].NPCombatants.length; i++) {
              if(this.activeCombatList[bcheck].NPCombatants[i].playerID+this.activeCombatList[bcheck].NPCombatants[i].name === char.playerID+char.name) {
                index = i;
                break;
              }
            }

            let techID = this.activeCombatList[bcheck].NPCombatants[index].techniques[i.values[0]];
            if((this.techList[techID].techType === "Strike" || this.techList[techID].techType === "Ki") &&
              this.techList[techID].transReq !== "None" && (this.activeCombatList[bcheck].NPCombatants[index].transformation === -1 
              || this.techList[this.activeCombatList[bcheck].NPCombatants[index].transformation].name.search(this.techList[techID].transReq) === -1))
            { 
              message.delete();
              this.battlePrint(pcOrNPC, ID, placement, battleEnd, msg);
              msg.channel.send("Required transformation not set.");
              return;
            }

            if((this.techList[this.activeCombatList[bcheck].NPCombatants[index].techniques[i.values[0]]].techType === "Strike" 
              || this.techList[this.activeCombatList[bcheck].NPCombatants[index].techniques[i.values[0]]].techType === "Ki"
              || this.techList[this.activeCombatList[bcheck].NPCombatants[index].techniques[i.values[0]]].techType === "Debuff") 
              && (this.activeCombatList[bcheck].NPCombatants[index].eTarget > (this.activeCombatList[bcheck].pCombatants.length-1) 
                || this.activeCombatList[bcheck].NPCombatants[index].eTarget < 0)) {
                  this.activeCombatList[bcheck].NPCombatants[index].eTarget = 0;
            }
            else if(this.activeCombatList[bcheck].NPCombatants[index].aTarget > (this.activeCombatList[bcheck].NPCombatants.length-1) || this.activeCombatList[bcheck].NPCombatants[index].aTarget < 0) {
                this.activeCombatList[bcheck].NPCombatants[index].aTarget = 0;
            }

            if((this.techList[this.activeCombatList[bcheck].NPCombatants[index].techniques[i.values[0]]].techType === "Strike" 
              || this.techList[this.activeCombatList[bcheck].NPCombatants[index].techniques[i.values[0]]].techType === "Ki"
              || this.techList[this.activeCombatList[bcheck].NPCombatants[index].techniques[i.values[0]]].techType === "Debuff") 
              && this.activeCombatList[bcheck].pCombatants[this.activeCombatList[bcheck].NPCombatants[index].eTarget].battleCurrAtt.health <= 0) {
              let npchar = this.activeCombatList[bcheck].NPCombatants[index];
              while((npchar.eTarget < 0 || npchar.eTarget > (this.activeCombatList[bcheck].pCombatants.length-1) || this.activeCombatList[bcheck].pCombatants[npchar.eTarget].battleCurrAtt.health <= 0)) {
                if(npchar.eTarget > (this.activeCombatList[bcheck].pCombatants.length-1) || npchar.eTarget < 0) npchar.eTarget = 0;
                else npchar.eTarget++;
              }
            }
            else if(this.activeCombatList[bcheck].NPCombatants[index].battleCurrAtt.health <= 0) {
              let npchar = this.activeCombatList[bcheck].NPCombatants[index];
              while((npchar.aTarget < 0 || npchar.aTarget > (this.activeCombatList[bcheck].NPCombatants.length-1) || this.activeCombatList[bcheck].NPCombatants[npchar.aTarget].battleCurrAtt.health <= 0)) {
                if(npchar.aTarget > (this.activeCombatList[bcheck].NPCombatants.length-1) || npchar.aTarget < 0) npchar.aTarget = 0;
                else npchar.aTarget++;
              }
            }

            if(this.activeCombatList[bcheck].NPCombatants[index].techCooldowns[i.values[0]] != 0) {
              message.delete();
              this.battlePrint(pcOrNPC, ID, placement, battleEnd, msg);
              msg.channel.send("Skill on cooldown.");
              return;
            }


            if(this.activeCombatList[bcheck].NPCombatants[index].battleCurrAtt.charge <= 0) this.activeCombatList[bcheck].NPCombatants[index].isCharging = 0;

            let costMod = Math.round((this.activeCombatList[bcheck].NPCombatants[index].battleCurrAtt.stotal + this.activeCombatList[bcheck].NPCombatants[index].level)/2);
            if(this.activeCombatList[bcheck].NPCombatants[index].battleCurrAtt.health <= this.techList[this.activeCombatList[bcheck].NPCombatants[index].techniques[i.values[0]]].healthCost*costMod ||
               this.activeCombatList[bcheck].NPCombatants[index].battleCurrAtt.energy < this.techList[this.activeCombatList[bcheck].NPCombatants[index].techniques[i.values[0]]].energyCost*costMod ||
               this.activeCombatList[bcheck].NPCombatants[index].battleCurrAtt.charge 
               < Math.round(this.activeCombatList[bcheck].NPCombatants[index].battleMaxAtt.charge * 0.2 * this.activeCombatList[bcheck].NPCombatants[index].isCharging * this.techList[this.activeCombatList[bcheck].NPCombatants[index].techniques[i.values[0]]].allowCharge)) {
              message.delete();
              this.battlePrint(pcOrNPC, ID, placement, battleEnd, msg);
              msg.channel.send("You don't have the resources for this technique.");
              return;
            }

            this.activeCombatList[bcheck].NPCombatants[index].techCooldowns[i.values[0]] = this.techList[this.activeCombatList[bcheck].NPCombatants[index].techniques[i.values[0]]].coolDown;
            let target;
            let targetI;
            if(this.techList[this.activeCombatList[bcheck].NPCombatants[index].techniques[i.values[0]]].techType === "Strike" 
              || this.techList[this.activeCombatList[bcheck].NPCombatants[index].techniques[i.values[0]]].techType === "Ki" 
              || this.techList[this.activeCombatList[bcheck].NPCombatants[index].techniques[i.values[0]]].techType === "Debuff") {
              targetI = this.activeCombatList[bcheck].NPCombatants[index].eTarget;
              target = this.activeCombatList[bcheck].pCombatants[targetI];
            }
            else {
              targetI = this.activeCombatList[bcheck].NPCombatants[index].aTarget;
              target = this.activeCombatList[bcheck].pCombatants[targetI];
            }

            let action = this.activeCombatList[bcheck].skill(this.activeCombatList[bcheck].NPCombatants[index],target,this.techList[this.activeCombatList[bcheck].NPCombatants[index].techniques[i.values[0]]], this.activeCombatList[bcheck].NPCombatants[index].isCharging);
            action.push(index);
            action.push(targetI);
            this.activeCombatList[bcheck].NPCactions.push(action);

            collector.stop();
            try {
              i.update({ embeds: [embed[0]], components: [] })
                      .then(this.battleTurn(bcheck, msg));
            } catch (error) { console.error(error); }
          }
        }
        else {
          if(this.techList[i.values[0]].techType === "Transform") {
            let index = 0;
            for(let i = 0; i < this.activeCombatList[bcheck].pCombatants.length; i++) {
              if(this.activeCombatList[bcheck].pCombatants[i].playerID+this.activeCombatList[bcheck].pCombatants[i].name === char.playerID+char.name) {
                index = i;
                break;
              }
            }
            let action = this.activeCombatList[bcheck].transform(this.activeCombatList[bcheck].pCombatants[index]);
            action.push(index);
            action.push(-1);
            this.activeCombatList[bcheck].actions.push(action);

            collector.stop();
            try {
              i.update({ embeds: [embed[0]], components: [] })
                      .then(this.battleTurn(bcheck, msg));
            } catch (error) { console.error(error); }
          }
          else {
            let index = 0;
            for(let i = 0; i < this.activeCombatList[bcheck].pCombatants.length; i++) {
              if(this.activeCombatList[bcheck].pCombatants[i].playerID+this.activeCombatList[bcheck].pCombatants[i].name === char.playerID+char.name) {
                index = i;
                break;
              }
            }

            let techID = this.activeCombatList[bcheck].pCombatants[index].techniques[i.values[0]];
            if((this.techList[techID].techType === "Strike" || this.techList[techID].techType === "Ki") &&
              this.techList[techID].transReq !== "None" && (this.activeCombatList[bcheck].pCombatants[index].transformation === -1 
              || this.techList[this.activeCombatList[bcheck].pCombatants[index].transformation].name.search(this.techList[techID].transReq) === -1))
            { 
              message.delete();
              this.battlePrint(pcOrNPC, ID, placement, battleEnd, msg);
              msg.channel.send("Required transformation not set.");
              return;
            }


            if((this.techList[this.activeCombatList[bcheck].pCombatants[index].techniques[i.values[0]]].techType === "Strike" 
              || this.techList[this.activeCombatList[bcheck].pCombatants[index].techniques[i.values[0]]].techType === "Ki"
              || this.techList[this.activeCombatList[bcheck].pCombatants[index].techniques[i.values[0]]].techType === "Debuff") 
              && (this.activeCombatList[bcheck].pCombatants[index].eTarget > (this.activeCombatList[bcheck].NPCombatants.length-1) 
                || this.activeCombatList[bcheck].pCombatants[index].eTarget < 0)) {
              this.activeCombatList[bcheck].pCombatants[index].eTarget = 0;
            }
            else if(this.activeCombatList[bcheck].pCombatants[index].aTarget > (this.activeCombatList[bcheck].pCombatants.length-1) || this.activeCombatList[bcheck].pCombatants[index].aTarget < 0) {
              this.activeCombatList[bcheck].pCombatants[index].aTarget = 0;
            }

            if((this.techList[this.activeCombatList[bcheck].pCombatants[index].techniques[i.values[0]]].techType === "Strike" 
              || this.techList[this.activeCombatList[bcheck].pCombatants[index].techniques[i.values[0]]].techType === "Ki"
              || this.techList[this.activeCombatList[bcheck].pCombatants[index].techniques[i.values[0]]].techType === "Debuff") 
              && this.activeCombatList[bcheck].NPCombatants[this.activeCombatList[bcheck].pCombatants[index].eTarget].battleCurrAtt.health <= 0) {
              let npchar = this.activeCombatList[bcheck].pCombatants[index];
              while((npchar.eTarget < 0 || npchar.eTarget > (this.activeCombatList[bcheck].NPCombatants.length-1) || this.activeCombatList[bcheck].NPCombatants[npchar.eTarget].battleCurrAtt.health <= 0)) {
                if(npchar.eTarget > (this.activeCombatList[bcheck].NPCombatants.length-1) || npchar.eTarget < 0) npchar.eTarget = 0;
                else npchar.eTarget++;
              }
            }
            else if(this.activeCombatList[bcheck].pCombatants[index].battleCurrAtt.health <= 0) {
              let npchar = this.activeCombatList[bcheck].pCombatants[index];
              while((npchar.aTarget < 0 || npchar.aTarget > (this.activeCombatList[bcheck].pCombatants.length-1) || this.activeCombatList[bcheck].pCombatants[npchar.aTarget].battleCurrAtt.health <= 0)) {
                if(npchar.aTarget > (this.activeCombatList[bcheck].pCombatants.length-1) || npchar.aTarget < 0) npchar.aTarget = 0;
                else npchar.aTarget++;
              }
            }

            if(this.activeCombatList[bcheck].pCombatants[index].techCooldowns[i.values[0]] != 0) {
              message.delete();
              this.battlePrint(pcOrNPC, ID, placement, battleEnd, msg);
              msg.channel.send("Skill on cooldown.");
              return;
            }


            if(this.activeCombatList[bcheck].pCombatants[index].battleCurrAtt.charge <= 0) this.activeCombatList[bcheck].pCombatants[index].isCharging = 0;

            let costMod = Math.round((this.activeCombatList[bcheck].pCombatants[index].battleCurrAtt.stotal + this.activeCombatList[bcheck].pCombatants[index].level)/2);
            if(this.activeCombatList[bcheck].pCombatants[index].battleCurrAtt.health <= this.techList[this.activeCombatList[bcheck].pCombatants[index].techniques[i.values[0]]].healthCost*costMod ||
               this.activeCombatList[bcheck].pCombatants[index].battleCurrAtt.energy < this.techList[this.activeCombatList[bcheck].pCombatants[index].techniques[i.values[0]]].energyCost*costMod ||
               this.activeCombatList[bcheck].pCombatants[index].battleCurrAtt.charge 
               < Math.round(this.activeCombatList[bcheck].pCombatants[index].battleMaxAtt.charge * 0.2 * this.activeCombatList[bcheck].pCombatants[index].isCharging * this.techList[this.activeCombatList[bcheck].pCombatants[index].techniques[i.values[0]]].allowCharge)) {
              message.delete();
              this.battlePrint(pcOrNPC, ID, placement, battleEnd, msg);
              msg.channel.send("You don't have the resources for this technique.");
              return;
            }

            this.activeCombatList[bcheck].pCombatants[index].techCooldowns[i.values[0]] = this.techList[this.activeCombatList[bcheck].pCombatants[index].techniques[i.values[0]]].coolDown;
            let target;
            let targetI;
            if(this.techList[this.activeCombatList[bcheck].pCombatants[index].techniques[i.values[0]]].techType === "Strike" 
              || this.techList[this.activeCombatList[bcheck].pCombatants[index].techniques[i.values[0]]].techType === "Ki" 
              || this.techList[this.activeCombatList[bcheck].pCombatants[index].techniques[i.values[0]]].techType === "Debuff") {
              targetI = this.activeCombatList[bcheck].pCombatants[index].eTarget;
              target = this.activeCombatList[bcheck].NPCombatants[targetI];
            }
            else {
              targetI = this.activeCombatList[bcheck].pCombatants[index].aTarget;
              target = this.activeCombatList[bcheck].pCombatants[targetI];
            }

            let action = this.activeCombatList[bcheck].skill(this.activeCombatList[bcheck].pCombatants[index],target,this.techList[this.activeCombatList[bcheck].pCombatants[index].techniques[i.values[0]]], this.activeCombatList[bcheck].pCombatants[index].isCharging);
            action.push(index);
            action.push(targetI);
            this.activeCombatList[bcheck].actions.push(action);

            collector.stop();
            try {
              i.update({ embeds: [embed[0]], components: [] })
                      .then(this.battleTurn(bcheck, msg));
            } catch (error) { console.error(error); }
          }
        }
      }
      else if(i.customId === 'strike') {
        if(team === 1) {
          let index = 0;
          for(let i = 0; i < this.activeCombatList[bcheck].NPCombatants.length; i++) {
              if(this.activeCombatList[bcheck].NPCombatants[i].playerID+this.activeCombatList[bcheck].NPCombatants[i].name === char.playerID+char.name) {
              index = i;
              break;
            }
          }
          if(this.activeCombatList[bcheck].NPCombatants[index].eTarget > (this.activeCombatList[bcheck].pCombatants.length-1) || this.activeCombatList[bcheck].NPCombatants[index].eTarget < 0) {
              this.activeCombatList[bcheck].NPCombatants[index].eTarget = 0;
          }
          if(this.activeCombatList[bcheck].pCombatants[this.activeCombatList[bcheck].NPCombatants[index].eTarget].battleCurrAtt.health <= 0) {
            let npchar = this.activeCombatList[bcheck].NPCombatants[index];
            while((npchar.eTarget < 0 || npchar.eTarget > (this.activeCombatList[bcheck].pCombatants.length-1) || this.activeCombatList[bcheck].pCombatants[npchar.eTarget].battleCurrAtt.health <= 0)) {
              if(npchar.eTarget > (this.activeCombatList[bcheck].pCombatants.length-1) || npchar.eTarget < 0) npchar.eTarget = 0;
              else npchar.eTarget++;
            }
          }

          let action = this.activeCombatList[bcheck].strike(this.activeCombatList[bcheck].NPCombatants[index],this.activeCombatList[bcheck].pCombatants[this.charList[ID].eTarget]);
          action.push(index);
          action.push(this.activeCombatList[bcheck].NPCombatants[index].eTarget);
          this.activeCombatList[bcheck].NPCactions.push(action);

          collector.stop();
            try {
              i.update({ embeds: [embed[0]], components: [] })
                      .then(this.battleTurn(bcheck, msg));
            } catch (error) { console.error(error); }
        }
        else {
          let index = 0;
          for(let i = 0; i < this.activeCombatList[bcheck].pCombatants.length; i++) {
              if(this.activeCombatList[bcheck].pCombatants[i].playerID+this.activeCombatList[bcheck].pCombatants[i].name === char.playerID+char.name) {
              index = i;
              break;
            }
          }
          if(this.activeCombatList[bcheck].pCombatants[index].eTarget > (this.activeCombatList[bcheck].NPCombatants.length-1) || this.activeCombatList[bcheck].pCombatants[index].eTarget < 0) {
              this.activeCombatList[bcheck].pCombatants[index].eTarget = 0;
          }
          if(this.activeCombatList[bcheck].NPCombatants[this.activeCombatList[bcheck].pCombatants[index].eTarget].battleCurrAtt.health <= 0) {
            let npchar = this.activeCombatList[bcheck].pCombatants[index];
            while((npchar.eTarget < 0 || npchar.eTarget > (this.activeCombatList[bcheck].NPCombatants.length-1) || this.activeCombatList[bcheck].NPCombatants[npchar.eTarget].battleCurrAtt.health <= 0)) {
              if(npchar.eTarget > (this.activeCombatList[bcheck].NPCombatants.length-1) || npchar.eTarget < 0) npchar.eTarget = 0;
              else npchar.eTarget++;
            }
          }

          let action = this.activeCombatList[bcheck].strike(this.activeCombatList[bcheck].pCombatants[index],this.activeCombatList[bcheck].NPCombatants[char.eTarget]);
          action.push(index);
          action.push(this.activeCombatList[bcheck].pCombatants[index].eTarget);
          this.activeCombatList[bcheck].actions.push(action);

          collector.stop();
          try {
            i.update({ embeds: [embed[0]], components: [] })
                    .then(this.battleTurn(bcheck, msg));
          } catch (error) { console.error(error); }
        }
      }
      else if(i.customId === 'burst') {
        if(team === 1) {
          let index = 0;
          for(let i = 0; i < this.activeCombatList[bcheck].NPCombatants.length; i++) {
              if(this.activeCombatList[bcheck].NPCombatants[i].playerID+this.activeCombatList[bcheck].NPCombatants[i].name === char.playerID+char.name) {
              index = i;
              break;
            }
          }
          if(this.activeCombatList[bcheck].NPCombatants[index].eTarget > (this.activeCombatList[bcheck].pCombatants.length-1) || this.activeCombatList[bcheck].NPCombatants[index].eTarget < 0) {
              this.activeCombatList[bcheck].NPCombatants[index].eTarget = 0;
          }
          if(this.activeCombatList[bcheck].pCombatants[this.activeCombatList[bcheck].NPCombatants[index].eTarget].battleCurrAtt.health <= 0) {
            let npchar = this.activeCombatList[bcheck].NPCombatants[index];
            while((npchar.eTarget < 0 || npchar.eTarget > (this.activeCombatList[bcheck].pCombatants.length-1) || this.activeCombatList[bcheck].pCombatants[npchar.eTarget].battleCurrAtt.health <= 0)) {
              if(npchar.eTarget > (this.activeCombatList[bcheck].pCombatants.length-1) || npchar.eTarget < 0) npchar.eTarget = 0;
              else npchar.eTarget++;
            }
          }

          let action = this.activeCombatList[bcheck].burst(this.activeCombatList[bcheck].NPCombatants[index],this.activeCombatList[bcheck].pCombatants[char.eTarget]);
          action.push(index);
          action.push(this.activeCombatList[bcheck].NPCombatants[index].eTarget);
          this.activeCombatList[bcheck].NPCactions.push(action);

          collector.stop();
          try {
            i.update({ embeds: [embed[0]], components: [] })
                    .then(this.battleTurn(bcheck, msg));
          } catch (error) { console.error(error); }
        }
        else {
          let index = 0;
          for(let i = 0; i < this.activeCombatList[bcheck].pCombatants.length; i++) {
              if(this.activeCombatList[bcheck].pCombatants[i].playerID+this.activeCombatList[bcheck].pCombatants[i].name === char.playerID+char.name) {
              index = i;
              break;
            }
          }
          if(this.activeCombatList[bcheck].pCombatants[index].eTarget > (this.activeCombatList[bcheck].NPCombatants.length-1) || this.activeCombatList[bcheck].pCombatants[index].eTarget < 0) {
              this.activeCombatList[bcheck].pCombatants[index].eTarget = 0;
          }
          if(this.activeCombatList[bcheck].NPCombatants[this.activeCombatList[bcheck].pCombatants[index].eTarget].battleCurrAtt.health <= 0) {
            let npchar = this.activeCombatList[bcheck].pCombatants[index];
            while((npchar.eTarget < 0 || npchar.eTarget > (this.activeCombatList[bcheck].NPCombatants.length-1) || this.activeCombatList[bcheck].NPCombatants[npchar.eTarget].battleCurrAtt.health <= 0)) {
              if(npchar.eTarget > (this.activeCombatList[bcheck].NPCombatants.length-1) || npchar.eTarget < 0) npchar.eTarget = 0;
              else npchar.eTarget++;
            }
          }

          let action = this.activeCombatList[bcheck].burst(this.activeCombatList[bcheck].pCombatants[index],this.activeCombatList[bcheck].NPCombatants[this.charList[ID].eTarget]);
          action.push(index);
          action.push(this.activeCombatList[bcheck].pCombatants[index].eTarget);
          this.activeCombatList[bcheck].actions.push(action);

          collector.stop();
          try {
            i.update({ embeds: [embed[0]], components: [] })
                    .then(this.battleTurn(bcheck, msg));
          } catch (error) { console.error(error); }
        }
      }
      else if(i.customId === 'charge') {
        if(team === 1) {
          let index = 0;
          for(let i = 0; i < this.activeCombatList[bcheck].NPCombatants.length; i++) {
              if(this.activeCombatList[bcheck].NPCombatants[i].playerID+this.activeCombatList[bcheck].NPCombatants[i].name === char.playerID+char.name) {
              index = i;
              break;
            }
          }
          let action = this.activeCombatList[bcheck].charge(this.activeCombatList[bcheck].NPCombatants[index],this.activeCombatList[bcheck]);
          action.push(index);
          action.push(-1);
          this.activeCombatList[bcheck].NPCactions.push(action);

          collector.stop();
          try {
            i.update({ embeds: [embed[0]], components: [] })
                    .then(this.battleTurn(bcheck, msg));
          } catch (error) { console.error(error); }
        }
        else {
          let index = 0;
          for(let i = 0; i < this.activeCombatList[bcheck].pCombatants.length; i++) {
              if(this.activeCombatList[bcheck].pCombatants[i].playerID+this.activeCombatList[bcheck].pCombatants[i].name === char.playerID+char.name) {
              index = i;
              break;
            }
          }
          let action = this.activeCombatList[bcheck].charge(this.activeCombatList[bcheck].pCombatants[index]);
          action.push(index);
          action.push(-1);
          this.activeCombatList[bcheck].actions.push(action);

          collector.stop();
          try {
            i.update({ embeds: [embed[0]], components: [] })
                    .then(this.battleTurn(bcheck, msg));
          } catch (error) { console.error(error); }
        }
      }
    });
    collector.on('end', collected => { })
    });
  }
  else {
    let char = ID;
    let name = char.name.replace(/\_/g,' ');
    if(char.isTransformed !== -1) {
        if(this.techList[char.transformation].name == "Potential_Unleashed" || this.techList[char.transformation].name.search("Saiyan") !== -1) {
          name = this.techList[char.transformation].name.replace(/\_/g,' ') + ' ' + char.name.replace(/\_/g,' ');
        }
        else name += ', ' + this.techList[char.transformation].name.replace(/\_/g,' ');
    }

    let currEmbed = new Discord.EmbedBuilder(statusEmbed).setTitle(name);
    if(char.image === '' || char.image === null) { currEmbed.setThumbnail(msg.author.avatarURL()); }
    else { currEmbed.setThumbnail(char.image); }

    let team = -5;
    let bcheck = Helpers.getCurrentBattle(char.playerID, char.name);
    let combatI = this.activeCombatList[bcheck].pCombatants.map(function(e) { return e.playerID+e.name; }).indexOf(char.playerID+char.name);
    if(combatI === -1) {
      team = 2; //NPC team
    }
    else team = 1; //player team

    if(team == 2 && this.activeCombatList[bcheck].raid !== 0) {
      currEmbed.setFooter({ text: "Focusing on " + this.activeCombatList[bcheck].pCombatants[char.threatlist[0][0]].name.replace(/\_/g,' ') });
    }
    else if(this.activeCombatList[bcheck].raid !== 0) {
      currEmbed.setFooter({ text: "Focusing on " + this.activeCombatList[bcheck].NPCombatants[char.threatlist[0][0]].name.replace(/\_/g,' ') });
    }

    let hpPercent = Math.round((char.battleCurrAtt.health/char.battleMaxAtt.health)*5);
    let energyPercent = Math.round((char.battleCurrAtt.energy/char.battleMaxAtt.energy)*5);
    let chargePercent = Math.round((char.battleCurrAtt.charge/char.battleMaxAtt.charge)*5);
    let hpStr = "";
    let engStr = "";
    let chargeStr = "";
    for(let i = 0; i < 5; i++) {
      if(i < hpPercent) {
        hpStr += "🟥";
      }
      else {
        hpStr += "⬛";
      }
      if(i < energyPercent) {
        engStr += "🟦";
      }
      else {
        engStr += "⬛";
      }
      if(i < chargePercent) {
        chargeStr += "🟨";
      }
      else {
        chargeStr += "⬛";
      }
    }
    hpStr += '\n' + char.battleCurrAtt.health.toLocaleString(undefined) + '/' + char.battleMaxAtt.health.toLocaleString(undefined);
    engStr += '\n' + char.battleCurrAtt.energy.toLocaleString(undefined) + '/' + char.battleMaxAtt.energy.toLocaleString(undefined);
    chargeStr += '\n' + char.battleCurrAtt.charge.toLocaleString(undefined) + '/' + char.battleMaxAtt.charge.toLocaleString(undefined);
    currEmbed.addFields(
      { name: 'Race', value: char.race.raceName.replace(/\_/g,' ').toLocaleString(), inline:true },
      //{ name: 'Level', value: char.level.toLocaleString(), inline: true  },
      //{ name: 'Attribute Total', value: char.battleCurrAtt.stotal.toLocaleString(), inline: true  },
      { name: 'Power Level', value: char.battleCurrAtt.scanPowerLevel(char.battleCurrAtt.charge,char.level).toLocaleString(undefined), inline: true },
      //{ name: '\u200b', value: '\u200b', inline: true  },
      { name: 'Team ' + team.toLocaleString(), value: 'Slot ' + placement.toLocaleString(), inline: true },

      { name: ':red_circle: Health', value: hpStr, inline: true },
      //{ name: '\u200b', value: '\u200b', inline: true  },
      { name: ':blue_circle: Energy', value: engStr, inline: true },
      { name: ':yellow_circle: Charge', value: chargeStr, inline: true },
    );

    if(this.activeCombatList[bcheck].raid === 0) {
      let dogiN = "None";
      let weaponN = "None";
      if(char.dogi !== null) dogiN = char.dogi.name.replace(/\_/g,' ');
      if(char.weapon !== null) weaponN = char.weapon.name.replace(/\_/g,' ');
      currEmbed.addFields(
        { name: 'Dogi', value: dogiN, inline: true  },
        { name: 'Weapon', value: weaponN, inline: true  },
        { name: 'Fighting Style', value: char.styleName.replace(/\_/g,' '), inline: true }
      );
    }

    msg.channel.send({ embeds: [currEmbed] });
  }
}
}

module.exports = {
  BattleMaster
};
