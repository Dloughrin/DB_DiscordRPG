const char = require("./RPG/character.js");
const att = require("./RPG/attributes.js");
const batt = require("./RPG/battle.js");
const tech = require("./RPG/technique.js");
const races = require("./RPG/races.js");
const attbonus = require("./RPG/attributeBonus.js");
const equipment = require("./RPG/equipment.js");
const inventory = require("./RPG/inventory.js");
const party = require("./RPG/party.js");
const dojo = require("./RPG/dojo.js");
const user = require("./user.js");
const fs = require('fs');

const Party = party.Party;
const Races = races.Races;
const Character = char.Character;
const Attributes = att.Attributes;
const AttributeBonus = attbonus.AttributeBonus;
const Equipment = equipment.Equipment;
const Inventory = inventory.Inventory;
const Battle = batt.Battle;
const Technique = tech.Technique;
const User = user.User;
const Dojo = dojo.Dojo;

const reader = require('xlsx');

class Loader {
	constructor() {
		this.characterPath = './Data/characterData.txt';
		this.userPath = './Data/userData.txt';
		this.npcPath = './Data/npcData.txt';
		this.techPath = './Data/techniqueData.txt';
		this.stylePath = './Data/styleData.txt';
		this.itemPath = './Data/itemData.txt';
		this.inventoryPath = './Data/inventoryData.txt';
		this.partyPath = './Data/partyData.txt';

		this.dataPath = './Data/dataSet.xlsx';
	}

	backUpData(userList,itemList,charList,npcList,partyList,techList,invList,dojoList) {
		this.characterPath = './BackupData/characterData.txt';
		this.userPath = './BackupData/userData.txt';
		this.npcPath = './BackupData/npcData.txt';
		this.techPath = './BackupData/techniqueData.txt';
		this.stylePath = './BackupData/styleData.txt';
		this.itemPath = './BackupData/itemData.txt';
		this.inventoryPath = './BackupData/inventoryData.txt';
		this.partyPath = './BackupData/partyData.txt';
		this.dataPath = './BackupData/dataSet.xlsx';

		this.characterSaver(charList);
		this.userSaver(userList);
		this.npcSaver(npcList);
		this.techSaver(techList);
		this.styleSaver(npcList, charList);
		this.partySaver(partyList);
		this.itemSaver(itemList);
		this.inventorySaver(invList);
		this.dojoSaver(dojoList);


		this.characterPath = './Data/characterData.txt';
		this.userPath = './Data/userData.txt';
		this.npcPath = './Data/npcData.txt';
		this.techPath = './Data/techniqueData.txt';
		this.stylePath = './Data/styleData.txt';
		this.itemPath = './Data/itemData.txt';
		this.inventoryPath = './Data/inventoryData.txt';
		this.partyPath = './Data/partyData.txt';
		this.dataPath = './Data/dataSet.xlsx';
	}

///////////////////////////
// Player Character Data //
///////////////////////////


	characterLoader(users, itemList) {
		const file = reader.readFile(this.dataPath)
		let data = reader.utils.sheet_to_json(file.Sheets["Characters"]);

		let charList = new Array();
		for(let i = 0; i < data.length; i++) {
			let ID = -1;
			for(let b = 0; b < users.length; b++) {
				if(users[b].userID === data[i]["Player ID"]) {
					ID = b;
					break;
				}
			}

			let attr = new Attributes(data[i]["STR"],data[i]["DEX"],data[i]["CON"],data[i]["ENG"],data[i]["SOL"],data[i]["FOC"]);
			let c = new Character(data[i]["Name"],new Races(data[i]["Race"]),attr,data[i]["Player ID"]);
	      	c.reAddEXP(Number(data[i]["EXP"]));
	      	c["statPoints"] = Number(data[i]["Stat Points"]);
			c["techniquePoints"] = data[i]["TP"];
			c["deathCount"] = data[i]["Death Count"];
			let index = itemList.map(function(e) { return parseInt(e.uid); }).indexOf(parseInt(data[i]["Dogi ID"]));
		    if(index !== -1) c.equipItem("Dogi",itemList[index]);
		    index = itemList.map(function(e) { return parseInt(e.uid); }).indexOf(parseInt(data[i]["Weapon ID"]));
		    if(index !== -1) c.equipItem("Weapon",itemList[index]);
			c["transformation"] = data[i]["Transformation"];
	      	c["image"] = String(data[i]["Image"]);
	      	c["potentialUnlocked"] = data[i]["Unlocked"];
			c.unleashPotential(parseInt(data[i]["Unleashed"]));

			c.training = parseInt(data[i]["Training"]);
			c.trainingType = data[i]["Training Type"];

	      	c["styleName"] = data[i]["styleName"];
	      	c.addTechnique(Number(data[i]["Technique 1"]),users[ID]);
	      	c.addTechnique(Number(data[i]["Technique 2"]),users[ID]);
	      	c.addTechnique(Number(data[i]["Technique 3"]),users[ID]);
	      	c.addTechnique(Number(data[i]["Technique 4"]),users[ID]);
	      	c.addTechnique(Number(data[i]["Technique 5"]),users[ID]);

	      	c.statusUpdate(0);
	      	charList.push(c);
		}
		return charList;
	}

	/*characterLoader(users, itemList) {
		let charList = new Array();
		let contents = fs.readFileSync(this.characterPath, 'utf8');
		if(contents === null) return charList;
		let inputLines = contents.trim().split('\n');
		for(let i = 0; i < inputLines.length; i++) {
			const args = inputLines[i].trim().split(' ');
			let ID = -1;
			for(let b = 0; b < users.length; b++) {
				if(users[b].userID === args[0]) {
					ID = b;
					break;
				}
			}

			let attr = new Attributes(Number(args[6]),Number(args[7]),Number(args[8]),Number(args[9]),Number(args[10]),Number(args[11]));
	      	let c = new Character(args[1],new Races(args[2]),attr,args[0]);
	      	c.reAddEXP(Number(args[3]));
	      	c.statPoints = Number(args[4]);
	      	c.techniquePoints = Number(args[5]);
	      	c.deathCount = Number(args[12]);
	      	let index = itemList.map(function(e) { return e.uid; }).indexOf(args[13]);
			    if(index !== -1) c.equipItem("Dogi",itemList[index]);
			    index = itemList.map(function(e) { return e.uid; }).indexOf(args[14]);
			    if(index !== -1) c.equipItem("Weapon",itemList[index]);
	      	c.image = String(args[15]);
	      	c.potentialUnlocked = args[16];
			c.unleashPotential(args[17]);
			//console.log(c.race)
	      	//c.race.potentialUnlocked(c.potentialUnlocked);
	      	//c.race.potentialUnleashed(c.potentialUnleashed);

	      	for(let j = 18; j < args.length; j++) {
	      		if(j < args.length-1) c.addTechnique(Number(args[j]),users[ID]);
	      		else c.setTransformation(Number(args[j]),users[ID]);
	      	}

	      	c.statusUpdate(0);
			charList.push(c);
		}
		return charList;
	}*/

	characterSaver(charList) {
		let set = new Array();
		//let stream = fs.createWriteStream(this.characterPath);
		for(let i = 0; i < charList.length; i++) {
			let duid = -1;
			if(charList[i].dogi !== null) duid = charList[i].dogi.uid;
			let wuid = -1;
			if(charList[i].weapon !== null) wuid = charList[i].weapon.uid;

			let info = {
				"Player ID": charList[i].playerID,
				"Name": charList[i].name,
				"Race": charList[i].race.raceName,
				"EXP": charList[i].totalexp,
				"Stat Points": charList[i].statPoints,
				"TP": charList[i].techniquePoints,
				"STR": charList[i].attributes.str,
				"DEX": charList[i].attributes.dex,
				"CON": charList[i].attributes.con,
				"ENG": charList[i].attributes.eng,
				"FOC": charList[i].attributes.foc,
				"SOL": charList[i].attributes.sol,
				"Death Count": charList[i].deathCount,
				"Dogi ID": duid,
				"Weapon ID": wuid,
				"Image": charList[i].image,
				"Unlocked": charList[i].potentialUnlocked,
				"Unleashed": charList[i].potentialUnleashed,
				"Transformation": charList[i].transformation,
				"Training": charList[i].training,
				"Training Type": charList[i].trainingType
			}

			for(let j = 0; j < charList[i].techniques.length; j++) {
				let str = "Technique " + (j+1);
				info[str] = charList[i].techniques[j];
			}

			let styles = -1;
			if(charList[i].fightingStyle !== null) {
				styles = charList[i].fightingStyle.outputBonusArray();
				info["styleName"] = charList[i].styleName;
			}

			set.push(info);
		}

		const file = reader.readFile(this.dataPath)
		const ws = reader.utils.json_to_sheet(set);
		file.Sheets["Characters"] = ws;
		reader.writeFile(file,this.dataPath);
		//stream.end();
	}

	/*characterSaver(charList,charListID) {
		let str;
		let stream = fs.createWriteStream(this.characterPath);
		for(let i = 0; i < charListID.length; i++) {
			str = charListID[i] + ' ' + charList[i].name + ' ' + charList[i].race.raceName + ' ';
			str += charList[i].totalexp + ' ' + charList[i].statPoints + ' ' + charList[i].techniquePoints + ' ' + charList[i].attributes.str;
			str += ' ' + charList[i].attributes.dex + ' ' + charList[i].attributes.con + ' ';
			str += charList[i].attributes.eng + ' ' + charList[i].attributes.sol + ' ' + charList[i].attributes.foc + ' ';
			let duid = -1;
			if(charList[i].dogi !== null) duid = charList[i].dogi.uid;
			let wuid = -1;
			if(charList[i].weapon !== null) wuid = charList[i].weapon.uid;
			str += charList[i].deathCount + ' ' + duid + ' ' + wuid + ' ' + String(charList[i].image) + ' ' + charList[i].potentialUnlocked + ' ' + charList[i].potentialUnleashed;

			for(let j = 0; j < charList[i].techniques.length; j++) {
				str += ' ' + charList[i].techniques[j];
			}
			str += ' ' + charList[i].transformation;
			str += '\n'

			stream.write(str);
		}
		stream.end();
	}*/

	userSaver(userList) {
		let set = new Array();
		//let stream = fs.createWriteStream(this.characterPath);
		for(let i = 0; i < userList.length; i++) {
			let info = {
				"Player ID": userList[i].userID,
				"Current Char": userList[i].currentChar,
				"Inv ID": userList[i].itemInventory.uid,
				"Zeni": userList[i].zeni,
				"Kai": userList[i].kai,
				"Legendary": userList[i].legendary,
				"Dojo Rank": userList[i].dojoRank,
				"Tag Count": userList[i].tags.length,
				"Log": userList[i].trainingLog
			}

			for(let j = 0; j < userList[i].tags.length; j++) {
				let str = "Tag " + (j+1);
				info[str] = userList[i].tags[j];
			}

			set.push(info);
		}

		const file = reader.readFile(this.dataPath)
		const ws = reader.utils.json_to_sheet(set);
		file.Sheets["Users"] = ws;
		reader.writeFile(file,this.dataPath);
	}

	userLoader(invList) {
		const file = reader.readFile(this.dataPath)
		let data = reader.utils.sheet_to_json(file.Sheets["Users"]);

		let userList = new Array();
		for(let i = 0; i < data.length; i++) {
			let user = new User(data[i]["Player ID"],invList[parseInt(data[i]["Inv ID"])]);
			user.zeni = data[i]["Zeni"];
			user.kai = data[i]["Kai"];
			user.legendary = data[i]["Legendary"];
			user.currentChar = data[i]["Current Char"];
			user.dojoRank = data[i]["Dojo Rank"];
			user.tutorial = 0;
			user.trainingLog = data[i]["Log"];
			if(typeof user.trainingLog !== 'undefined') {
				user.trainingLog.toLocaleString(undefined);
			}
			else {
				user.trainingLog = "";
			}

			let jmax = parseInt(data[i]["Tag Count"]);
			for(let j = 0; j < jmax; j++) {
				let index = "Tag " + (j+1);
				user.addTag(Number(data[i][index]));
			}
			userList.push(user);
		}
		return userList;
	}

///////////////////////////
// System Character Data //
///////////////////////////

	npcLoader(itemList) {
		/*
		let charList = new Array();
		let contents = fs.readFileSync(this.npcPath, 'utf8');
		if(contents === null) return charList;
		let inputLines = contents.trim().split('\n');
		for(let i = 0; i < inputLines.length; i++) {
			let args = inputLines[i].trim().split(' ');
			let attr = new Attributes(Number(args[5]),Number(args[6]),Number(args[7]),Number(args[8]),Number(args[9]),Number(args[10]));
			let c = new Character(args[0],new Races(args[1]),attr,'NPC');
			c.reAddEXP(Number(args[2]));
			c.statPoints = Number(args[3]);
			c.techniquePoints = Number(args[4]);
			c.deathCount = Number(args[11]);
			let index = itemList.map(function(e) { return e.uid; }).indexOf(args[12]);
		    if(index !== -1) c.equipItem("Dogi",itemList[index]);
		    index = itemList.map(function(e) { return e.uid; }).indexOf(args[13]);
		    if(index !== -1) c.equipItem("Weapon",itemList[index]);
			c.image = String(args[14]);
			c.setPersonality(args[15]);

			for(let j = 16; j < args.length; j++) {
				if(j !== args.length-1) c.addTechnique(Number(args[j]),'NPC');
				else c.setTransformation(Number(args[j]),'NPC');
			}
			if(c.attributes.stotal > 600) c.unlockPotential();
			if(c.attributes.stotal > 900) c.unleashPotential(1);
			charList.push(c);
		}
		return charList;
		*/
		const file = reader.readFile(this.dataPath)
		let data = reader.utils.sheet_to_json(file.Sheets["NPCs"]);

		let charList = new Array();
		for(let i = 0; i < data.length; i++) {
			let attr = new Attributes(data[i]["STR"],data[i]["DEX"],data[i]["CON"],data[i]["ENG"],data[i]["SOL"],data[i]["FOC"]);
			let c = new Character(data[i]["Name"],new Races(data[i]["Race"]),attr,data[i]["Player ID"]);
	      	c.reAddEXP(Number(data[i]["EXP"]));
	      	c["statPoints"] = Number(data[i]["Stat Points"]);
			c["techniquePoints"] = data[i]["TP"];
			c["deathCount"] = data[i]["Death Count"];
			let index = itemList.map(function(e) { return parseInt(e.uid); }).indexOf(parseInt(data[i]["Dogi ID"]));
		    if(index !== -1) c.equipItem("Dogi",itemList[index]);
		    index = itemList.map(function(e) { return parseInt(e.uid); }).indexOf(parseInt(data[i]["Weapon ID"]));
		    if(index !== -1) c.equipItem("Weapon",itemList[index]);
			c["transformation"] = data[i]["Transformation"];
	      	c["image"] = String(data[i]["Image"]);
	      	c["potentialUnlocked"] = data[i]["Unlocked"];
			c.unleashPotential(parseInt(data[i]["Unleashed"]));

	      	c["styleName"] = data[i]["styleName"];
	      	c.addTechnique(Number(data[i]["Technique 1"]),'NPC');
	      	c.addTechnique(Number(data[i]["Technique 2"]),'NPC');
	      	c.addTechnique(Number(data[i]["Technique 3"]),'NPC');
	      	c.addTechnique(Number(data[i]["Technique 4"]),'NPC');
	      	c.addTechnique(Number(data[i]["Technique 5"]),'NPC');

	      	c.statusUpdate(0);
	      	charList.push(c);
		}
		return charList;
	}

	npcSaver(charList) {
		let set = new Array();
		for(let i = 0; i < charList.length; i++) {
			let duid = -1;
			if(charList[i].dogi !== null) duid = charList[i].dogi.uid;
			let wuid = -1;
			if(charList[i].weapon !== null) wuid = charList[i].weapon.uid;

			if(charList[i].attributes.stotal > 600) charList[i].unlockPotential();
			if(charList[i].attributes.stotal > 900) charList[i].unleashPotential(1);

			let info = {
				"Player ID": charList[i].playerID,
				"Name": charList[i].name,
				"Race": charList[i].race.raceName,
				"EXP": charList[i].totalexp,
				"Stat Points": charList[i].statPoints,
				"TP": charList[i].techniquePoints,
				"STR": charList[i].attributes.str,
				"DEX": charList[i].attributes.dex,
				"CON": charList[i].attributes.con,
				"ENG": charList[i].attributes.eng,
				"FOC": charList[i].attributes.foc,
				"SOL": charList[i].attributes.sol,
				"Stat Total": charList[i].attributes.stotal,
				"Death Count": charList[i].deathCount,
				"Dogi ID": duid,
				"Weapon ID": wuid,
				"Image": charList[i].image,
				"Unlocked": charList[i].potentialUnlocked,
				"Unleashed": charList[i].potentialUnleashed,
				"Transformation": charList[i].transformation
			}

			for(let j = 0; j < charList[i].techniques.length; j++) {
				let str = "Technique " + (j+1);
				info[str] = charList[i].techniques[j];
			}

			let styles = -1;
			if(charList[i].fightingStyle !== null) {
				styles = charList[i].fightingStyle.outputBonusArray();
				info["styleName"] = charList[i].styleName;
			}

			set.push(info);
		}

		const file = reader.readFile(this.dataPath)
		const ws = reader.utils.json_to_sheet(set);
		file.Sheets["NPCs"] = ws;
		reader.writeFile(file,this.dataPath);
	}

///////////////////////////
///// Technique Data //////
///////////////////////////

	techLoader() {
		let techList = new Array();
		const file = reader.readFile(this.dataPath)
		let data = reader.utils.sheet_to_json(file.Sheets["Techniques"]);

		for(let i = 0; i < data.length; i++) {
			let tech = new Technique(data[i]["UID"], "loading", data[i]["techType"], 0, 0, 0, 0, 0);
			tech.loadObject(data[i]);
			if(tech.techType === "Transform" || tech.techType === "Buff" || tech.techType === "Debuff") {
				tech.attBonus.loadObject(data[i]);
			}
			techList.push(tech);
		}
		return techList;
	}

	techSaver(techList) {
		let set = new Array();
		for(let i = 0; i < techList.length; i++) {
			let info = techList[i];
			if(techList[i].techType === "Transform" || techList[i].techType === "Buff" || techList[i].techType === "Debuff") {	
				for(var prop in techList[i].attBonus) {
					if(typeof info[prop] === 'undefined') info[prop] = techList[i].attBonus[prop];
				}
			}

			set.push(info);
		}

		const file = reader.readFile(this.dataPath)
		const ws = reader.utils.json_to_sheet(set);
		file.Sheets["Techniques"] = ws;
		reader.writeFile(file,this.dataPath);
	}

///////////////////////////
//////// Item Data ////////
///////////////////////////

	styleSaver(npcList, charList) {
		let set = new Array();
		for(let i = 0; i < npcList.length; i++) {
			npcList[i].fightingStyle.UI = npcList[i].playerID+npcList[i].name;
			let info = npcList[i].fightingStyle;

			set.push(info);
		}
		for(let i = 0; i < charList.length; i++) {
			charList[i].fightingStyle.UI = charList[i].playerID+charList[i].name;
			let info = charList[i].fightingStyle;

			set.push(info);
		}

		const file = reader.readFile(this.dataPath)
		const ws = reader.utils.json_to_sheet(set);
		file.Sheets["Styles"] = ws;
		reader.writeFile(file,this.dataPath);
	}

	styleLoader(npcList, charList) {
		const file = reader.readFile(this.dataPath)
		let data = reader.utils.sheet_to_json(file.Sheets["Styles"]);

		for(let i = 0; i < data.length; i++) {
			let tempIndex = npcList.map(function(e) { return e.playerID+e.name; }).indexOf(data[i]["UI"]);
			if(tempIndex !== -1) {
				let att = new AttributeBonus("","");
				att.loadObject(data[i]);
				npcList[tempIndex].fightingStyle = att;
				npcList[tempIndex].styleName = npcList[tempIndex].fightingStyle.name;
				npcList[tempIndex].fightingStyle.name = npcList[tempIndex].styleName;
				npcList[tempIndex].statusUpdate(0);
			}
			else {
				tempIndex = charList.map(function(e) { return e.playerID+e.name; }).indexOf(data[i]["UI"]);
				let att = new AttributeBonus("","");
				att.loadObject(data[i]);
				charList[tempIndex].fightingStyle = att;
				charList[tempIndex].styleName = charList[tempIndex].fightingStyle.name;
				charList[tempIndex].fightingStyle.name = charList[tempIndex].styleName;
				charList[tempIndex].statusUpdate(0);
			}
		}
	}

	dojoSaver(dojoList) {
		let set = new Array();
		for(let i = 0; i < dojoList.length; i++) {
			let info = {
				"Dojo Name": dojoList[i].guildName,
				"Master ID": dojoList[i].guildLeader.userID,
				"Current Size": dojoList[i].guildList.length,
				"Max Size": dojoList[i].maxSize,
				"Auto Reply": dojoList[i].replyType,
				"Style Name": dojoList[i].guildStyle
			}

			for(let j = 1; j < dojoList[i].guildList.length; j++) {
				let str = "Member " + (j+1);
				info[str+" ID"] = dojoList[i].guildList[j].userID;
			}

			set.push(info);
		}

		const file = reader.readFile(this.dataPath)
		const ws = reader.utils.json_to_sheet(set);
		file.Sheets["Dojos"] = ws;
		reader.writeFile(file,this.dataPath);
	}

	dojoLoader(userList) {
		const file = reader.readFile(this.dataPath)
		let data = reader.utils.sheet_to_json(file.Sheets["Dojos"]);

		let dojoList = new Array();
		for(let i = 0; i < data.length; i++) { 
			let tempIndex = userList.map(function(e) { return e.userID; }).indexOf(data[i]["Master ID"]);
			let dojo = new Dojo(userList[tempIndex],data[i]["Dojo Name"], data[i]["Style Name"]);
			let maxSize = data[i]["Max Size"];
			dojo.maxSize = maxSize;
			dojo.replyType = data[i]["Auto Reply"];

			for(let j = 1; j < data[i]["Current Size"]; j++) {
				let str = "Member " + (j+1) + " ID";
				tempIndex = userList.map(function(e) { return e.playerID; }).indexOf(data[i][str]);
				dojo.addPlayer(userList[tempIndex])
			}

			dojoList.push(dojo);
		}
		return dojoList;
	}

	partySaver(partyList) {
		let set = new Array();
		for(let i = 0; i < partyList.length; i++) {
			let info = {
				"Party Name": partyList[i].partyName,
				"Leader ID": partyList[i].partyLeader.playerID,
				"Leader Name": partyList[i].partyLeader.name
			}

			for(let j = 1; j < partyList[i].partyList.length; j++) {
				let str = "Member " + (j+1);
				info[str+" ID"] = partyList[i].partyList[j].playerID;
				info[str+" Name"] = partyList[i].partyList[j].name;
			}

			set.push(info);
		}

		const file = reader.readFile(this.dataPath)
		const ws = reader.utils.json_to_sheet(set);
		file.Sheets["Parties"] = ws;
		reader.writeFile(file,this.dataPath);
	}

	partyLoader(charList) {
		const file = reader.readFile(this.dataPath)
		let data = reader.utils.sheet_to_json(file.Sheets["Parties"]);

		let partyList = new Array();
		for(let i = 0; i < data.length; i++) { 
			let tempIndex = charList.map(function(e) { return e.playerID+e.name; }).indexOf(data[i]["Leader ID"]+data[i]["Leader Name"]);
			let party = new Party(charList[tempIndex],data[i]["Party Name"]);

			tempIndex = charList.map(function(e) { return e.playerID+e.name; }).indexOf(data[i]["Member 2 ID"]+data[i]["Member 2 Name"]);
			if(tempIndex !== -1) {
				party.addCharacter(charList[tempIndex]);
			}
			tempIndex = charList.map(function(e) { return e.playerID+e.name; }).indexOf(data[i]["Member 3 ID"]+data[i]["Member 3 Name"]);
			if(tempIndex !== -1) {
				party.addCharacter(charList[tempIndex]);
			}

			partyList.push(party);
		}
		return partyList;
	}


	itemSaver(itemList) {
		let set = new Array();
		for(let i = 0; i < itemList.length; i++) {
			let info = itemList[i];
			for(var prop in itemList[i].attbonus) {
				//if(typeof info[prop] === 'undefined') 
				info[prop] = itemList[i].attbonus[prop];
			}

			set.push(info);
		}

		const file = reader.readFile(this.dataPath)
		const ws = reader.utils.json_to_sheet(set);
		file.Sheets["Items"] = ws;
		reader.writeFile(file,this.dataPath);
	}

	itemLoader() {
		let itemList = new Array();
		const file = reader.readFile(this.dataPath)
		let data = reader.utils.sheet_to_json(file.Sheets["Items"]);

		for(let i = 0; i < data.length; i++) {
			let name = new AttributeBonus("","");
			name.loadObject(data[i]);
			name.listID = -1;
			let item = new Equipment(parseInt(data[i]["uid"]),[name,0],data[i]["type"]);
			item.loadObject(data[i]);

			itemList.push(item);
		}
		return itemList;
	}

	inventorySaver(invList) {
		let set = new Array();
		for(let i = 0; i < invList.length; i++) {
			let info = {
				"Inv ID": invList[i].uid,
				"Owner ID": invList[i].userID,
				"Item Count": invList[i].items.length
			}

			for(let j = 0; j < invList[i].items.length; j++) {
				let str = "Item " + (j+1);
				info[str] = invList[i].items[j].uid;
			}

			set.push(info);
		}

		const file = reader.readFile(this.dataPath)
		const ws = reader.utils.json_to_sheet(set);
		file.Sheets["Inventory"] = ws;
		reader.writeFile(file,this.dataPath);
	}

	inventoryLoader(itemList) {
		const file = reader.readFile(this.dataPath)
		let data = reader.utils.sheet_to_json(file.Sheets["Inventory"]);

		let invList = new Array();
		for(let i = 0; i < data.length; i++) { 
			let inv = new Inventory(data[i]["Inv ID"],data[i]["Owner ID"]);

			let itemlength = data[i]["Item Count"];
			for(let j = 0; j < itemlength; j++) {
				let str = "Item " + (j+1);
				let index = itemList.map(function(e) { return parseInt(e.uid); }).indexOf(parseInt(data[i][str]));
				inv.addItem(itemList[index]);
			}

			invList.push(inv);
		}
		return invList;
	}
}

module.exports = {
  Loader : Loader
}