const attbonus = require("./attributeBonus.js");

const AttributeBonus = attbonus.AttributeBonus;

class Technique {
	constructor(uid, name, type, hpCost, enCost, flatDam, damageScale, hits) {
    this.UID = uid;
    this.tag = "None";
    this.aoe = 0;
    this.coolDown = 0;

      if(type == "Ki") {
        this.scalePercent = damageScale;
        this.flatDamage = flatDam;
        this.hits = hits;
        this.name = name;
        this.healthCost = hpCost;
        this.energyCost = enCost;
        this.techType = type;
        this.armorPen = 0;
        this.hitRate = 0;
        this.critRate = 0;
        this.allowCharge = 0;
        this.coolDown = 0;
      }
      else if(type == "Strike") {
        this.scalePercent = damageScale;
        this.flatDamage = flatDam;
        this.hits = hits;
        this.name = name;
        this.healthCost = hpCost;
        this.energyCost = enCost;
        this.techType = type;
        this.armorPen = 0;
        this.hitRate = 0;
        this.critRate = 0;
        this.allowCharge = 0;
        this.coolDown = 0;
      }
      else if(type == "Transform") {
        this.name = name;
        this.techType = type;
        this.healthCost = hpCost;
        this.energyCost = enCost;
        this.hits = 0;
        this.armorPen = 0;
        this.hitRate = 0;
        this.critRate = 0;
        this.scalePercent = 0;
        this.flatDamage = 0;
        this.allowCharge = 0;
        this.attBonus = new AttributeBonus(this.name,this.techType);
        this.coolDown = 0;
      }
      else if(type == "Buff") {
        this.name = name;
        this.techType = type;
        this.healthCost = hpCost;
        this.energyCost = enCost;
        this.hits = 0;
        this.armorPen = 0;
        this.hitRate = 0;
        this.critRate = 0;
        this.scalePercent = 0;
        this.flatDamage = 0;
        this.coolDown = 0;
        this.allowCharge = 0;
        this.duration = hits;
        this.attBonus = new AttributeBonus(this.name,this.techType);
        
        this.guardTarget = 0;
      }
      else if(type == "Debuff") {
        this.name = name;
        this.techType = type;
        this.healthCost = hpCost;
        this.energyCost = enCost;
        this.hits = 0;
        this.armorPen = 0;
        this.hitRate = 0;
        this.critRate = 0;
        this.scalePercent = 0;
        this.flatDamage = 0;
        this.coolDown = 0;
        this.allowCharge = 0;
        this.duration = hits;
        this.attBonus = new AttributeBonus(this.name,this.techType);
      }
      else if(type == "Restoration") {
        this.name = name;
        this.techType = type;
        this.healthCost = hpCost;
        this.energyCost = enCost;
        this.scalePercent = damageScale;
        this.flatDamage = flatDam;
        this.hits = 0;
        this.armorPen = 0;
        this.hitRate = 0;
        this.critRate = 0;
        this.health = 0;
        this.energy = 0;
        this.coolDown = 0;
        this.allowCharge = 0;
      }
    }
  
  setTag(tagName) {
    if(this.techType === "Transform") {
        this.tag = tagName;
      }
      else if(this.techType === "Buff") {
        this.tag = tagName;
      }
  }
}

module.exports = {
  Technique : Technique
}