const attbonus = require("./attributeBonus.js");

const AttributeBonus = attbonus.AttributeBonus;

class Attributes {
	constructor(s,d,c,e,so,f) {
		this.str = s;
		this.dex = d;
		this.con = c;
		this.eng = e;
		this.sol = so;
		this.foc = f;
	    this.stotal = s + d + c + e + so + f;
	      
	    this.chargeBonus = 1;

		this.health = 5;
		this.energy = 0;
		this.healthRegen = 0;
		this.energyRegen = 0;
		this.charge = 0;

		this.hit = 10;
		this.dodge = 1;
		this.speed = 1;
	    this.critRate = 5;
	    this.critDamage = 1.25;
		this.blockRate = 1;
		this.blockPower = 2;

		this.pDefense = 1;
		this.eDefense = 0;

		this.magicPower = 0;
		this.magicDefense = 0;
      
	    this.physicalAttack = 1;
	    this.energyAttack = 1;

	    this.buffs = new Array();
	   	this.buffDurations = new Array(); 
	    this.btotal = new AttributeBonus('AttTotal',"Total");

		this.calculate(1);
	}

	calcAdvStats(level) {
		this.healthRegen = Math.round((1 + ((this.con*2+2)*level)/8)*this.btotal.healthRegen);
		this.energyRegen = Math.round((1 + ((this.eng*2+(this.sol/2)+1)*level)/8)*this.btotal.energyRegen);

		this.hit = Math.round((0.5*level + 10 +(this.dex*0.25)+(this.foc)+0.05*(this.str+this.sol))*this.btotal.hit);
		this.dodge = Math.round(((0.4*level + 5 + (this.dex*0.75)+(this.foc*0.3)))*this.btotal.dodge);
	    this.speed = Math.round((10 + (this.dex+(0.75*this.foc)+10)*level)*this.btotal.speed);
	    //this.critRate = Math.min(80,Math.round((5 + (this.dex/10 + this.foc/15))*(this.btotal.critRate)));
	    this.critRate = Math.round((5 + (3.5*Math.pow(this.dex,0.33) + 3*Math.pow(this.foc,0.25)))*(this.btotal.critRate));
	    this.critDamage = (1.2 + (this.str * (1/10) + this.dex * (3/40) + this.foc * (5/20) + this.sol * (1/10))/100)*this.btotal.critDamage;
		//this.blockRate = Math.min(90,((15 + (this.dex/25 + this.foc/25 + this.str/15))*this.btotal.blockRate));
		this.blockRate = Math.min(90,((5 + (1.15*Math.pow(this.dex,0.33) + Math.pow(this.foc,0.33) + 1.2*Math.pow(this.str,0.5)))*this.btotal.blockRate));
		this.blockPower = Math.min(1200,Math.round(100 + ((this.con*1.25)+(this.str*0.75)+(this.sol*0.75))*this.btotal.blockPower));
		

		this.pDefense = Math.round((25 + (this.con*2+this.str*(2/3)+this.foc*(1/6)+this.dex*(1/6)+2+this.sol*(1/10)))*this.btotal.pDefense);
		this.eDefense = Math.round((25 + (this.eng*2+this.sol*(2/3)+this.foc*(1/3)+2+this.str*(1/10)))*this.btotal.eDefense);

		this.magicPower = Math.round(((0 + (this.sol+(this.foc*2)+(this.eng/2)+1)*level) / 10)*this.btotal.magicPower);
		this.magicDefense = Math.round(((50 + this.sol*1.5 + this.eng) / 3)*this.btotal.magicDefense);
        
	    this.physicalAttack = 30 + Math.round(((3 + this.str*2 + this.dex*0.5) * level / 2));
	    this.energyAttack = 25 + Math.round(((1 + this.sol*2 + this.foc*0.4) * level / 2));

	    let physBonus = Math.floor(this.physicalAttack*0.3);
	    let energyBonus = Math.floor(this.energyAttack*0.3);
	    this.physicalAttack = Math.floor(((this.physicalAttack*0.8) + energyBonus)*this.btotal.physicalAttack);
	    this.energyAttack = Math.floor(((this.energyAttack*0.8) + physBonus)*this.btotal.energyAttack);
	}

	calculate(level) {
		this.getBuffTotal();
    	this.setChargeBonus();
		this.str = Math.round(this.str*this.btotal.bstr);
		this.dex = Math.round(this.dex*this.btotal.bdex);
		this.con = Math.round(this.con*this.btotal.bcon);
		this.eng = Math.round(this.eng*this.btotal.beng);
		this.sol = Math.round(this.sol*this.btotal.bsol);
		this.foc = Math.round(this.foc*this.btotal.bfoc);
    	this.stotal = this.str + this.dex + this.con + this.eng + this.sol + this.foc;

		this.health = Math.round((50 + (this.con*1.25+2)*level*10)*this.btotal.health);
		this.energy = Math.round((10 + (this.eng*1.1+1)*level*10)*this.btotal.energy);
		this.charge = Math.round(((((this.sol*0.66)+(this.foc*0.3)+(this.dex*0.3)+(this.con*0.2)+(this.eng*0.3)+(this.str*0.66)+1))/20)*this.btotal.charge);
		this.calcAdvStats(level);
	}

	battleCalc(level) {
		this.getBuffTotal();
	    this.setChargeBonus();
	    this.calcAdvStats(level);
	}

	getBuffTotal() {
		this.btotal = new AttributeBonus('AttTotal',"Total");
		for(let i = 0; i < this.buffs.length; i++) {
			this.btotal.addBuff(this.buffs[i]);
		}
	}
  
    setChargeBonus() {
      this.chargeBonus = 1 + (this.charge * 0.05) * this.btotal.chargeBonus;
    }
  
    scanPowerLevel(charge, level) {
       let chargeBonus = 1 + (charge * 0.05) * this.btotal.chargeBonus;
       return Math.round(((1+level)*0.75) * chargeBonus * (10 + this.str*25 + this.dex*20 + this.con*30 + this.eng*30 + this.sol*25 + this.foc*20));
    }
}

module.exports = {
	Attributes : Attributes
}