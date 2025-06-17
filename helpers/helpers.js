// helpers.js
// A class that will contain static helper methods for use throughout the program

class Helpers {
  static trainingModifier = 1.25;
  static trainingSoftCap = 2500

  /**
   * Checks if a string is a valid image URL by testing for common image extensions
   * @param {string} link - The URL to check
   * @return {boolean} - True if the URL ends with a common image extension
   */
  static isImage(link) {
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(link);
  }
  
  /**
   * Generates a new equipment item based on type and quality.
   * @param {string} type - The category of item to generate (e.g., "weapon" or "dogi").
   * @param {string} quality - The item's rarity level ("standard", "epic", "legendary", "mythic", or "divine").
   * @param {Array} itemList - The current list of all existing items, used to determine the next unique ID.
   * @returns {Object} - A newly created Equipment object with a unique ID and name based on the specified parameters.
   * @description Use-case: Dynamically creates a new item for the player with a unique identifier and generated name. 
   * This function ensures no UID conflicts by finding the highest existing UID and incrementing from it. Used when awarding, crafting, or spawning new items.
   */
  static makeItem(type, quality, itemList) {
    let item;
    let items = new Array();

    for(let i = 0; i < itemList.length; i++) { items.push(itemList[i]); }
    items.sort(function(a,b) {return b.uid - a.uid});
    let max = parseInt(items[0].uid);

    if(type === "weapon") {
      if(quality === "standard") {
        let i = 1;
        i = i + max;
        item = new Equipment(i,nameGenerator.generateWeapon(),"Weapon")
      }
      else if(quality === "epic") {
        let i = 1;
        i = i + max;
        item = new Equipment(i,nameGenerator.generateEpicWeapon(),"Weapon")
      }
      else if(quality === "legendary") {
        let i = 1;
        i = i + max;
        item = new Equipment(i,nameGenerator.generateLegendaryWeapon(),"Weapon")
      }
      else if(quality === "mythic") {
        let i = 1;
        i = i + max;
        item = new Equipment(i,nameGenerator.generateMythicWeapon(),"Weapon")
      }
      else if(quality === "divine") {
        let i = 1;
        i = i + max;
        item = new Equipment(i,nameGenerator.generateDivineWeapon(),"Weapon")
      }
    }
    else if(type === "dogi") {
      if(quality === "standard") {
        let i = 1;
        i = i + max;
        item = new Equipment(i,nameGenerator.generateArmor(),"Dogi")
      }
      else if(quality === "epic") {
        let i = 1;
        i = i + max;
        item = new Equipment(i,nameGenerator.generateEpicDogi(),"Dogi")
      }
      else if(quality === "legendary") {
        let i = 1;
        i = i + max;
        item = new Equipment(i,nameGenerator.generateLegendaryDogi(),"Dogi")
      }
      else if(quality === "mythic") {
        let i = 1;
        i = i + max;
        item = new Equipment(i,nameGenerator.generateMythicDogi(),"Dogi")
      }
      else if(quality === "divine") {
        let i = 1;
        i = i + max;
        item = new Equipment(i,nameGenerator.generateDivineDogi(),"Dogi")
      }
    }
    return item;
  }

  /**
   * Finds a character by player ID
   * @param {string} ID - The player ID to search for
   * @return {number} - The index of the character in charList, or -1 if not found
   */
  static findID(ID, charList, users) {
    ID = ID.replace("<","");
    ID = ID.replace("@","");
    ID = ID.replace(">","");
    let index = -1;
    index = this.getCharListIndex(ID, users);
    if(index === null) return -1;
    else index = users[index].getCurrentChar();
    return index;
  }

  /**
   * Gets a user object by ID
   * @param {string} ID - The user ID to search for
   * @return {Object|null} - The user object or null if not found
   */
  static getCharList(ID, users) {
    ID = ID.replace("<","");
    ID = ID.replace("@","");
    ID = ID.replace(">","");
    if(isNaN(ID)) return null;
    for(let i = 0; i < users.length; i++) {
      if(ID === users[i].userID) {
        return users[i];
      }
    }

    if(ID !== 'NPC' && ID !== 'Random') console.log('No characters associated with that ID.');
    return null;
  }

  /**
   * Gets the index of a user in the users array by ID
   * @param {string} ID - The user ID to search for
   * @return {number|null} - The index in the users array or null if not found
   */
  static getCharListIndex(ID, users) {
    ID = ID.replace("<","");
    ID = ID.replace("@","");
    ID = ID.replace(">","");
    if(isNaN(ID)) return null;
    for(let i = 0; i < users.length; i++) {
      if(ID === users[i].userID) {
        return i;
      }
    }

    if(ID !== 'NPC' && ID !== 'Random') console.log('No characters associated with that ID.');
    return null;
  }

  /**
   * Finds an NPC by name
   * @param {string} ID - The NPC name to search for
   * @return {number} - The index of the NPC in npcList, or -1 if not found
   */
  static findNPCID(ID, npcList) {
    let index = -1;
    for(let i = 0; i < npcList.length; i++) {
      if(ID.toLowerCase() === npcList[i].name.toLowerCase()) {
        index = i;
        break;
      }
    }
    if(index === -1) {
      if(ID !== 'NPC' && ID !== 'Random') console.log('No NPC associated with that name.');
    }
    return index;
  }

  /**
   * Calculates the cost of training for XP
   * @param {Object} user - The user object
   * @param {number} time - The training time in hours
   * @return {number} - The calculated cost
   */
  static calcXPTrainingCost(user, time) { 
    //tp cost
    let cost = Math.round(time*15*(1-(time-1)/100));
    if(user.dojo !== null) {
      cost *= 0.9;
    }
    return Math.floor(cost);
  }

  /**
   * Calculates the cost of training for TP
   * @param {Object} user - The user object
   * @param {number} time - The training time in hours
   * @return {number} - The calculated cost
   */
  static calcTPTrainingCost(user, time) { 
    //tp cost
    let cost = Math.round(time*20000*(1-(time-1)/100));
    if(user.dojo !== null) {
      cost *= 0.9;
    }
    return Math.floor(cost);
  }

  /**
   * Calculates the XP gain from NPC training
   * @param {Object} char - The character object
   * @return {number} - The calculated XP gain
   */
  static calcNPCTrainingGain(char, statEXP, levelEXP) {
    let highest = char.attributes.stotal*statEXP+char.level*levelEXP;
    let xp = 1+Math.round(this.trainingModifier * highest / 4);

    return Math.floor(xp);
  }

  /**
   * Calculates the XP gain from training
   * @param {Object} char - The character object
   * @param {Object} user - The user object
   * @return {number} - The calculated XP gain
   */
  static calcXPTrainingGain(char, user, charList, statEXP, levelEXP) {
    let highest = 0;
    for(let i = 0; i < user.charIDs.length; i++) {
      let value = charList[user.charIDs[i]].attributes.stotal*statEXP+charList[user.charIDs[i]].level*levelEXP;
      if(value >= highest) {
        highest = value;
      }
    }
    let xp = 1+Math.round(this.trainingModifier * highest);
    if(char.level >= this.trainingSoftCap) {
      xp = 1 + Math.round(char.level * this.trainingModifier);
    }
    if(user.dojo !== null && char.styleName === user.dojo.guildStyle) {
      xp *= 1.25;
    }
    else if(user.dojo !== null) {
      xp *= 1.15;
    }

    return Math.floor(xp);
  }

  /**
   * Calculates the XP gain from hybrid training
   * @param {Object} char - The character object
   * @param {Object} user - The user object
   * @return {number} - The calculated XP gain
   */
  static calcTXPTrainingGain(char, user, charList, statEXP, levelEXP) {
    let highest = 0;
    for(let i = 0; i < user.charIDs.length; i++) {
      let value = charList[user.charIDs[i]].attributes.stotal*statEXP+charList[user.charIDs[i]].level*levelEXP;
      if(value >= highest) {
        highest = value;
      }
    }
    let xp = 1+Math.round(this.trainingModifier * highest / 1.5);
    if(char.level >= this.trainingSoftCap) {
      xp = 1 + Math.round(char.level * this.trainingModifier / 1.5);
    }
    if(user.dojo !== null && char.styleName === user.dojo.guildStyle) {
      xp *= 1.25;
    }
    else if(user.dojo !== null) {
      xp *= 1.15;
    }

    return Math.floor(xp);
  }

  /**
   * Calculates the TP gain from training
   * @param {Object} char - The character object
   * @param {Object} user - The user object
   * @return {number} - The calculated TP gain
   */
  static calcTPTrainingGain(char, user, charList) {
    let highest = 30;
    for(let i = 0; i < user.charIDs.length; i++) {
      if(charList[user.charIDs[i]].fightingStyle == null) continue;
      let value = charList[user.charIDs[i]].fightingStyle.getTotalChange();
      if(value >= highest) {
        highest = value;
      }
    }
    let tp = 1+Math.round(this.trainingModifier * highest / 1.5);
    if(user.dojo !== null && char.styleName === user.dojo.guildStyle) {
      tp *= 1.25;
    }
    else if(user.dojo !== null) {
      tp *= 1.15;
    }

    return Math.floor(tp);
  }

  /**
   * Calculates the cost of upgrading a fighting style
   * @param {Object} style - The fighting style object
   * @param {number} amount - The amount to upgrade
   * @return {number} - The calculated cost
   */
  static calcStyleUpgrade(style, amount) {
    if(amount <= 1) {
      return Math.round((Math.pow(style.getTotalChange(),1.5)) / 5);
    }
    else {
      let total = 0;
      for(let i = 0; i < amount; i++) {
        total += Math.round((Math.pow(style.getTotalChange()+i,1.5)) / 5);
      }
      return total;
    }
  }

  /**
   * Checks if a character is in a battle
   * @param {string} ID - The player ID
   * @param {string} charName - The character name
   * @return {number} - 1 if in battle, 0 if not
   */
  static checkBattles(ID, charName, activeCombatList) {
    for(let i = 0; i < activeCombatList.length; i++) {
      for(let j = 0; j < activeCombatList[i].pCombatants.length; j++) {
        if(ID === activeCombatList[i].pCombatants[j].playerID && charName === activeCombatList[i].pCombatants[j].name) {
          return 1;
        }
      }
    }
    return 0;
  }

  /**
   * Gets the current battle a character is in
   * @param {string} ID - The player ID
   * @param {string} charName - The character name
   * @return {number} - The battle index or -1 if not in battle
   */
  static getCurrentBattle(ID, charName, activeCombatList) {
    for(let i = 0; i < activeCombatList.length; i++) {
      for(let j = 0; j < activeCombatList[i].pCombatants.length; j++) {
        if(ID == activeCombatList[i].pCombatants[j].playerID && charName === activeCombatList[i].pCombatants[j].name) {
          return i;
        }
      }
      for(let j = 0; j < activeCombatList[i].NPCombatants.length; j++) {
        if(ID == activeCombatList[i].NPCombatants[j].playerID && charName === activeCombatList[i].NPCombatants[j].name) {
          return i;
        }
      }
    }
    return -1;
  }

  /**
   * Gets a copy of a character in battle
   * @param {string} ID - The player ID
   * @param {string} charName - The character name
   * @return {Object} - The character object or -1 if not in battle
   */
  static getCurrentBattleCopy(ID, charName, activeCombatList, charList) {
    for(let i = 0; i < activeCombatList.length; i++) {
      for(let j = 0; j < activeCombatList[i].pCombatants.length; j++) {
        if(ID == activeCombatList[i].pCombatants[j].playerID && charName === activeCombatList[i].pCombatants[j].name) {
          return activeCombatList[i].pCombatants[j];
        }
      }
      for(let j = 0; j < activeCombatList[i].NPCombatants.length; j++) {
        if(ID == activeCombatList[i].NPCombatants[j].playerID && charName === activeCombatList[i].NPCombatants[j].name) {
          return activeCombatList[i].NPCombatants[j];
        }
      }
    }
    return -1;
  }

  /**
   * Gets the current battle an NPC is in
   * @param {string} charName - The NPC name
   * @return {number} - The battle index or -1 if not in battle
   */
  static getCurrentBattleNPC(charName, activeCombatList) {
    for(let i = 0; i < activeCombatList.length; i++) {
      for(let j = 0; j < activeCombatList[i].NPCombatants.length; j++) {
        if(charName == activeCombatList[i].NPCombatants[j].name) {
          return i;
        }
      }
    }
    return -1;
  }
}

module.exports = {
  Helpers
}