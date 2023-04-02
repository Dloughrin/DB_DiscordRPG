const token = 'OTkzNzY4MTQwODkyODE5NDc4.G4rxFf.ychJnHWV6svOkt0MXg3wCBzNoLvdrFFC3bl-4A';

/* 
  Credits
    Image Credits:
      Vecteezy.com
*/


const char = require("./RPG/character.js");
const att = require("./RPG/attributes.js");
const batt = require("./RPG/battle.js");
const tech = require("./RPG/technique.js");
const naming = require("./RPG/naming.js");
const attbonus = require("./RPG/attributeBonus.js");
const equipment = require("./RPG/equipment.js");
const inventory = require("./RPG/inventory.js");
const help = require("./RPG/help.js");
const races = require("./RPG/races.js");
const raid = require("./RPG/raid.js");
const party = require("./RPG/party.js");
const dojo = require("./RPG/dojo.js");
const load = require("./loader.js");
const user = require("./user.js");


const Raid = raid.Raid;
const Party = party.Party;
const Dojo = dojo.Dojo;
const AttributeBonus = attbonus.AttributeBonus;
const Races = races.Races;
const Character = char.Character;
const Attributes = att.Attributes;
const Battle = batt.Battle;
const Technique = tech.Technique;
const Loader = load.Loader;
const User = user.User;
const Help = help.Help;
const Naming = naming.Naming;
const Equipment = equipment.Equipment;
const Inventory = inventory.Inventory;

const Discord = require("discord.js");
const { Client, Intents } = require('discord.js');
const { MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');

// ---------------------------------------

const myIntents = new Intents(13827);
/*myIntents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, 
  Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGE_TYPING, 
  Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.);*/
const bot = new Discord.Client({
  intents: myIntents,
  restTimeOffset: 0
});
const loader = new Loader();
const nameGenerator = new Naming();
const prefix = 'g';
const devID = '108035991394074624';

const statEXP = 40;
const levelEXP = 25;
const npcEXPMulti = 5;

const styleBonusCap = 100;
const styleStatCap = 0.50;
const trainingModifier = 1.25;
const trainingSoftCap = 2500

// ---------------------------------------

let charList = new Array();
let users = new Array();
let npcList = new Array();
let techList = new Array();
let itemList = new Array();
let invList = new Array();
let partyList = new Array();
let dojoList = new Array();

let activeCombatList = new Array();

// ---------------------------------------

bot.on('ready', () => {
  techList = loader.techLoader();
  itemList = loader.itemLoader();
  invList = loader.inventoryLoader(itemList);
  npcList = loader.npcLoader(itemList);
  users = loader.userLoader(invList);
  charList = loader.characterLoader(users,itemList);
  loader.styleLoader(npcList, charList);
  partyList = loader.partyLoader(charList);
  dojoList = loader.dojoLoader(users);

  for(let i = 0; i < charList.length; i++) {
    for(let j = 0; j < users.length; j++) {
      if(charList[i].playerID == users[j].userID) {
        users[j].charIDs.push(i);
        if(charList[i].training > 0) {
          startTraining(charList[i], users[j]);
        }
      }
    }
  }

  console.log("Bot is ready.");
});

bot.login(token)

// ---------------------------------------

const statusEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff');
const messageEmbed = new Discord.MessageEmbed()
    .setColor('#ff99ff');

// ---------------------------------------

setInterval(function() {
  loader.backUpData(users,itemList,charList,npcList,partyList,techList,invList,dojoList);
  for(let i = 0; i < npcList.length; i++) {
    if(npcList[i].attributes.stotal < 200) continue;
    let xp = calcNPCTrainingGain(npcList[i]);
    npcList[i].addEXP(xp);
    if(npcList[i].level >= npcList[i].attributes.stotal * 0.5) {
      let texp = npcList[i].exp * 0.55
      npcList[i].rebirth();
      npcList[i].reAddEXP(texp);
    }
  }
  loader.npcSaver(npcList);
  loader.userSaver(users);
  loader.characterSaver(charList);
  console.log("Data backup saved.")
}, 1000*60*45) // 1000 miliseconds * 60 seconds * 30 minutes

bot.on('messageCreate', async (msg) => {
  //if our message doesnt start with our defined prefix, dont go any further into function
  if(!msg.content.toLowerCase().startsWith(prefix)) {
    return
  }
  
  //slices off prefix from our message, then trims extra whitespace, then returns our array of words from the message
  const args = msg.content.slice(prefix.length).toLowerCase().trim().split(' ')
  
  //splits off the first word from the array, which will be our command
  const command = args.shift().toLowerCase()
  //log the command
  console.log('command: ', command)
  //log any arguments passed with a command
  console.log(args)
  
  if(command === 'ping') {
    msg.channel.send({ content: 'Pong. ' });
  }

/**********************/
/* Basic RPG Commands */
/**********************/

  if(command === 'leaderboard' || command === 'top') {
    findStrongest();
  }

  if(command === 'npclist' || command === 'npcs' || command === 'npc') {
    listNPCs();
  }

  if(command === 'help') {
    if(args.length === 0) {
      displayHelp(msg.author.id);
    }
    else if(args.length === 1 && args[0] === "list") {

      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Command List');
      for(let i = 0; i < Help.commands.length; i++) {
        let str = Help.helpRequest(Help.commands[i],"commands")[1];
        currEmbed.addFields(
        { name: '**' + Help.commands[i] + '**', value: str, inline:false }
        );
        if((i % 9 === 0 && i > 0) || i+1 >= Help.commands.length) {
          msg.author.send({ embeds: [currEmbed] });
          currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Command List');
        }
      }
    }
  }

  if(command === 'training' || command === 'train') {
    let index = getCharListIndex(msg.author.id);
    if(index === null) return;

    if(args.length === 1) {
      if(args[0] === "log") {
        let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Training Log');
        currEmbed.setDescription(users[index].checkTrainingLog());
        msg.channel.send({ embeds: [currEmbed] });
        return;
      }
      else if(args[0] === "end") {
        let ci = findID(msg.author.id);
        if(index === -1) return;

        charList[ci].training = 0;
        charList[ci].trainingType = "";
        loader.characterSaver(charList);

        let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Training Ended Early');
        currEmbed.setDescription('No resources refunded.');
        msg.channel.send({ embeds: [currEmbed] });

        return;
      }
      else {
        let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
        currEmbed.setDescription('training log | training');
        msg.channel.send({ embeds: [currEmbed] });
        return;
      }
    }
    else if(args.length === 0) {
      let training = 0;
      for(let i = 0; i < users[index].charIDs.length; i++) {
        if(charList[users[index].charIDs[i]].training > 0) training++;
      }
      if(training < (users[index].charIDs.length-1)) displayTraining(msg.author.id, index);
      else {
        let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Error');
        currEmbed.setDescription('You must have at least 1 character available.');
        msg.channel.send({ embeds: [currEmbed] });
        return;
      }
    }
    else {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
      currEmbed.setDescription('training log | training');
      msg.channel.send({ embeds: [currEmbed] });
      return;
    }
  }

  if(command === 'guild' || command === 'dojo') {
    let index = getCharListIndex(msg.author.id);
    if(index === null) return;

    if(args.length === 0) {
      if(users[index].dojo === null) {
        let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Error');
        currEmbed.setDescription('This user is not in a dojo. Use dojo create [name] to make one.');
        msg.channel.send({ embeds: [currEmbed] });
        return;
      }

      guildFunctions(users[index]);
    }
    else if(args.length === 1) {
      if(users[index].dojo === null) {
        let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Error');
        currEmbed.setDescription('This user is not in a dojo. Use dojo create [name] to make one.');
        msg.channel.send({ embeds: [currEmbed] });
        return;
      }
      if(args[0] === 'disband') { 
        if(users[index].dojo.disbanding === 0) { 
          if(users[index].dojo.guildLeader.userID !== users[index].userID) {
            let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle("Error");
            currEmbed.setDescription("You're not the dojo leader.");
            msg.channel.send({ embeds: [currEmbed] });
            return;
          }
          else {
            users[index].dojo.disbanding = 1;
            let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Are you sure?');
            currEmbed.setDescription('Use this command again to disband your dojo ' + users[index].dojo.guildName.replace(/\_/g,' ') + '.');
            msg.channel.send({ embeds: [currEmbed] });
            return;
          }
        }
        else {
          let pIndex = dojoList.map(function(e) { return e.guildName+e.guildLeader.userID; }).indexOf(users[index].dojo.guildName+users[index].userID);
          let length = users[index].dojo.guildList.length;
          for(let i = 0; i < length; i++) {
            if(users[index].playerID !== users[index].dojo.guildList[i].playerID) {
              users[index].dojo.guildList[i].dojo = null;
              users[index].dojo.guildList[i].dojoRank = null;
            }
          }
          users[index].dojo = null;
          users[index].dojoRank = null;
          dojoList.splice(pIndex,1);
          loader.dojoSaver(dojoList);

          let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Done.');
          currEmbed.setDescription('Your dojo has been disbanded.');
          msg.channel.send({ embeds: [currEmbed] });
          return;
        }
      }
      else if(args[0] === 'members') {
        let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle(users[index].dojo.guildName.replace(/\_/g,' ') + ' Dojo Information');
        let estr = 'Total Members: ' + users[index].dojo.guildList.length + ' / ' + users[index].dojo.maxSize;
        let valueStr = 'Guild Leader: <@' + users[index].dojo.guildLeader.userID + '>';
        valueStr += '\nGuild Style Name: ' + users[index].dojo.guildStyle.replace(/\_/g,' ');
        valueStr += '\nGuild Applications: ' + users[index].dojo.replyType;

        currEmbed.setDescription(valueStr);
        currEmbed.setFooter({ text: estr });
        msg.channel.send({ embeds: [currEmbed] });

        currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Member List');
        for(let i = 0; i < users[index].dojo.guildList.length; i++) {
          let str = "<@" + users[index].dojo.guildList[i].userID + ">";
          currEmbed.addFields(
          { name: users[index].dojo.guildList[i].dojoRank, value: str, inline:true }
          );
          if((i % 9 === 0 && i > 0) || i+1 >= users[index].dojo.guildList.length) {
            msg.channel.send({ embeds: [currEmbed] });
            currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Member List');
          }
        }
      }
    }
    else if(args.length === 2) {
      if(args[0] === 'pass' || args[0] === 'passleader') {
        let tindex = getCharListIndex(args[1]);
        if(tindex === null) {
          let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Error');
          currEmbed.setDescription('Target is invalid.');
          msg.channel.send({ embeds: [currEmbed] });
          return;
        }

        if(users[index].dojo.guildLeader.userID !== users[tindex].userID) {
          let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Error');
          currEmbed.setDescription("You are not the dojo's master.");
          msg.channel.send({ embeds: [currEmbed] });
          return;
        }

        if(tindex === index) {
          let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Error');
          currEmbed.setDescription('You cannot pass to yourself.');
          msg.channel.send({ embeds: [currEmbed] });
          return;
        }
      }
      passGuild(users[index], users[tindex]);
    }
    else if(args.length > 2) {
      if(args[0] === 'create') {
        if(args.length < 3) {
          let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
          currEmbed.setDescription('dojo | dojo[members/disband] | dojo[invite/apply/kick/passleader][user] | dojo[create][name][guild style name]');
          msg.channel.send({ embeds: [currEmbed] });
          return;
        }
        if(users[index].dojo !== null) {
          let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Error');
          currEmbed.setDescription('You are already part of a dojo.');
          msg.channel.send({ embeds: [currEmbed] });
          return;
        }

        let tstr = args[1];
        let str = "";

        for(let i = 0; i < tstr.length; i++) {
          let c = tstr.charAt(i);
          if(i === 0 || str[i-1] === "_") {
            c = c.toUpperCase();
          }
          str += c;
        }
        str = str.trim();

        let stylestr = "";
        let count = 0;
        for(let i = 2; i < args.length; i++) {
          if(args[i].toLowerCase() === 'style') {
            let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Error');
            currEmbed.setDescription('"Style" will be added to the end of your guild style automatically. Try again.');
            msg.channel.send({ embeds: [currEmbed] });
            return;
          }

          if(count === 0) count++;
          else stylestr += '_'
          stylestr += args[i].charAt(0).toUpperCase() + args[i].slice(1);
        }
        stylestr = stylestr.trim() + "_Style";

        users[index].dojo = new Dojo(users[index],str,stylestr);
        dojoList.push(users[index].dojo);
        loader.dojoSaver(dojoList);

        let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Successfully created: ' + users[index].dojo.guildName.replace(/\_/g,' '));
        let estr = 'Total Members: ' + users[index].dojo.guildList.length + ' / ' + users[index].dojo.maxSize;
        let valueStr = 'Guild Leader: <@' + users[index].dojo.guildLeader.userID + '>';
        valueStr += '\nGuild Style Name: ' + users[index].dojo.guildStyle.replace(/\_/g,' ');
        valueStr += '\nGuild Applications: ' + users[index].dojo.replyType;

        currEmbed.setDescription(valueStr);
        currEmbed.setFooter({ text: estr });
        msg.channel.send({ embeds: [currEmbed] });
      }
    }
  }


  if(command === 'party') {
    let index = findID(msg.author.id);
    if(index === -1) return;

    if(args.length === 0) {
      if(charList[index].party === null) {
        let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Error');
        currEmbed.setDescription('This character is not in a party. Use party create [name] to make one.');
        msg.channel.send({ embeds: [currEmbed] });
        return;
      }

      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle(charList[index].party.partyName.replace(/\_/g,' ') + ' Character List');
      for(let i = 0; i < charList[index].party.partyList.length; i++) {
        let valueStr = 'Power Value: ' + (charList[index].party.partyList[i].level*charList[index].party.partyList[i].attributes.stotal).toLocaleString(undefined);
        valueStr += '\nStat Total: ' + charList[index].party.partyList[i].attributes.stotal.toLocaleString(undefined);
        valueStr += '\nLevel: ' + charList[index].party.partyList[i].level.toLocaleString(undefined);

        currEmbed.addFields(
          { name: charList[index].party.partyList[i].name.replace(/\_/g,' '), value: valueStr, inline:true }
          );
      }
      msg.channel.send({ embeds: [currEmbed] });
    }
    else if(args.length > 0) {
      if(checkBattles(msg.author.id, charList[index].name) === 1) {
        let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Error');
        currEmbed.setDescription('You cannot do this in battle.');
        msg.channel.send({ embeds: [currEmbed] });
        return;
      }
      if(args[0] === 'create') {
        if(args.length < 2) {
          let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
          currEmbed.setDescription('party | party[leave/disband/kick] | party[create/invite][name/user]');
          msg.channel.send({ embeds: [currEmbed] });
          return;
        }
        if(charList[index].party !== null) {
          let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Error');
          currEmbed.setDescription('This character is already in a party.');
          msg.channel.send({ embeds: [currEmbed] });
          return;
        }

        let str = "";
        let count = 0;
        for(let i = 1; i < args.length; i++) {
          if(count === 0) count++;
          else str += '_'
          str += args[i].charAt(0).toUpperCase() + args[i].slice(1);
        }
        str = str.trim();

        charList[index].party = new Party(charList[index],str);
        partyList.push(charList[index].party);
        loader.partySaver(partyList);

        let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Successfully created: ' + charList[index].party.partyName.replace(/\_/g,' '));
        for(let i = 0; i < charList[index].party.partyList.length; i++) {
          let valueStr = 'Power Value: ' + (charList[index].party.partyList[i].level*charList[index].party.partyList[i].attributes.stotal).toLocaleString(undefined);
          valueStr += '\nStat Total: ' + charList[index].party.partyList[i].attributes.stotal.toLocaleString(undefined);
          valueStr += '\nLevel: ' + charList[index].party.partyList[i].level.toLocaleString(undefined);

          currEmbed.addFields(
            { name: charList[index].party.partyList[i].name.replace(/\_/g,' '), value: valueStr, inline:true }
            );
        }
        msg.channel.send({ embeds: [currEmbed] });
      }
      else if(args[0] === 'apply') { 
        if(args.length !== 2) {
          let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
          currEmbed.setDescription('party | party[leave/disband/kick] | party[create/invite][name/user]');
          msg.channel.send({ embeds: [currEmbed] });
          return;
        }

        let tIndex = findID(args[1]);
        if(tIndex === -1 || charList[tIndex].party === null || charList[tIndex].party.partyLeader.name !== charList[tIndex].name 
            || charList[tIndex].party.partyLeader.playerID !== charList[tIndex].playerID) {
          let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle("Error");
          currEmbed.setDescription("That is not a valid target to request an invite to a party.");
          msg.channel.send({ embeds: [currEmbed] });
          return;
        }
        if(charList[index].party !== null) {
          let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle("Error");
          currEmbed.setDescription("You can't apply to be in a party while being in one.");
          msg.channel.send({ embeds: [currEmbed] });
          return;
        }
        displayPartyInvite(charList[index],charList[tIndex], 0);
      }
      else if(charList[index].party === null) { 
        let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle("Error");
        currEmbed.setDescription("You're not in a party.");
        msg.channel.send({ embeds: [currEmbed] });
        return;
      }
      else if(args[0] === 'invite') { 
        if(args.length !== 2) {
          let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
          currEmbed.setDescription('party | party[leave/disband/kick] | party[create/invite][name/user]');
          msg.channel.send({ embeds: [currEmbed] });
          return;
        }
        let tIndex = findID(args[1]);
        if(tIndex === -1) {
          let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle("Error");
          currEmbed.setDescription("That is not a valid target to invite to a party.");
          msg.channel.send({ embeds: [currEmbed] });
          return;
        }
        let length = charList[index].party.partyList.length;
        for(let i = 0; i < length; i++) {
          if(charList[index].party.partyList[i].name === charList[tIndex].name &&
            charList[index].party.partyList[i].playerID === charList[tIndex].playerID) {
            let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle("Error");
            currEmbed.setDescription("That character is already in your party.");
            msg.channel.send({ embeds: [currEmbed] });
            return;
          }
        }
        displayPartyInvite(charList[index],charList[tIndex], 1);
      }
      else if(args.length == 1 && args[0] === 'kick') { 
        if(charList[index] < 2) {
          let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle("Error");
          currEmbed.setDescription("There's no one to remove from the party.");
          msg.channel.send({ embeds: [currEmbed] });
          return;
        }

        displayPartyKick(charList[index]);
      }
      else if(args.length == 1 && args[0] === 'leave') { 
        if(charList[index].party.partyLeader.name === charList[index].name &&
          charList[index].party.partyLeader.playerID === charList[index].playerID) {
          let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle("Error");
          currEmbed.setDescription("You can't leave a party you're leading.");
          msg.channel.send({ embeds: [currEmbed] });
          return;
        }
        let length = charList[index].party.partyList.length;
        for(let i = 0; i < length; i++) {
          if(charList[index].party.partyList[i].name === charList[index].name &&
            charList[index].party.partyList[i].playerID === charList[index].playerID) {
            charList[index].party.partyList.splice(i,1);
            charList[index].party = null;
            break;
          }
        }
        loader.partySaver(partyList);
        let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle("Success");
        currEmbed.setDescription("You left your party.");
        msg.channel.send({ embeds: [currEmbed] });
        return;
      }
      else if(args.length == 1 && args[0] === 'disband') { 
        if(charList[index].party.disbanding === 0) { 
          if(charList[index].party.partyLeader.name !== charList[index].name && charList[index].party.partyLeader.playerID !== charList[index].playerID) {
            let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle("Error");
            currEmbed.setDescription("You're not the party leader.");
            msg.channel.send({ embeds: [currEmbed] });
            return;
          }
          else {
            charList[index].party.disbanding = 1;
            let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Are you sure?');
            currEmbed.setDescription('Use this command again to disband your team ' + charList[index].party.partyName.replace(/\_/g,' ') + '.');
            msg.channel.send({ embeds: [currEmbed] });
            return;
          }
        }
        else {
          //let pIndex = partyList.indexOf(charList[index].party);
          let pIndex = partyList.map(function(e) { return e.partyName+e.partyLeader.name; }).indexOf(charList[index].party.partyName+charList[index].name);
          let length = charList[index].party.partyList.length;
          for(let i = 0; i < length; i++) {
            if(charList[index].name+charList[index].playerID !== charList[index].party.partyList[i].name+charList[index].party.partyList[i].playerID) charList[index].party.partyList[i].party = null;
          }
          charList[index].party = null;
          partyList.splice(pIndex,1);
          loader.partySaver(partyList);

          let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Done.');
          currEmbed.setDescription('Your party has been disbanded.');
          msg.channel.send({ embeds: [currEmbed] });
          return;
        }
      }
    }
    else {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
      currEmbed.setDescription('party | party[leave/disband/kick] | party[create/invite][name/user]');
      msg.channel.send({ embeds: [currEmbed] });
      return;
    }
  }

  if(command === 'style' || command === 'fightingstyle') {
    let index = findID(msg.author.id);
    if(args.length === 0) {
      printStyle(charList[index]);
    }
    else if(args.length > 0) {
      if(args[0] === "create") {
        if(args.length === 2 && charList[index].techModify === 1 && charList[index].techniquePoints > 25) {
          charList[index].styleName = args[1][0].toUpperCase() + args[1].substring(1) + '_Style';
          charList[index].fightingStyle.name = charList[index].styleName;
          charList[index].statusUpdate(0);
          charList[index].techModify = 0;
          charList[index].techniquePoints -= 25;
          loader.characterSaver(charList);
          loader.styleSaver(npcList,charList);
          printStyle(charList[index]);
        }
        else if(charList[index].fightingStyle.getTotalChange() > 0) {
          let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Fighting Style Already Set');
          currEmbed.setDescription('Use command: **style create [new name]** again to spend 25 technique points to rename it.');
          msg.channel.send({ embeds: [currEmbed] });
          charList[index].techModify = 1;
          return;
        }
        else if(args.length !== 5) {
          let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
          currEmbed.setDescription('style | style[npc/player] | style modify \nstyle create name [mainstat] [mainstat] [mainstat] | style create [new name]');
          msg.channel.send({ embeds: [currEmbed] });
          return;
        }
        else if(charList[index].techniquePoints < 150) {
          let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Not Enough Technique Points');
          currEmbed.setDescription('You need 150 technique points to create a fighting style.');
          msg.channel.send({ embeds: [currEmbed] });
          return;
        }
        else {
          if(args[2] === args[3] || args[2] === args[4] || args[3] === args[4]) {
            let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
            currEmbed.setDescription('You must choose three different mainstats when creating a fighting style.');
            msg.channel.send({ embeds: [currEmbed] });
            return;
          }
          else {
            if(args[4] !== 'str' && args[4] !== 'dex' && args[4] !== 'con' 
              && args[4] !== 'eng' && args[4] !== 'foc' && args[4] !== 'sol') {
              let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
              currEmbed.setDescription('You must choose between [str,dex,con,eng,sol,foc].');
              msg.channel.send({ embeds: [currEmbed] });
              return;
            }
            else if(args[2] !== 'str' && args[2] !== 'dex' && args[2] !== 'con' 
              && args[2] !== 'eng' && args[2] !== 'foc' && args[2] !== 'sol') {
              let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
              currEmbed.setDescription('You must choose between [str,dex,con,eng,sol,foc].');
              msg.channel.send({ embeds: [currEmbed] });
              return;
            }
            else if(args[3] !== 'str' && args[3] !== 'dex' && args[3] !== 'con' 
              && args[3] !== 'eng' && args[3] !== 'foc' && args[3] !== 'sol') {
              let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
              currEmbed.setDescription('You must choose between [str,dex,con,eng,sol,foc].');
              msg.channel.send({ embeds: [currEmbed] });
              return;
            }
            else {
              if(charList[index].fightingStyle.getTotalChange() > 0) {
                //shouldn't make it here
              }
              else {
                //make it
                for(let i = 2; i < args.length; i++) {
                  if(args[i] === 'str') {
                    charList[index].fightingStyle.bstr += 0.05;
                  }
                  else if(args[i] === 'dex') {
                    charList[index].fightingStyle.bdex += 0.05;
                  }
                  else if(args[i] === 'con') {
                    charList[index].fightingStyle.bcon += 0.05;
                  }
                  else if(args[i] === 'eng') {
                    charList[index].fightingStyle.beng += 0.05;
                  }
                  else if(args[i] === 'sol') {
                    charList[index].fightingStyle.bsol += 0.05;
                  }
                  else if(args[i] === 'foc') {
                    charList[index].fightingStyle.bfoc += 0.05;
                  }
                }
                charList[index].styleName = args[1][0].toUpperCase() + args[1].substring(1) + '_Style';
                charList[index].fightingStyle.name = charList[index].styleName;
                charList[index].statusUpdate(0);
                charList[index].techniquePoints -= 150;
                loader.characterSaver(charList);
                loader.styleSaver(npcList,charList);
                printStyle(charList[index]);
              }
            }
          }
        }
      }
      else if(args[0] === "modify") {
        let cap = styleBonusCap + 50 * (parseInt(charList[index].potentialUnlocked) + parseInt(charList[index].potentialUnleashed));
        if(parseInt(charList[index].fightingStyle.getTotalChange()) >= cap) {
          let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Error');
          currEmbed.setDescription('Your fighting style is already perfected!');
          msg.channel.send({ embeds: [currEmbed] });
          return;
        }

        if(checkBattles(msg.author.id, charList[index].name) === 1) {
          msg.channel.send("You cannot do this in battle.");
          return;
        }
        else if(args.length !== 1 && args.length !== 2) {
          let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
          currEmbed.setDescription('style | style[npc/player] | style modify \nstyle create name [mainstat] [mainstat] [mainstat] | style create [new name]');
          msg.channel.send({ embeds: [currEmbed] });
          return;
        }
        else if(charList[index].fightingStyle.getTotalChange() > 0) {
          let styleCost = 0;
          styleCost += calcStyleUpgrade(charList[index].fightingStyle,1);
          if(charList[index].techniquePoints >= styleCost) {
            if(charList[index].styleModify !== 0) {
              let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle("Error");
              currEmbed.setDescription("You are already modifying your fighting style.");
              msg.channel.send({ embeds: [currEmbed] });
              return;
            }
            displayModifyStyle(styleCost,charList[index],1);
          }
          else {
            let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Not Enough Technique Points');
            currEmbed.setDescription('This takes ' + styleCost + ' technique points, but you only have ' + charList[index].techniquePoints + '.');
            msg.channel.send({ embeds: [currEmbed] });
            return;
          }
        }
        else {
          let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('No Style');
          currEmbed.setDescription('Use style create [name] [mainstat] [mainstat] [mainstat] to create a fighting style first.');
          msg.channel.send({ embeds: [currEmbed] });
          return;
        }
      }
      else {
        let allChars = new Array();
        for(let i = 0; i < npcList.length; i++) {
          allChars.push(npcList[i]);
        }
        for(let i = 0; i < users.length; i++) {
          let index = findID(users[i].userID);
          allChars.push(charList[index]);
        }
        args[0] = args[0].replace("<","");
        args[0] = args[0].replace("@","");
        args[0] = args[0].replace(">","");

        let charI = allChars.map(function(e) 
        { 
          if(e.playerID === "NPC") return e.name.toLowerCase();
          else return e.playerID; 
        }).indexOf(args[0]);

        if(charI === -1) {
          let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Character Not Found');
          currEmbed.setDescription('style | style[npc/player] | style modify \nstyle create name [mainstat] [mainstat] [mainstat] | style create [new name]');
          msg.channel.send({ embeds: [currEmbed] });
          return;
        }
        printStyle(allChars[charI]);
      }
    }
  }

  if(command === 'battlebuffs' || command === 'teambuffs') {
    if(args.length === 0) {
      let index = findID(msg.author.id);
      let bcheck = getCurrentBattle(msg.author.id, charList[index].name);

      if(index === -1) return;
      if(bcheck === -1) return;

      for(let j = 0; j < activeCombatList[bcheck].pCombatants.length; j++) {
        let char = activeCombatList[bcheck].pCombatants[j];
        let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Buff List: ' + char.name.replace(/\_/g,' '));
        currEmbed.addFields(
          { name: char.race.raceName.replace(/\_/g,' '), value: char.race.outputRacialBonus(), inline:true }
        );
        for(let i = 0; i < char.battleCurrAtt.buffs.length; i++) {
          currEmbed.addFields(
            { name: char.battleCurrAtt.buffs[i].name.replace(/\_/g,' '), value: char.battleCurrAtt.buffs[i].outputBonusStr(), inline:true }
            );
        }
        msg.channel.send({ embeds: [currEmbed] });
      }
    }
  }

  if(command === 'enemybuffs') {
    if(args.length === 0) {
      let index = findID(msg.author.id);
      let bcheck = getCurrentBattle(msg.author.id, charList[index].name);

      if(index === -1) return;
      if(bcheck === -1) return;

      for(let j = 0; j < activeCombatList[bcheck].NPCombatants.length; j++) {
        let char = activeCombatList[bcheck].NPCombatants[j];
        let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Buff List: ' + char.name.replace(/\_/g,' '));
        currEmbed.addFields(
          { name: char.race.raceName.replace(/\_/g,' '), value: char.race.outputRacialBonus(), inline:true }
        );
        for(let i = 0; i < char.battleCurrAtt.buffs.length; i++) {
          currEmbed.addFields(
            { name: char.battleCurrAtt.buffs[i].name.replace(/\_/g,' '), value: char.battleCurrAtt.buffs[i].outputBonusStr(), inline:true }
            );
        }
        msg.channel.send({ embeds: [currEmbed] });
      }
    }
  }

  if(command === 'buffs') {
    if(args.length === 0) {
      let index = findID(msg.author.id);
      if(index === -1) return;

      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Buff List');
      currEmbed.addFields(
        { name: charList[index].race.raceName.replace(/\_/g,' '), value: charList[index].race.outputRacialBonus(), inline:true }
      );
      for(let i = 0; i < charList[index].battleCurrAtt.buffs.length; i++) {
        currEmbed.addFields(
          { name: charList[index].battleCurrAtt.buffs[i].name.replace(/\_/g,' '), value: charList[index].battleCurrAtt.buffs[i].outputBonusStr(), inline:true }
          );
      }
      msg.channel.send({ embeds: [currEmbed] });
    }
    else if(args.length === 1) {
      let allChars = new Array();
      for(let i = 0; i < npcList.length; i++) {
        allChars.push(npcList[i]);
      }
      for(let i = 0; i < users.length; i++) {
        let index = findID(users[i].userID);
        allChars.push(charList[index]);
      }
      args[0] = args[0].replace("<","");
      args[0] = args[0].replace("@","");
      args[0] = args[0].replace(">","");

      let charI = allChars.map(function(e) 
      { 
        if(e.playerID === "NPC") return e.name.toLowerCase();
        else return e.playerID; 
      }).indexOf(args[0]);

      if(charI === -1) {
        let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Character Not Found');
        currEmbed.setDescription('buffs || buffs[npc/player]');
        msg.channel.send({ embeds: [currEmbed] });
        return;
      }

      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Buff List');
      currEmbed.addFields(
        { name: allChars[charI].race.raceName.replace(/\_/g,' ') + ' Benefits', value: allChars[charI].race.outputRacialBonus(), inline:true }
      );
      for(let i = 0; i < allChars[charI].battleCurrAtt.buffs.length; i++) {
        currEmbed.addFields(
          { name: allChars[charI].battleCurrAtt.buffs[i].name.replace(/\_/g,' '), value: allChars[charI].battleCurrAtt.buffs[i].outputBonusStr(), inline:true }
          );
      }
      msg.channel.send({ embeds: [currEmbed] });
    }
    else {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
      currEmbed.setDescription('buffs || buffs[npc/player]');
      msg.channel.send({ embeds: [currEmbed] });
      return;
    }
  }

  if(command === 'shop') {
    let cArr = getCharList(msg.author.id);
    let index = findID(msg.author.id);

    if(cArr!== null) {
      if(checkBattles(msg.author.id, charList[index].name) === 1) {
        msg.channel.send("You cannot do this in battle.");
        return;
      }
      if(cArr.shopping === 1) {
        msg.channel.send("You're already shopping.");
        return;
      }

      displayShop(cArr);
    }
  }

  if(command === 'sellitem') {
    if(args.length == 3 ) { 
      let cArr = getCharList(msg.author.id);
      if(cArr!== null) {
        let gArr = getCharList(args[2]);
        if(gArr !== null) {
          if(!isNaN(args[0]) && !isNaN(args[1]) && args[1] > 0) {
            if(args[0] > 0 && args[0] <= cArr.itemInventory.items.length) {
              displayOffer(cArr,gArr,args[1],cArr.itemInventory.items[args[0]-1]);
            }
            else {
              let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
              currEmbed.setDescription('No item in that slot.');
              msg.channel.send({ embeds: [currEmbed] });
            }
          }
          else {
            let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
            currEmbed.setDescription('sellitem[itemslot][amount][target]');
            msg.channel.send({ embeds: [currEmbed] });
          }
        }
        else {
          let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Target');
          currEmbed.setDescription('Target has no characters.');
          msg.channel.send({ embeds: [currEmbed] });
        }
      }
      else {
        let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('No Characters');
        currEmbed.setDescription('Please create a character first.');
        msg.channel.send({ embeds: [currEmbed] });
      }
    }
    else {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
      currEmbed.setDescription('sellitem[itemslot][amount][target]');
      msg.channel.send({ embeds: [currEmbed] });
    }
  }

  if(command === 'affixitem' || command === 'addaffix' || command === 'affix') {
    if(args.length == 1 ) { 
      let cArr = getCharList(msg.author.id);
      if(cArr!== null) {
        if(!isNaN(args[0])) {
          if(args[0] > 0 && args[0] <= cArr.itemInventory.items.length) {
            if(cArr.itemInventory.items[args[0]-1].addedAffixes < cArr.itemInventory.items[args[0]-1].maxAddedAffix) {
              displayAffixing(cArr, cArr.itemInventory.items[args[0]-1]);
            }
            else {
              printItem(cArr.itemInventory.items[args[0]-1]);
              let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Cannot Affix');
              currEmbed.setDescription("This item has reached it's maximum for affixing.");
              msg.channel.send({ embeds: [currEmbed] });
              return;
            }
          }
          else {
            let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
            currEmbed.setDescription('No item in that slot.');
            msg.channel.send({ embeds: [currEmbed] });
          }
        }
        else {
          let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
          currEmbed.setDescription('affixitem[itemslot]');
          msg.channel.send({ embeds: [currEmbed] });
        }
      }
      else {
        let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('No Characters');
        currEmbed.setDescription('Please create a character first.');
        msg.channel.send({ embeds: [currEmbed] });
      }
    }
    else {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
      currEmbed.setDescription('affixitem[itemslot]');
      msg.channel.send({ embeds: [currEmbed] });
    }
  }

  if(command === 'givezeni' || command === 'gib') {
    if(args.length == 2 ) { 
      let cArr = getCharList(msg.author.id);
      if(cArr !== null) {
        let gArr = getCharList(args[1]);
        if(gArr !== null) {
          if(!isNaN(args[0])) {
            if(args[0] < cArr.zeni && args[0] > 0)
            {
              if(cArr.tutorial === 1 || gArr.tutorial === 1 ) {
                let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Slow Down!');
                currEmbed.setDescription("Follow the tutorial to the end before doing this.");
                msg.channel.send({ embeds: [currEmbed] });
                return;
              }

              cArr.zeni -= args[0];
              gArr.zeni += parseInt(args[0]);

              loader.userSaver(users);
              msg.channel.send("<@" + gArr.userID + "> was sent money.");
            }
            else {
              let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
              currEmbed.setDescription("You can't give that much zeni.");
              msg.channel.send({ embeds: [currEmbed] });
            }
          }
          else {
            let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
            currEmbed.setDescription('givezeni[amount][target]');
            msg.channel.send({ embeds: [currEmbed] });
          }
        }
        else {
          let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Target');
          currEmbed.setDescription('Target has no characters.');
          msg.channel.send({ embeds: [currEmbed] });
        }
      }
      else {
        let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('No Characters');
        currEmbed.setDescription('Please create a character first.');
        msg.channel.send({ embeds: [currEmbed] });
      }
    }
    else {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
      currEmbed.setDescription('givezeni[amount][target]');
      msg.channel.send({ embeds: [currEmbed] });
    }
  }

  if(command === 'profile' || command === 'user' || command === 'mychars' || command === 'mychar') {
    let cArr = getCharList(msg.author.id);
    let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle(msg.author.username);
    currEmbed.setThumbnail(msg.author.avatarURL());
    if(cArr !== null) {
      for(let i = 0; i < cArr.charIDs.length; i++) {
        let str = charList[cArr.charIDs[i]].name + ', ' + charList[cArr.charIDs[i]].race.raceName.replace(/\_/g,' ') + '\nPower Value: ' + (charList[cArr.charIDs[i]].level*charList[cArr.charIDs[i]].attributes.stotal).toLocaleString(undefined);
        str += '\nStat Total: ' + charList[cArr.charIDs[i]].attributes.stotal.toLocaleString(undefined);
        if(charList[cArr.charIDs[i]].training > 0) str += '\nTraining for ' + charList[cArr.charIDs[i]].training.toLocaleString(undefined) + ' more hours';
        currEmbed.addField('Character ' + (1+i), str);
      }
      currEmbed.setFooter({ text: 'You have ' + cArr.zeni.toLocaleString(undefined) + ' zeni' });
      msg.channel.send({ embeds: [currEmbed] });
    }
  }

  if(command === 'setcharimage') {
    if(args.length == 1 && isImage(args[0])) { 
      let index = findID(msg.author.id);
      charList[index].image = args[0];
      loader.characterSaver(charList);
    }
    else {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
      currEmbed.setDescription('setcharimage[imageURL]');
      msg.channel.send({ embeds: [currEmbed] });
    }
  }

  if(command === 'setchar') {
    let index = getCharListIndex(msg.author.id);
     if(index !== null) {
      /*if(checkBattles(msg.author.id, charList[index].name) === 1) {
        msg.channel.send("You cannot do this in battle.");
        return;
      }*/

      if(args[0] === null || isNaN(args[0])) {
        let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
        currEmbed.setDescription('setchar[index]');
        msg.channel.send({ embeds: [currEmbed] });
        return;
      }
      if(args[0] > users[index].charIDs.length || args[0] < 1) {
        msg.channel.send('Given value is out of range.');
        return;
      }
      users[index].currentChar = Number(args[0]) - 1;
      msg.channel.send('New main character is ' + charList[users[index].getCurrentChar()].name);
      loader.userSaver(users);
     }
  }

  if(command === 'overwrite') {
    let index = findID(msg.author.id);

    if(args.length == 3 && !isNaN(args[2])) { 
      let newOne = -1;
      let arg2 = args[2] - 1;
      for(let i = 0; i < users.length; i++) {
        if(users[i].userID === msg.author.id) {
          newOne = i;
        }
      }

      if(users[newOne].charIDs.length <= arg2 || 0 > arg2) {
        msg.channel.send("Not a valid slot.")
        return;
      }

      let attr = new Attributes(0,0,0,0,0,0);
      let c = new Character(args[0].charAt(0).toUpperCase() + args[0].slice(1), new Races(args[1].charAt(0).toUpperCase() + args[1].slice(1)),attr,msg.author.id);
      c.addTechnique('28',users[newOne]);

      if(newOne === -1) {
        msg.channel.send("You have no characters.")
        return;
      }
      else {
        for(let i = 0; i < users[newOne].charIDs.length; i++) {
          if(charList[users[newOne].charIDs[i]].name === c.name && i !== arg2) {
            let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Error');
            currEmbed.setDescription('You already have a character with that name!');
            msg.channel.send({ embeds: [currEmbed] });
            return
          }
        }
      }
      if(checkBattles(msg.author.id, charList[index].name) === 1) {
        msg.channel.send("You cannot do this in battle.");
        return;
      }

      let OR = users[newOne].overwrite(arg2);
      if(OR === null || OR === -1) {
        let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle(charList[users[newOne].charIDs[arg2]].name.replace(/\_/g,' '));
        if(charList[users[newOne].charIDs[arg2]].image === '' || charList[users[newOne].charIDs[arg2]].image === null) { currEmbed.setThumbnail(msg.author.avatarURL()); }
        else { currEmbed.setThumbnail(charList[users[newOne].charIDs[arg2]].image); }
        currEmbed.addFields(
          { name: 'Are you sure?', value: 'Equipped items will be lost. Re-enter command to confirm.', inline:true }
          );
        msg.channel.send({ embeds: [currEmbed] });
        return;
      }


      msg.channel.send(c.name + ' was created.');
      if(c == null) msg.channel.send('Empty');

      c.image = msg.author.avatarURL();
      printStat(c); 
      if(charList[users[newOne].charIDs[arg2]].party !== null && charList[users[newOne].charIDs[arg2]].name === charList[users[newOne].charIDs[arg2]].party.partyLeader.name &&
        charList[users[newOne].charIDs[arg2]].playerID === charList[users[newOne].charIDs[arg2]].party.partyLeader.playerID) {
          let pIndex = partyList.map(function(e) { return e.partyName+e.partyLeader.name; }).indexOf(charList[users[newOne].charIDs[arg2]].party.partyName+charList[users[newOne].charIDs[arg2]].name);
          let length = charList[users[newOne].charIDs[arg2]].party.partyList.length;
          for(let i = 0; i < length; i++) {
            if(charList[users[newOne].charIDs[arg2]].name+charList[users[newOne].charIDs[arg2]].playerID !== charList[users[newOne].charIDs[arg2]].party.partyList[i].name+charList[users[newOne].charIDs[arg2]].party.partyList[i].playerID) {
              charList[users[newOne].charIDs[arg2]].party.partyList[i].party = null;
            } 
          }
          charList[users[newOne].charIDs[arg2]].party = null;
          partyList.splice(pIndex,1);
      } 
      else if(charList[users[newOne].charIDs[arg2]].party !== null) charList[users[newOne].charIDs[arg2]].party.removeCharacter(charList[users[newOne].charIDs[arg2]]);

      charList[users[newOne].charIDs[arg2]] = c;
    }
    else {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
      currEmbed.setDescription('overwrite[name][race][index]');
      msg.channel.send({ embeds: [currEmbed] });
    }

    loader.partySaver(partyList);
    loader.characterSaver(charList);
    loader.userSaver(users);
    loader.styleSaver(npcList, charList);
  }

  if(command === 'newchar' || command === 'createchar') {
    if(args.length == 2) { 
      let attr = new Attributes(0,0,0,0,0,0);
      let raceName = args[1].charAt(0).toUpperCase() + args[1].slice(1);


      let newOne = -1;
      for(let i = 0; i < users.length; i++) {
        if(users[i].userID === msg.author.id) {
          if(users[i].charIDs.length >= users[i].getMaxChar()) {
            msg.channel.send('You can only have ' + users[i].getMaxChar() + ' characters.');
            return;
          }
          newOne = i;
        }
      }

      let name = args[0].charAt(0).toUpperCase() + args[0].slice(1);

      if(newOne === -1) {
        if(raceName === "Core-person") {
          raceName === "Alien";
        }
        inv = new Inventory(invList.length,msg.author.id)
        invList.push(inv);
        loader.inventorySaver(invList);
        newOne = users.length;
        users.push(new User(msg.author.id, inv));
        users[newOne].charIDs.push((charList.length));
        users[newOne].addTag('28');
        let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Welcome to Zeno RPG!');
        currEmbed.setThumbnail("https://cdn.discordapp.com/attachments/986234335051018340/988244698265161728/unknown.png")
        currEmbed.setDescription("Please use *g statup[statname][amount]* before you begin! If you follow the tutorial to the end, you'll get a nice reward.");
        msg.channel.send({ embeds: [currEmbed] });
      }
      else {
        for(let i = 0; i < users[newOne].charIDs.length; i++) {
          if(charList[users[newOne].charIDs[i]].name === name) {
            let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Error');
            currEmbed.setDescription('You already have a character with that name!');
            msg.channel.send({ embeds: [currEmbed] });
            return
          }
        }
      }
      if(raceName === "Core-person" && users[newOne].kai === 0) {
        raceName === "Alien";
      }

      let c = new Character(name, new Races(raceName),attr,msg.author.id);
      msg.channel.send(c.name + ' was created.');
      if(c == null) msg.channel.send('Empty');

      c.image = msg.author.avatarURL();
      printStat(c);
      c.addTechnique('28',users[newOne]);
      users[newOne].charIDs.push(charList.length);
      charList.push(c);
    }
    else {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
      currEmbed.setDescription('newchar[name][race]');
      msg.channel.send({ embeds: [currEmbed] });
      return;
    }

    loader.characterSaver(charList);
    loader.userSaver(users);
    loader.styleSaver(npcList, charList);
  }

//todo: interface
  if(command === 'statup') {
    let index = findID(msg.author.id);

    if(args.length !== 2) {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
      currEmbed.setDescription('statup[stat][amount]');
      msg.channel.send({ embeds: [currEmbed] });
      return;
    }

    if(checkBattles(msg.author.id, charList[index].name) === 1) {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Error');
      currEmbed.setDescription('You cannot do this in battle.');
      msg.channel.send({ embeds: [currEmbed] });
      return;
    }

    if(index === -1) {
    }
    else if(charList[index].statPoints < Number(args[1])) {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Error');
      currEmbed.setDescription("You don't have that many stat points to use.");
      msg.channel.send({ embeds: [currEmbed] });
      return;
    }
    else if(args[0] == 'str' && charList[index].attributes.str+parseInt(args[1]) <= charList[index].race.maxStr) {
      charList[index].attributes.str += Number(args[1]);
      charList[index].statPoints -= Number(args[1]);
      charList[index].statusUpdate(0,new Attributes(0,0,0,0,0,0));
      msg.channel.send("Done.");
    }
    else if(args[0] == 'dex' && charList[index].attributes.dex+parseInt(args[1]) <= charList[index].race.maxDex) {
      charList[index].attributes.dex += Number(args[1]);
      charList[index].statPoints -= Number(args[1]);
      charList[index].statusUpdate(0,new Attributes(0,0,0,0,0,0));
      msg.channel.send("Done.");
    }
    else if(args[0] == 'con' && charList[index].attributes.con+parseInt(args[1]) <= charList[index].race.maxCon) {
      charList[index].attributes.con += Number(args[1]);
      charList[index].statPoints -= Number(args[1]);
      charList[index].statusUpdate(0,new Attributes(0,0,0,0,0,0));
      msg.channel.send("Done.");
    }
    else if(args[0] == 'eng' && charList[index].attributes.eng+parseInt(args[1]) <= charList[index].race.maxEng) {
      charList[index].attributes.eng += Number(args[1]);
      charList[index].statPoints -= Number(args[1]);
      charList[index].statusUpdate(0,new Attributes(0,0,0,0,0,0));
      msg.channel.send("Done.");
    }
    else if(args[0] == 'foc' && charList[index].attributes.foc+parseInt(args[1]) <= charList[index].race.maxFoc) {
      charList[index].attributes.foc += Number(args[1]);
      charList[index].statPoints -= Number(args[1]);
      charList[index].statusUpdate(0,new Attributes(0,0,0,0,0,0));
      msg.channel.send("Done.");
    }
    else if(args[0] == 'sol' && charList[index].attributes.sol+parseInt(args[1]) <= charList[index].race.maxSol) {
      charList[index].attributes.sol += Number(args[1]);
      charList[index].statPoints -= Number(args[1]);
      charList[index].statusUpdate(0,new Attributes(0,0,0,0,0,0));
      msg.channel.send("Done.");
    }
    else {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Error');
      currEmbed.setDescription("That is not a mainstat, or you're trying to go above a stat cap.");
      msg.channel.send({ embeds: [currEmbed] });
      return;
    }

    let uI = getCharListIndex(msg.author.id);
    if(uI !== null && users[uI].tutorial === 1) {
      let str = Help.tutorial(1);
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Tutorial');
      currEmbed.setThumbnail("https://cdn.discordapp.com/attachments/986234335051018340/988244698265161728/unknown.png")
      currEmbed.setDescription(str);
      msg.channel.send({ embeds: [currEmbed] });
    }

    loader.characterSaver(charList);
  }

  if(command === 'inventory' || command === 'inv') {
    let uid = getCharListIndex(msg.author.id);
    let index = findID(msg.author.id);

    if(index === -1 || uid === null) {
    }
    else {
      if(args.length === 1 || args.length === 2 || args.length === 0) {
        if(args.length > 0 && args[0] === "sort") {
          users[uid].itemInventory.items.sort(function(a,b) {return a.uid - b.uid });
          if(args.length > 1 && args[1] === "name") {
            users[uid].itemInventory.items.sort(function(a,b) {return a.name.localeCompare(b.name)});
          }
          else if(args.length > 1 && args[1] === "quality") {
            users[uid].itemInventory.items.sort(function(a,b) {return b.getQual() - a.getQual()});
          }
          else if(args.length > 1 && args[1] === "affixes") {
            users[uid].itemInventory.items.sort(function(a,b) {return b.addedAffixes - a.addedAffixes});
          }
          else if(args.length > 1 && args[1] === "totalbonus") {
            users[uid].itemInventory.items.sort(function(a,b) {return b.attbonus.getTotalChange() - a.attbonus.getTotalChange()});
          }
          else if (args.length !== 1) {
            let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
            currEmbed.setDescription('inv | inv sort | inv sort [name|quality|affixes|totalbonus]');
            msg.channel.send({ embeds: [currEmbed] });
            return;
          }
          loader.inventorySaver(invList);
        }
        else if(args.length > 0 && args[0] !== "sort") {
          let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
          currEmbed.setDescription('inv | inv sort | inv sort [name|quality|affixes|bonustotal]');
          msg.channel.send({ embeds: [currEmbed] });
          return;
        }

        printInventory(uid);
      }
    }
  }

  if(command === 'trashitem') {
    let uid = getCharListIndex(msg.author.id);
    let index = findID(msg.author.id);

    if(args.length !== 1) {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
      currEmbed.setDescription('trashitem[invslot]');
      msg.channel.send({ embeds: [currEmbed] });
      return;
    }

    if(index === -1 || uid === null) {
    }
    else if(!isNaN(args[0]) && args[0] > 0 && args[0] <= users[uid].itemInventory.items.length) {
      args[0] = Math.round(args[0]);
      let z = args[0] - 1;
      let y = itemList.indexOf(users[uid].itemInventory.items[z]);
      await users[uid].itemInventory.removeItem(args[0]);
      await itemList.splice(y,1)
      printInventory(uid);
    }
    else {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('No item found at given ID.');
      currEmbed.setDescription('Items in slots 1 to ' + users[uid].itemInventory.items.length);
      msg.channel.send({ embeds: [currEmbed] });
      return;
    }

    loader.itemSaver(itemList);
    loader.inventorySaver(invList);
  }

  if(command === 'viewitem' || command === 'itemview') {
    let uid = getCharListIndex(msg.author.id);
    let index = findID(msg.author.id);

    if(args.length !== 1) {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
      currEmbed.setDescription('viewitem[invslot]');
      msg.channel.send({ embeds: [currEmbed] });
      return;
    }

    if(index === -1 || uid === null) {
    }
    else if(!isNaN(args[0]) && args[0] > 0 && args[0] <= users[uid].itemInventory.items.length) {
      args[0] = Math.round(args[0]);
      let i = args[0] - 1;
      printItem(users[uid].itemInventory.items[i]);
    }
  }

  if(command === 'equipitem' || command === 'equip') {
    let uid = getCharListIndex(msg.author.id);
    let index = findID(msg.author.id);

    if(args.length !== 1) {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
      currEmbed.setDescription('equipitem[invslot]');
      msg.channel.send({ embeds: [currEmbed] });
      return;
    }

    if(index === -1 || uid === null) {
    }
    else if(!isNaN(args[0]) && args[0] > 0 && args[0] <= users[uid].itemInventory.items.length) {
      if(checkBattles(msg.author.id, charList[index].name) === 1) {
        msg.channel.send("You cannot do this in battle.");
        return;
      }
      args[0] = Math.round(args[0]);
      let i = args[0] - 1;
      if(users[uid].itemInventory.items[i].type === "Dogi") {
        let j = charList[index].dogi;
        charList[index].equipItem("Dogi",users[uid].itemInventory.items[i]);
        let ind = users[uid].itemInventory.items.map(function(e) { return e.uid; }).indexOf(charList[index].dogi.uid);
        users[uid].itemInventory.items.splice(ind,1);
        if(j !== null) {
          users[uid].itemInventory.items[i] = j;
          let buffID = charList[index].battleCurrAtt.buffs.map(function(e) { return e.name+e.type; }).indexOf(j.attbonus.name+j.attbonus.type);
          charList[index].removeBuff(buffID);
        }
      }
      else if(users[uid].itemInventory.items[i].type === "Weapon") {
        let j = charList[index].weapon;
        charList[index].equipItem("Weapon",users[uid].itemInventory.items[i]);
        let ind = users[uid].itemInventory.items.map(function(e) { return e.uid; }).indexOf(charList[index].weapon.uid);
        users[uid].itemInventory.items.splice(ind,1);
        if(j !== null)  {
          users[uid].itemInventory.items[i] = j;
          let buffID = charList[index].battleCurrAtt.buffs.map(function(e) { return e.name+e.type; }).indexOf(j.attbonus.name+j.attbonus.type);
          charList[index].removeBuff(buffID);
        }
      }
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle("Equipped");
      let wName;
      let dName;
      if(charList[index].weapon === null) wName = "Empty"
      else wName = charList[index].weapon.name.replace(/\_/g,' ');

      if(charList[index].dogi === null) dName = "Empty"
      else dName = charList[index].dogi.name.replace(/\_/g,' ');

      currEmbed.addFields(
        { name: 'Dogi', value: dName, inline:false },
        { name: 'Weapon', value: wName , inline:false }
        );
      msg.channel.send({ embeds: [currEmbed] });

      if(users[uid].tutorial === 1) {
        users[uid].tutorialNearEnd = 1;
        let str = Help.tutorial(4);
        let newEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Tutorial');
        newEmbed.setThumbnail("https://cdn.discordapp.com/attachments/986234335051018340/988244698265161728/unknown.png")
        newEmbed.setDescription(str);
        msg.channel.send({ embeds: [newEmbed] });
      }

      loader.characterSaver(charList);
      loader.inventorySaver(invList);
      loader.itemSaver(itemList);
    }
    else {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
      currEmbed.setDescription('equipitem[invslot]');
      msg.channel.send({ embeds: [currEmbed] });
      return;
    }
  }

  if(command === 'unequipitem' || command === 'unequip') {
    let uid = getCharListIndex(msg.author.id);
    let index = findID(msg.author.id);

    if(args.length !== 1) {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
      currEmbed.setDescription('unequipitem[Dogi/Weapon]');
      msg.channel.send({ embeds: [currEmbed] });
      return;
    }

    if(index === -1 || uid === null) {
    }
    else if (users[uid].itemInventory.items.length >= users[uid].itemInventory.maxSize) {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Inventory Full');
      currEmbed.setDescription("You don't have space in your inventory for this item.");
      msg.channel.send({ embeds: [currEmbed] });
      return;
    }
    else if(isNaN(args[0])) {
      if(checkBattles(msg.author.id, charList[index].name) === 1) {
        msg.channel.send("You cannot do this in battle.");
        return;
      }
      if(args[0] === "dogi") {
        if(charList[index].dogi === null) return;
        users[uid].itemInventory.addItem(charList[index].dogi);
        charList[index].dogi = null;
        charList[index].statusUpdate(0);
      }
      else if(args[0] === "weapon") {
        if(charList[index].weapon === null) return;
        users[uid].itemInventory.addItem(charList[index].weapon);
        charList[index].weapon = null;
        charList[index].statusUpdate(0);
      }
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle("Equipped");
      let wName;
      let dName;
      if(charList[index].weapon === null) wName = "Empty"
      else wName = charList[index].weapon.name.replace(/\_/g,' ');

      if(charList[index].dogi === null) dName = "Empty"
      else dName = charList[index].dogi.name.replace(/\_/g,' ');

      currEmbed.addFields(
        { name: 'Dogi', value: dName, inline:false },
        { name: 'Weapon', value: wName , inline:false }
        );
      msg.channel.send({ embeds: [currEmbed] });

      loader.characterSaver(charList);
      loader.inventorySaver(invList);
      loader.itemSaver(itemList);
    }
    else {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
      currEmbed.setDescription('unequipitem[Dogi/Weapon]');
      msg.channel.send({ embeds: [currEmbed] });
      return;
    }
  }

  if(command === 'viewequips' || command === "equips") {
    if(args.length === 0) {
      let uid = getCharListIndex(msg.author.id);
      let index = findID(msg.author.id);

      if(index === -1 || uid === null) {
      }
      else {
        let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle("Equipped");
        let wName;
        let dName;
        if(charList[index].weapon === null) {
          wName = "Empty"
        }
        else {
          wName = charList[index].weapon.name.replace(/\_/g,' ');
        }

        if(charList[index].dogi === null) {
          dName = "Empty"
        }
        else {
          dName = charList[index].dogi.name.replace(/\_/g,' '); 
        }

        currEmbed.addFields(
          { name: 'Dogi', value: dName, inline:false },
          { name: 'Weapon', value: wName , inline:false }
          );
        msg.channel.send({ embeds: [currEmbed] });
        if(dName !== "Empty") printItem(charList[index].dogi);
        if(wName !== "Empty") printItem(charList[index].weapon);
      }
    }
    else if(args.length === 1) {
      let allChars = new Array();
      for(let i = 0; i < npcList.length; i++) {
        allChars.push(npcList[i]);
      }
      for(let i = 0; i < users.length; i++) {
        let index = findID(users[i].userID);
        allChars.push(charList[index]);
      }
      args[0] = args[0].replace("<","");
      args[0] = args[0].replace("@","");
      args[0] = args[0].replace(">","");

      let charI = allChars.map(function(e) 
      { 
        if(e.playerID === "NPC") return e.name.toLowerCase();
        else return e.playerID; 
      }).indexOf(args[0]);

      if(charI === -1) {
        let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Character Not Found');
        currEmbed.setDescription('equips || equips[npc/player]');
        msg.channel.send({ embeds: [currEmbed] });
        return;
      }

      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle(allChars[charI].name + "'s Equipped Items");
      let wName;
      let dName;
      if(allChars[charI].weapon === null) {
        wName = "Empty"
      }
      else {
        wName = allChars[charI].weapon.name.replace(/\_/g,' ');
      }

      if(allChars[charI].dogi === null) {
        dName = "Empty"
      }
      else {
        dName = allChars[charI].dogi.name.replace(/\_/g,' '); 
      }

      currEmbed.addFields(
        { name: 'Dogi', value: dName, inline:false },
        { name: 'Weapon', value: wName , inline:false }
        );
      msg.channel.send({ embeds: [currEmbed] });
      if(dName !== "Empty") printItem(allChars[charI].dogi);
      if(wName !== "Empty") printItem(allChars[charI].weapon);
    }
    else {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
      currEmbed.setDescription('equips || equips[npc/player]');
      msg.channel.send({ embeds: [currEmbed] });
      return;
    }
  }

  if(command === 'viewweapon') {
    let uid = getCharListIndex(msg.author.id);
    let index = findID(msg.author.id);

    if(index === -1 || uid === null) {
    }
    else if(charList[index].weapon === null) {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle("No Weapon Equipped");
      msg.channel.send({ embeds: [currEmbed] });
    }
    else {
      printItem(charList[index].weapon);
    }
  }

  if(command === 'viewdogi' || command === 'viewarmor') {
    let uid = getCharListIndex(msg.author.id);
    let index = findID(msg.author.id);

    if(index === -1 || uid === null) {
    }
    else if(charList[index].dogi === null) {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle("No Dogi Equipped");
      msg.channel.send({ embeds: [currEmbed] });
    }
    else {
      printItem(charList[index].dogi);
    }
  }

  if(command === 'unlockedtech' || command === 'utech') {
    let index = getCharListIndex(msg.author.id);

    if(index === null) {
    }
    else {
      userTechPrint(users[index]);
    }
  }

  if(command === 'currenttech' || command === 'ctech') {
    let index = findID(msg.author.id);

    if(index === -1) {
    }
    else {
      charTechPrint(charList[index]);
    }
  }

  if(command === 'settransformation' || command === 'settrans') {
    let index = getCharListIndex(msg.author.id);
    let i = findID(msg.author.id);

    if(args.length !== 1 || isNaN(args[0])) {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
      currEmbed.setDescription('settransformation[techid]');
      msg.channel.send({ embeds: [currEmbed] });
      return;
    }
    let tag;

    if(index !== null && i !== -1) {
      tag = charList[i].race.raceName;
      if(tag.toLowerCase() === "half-saiyan") tag = "Saiyan";
    }
    if(techList[args[0]].tag !== "Common" && techList[args[0]].tag !== "Uncommon" && techList[args[0]].tag !== "Rare" && techList[args[0]].tag !== tag) {
      msg.channel.send("This character is not the correct race to use this transformation.");
      return;
    }
    else if(techList[args[0]].techType !== "Transform") {
      msg.channel.send("Use settech[techid] for techniques.");
      return;
    }
    else {
      if(checkBattles(msg.author.id, charList[i].name) === 1) {
        msg.channel.send("You cannot do this in battle.");
        return;
      }

      let str = charList[i].setTransformation(args[0],users[index]);
      if(str !== null) msg.channel.send(str);
    }
    charTechPrint(charList[i]);
    loader.characterSaver(charList);
  }

  if(command === 'removetransformation' || command === 'rtrans') {
    let index = findID(msg.author.id);
    let i = findID(msg.author.id);

    if(index === null) {
    }
    else {
      if(checkBattles(msg.author.id, charList[i].name) === 1) {
        msg.channel.send("You cannot do this in battle.");
        return;
      }

      charList[index].transformation = -1;
      msg.channel.send("Removed.");
      charTechPrint(charList[index]);
    }
    loader.characterSaver(charList);
  }

  if(command === 'settech') {
    let index = getCharListIndex(msg.author.id);
    let i = findID(msg.author.id);

    if(args.length !== 1 || isNaN(args[0])) {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
      currEmbed.setDescription('settech[techid]');
      msg.channel.send({ embeds: [currEmbed] });
      return;
    }

    if(index === null || i === -1) {
    }
    else if(techList[args[0]].techType === "Transform") {
      msg.channel.send("Use settransformation[techid] for transformations.");
      return;
    }
    else {
      if(checkBattles(msg.author.id, charList[i].name) === 1) {
        msg.channel.send("You cannot do this in battle.");
        return;
      }
      let str = charList[i].addTechnique(args[0],users[index]);
      msg.channel.send(str);
    }
    charTechPrint(charList[i]);
    loader.characterSaver(charList);
  }

  if(command === 'removetech' || command === 'rtech' || command === 'unsettech') {
    let index = findID(msg.author.id);
    let i = findID(msg.author.id);

    if(args.length !== 1 || isNaN(args[0])) {
      msg.channel.send("removetech[removeid]");
      return;
    }

    if(index === null) {
    }
    else {
      if(args[0] <= 0 || args[0] > charList[index].techniques.length) {
        msg.channel.send("Index out of range.");
      }
      if(checkBattles(msg.author.id, charList[i].name) === 1) {
        msg.channel.send("You cannot do this in battle.");
        return;
      }
      if(charList[index].techniques.length === 1) {
        msg.channel.send("You can't remove your last technique.");
        return;
      }

      let str = charList[index].removeTechnique(args[0]-1);
      msg.channel.send(str);
      charTechPrint(charList[index]);
    }
    loader.characterSaver(charList);
  }

  if(command === 'swaptech') {
    let index = findID(msg.author.id);

    if(args.length !== 2 || isNaN(args[0]) || isNaN(args[1])) {
      msg.channel.send("swaptech[swapfromid][swaptoid]");
      return;
    }

    if(index === null) {
    }
    else {
      if(checkBattles(msg.author.id, charList[index].name) === 1) {
        msg.channel.send("You cannot do this in battle.");
        return;
      }

      let str = charList[index].swapTechnique(args[0]-1,args[1]-1);
      msg.channel.send(str);
      charTechPrint(charList[index]);
    }
    loader.characterSaver(charList);
  }

  if(command === 'deaths') {
    let index
    if(args.length != 0) {
      index = findID(args[0]);
    }
    else {
      index = findID(msg.author.id);
    }
    
    if(index != -1 || index != null) {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle(charList[index].name.replace(/\_/g,' '));
      if(charList[index].image === '' || charList[index].image === null) { currEmbed.setThumbnail(msg.author.avatarURL()); }
      else { currEmbed.setThumbnail(charList[index].image); }
      currEmbed.addFields(
        { name: 'Deaths', value: charList[index].deathCount.toLocaleString(), inline:true }
        )
      msg.channel.send({ embeds: [currEmbed] });
    }
  }

  if(command === 'status' || command === 'stat' || command === 'char') {
    let index
    if(args.length === 1) {
      index = findID(args[0]);
    }
    else if(args.length === 0)  {
      index = findID(msg.author.id);
    }

    if(index !== -1 && index !== null) {
      //replace here
      printStat(charList[index]);
      loader.characterSaver(charList);
    }
    else {
      index = findNPCID(args[0]);
      if(index != -1) {
        printStat(npcList[index]);
      }
      else {
        let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
        currEmbed.setDescription('stat[user/npcname] || stat');
        msg.channel.send({ embeds: [currEmbed] });
        return;
      }
    }
  }

  if(command === 'advstatus' || command === 'astatus' || command === 'astat' || command === 'achar') {
    let index
    if(args.length != 0) {
      index = findID(args[0]);
    }
    else {
      index = findID(msg.author.id);
    }
    
    if(index != -1) {
      printAStat(charList[index]);
      charTechPrint(charList[index]);
      loader.characterSaver(charList);
    }
    else {
      index = findNPCID(args[0]);
      if(index != -1) {
        printAStat(npcList[index]);
        charTechPrint(npcList[index]);
      }
      else {
        let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
        currEmbed.setDescription('advstatus[userid/npcname]');
        msg.channel.send({ embeds: [currEmbed] });
        return;
      }
    }
  }

/***********************/
/* Combat RPG Commands */
/***********************/


if(command === 'currentbattle' || command === 'viewbattle') {    
  let pci = findID(msg.author.id);
  let bcheck = getCurrentBattle(msg.author.id, charList[pci].name);

  if(pci === null) {
    return;
  }

  if(bcheck >= 0) {
    printBattleList(activeCombatList[bcheck],1);
  }
  else {
    let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Error');
    currEmbed.setDescription('Character not in battle.');
    msg.channel.send({ embeds: [currEmbed] });
    return;
  }
}

if(command === "suppress") {
  let pc = 0;
  if(args.length !== 0) {
    if(args.length !== 1 || isNaN(args[0])) {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
      currEmbed.setDescription('Exact: suppress[reduction percent]\nAuto adjust: suppress');
      msg.channel.send({ embeds: [currEmbed] });
      return;
    }
  }

  let pci = findID(msg.author.id);
  let bcheck = getCurrentBattle(msg.author.id, charList[pci].name);

  if(pci === null) {
    return;
  }

  if(bcheck >= 0 && args.length === 0) {
    let scalar = 0;
    let index = 0;
    for(let i = 0; i < activeCombatList[bcheck].pCombatants.length; i++) {
      if(activeCombatList[bcheck].pCombatants[i].name === charList[pci].name) {
        index = i;
        pc = 1;
        break;
      }
    }
    for(let i = 0; i < activeCombatList[bcheck].NPCombatants.length; i++) {
      if(activeCombatList[bcheck].NPCombatants[i].name === charList[pci].name) {
        index = i;
        break;
      }
    }

    if(pc === 1) {
      if(activeCombatList[bcheck].pCombatants[index].scaled != -1) {
        activeCombatList[bcheck].pCombatants[index].removeBuff(activeCombatList[bcheck].pCombatants[index].scaled);
        activeCombatList[bcheck].pCombatants[index].scaled = -1;
        msg.channel.send("<@" + msg.author.id + "> No longer lowering stats.");
        printBattleList(activeCombatList[bcheck],1);
        return;
      }

      for(let i = 0; i < activeCombatList[bcheck].NPCombatants.length; i++) {
        let scale = activeCombatList[bcheck].NPCombatants[i].battleCurrAtt.str;
        scale += activeCombatList[bcheck].NPCombatants[i].battleCurrAtt.dex;
        scale += activeCombatList[bcheck].NPCombatants[i].battleCurrAtt.sol;
        scale += activeCombatList[bcheck].NPCombatants[i].battleCurrAtt.foc;
        scalar = scale*activeCombatList[bcheck].NPCombatants[i].level;
      }
      scalar = (scalar/activeCombatList[bcheck].NPCombatants.length)/(activeCombatList[bcheck].pCombatants[index].level*(activeCombatList[bcheck].pCombatants[index].battleCurrAtt.str + activeCombatList[bcheck].pCombatants[index].battleCurrAtt.dex + activeCombatList[bcheck].pCombatants[index].battleCurrAtt.foc + activeCombatList[bcheck].pCombatants[index].battleCurrAtt.sol));
      
      if(scalar < 1) {
        let scaledStats = new AttributeBonus("Suppressing","Suppressing");
        scaledStats.bstr = -(1-scalar);
        scaledStats.bdex = -(1-scalar);
        scaledStats.bsol = -(1-scalar);
        scaledStats.bfoc = -(1-scalar);


        activeCombatList[bcheck].pCombatants[index].addBuff(scaledStats);
        activeCombatList[bcheck].pCombatants[index].scaled = activeCombatList[bcheck].pCombatants[index].battleCurrAtt.buffs.length-1;
        msg.channel.send("<@" + msg.author.id + "> Stats now being lowered by " + (1-scalar)*100 + "%.");
      } 
      else msg.channel.send("Enemies are stronger than you.");
    }
    else {
      if(activeCombatList[bcheck].NPCombatants[index].scaled != -1) {
        activeCombatList[bcheck].NPCombatants[index].removeBuff(activeCombatList[bcheck].NPCombatants[index].scaled);
        activeCombatList[bcheck].NPCombatants[index].scaled = -1;
        msg.channel.send("<@" + msg.author.id + "> No longer lowering stats.");
        printBattleList(activeCombatList[bcheck],1);
        return;
      }

      for(let i = 0; i < activeCombatList[bcheck].pCombatants.length; i++) {
        let scale = activeCombatList[bcheck].pCombatants[i].battleCurrAtt.str;
        scale += activeCombatList[bcheck].pCombatants[i].battleCurrAtt.dex;
        scale += activeCombatList[bcheck].pCombatants[i].battleCurrAtt.sol;
        scale += activeCombatList[bcheck].pCombatants[i].battleCurrAtt.foc;
        scalar = scale*activeCombatList[bcheck].pCombatants[i].level;
      }
      scalar = (scalar/activeCombatList[bcheck].pCombatants.length);
      scalar = scalar/(activeCombatList[bcheck].NPCombatants[index].level*(activeCombatList[bcheck].NPCombatants[index].battleCurrAtt.str + activeCombatList[bcheck].NPCombatants[index].battleCurrAtt.dex + activeCombatList[bcheck].NPCombatants[index].battleCurrAtt.foc + activeCombatList[bcheck].NPCombatants[index].battleCurrAtt.sol));
      
      if(scalar < 1) {
        let scaledStats = new AttributeBonus("Suppressing","Suppressing");
        scaledStats.bstr = -(1-scalar);
        scaledStats.bdex = -(1-scalar);
        scaledStats.bsol = -(1-scalar);
        scaledStats.bfoc = -(1-scalar);


        activeCombatList[bcheck].NPCombatants[index].addBuff(scaledStats);
        activeCombatList[bcheck].NPCombatants[index].scaled = activeCombatList[bcheck].NPCombatants[index].battleCurrAtt.buffs.length-1;
        msg.channel.send("<@" + msg.author.id + "> Stats now being lowered by " + (1-scalar)*100 + "%.");
      } 
      else msg.channel.send("Enemies are stronger than you.");
    }
  }
  else if(bcheck >= 0 && args.length === 1) {
    if(args[0] > 100 || args[0] < 0) {
       msg.channel.send("Values must be between 0 and 100.");
       return;
    }
    args[0] = args[0] / 100.0;
    let index = 0;
    for(let i = 0; i < activeCombatList[bcheck].pCombatants.length; i++) {
      if(activeCombatList[bcheck].pCombatants[i].userID === charList[pci].userID) {
        index = i;
        pc = 1;
        break;
      }
    }
    for(let i = 0; i < activeCombatList[bcheck].NPCombatants.length; i++) {
      if(activeCombatList[bcheck].NPCombatants[i].name === charList[pci].name) {
        index = i;
        break;
      }
    }

    if(pc === 1) {
      if(activeCombatList[bcheck].pCombatants[index].scaled != -1) {
        activeCombatList[bcheck].pCombatants[index].removeBuff(activeCombatList[bcheck].pCombatants[index].scaled);
        activeCombatList[bcheck].pCombatants[index].scaled = -1;
      }

      let scaledStats = new AttributeBonus("Suppressing","Suppressing");
      scaledStats.bstr = -(1-args[0]);
      scaledStats.bdex = -(1-args[0]);
      scaledStats.bsol = -(1-args[0]);
      scaledStats.bfoc = -(1-args[0]);


      activeCombatList[bcheck].pCombatants[index].addBuff(scaledStats);
      activeCombatList[bcheck].pCombatants[index].scaled = activeCombatList[bcheck].pCombatants[index].battleCurrAtt.buffs.length-1;
      msg.channel.send("<@" + msg.author.id + "> Stats now being lowered by " + (1-args[0])*100 + "%.");
    }
    else {
      if(activeCombatList[bcheck].NPCombatants[index].scaled != -1) {
        activeCombatList[bcheck].NPCombatants[index].removeBuff(activeCombatList[bcheck].NPCombatants[index].scaled);
        activeCombatList[bcheck].NPCombatants[index].scaled = -1;
      }

      let scaledStats = new AttributeBonus("Suppressing","Suppressing");
      scaledStats.bstr = -(1-args[0]);
      scaledStats.bdex = -(1-args[0]);
      scaledStats.bsol = -(1-args[0]);
      scaledStats.bfoc = -(1-args[0]);


      activeCombatList[bcheck].NPCombatants[index].addBuff(scaledStats);
      activeCombatList[bcheck].NPCombatants[index].scaled = activeCombatList[bcheck].NPCombatants[index].battleCurrAtt.buffs.length-1;
      msg.channel.send("<@" + msg.author.id + "> Stats now being lowered by " + (1-args[0])*100 + "%.");
    }
  }
  else if(bcheck === -1) {
    msg.channel.send("This character is not in a battle.");
    return;
  }
  else {
    console.log("Error in 'suppress' command");
    return;
  }

  printBattleList(activeCombatList[bcheck],1);
}

if(command === "battle") {
  if(args.length !== 1 || !isNaN(args[0])) {
    let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
    currEmbed.setDescription('battle[easy,normal,hard,challenge]');
    msg.channel.send({ embeds: [currEmbed] });
    return;
  }
  if(args[0] != "easy" && args[0] != "normal" && args[0] != "hard" && args[0] != "challenge") args[0] = "normal";


  let check = getCharListIndex(msg.author.id);
  let pci = findID(msg.author.id);
  if(check === null || pci === -1) return;
  if(users[check].shopping !== 0 || users[check].affixing !== 0 || charList[pci].training > 0) {
    let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('You are already busy.');
    currEmbed.setDescription("Finish what you're doing before picking fights.");
    msg.channel.send({ embeds: [currEmbed] });
    return;
  }

  if(checkBattles(msg.author.id, charList[pci].name) === 1) {
    msg.channel.send("You cannot be in more than one battle at a time.");
    return;
  }

  if(charList[pci].attributes.stotal <= 1) {
    let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Hold up!');
    currEmbed.setDescription("Please use statup[statname][amount] at least once before going into a battle.");
    msg.channel.send({ embeds: [currEmbed] });
    return;
  }

  if(args[0] === "challenge" && (charList[pci].attributes.stotal < 100 || charList[pci].level < 100)) {
    let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Error.');
    currEmbed.setDescription("You must have 100 stat total or more, as well as at least 100 levels to attempt challenge difficulty.");
    msg.channel.send({ embeds: [currEmbed] });
    return;
  }

  let random;
  let mod = 1;
  let safe = Math.round(Math.random() * 99 + 1);
  let style = new AttributeBonus("Random Style!","Fighting Style");
  let stylePercent = Math.min(100,charList[pci].fightingStyle.getTotalChange());

  if(args[0] === "easy") {
    random = 0.7 + (Math.random() * 0.2);
    mod = 1.5;
    stylePercent = Math.round(stylePercent*0.65);
    if(safe < 5) {
      safe = 10;
      mod += 0.25;
      msg.channel.send("<@" + msg.author.id + "> This combat has a chance of death and has increased EXP. Zenkai enabled.");
    }
    else safe = 0;
  } 
  else if(args[0] === "normal") {
    random = 0.9 + (Math.random() * 0.2);
    mod = 1.75
    stylePercent = Math.round(stylePercent*0.65);
    if(safe < 15) {
      safe = 30;
      mod += 0.5;
      msg.channel.send("<@" + msg.author.id + "> This combat has a chance of death and has increased EXP. Zenkai enabled.");
    }
    else safe = 0;
  }
  else if(args[0] === "hard") {
    random = 1 + (Math.random() * 0.25);
    mod = 2;
    stylePercent = Math.round(stylePercent*0.9);
    if(safe < 25) {
      safe = 50;
      mod += 0.75;
      msg.channel.send("<@" + msg.author.id + "> This combat has a chance of death and has increased EXP. Zenkai enabled.");
    }
    else safe = 0;
  }
  else if(args[0] === "challenge") {
    random = 1.35;
    mod = 2.25;
    stylePercent = Math.round(stylePercent*1.15);
    if(safe < 75) {
      random += 0.2;
      safe = 55;
      mod += 1.25;
      msg.channel.send("<@" + msg.author.id + "> This combat has a chance of death and has increased EXP. Zenkai enabled.");
    }
    else safe = 0;
  }
  else {
    random = 5 + (Math.random() * 2);
    safe = 1;
  }


  let enemy = new Character(nameGenerator.formName(),new Races(Math.floor(Math.random() * 9)),new Attributes(0,0,0,0,0,0),'Random');
  let exprandom = (Math.random() * 0.4) - 0.2 + 1;
  let expthingy = Math.max(1,charList[pci].totalexp);
  enemy.addEXP(Math.round(expthingy*exprandom));

  if(stylePercent > 200) stylePercent = 200;
  stylePercent = stylePercent/100;
  let atotal = Math.round(charList[pci].attributes.stotal*random) - enemy.attributes.stotal;
  random = 0.2 + (Math.random() * 0.3);
  let ceTotal = Math.round(atotal * 0.2);
  let c = 0.1 + Math.round(ceTotal * random);
  if(args[0] === "challenge") c += 0.2;
  let e = Math.round(ceTotal * (1-random));
  if(e < 0 || e === null) e = 0;
  else if(e > 600) e = 500;
  if(c < 0 || c === null) c = 0;
  else if(c > 600) c = 500;
  let f = 0;
  let so = 0;
  let s = 0;
  let d = 0;
  atotal = atotal - e - c;
  random = Math.random() * 100;
  let pick = Math.random() < 0.5 ? "main" : "adv";
  if(random >= 50) {
    random = 0.3 + (Math.random() * 0.2);
    s = Math.round(atotal * 0.3 * random);
    if(s < 0 || s === null) s = 0;
    else if(s > 500) s = 500;
    if(pick === "main") {
      style.bstr = (stylePercent * random);
      if(style.bstr > 0.5) style.bstr = 0.5;
      pick = Math.random() < 0.5 ? "main" : "adv";
    }
    else {
      style.blockRate = (stylePercent * (random/2));
      if(style.blockRate > 0.5) style.blockRate = 0.5;
      style.bstr = (stylePercent * (random/2));
      if(style.bstr > 0.5) style.bstr = 0.5;
      pick = Math.random() < 0.5 ? "main" : "adv";
    }

    d = Math.round(atotal * 0.3 * (1-random));
    if(d < 0 || d === null) d = 0;
    else if(d > 500) d = 500;
    atotal = atotal - s - d;
    if(pick === "main") {
      style.bdex = (stylePercent * (1-random));
      if(style.bdex > 0.5) style.bdex = 0.5;
      pick = Math.random() < 0.5 ? "main" : "adv";
    }
    else {
      style.dodge = (stylePercent * (1-random/2));
      if(style.dodge > 0.5) style.dodge = 0.5;
      style.bdex = (stylePercent * (1-random/2));
      if(style.bdex > 0.5) style.bdex = 0.5;
      pick = Math.random() < 0.5 ? "main" : "adv";
    }
    stylePercent = stylePercent - style.getTotalChange()/100;
    if(stylePercent < 0) stylePercent = 0;


    f = Math.round(atotal * 0.9);
    if(f < 0 || f === null) f = 0;
    else if(f > 500) f = 500;
    if(pick === "main") {
      style.bfoc = stylePercent*0.9;
      if(style.bfoc > 0.5) style.bfoc = 0.5;
      stylePercent = stylePercent - style.bfoc;
      if(stylePercent < 0) stylePercent = 0;
      pick = Math.random() < 0.5 ? "main" : "adv";
    }
    else {
      style.hit = (stylePercent * (1-random/2));
      if(style.hit > 0.5) style.hit = 0.5;
      style.bfoc = (stylePercent * (1-random/2));
      if(style.bfoc > 0.5) style.bfoc = 0.5;
      stylePercent = stylePercent - style.bfoc - style.hit;
      if(stylePercent < 0) stylePercent = 0;
      pick = Math.random() < 0.5 ? "main" : "adv";
    }


    so = atotal - f;
    if(so < 0 || so === null) so = 0;
    else if(so > 500) so = 500;
    if(pick === "main") {
      style.bsol = stylePercent;
    }
    else {
      style.bsol = 2*stylePercent/3;
      style.energyAttack = stylePercent/3;
    }
  }
  else {
    random = 0.3 + (Math.random() * 0.2);
    so = Math.round(atotal * 0.6 * random);
    if(so < 0 || so === null) so = 0;
    else if(so > 500) so = 500;
    if(pick === "main") {
      style.bsol = (stylePercent * random);
      if(style.bsol > 0.5) style.bsol = 0.5;
      pick = Math.random() < 0.5 ? "main" : "adv";
    }
    else {
      style.energyAttack = (stylePercent * (random/2));
      if(style.energyAttack > 0.5) style.energyAttack = 0.5;
      style.bsol = (stylePercent * (random/2));
      if(style.bsol > 0.5) style.bsol = 0.5;
      pick = Math.random() < 0.5 ? "main" : "adv";
    }


    f = Math.round(atotal * 0.3 * (1-random));
    if(f < 0 || f === null) f = 0;
    else if(f > 500) f = 500;
    atotal = atotal - so - f;
    if(pick === "main") {
      style.bfoc = (stylePercent * (1-random));
      if(style.bfoc > 0.5) style.bfoc = 0.5;
      pick = Math.random() < 0.5 ? "main" : "adv";
    }
    else {
      style.hit = (stylePercent * (1-random/2));
      if(style.hit > 0.5) style.hit = 0.5;
      style.bfoc = (stylePercent * (1-random/2));
      if(style.bfoc > 0.5) style.bfoc = 0.5;
      pick = Math.random() < 0.5 ? "main" : "adv";
    }
    stylePercent = stylePercent - style.getTotalChange()/100;
    if(stylePercent < 0) stylePercent = 0;

    d = Math.round(atotal * 0.9);
    if(d < 0 || d === null) d = 0;
    else if(d > 500) d = 500;
    if(pick === "main") {
      style.bdex = stylePercent*0.9;
      if(style.bdex > 0.5) style.bdex = 0.5;
      stylePercent = stylePercent - style.bdex;
      if(stylePercent < 0) stylePercent = 0;
      pick = Math.random() < 0.5 ? "main" : "adv";
    }
    else {
      style.critRate = (stylePercent * (1-random/2));
      if(style.critRate > 0.5) style.critRate = 0.6;
      style.bdex = (stylePercent * (1-random/2));
      if(style.bdex > 0.5) style.bdex = 0.5;
      stylePercent = stylePercent - style.bdex - style.critRate;
      if(stylePercent < 0) stylePercent = 0;
      pick = Math.random() < 0.5 ? "main" : "adv";
    }

    s = atotal - d;
    if(s < 0 || s === null) s = 0;
    else if(s > 500) s = 500;
    if(pick === "main") {
      style.bstr = stylePercent;
    }
    else {
      style.bstr = stylePercent/2;
      style.blockRate = stylePercent/2;
    }
  }

  if(s+d > so+f) {
    if(c > e*0.8) enemy.setPersonality("Tank");
    else enemy.setPersonality("Striker");
  }
  else {
    if(c > e) enemy.setPersonality("eTank");
    else enemy.setPersonality("Blaster");
  }

  enemy.styleName = "Random Style!";
  enemy.style = style;
  let attr = new Attributes(enemy.attributes.str+s,enemy.attributes.dex+d,enemy.attributes.con+c,enemy.attributes.eng+e,enemy.attributes.sol+so,enemy.attributes.foc+f);
  enemy.attributes = attr;
  enemy.statusUpdate(0);
  enemy.unleashPotential(charList[pci].potentialUnleashed);
  if(charList[pci].potentialUnleashed == 1) mod *= 1.5;
  if(args[0] === 'challenge' || args[0] === 'hard') {
    enemy.weapon = makeItem("weapon","legendary");
    if(args[0] === 'challenge') enemy.dogi = makeItem("dogi","legendary");
  }
  enemy.statusUpdate(0);
  enemy.addBuff(enemy.style);

  let tech = -1;
  while(tech === -1) {
    tech = Math.floor(Math.random() * (techList.length));
    if(techList[tech] === null) tech = -1;
    else if(techList[tech].tag !== "Common") tech = -1;
  }
  if(techList[tech].techType === "Transform") enemy.setTransformation(tech,'NPC');
  else enemy.addTechnique(tech,'NPC');

  if(args[0] === 'hard' || args[0] === 'challenge') {
    tech = -1;
    while(tech === -1) {
      tech = Math.floor(Math.random() * (techList.length));
      if(techList[tech] === null) tech = -1;
      else if(techList[tech].tag !== "Common") tech = -1;
      else if(techList[tech].techType === "Transform" && enemy.transformation !== -1) tech = -1;
    }
    if(techList[tech].techType === "Transform") enemy.setTransformation(tech,'NPC');
    else enemy.addTechnique(tech,'NPC');
  }

  if(args[0] === 'challenge') {
    tech = -1;
    while(tech === -1) {
      tech = Math.floor(Math.random() * (techList.length));
      if(techList[tech] === null) tech = -1;
      else if(techList[tech].tag !== "Common") tech = -1;
      else if(techList[tech].techType === "Transform" && enemy.transformation !== -1) tech = -1;
    }
    if(techList[tech].techType === "Transform") enemy.setTransformation(tech,'NPC');
    else enemy.addTechnique(tech,'NPC');
  }

  if(args[0] === 'challenge') {
    tech = -1;
    while(tech === -1) {
      tech = Math.floor(Math.random() * (techList.length));
      if(techList[tech] === null) tech = -1;
      else if(techList[tech].tag !== "Common") tech = -1;
      else if(techList[tech].techType === "Transform" && enemy.transformation !== -1) tech = -1;
    }
    if(techList[tech].techType === "Transform") enemy.setTransformation(tech,'NPC');
    else enemy.addTechnique(tech,'NPC');
  }
  enemy.image = nameGenerator.imageURL;
  enemy.statPoints = 0;

  let cloneChar = charList[pci].clone();
  let newbattle = new Battle(new Array(cloneChar),new Array(enemy),activeCombatList.length, techList);
  newbattle.expMod = mod;
  newbattle.deathChance = safe;
  if(args[0] === "challenge") newbattle.itemBox = "Epic";
  activeCombatList.push(newbattle);
  printBattleList(activeCombatList[activeCombatList.length-1]);
}

if(command === "spar") {
  if((args.length !== 2 && args.length !== 1) || !isNaN(args[0])) {
    let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
    currEmbed.setDescription('spar[target]' || 'spar[target][zeni risk]');
    msg.channel.send({ embeds: [currEmbed] });
    return;
  }

  let pci = findID(msg.author.id);
  let eci = findID(args[0]);
  let check = getCharListIndex(msg.author.id);

  if(check === null || pci === -1 || eci === -1)  {
    let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
    currEmbed.setDescription('spar[target]' || 'spar[target][zeni risk]');
    msg.channel.send({ embeds: [currEmbed] });
    return;
  }

  if(users[check].shopping !== 0 || users[check].affixing !== 0 || charList[pci].training > 0) {
    let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('You are already busy.');
    currEmbed.setDescription("Finish what you're doing before picking fights.");
    msg.channel.send({ embeds: [currEmbed] });
    return;
  }

  if(users[check].tutorial === 1) {
    let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Slow Down!');
    currEmbed.setDescription("Follow the tutorial to the end before doing this.");
    msg.channel.send({ embeds: [currEmbed] });
    return;
  }

  if(pci === eci) {
    let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Error');
    currEmbed.setDescription("You can't challenge yourself!");
    msg.channel.send({ embeds: [currEmbed] });
    return;
  }
  else if(args.length === 2 && isNaN(args[1]) && args[1] > 0) {
    let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format:Zeni Risk');
    currEmbed.setDescription('spar[target]' || 'spar[target][zeni risk]');
    msg.channel.send({ embeds: [currEmbed] });
    return;
  }
  else {
    let challenger = getCharList(msg.author.id);
    let challenged = getCharList(args[0]);
    if(isNaN(args[1]) || (challenger.zeni > args[1] && challenged.zeni > args[1])) {
      if(charList[pci].attributes.stotal <= 1 || charList[eci].attributes.stotal <= 1 ) {
        let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Hold up!');
        currEmbed.setDescription("Please use statup[statname][amount] at least once before going into a battle.");
        msg.channel.send({ embeds: [currEmbed] });
        return;
      }
      if(isNaN(args[1])) args[1] = 0;
      displayChallenge(challenger, challenged, args[1], pci, eci);
    }
    else {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Error');
      currEmbed.setDescription("One or both players don't have that amount of zeni to risk.");
      msg.channel.send({ embeds: [currEmbed] });
      return;
    }
  }
}

if(command === "npcspar") {
  if(args.length !== 1 || !isNaN(args[0])) {
    let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
    currEmbed.setDescription('npcspar[npcname]');
    msg.channel.send({ embeds: [currEmbed] });
    return;
  }
  let npci = findNPCID(args[0]);
  if(npci === null || npci === -1) return;
  let pci = findID(msg.author.id);
  if(pci === null || pci === -1) return;

  let check = getCharListIndex(msg.author.id);
  if(users[check].shopping !== 0 || users[check].affixing !== 0 || charList[pci].training > 0) {
    let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('You are already busy.');
    currEmbed.setDescription("Finish what you're doing before picking fights.");
    msg.channel.send({ embeds: [currEmbed] });
    return;
  }

  if(charList[pci].attributes.stotal <= 1) {
    let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Hold up!');
    currEmbed.setDescription("Please use statup[statname][amount] at least once before going into a battle.");
    msg.channel.send({ embeds: [currEmbed] });
    return;
  }
  if(checkBattles(msg.author.id, charList[pci].name) === 1) {
    msg.channel.send("You cannot be in more than one battle at a time.");
    return;
  }

  let pc = charList[pci].clone();
  let npc = npcList[npci].clone();
  let newbattle = new Battle(new Array(pc),new Array(npc),activeCombatList.length, techList);
  newbattle.expMod = 0.8;
  activeCombatList.push(newbattle);
  printBattleList(activeCombatList[activeCombatList.length-1]);
}

if(command === "trial") {
  if(args.length !== 1) {
    let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Training');
    currEmbed.setDescription("Trials are static solo encounters for characters, designed similar to raids, that provide special rewards. They are always at least level 400, so it's recommend to be at least that high level before attempting it. \nThey can be started with trial [name]");
    currEmbed.addFields(
      { name: 'Name: Krillin', value: "A quick training session with Krillin! Designed for characters with at least 400 total stats.", inline:true },
      { name: 'Rewards', value: "Rewards a standard tier box and increased exp. First time bonus increases inventory size by 5.", inline:true },
      { name: '\u200b', value: '\u200b', inline:true },
      );
    msg.channel.send({ embeds: [currEmbed] });
    currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Trials');
    currEmbed.setDescription("Trials are static solo encounters for characters, designed similar to raids, that provide special rewards. They are always at least level 400, so it's recommend to be at least that high level before attempting it. \nThey can be started with trial [name]");
    currEmbed.addFields(
      { name: 'Name: Sage', value: "The Namekian Sage's trial is designed to test whether a character is ready to unlock their potential. This encounter is designed for characters with at least 800 total stats.", inline:true },
      { name: 'Rewards', value: "Once completed, the character's potential will be unlocked, increasing racial stat caps and giving a small boost to stats. Additionally, they will gain stat points and technique points faster. First time completion for each character also rewards an Epic item box.", inline:true },
      { name: '\u200b', value: '\u200b', inline:true },
      );
    currEmbed.addFields(
      { name: 'Name: Kai', value: "Kaioshin's Trial tests your growth yet again, but this time the odds will be stacked against you. You're bringing a familiar face to help, but it will be difficult regardless. This encounter is designed for characters with at least 2000 total stats.", inline:true },
      { name: 'Rewards', value: "Once completed, the character's potential will be unleashed, increasing racial stat caps and giving a permanent passive boost to stats. First time completion also allows you to create characters with the Core People race, and first time completion on each character rewards a Legendary item box.", inline:true },
      { name: '\u200b', value: '\u200b', inline:true },
      );
    msg.channel.send({ embeds: [currEmbed] });
    return;
  }
  let pci = findID(msg.author.id);
  if(pci === null || pci === -1) return;

  let check = getCharListIndex(msg.author.id);
  if(users[check].shopping !== 0 || users[check].affixing !== 0 || charList[pci].training > 0) {
    let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('You are already busy.');
    currEmbed.setDescription("Finish what you're doing before picking fights.");
    msg.channel.send({ embeds: [currEmbed] });
    return;
  }

  if(charList[pci].attributes.stotal <= 1) {
    let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Hold up!');
    currEmbed.setDescription("Please use statup[statname][amount] at least once before going into a battle.");
    msg.channel.send({ embeds: [currEmbed] });
    return;
  }
  if(checkBattles(msg.author.id, charList[pci].name) === 1) {
    msg.channel.send("You cannot be in more than one battle at a time.");
    return;
  }

  if(args[0] === "sage") {
    let newbattle = Raid.sageTrial(techList, charList[pci],activeCombatList.length);
    activeCombatList.push(newbattle);
    printBattleList(activeCombatList[activeCombatList.length-1]);
  }
  else if(args[0] === "kai") {
    let npcI = findNPCID("Gohan");
    let newbattle = Raid.kaioshinTrial(techList, charList[pci],activeCombatList.length, npcList[npcI]);
    activeCombatList.push(newbattle);
    printBattleList(activeCombatList[activeCombatList.length-1]);
  }
  else if(args[0] === "krillin") {
    let npcI = findNPCID("Krillin");
    let newbattle = Raid.krillinTrial(techList, charList[pci],activeCombatList.length, npcList[npcI]);
    activeCombatList.push(newbattle);
    printBattleList(activeCombatList[activeCombatList.length-1]);
  }
  else {
    let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Error');
    currEmbed.setDescription('That is not a valid name for a trial.');
    msg.channel.send({ embeds: [currEmbed] });
    return;
  }
}

if(command === "forfeit") {
  let pci = findID(msg.author.id);
  let battleID = getCurrentBattle(msg.author.id, charList[pci].name);
  if(battleID !== -1) {
    printBattleList(activeCombatList[battleID],1);

    for(let i = 0; i < activeCombatList[battleID].pCombatants.length; i++) {
      let chance = Math.round(Math.random() * 99 + 1);
      if(msg.author.id === activeCombatList[battleID].pCombatants[i].playerID && activeCombatList[battleID].deathChance != 0 && chance < activeCombatList[battleID].deathChance*2) {
        let user = getCharList(activeCombatList[battleID].pCombatants[i].playerID);
        let zeni = (activeCombatList[battleID].pCombatants[i].level+activeCombatList[battleID].pCombatants[i].attributes.stotal)*20 + activeCombatList[battleID].zeniRisk;
        user.zeni = user.zeni - zeni;
        battleMessage(activeCombatList[battleID].pCombatants[i].name + " has died. They will be ressurected, but must pay " + zeni + " zeni. No Technique Points will be retained.");
        let z = charList.map(function(e) { return e.playerID+e.name; }).indexOf(activeCombatList[battleID].pCombatants[i].playerID+activeCombatList[battleID].pCombatants[i].name);
        charList[z].rebirth();
        if(user.zeni < 0) user.zeni = 0;
      }
    }
    for(let i = 0; i < activeCombatList[battleID].NPCombatants.length; i++) {
      let chance = Math.round(Math.random() * 100);
      if(activeCombatList[battleID].NPCombatants[i].playerID !== 'NPC' && activeCombatList[battleID].NPCombatants[i].playerID !== 'Random') {
        if(msg.author.id === activeCombatList[battleID].NPCombatants[i].playerID && activeCombatList[battleID].deathChance != 0 && chance < activeCombatList[battleID].deathChance*2) {
          let user = getCharList(activeCombatList[battleID].NPCombatants[i].playerID);
          let zeni = (activeCombatList[battleID].NPCombatants[i].level+activeCombatList[battleID].NPCombatants[i].attributes.stotal)*20 + activeCombatList[battleID].zeniRisk;
          user.zeni = user.zeni - zeni;
          battleMessage(activeCombatList[battleID].NPCombatants[i].name + " has died. They will be ressurected, but must pay " + zeni + " zeni. No Technique Points will be retained.");
          let z = charList.map(function(e) { return e.playerID+e.name; }).indexOf(activeCombatList[battleID].NPCombatants[i].playerID+activeCombatList[battleID].NPCombatants[i].name);
          charList[z].rebirth();
          if(user.zeni < 0) user.zeni = 0;
        }
      }
    }
    msg.channel.send("The battle was ended.");
    endBattle(battleID, 0);
    return;
  }
  else {
    msg.channel.send("You're not in a battle.");
    return;
  }
}

/**********************/
/*** Admin Commands ***/
/**********************/
  
  /*
  if(command === "") {
    if(msg.author.id === devID) {
    }
  }
  */

  if(command === "zenkai") {
    if(msg.author.id === devID && args.length === 1) {
        let index = findID(args[0]);

        if(index != -1) {
          charList[index].zenkaiTriggered = 1;
          let i = charList[index].gainZenkai();
          let str = "Zenkai failed.";

          if(i === 1) {
            str = "Zenkai succeeded."
            charList[index].hasZenkai = 0;
          }

          let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Result');
          currEmbed.setDescription(str);
          msg.channel.send({ embeds: [currEmbed] });
          return;
        }
    }
  }

  if(command === "itemlookup"){
    if(msg.author.id === devID && args.length > 0) {
      let ind = itemList.map(function(e) { return e.uid; }).indexOf(args[0]);
      printItem(itemList[ind]);
      if(args.length === 2) {
        printItem(itemList[ind]);
        loader.itemSaver(itemList);
      }
    }
    else {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
      currEmbed.setDescription('itemlookup[itemid] || itemlookup[itemid][addaffixtype]');
      msg.channel.send({ embeds: [currEmbed] });
      return;
    }
  }

  if(command === 'makeitem' || command === 'createitem') {
    if(msg.author.id === devID) {
      let uid = getCharListIndex(msg.author.id);
      let index = findID(msg.author.id);

      if(index === -1 || uid === null) {
      }
      else if(args.length === 2) {
        let item = makeItem(args[0], args[1]);
        if(item) {
          itemList.push(item);
          printItem(item);
          loader.itemSaver(itemList);
        }
      }
      else {
        let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
        currEmbed.setDescription('makeitem[type][quality]');
        msg.channel.send({ embeds: [currEmbed] });
        return;
      }
    }
  }

  if(command === "npcrebirth") {
    if(msg.author.id === devID) {
      if(args.length === 1 && isNaN(args[0])) {
        let index = findNPCID(args[0]);

        if(index != -1) {
          let xp = Math.round(npcList[index].totalexp*0.4);
          npcList[index].rebirth();
          npcList[index].reAddEXP(xp);
          msg.channel.send(npcList[index].name + " was killed by mysterious forces.");
          loader.npcSaver(npcList);
        }
      }
      else {        
        let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
        currEmbed.setDescription('npcrebirth[target]');
        msg.channel.send({ embeds: [currEmbed] });
        return;
      }
    }
  }

  if(command === "rebirth") {
    if(msg.author.id === devID) {
      if(args.length === 1 && !isNaN(args[0])) {
        let index = findID(args[0]);

        if(index != -1) {
          charList[index].rebirth();
          msg.channel.send(charList[index].name + " was killed by mysterious forces.");
          loader.characterSaver(charList);
        }
      }
      else {        
        let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
        currEmbed.setDescription('rebirth[target]');
        msg.channel.send({ embeds: [currEmbed] });
        return;
      }
    }
  }

  if(command === "addxp" || command === "addexp") {
    if(msg.author.id === devID) {
      if(args.length === 1 && !isNaN(args[0])) {
        let index = findID(msg.author.id);
    
        if(index != -1) {
          msg.channel.send(args[0] + 'XP added.');
          let str = charList[index].addEXP(Number(args[0]));
          let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle(str);
          if(str != null) msg.channel.send({ embeds: [currEmbed] });
        }
      }
      else if (args.length === 2 && !isNaN(args[0])) {
        let index = findID(args[1]);
    
        if(index != -1) {
          msg.channel.send(args[0] + 'XP added.');
          let str = charList[index].addEXP(Number(args[0]));
          let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle(str);
          if(str != null) msg.channel.send({ embeds: [currEmbed] });
        }
      }
      else {        
        let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
        currEmbed.setDescription('addxp[amount][target]');
        msg.channel.send({ embeds: [currEmbed] });
        return;
      }
    }

    loader.characterSaver(charList);
  }

  if(command === "npcaddxp" || command === "npcaddexp") {
    if(msg.author.id === devID) {
      if (args.length === 2) {
        let index = findNPCID(args[1]);
    
        if(index != -1) {
          msg.channel.send(args[0] + 'XP added.');
          let str = npcList[index].addEXP(Number(args[0]));
          let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle(str);
          if(str != null) msg.channel.send({ embeds: [currEmbed] });
        }
      }
      else {        
        let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
        currEmbed.setDescription('npcaddxp[amount][target]');
        msg.channel.send({ embeds: [currEmbed] });
        return;
      }
    }

    loader.npcSaver(npcList);
  }
  
  if(command === 'npcstatup') {
    if(msg.author.id !== devID) return;

    if(args.length < 3) {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
      currEmbed.setDescription('npcstatup [dex,con,eng,foc,sol] [value] [npcname]');
      msg.channel.send({ embeds: [currEmbed] });
      return;
    }

    let index = findNPCID(args[2]);

    if(index === -1 || index === null) {
    }
    else if(npcList[index].statPoints < Number(args[1]) || Number(args[1]) < 0) {
      msg.channel.send("That character doesn't have that many stat points to use.");
    }
    else if(args[0] == 'str') {
      npcList[index].attributes.str += Number(args[1]);
      npcList[index].statPoints -= Number(args[1]);
      npcList[index].statusUpdate(0,new Attributes(0,0,0,0,0,0));
      msg.channel.send("Done.");
    }
    else if(args[0] == 'dex') {
      npcList[index].attributes.dex += Number(args[1]);
      npcList[index].statPoints -= Number(args[1]);
      npcList[index].statusUpdate(0,new Attributes(0,0,0,0,0,0));
      msg.channel.send("Done.");
    }
    else if(args[0] == 'con') {
      npcList[index].attributes.con += Number(args[1]);
      npcList[index].statPoints -= Number(args[1]);
      npcList[index].statusUpdate(0,new Attributes(0,0,0,0,0,0));
      msg.channel.send("Done.");
    }
    else if(args[0] == 'eng') {
      npcList[index].attributes.eng += Number(args[1]);
      npcList[index].statPoints -= Number(args[1]);
      npcList[index].statusUpdate(0,new Attributes(0,0,0,0,0,0));
      msg.channel.send("Done.");
    }
    else if(args[0] == 'foc') {
      npcList[index].attributes.foc += Number(args[1]);
      npcList[index].statPoints -= Number(args[1]);
      npcList[index].statusUpdate(0,new Attributes(0,0,0,0,0,0));
      msg.channel.send("Done.");
    }
    else if(args[0] == 'sol') {
      npcList[index].attributes.sol += Number(args[1]);
      npcList[index].statPoints -= Number(args[1]);
      npcList[index].statusUpdate(0,new Attributes(0,0,0,0,0,0));
      msg.channel.send("Done.");
    }
    else {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Invalid Format');
      currEmbed.setDescription('npcstatup [dex,con,eng,foc,sol] [value] [npcname]');
      msg.channel.send({ embeds: [currEmbed] });
    }

    loader.npcSaver(npcList);
  }


/**********************/
/*** Utility  Stuff ***/
/**********************/

  function calcXPTrainingCost(user, time) { 
    //tp cost
    let cost = Math.round(time*15*(1-(time-1)/100));
    if(user.dojo !== null) {
      cost *= 0.9;
    }
    return Math.floor(cost);
  }

  function calcTPTrainingCost(user, time) { 
    //tp cost
    let cost = Math.round(time*20000*(1-(time-1)/100));
    if(user.dojo !== null) {
      cost *= 0.9;
    }
    return Math.floor(cost);
  }

  function isImage(link) {
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(link);
  }

  function printAStat(char) {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle(char.name.replace(/\_/g,' '));
      let currEmbed1 = new Discord.MessageEmbed(statusEmbed);
      if(char.image === '' || char.image === null) { currEmbed.setThumbnail(msg.author.avatarURL()); }
      else { currEmbed.setThumbnail(char.image); }
      currEmbed.addFields(
        { name: 'Race', value: char.race.raceName.replace(/\_/g,' ').toLocaleString(), inline:true },
        { name: 'Level', value: char.level.toLocaleString(), inline: true  },
        { name: 'Total EXP', value: char.totalexp.toLocaleString(undefined), inline: true  },
        { name: 'EXP', value: char.exp + '/' + char.nextEXP.toLocaleString(), inline: true },
        { name: 'Attribute Total', value: char.battleCurrAtt.stotal.toLocaleString(), inline: true  },
        { name: 'Power Level', value: char.battleCurrAtt.scanPowerLevel(char.battleCurrAtt.charge,char.level).toLocaleString(undefined), inline: true },

        { name: 'Health', value: char.battleCurrAtt.health.toLocaleString(undefined), inline: true },
        { name: 'Energy', value: char.battleCurrAtt.energy.toLocaleString(undefined), inline: true },
        { name: 'Charge', value: char.battleCurrAtt.charge + '/' + char.battleMaxAtt.charge.toLocaleString(), inline: true },

        { name: 'HP Regen', value: char.battleCurrAtt.healthRegen.toLocaleString(undefined), inline: true },
        { name: 'EN Regen', value: char.battleCurrAtt.energyRegen.toLocaleString(undefined), inline: true },
        { name: '\u200b', value: '\u200b', inline: true  },

        { name: 'STR', value: char.battleCurrAtt.str.toLocaleString(), inline: true  },
        { name: 'DEX', value: char.battleCurrAtt.dex.toLocaleString(), inline: true  },
        { name: 'CON', value: char.battleCurrAtt.con.toLocaleString(), inline: true  },
        { name: 'ENG', value: char.battleCurrAtt.eng.toLocaleString(), inline: true  },
        { name: 'FOC', value: char.battleCurrAtt.foc.toLocaleString(), inline: true  },
        { name: 'SOL', value: char.battleCurrAtt.sol.toLocaleString(), inline: true  },
      );
      let dogiN = "None";
      let weaponN = "None";
      if(char.dogi !== null) dogiN = char.dogi.name.replace(/\_/g,' ');
      if(char.weapon !== null) weaponN = char.weapon.name.replace(/\_/g,' ');
      currEmbed.addFields(
        { name: 'Dogi', value: dogiN, inline: true  },
        { name: 'Weapon', value: weaponN, inline: true  },
        { name: 'Fighting Style', value: char.styleName.replace(/\_/g,' '), inline: true  }
      );
      //msg.channel.send({ embeds: [currEmbed] });
      currEmbed1.addFields(
        { name: 'Hit Rate ', value: char.battleCurrAtt.hit.toLocaleString(undefined), inline: true  },
        { name: 'Dodge Rate', value: char.battleCurrAtt.dodge.toLocaleString(undefined), inline: true  },
        { name: 'Speed Value', value: char.battleCurrAtt.speed.toLocaleString(undefined), inline: true },

        { name: 'Crit Rate', value: char.battleCurrAtt.critRate + '%', inline: true  },
        { name: 'Crit Damage', value: (char.battleCurrAtt.critDamage*100).toLocaleString(undefined,{maximumFractionDigits:0}) + '%', inline: true  },
        { name: 'Charge Bonus', value: (char.battleCurrAtt.chargeBonus*100).toLocaleString(undefined,{maximumFractionDigits:0}) + '%', inline: true },

        { name: 'Block Rate', value: char.battleCurrAtt.blockRate.toLocaleString(undefined,{maximumFractionDigits :2}) + '%', inline: true  },
        { name: 'Block Power', value: Math.min(95,((1-Battle.defenseScalar/(Battle.defenseScalar+(char.battleCurrAtt.blockPower/Battle.blockModifier)))*100)).toLocaleString(undefined,{maximumFractionDigits :2}) + '% Reduction', inline: true  },
        { name: '\u200b', value: '\u200b', inline: true },

        { name: 'Physical Attack', value: char.battleCurrAtt.physicalAttack.toLocaleString(undefined), inline: true  },
        { name: 'Energy Attack', value: char.battleCurrAtt.energyAttack.toLocaleString(undefined), inline: true  },
        { name: 'Magic Power', value: char.battleCurrAtt.magicPower.toLocaleString(undefined), inline: true },
        { name: 'Physical Defense', value: Math.min(95,((1-Battle.defenseScalar/(Battle.defenseScalar+char.battleCurrAtt.pDefense))*100)).toLocaleString(undefined,{maximumFractionDigits :2}) + '% Reduction', inline: true  },
        { name: 'Energy Defense', value: Math.min(95,((1-Battle.defenseScalar/(Battle.defenseScalar+char.battleCurrAtt.eDefense))*100)).toLocaleString(undefined,{maximumFractionDigits :2}) + '% Reduction', inline: true  },
        { name: 'Magic Defense', value: char.battleCurrAtt.magicDefense.toLocaleString(undefined), inline: true },
      );

      let points = '';
      if(char.statPoints != 1) {
        points += char.statPoints + ' stat points available. ';
      }
      else {
        points += char.statPoints + ' stat point available. ';
      }
      if(char.techniquePoints != 1) {
        points += char.techniquePoints + ' technique points available.';
      }
      else {
        points += char.techniquePoints + ' technique point available. ';
      }
      currEmbed1.setFooter( { text: points } );
      
      msg.channel.send( { embeds: [currEmbed, currEmbed1] } );
  }

  function printStat(char) {
    let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle(char.name.replace(/\_/g,' '));
    if(char.image === '' || char.image === null) { currEmbed.setThumbnail(msg.author.avatarURL()); }
    else { currEmbed.setThumbnail(char.image); }
    currEmbed.addFields(
      { name: 'Race', value: char.race.raceName.replace(/\_/g,' ').toLocaleString(), inline:true },
      { name: 'Level', value: char.level.toLocaleString(), inline: true  },
      { name: 'Total EXP', value: char.totalexp.toLocaleString(undefined), inline: true  },
      { name: 'EXP', value: char.exp + '/' + char.nextEXP.toLocaleString(), inline: true },
      { name: 'Attribute Total', value: char.attributes.stotal.toLocaleString(), inline: true  },
      { name: 'Power Level', value: char.battleMaxAtt.scanPowerLevel(char.battleCurrAtt.charge,char.level).toLocaleString(undefined), inline: true },

      { name: 'Health ', value: char.attributes.health.toLocaleString(undefined), inline: true },
      { name: 'Energy ', value: char.attributes.energy.toLocaleString(undefined), inline: true },
      { name: 'Charge ', value: char.attributes.charge.toLocaleString(), inline: true },
    );
    if(char.playerID !== "NPC" && char.playerID !== "Random") {
      currEmbed.addFields(
        { name: 'STR', value: char.attributes.str.toLocaleString() + '/' + char.race.maxStr.toLocaleString(), inline: true  },
        { name: 'DEX', value: char.attributes.dex.toLocaleString() + '/' + char.race.maxDex.toLocaleString(), inline: true  },
        { name: 'CON', value: char.attributes.con.toLocaleString() + '/' + char.race.maxCon.toLocaleString(), inline: true  },
        { name: 'ENG', value: char.attributes.eng.toLocaleString() + '/' + char.race.maxEng.toLocaleString(), inline: true  },
        { name: 'FOC', value: char.attributes.foc.toLocaleString() + '/' + char.race.maxFoc.toLocaleString(), inline: true  },
        { name: 'SOL', value: char.attributes.sol.toLocaleString() + '/' + char.race.maxSol.toLocaleString(), inline: true  },
      );
    }
    else {
      currEmbed.addFields(
        { name: 'STR', value: char.attributes.str.toLocaleString(), inline: true  },
        { name: 'DEX', value: char.attributes.dex.toLocaleString(), inline: true  },
        { name: 'CON', value: char.attributes.con.toLocaleString(), inline: true  },
        { name: 'ENG', value: char.attributes.eng.toLocaleString(), inline: true  },
        { name: 'FOC', value: char.attributes.foc.toLocaleString(), inline: true  },
        { name: 'SOL', value: char.attributes.sol.toLocaleString(), inline: true  },
      );
    }

    let dogiN = "None";
    let weaponN = "None";
    if(char.dogi !== null) dogiN = char.dogi.name.replace(/\_/g,' ');
    if(char.weapon !== null) weaponN = char.weapon.name.replace(/\_/g,' ');
    currEmbed.addFields(
      { name: 'Dogi', value: dogiN, inline: true  },
      { name: 'Weapon', value: weaponN, inline: true  },
      { name: 'Fighting Style', value: char.styleName.replace(/\_/g,' '), inline: true  }
      );
    let points = '';
    if(char.statPoints != 1) {
      points += char.statPoints + ' stat points available. ';
    }
    else {
      points += char.statPoints + ' stat point available. ';
    }
    if(char.techniquePoints != 1) {
      points += char.techniquePoints + ' technique points available.';
    }
    else {
      points += char.techniquePoints + ' technique point available. ';
    }
    currEmbed.setFooter({ text: points });
    
    msg.channel.send({ embeds: [currEmbed] });
  }

  function printStyle(char) {
    let currEmbed = returnStyle(char);
    msg.channel.send({ embeds: [currEmbed] });
  }

  function returnStyle(char) {
    let currEmbed;
    let found = 0;
    for(let i = 0; i < char.battleCurrAtt.buffs.length; i++) {
      if(char.battleCurrAtt.buffs[i].type === "Fighting Style") {
        found = 1;
        currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle(char.name.replace(/\_/g,' ') + "'s Fighting Style");
        let cap = styleBonusCap + 50 * (parseInt(char.potentialUnlocked) + parseInt(char.potentialUnleashed));
        currEmbed.setDescription('The current total bonus is: **' + char.battleCurrAtt.buffs[i].getTotalChange().toLocaleString(undefined) + "%** out of the total cap of **" + cap.toLocaleString() + "%.**\nEach individual stat cap is **50%.**");
        currEmbed.addFields(
          { name: char.battleCurrAtt.buffs[i].name.replace(/\_/g,' '), value: char.battleCurrAtt.buffs[i].outputBonusStr(), inline:true }
        );
        let tx = "Add keyword modify to edit."
        currEmbed.setFooter({ text: tx });
        break;
      }
    }
    if(found !== 1) {
      currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('No Fighting Style');
      currEmbed.setDescription('A fighting style can be created with 150 technique points. Use the command **style create** with three of [str,dex,con,eng,sol,foc] that are not the same.');
    }
    return currEmbed;
  }

  function displayModifyStyle(cost,char,count) {    
    let bonuses = char.fightingStyle.outputBonusArray();
    let vars = new Array();
    vars.push("Str");
    vars.push("Dex");
    vars.push("Con");
    vars.push("Eng");
    vars.push("Sol");
    vars.push("Foc");

    vars.push("ChargeBonus");
    vars.push("Charge");
    vars.push("HealthRegen");
    vars.push("EnergyRegen");
    vars.push("Hit");
    vars.push("Dodge");
    vars.push("Speed");

    vars.push("CritRate");
    vars.push("CritDamage");
    vars.push("BlockRate");
    vars.push("BlockPower");
    vars.push("pDefense");
    vars.push("eDefense");

    vars.push("MagicPower");
    vars.push("MagicDefense");
    vars.push("PhysicalAttack");
    vars.push("EnergyAttack");

    let varsPages = new Array();
    let varsMaxPage = vars.length;
    let varsPage = 0;
    let three;
    let temp = [];

    for(let varsIndex = 0; varsIndex < vars.length; varsIndex += parseInt(temp[0])) {
      temp = stylePick(varsIndex, vars, char.fightingStyle);
      three = temp[1];
      let page1Embed = new Discord.MessageEmbed(statusEmbed).setTitle('Style Upgrades');
      page1Embed.setThumbnail("https://cdn.discordapp.com/attachments/832585611486691408/986181005591318558/unknown.png");
      page1Embed.setDescription("Choose one. Costs " + (bonuses.length*25).toLocaleString(undefined)  + " technique points. You have " + char.techniquePoints.toLocaleString(undefined) + ' technique points.');

      const row = new MessageActionRow()
      row.addComponents(
        new MessageButton()
          .setCustomId('cancel')
          .setLabel('❌')
          .setStyle('DANGER')
        );

      if(three[0] == '\u200b') {
        row.addComponents(
          new MessageButton()
            .setCustomId('one')
            .setLabel(three[0])
            .setStyle('PRIMARY')
            .setDisabled(true),
        );
      }
      else {
        row.addComponents(
          new MessageButton()
            .setCustomId('one')
            .setLabel(three[0])
            .setStyle('PRIMARY'),
        );
      }
      if(three[1] == '\u200b') {
        row.addComponents(
          new MessageButton()
            .setCustomId('two')
            .setLabel(three[1])
            .setStyle('PRIMARY')
            .setDisabled(true),
        );
      }
      else {
        row.addComponents(
          new MessageButton()
            .setCustomId('two')
            .setLabel(three[1])
            .setStyle('PRIMARY'),
        );
      }
      if(three[2] == '\u200b') {
        row.addComponents(
          new MessageButton()
            .setCustomId('three')
            .setLabel(three[2])
            .setStyle('PRIMARY')
            .setDisabled(true),
        );
      }
      else {
        row.addComponents(
          new MessageButton()
            .setCustomId('three')
            .setLabel(three[2])
            .setStyle('PRIMARY'),
        );
      }
      if(three[3] == '\u200b') {
        row.addComponents(
          new MessageButton()
            .setCustomId('four')
            .setLabel(three[3])
            .setStyle('PRIMARY')
            .setDisabled(true),
        );
      }
      else {
        row.addComponents(
          new MessageButton()
            .setCustomId('four')
            .setLabel(three[3])
            .setStyle('PRIMARY'),
        );
      }

      varsPages.push([page1Embed,row]);
      varsPage++;
    }
    varsMaxPage = varsPage;

    let pages = new Array();
    let page = 0;
    length = bonuses.length+1;
    let maxPage = Math.ceil(length/4);
    if(char.techniquePoints < (bonuses.length*25)) length -= 1;
    if(length > 6) length = 6;

    let currEmbed = returnStyle(char);
    currEmbed.setFooter({
      text:'The next upgrade will cost ' + cost.toLocaleString(undefined) + ' technique points. You currently have ' + char.techniquePoints.toLocaleString(undefined) + ' technique points.'
    });
    for(let i = 0; i < length; i+=4) {
      const row = new MessageActionRow();
      row.addComponents(
        new MessageButton()
          .setCustomId('cancel')
          .setLabel('❌')
          .setStyle('DANGER')
      );
      if(i == bonuses.length && bonuses.length < 6 && char.techniquePoints >= (bonuses.length*25)) {
        row.addComponents(
          new MessageButton()
            .setCustomId('new')
            .setLabel('Add New Stat')
            .setStyle('SUCCESS'),
        );
      }
      else if(i >= bonuses.length) {
        row.addComponents(
          new MessageButton()
            .setCustomId('one')
            .setLabel('\u200b')
            .setStyle('PRIMARY')
            .setDisabled(true),
        );
      }
      else {
        row.addComponents(
          new MessageButton()
            .setCustomId('one')
            .setLabel(bonuses[i][0])
            .setStyle('PRIMARY'),
        );
      }
      if((i+1) == bonuses.length && bonuses.length < 6 && char.techniquePoints >= (bonuses.length*25)) {
        row.addComponents(
          new MessageButton()
            .setCustomId('new')
            .setLabel('Add New Stat')
            .setStyle('SUCCESS'),
        );
      }
      else if((i+1) >= bonuses.length) {
        row.addComponents(
          new MessageButton()
            .setCustomId('two')
            .setLabel('\u200b')
            .setStyle('PRIMARY')
            .setDisabled(true),
        );
      }
      else {
        row.addComponents(
          new MessageButton()
            .setCustomId('two')
            .setLabel(bonuses[i+1][0])
            .setStyle('PRIMARY'),
        );
      }
      if((i+2) == bonuses.length && bonuses.length < 6 && char.techniquePoints >= (bonuses.length*25)) {
        row.addComponents(
          new MessageButton()
            .setCustomId('new')
            .setLabel('Add New Stat')
            .setStyle('SUCCESS'),
        );
      }
      else if((i+2) >= bonuses.length) {
        row.addComponents(
          new MessageButton()
            .setCustomId('three')
            .setLabel('\u200b')
            .setStyle('PRIMARY')
            .setDisabled(true),
        );
      }
      else {
        row.addComponents(
          new MessageButton()
            .setCustomId('three')
            .setLabel(bonuses[i+2][0])
            .setStyle('PRIMARY'),
        );
      }
      if((i+3) == bonuses.length && bonuses.length < 6 && char.techniquePoints >= (bonuses.length*25)) {
        row.addComponents(
          new MessageButton()
            .setCustomId('new')
            .setLabel('Add New Stat')
            .setStyle('SUCCESS'),
        );
      }
      else if((i+3) >= bonuses.length) {
        row.addComponents(
          new MessageButton()
            .setCustomId('four')
            .setLabel('\u200b')
            .setStyle('PRIMARY')
            .setDisabled(true),
        );
      }
      else {
        row.addComponents(
          new MessageButton()
            .setCustomId('four')
            .setLabel(bonuses[i+3][0])
            .setStyle('PRIMARY'),
        );
      }
      pages.push([currEmbed,row]);
    }

    let row2 = styleAddRow(cost,char,page,maxPage,0);

    let adding = 0;
    let blength = bonuses.length;
    char.styleModify = 1;
    msg.channel.send({ embeds: [pages[0][0]], components: [row2,pages[0][1]]}).then(message => {
      const filter = (i) => {
               return (i.user.id === char.playerID && message.id === i.message.id);
            };

      const collector = msg.channel.createMessageComponentCollector({ filter, time: 1000*60*60*12 });

      let item;
      collector.on('collect', async i => {
        if(i.customId === 'cancel') {
          i.update({ embeds: [pages[page][0]], components: [] });
          collector.stop();
          char.styleModify = 0;
        }
        else if(i.customId === 'left') {
          if(page > 0) {
            page--;
            row2 = styleAddRow(cost,char,page,maxPage,adding);
            i.update({ embeds: [pages[page][0]], components: [row2,pages[page][1]]});
          }
          else {
            page = maxPage-1;
            row2 = styleAddRow(cost,char,page,maxPage,adding);
            i.update({ embeds: [pages[page][0]], components: [row2,pages[page][1]]});
          }
        }
        else if(i.customId === 'right') {
          if(page < maxPage-1) {
            page++;
            row2 = styleAddRow(cost,char,page,maxPage,adding);
            i.update({ embeds: [pages[page][0]], components: [row2,pages[page][1]]});
          }
          else {
            page = 0;
            row2 = styleAddRow(cost,char,page,maxPage,adding);
            i.update({ embeds: [pages[page][0]], components: [row2,pages[page][1]]});
          }
        }
        else if(i.customId === 'new') {
          page = 0;
          maxPage = varsMaxPage;
          pages = varsPages;
          bonuses = vars;
          adding = 1;
          row2 = styleAddRow(cost,char,page,maxPage,adding);
          i.update({ embeds: [pages[page][0]], components: [row2,pages[page][1]]});
        }
        else if(i.customId === 'addOne') {
          count = 1;
          cost = calcStyleUpgrade(char.fightingStyle,count);
          currEmbed = returnStyle(char);
          currEmbed.setFooter({
            text:'The next upgrade will cost ' + cost.toLocaleString(undefined) + ' technique points. You currently have ' + char.techniquePoints.toLocaleString(undefined) + ' technique points.'
          });
          for(let i = 0; i < pages.length; i++) pages[i][0] = currEmbed;
          i.update({ embeds: [pages[page][0]], components: [row2,pages[page][1]]});
        }
        else if(i.customId === 'addFive') {
          count = 5;
          cost = calcStyleUpgrade(char.fightingStyle,count);
          currEmbed = returnStyle(char);
          currEmbed.setFooter({
            text:'The next upgrade will cost ' + cost.toLocaleString(undefined) + ' technique points. You currently have ' + char.techniquePoints.toLocaleString(undefined) + ' technique points.'
          });
          for(let i = 0; i < pages.length; i++) pages[i][0] = currEmbed;
          i.update({ embeds: [pages[page][0]], components: [row2,pages[page][1]]});
        }
        else if(i.customId === 'addTen') {
          count = 10;
          cost = calcStyleUpgrade(char.fightingStyle,count);
          currEmbed = returnStyle(char);
          currEmbed.setFooter({
            text:'The next upgrade will cost ' + cost.toLocaleString(undefined) + ' technique points. You currently have ' + char.techniquePoints.toLocaleString(undefined) + ' technique points.'
          });
          for(let i = 0; i < pages.length; i++) pages[i][0] = currEmbed;
          i.update({ embeds: [pages[page][0]], components: [row2,pages[page][1]]});
        }
        else if(i.customId === 'one') {
          let valid = null;
          let nStat = 0;
          if(adding === 1) {
            count = 5;
            nStat = 1;
            cost = blength*25;
            valid = styleFunctions(char, bonuses[page*4], count, cost);
          }
          else valid = styleFunctions(char, bonuses[page*4][0], count, cost);
          if(valid[0] === 0) {
            char.techniquePoints -= cost;
            cost = calcStyleUpgrade(char.fightingStyle,count);
            loader.characterSaver(charList);
            loader.styleSaver(npcList,charList);
            currEmbed = returnStyle(char);
            for(let i = 0; i < pages.length; i++) pages[i][0] = currEmbed;
            row2 = styleAddRow(cost,char,page,maxPage,adding);
            try {
              if(nStat === 0) i.update({ embeds: [valid[1]], components: [row2,pages[page][1]]});
              else {
                i.update({ embeds: [pages[page][0]], components: [] });
                collector.stop();
                char.styleModify = 0;
              }
            } catch (error) { console.error(error); }
          }
          else {
            try {
              i.update({ embeds: [pages[page][0]], components: [] })
                  .then(collector.stop());
              char.styleModify = 0;
            } catch (error) { console.error(error); }
          }
        }
        else if(i.customId === 'two') {
          let valid = null;
          let nStat = 0;
          if(adding === 1) {
            count = 5;
            nStat = 1;
            cost = blength*25;
            valid = styleFunctions(char, bonuses[page*4+1], count, cost);
          }
          else valid = styleFunctions(char, bonuses[page*4+1][0], count, cost);
          if(valid[0] === 0) {
            char.techniquePoints -= cost;
            cost = calcStyleUpgrade(char.fightingStyle,count);
            loader.characterSaver(charList);
            loader.styleSaver(npcList,charList);
            currEmbed = returnStyle(char);
            for(let i = 0; i < pages.length; i++) pages[i][0] = currEmbed;
            row2 = styleAddRow(cost,char,page,maxPage,adding);
            try {
              if(nStat === 0) i.update({ embeds: [valid[1]], components: [row2,pages[page][1]]});
              else {
                i.update({ embeds: [pages[page][0]], components: [] });
                collector.stop();
                char.styleModify = 0;
              }
            } catch (error) { console.error(error); }
          }
          else {
            try {
              i.update({ embeds: [pages[page][0]], components: [] })
                  .then(collector.stop());
              char.styleModify = 0;
            } catch (error) { console.error(error); }
          }
        }
        else if(i.customId === 'three') {
          let valid = null;
          let nStat = 0;
          if(adding === 1) {
            count = 5;
            nStat = 1;
            cost = blength*25;
            valid = styleFunctions(char, bonuses[page*4+2], count, cost);
          }
          else valid = styleFunctions(char, bonuses[page*4+2][0], count, cost);
          if(valid[0] === 0) {
            char.techniquePoints -= cost;
            cost = calcStyleUpgrade(char.fightingStyle,count);
            loader.characterSaver(charList);
            loader.styleSaver(npcList,charList);
            currEmbed = returnStyle(char);
            for(let i = 0; i < pages.length; i++) pages[i][0] = currEmbed;
            row2 = styleAddRow(cost,char,page,maxPage,adding);
            try {
              if(nStat === 0) i.update({ embeds: [valid[1]], components: [row2,pages[page][1]]});
              else {
                i.update({ embeds: [pages[page][0]], components: [] });
                collector.stop();
                char.styleModify = 0;
              }
            } catch (error) { console.error(error); }
          }
          else {
            try {
              i.update({ embeds: [pages[page][0]], components: [] })
                  .then(collector.stop());
              char.styleModify = 0;
            } catch (error) { console.error(error); }
          }
        }
        else if(i.customId === 'four') {
          let valid = null;
          let nStat = 0;
          if(adding === 1) {
            count = 5;
            nStat = 1;
            cost = blength*25;
            valid = styleFunctions(char, bonuses[page*4+3], count, cost);
          }
          else valid = styleFunctions(char, bonuses[page*4+3][0], count, cost);
          if(valid[0] === 0) {
            char.techniquePoints -= cost;
            cost = calcStyleUpgrade(char.fightingStyle,count);
            loader.characterSaver(charList);
            loader.styleSaver(npcList,charList);
            currEmbed = returnStyle(char);
            for(let i = 0; i < pages.length; i++) pages[i][0] = currEmbed;
            row2 = styleAddRow(cost,char,page,maxPage,adding);
            try {
              if(nStat === 0) i.update({ embeds: [valid[1]], components: [row2,pages[page][1]]});
              else {
                i.update({ embeds: [pages[page][0]], components: [] });
                collector.stop();
                char.styleModify = 0;
              }
            } catch (error) { console.error(error); }
          }
          else {
            try {
              i.update({ embeds: [pages[page][0]], components: [] })
                  .then(collector.stop());
              char.styleModify = 0;
            } catch (error) { console.error(error); }
          }
        }
        else {
          message.channel.send("Purchase failed, insufficient Technique Points. Try again later.")
          i.update({ embeds: [pages[page][0]], components: [] });
          collector.stop();
          char.styleModify = 0;
        }
      })

      collector.on('end', collected => {
          char.styleModify = 0;
      })
    });
  }

  function styleFunctions(char,stat,count,cost) {
    let invalid = 1;
    let tp = char.techniquePoints - cost;
    //check if valid
    if(stat === "Str" && (char.fightingStyle.bstr + count*0.01).toFixed(1) <= styleStatCap && tp >= 0) invalid = 0;
    if(stat === "Dex" && (char.fightingStyle.bdex + count*0.01).toFixed(1) <= styleStatCap && tp >= 0) invalid = 0;
    if(stat === "Con" && (char.fightingStyle.bcon + count*0.01).toFixed(1) <= styleStatCap && tp >= 0) invalid = 0;
    if(stat === "Eng" && (char.fightingStyle.beng + count*0.01).toFixed(1) <= styleStatCap && tp >= 0) invalid = 0;
    if(stat === "Sol" && (char.fightingStyle.bsol + count*0.01).toFixed(1) <= styleStatCap && tp >= 0) invalid = 0;
    if(stat === "Foc" && (char.fightingStyle.bfoc + count*0.01).toFixed(1) <= styleStatCap && tp >= 0) invalid = 0;

    if((stat === "Charge Bonus" || stat === "ChargeBonus") && (char.fightingStyle.chargeBonus + count*0.01).toFixed(1) <= (styleStatCap/5).toFixed(1) && tp >= 0) invalid = 0;
    if(stat === "Charge" && (char.fightingStyle.charge + count*0.01).toFixed(1) <= styleStatCap && tp >= 0) invalid = 0;
    if(stat === "Health" && (char.fightingStyle.health + count*0.01).toFixed(1) <= styleStatCap && tp >= 0) invalid = 0;
    if(stat === "Energy" && (char.fightingStyle.energy + count*0.01).toFixed(1) <= styleStatCap && tp >= 0) invalid = 0;
    if((stat === "Health Regen" || stat === "HealthRegen") && (char.fightingStyle.healthRegen + count*0.01).toFixed(1) <= styleStatCap && tp >= 0) invalid = 0;
    if((stat === "Energy Regen" || stat === "EnergyRegen") && (char.fightingStyle.energyRegen + count*0.01).toFixed(1) <= styleStatCap && tp >= 0) invalid = 0;

    if((stat === "Hit Rate" || stat === "Hit") && (char.fightingStyle.hit + count*0.01).toFixed(1) <= styleStatCap && tp >= 0) invalid = 0;
    if(stat === "Dodge" && (char.fightingStyle.dodge + count*0.01).toFixed(1) <= styleStatCap && tp >= 0) invalid = 0;
    if(stat === "Speed" && (char.fightingStyle.speed + count*0.01).toFixed(1) <= styleStatCap && tp >= 0) invalid = 0;
    if((stat === "Crit Rate" || stat === "CritRate") && (char.fightingStyle.critRate + count*0.01).toFixed(1) <= styleStatCap && tp >= 0) invalid = 0;
    if((stat === "Crit Damage" || stat === "CritDamage") && (char.fightingStyle.critDamage + count*0.01).toFixed(1) <= styleStatCap && tp >= 0 && tp >= 0) invalid = 0;
    if((stat === "Block Rate" || stat === "BlockRate") && (char.fightingStyle.blockRate + count*0.01).toFixed(1) <= styleStatCap && tp >= 0) invalid = 0;
    if((stat === "Block Power" || stat === "BlockPower") && (char.fightingStyle.blockPower + count*0.01).toFixed(1) <= styleStatCap && tp >= 0) invalid = 0;

    if((stat === "Physical Defense" || stat === "pDefense") && (char.fightingStyle.pDefense + count*0.01).toFixed(1) <= styleStatCap && tp >= 0) invalid = 0;
    if((stat === "Energy Defense" || stat === "eDefense") && (char.fightingStyle.eDefense + count*0.01).toFixed(1) <= styleStatCap && tp >= 0) invalid = 0;

    if((stat === "Magic Power" || stat === "MagicPower") && (char.fightingStyle.magicPower + count*0.01).toFixed(1) <= styleStatCap && tp >= 0) invalid = 0;
    if((stat === "Magic Defense" || stat === "MagicDefense") && (char.fightingStyle.magicDefense + count*0.01).toFixed(1) <= styleStatCap && tp >= 0) invalid = 0;

    if((stat === "Physical Attack" || stat === "PhysicalAttack") && (char.fightingStyle.physicalAttack + count*0.01).toFixed(1) <= styleStatCap && tp >= 0) invalid = 0;
    if((stat === "Energy Attack" || stat === "EnergyAttack") && (char.fightingStyle.energyAttack + count*0.01).toFixed(1) <= styleStatCap && tp >= 0) invalid = 0;


    let cap = styleBonusCap + 50 * (parseInt(char.potentialUnlocked) + parseInt(char.potentialUnleashed));
    if(parseInt(char.fightingStyle.getTotalChange()) >= cap) {
      invalid = 1;
    }

    if(invalid === 1) {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Style Upgrade Failed');
      currEmbed.setDescription('Purchase failed, this would go above the stat cap or put you into negative TP. Try again.');
      msg.channel.send({ embeds: [currEmbed] });
      //printStyle(char);
      return [invalid,null];
    }
    else {
      if(stat === "Str") char.fightingStyle.bstr += count*0.01;
      if(stat === "Dex") char.fightingStyle.bdex += count*0.01;
      if(stat === "Con") char.fightingStyle.bcon += count*0.01;
      if(stat === "Eng") char.fightingStyle.beng += count*0.01;
      if(stat === "Sol") char.fightingStyle.bsol += count*0.01;
      if(stat === "Foc") char.fightingStyle.bfoc += count*0.01;

      if(stat === "Charge Bonus" || stat === "ChargeBonus") char.fightingStyle.chargeBonus += count*0.01;
      if(stat === "Charge") char.fightingStyle.charge += count*0.01;
      if(stat === "Health") char.fightingStyle.health += count*0.01;
      if(stat === "Energy") char.fightingStyle.energy += count*0.01;
      if(stat === "Health Regen" || stat === "HealthRegen") char.fightingStyle.healthRegen += count*0.01;
      if(stat === "Energy Regen" || stat === "EnergyRegen") char.fightingStyle.energyRegen += count*0.01;

      if(stat === "Hit Rate" || stat === "Hit") char.fightingStyle.hit += count*0.01;
      if(stat === "Dodge") char.fightingStyle.dodge += count*0.01;
      if(stat === "Speed") char.fightingStyle.speed += count*0.01;
      if(stat === "Crit Rate" || stat === "CritRate") char.fightingStyle.critRate += count*0.01;
      if(stat === "Crit Damage" || stat === "CritDamage") char.fightingStyle.critDamage += count*0.01;
      if(stat === "Block Rate" || stat === "BlockRate") char.fightingStyle.blockRate += count*0.01;
      if(stat === "Block Power" || stat === "BlockPower") char.fightingStyle.blockPower += count*0.01;

      if(stat === "Physical Defense" || stat === "pDefense") char.fightingStyle.pDefense += count*0.01;
      if(stat === "Energy Defense" || stat === "eDefense") char.fightingStyle.eDefense += count*0.01;

      if(stat === "Magic Power" || stat === "MagicPower") char.fightingStyle.magicPower += count*0.01;
      if(stat === "Magic Defense" || stat === "MagicDefense") char.fightingStyle.magicDefense += count*0.01;

      if(stat === "Physical Attack" || stat === "PhysicalAttack") char.fightingStyle.physicalAttack += count*0.01;
      if(stat === "Energy Attack" || stat === "EnergyAttack") char.fightingStyle.energyAttack += count*0.01;

      let currEmbed = returnStyle(char);
      currEmbed.setFooter({
        text:'The next upgrade will cost ' + calcStyleUpgrade(char.fightingStyle,count).toLocaleString(undefined) + ' technique points. You currently have ' + tp.toLocaleString(undefined) + ' technique points.'
      });
      char.statusUpdate(0);
      return [invalid,currEmbed];
      /*msg.channel.send({ embeds: [currEmbed] });
      printStyle(char);*/
    }
  }

  function styleAddRow(count, char, page, maxPage, adding) {
    if(!adding) adding = 0;
    let five = calcStyleUpgrade(char.fightingStyle,5);
    let ten = calcStyleUpgrade(char.fightingStyle,10);

    let row2 = new MessageActionRow()
    if(page === 0) {
      row2.addComponents(
        new MessageButton()
          .setCustomId('left')
          .setLabel('⬅')
          .setStyle('PRIMARY')
          .setDisabled(true),
          );
    }
    else {
    row2.addComponents(
      new MessageButton()
        .setCustomId('left')
        .setLabel('⬅')
        .setStyle('PRIMARY'),
        );
    }
    if(page === (maxPage-1) && adding !== 1) {
      row2.addComponents(
        new MessageButton()
          .setCustomId('right')
          .setLabel('➡')
          .setStyle('PRIMARY')
          .setDisabled(true),
          );
    }
    else {
      row2.addComponents(
        new MessageButton()
          .setCustomId('right')
          .setLabel('➡')
          .setStyle('PRIMARY'),
          );
    }

    if(adding !== 1) {
      row2.addComponents(
        new MessageButton()
          .setCustomId('addOne')
          .setLabel('Set +1')
          .setStyle('PRIMARY'),
        );
    }
    else {
      row2.addComponents(
        new MessageButton()
          .setCustomId('addOne')
          .setLabel('Set +1')
          .setStyle('PRIMARY')
          .setDisabled(true),
        );
    }

    if(char.techniquePoints >= five && adding !== 1) {
      row2.addComponents(
        new MessageButton()
        .setCustomId('addFive')
        .setLabel('Set +5')
        .setStyle('PRIMARY'),
        );
    }
    else {
      row2.addComponents(
        new MessageButton()
          .setCustomId('addFive')
          .setLabel('Set +5')
          .setStyle('PRIMARY')
          .setDisabled(true),
        );
    }
    if(char.techniquePoints >= ten && adding !== 1) {
      row2.addComponents(
        new MessageButton()
          .setCustomId('addTen')
          .setLabel('Set +10')
          .setStyle('PRIMARY'),
        );
    }
    else {
      row2.addComponents(
        new MessageButton()
          .setCustomId('addTen')
          .setLabel('Set +10')
          .setStyle('PRIMARY')
          .setDisabled(true),
        );
    }

    return row2;
  }

  /*******************
   * use formula to get the cost of the next (1%) increase
   * 45,474 tp to 200%
   * 22,165 tp to 150%
   * 8,036 tp to 100%
   * 1,385 tp to 50%
  ********************/
  function calcStyleUpgrade(style,amount) {
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

  function printInventory(uid) {
    let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle(msg.author.username + "'s Inventory");
    currEmbed.setThumbnail(msg.author.avatarURL());
    for(let i = 0; i < users[uid].itemInventory.items.length; i++) {
      let temp = users[uid].itemInventory.items[i].printequipment();
      let item = users[uid].itemInventory.items[i];
      currEmbed.addFields(
      { name: (i+1) + ". " + temp[0].replace(/\_/g,' '), value: '*' + item.quality + ' Quality ' + temp[1] + '*, ' + 
                            + item.addedAffixes + '/' + item.maxAddedAffix + ' affixes', inline:false },

      );
    }
    currEmbed.setFooter({
      text:"Capacity: " + users[uid].itemInventory.items.length + "/" + users[uid].itemInventory.maxSize + ", " + users[uid].zeni.toLocaleString(undefined) + " zeni"
      });
    msg.channel.send({ embeds: [currEmbed] });
  }

  function findStrongest() {
    let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Overall Power - Top 10');
    let characters = new Array();
    let str;

    for(let i = 0; i < charList.length; i++) {
      characters.push(charList[i]);
    }
    for(let i = 0; i < npcList.length; i++) {
      characters.push(npcList[i]);
    }
    characters.sort(function(a,b) {return b.level*b.attributes.stotal - a.level*a.attributes.stotal});
    for(let i = 0; i < characters.length && i < 10; i++) {
      let id = characters[i].playerID;
      if(characters[i].playerID === devID) id = "Developer"
      let str = '**'+characters[i].name.replace(/\_/g,' ')+'**\nUserID: ' + id + '\nPower Value  ' + (characters[i].level*characters[i].attributes.stotal).toLocaleString(undefined);
      currEmbed.addField('**Rank ' + (i+1) + '**', str);
    }
    msg.channel.send({ embeds: [currEmbed] });
  }

  function makeItem(type, quality) {
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

  function printItem(item) {
    let itemStuff = item.printequipment();
    let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle(itemStuff[0].replace(/\_/g,' '));
    if(itemStuff[1] == "Dogi") currEmbed.setThumbnail(nameGenerator.dogiImageURL);
    else currEmbed.setThumbnail(nameGenerator.weaponImageURL);

    currEmbed.addFields(
      { name: 'Type', value: itemStuff[1], inline:true },
      { name: 'Quality', value: item.quality, inline:true }
      );
    currEmbed.setFooter({ text: "Added Affixes: " + item.addedAffixes 
      + "/" + item.maxAddedAffix });
    currEmbed.setDescription(itemStuff[2]);
    msg.channel.send({ embeds: [currEmbed] });
  }

  function listNPCs() {
    let characters = new Array();
    let str;

    for(let i = 0; i < npcList.length; i++) {
      characters.push(npcList[i]);
    }

    characters.sort(function(a,b) {return b.level*b.attributes.stotal - a.level*a.attributes.stotal});
    let j = 0;
    while(j < characters.length) {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('NPC List');
      for(let i = j; i < characters.length && i < 10; i+=2) {
        j+=2
        let str = '**'+characters[i].name.replace(/\_/g,' ') + '**\nPower Value  ' + (characters[i].level*characters[i].attributes.stotal).toLocaleString(undefined);
        currEmbed.addField('\u200b', str, true);
        currEmbed.addField('\u200b','\u200b', true);
        if((i+1) < characters.length) {
          let str = '**'+characters[i+1].name.replace(/\_/g,' ') + '**\nPower Value  ' + (characters[i+1].level*characters[i+1].attributes.stotal).toLocaleString(undefined);
          currEmbed.addField('\u200b', str, true);
        }
        else {
          currEmbed.addField('\u200b','\u200b', true);
        }
      }
      msg.channel.send({ embeds: [currEmbed] });
    }
  }

  function guildFunctions(targetPlayer) {
    let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle(targetPlayer.dojo.guildName.replace(/\_/g,' ') + ' Dojo Information');
    currEmbed.setThumbnail("https://cdn.discordapp.com/attachments/832585611486691408/985368853758509066/unknown.png")
    let estr = 'Total Members: ' + targetPlayer.dojo.guildList.length + ' / ' + targetPlayer.dojo.maxSize;
    let valueStr = 'Guild Leader: <@' + targetPlayer.dojo.guildLeader.userID + '>';
    valueStr += '\nGuild Style Name: ' + targetPlayer.dojo.guildStyle.replace(/\_/g,' ');
    valueStr += '\nGuild Applications: ' + targetPlayer.dojo.replyType;

    currEmbed.setDescription(valueStr);
    currEmbed.setFooter({ text: estr });

    const confirmRow = new MessageActionRow();
    confirmRow.addComponents(
      new MessageButton()
        .setCustomId('yes')
        .setLabel('Accpet')
        .setStyle('SUCCESS'),
      new MessageButton()
        .setCustomId('no')
        .setLabel('Decline')
        .setStyle('DANGER'),
      );

    const functionRow = new MessageActionRow();
    functionRow.addComponents(
      new MessageButton()
        .setCustomId('adoptStyle')
        .setLabel('Adopt Style')
        .setStyle('PRIMARY'),
      new MessageButton()
        .setCustomId('leaveGuild')
        .setLabel('Leave Guild')
        .setStyle('DANGER'),
      );

    let totalPages = 0;
    let currPage = 0;
    let memPages = new Array();
    let memRows = new Array();

    let memEmbed = new Discord.MessageEmbed(statusEmbed).setTitle(targetPlayer.dojo.guildName.replace(/\_/g,' ') + ' Member List');
    let memRow = new MessageActionRow();
    for(let i = 0; i < 5; i++) { //targetPlayer.dojo.guildList.length
      let i = 0;
      let usr = bot.users.cache.get(targetPlayer.dojo.guildList[i].userID);
      let str = "" + usr.username;
      let id = i + "";

      memRow.addComponents(
        new MessageButton()
          .setCustomId(id)
          .setLabel(str)
          .setStyle('PRIMARY'),
        );

      str = "<@" + targetPlayer.dojo.guildList[i].userID + ">";
      memEmbed.addFields(
      { name: targetPlayer.dojo.guildList[i].dojoRank, value: str, inline:true }
      );

      if((i % 4 === 0 && i > 0) || i+1 == targetPlayer.dojo.guildList.length) {
        totalPages += 1;
        memPages.push(memEmbed);
        memRows.push(memRow);
        memEmbed = new Discord.MessageEmbed(statusEmbed).setTitle(targetPlayer.dojo.guildName.replace(/\_/g,' ') + ' Member List');
        memRow = new MessageActionRow();
      }
    }

    let currentFunction = 'home';

     msg.channel.send({ embeds: [currEmbed], components: [functionRow]}).then(message => {
      const filter = (i) => {
               return (i.user.id === targetPlayer.userID && message.id === i.message.id);
            };

      const collector = msg.channel.createMessageComponentCollector({ filter, time: 1000*10800 });

      collector.on('collect', async i => {

        if(i.customId === 'yes') {
          if(currentFunction === 'adoptStyle') {
            let cindex = findID(targetPlayer.userID);
            charList[cindex].changeStyleName(targetPlayer.dojo.guildStyle);
          }
          else if(currentFunction === 'leaveGuild') {
            let result = targetPlayer.dojo.removePlayer(targetPlayer);
            if(result !== -1) {
              targetPlayer.dojo = null;
              targetPlayer.dojoRank = null;
            }
            else {
              let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Error');
              currEmbed.setDescription("You are the dojo's master. Pass the leadership or disband instead.");
              msg.channel.send({ embeds: [currEmbed] });
            }
          }

          i.update({ embeds: [currEmbed], components: [] });
          collector.stop();
        }
        else if(i.customId === 'no') {
          currentFunction = 'home';
          currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle(targetPlayer.dojo.guildName.replace(/\_/g,' ') + ' Dojo Information');
          currEmbed.setThumbnail("https://cdn.discordapp.com/attachments/832585611486691408/985368853758509066/unknown.png")
          let estr = 'Total Members: ' + targetPlayer.dojo.guildList.length + ' / ' + targetPlayer.dojo.maxSize;
          let valueStr = 'Guild Leader: <@' + targetPlayer.dojo.guildLeader.userID + '>';
          valueStr += '\nGuild Style Name: ' + targetPlayer.dojo.guildStyle.replace(/\_/g,' ');
          valueStr += '\nGuild Applications: ' + targetPlayer.dojo.replyType;
          currEmbed.setDescription(valueStr);
          currEmbed.setFooter({ text: estr });

          i.update({ embeds: [currEmbed], components: [functionRow] });
         }
        else if(i.customId === 'adoptStyle') {
          currentFunction = 'adoptStyle';
          currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle("Please confirm you wish to adopt your dojo's fighting style.");
          currEmbed.setThumbnail("https://cdn.discordapp.com/attachments/832585611486691408/985368853758509066/unknown.png")
          currEmbed.addField('Are you sure?','\u200b', false);
          currEmbed.setFooter({ text: 'Press a button to accept or not.'});

          i.update({ embeds: [currEmbed], components: [confirmRow] });
        }
        else if(i.customId === 'leaveGuild') {
          currentFunction = 'leaveGuild';
          currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle("Please confirm you wish to leave your dojo.");
          currEmbed.setThumbnail("https://cdn.discordapp.com/attachments/832585611486691408/985368853758509066/unknown.png")
          currEmbed.addField('Are you sure?','\u200b', false);
          currEmbed.setFooter({ text: 'Press a button to accept or not.'});

          i.update({ embeds: [currEmbed], components: [confirmRow] });
         }
        else {
          i.update({ embeds: [currEmbed], components: [] });
          collector.stop();
        }
      })
      collector.on('end', collected => {
      })
    });
  }

  function passGuild(targetPlayer, newLeader) {
    let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Please confirm you wish to pass the leadership of your dojo.');
    currEmbed.setThumbnail("https://cdn.discordapp.com/attachments/832585611486691408/985368853758509066/unknown.png")

    currEmbed.addField('Are you sure?','\u200b', false);

    const row = new MessageActionRow();
    row.addComponents(
      new MessageButton()
        .setCustomId('yes')
        .setLabel('Accpet')
        .setStyle('SUCCESS'),
      new MessageButton()
        .setCustomId('no')
        .setLabel('Decline')
        .setStyle('DANGER'),
      );

    currEmbed.setFooter({ text: 'Press a button to accept or not.'});

     msg.channel.send({ embeds: [currEmbed], components: [row]}).then(message => {
      const filter = (i) => {
               return (i.user.id === targetPlayer.userID && message.id === i.message.id);
            };

      const collector = msg.channel.createMessageComponentCollector({ filter, time: 1000*10800 });

      collector.on('collect', async i => {

        if(i.customId === 'yes') {
          let result = targetPlayer.dojo.passLeader(targetPlayer, newLeader);
          if(result !== -1) {
          }
          else {
            let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Error');
            currEmbed.setDescription("Target is not elligible for passing dojo leadership.");
            msg.channel.send({ embeds: [currEmbed] });
          }
          i.update({ embeds: [currEmbed], components: [] });
          collector.stop();
        }
        else if(i.customId === 'no') {
          i.update({ embeds: [currEmbed], components: [] });
          collector.stop();
         }
        else {
          i.update({ embeds: [currEmbed], components: [] });
          collector.stop();
        }
      })
      collector.on('end', collected => {
      })
    });
  }


  function displayChallenge(player, targetPlayer, zeni, pchar, tchar) {
    let check = getCharListIndex(msg.author.id);
    if (check == null) return;
    if(users[check].shopping !== 0 || users[check].affixing !== 0 || charList[pchar].training > 0) {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('You are already busy.');
      currEmbed.setDescription("Finish what you're doing before picking fights.");
      msg.channel.send({ embeds: [currEmbed] });
      return;
    }

    msg.channel.send('<@' + targetPlayer.userID + '>');
    let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle(charList[player.getCurrentChar()].name + ' has sent you a challenge.');
    currEmbed.setThumbnail("https://cdn.discordapp.com/attachments/832585611486691408/985368853758509066/unknown.png")
    if(zeni > 0) {
      currEmbed.addFields(
        { name: 'This is a staked duel.', value: 'The loser pays ' + parseInt(zeni).toLocaleString(undefined) + ' zeni.', inline:false },
      );
    }

    const row = new MessageActionRow();
    row.addComponents(
      new MessageButton()
        .setCustomId('yes')
        .setLabel('Accpet')
        .setStyle('SUCCESS'),
      new MessageButton()
        .setCustomId('no')
        .setLabel('Decline')
        .setStyle('DANGER'),
      );

    currEmbed.setFooter({ text: 'Press button to accept challenge or not. You have ' + targetPlayer.zeni.toLocaleString(undefined) + ' zeni.' });


    targetPlayer.sparOffer = 1;
    player.sparOffer = 1;
    msg.channel.send({ embeds: [currEmbed], components: [row]}).then(message => {
      const filter = (i) => {
               return (i.user.id === targetPlayer.userID && message.id === i.message.id);
            };

      const collector = msg.channel.createMessageComponentCollector({ filter, time: 1000*10800 });

      collector.on('collect', async i => {

        if(i.customId === 'yes' && targetPlayer.zeni > zeni && player.zeni > zeni) {
          if(checkBattles(player.userID, charList[pchar].name) === 1 
            || checkBattles(targetPlayer.userID, charList[tchar].name) === 1 ) {
            let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Error');
            currEmbed.setDescription('No combatant can be in more than one battle at a time.');
            i.update({ embeds: [currEmbed], components: [] });
            collector.stop();
          }
          else if(player.tutorial === 1 || targetPlayer.tutorial === 1) {
            let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Slow Down!');
            currEmbed.setDescription("Follow the tutorial to the end before doing this.");
            msg.channel.send({ embeds: [currEmbed] });
            return;
          }
          else if(targetPlayer.shopping !== 0 || targetPlayer.affixing !== 0 || charList[tchar].training > 0) {
            let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('You are already busy.');
            currEmbed.setDescription("Finish what you're doing before picking fights.");
            msg.channel.send({ embeds: [currEmbed] });
            return;
          }
          else {
            let clone = charList[pchar].clone();
            let targetclone = charList[tchar].clone();
            clone.level = 300;
            targetclone.level = 300;
            clone.statusUpdate(0);
            targetclone.statusUpdate(0);
            let newbattle = new Battle(new Array(clone),new Array(targetclone),activeCombatList.length, techList);
            newbattle.expMod = 1.1;
            newbattle.deathChance = 0;
            if(!isNaN(args[1]) && args[1] > 0) {
              newbattle.zeniRisk = parseInt(args[1]);
              player.zeni -= parseInt(args[1]);
              targetPlayer.zeni -= parseInt(args[1]);
              loader.userSaver(users);
            }
            activeCombatList.push(newbattle);
            printBattleList(activeCombatList[activeCombatList.length-1]);
            i.update({ embeds: [currEmbed], components: [] });
            collector.stop();
          }
        }
        else if(i.customId === 'no') {
          i.update({ embeds: [currEmbed], components: [] });
          collector.stop();
         }
        else {
          message.reply("Insufficient zeni. Try again later.")
          i.update({ embeds: [currEmbed], components: [] });
          collector.stop();
        }
      })
      collector.on('end', collected => {
        player.sparOffer = 0;
      })
    });
  }

  function displayPartyInvite(player, targetPlayer, inviteOrApply) {
    let check = getCharListIndex(msg.author.id);
    msg.channel.send('<@' + targetPlayer.playerID + '>');
    if (check == null) return
    let currEmbed;
    if(inviteOrApply === 1) currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle(player.name + ' has sent you a party invite.');
    else currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle(player.name + ' has sent you a party join request.');
    currEmbed.setThumbnail("https://cdn.discordapp.com/attachments/832585611486691408/986893015673085962/unknown.png")

    const row = new MessageActionRow();
    row.addComponents(
      new MessageButton()
        .setCustomId('yes')
        .setLabel('Accpet')
        .setStyle('SUCCESS'),
      new MessageButton()
        .setCustomId('no')
        .setLabel('Decline')
        .setStyle('DANGER'),
      );

    currEmbed.setFooter({ text: 'Press button to accept invite or not.' });

    msg.channel.send({ embeds: [currEmbed], components: [row]}).then(message => {
      const filter = (i) => {
               return (i.user.id === targetPlayer.playerID && message.id === i.message.id);
            };

      const collector = msg.channel.createMessageComponentCollector({ filter, time: 1000*60*60*12 });

      collector.on('collect', async i => {
        if(i.customId === 'yes') {
          let bcheck = -1;

          if(inviteOrApply === 1) {
            for(let i = 0; i < player.party.partyList.length; i++) {
              let temp = getCurrentBattle(player.party.partyList[i].playerID, player.party.partyList[i].name);
              if(temp > bcheck) bcheck = temp;
            }
          }
          else {
            for(let i = 0; i < targetPlayer.party.partyList.length; i++) {
              let temp = getCurrentBattle(targetPlayer.party.partyList[i].playerID, targetPlayer.party.partyList[i].name);
              if(temp > bcheck) bcheck = temp;
            }
          }

          if(inviteOrApply === 1 && targetPlayer.party !== null) {
            let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle("Error");
            currEmbed.setDescription("You're already in a party.");
            msg.channel.send({ embeds: [currEmbed] });
          }
          else if(inviteOrApply === 1 && player.party === null) {
            let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle("Error");
            currEmbed.setDescription("You're no longer in a party.");
            msg.channel.send({ embeds: [currEmbed] });
          }
          else if(inviteOrApply === 0 && targetPlayer.party === null) {
            let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle("Error");
            currEmbed.setDescription("You're already in a party.");
            msg.channel.send({ embeds: [currEmbed] });
          }
          else if(inviteOrApply === 0 && player.party !== null) {
            let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle("Error");
            currEmbed.setDescription("Target no longer in a party.");
            msg.channel.send({ embeds: [currEmbed] });
          }
          else if(bcheck !== -1) {
            let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle("Error");
            currEmbed.setDescription("One or more members are in battle. Try again later.");
            msg.channel.send({ embeds: [currEmbed] });
          }
          else {
            let success;
            if(inviteOrApply === 1) success = player.party.addCharacter(targetPlayer);
            else success = targetPlayer.party.addCharacter(player);

            if(success === 0) {
              let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle("Error");
              currEmbed.setDescription("That party is already full.");
              msg.channel.send({ embeds: [currEmbed] });
            }
            else {
              loader.partySaver(partyList);

              let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Successfully joined: ' + player.party.partyName.replace(/\_/g,' '));
              for(let i = 0; i < player.party.partyList.length; i++) {
                let valueStr = 'Power Value: ' + (player.party.partyList[i].level*player.party.partyList[i].attributes.stotal).toLocaleString(undefined);
                valueStr += '\nStat Total: ' + player.party.partyList[i].attributes.stotal.toLocaleString(undefined);
                valueStr += '\nLevel: ' + player.party.partyList[i].level.toLocaleString(undefined);

                currEmbed.addFields(
                  { name: player.party.partyList[i].name.replace(/\_/g,' '), value: valueStr, inline:true }
                  );
              }
              msg.channel.send({ embeds: [currEmbed] });
            }
          }

          i.update({ embeds: [currEmbed], components: [] });
          collector.stop();
        }
        else if(i.customId === 'no') {
          i.update({ embeds: [currEmbed], components: [] });
          collector.stop();
         }
      })
      collector.on('end', collected => {
      })
    });
  }

  //list options, if any, and a close button
  function displayPartyKick(player) {
    let check = getCharListIndex(msg.author.id);
    if (check == null) return
    let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle("Kick Player");
    currEmbed.setDescription(player.name + ', who would you like to remove from ' + player.party.partyName.replace(/\_/g,' ') + '?');
    let eyes = new Array();
    //currEmbed.setThumbnail("https://cdn.discordapp.com/attachments/832585611486691408/986893015673085962/unknown.png")

    const row = new MessageActionRow();
    row.addComponents(new MessageButton()
        .setCustomId('cancel')
        .setLabel('❌')
        .setStyle('DANGER'),
      );
    let i = 0;
    if(player.party.partyList.length > 1) {
      while(player.party.partyList[i].name+player.party.partyList[i].playerID === player.party.partyLeader.name+player.party.partyLeader.playerID) {
        i++;
        if(i >= player.party.partyList.length) break;
      }
      if(i < player.party.partyList.length) {
        let str = player.party.partyList[i].name;
        eyes.push(i);
        i++;
        row.addComponents(new MessageButton()
          .setCustomId('one')
          .setLabel(str)
          .setStyle('PRIMARY'),
        );
      }
      else {
        let str = "None";
        row.addComponents(new MessageButton()
          .setCustomId('one')
          .setLabel(str)
          .setStyle('PRIMARY')
          .setDisabled(true),
        );
      }
    }
    if(player.party.partyList.length > 2) {
      while(player.party.partyList[i].name+player.party.partyList[i].playerID === player.party.partyLeader.name+player.party.partyLeader.playerID) {
        i++;
        if(i >= player.party.partyList.length) break;
      }
      if(i < player.party.partyList.length) {
        let str = player.party.partyList[i].name;
        eyes.push(i);
        i++;
        row.addComponents(new MessageButton()
          .setCustomId('two')
          .setLabel(str)
          .setStyle('PRIMARY'),
        );
      }
      else {
        let str = "None";
        row.addComponents(new MessageButton()
          .setCustomId('two')
          .setLabel(str)
          .setStyle('PRIMARY')
          .setDisabled(true),
        );
      }
    }

    //currEmbed.setFooter({ text: 'Press button to pick which character to remove from the party.' });

    msg.channel.send({ embeds: [currEmbed], components: [row]}).then(message => {
      const filter = (i) => {
               return (i.user.id === player.playerID && message.id === i.message.id);
            };

      const collector = msg.channel.createMessageComponentCollector({ filter, time: 1000*60*60*1 });

      collector.on('collect', async i => {
        if(i.customId === 'one') {
          let index = eyes[0];
          currEmbed.setDescription("Success. You removed " + player.party.partyList[index].name + " from the party.");
          player.party.partyList[index].party = null;
          player.party.partyList.splice(index,1);
          loader.partySaver(partyList);
          i.update({ embeds: [currEmbed], components: [] });
          collector.stop();
        }
        if(i.customId === 'two') {
          let index = eyes[1];
          currEmbed.setDescription("Success. You removed " + player.party.partyList[index].name + " from the party.");
          player.party.partyList[index].party = null;
          player.party.partyList.splice(index,1);
          loader.partySaver(partyList);
          i.update({ embeds: [currEmbed], components: [] });
          collector.stop();
        }
        else if(i.customId === 'cancel') {
          i.update({ embeds: [currEmbed], components: [] });
          collector.stop();
         }
      })
      collector.on('end', collected => {
      })
    });
  }

  function displayOffer(player, targetPlayer, zeni, item) {
    msg.channel.send('<@' + targetPlayer.userID + '>');
    printItem(item);
    let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle(charList[player.getCurrentChar()].name.replace(/\_/g,' ') + ' has sent you an offer.');
    currEmbed.setThumbnail("https://cdn.discordapp.com/attachments/832585611486691408/985070860631158804/unknown.png")
    currEmbed.addFields(
      { name: item.name.replace(/\_/g,' '), value: parseInt(zeni).toLocaleString(undefined) + ' zeni', inline:false },
      );
    currEmbed.setFooter({ text: 'Press button to buy item or not. You have ' + targetPlayer.zeni.toLocaleString(undefined) + ' zeni.' });

    const row = new MessageActionRow();
    row.addComponents(
      new MessageButton()
        .setCustomId('yes')
        .setLabel('Yes')
        .setStyle('SUCCESS'),
      new MessageButton()
        .setCustomId('no')
        .setLabel('No')
        .setStyle('DANGER'),
      );

    player.trading = 1;
    targetPlayer.trading = 1;
    msg.channel.send({ embeds: [currEmbed], components: [row]}).then(message => {
      const filter = (i) => {
               return (i.user.id === targetPlayer.userID && message.id === i.message.id);
            };

      const collector = msg.channel.createMessageComponentCollector({ filter, time: 1000*10800 });

      collector.on('collect', async i => {
        if(i.customId === 'yes' && targetPlayer.zeni > zeni && targetPlayer.itemInventory.items.length < targetPlayer.itemInventory.maxSize) {

          if(player.tutorial === 1 || targetPlayer.tutorial === 1) {
            let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Slow Down!');
            currEmbed.setDescription("Follow the tutorial to the end before doing this.");
            msg.channel.send({ embeds: [currEmbed] });
            i.update({ embeds: [currEmbed], components: [] });
            collector.stop();
            return;
          }

          message.channel.send("<@" + targetPlayer.userID + "> Successfully purchased <@" + player.userID + ">'s' item.");

          targetPlayer.itemInventory.addItem(item);
          player.zeni = parseInt(player.zeni) + parseInt(zeni);
          targetPlayer.zeni = targetPlayer.zeni - zeni;

          player.itemInventory.removeItem(args[0]);

          loader.userSaver(users);
          loader.itemSaver(itemList);
          loader.inventorySaver(invList);
          i.update({ embeds: [currEmbed], components: [] });
          collector.stop();
        }
        else if(i.customId === 'no') {
          message.channel.send("<@" + targetPlayer.userID + "> Rejected <@" + player.userID + ">'s offer.")
          i.update({ embeds: [currEmbed], components: [] });
          collector.stop();
        }
        else {
          message.channel.send("Purchase failed, insufficient zeni or not enough space in inventory. Try again later.")
          i.update({ embeds: [currEmbed], components: [] });
          collector.stop();
        }
      })

      collector.on('end', collected => {
          player.trading = 0;
      })
    })
  }

  function helpPages(array) {
    let pages = new Array();

    for(let i = 0; i < array.length; i+=3) {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Help');
      currEmbed.setThumbnail("https://cdn.discordapp.com/attachments/986234335051018340/988244698265161728/unknown.png")
      currEmbed.setDescription("What would you like to know?");
      currEmbed.setFooter({ text: 'Press button to view help information about the topic.' });

      const row = new MessageActionRow();
      row.addComponents(
        new MessageButton()
          .setCustomId('cancel')
          .setLabel('❌')
          .setStyle('DANGER')
      );
      if(i >= array.length) {
        row.addComponents(
          new MessageButton()
            .setCustomId('one')
            .setLabel('\u200b')
            .setStyle('PRIMARY')
            .setDisabled(true),
        );
      }
      else {
        row.addComponents(
          new MessageButton()
            .setCustomId('one')
            .setLabel(array[i])
            .setStyle('PRIMARY'),
        );
      }

      if((i+1) >= array.length) {
        row.addComponents(
          new MessageButton()
            .setCustomId('two')
            .setLabel('\u200b')
            .setStyle('PRIMARY')
            .setDisabled(true),
        );
      }
      else {
        row.addComponents(
          new MessageButton()
            .setCustomId('two')
            .setLabel(array[i+1])
            .setStyle('PRIMARY'),
        );
      }
      if((i+2) >= array.length) {
        row.addComponents(
          new MessageButton()
            .setCustomId('three')
            .setLabel('\u200b')
            .setStyle('PRIMARY')
            .setDisabled(true),
        );
      }
      else {
        row.addComponents(
          new MessageButton()
            .setCustomId('three')
            .setLabel(array[i+2])
            .setStyle('PRIMARY'),
        );
      }
      row.addComponents(
        new MessageButton()
          .setCustomId('right')
          .setLabel('➡')
          .setStyle('PRIMARY'),
      );

      pages.push([currEmbed,row])
    }
    return pages;
  }

  function navigationBar(left, right) {
      const row = new MessageActionRow();
      row.addComponents(
        new MessageButton()
          .setCustomId('cancel')
          .setLabel('❌')
          .setStyle('DANGER'),
      );


      if(left) {
        row.addComponents(
          new MessageButton()
            .setCustomId('left')
            .setLabel('⬅')
            .setStyle('PRIMARY'),
        );
      }
      else {
        row.addComponents(
          new MessageButton()
            .setCustomId('left')
            .setLabel('⬅')
            .setStyle('PRIMARY')
            .setDisabled(true),
        );
      }

      if(right) {
        row.addComponents(
          new MessageButton()
            .setCustomId('right')
            .setLabel('➡')
            .setStyle('PRIMARY'),
        );
      }
      else {
        row.addComponents(
          new MessageButton()
            .setCustomId('right')
            .setLabel('➡')
            .setStyle('PRIMARY')
            .setDisabled(true),
        );
      }

      return row;
  }

  function displayTraining(playerID, playerIndex) {
      let player = users[playerIndex];
      let str = ""
      if(player.dojo !== null) str = ', ' + player.dojo.guildName.replace(/\_/g,' ');

      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Training' + str);
      currEmbed.setThumbnail("https://cdn.discordapp.com/attachments/986234335051018340/988244698265161728/unknown.png");
      currEmbed.setFooter({ text: 'Select Character' });
      currEmbed.setDescription("Who needs training?");

      let currentPage = 0;
      let charRows = new Array();
      let charRow = new MessageActionRow();
      let i;
      for(i = 0; i < player.charIDs.length; i++) {
        let str = charList[player.charIDs[i]].name + ', ' + charList[player.charIDs[i]].race.raceName.replace(/\_/g,' ') + '\nPower Value: ' + (charList[player.charIDs[i]].level*charList[player.charIDs[i]].attributes.stotal).toLocaleString(undefined);
        str += '\nStat Total: ' + charList[player.charIDs[i]].attributes.stotal;
        currEmbed.addField('Character ' + (1+i), str, true);

        if(charList[player.charIDs[i]].training > 0) {
          charRow.addComponents(
            new MessageButton()
              .setCustomId(i.toLocaleString(undefined))
              .setLabel(charList[player.charIDs[i]].name)
              .setStyle('PRIMARY')
              .setDisabled(true),
          );
        }
        else {
          charRow.addComponents(
            new MessageButton()
              .setCustomId(i.toLocaleString(undefined))
              .setLabel(charList[player.charIDs[i]].name)
              .setStyle('PRIMARY'),
          );
        }

        if((i != 0 && ((i+1)%5 == 0)) || i+1 == player.charIDs.length) {
          charRows.push(charRow);
          charRow = new MessageActionRow();
        }
      }
      while(i < 6) {
        currEmbed.addField('\u200b', '\u200b', true);
        i++;
      }

      let row = navigationBar((player.charIDs.length > 5), (player.charIDs.length > 5));

      const choiceRow = new MessageActionRow();
      choiceRow.addComponents(
        new MessageButton()
          .setCustomId('tp')
          .setLabel('Training Points')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId('xp')
          .setLabel('Experience Points')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId('txp')
          .setLabel('Hybrid')
          .setStyle('PRIMARY'),
      );

      let timeRow = new MessageActionRow();
      timeRow.addComponents(
        new MessageButton()
          .setCustomId('minus1')
          .setLabel('-1 Hour')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId('plus1')
          .setLabel('+1 Hour')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId('set12')
          .setLabel('Set to 12 Hours')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId('set24')
          .setLabel('Set to 1 Day')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId('confirm')
          .setLabel('Confirm Training')
          .setStyle('SUCCESS'),
      );

      let charIndex = -1;
      let swap = -1;
      let time = -1;

      let hours = 1;

      msg.channel.send({ embeds: [currEmbed], components: [charRows[currentPage], row]}).then(message => {
        const filter = (i) => {
                 return (i.user.id === playerID && message.id === i.message.id);
              };

        const collector = msg.channel.createMessageComponentCollector({ filter, time: 1000*60*60*12 });

        let item;
        collector.on('collect', async i => {
          if(i.customId === 'cancel') { 
            if(charIndex == -1) {
              i.update({ embeds: [currEmbed], components: [] });
              collector.stop();
            }
            else if(time !== -1){
              swap = charIndex;
              time = -1;
            }
            else {
              charIndex = -1;
              row = navigationBar((player.charIDs.length > 5), (player.charIDs.length > 5));
              i.update({ embeds: [currEmbed], components: [charRows[currentPage], row] });
            }
          }
          if(i.customId === 'left') { 
            currentPage--;
            if(currentPage <= 0) {
              currentPage = charRows.length-1;
            }

            i.update({ embeds: [currEmbed], components: [charRows[currentPage], row] });
          }
          if(i.customId === 'right') { 
            currentPage++;
            if(currentPage >= charRows.length) {
              currentPage = 0;
            }

            i.update({ embeds: [currEmbed], components: [charRows[currentPage], row] });
          }
          if(swap !== -1 || !isNaN(i.customId)) {
            currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Training' + str);
            if(swap === -1) {
              charIndex = parseInt(i.customId);
            }
            else swap = -1;
            currEmbed.setThumbnail(charList[player.charIDs[charIndex]].image);
            currEmbed.setFooter({ text: 'Select training type' });
            let nstr = "";
            if(player.dojo !== null) nstr = "Training in your dojo's style improves your training quality.\n";
            nstr += charList[player.charIDs[charIndex]].name + " focuses their mind. Select the training type for today. Character will be unavailable for most actions while training.";
            currEmbed.setDescription(nstr);

            row = navigationBar(false,false);
            i.update({ embeds: [currEmbed], components: [choiceRow,row] });
          }
          else if(i.customId === 'tp') {
            time = 'tp';
            hours = 1;
            currEmbed = setTimeEmbed(hours, player, str, time, charIndex);

            let cost;
            let canPay = false;
            if(time === 'xp') {
              cost = calcXPTrainingCost(player, hours);
              canPay = (charList[player.charIDs[charIndex]].techniquePoints >= cost);
              currEmbed.setFooter({ text: 'Set training duration. You have ' + charList[player.charIDs[charIndex]].techniquePoints.toLocaleString(undefined) + ' technique points.'});
            }
            else {
              cost = calcTPTrainingCost(player, hours);
              canPay = (player.zeni >= cost);
              currEmbed.setFooter({ text: 'Set training duration. You have ' + player.zeni.toLocaleString(undefined) + ' zeni.' });
            }
            timeRow = setTimeRow(canPay);

            i.update({ embeds: [currEmbed], components: [timeRow,row] });
          }
          else if(i.customId === 'xp') {
            time = 'xp';
            hours = 1;
            currEmbed = setTimeEmbed(hours, player, str, time, charIndex);

            let cost;
            let canPay = false;
            if(time === 'xp') {
              cost = calcXPTrainingCost(player, hours);
              canPay = (charList[player.charIDs[charIndex]].techniquePoints >= cost);
              currEmbed.setFooter({ text: 'Set training duration. You have ' + charList[player.charIDs[charIndex]].techniquePoints.toLocaleString(undefined) + ' technique points.'});
            }
            else {
              cost = calcTPTrainingCost(player, hours);
              canPay = (player.zeni >= cost);
              currEmbed.setFooter({ text: 'Set training duration. You have ' + player.zeni.toLocaleString(undefined) + ' zeni.' });
            }
            timeRow = setTimeRow(canPay);

            i.update({ embeds: [currEmbed], components: [timeRow,row] });
          }
          else if(i.customId === 'txp') {
            time = 'txp';
            hours = 1;
            currEmbed = setTimeEmbed(hours, player, str, time, charIndex);

            let cost;
            let canPay = false;
            if(time === 'xp') {
              cost = calcXPTrainingCost(player, hours);
              canPay = (charList[player.charIDs[charIndex]].techniquePoints >= cost);
              currEmbed.setFooter({ text: 'Set training duration. You have ' + charList[player.charIDs[charIndex]].techniquePoints.toLocaleString(undefined) + ' technique points.'});
            }
            else {
              cost = calcTPTrainingCost(player, hours);
              canPay = (player.zeni >= cost);
              currEmbed.setFooter({ text: 'Set training duration. You have ' + player.zeni.toLocaleString(undefined) + ' zeni.' });
            }
            timeRow = setTimeRow(canPay);

            i.update({ embeds: [currEmbed], components: [timeRow,row] });
          }
          else if(i.customId === 'plus1') { 
            hours++;
            if(hours > 24) hours = 24;
            currEmbed = setTimeEmbed(hours, player, str, time, charIndex);

            let cost;
            let canPay = false;
            if(time === 'xp') {
              cost = calcXPTrainingCost(player, hours);
              canPay = (charList[player.charIDs[charIndex]].techniquePoints >= cost);
              currEmbed.setFooter({ text: 'Set training duration. You have ' + charList[player.charIDs[charIndex]].techniquePoints.toLocaleString(undefined) + ' technique points.'});
            }
            else {
              cost = calcTPTrainingCost(player, hours);
              canPay = (player.zeni >= cost);
              currEmbed.setFooter({ text: 'Set training duration. You have ' + player.zeni.toLocaleString(undefined) + ' zeni.' });
            }
            timeRow = setTimeRow(canPay);

            i.update({ embeds: [currEmbed], components: [timeRow,row] });
          }
          else if(i.customId === 'minus1') { 
            hours--;
            if(hours < 1) hours = 1;
            currEmbed = setTimeEmbed(hours, player, str, time, charIndex);

            let cost;
            let canPay = false;
            if(time === 'xp') {
              cost = calcXPTrainingCost(player, hours);
              canPay = (charList[player.charIDs[charIndex]].techniquePoints >= cost);
              currEmbed.setFooter({ text: 'Set training duration. You have ' + charList[player.charIDs[charIndex]].techniquePoints.toLocaleString(undefined) + ' technique points.'});
            }
            else {
              cost = calcTPTrainingCost(player, hours);
              canPay = (player.zeni >= cost);
              currEmbed.setFooter({ text: 'Set training duration. You have ' + player.zeni.toLocaleString(undefined) + ' zeni.' });
            }
            timeRow = setTimeRow(canPay);

            i.update({ embeds: [currEmbed], components: [timeRow,row] });
          }
          else if(i.customId === 'set12') { 
            hours = 12;
            currEmbed = setTimeEmbed(hours, player, str, time, charIndex);

            let cost;
            let canPay = false;
            if(time === 'xp') {
              cost = calcXPTrainingCost(player, hours);
              canPay = (charList[player.charIDs[charIndex]].techniquePoints >= cost);
              currEmbed.setFooter({ text: 'Set training duration. You have ' + charList[player.charIDs[charIndex]].techniquePoints.toLocaleString(undefined) + ' technique points.'});
            }
            else {
              cost = calcTPTrainingCost(player, hours);
              canPay = (player.zeni >= cost);
              currEmbed.setFooter({ text: 'Set training duration. You have ' + player.zeni.toLocaleString(undefined) + ' zeni.' });
            }
            timeRow = setTimeRow(canPay);

            i.update({ embeds: [currEmbed], components: [timeRow,row] });
          }
          else if(i.customId === 'set24') { 
            hours = 24;
            currEmbed = setTimeEmbed(hours, player, str, time, charIndex);

            let cost;
            let canPay = false;
            if(time === 'xp') {
              cost = calcXPTrainingCost(player, hours);
              canPay = (charList[player.charIDs[charIndex]].techniquePoints >= cost);
              currEmbed.setFooter({ text: 'Set training duration. You have ' + charList[player.charIDs[charIndex]].techniquePoints.toLocaleString(undefined) + ' technique points.'});
            }
            else {
              cost = calcTPTrainingCost(player, hours);
              canPay = (player.zeni >= cost);
              currEmbed.setFooter({ text: 'Set training duration. You have ' + player.zeni.toLocaleString(undefined) + ' zeni.' });
            }
            timeRow = setTimeRow(canPay);

            i.update({ embeds: [currEmbed], components: [timeRow,row] });
          }
          else if(i.customId === 'confirm') { 
            charList[player.charIDs[charIndex]].training = hours;
            charList[player.charIDs[charIndex]].trainingType = time;
            if(time == 'xp') {
              let cost = calcXPTrainingCost(player, hours);
              charList[player.charIDs[charIndex]].techniquePoints -= cost;
            }
            else if(time == 'txp') {
              let cost = calcTPTrainingCost(player, hours);
              player.zeni -= cost;
              loader.userSaver(users);
            }
            else {
              let cost = calcTPTrainingCost(player, hours);
              player.zeni -= cost;
              loader.userSaver(users);
            }

            startTraining(charList[player.charIDs[charIndex]], player);
            loader.characterSaver(charList);

            i.update({ embeds: [currEmbed], components: [] });
            collector.stop();
          }
        })

        collector.on('end', collected => {
        })
      });
  }

  function setTimeEmbed(hours, player, str, time, charIndex) {
    let cost;
    let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Training' + str);

    if(time === 'xp') {
      cost = calcXPTrainingCost(player, hours);
      currEmbed.setFooter({ text: 'Set training duration. You have ' + charList[player.charIDs[charIndex]].techniquePoints.toLocaleString(undefined) + ' technique points.'});
    }
    else {
      cost = calcTPTrainingCost(player, hours);
      currEmbed.setFooter({ text: 'Set training duration. You have ' + player.zeni.toLocaleString(undefined) + ' zeni.' });
    }

    //check if they have enough zeni for 1 hour
    currEmbed.setThumbnail(charList[player.charIDs[charIndex]].image);
    let coststr;
    if(time === 'xp') {
      if(hours > 1) coststr = hours + " hours of combat training will cost " + cost.toLocaleString(undefined) + " technique points. Character will be unavailable for most actions while training."
      else coststr = hours + " hour of Technique training will cost " + cost.toLocaleString(undefined) + " technique points. Character will be unavailable for most actions while training."
      let xp = calcXPTrainingGain(charList[player.charIDs[charIndex]], player);
      coststr += '\nThis will yield approximately ' + xp.toLocaleString(undefined) + ' exp per hour.';
    }
    else if(time === 'txp') {
      if(hours > 1) coststr = hours + " hours of technique training will cost " + cost.toLocaleString(undefined) + " zeni. Character will be unavailable for most actions while training."
      else coststr = hours + " hour of Technique training will cost " + cost.toLocaleString(undefined) + " zeni. Character will be unavailable for most actions while training."
      let xp = calcTXPTrainingGain(charList[player.charIDs[charIndex]], player);
      coststr += '\nThis will yield approximately ' + xp.toLocaleString(undefined) + ' exp per hour.';
    }
    else {
      if(hours > 1) coststr = hours + " hours of hybrid training will cost " + cost.toLocaleString(undefined) + " zeni. Character will be unavailable for most actions while training."
      else coststr = hours + " hour of Technique training will cost " + cost.toLocaleString(undefined) + " zeni. Character will be unavailable for most actions while training."
      let xp = calcTPTrainingGain(charList[player.charIDs[charIndex]], player);
      coststr += '\nThis will yield approximately ' + xp.toLocaleString(undefined) + ' technique points per hour.';
    }
    coststr += '\nEXP gained is drastically reduced for characters over level ' + trainingSoftCap + '.' 
    currEmbed.setDescription(coststr);
    return currEmbed;
  }

  function setTimeRow(canPay) {
    let timeRow = new MessageActionRow();
    timeRow.addComponents(
      new MessageButton()
        .setCustomId('minus1')
        .setLabel('-1 Hour')
        .setStyle('PRIMARY'),
      new MessageButton()
        .setCustomId('plus1')
        .setLabel('+1 Hour')
        .setStyle('PRIMARY'),
      new MessageButton()
        .setCustomId('set1')
        .setLabel('Set to 1 Hour')
        .setStyle('PRIMARY'),
      new MessageButton()
        .setCustomId('set24')
        .setLabel('Set to 1 Day')
        .setStyle('PRIMARY'),
    );

    if(canPay == true) {
      timeRow.addComponents(
      new MessageButton()
        .setCustomId('confirm')
        .setLabel('Confirm Training')
        .setStyle('SUCCESS'),
      );
    }
    else {
      timeRow.addComponents(
      new MessageButton()
        .setCustomId('confirm')
        .setLabel('Cannot Afford This')
        .setStyle('SUCCESS')
        .setDisabled(true),
      );
    }

    return timeRow;
  }


  function displayHelp(playerID) {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Help');
      currEmbed.setThumbnail("https://cdn.discordapp.com/attachments/986234335051018340/988244698265161728/unknown.png");
      currEmbed.setFooter({ text: 'Press button to view sub categories for the topic.' });

      let index = getCharListIndex(playerID);//here
      if(index !== null && users[index].tutorial === 1 && users[index].tutorialNearEnd === 1) {
        let str = Help.tutorial(5);
        users[index].zeni += parseInt(Help.tutorialReward);
        users[index].tutorial = 0;
        loader.userSaver(users);
        currEmbed.setDescription(str + " I believe you're at " + users[index].zeni.toLocaleString(undefined) + " zeni, now.\nPlease choose a topic if you wish to learn. Otherwise, exit with the ❌ button.");
      }
      else currEmbed.setDescription("Please choose a topic.");

      const row = new MessageActionRow();
      row.addComponents(
        new MessageButton()
          .setCustomId('cancel')
          .setLabel('❌')
          .setStyle('DANGER'),

        new MessageButton()
          .setCustomId('commands')
          .setLabel('Bot Commands Help')
          .setStyle('PRIMARY'),

        new MessageButton()
          .setCustomId('rpg')
          .setLabel('RPG Help')
          .setStyle('PRIMARY')
      );

      let pages = new Array();
      let holder = new Array();
      let page = 0;
      let maxPage = 0;
      let choice = "none";
      let firstChoice = "none";

      msg.channel.send({ embeds: [currEmbed], components: [row]}).then(message => {
        const filter = (i) => {
                 return (i.user.id === playerID && message.id === i.message.id);
              };

        const collector = msg.channel.createMessageComponentCollector({ filter, time: 1000*60*60*12 });

        let item;
        collector.on('collect', async i => {
          if(i.customId === 'cancel') { 
            if(choice === "none" && firstChoice === "none") {
              currEmbed.setDescription("Let me know if you need anything else.");
              i.update({ embeds: [currEmbed], components: [] });
              collector.stop();
            }
            else if(choice === "rpg" || choice === "commands") {
              choice = "none";
              firstChoice = "none";
              page = 0;
              maxPage = 0;
              pages = new Array();
              i.update({ embeds: [currEmbed], components: [row]});
            }
            else if(firstChoice === "commands") {
              pages = helpPages(Help.commands);
              page = 0;
              maxPage = Math.floor((Help.commands.length)/3) - 1;
              choice = "commands";
              firstChoice = "commands";
              i.update({ embeds: [pages[page][0]], components: [pages[page][1]] });
            }
            else {
              pages = helpPages(Help.rpg);
              page = 0;
              maxPage = Math.floor((Help.rpg.length)/3) - 1;
              choice = "rpg";
              firstChoice = "rpg";
              i.update({ embeds: [pages[page][0]], components: [pages[page][1]] });
            }
          }
          else if(i.customId === 'commands') {
            pages = helpPages(Help.commands);
            page = 0;
            maxPage = Math.floor((Help.commands.length)/3) - 1;
            choice = "commands";
            firstChoice = "commands";
            i.update({ embeds: [pages[page][0]], components: [pages[page][1]] });
          }
          else if(i.customId === 'rpg') {
            pages = helpPages(Help.rpg);
            page = 0;
            maxPage = Math.floor((Help.rpg.length)/3) - 1;
            choice = "rpg";
            firstChoice = "rpg";
            i.update({ embeds: [pages[page][0]], components: [pages[page][1]] });
          }
          else if(i.customId === 'right') {
            if(page < maxPage) {
              page++;
              i.update({ embeds: [pages[page][0]], components: [pages[page][1]]});
            }
            else {
              page = 0;
              i.update({ embeds: [pages[page][0]], components: [pages[page][1]]});
            }
          }
          else if(i.customId === 'one') {
            let topic;
            let temp;
            if(choice === "commands") {
              topic = Help.commands[page*3];
              temp = Help.helpRequest(topic,choice);
              pages[page][0].setDescription(temp[1]);
              pages[page][0].fields = [];
              pages[page][0].addFields({ name: "Command Syntax", value: temp[0], inline:false });
            }
            else if(choice === "rpg") {
              topic = Help.rpg[page*3];
              temp = Help.helpRequest(topic,choice);
              if(temp[1] !== null) {
                holder = temp[1];
                pages = helpPages(temp[1]);
                page = 0;
                maxPage = Math.floor((temp[1].length)/3) - 1;
                choice = temp[0];
              }
              else {
                pages[page][0].setDescription(temp[0]);
              }
            }
            else {
              topic = holder[page*3];
              temp = Help.helpRequest(topic,choice);
              pages[page][0].setDescription(temp[0]);
            }

            i.update({ embeds: [pages[page][0]], components: [pages[page][1]] });
          }
          else if(i.customId === 'two') {
            let topic;
            let temp;
            if(choice === "commands") {
              topic = Help.commands[1+(page*3)];
              temp = Help.helpRequest(topic,choice);
              pages[page][0].setDescription(temp[1]);
              pages[page][0].fields = [];
              pages[page][0].addFields({ name: "Command Syntax", value: temp[0], inline:false });
            }
            else if(choice === "rpg") {
              topic = Help.rpg[1+(page*3)];
              temp = Help.helpRequest(topic,choice);
              if(temp[1] !== null) {
                holder = temp[1];
                pages = helpPages(temp[1]);
                page = 0;
                maxPage = Math.floor((temp[1].length)/3) - 1;
                choice = temp[0];
              }
              else {
                pages[page][0].setDescription(temp[0]);
              }
            }
            else {
              topic = holder[1+(page*3)];
              temp = Help.helpRequest(topic,choice);
              pages[page][0].setDescription(temp[0]);
            }

            i.update({ embeds: [pages[page][0]], components: [pages[page][1]] });
          }
          else if(i.customId === 'three') {
            let topic;
            let temp;
            if(choice === "commands") {
              topic = Help.commands[2+(page*3)];
              temp = Help.helpRequest(topic,choice);
              pages[page][0].setDescription(temp[1]);
              pages[page][0].fields = [];
              pages[page][0].addFields({ name: "Command Syntax", value: temp[0], inline:false });
            }
            else if(choice === "rpg") {
              topic = Help.rpg[2+(page*3)];
              temp = Help.helpRequest(topic,choice);
              if(temp[1] !== null) {
                holder = temp[1];
                pages = helpPages(temp[1]);
                page = 0;
                maxPage = Math.floor((temp[1].length)/3) - 1;
                choice = temp[0];
              }
              else {
                pages[page][0].setDescription(temp[0]);
              }
            }
            else {
              topic = holder[2+(page*3)];
              temp = Help.helpRequest(topic,choice);
              pages[page][0].setDescription(temp[0]);
            }

            i.update({ embeds: [pages[page][0]], components: [pages[page][1]] });
          }
        })

        collector.on('end', collected => {
        })
      });

  }

  function displayShop(player) {
    let pages = new Array();
    let page = 0;

    let merch = ['Standard Item Box','Standard Weapon Box','Standard Dogi Box', 
                  'Epic Item Box','Epic Weapon Box','Epic Dogi Box', 
                '10% Speed Buff (1 Battle)','20% Speed Buff (1 Battle)','30% Speed Buff (1 Battle)',
                '10% Damage Buff (1 Battle)','20% Damage Buff (1 Battle)','30% Damage Buff (1 Battle)'];

    let merchPrice = [10000,20000,20000, 
                      125000,200000,200000, 
                      50000,120000,200000,
                      70000,160000,260000];

    let merchInfo = [
                      ["item",Math.random() < 0.5 ? "dogi" : "weapon","standard"],["item","weapon","standard"],["item","dogi","standard"],
                      ["item",Math.random() < 0.5 ? "dogi" : "weapon","epic"],["item","weapon","epic"],["item","dogi","epic"],
                      ["buff","speed","10"],["buff","speed","20"],["buff","speed","30"],
                      ["buff","damage","10"],["buff","damage","20"],["buff","damage","30"],
                    ]
    //[ [item, buff], [weapon/dogi, stat], [quality, %] ]
    //let rng = Math.random() < 0.5 ? "dogi" : "weapon";
    let maxPage = Math.floor((merchInfo.length)/3) - 1;

    for(let i = 0; i < merch.length; i+=3) {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Shop');
      currEmbed.setThumbnail("https://cdn.discordapp.com/attachments/832585611486691408/985070860631158804/unknown.png")
      currEmbed.addFields(
        { name: merch[i], value: merchPrice[i].toLocaleString(undefined) + ' zeni', inline:false },
        { name: merch[i+1], value: merchPrice[i+1].toLocaleString(undefined) + ' zeni', inline:false },
        { name: merch[i+2], value: merchPrice[i+2].toLocaleString(undefined) + ' zeni', inline:false },
      );
      currEmbed.setFooter({ text: 'Press button to buy item. You have ' + player.zeni.toLocaleString(undefined) + ' zeni.' });

      const row = new MessageActionRow();
      row.addComponents(
        new MessageButton()
          .setCustomId('cancel')
          .setLabel('❌')
          .setStyle('DANGER')
      );
      if(i >= merch.length) {
        row.addComponents(
          new MessageButton()
            .setCustomId('one')
            .setLabel('\u200b')
            .setStyle('PRIMARY')
            .setDisabled(true),
        );
      }
      else {
        row.addComponents(
          new MessageButton()
            .setCustomId('one')
            .setLabel(merch[i])
            .setStyle('PRIMARY'),
        );
      }

      if((i+1) >= merch.length) {
        row.addComponents(
          new MessageButton()
            .setCustomId('two')
            .setLabel('\u200b')
            .setStyle('PRIMARY')
            .setDisabled(true),
        );
      }
      else {
        row.addComponents(
          new MessageButton()
            .setCustomId('two')
            .setLabel(merch[i+1])
            .setStyle('PRIMARY'),
        );
      }
      if((i+2) >= merch.length) {
        row.addComponents(
          new MessageButton()
            .setCustomId('three')
            .setLabel('\u200b')
            .setStyle('PRIMARY')
            .setDisabled(true),
        );
      }
      else {
        row.addComponents(
          new MessageButton()
            .setCustomId('three')
            .setLabel(merch[i+2])
            .setStyle('PRIMARY'),
        );
      }
      row.addComponents(
        new MessageButton()
          .setCustomId('right')
          .setLabel('➡')
          .setStyle('PRIMARY'),
      );

      pages.push([currEmbed,row])
    }

    player.shopping = 1;
    msg.channel.send({ embeds: [pages[0][0]], components: [pages[0][1]]}).then(message => {
      const filter = (i) => {
               return (i.user.id === player.userID && message.id === i.message.id);
            };

      const collector = msg.channel.createMessageComponentCollector({ filter, time: 1000*60*60*12 });

      let item;
      collector.on('collect', async i => {
        if(i.customId === 'cancel') {
          i.update({ embeds: [pages[page][0]], components: [] });
          collector.stop();
          player.shopping = 0;
        }
        else if(i.customId === 'right') {
          if(page < maxPage) {
            page++;
            i.update({ embeds: [pages[page][0]], components: [pages[page][1]]});
          }
          else {
            page = 0;
            i.update({ embeds: [pages[page][0]], components: [pages[page][1]]});
          }
        }
        else if(i.customId === 'one' && player.zeni > merchPrice[page*3]) {
          shopFunctions(merchInfo[page*3],player,merchPrice[page*3]);
          i.update({ embeds: [pages[page][0]], components: [] });
          collector.stop();
          player.shopping = 0;
        }
        else if(i.customId === 'two' && player.zeni > merchPrice[1+(page*3)]) {
          shopFunctions(merchInfo[1+(page*3)],player,merchPrice[1+(page*3)]);
          i.update({ embeds: [pages[page][0]], components: [] });
          collector.stop();
          player.shopping = 0;
        }
        else if(i.customId === 'three' && player.zeni > merchPrice[2+(page*3)]) {
          shopFunctions(merchInfo[2+(page*3)],player,merchPrice[2+(page*3)]);
          i.update({ embeds: [pages[page][0]], components: [] });
          collector.stop();
          player.shopping = 0;
        }
        else {
          message.channel.send("Purchase failed, insufficient zeni. Try again later.")
          i.update({ embeds: [pages[page][0]], components: [] });
          collector.stop();
          player.shopping = 0;
        }
      })

      collector.on('end', collected => {
          player.shopping = 0;
          if(player.itemInventory.items.length > 0 && player.tutorial === 1) {
            let str = Help.tutorial(3);
            let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Tutorial');
            currEmbed.setThumbnail("https://cdn.discordapp.com/attachments/986234335051018340/988244698265161728/unknown.png");
            currEmbed.setDescription(str);
            msg.channel.send({ embeds: [currEmbed] });
          }
      })
    });
  }

  function shopFunctions(merchInfo, player, cost) {
    if(merchInfo[0] === "item") {
      invIndex = invList.map(function(e) { return e.userID; }).indexOf(player.userID);
      let item = makeItem(merchInfo[1],merchInfo[2]);
      if(item !== -1 && player.itemInventory.items.length !== player.itemInventory.maxSize) {
        msg.channel.send("<@" + player.userID + "> Successfully purchased item box.")
        printItem(item);
        itemList.push(item);
        invList[invIndex].addItem(item);
        player.zeni = player.zeni - cost;

        loader.userSaver(users);
        loader.itemSaver(itemList);
        loader.inventorySaver(invList);
      }
      else {
        msg.channel.send("Item box could not be purchased.")
      }
    }
    else if(merchInfo[0] === "buff") {
      if(merchInfo[1] === "speed") {
        let buff = new AttributeBonus("Speed Buff", "Buff");
        msg.channel.send("<@" + player.userID + "> Successfully purchased " + merchInfo[2] + "% speed buff. Lasts 1 battle.")
        buff.loadBonuses(0,0,0,0,0,0,0,0,0,0,0,
                              0,0,0,parseInt(merchInfo[2])/100,0,0,0,0,0,0,
                              0,0,0,0);
        charList[player.charIDs[player.currentChar]].addBuff(buff);

        player.zeni = player.zeni - cost;
        loader.userSaver(users);
      }
      else if(merchInfo[1] === "damage") {
        msg.channel.send("<@" + player.userID + "> Successfully purchased " + merchInfo[2] + "% damage buff. Lasts 1 battle.")
        let damBuff = new AttributeBonus("Damage Buff", "Buff");
        damBuff.loadBonuses(0,0,0,0,0,0,0,0,0,0,0,
                              0,0,0,0,0,0,0,0,0,0,
                              0,0,parseInt(merchInfo[2])/100,parseInt(merchInfo[2])/100);
        charList[player.charIDs[player.currentChar]].addBuff(damBuff);

        player.zeni = player.zeni - cost;
        loader.userSaver(users);
      }
      else {
        msg.channel.send("Buff could not be purchased.")
      }
    }
    else return -1;
  }

   function displayAffixing(player, item) {
    printItem(item);

    let vars = new Array();
    vars.push("Str");
    vars.push("Dex");
    vars.push("Con");
    vars.push("Eng");
    vars.push("Sol");
    vars.push("Foc");

    vars.push("ChargeBonus");
    vars.push("HealthRegen");
    vars.push("EnergyRegen");
    vars.push("Hit");
    vars.push("Dodge");
    vars.push("Speed");

    vars.push("CritRate");
    vars.push("CritDamage");
    vars.push("BlockRate");
    vars.push("BlockPower");
    vars.push("pDefense");
    vars.push("eDefense");

    vars.push("MagicPower");
    vars.push("MagicDefense");
    vars.push("PhysicalAttack");
    vars.push("EnergyAttack");

    let temp = [];
    let six;
    let page = 1;
    let maxPage;
    let pages = new Array();

    for(let varsIndex = 0; varsIndex < vars.length; varsIndex += parseInt(temp[0])) {
      temp = pick(varsIndex, vars, item);
      six = temp[1];
      let page1Embed = new Discord.MessageEmbed(statusEmbed).setTitle('Item Affix Workshop');
      page1Embed.setThumbnail("https://cdn.discordapp.com/attachments/832585611486691408/985655802947854396/unknown.png")

      const row = new MessageActionRow()
      row.addComponents(
        new MessageButton()
          .setCustomId('cancel')
          .setLabel('❌')
          .setStyle('DANGER')
        );

      if(six[0][0] == '\u200b') {
        break;
      }
      else {
        page1Embed.addFields(
          { name: six[0][0], value: six[0][1].toLocaleString(undefined) + ' zeni', inline:true },
        );
        row.addComponents(
          new MessageButton()
            .setCustomId('one')
            .setLabel(six[0][0])
            .setStyle('PRIMARY'),
        );
      }

      if(six[1][0] == '\u200b') {
        page1Embed.addFields(
          { name: six[1][0], value: six[1][1].toLocaleString(undefined), inline:true },
        );
        row.addComponents(
          new MessageButton()
            .setCustomId('two')
            .setLabel(six[1][0])
            .setStyle('PRIMARY')
            .setDisabled(true),
        );
      }
      else {
        page1Embed.addFields(
          { name: six[1][0], value: six[1][1].toLocaleString(undefined) + ' zeni', inline:true },
        );
        row.addComponents(
          new MessageButton()
            .setCustomId('two')
            .setLabel(six[1][0])
            .setStyle('PRIMARY'),
        );
      }
      if(six[2][0] == '\u200b') {
        page1Embed.addFields(
          { name: six[2][0], value: six[2][1].toLocaleString(undefined), inline:true },
        );
        row.addComponents(
          new MessageButton()
            .setCustomId('three')
            .setLabel(six[2][0])
            .setStyle('PRIMARY')
            .setDisabled(true),
        );
      }
      else {
        page1Embed.addFields(
          { name: six[2][0], value: six[2][1].toLocaleString(undefined) + ' zeni', inline:true },
        );
        row.addComponents(
          new MessageButton()
            .setCustomId('three')
            .setLabel(six[2][0])
            .setStyle('PRIMARY'),
        );
      }
      row.addComponents(
        new MessageButton()
          .setCustomId('right')
          .setLabel('➡')
          .setStyle('PRIMARY'),
        );

      page1Embed.setFooter({ text: 'Button to socket stat. You have ' + player.zeni.toLocaleString(undefined) + ' zeni.\nPage ' + page });
      pages.push([page1Embed, row]);
      page++;
    }
    maxPage = pages.length-1;
    page = 0;

    player.affixing = 1;
    msg.channel.send({ embeds: [pages[0][0]], components: [pages[0][1]]}).then(message => {
      const filter = (i) => {
               return (i.user.id === player.userID && message.id === i.message.id);
            };

      const collector = msg.channel.createMessageComponentCollector({ filter, time: 1000*60*60*1 });

      collector.on('collect', async i => {
        if(i.customId === 'cancel') {
            i.update({ embeds: [pages[page][0]], components: [] });
            collector.stop();
            player.affixing = 0;
        }
        else if(i.customId === 'right') {
          if(page < maxPage) {
            page++;
            i.update({ embeds: [pages[page][0]], components: [pages[page][1]]});
          }
          else {
            page = 0;
            i.update({ embeds: [pages[page][0]], components: [pages[page][1]]});
          }
        }
        else if(i.customId === 'one') {
          let indexOffset = page*3;
          index = indexOffset;
          cost = item.getAffixCost(vars[index].toLowerCase())
          if(cost != -1 && player.zeni > cost) {
            let ind = itemList.map(function(e) { return e.uid; }).indexOf(item.uid);
            if(itemList[ind].addAffix(vars[index].toLowerCase())) {
              item = itemList[ind];
              printItem(item);
              player.zeni = parseInt(player.zeni) - parseInt(cost);

              i.update({ embeds: [pages[page][0]], components: [] });
              collector.stop();
              player.affixing = 0;
              loader.itemSaver(itemList);
              loader.inventorySaver(invList);
              loader.userSaver(users);
            }
          }
        }
        else if(i.customId === 'two') {
          let indexOffset = page*3;
          index = indexOffset+1;
          cost = item.getAffixCost(vars[index].toLowerCase())
          if(cost != -1 && player.zeni > cost) {
            let ind = itemList.map(function(e) { return e.uid; }).indexOf(item.uid);
            if(itemList[ind].addAffix(vars[index].toLowerCase()) === 1) {
              item = itemList[ind];
              printItem(item);
              player.zeni = parseInt(player.zeni) - parseInt(cost);

              i.update({ embeds: [pages[page][0]], components: [] });
              collector.stop();
              player.affixing = 0;
              loader.itemSaver(itemList);
              loader.inventorySaver(invList);
              loader.userSaver(users)
            }
          }
        }
        else if(i.customId === 'three') {
          let indexOffset = page*3;
          index = indexOffset+2;
          cost = item.getAffixCost(vars[index].toLowerCase())
          if(cost != -1 && player.zeni > cost) {
            let ind = itemList.map(function(e) { return e.uid; }).indexOf(item.uid);
            if(itemList[ind].addAffix(vars[index].toLowerCase())) {
              item = itemList[ind];
              printItem(item);
              player.zeni = parseInt(player.zeni) - parseInt(cost);

              i.update({ embeds: [pages[page][0]], components: [] });
              collector.stop();
              player.affixing = 0;
              loader.itemSaver(itemList);
              loader.inventorySaver(invList);
              loader.userSaver(users)
            }
          }
        }
      })
      collector.on('end', collected => {
          player.affixing = 0;
      })
    });
  }

  function pick(startI, affixes, item) {
    let six = new Array();
    let count = 0;
    for(let i = startI; i < affixes.length; i++) {
      if(six.length === 3) return [count, six];
      let cost = Math.floor(item.getAffixCost(affixes[i].toLowerCase()));
      if(cost != -1) {
        six.push([affixes[i],cost]);
        count++;
      }
      else {
        affixes.splice(i,1);
        i--;
      }
    }
    for(let i = six.length-1; i < 2; i++) {
      six.push(['\u200b','\u200b']);
    }
    return [count,six];
  }

  function stylePick(startI, affixes, style) {
    let three = new Array();
    let count = 0;
    for(let i = startI; i < affixes.length; i++) {
      if(three.length === 4) return [count, three];
      let check = Math.floor(style.calcAffixCost(affixes[i].toLowerCase(),0));
      if(check != -1) {
        three.push(affixes[i]);
        count++;
      }
      else {
        affixes.splice(i,1);
        i--;
      }
    }
    for(let i = three.length-1; i < 3; i++) {
      three.push('\u200b');
    }
    return [count,three];
  }

  function battleTurn(battleID) {
    if(activeCombatList[battleID].allActed() === 1) {
      activeCombatList[battleID].executeActions();      
      battleMessage("Turn " + activeCombatList[battleID].turn + " end.")
      let playersDead = activeCombatList[battleID].teamDead(activeCombatList[battleID].pCombatants);
      let npcsDead = activeCombatList[battleID].teamDead(activeCombatList[battleID].NPCombatants);
      let playerteamoutput = "";
      for(let i = 0; i < activeCombatList[battleID].NPCactions.length; i++) {
        let pcOrNPC = -1;
        let z = activeCombatList[battleID].NPCombatants[activeCombatList[battleID].NPCactions[i][2]];
        if(activeCombatList[battleID].NPCombatants[activeCombatList[battleID].NPCactions[i][2]].playerID !== 'NPC' && activeCombatList[battleID].NPCombatants[activeCombatList[battleID].NPCactions[i][2]].playerID !== 'Random') {
          pcOrNPC = 1;
          z = charList.map(function(e) 
            { return e.playerID+e.name; }
            ).indexOf(activeCombatList[battleID].NPCombatants[activeCombatList[battleID].NPCactions[i][2]].playerID+activeCombatList[battleID].NPCombatants[activeCombatList[battleID].NPCactions[i][2]].name);
        }
        if(playersDead === 1 || npcsDead === 1) {
          battlePrint(pcOrNPC,z,activeCombatList[battleID].NPCactions[i][2],1);
        }
        else battlePrint(pcOrNPC,z,activeCombatList[battleID].NPCactions[i][2]);
        if(activeCombatList[battleID].NPCombatants[activeCombatList[battleID].NPCactions[i][2]].battleCurrAtt.health > 0) playerteamoutput += activeCombatList[battleID].NPCactions[i][1] + '\n\n';
      }
      if(playerteamoutput !== "") battleMessage(playerteamoutput);
      activeCombatList[battleID].NPCactions = new Array();
      let npcteamoutput = "";
      for(let i = 0; i < activeCombatList[battleID].actions.length; i++) {
        //let z = charList.indexOf(activeCombatList[battleID].pCombatants[activeCombatList[battleID].actions[i][2]]);
        let pcOrNPC = -1;
        let z = activeCombatList[battleID].pCombatants[activeCombatList[battleID].actions[i][2]];
        if(activeCombatList[battleID].pCombatants[activeCombatList[battleID].actions[i][2]].playerID !== 'NPC' && activeCombatList[battleID].pCombatants[activeCombatList[battleID].actions[i][2]].playerID !== 'Random') {
          pcOrNPC = 1;
          z = charList.map(function(e) 
            { return e.playerID+e.name; }
            ).indexOf(activeCombatList[battleID].pCombatants[activeCombatList[battleID].actions[i][2]].playerID+activeCombatList[battleID].pCombatants[activeCombatList[battleID].actions[i][2]].name);
        }
        if(playersDead === 1 || npcsDead === 1) battlePrint(pcOrNPC,z,activeCombatList[battleID].actions[i][2], 1);
        else battlePrint(pcOrNPC,z,activeCombatList[battleID].actions[i][2]);
        npcteamoutput += activeCombatList[battleID].actions[i][1] + '\n\n';
      }
      if(npcteamoutput !== "") battleMessage(npcteamoutput);
      activeCombatList[battleID].actions = new Array();

      if(playersDead === 1) {
        battleMessage("All challengers have been defeated.");
        let exp = 0;
        let pplv = 0;
        let zeni = 0;
        for(let i = 0; i < activeCombatList[battleID].pCombatants.length; i++) {
          let chance = Math.round(Math.random() * 99 + 1);
          if(activeCombatList[battleID].deathChance != 0 && chance < activeCombatList[battleID].deathChance) {
            let user = getCharList(activeCombatList[battleID].pCombatants[i].playerID);
            let zeni = (activeCombatList[battleID].pCombatants[i].level+activeCombatList[battleID].pCombatants[i].attributes.stotal)*15;
            user.zeni = user.zeni - zeni;
            let z = charList.map(function(e) { return e.playerID+e.name; }).indexOf(activeCombatList[battleID].pCombatants[i].playerID+activeCombatList[battleID].pCombatants[i].name);
            charList[z].rebirth();
            battleMessage(activeCombatList[battleID].pCombatants[i].name + " has died. They will be ressurected, but must pay " + zeni.toLocaleString(undefined)  + " zeni. No Technique Points will be retained.");
            if(user.zeni < 0) user.zeni = 0;
            activeCombatList[battleID].pCombatants[i].earnedEXP = 0;
          }
          else {
            zeni += 1000 + Math.round(Math.min((activeCombatList[battleID].pCombatants[i].battleMaxAtt.stotal+1),750)*activeCombatList[battleID].pCombatants[i].level/10);
            exp += (1+activeCombatList[battleID].pCombatants[i].battleMaxAtt.stotal)*statEXP;
            exp += (1+activeCombatList[battleID].pCombatants[i].level)*levelEXP;
            pplv += activeCombatList[battleID].pCombatants[i].level;

            let str = "";
            let texp;
            if(activeCombatList[battleID].pCombatants[i].party === null)  {
              texp = Math.max(1,Math.round((activeCombatList[battleID].expMod*exp*0.04+1)));
              //str += texp.toLocaleString(undefined)
              str += activeCombatList[battleID].pCombatants[i].name.replace(/\_/g,' ') + " gains " + texp.toLocaleString(undefined) + " EXP!";
              str += activeCombatList[battleID].pCombatants[i].addEXP(texp);
              activeCombatList[battleID].pCombatants[i].earnedEXP = texp;
            }
            else {
              texp = Math.max(1,Math.round((activeCombatList[battleID].expMod*exp*0.04+1)*activeCombatList[battleID].pCombatants[i].party.expMod));
              str += activeCombatList[battleID].pCombatants[i].name.replace(/\_/g,' ') + " gains " + texp.toLocaleString(undefined) + " EXP!";
              str += activeCombatList[battleID].pCombatants[i].addEXP(texp);
              activeCombatList[battleID].pCombatants[i].earnedEXP = texp;

              if(activeCombatList[battleID].pCombatants[i].party.partyList.length > 1) {
                activeCombatList[battleID].pCombatants[i].party.addEXP(charList,activeCombatList[battleID].pCombatants[i],texp);
                str += '\n' + activeCombatList[battleID].pCombatants[i].name.replace(/\_/g,' ') + "'s other party members gained " +  Math.round(texp*activeCombatList[battleID].pCombatants[i].party.expShare).toLocaleString(undefined) + " exp!\n"
              }
            }
            battleMessage(str);
          }

          if(activeCombatList[battleID].pCombatants[i].zenkaiTriggered === 1 && activeCombatList[battleID].deathChance > 0) {
            battleMessage(activeCombatList[battleID].pCombatants[i].name + " has gained a zenkai boost!");
          }
        }
        pplv = pplv/activeCombatList[battleID].pCombatants.length;
        for(let i = 0; i < activeCombatList[battleID].NPCombatants.length; i++) {
          let xp = 1+Math.round(activeCombatList[battleID].expMod * exp * (pplv / activeCombatList[battleID].NPCombatants[i].level) / 2);
          if(activeCombatList[battleID].NPCombatants.userID === 'NPC') xp = xp*npcEXPMulti;
          let str = "";

          if(activeCombatList[battleID].NPCombatants[i].playerID !== "NPC" && activeCombatList[battleID].NPCombatants[i].playerID !== "Random") {
            let user = getCharList(activeCombatList[battleID].NPCombatants[i].playerID);
            let chance = Math.round(Math.random() * 100);
            let availableTechs = new Array();

            for(let j = 0; j < activeCombatList[battleID].pCombatants[i].techniques.length; j++) {
              if(techList[activeCombatList[battleID].pCombatants[i].techniques[j]].tag !== "Common" && techList[activeCombatList[battleID].pCombatants[i].techniques[j]].tag !== "Uncommon") {  }
              else availableTechs.push(activeCombatList[battleID].pCombatants[i].techniques[j]);
            }
            if(activeCombatList[battleID].pCombatants[i].transformation != -1) {
              if(techList[activeCombatList[battleID].pCombatants[i].transformation].tag !== "Common") {  }
              else availableTechs.push(activeCombatList[battleID].pCombatants[i].transformation);
            }

            if(activeCombatList[battleID].zeniRisk > 0) zeni += activeCombatList[battleID].zeniRisk*2;
            if(activeCombatList[battleID].raid !== 0) zeni *= 1.25;
            else if(activeCombatList[battleID].itemBox !== "None") zeni *= activeCombatList[battleID].expMod;
            user.zeni = Math.round(user.zeni + zeni);

            while(chance >= 60) {
              let index = Math.floor(Math.random()*availableTechs.length);
              cTech = availableTechs[index];

              let yes = user.addTag(cTech);
              if(yes === -1) {
                 chance = -1;
                 str += activeCombatList[battleID].NPCombatants[i].name.replace(/\_/g,' ') + ' managed to learn ';
                 str += techList[cTech].name.replace(/\_/g,' ') + ' from their enemies!\n';
              }
              else availableTechs.splice(index,1);

              if(availableTechs.length === 0) chance = -1;
            } 

            //battleMessage(output);
            str += activeCombatList[battleID].NPCombatants[i].name.replace(/\_/g,' ') + " gains " + parseInt(zeni).toLocaleString(undefined) + ' <:zeni:833538647768694794>!\n'
          }

          /*battleMessage(activeCombatList[battleID].NPCombatants[i].name.replace(/\_/g,' ') + " gains " + xp.toLocaleString(undefined) + " EXP!");

          let str = activeCombatList[battleID].NPCombatants[i].addEXP(xp);*/

          //let str = "";
          if(activeCombatList[battleID].NPCombatants[i].party === null)  {
            //str += xp.toLocaleString(undefined)
          }
          else {
            xp = Math.max(1,Math.round(xp*activeCombatList[battleID].NPCombatants[i].party.expMod));
            if(activeCombatList[battleID].NPCombatants[i].party.partyList.length > 1) {
              activeCombatList[battleID].NPCombatants[i].party.addEXP(charList,activeCombatList[battleID].NPCombatants[i],xp);
              str += '\n' + activeCombatList[battleID].NPCombatants[i].name.replace(/\_/g,' ') + "'s other party members gained " +  Math.round(xp*activeCombatList[battleID].NPCombatants[i].party.expShare).toLocaleString(undefined) + " exp!\n"
            }
          }
          str += activeCombatList[battleID].NPCombatants[i].name.replace(/\_/g,' ') + " gains " + xp.toLocaleString(undefined) + " EXP!";
          str += activeCombatList[battleID].NPCombatants[i].addEXP(xp);
          activeCombatList[battleID].NPCombatants[i].earnedEXP = xp;
          battleMessage(str);

          if(activeCombatList[battleID].NPCombatants[i].zenkaiTriggered === 1 && activeCombatList[battleID].deathChance > 0) {
            battleMessage(activeCombatList[battleID].NPCombatants[i].name + " has gained a zenkai boost!");
          }
        }
        endBattle(battleID, 0);
      }
      else if(npcsDead === 1) {
        battleMessage("The challengers have defeated all defending combatants.");
        let exp = 1;
        let nplv = 0;
        let zeni = 0;
        let availableTechs = new Array();
        for(let i = 0; i < activeCombatList[battleID].NPCombatants.length; i++) {
          let str = "";
          zeni += Math.round(Math.min((activeCombatList[battleID].NPCombatants[i].battleMaxAtt.stotal+1),750)*activeCombatList[battleID].NPCombatants[i].level/10);
          exp += 1+activeCombatList[battleID].NPCombatants[i].battleMaxAtt.stotal*statEXP;
          exp += 1+activeCombatList[battleID].NPCombatants[i].level*levelEXP;
          nplv += activeCombatList[battleID].NPCombatants[i].level;

          for(let j = 0; j < activeCombatList[battleID].NPCombatants[i].techniques.length; j++) {
            if(techList[activeCombatList[battleID].NPCombatants[i].techniques[j]].tag !== "Common" && techList[activeCombatList[battleID].NPCombatants[i].techniques[j]].tag !== "Uncommon") {  }
            else availableTechs.push(activeCombatList[battleID].NPCombatants[i].techniques[j]);
          }
          if(activeCombatList[battleID].NPCombatants[i].transformation != -1) {
            if(techList[activeCombatList[battleID].NPCombatants[i].transformation].tag !== "Common") {  }
            else availableTechs.push(activeCombatList[battleID].NPCombatants[i].transformation);
          }
          
          /*let txp = Math.round(activeCombatList[battleID].expMod*exp*0.04+1);
          if(activeCombatList[battleID].NPCombatants.userID === 'NPC') txp = txp*npcEXPMulti;

          battleMessage(activeCombatList[battleID].NPCombatants[i].name.replace(/\_/g,' ') + " gains " + txp.toLocaleString(undefined) + " EXP!");
          let str = activeCombatList[battleID].NPCombatants[i].addEXP(Math.round((activeCombatList[battleID].expMod*exp*0.04+1)));
          if(str !== null) battleMessage(str);*/
          let texp = Math.round(activeCombatList[battleID].expMod*exp*0.04+1);
          if(activeCombatList[battleID].NPCombatants.userID === 'NPC') txp = txp*npcEXPMulti;

          if(activeCombatList[battleID].NPCombatants[i].party === null)  {
            //str += texp.toLocaleString(undefined)
          }
          else {
            texp = Math.max(1,texp*activeCombatList[battleID].NPCombatants[i].party.expMod);
            if(activeCombatList[battleID].NPCombatants[i].party !== null && activeCombatList[battleID].NPCombatants[i].party.partyList.length > 1) {
              activeCombatList[battleID].NPCombatants[i].party.addEXP(charList,activeCombatList[battleID].NPCombatants[i],texp);
              str += '\n' + activeCombatList[battleID].NPCombatants[i].name.replace(/\_/g,' ') + "'s other party members gained " +  Math.round(texp*activeCombatList[battleID].NPCombatants[i].party.expShare).toLocaleString(undefined) + " exp!\n"
            }
          }
          str += activeCombatList[battleID].NPCombatants[i].name.replace(/\_/g,' ') + " gains " + texp.toLocaleString(undefined) + " EXP!";
          str += activeCombatList[battleID].NPCombatants[i].addEXP(texp);
          activeCombatList[battleID].NPCombatants[i].earnedEXP = texp;
          battleMessage(str);
        }
        nplv = nplv/activeCombatList[battleID].NPCombatants.length;
        for(let i = 0; i < activeCombatList[battleID].pCombatants.length; i++) {
          if(activeCombatList[battleID].pCombatants[i] == null) {
            console.log("Null, i value: " + i);
            continue;
          }        
          let str = "";
          let xp = 1+Math.round(activeCombatList[battleID].expMod * exp * (nplv / activeCombatList[battleID].pCombatants[i].level) / 2);
          //let str = activeCombatList[battleID].pCombatants[i].addEXP(xp);
          let user = getCharList(activeCombatList[battleID].pCombatants[i].playerID);
          let chance = Math.round(Math.random() * 100);

          if(activeCombatList[battleID].zeniRisk > 0) zeni += activeCombatList[battleID].zeniRisk*2;
          if(activeCombatList[battleID].itemBox !== "None") zeni *= activeCombatList[battleID].expMod;
          if(user !== null) user.zeni = Math.round(user.zeni + zeni);

          while(chance >= 60 && user !== null) {
            let index = Math.floor(Math.random()*availableTechs.length);
            cTech = availableTechs[index];

            let yes = user.addTag(cTech);
            if(yes === -1) {
                 chance = -1;
                 str += activeCombatList[battleID].pCombatants[i].name.replace(/\_/g,' ') + ' managed to learn ';
                 str += techList[cTech].name.replace(/\_/g,' ') + ' from their enemies!\n';
            }
            else availableTechs.splice(index,1);

            if(availableTechs.length === 0) chance = -1;
          }
          /*output += activeCombatList[battleID].pCombatants[i].name.replace(/\_/g,' ') + " gains " + xp.toLocaleString(undefined) + " EXP!\n " + activeCombatList[battleID].pCombatants[i].name.replace(/\_/g,' ') + " gains " + parseInt(zeni).toLocaleString(undefined) + ' <:zeni:833538647768694794>!'

          battleMessage(output);
          if(str !== null) battleMessage(str);*/
          str += activeCombatList[battleID].pCombatants[i].name.replace(/\_/g,' ') + " gains " + parseInt(zeni).toLocaleString(undefined) + ' <:zeni:833538647768694794>!\n'
          if(activeCombatList[battleID].pCombatants[i].party === null)  {
            //str += xp.toLocaleString(undefined)
          }
          else {
            xp = Math.round(xp*activeCombatList[battleID].pCombatants[i].party.expMod);
            if(activeCombatList[battleID].pCombatants[i].party.partyList.length > 1) {
              activeCombatList[battleID].pCombatants[i].party.addEXP(charList,activeCombatList[battleID].pCombatants[i],xp);
              str += '\n' + activeCombatList[battleID].pCombatants[i].name.replace(/\_/g,' ') + "'s other party members gained " +  Math.round(xp*activeCombatList[battleID].pCombatants[i].party.expShare).toLocaleString(undefined) + " exp!\n"
            }
          }
          str += activeCombatList[battleID].pCombatants[i].name.replace(/\_/g,' ') + " gains " + xp.toLocaleString(undefined) + " EXP!";
          str += activeCombatList[battleID].pCombatants[i].addEXP(xp);
          activeCombatList[battleID].pCombatants[i].earnedEXP = xp;
          battleMessage(str);

          if(activeCombatList[battleID].pCombatants[i].zenkaiTriggered === 1 && activeCombatList[battleID].deathChance > 0) {
            battleMessage(activeCombatList[battleID].pCombatants[i].name + " has gained a zenkai boost!");
          }

          if(user !== null && activeCombatList[battleID].itemBox !== "None") {
            let rng = Math.random() < 0.5 ? "weapon" : "dogi";
            let item = makeItem(rng, activeCombatList[battleID].itemBox.toLowerCase());

            if(user.itemInventory.addItem(item) === 1) {
              battleMessage(activeCombatList[battleID].pCombatants[i].name + " has earned an item! You have " + (user.itemInventory.maxSize - user.itemInventory.items.length) + " item slots left.");
              printItem(item);
              itemList.push(item);

              loader.itemSaver(itemList);
              loader.inventorySaver(invList);
            }
            else {
              battleMessage(activeCombatList[battleID].pCombatants[i].name + " has earned an item, but had no room for it!");
              printItem(item);
            }
          }
        }
        endBattle(battleID, 1);
      }
    }
    else {
      msg.channel.send("Action set.");
    }
  }
//endz
  function endBattle(battleID, playerWin) {
    let danger = activeCombatList[battleID].deathChance;
    for(let i = 0; i < activeCombatList[battleID].pCombatants.length; i++) {
      activeCombatList[battleID].pCombatants[i].isTransformed = -1
      activeCombatList[battleID].pCombatants[i].scaled = -1;
      activeCombatList[battleID].pCombatants[i].statusUpdate(0); 

      for(let j = 0; j < activeCombatList[battleID].pCombatants[i].techCooldowns.length; j++) {
        activeCombatList[battleID].pCombatants[i].techCooldowns[j] = 0;
      }
      if(activeCombatList[battleID].pCombatants[i].playerID === "NPC") {
        let z = npcList.map(function(e) { return e.name; }).indexOf(activeCombatList[battleID].pCombatants[i].name);
        if(z !== -1) npcList[z].addEXP(activeCombatList[battleID].pCombatants[i].earnedEXP);
        else console.log("pCombatants: NPC save failed.")
        npcList[z].earnedEXP = 0;
      }
      else if(activeCombatList[battleID].pCombatants[i].playerID !== "Random") {
        let z = charList.map(function(e) { return e.playerID+e.name; }).indexOf(activeCombatList[battleID].pCombatants[i].playerID+activeCombatList[battleID].pCombatants[i].name);
        if(z !== -1) {
          charList[z].addEXP(activeCombatList[battleID].pCombatants[i].earnedEXP);
          if(danger > 0) {
            charList[z].zenkaiTriggered = activeCombatList[battleID].pCombatants[i].zenkaiTriggered;
            charList[z].gainZenkai();
          } 
          let index = getCharListIndex(charList[z].playerID);
          if(users[index].tutorial === 1) {
            let str = Help.tutorial(2);
            let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Tutorial: ' + charList[z].name.replace(/\_/g,' '));
            currEmbed.setThumbnail("https://cdn.discordapp.com/attachments/986234335051018340/988244698265161728/unknown.png")
            currEmbed.setDescription(str);
            msg.channel.send({ embeds: [currEmbed] });
          }
          if(activeCombatList[battleID].raid !== 0 && playerWin === 1) {
            let ui = getCharListIndex(charList[z].playerID);
            let str = Raid.raidReward(activeCombatList[battleID].raid,charList[z],users[ui]);
            if(str !== "") {
              let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Congratulations ' + charList[z].name.replace(/\_/g,' '));
              currEmbed.setDescription(str);
              msg.channel.send({ embeds: [currEmbed] });
            }
          }
        }
        else console.log("pCombatants: Player save failed.")
        charList[z].earnedEXP = 0;
      }
    }
    for(let i = 0; i < activeCombatList[battleID].NPCombatants.length; i++) {
      activeCombatList[battleID].NPCombatants[i].isTransformed = -1;
      activeCombatList[battleID].NPCombatants[i].scaled = -1;
      activeCombatList[battleID].NPCombatants[i].statusUpdate(0);

      for(let j = 0; j < activeCombatList[battleID].NPCombatants[i].techCooldowns.length; j++) {
        activeCombatList[battleID].NPCombatants[i].techCooldowns[j] = 0;
      }
      if(activeCombatList[battleID].NPCombatants[i].playerID === "NPC") {
        let z = npcList.map(function(e) { return e.name; }).indexOf(activeCombatList[battleID].NPCombatants[i].name);
        if(z !== -1) npcList[z].addEXP(activeCombatList[battleID].NPCombatants[i].earnedEXP);
        else console.log("NPCombatants: NPC save failed.")
        npcList[z].earnedEXP = 0;
      }
      else if(activeCombatList[battleID].NPCombatants[i].playerID !== "Random") {
        let z = charList.map(function(e) { return e.playerID+e.name; }).indexOf(activeCombatList[battleID].NPCombatants[i].playerID+activeCombatList[battleID].NPCombatants[i].name);
        if(z !== -1) charList[z].addEXP(activeCombatList[battleID].NPCombatants[i].earnedEXP);
        if(z !== -1 && danger > 0) {
            charList[z].zenkaiTriggered = activeCombatList[battleID].NPCombatants[i].zenkaiTriggered;
            charList[z].gainZenkai();
          } 
        else console.log("NPCombatants: Player save failed.")
        charList[z].earnedEXP = 0;
      }
    }
    activeCombatList.splice(battleID,1);
    loader.characterSaver(charList);
    loader.npcSaver(npcList);
    loader.userSaver(users);
  }

  function checkBattles(ID,charName) {
    for(let i = 0; i < activeCombatList.length; i++) {
      for(let j = 0; j < activeCombatList[i].pCombatants.length; j++) {
        if(ID === activeCombatList[i].pCombatants[j].playerID && charName === activeCombatList[i].pCombatants[j].name) {
          return 1;
        }
      }
    }
    return 0;
  }

  function getCurrentBattle(ID,charName) {
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

  function getCurrentBattleNPC(charName) {
    for(let i = 0; i < activeCombatList.length; i++) {
      for(let j = 0; j < activeCombatList[i].NPCombatants.length; j++) {
        if(charName == activeCombatList[i].NPCombatants[j].name) {
          return i;
        }
      }
    }
    return -1;
  }

  function battleMessage(text) {
    let currEmbed = new Discord.MessageEmbed(messageEmbed);
    currEmbed.setDescription(text);
    msg.channel.send({ embeds: [currEmbed] });
  }

  function userTechPrint(user) {
      msg.channel.send('<@'+user.userID+'>');
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Unlocked Techniques');
      let str;

      for(let i = 0; i < user.tags.length; i++) {
        str = '*TechID*  ' + techList[user.tags[i]].UID + '\n';
        if(techList[user.tags[i]].techType === 'Transform') {
          str += '*Type*  Transformation\n';
          str += '*EP Cost*  ' + techList[user.tags[i]].energyCost.toLocaleString(undefined) + '%\n';
          str += '*HP Cost*  ' + techList[user.tags[i]].healthCost.toLocaleString(undefined) + '%\n';
          if(techList[user.tags[i]].tag !== "None") str += '*Race Req*  ' + techList[user.tags[i]].tag.toLocaleString(undefined) + '\n';
          str += '**Modifiers**'; 
          str += techList[user.tags[i]].attBonus.outputBonusStr();
          currEmbed.addField('**'+techList[user.tags[i]].name.replace(/\_/g,' ')+'**', str, true);
        }
        else if(techList[user.tags[i]].techType === 'Ki' || techList[user.tags[i]].techType === 'Strike') {
          str += '*EP Cost*  ' + techList[user.tags[i]].energyCost.toLocaleString(undefined) + '\n';
          str += '*HP Cost*  ' + techList[user.tags[i]].healthCost.toLocaleString(undefined) + '\n';
          str += '*Damage Scaling*  ' + techList[user.tags[i]].scalePercent*100 + '%\n';
          str += '*Flat Damage Scaling*  ' + techList[user.tags[i]].flatDamage + '\n'; 
          str += '*Hit Number*  ' + techList[user.tags[i]].hits + '\n';
          str += '*Armor Pen*  ' + techList[user.tags[i]].armorPen + '%\n';
          str += '*Bonus Hit*  ' + techList[user.tags[i]].hitRate + '%\n';
          str += '*Bonus Crit*  ' + techList[user.tags[i]].critRate + '%\n';
          if(techList[user.tags[i]].coolDown > 1) str += '*Cooldown*  ' + (Number(techList[user.tags[i]].coolDown)-1) + ' turns\n';
          else str += '*Cooldown* ' + techList[user.tags[i]].coolDown + ' turns\n';
          if(techList[user.tags[i]].allowCharge == 1) str += '*Can be charged*\n';
          if(techList[user.tags[i]].techType === 'Ki') {
            str += '*Type*  Energy';
          }
          else {
            str += '*Type*  ' + techList[user.tags[i]].techType;
          }
          currEmbed.addField('**'+techList[user.tags[i]].name.replace(/\_/g,' ')+'**', str, true);
        }
        else if(techList[user.tags[i]].techType === 'Buff' || techList[user.tags[i]].techType === 'Debuff') {
          str += '*Type*  ' + techList[user.tags[i]].techType + '\n';
          str += '*EP Cost*  ' + techList[user.tags[i]].energyCost.toLocaleString(undefined) + '\n';
          str += '*HP Cost*  ' + techList[user.tags[i]].healthCost.toLocaleString(undefined) + '\n';
          if(techList[user.tags[i]].coolDown > 1) str += '*Cooldown*  ' + (Number(techList[user.tags[i]].coolDown)-1) + ' turns\n';
          else str += '*Cooldown* 3 ' + techList[user.tags[i]].coolDown + ' turns\n';
          str += '*Duration*  ' + techList[user.tags[i]].duration + '\n'; 
          str += '**Modifiers**';
          str += techList[user.tags[i]].attBonus.outputBonusStr();
          currEmbed.addField('**'+techList[user.tags[i]].name.replace(/\_/g,' ')+'**', str, true);
        }
        else if(techList[user.tags[i]].techType === 'Restoration') {
          str += '*Type*  ' + techList[user.tags[i]].techType + '\n';
          str += '*EP Cost*  ' + techList[user.tags[i]].energyCost.toLocaleString(undefined) + '\n';
          str += '*HP Cost*  ' + techList[user.tags[i]].healthCost.toLocaleString(undefined) + '\n';
          str += '*Restoration Scaling*  ' + techList[user.tags[i]].scalePercent*100 + '%\n';
          str += '*Flat Restoration Scaling*  ' + techList[user.tags[i]].flatDamage + '\n'; 
          if(techList[user.tags[i]].energy > 0) str += "Heal Type: Energy\n"
          else if(techList[user.tags[i]].health > 0) str += "Heal Type: Health\n"
          if(techList[user.tags[i]].coolDown > 1) str += '*Cooldown*  ' + (Number(techList[user.tags[i]].coolDown)-1) + ' turns\n';
          else str += '*Cooldown* 3 ' + techList[user.tags[i]].coolDown + ' turns\n';
          currEmbed.addField('**'+techList[user.tags[i]].name.replace(/\_/g,' ')+'**', str, true);
        }

        if(i%20 == 0 && i !== 0) {
          currEmbed.setFooter({ text: "EP Cost, HP Cost and Flat Damage are multiplied by a character's total stat and level average.\n"});
          msg.channel.send({ embeds: [currEmbed] });
          currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle('Unlocked Techniques');
        }
      }
      currEmbed.setFooter({ text: "EP Cost, HP Cost and Flat Damage are multiplied by a character's total stat and level average.\n"});
      msg.channel.send({ embeds: [currEmbed] });
  }

  function charTechPrint(char) {
      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle(char.name.replace(/\_/g,' ') + "'s Current Techniques");
      let scaleLvl = Math.round((char.battleCurrAtt.stotal + char.level)/2);
      let str;
      if(char.techniques.length >= 1) {
        str = 'EP Cost ' + (techList[char.techniques[0]].energyCost*scaleLvl).toLocaleString(undefined) + '\n';
        str += 'HP Cost ' + (techList[char.techniques[0]].healthCost*scaleLvl).toLocaleString(undefined) + '\n';
        str += 'Type ' + techList[char.techniques[0]].techType + '\n';
        if(techList[char.techniques[0]].coolDown > 1) str += 'CD ' + Number(techList[char.techniques[0]].coolDown-1);
        else str += 'CD ' + techList[char.techniques[0]].coolDown;
        currEmbed.addField(':one: ' + techList[char.techniques[0]].name.replace(/\_/g,' '), str, true);
      }
      else {
        currEmbed.addField(':one: None', '\u200b', true);
      }
      if(char.techniques.length >= 2) {
        str = 'EP Cost ' + (techList[char.techniques[1]].energyCost*scaleLvl).toLocaleString(undefined) + '\n';
        str += 'HP Cost ' + (techList[char.techniques[1]].healthCost*scaleLvl).toLocaleString(undefined) + '\n';
        str += 'Type ' + techList[char.techniques[1]].techType + '\n';
        if(techList[char.techniques[1]].coolDown > 1) str += 'CD ' + Number(techList[char.techniques[1]].coolDown-1);
        else str += 'CD ' + techList[char.techniques[1]].coolDown;
        currEmbed.addField(':two: ' + techList[char.techniques[1]].name.replace(/\_/g,' '), str, true);
      }
      else {
        currEmbed.addField(':two: None', '\u200b', true);
      }
      if(char.techniques.length >= 3) {
        str = 'EP Cost ' + (techList[char.techniques[2]].energyCost*scaleLvl).toLocaleString(undefined) + '\n';
        str += 'HP Cost ' + (techList[char.techniques[2]].healthCost*scaleLvl).toLocaleString(undefined) + '\n';
        str += 'Type ' + techList[char.techniques[2]].techType + '\n';
        if(techList[char.techniques[2]].coolDown > 1) str += 'CD ' + Number(techList[char.techniques[2]].coolDown-1);
        else str += 'CD ' + techList[char.techniques[2]].coolDown;
        currEmbed.addField(':three: ' + techList[char.techniques[2]].name.replace(/\_/g,' '), str, true); 
      }
      else {
        currEmbed.addField(':three: None', '\u200b', true);
      }
      if(char.techniques.length >= 4) {
        str = 'EP Cost ' + (techList[char.techniques[3]].energyCost*scaleLvl).toLocaleString(undefined) + '\n';
        str += 'HP Cost ' + (techList[char.techniques[3]].healthCost*scaleLvl).toLocaleString(undefined) + '\n';
        str += 'Type ' + techList[char.techniques[3]].techType + '\n';
        if(techList[char.techniques[3]].coolDown > 1) str += 'CD ' + Number(techList[char.techniques[3]].coolDown-1);
        else str += 'CD ' + techList[char.techniques[3]].coolDown;
        currEmbed.addField(':four: ' + techList[char.techniques[3]].name.replace(/\_/g,' '), str, true);
      }
      else {
        currEmbed.addField(':four: None', '\u200b', true);
      }
      if(char.techniques.length >= 5) {
        str = 'EP Cost ' + (techList[char.techniques[4]].energyCost*scaleLvl).toLocaleString(undefined) + '\n';
        str += 'HP Cost ' + (techList[char.techniques[4]].healthCost*scaleLvl).toLocaleString(undefined) + '\n';
        str += 'Type ' + techList[char.techniques[4]].techType + '\n';
        if(techList[char.techniques[4]].coolDown > 1) str += 'CD ' + Number(techList[char.techniques[4]].coolDown-1);
        else str += 'CD ' + techList[char.techniques[4]].coolDown;
        currEmbed.addField(':five: ' + techList[char.techniques[4]].name.replace(/\_/g,' '), str, true);
      }
      else {
        currEmbed.addField(':five: None', '\u200b', true);
      }

      if(char.transformation !== -1) {
        str = 'EP Cost ' + Math.round(techList[char.transformation].energyCost/100*char.battleMaxAtt.energy).toLocaleString(undefined) + '\n';
        str += 'HP Cost ' + Math.round(techList[char.transformation].healthCost/100*char.battleMaxAtt.health).toLocaleString(undefined) + '\n';
        currEmbed.addField('<:t_red:832763572919992390> ' + techList[char.transformation].name.replace(/\_/g,' '), str, true);
      }
      else {
        currEmbed.addField('<:t_red:832763572919992390> None', '\u200b', true);
      }

      msg.channel.send({ embeds: [currEmbed] });
  }

  function printBattleList(battle,battleEnd) {
    for(let i = 0; i < battle.NPCombatants.length; i++) {
      if(battle.NPCombatants[i].playerID === 'NPC' || battle.NPCombatants[i].playerID === 'Random') {
        battlePrint(-1,battle.NPCombatants[i],i,battleEnd);
      }
      else {
        let z = charList.map(function(e) { return e.playerID+e.name; }).indexOf(battle.NPCombatants[i].playerID+battle.NPCombatants[i].name);
        //let z = charList.indexOf(battle.NPCombatants[i])
        battlePrint(1,z,i,battleEnd);
      }
    }
    for(let i = 0; i < battle.pCombatants.length; i++) {
      if(battle.pCombatants[i].playerID === 'NPC' || battle.pCombatants[i].playerID === 'Random') {
        battlePrint(-1,battle.pCombatants[i],i,battleEnd);
      }
      else {
        let z = charList.map(function(e) { return e.playerID+e.name; }).indexOf(battle.pCombatants[i].playerID+battle.pCombatants[i].name);
        //let z = charList.indexOf(battle.pCombatants[i])
        battlePrint(1,z,i,battleEnd);
      }
    }
  }

  function playerEmbed(ID,placement,battleEnd, team) {
      index = ID;
      let bcheck = getCurrentBattle(charList[index].playerID, charList[index].name);
      let char;
      let combatList = new Array();
      const selectTarget = new MessageSelectMenu();
      selectTarget.setCustomId('target');
      selectTarget.setPlaceholder('Select Target');

      for(let i = 0; i < activeCombatList[bcheck].pCombatants.length; i++) {
          combatList.push(activeCombatList[bcheck].pCombatants[i]);
          if(activeCombatList[bcheck].raid !== 0 && team === 0) {
            selectTarget.addOptions([
              {
                label: "Ally",
                value: 'a' + i.toLocaleString(),
                description: activeCombatList[bcheck].pCombatants[i].name.replace(/\_/g,' '),
              },
            ]);
          }
          else if(activeCombatList[bcheck].raid !== 0 && team === 1) {
            selectTarget.addOptions([
              {
                label: "Enemy",
                value: 'e' + i.toLocaleString(),
                description: activeCombatList[bcheck].pCombatants[i].name.replace(/\_/g,' '),
              },
            ]);
          }
      }
      for(let i = 0; i < activeCombatList[bcheck].NPCombatants.length; i++) {
        combatList.push(activeCombatList[bcheck].NPCombatants[i]);
          if(activeCombatList[bcheck].raid !== 0 && team === 0) {
            selectTarget.addOptions([
              {
                label: "Enemy",
                value: 'e' + i.toLocaleString(),
                description: activeCombatList[bcheck].NPCombatants[i].name.replace(/\_/g,' '),
              },
            ]);
          }
          else if(activeCombatList[bcheck].raid !== 0 && team === 1) {
            selectTarget.addOptions([
              {
                label: "Ally",
                value: 'a' + i.toLocaleString(),
                description: activeCombatList[bcheck].NPCombatants[i].name.replace(/\_/g,' '),
              },
            ]);
          }
      }
      for(let i = 0; i < combatList.length; i++) {
        if(combatList[i].name === charList[index].name) {
          char = combatList[i];
          break;
        }
      }

      let name = char.name.replace(/\_/g,' ');
      if(char.isTransformed !== -1) {
        if(techList[char.transformation].name == "Potential_Unleashed" || techList[char.transformation].name.search("Saiyan") !== -1) {
          name = techList[char.transformation].name.replace(/\_/g,' ') + ' ' + char.name.replace(/\_/g,' ');
        }
        else name += ', ' + techList[char.transformation].name.replace(/\_/g,' ');
      }

      let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle(name);
      if(char.image === '' || char.image === null) { currEmbed.setThumbnail(msg.author.avatarURL()); }
      else { currEmbed.setThumbnail(char.image); }

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
        { name: 'Team ' + (team+1).toLocaleString(), value: 'Slot ' + placement.toLocaleString(), inline: true  },

        { name: ':red_circle: Health', value: hpStr, inline: true },
        //{ name: '\u200b', value: '\u200b', inline: true  },
        { name: ':blue_circle: Energy', value: engStr, inline: true },
        { name: ':yellow_circle: Charge', value: chargeStr, inline: true },
      );

      if(activeCombatList[bcheck].raid === 0) {
        let dogiN = "None";
        let weaponN = "None";
        if(char.dogi !== null) dogiN = char.dogi.name.replace(/\_/g,' ');
        if(char.weapon !== null) weaponN = char.weapon.name.replace(/\_/g,' ');
        currEmbed.addFields(
          { name: 'Dogi', value: dogiN, inline: true  },
          { name: 'Weapon', value: weaponN, inline: true  },
            { name: 'Fighting Style', value: char.styleName.replace(/\_/g,' '), inline: true  }
        );
      }

      let scaleLvl = Math.round((char.battleCurrAtt.stotal + char.level)/2);
      const row1 = new MessageActionRow();
      const row2 = new MessageActionRow();
      const select = new MessageSelectMenu();
      select.setCustomId('techs');
      select.setPlaceholder('Select Technique');
      row2.addComponents(
        new MessageButton()
          .setCustomId('strike')
          .setLabel('Strike')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId('burst')
          .setLabel('Burst')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId('charge')
          .setLabel('Charge')
          .setStyle('SUCCESS'),
        new MessageButton()
          .setCustomId('techcharge')
          .setLabel('Toggle Charge')
          .setStyle('DANGER'),
      );
      let str;
      let cstr = "";

      if(char.techniques.length >= 1 && battleEnd !== 1) {
          for(let i = 0; i < char.techniques.length; i++) {
            if(techList[char.techniques[i]].energyCost > 0) str = (techList[char.techniques[i]].energyCost*scaleLvl).toLocaleString(undefined) + 'EP|\n';
            if(techList[char.techniques[i]].healthCost > 0) str += (techList[char.techniques[i]].healthCost*scaleLvl).toLocaleString(undefined) + 'HP|\n';
             + '| \n';
            if(techList[char.techniques[i]].scalePercent !== 0 && techList[char.techniques[i]].flatDamage !== 0 &&
              techList[char.techniques[i]].techType !== "Transform") {
              str += (techList[char.techniques[i]].scalePercent*100).toLocaleString(undefined) + '%+';
              str += (techList[char.techniques[i]].flatDamage).toLocaleString(undefined);
              if( techList[char.techniques[i]].hits > 0) str += ' x' + (techList[char.techniques[i]].hits).toLocaleString(undefined);
              if(techList[char.techniques[i]].techType === "Restoration" && techList[char.techniques[i]].health > 0) str += ' healing|\n'
              else if(techList[char.techniques[i]].techType === "Restoration" && techList[char.techniques[i]].energy > 0) str += ' energy restore|\n'
              else str += ' damage| \n'
            }

            if(techList[char.techniques[i]].techType === "Buff") {
              if(techList[char.techniques[i]].guardTarget > 0) {
                cstr = " [Guard] | " + techList[char.techniques[i]].duration + " turn duration";
              }
              else {
                cstr = " | " + techList[char.techniques[i]].duration + " turn duration";
              }
            } 
            else if(techList[char.techniques[i]].allowCharge !== 0) {
              cstr = " [Charge] ";
            } 
            else {
              cstr = "";
            }

            if(techList[char.techniques[i]].armorPen !== 0) str += (techList[char.techniques[i]].armorPen).toLocaleString(undefined) + '% pen|\n';
            if(techList[char.techniques[i]].critRate !== 0) str += (techList[char.techniques[i]].critRate).toLocaleString(undefined) + '% crit|\n';

            if(char.techCooldowns[i] > 0) cstr += ' - ' + char.techCooldowns[i] + ' turn CD';
            else cstr += ' - Ready';
            //currEmbed.addField(':one: ' + techList[char.techniques[0]].name.replace(/\_/g,' '), str, true);
            let emoja;

            if(char.techCooldowns[i] > 0) {
              emoja = '⬛';
            }
            else if(techList[char.techniques[i]].techType === "Restoration") {
              emoja = '🟩';
            }
            else if(techList[char.techniques[i]].techType === "Ki") {
              emoja = '🟦';
            }
            else if(techList[char.techniques[i]].techType === "Strike") {
              emoja = '🟧';
            }
            else if(techList[char.techniques[i]].techType === "Buff") {
              emoja = '⬜';
            }
            else if(techList[char.techniques[i]].techType === "Debuff") {
              emoja = '🟪';
            }

            select.addOptions([
              {
                label: techList[char.techniques[i]].name.replace(/\_/g,' ') + cstr,
                value: i.toLocaleString(),
                description: str,
                emoji: emoja
              },
            ]);
        }
      }
      if(char.transformation !== -1 && battleEnd !== 1) {
        if(techList[char.transformation].energyCost > 0) str = Math.round(techList[char.transformation].energyCost/100*char.battleMaxAtt.energy).toLocaleString(undefined) + ' EN per round \n';
        if(techList[char.transformation].healthCost > 0) str += Math.round(techList[char.transformation].healthCost/100*char.battleMaxAtt.health).toLocaleString(undefined) + ' HP per round \n';
        //currEmbed.addField('<:t_red:832763572919992390> ' + techList[char.transformation].name.replace(/\_/g,' '), str, true);
          select.addOptions([
            {
              label: techList[char.transformation].name.replace(/\_/g,' '),
              value: char.transformation.toLocaleString(undefined),
              description: str,
              emoji:'<:t_red:832763572919992390>',
            },
          ]);
      }

      //msg.channel.send({ embeds: [currEmbed] });
      let row3 = null;
      if(activeCombatList[bcheck].raid === 0) {
        row1.addComponents(select);
      }
      else {
        row1.addComponents(select);
        row3 = new MessageActionRow();
        row3.addComponents(selectTarget);
      }
      return [currEmbed, row1, row2, row3]
  }

  /********************
    battlePrint : Prints the stats of a combatant in a battle
        - pcOrNPC   : Given a value between 0, 1 and -1 which will print assuming the ID is a reference for an NPC, a player or that it's a character object respectively
        - ID        : This ID is either a reference to npcList/charList or a character object which will be used to print the relevant stats
        - Placement : The placement in the battle's character list. This is for displaying to people for targetting with skills
  ********************/
  function battlePrint(pcOrNPC, ID, placement, battleEnd) {
    if(battleEnd !== 1) battleEnd = -1;

    if(pcOrNPC === 1) {
      let team = -5;
      let bcheck = getCurrentBattle(charList[ID].playerID, charList[ID].name);
      let char;
      let combatList = new Array();
      for(let i = 0; i < activeCombatList[bcheck].pCombatants.length; i++) {
          combatList.push(activeCombatList[bcheck].pCombatants[i]);
      }
      for(let i = 0; i < activeCombatList[bcheck].NPCombatants.length; i++) {
        combatList.push(activeCombatList[bcheck].NPCombatants[i]);
      }
      for(let i = 0; i < combatList.length; i++) {
        if(combatList[i].name === charList[ID].name) {
          char = combatList[i];
          break;
        }
      }
      let charName = char.name;

      let combatI = activeCombatList[bcheck].pCombatants.map(function(e) { return e.playerID; }).indexOf(charList[ID].playerID);
      if(combatI === -1) {
        combatI = activeCombatList[bcheck].NPCombatants.map(function(e) { return e.playerID; }).indexOf(charList[ID].playerID);
        team = 1; //NPC team
      }
      else team = 0; //player team
      let embed = playerEmbed(ID,placement,battleEnd, team);
      let components = new Array();
      components.push(embed[1]);
      if(embed[3] !== null) components.push(embed[3]);
      //if(embed[4] !== null) components.push(embed[4]);
      components.push(embed[2]);

      if(team === 0 && activeCombatList[bcheck].pCombatants[combatI].battleCurrAtt.health <= 0) {
        components = new Array()
        let newRow = new MessageActionRow;
        newRow.addComponents(
          new MessageButton()
            .setCustomId('wait')
            .setLabel('Wait')
            .setStyle('DANGER')
            );
        components.push(newRow);
      }

      if(battleEnd === 1) msg.channel.send({ embeds: [embed[0]], components: []});
      else msg.channel.send({ embeds: [embed[0]], components: components})
        .then(message => {
          const filter = (i) => {
              let z = findID(i.user.id)
              if(i.user.id === char.playerID && message.id === i.message.id) {
                bcheck = getCurrentBattle(charList[z].playerID, charList[z].name);
                return true;
              }
              else return false;
          };

      const collector = msg.channel.createMessageComponentCollector({ filter, time: 1000*60*60*24, max: 1 });
      collector.on('collect', async i => { 
        ID = findID(i.user.id)
        if(bcheck === -1) {
          collector.stop();
          i.update({ embeds: [embed[0]], components: [] });
          return;
        }
        else if(i.customId === 'wait') {
          let index = -1;
          for(let i = 0; i < activeCombatList[bcheck].pCombatants.length; i++) {
                if(activeCombatList[bcheck].pCombatants[i].playerID+activeCombatList[bcheck].pCombatants[i].name === char.playerID+char.name) {
              index = i;
              break;
            }
          }

          let action = activeCombatList[bcheck].wait();
          action.push(index);
          action.push(-1);
          activeCombatList[bcheck].actions.push(action);

          collector.stop();
          i.update({ embeds: [embed[0]], components: [] });
          battleTurn(bcheck);
        }
        else if(i.customId === 'target') {
          let index = -1;
          for(let i = 0; i < activeCombatList[bcheck].pCombatants.length; i++) {
                if(activeCombatList[bcheck].pCombatants[i].playerID+activeCombatList[bcheck].pCombatants[i].name === char.playerID+char.name) {
              index = i;
              break;
            }
          }
          if(index === -1) {
              for(let i = 0; i < activeCombatList[bcheck].NPCombatants.length; i++) {
                if(activeCombatList[bcheck].NPCombatants[i].playerID+activeCombatList[bcheck].NPCombatants[i].name === char.playerID+char.name) {
                index = i;
                break;
              }
            }
          }

          message.delete();
          battlePrint(pcOrNPC, ID, placement, battleEnd);
          if(i.values[0].charAt(0) === "a") {
            if(team === 0) activeCombatList[bcheck].pCombatants[index].aTarget = i.values[0].charAt(1);
            else activeCombatList[bcheck].NPCombatants[index].aTarget = i.values[0].charAt(1);
            msg.channel.send("Ally Target set to " + i.values[0].charAt(1) + ".");
          }
          else {
            if(team === 0) activeCombatList[bcheck].pCombatants[index].eTarget = i.values[0].charAt(1);
            else activeCombatList[bcheck].NPCombatants[index].eTarget = i.values[0].charAt(1);
            msg.channel.send("Enemy Target set to " + i.values[0].charAt(1) + ".");
          }
        }
        else if(i.customId === 'techcharge') {
          let index = 0;
          if(team === 0) {
            for(let i = 0; i < activeCombatList[bcheck].pCombatants.length; i++) {
                if(activeCombatList[bcheck].pCombatants[i].playerID+activeCombatList[bcheck].pCombatants[i].name === char.playerID+char.name) {
                index = i;
                break;
              }
            }
            if(activeCombatList[bcheck].pCombatants[index].isCharging === 1) {
              activeCombatList[bcheck].pCombatants[index].isCharging = 0;
              message.delete();
              battlePrint(pcOrNPC, ID, placement, battleEnd);
              msg.channel.send("No longer using charge to empower techniques.");
            }
            else {
              activeCombatList[bcheck].pCombatants[index].isCharging = 1;
              message.delete();
              battlePrint(pcOrNPC, ID, placement, battleEnd);
              msg.channel.send("Now using charge to empower techniques.");
            }
            return;
          }
          else {
            let index = 0;
            for(let i = 0; i < activeCombatList[bcheck].NPCombatants.length; i++) {
                if(activeCombatList[bcheck].NPCombatants[i].playerID+activeCombatList[bcheck].NPCombatants[i].name === char.playerID+char.name) {
                index = i;
                break;
              }
            }
            if(activeCombatList[bcheck].NPCombatants[index].isCharging === 1) {
              activeCombatList[bcheck].NPCombatants[index].isCharging = 0;
              message.delete();
              battlePrint(pcOrNPC, ID, placement, battleEnd);
              msg.channel.send("No longer using charge to empower techniques.");
            }
            else {
              activeCombatList[bcheck].NPCombatants[index].isCharging = 1;
              message.delete();
              battlePrint(pcOrNPC, ID, placement, battleEnd);
              msg.channel.send("Now using charge to empower techniques.");
            }
            return;
          }
        }
        else if(i.customId === 'techs') {
          if(team === 1) {
            if(techList[i.values[0]].techType === "Transform") {
              let index = 0;
              for(let i = 0; i < activeCombatList[bcheck].NPCombatants.length; i++) {
                if(activeCombatList[bcheck].NPCombatants[i].playerID+activeCombatList[bcheck].NPCombatants[i].name === char.playerID+char.name) {
                  index = i;
                  break;
                }
              }
              let action = activeCombatList[bcheck].transform(activeCombatList[bcheck].NPCombatants[index]);
              action.push(index);
              action.push(-1);
              activeCombatList[bcheck].NPCactions.push(action);

              collector.stop();
              try {
                i.update({ embeds: [embed[0]], components: [] })
                        .then(battleTurn(bcheck));
              } catch (error) { console.error(error); }
            }
            else {
              let index = 0;
              for(let i = 0; i < activeCombatList[bcheck].NPCombatants.length; i++) {
                if(activeCombatList[bcheck].NPCombatants[i].playerID+activeCombatList[bcheck].NPCombatants[i].name === char.playerID+char.name) {
                  index = i;
                  break;
                }
              }

              let techID = activeCombatList[bcheck].NPCombatants[index].techniques[i.values[0]];
              if((techList[techID].techType === "Strike" || techList[techID].techType === "Ki") &&
                techList[techID].transReq !== "None" && (activeCombatList[bcheck].NPCombatants[index].transformation === -1 
                || techList[activeCombatList[bcheck].NPCombatants[index].transformation].name.search(techList[techID].transReq) === -1))
              { 
                message.delete();
                battlePrint(pcOrNPC, ID, placement, battleEnd);
                msg.channel.send("Required transformation not set.");
                return;
              }

              if((techList[activeCombatList[bcheck].NPCombatants[index].techniques[i.values[0]]].techType === "Strike" 
                || techList[activeCombatList[bcheck].NPCombatants[index].techniques[i.values[0]]].techType === "Ki"
                || techList[activeCombatList[bcheck].NPCombatants[index].techniques[i.values[0]]].techType === "Debuff") 
                && (activeCombatList[bcheck].NPCombatants[index].eTarget > (activeCombatList[bcheck].pCombatants.length-1) 
                  || activeCombatList[bcheck].NPCombatants[index].eTarget < 0)) {
                    activeCombatList[bcheck].NPCombatants[index].eTarget = 0;
              }
              else if(activeCombatList[bcheck].NPCombatants[index].aTarget > (activeCombatList[bcheck].NPCombatants.length-1) || activeCombatList[bcheck].NPCombatants[index].aTarget < 0) {
                  activeCombatList[bcheck].NPCombatants[index].aTarget = 0;
              }

              if((techList[activeCombatList[bcheck].NPCombatants[index].techniques[i.values[0]]].techType === "Strike" 
                || techList[activeCombatList[bcheck].NPCombatants[index].techniques[i.values[0]]].techType === "Ki"
                || techList[activeCombatList[bcheck].NPCombatants[index].techniques[i.values[0]]].techType === "Debuff") 
                && activeCombatList[bcheck].pCombatants[activeCombatList[bcheck].NPCombatants[index].eTarget].battleCurrAtt.health <= 0) {
                let npchar = activeCombatList[bcheck].NPCombatants[index];
                while((npchar.eTarget < 0 || npchar.eTarget > (activeCombatList[bcheck].pCombatants.length-1) || activeCombatList[bcheck].pCombatants[npchar.eTarget].battleCurrAtt.health <= 0)) {
                  if(npchar.eTarget > (activeCombatList[bcheck].pCombatants.length-1) || npchar.eTarget < 0) npchar.eTarget = 0;
                  else npchar.eTarget++;
                }
              }
              else if(activeCombatList[bcheck].NPCombatants[index].battleCurrAtt.health <= 0) {
                let npchar = activeCombatList[bcheck].NPCombatants[index];
                while((npchar.aTarget < 0 || npchar.aTarget > (activeCombatList[bcheck].NPCombatants.length-1) || activeCombatList[bcheck].NPCombatants[npchar.aTarget].battleCurrAtt.health <= 0)) {
                  if(npchar.aTarget > (activeCombatList[bcheck].NPCombatants.length-1) || npchar.aTarget < 0) npchar.aTarget = 0;
                  else npchar.aTarget++;
                }
              }

              if(activeCombatList[bcheck].NPCombatants[index].techCooldowns[i.values[0]] != 0) {
                message.delete();
                battlePrint(pcOrNPC, ID, placement, battleEnd);
                msg.channel.send("Skill on cooldown.");
                return;
              }


              if(activeCombatList[bcheck].NPCombatants[index].battleCurrAtt.charge <= 0) activeCombatList[bcheck].NPCombatants[index].isCharging = 0;

              let costMod = Math.round((activeCombatList[bcheck].NPCombatants[index].battleCurrAtt.stotal + activeCombatList[bcheck].NPCombatants[index].level)/2);
              if(activeCombatList[bcheck].NPCombatants[index].battleCurrAtt.health <= techList[activeCombatList[bcheck].NPCombatants[index].techniques[i.values[0]]].healthCost*costMod ||
                 activeCombatList[bcheck].NPCombatants[index].battleCurrAtt.energy < techList[activeCombatList[bcheck].NPCombatants[index].techniques[i.values[0]]].energyCost*costMod ||
                 activeCombatList[bcheck].NPCombatants[index].battleCurrAtt.charge 
                 < Math.round(activeCombatList[bcheck].NPCombatants[index].battleMaxAtt.charge * 0.2 * activeCombatList[bcheck].NPCombatants[index].isCharging * techList[activeCombatList[bcheck].NPCombatants[index].techniques[i.values[0]]].allowCharge)) {
                message.delete();
                battlePrint(pcOrNPC, ID, placement, battleEnd);
                msg.channel.send("You don't have the resources for this technique.");
                return;
              }

              activeCombatList[bcheck].NPCombatants[index].techCooldowns[i.values[0]] = techList[activeCombatList[bcheck].NPCombatants[index].techniques[i.values[0]]].coolDown;
              let target;
              let targetI;
              if(techList[activeCombatList[bcheck].NPCombatants[index].techniques[i.values[0]]].techType === "Strike" 
                || techList[activeCombatList[bcheck].NPCombatants[index].techniques[i.values[0]]].techType === "Ki" 
                || techList[activeCombatList[bcheck].NPCombatants[index].techniques[i.values[0]]].techType === "Debuff") {
                targetI = activeCombatList[bcheck].NPCombatants[index].eTarget;
                target = activeCombatList[bcheck].pCombatants[targetI];
              }
              else {
                targetI = activeCombatList[bcheck].NPCombatants[index].aTarget;
                target = activeCombatList[bcheck].pCombatants[targetI];
              }

              let action = activeCombatList[bcheck].skill(activeCombatList[bcheck].NPCombatants[index],target,techList[activeCombatList[bcheck].NPCombatants[index].techniques[i.values[0]]], activeCombatList[bcheck].NPCombatants[index].isCharging);
              action.push(index);
              action.push(targetI);
              activeCombatList[bcheck].NPCactions.push(action);

              collector.stop();
              try {
                i.update({ embeds: [embed[0]], components: [] })
                        .then(battleTurn(bcheck));
              } catch (error) { console.error(error); }
            }
          }
          else {
            if(techList[i.values[0]].techType === "Transform") {
              let index = 0;
              for(let i = 0; i < activeCombatList[bcheck].pCombatants.length; i++) {
                if(activeCombatList[bcheck].pCombatants[i].playerID+activeCombatList[bcheck].pCombatants[i].name === char.playerID+char.name) {
                  index = i;
                  break;
                }
              }
              let action = activeCombatList[bcheck].transform(activeCombatList[bcheck].pCombatants[index]);
              action.push(index);
              action.push(-1);
              activeCombatList[bcheck].actions.push(action);

              collector.stop();
              try {
                i.update({ embeds: [embed[0]], components: [] })
                        .then(battleTurn(bcheck));
              } catch (error) { console.error(error); }
            }
            else {
              let index = 0;
              for(let i = 0; i < activeCombatList[bcheck].pCombatants.length; i++) {
                if(activeCombatList[bcheck].pCombatants[i].playerID+activeCombatList[bcheck].pCombatants[i].name === char.playerID+char.name) {
                  index = i;
                  break;
                }
              }

              let techID = activeCombatList[bcheck].pCombatants[index].techniques[i.values[0]];
              if((techList[techID].techType === "Strike" || techList[techID].techType === "Ki") &&
                techList[techID].transReq !== "None" && (activeCombatList[bcheck].pCombatants[index].transformation === -1 
                || techList[activeCombatList[bcheck].pCombatants[index].transformation].name.search(techList[techID].transReq) === -1))
              { 
                message.delete();
                battlePrint(pcOrNPC, ID, placement, battleEnd);
                msg.channel.send("Required transformation not set.");
                return;
              }


              if((techList[activeCombatList[bcheck].pCombatants[index].techniques[i.values[0]]].techType === "Strike" 
                || techList[activeCombatList[bcheck].pCombatants[index].techniques[i.values[0]]].techType === "Ki"
                || techList[activeCombatList[bcheck].pCombatants[index].techniques[i.values[0]]].techType === "Debuff") 
                && (activeCombatList[bcheck].pCombatants[index].eTarget > (activeCombatList[bcheck].NPCombatants.length-1) 
                  || activeCombatList[bcheck].pCombatants[index].eTarget < 0)) {
                activeCombatList[bcheck].pCombatants[index].eTarget = 0;
              }
              else if(activeCombatList[bcheck].pCombatants[index].aTarget > (activeCombatList[bcheck].pCombatants.length-1) || activeCombatList[bcheck].pCombatants[index].aTarget < 0) {
                activeCombatList[bcheck].pCombatants[index].aTarget = 0;
              }

              if((techList[activeCombatList[bcheck].pCombatants[index].techniques[i.values[0]]].techType === "Strike" 
                || techList[activeCombatList[bcheck].pCombatants[index].techniques[i.values[0]]].techType === "Ki"
                || techList[activeCombatList[bcheck].pCombatants[index].techniques[i.values[0]]].techType === "Debuff") 
                && activeCombatList[bcheck].NPCombatants[activeCombatList[bcheck].pCombatants[index].eTarget].battleCurrAtt.health <= 0) {
                let npchar = activeCombatList[bcheck].pCombatants[index];
                while((npchar.eTarget < 0 || npchar.eTarget > (activeCombatList[bcheck].NPCombatants.length-1) || activeCombatList[bcheck].NPCombatants[npchar.eTarget].battleCurrAtt.health <= 0)) {
                  if(npchar.eTarget > (activeCombatList[bcheck].NPCombatants.length-1) || npchar.eTarget < 0) npchar.eTarget = 0;
                  else npchar.eTarget++;
                }
              }
              else if(activeCombatList[bcheck].pCombatants[index].battleCurrAtt.health <= 0) {
                let npchar = activeCombatList[bcheck].pCombatants[index];
                while((npchar.aTarget < 0 || npchar.aTarget > (activeCombatList[bcheck].pCombatants.length-1) || activeCombatList[bcheck].pCombatants[npchar.aTarget].battleCurrAtt.health <= 0)) {
                  if(npchar.aTarget > (activeCombatList[bcheck].pCombatants.length-1) || npchar.aTarget < 0) npchar.aTarget = 0;
                  else npchar.aTarget++;
                }
              }

              if(activeCombatList[bcheck].pCombatants[index].techCooldowns[i.values[0]] != 0) {
                message.delete();
                battlePrint(pcOrNPC, ID, placement, battleEnd);
                msg.channel.send("Skill on cooldown.");
                return;
              }


              if(activeCombatList[bcheck].pCombatants[index].battleCurrAtt.charge <= 0) activeCombatList[bcheck].pCombatants[index].isCharging = 0;

              let costMod = Math.round((activeCombatList[bcheck].pCombatants[index].battleCurrAtt.stotal + activeCombatList[bcheck].pCombatants[index].level)/2);
              if(activeCombatList[bcheck].pCombatants[index].battleCurrAtt.health <= techList[activeCombatList[bcheck].pCombatants[index].techniques[i.values[0]]].healthCost*costMod ||
                 activeCombatList[bcheck].pCombatants[index].battleCurrAtt.energy < techList[activeCombatList[bcheck].pCombatants[index].techniques[i.values[0]]].energyCost*costMod ||
                 activeCombatList[bcheck].pCombatants[index].battleCurrAtt.charge 
                 < Math.round(activeCombatList[bcheck].pCombatants[index].battleMaxAtt.charge * 0.2 * activeCombatList[bcheck].pCombatants[index].isCharging * techList[activeCombatList[bcheck].pCombatants[index].techniques[i.values[0]]].allowCharge)) {
                message.delete();
                battlePrint(pcOrNPC, ID, placement, battleEnd);
                msg.channel.send("You don't have the resources for this technique.");
                return;
              }

              activeCombatList[bcheck].pCombatants[index].techCooldowns[i.values[0]] = techList[activeCombatList[bcheck].pCombatants[index].techniques[i.values[0]]].coolDown;
              let target;
              let targetI;
              if(techList[activeCombatList[bcheck].pCombatants[index].techniques[i.values[0]]].techType === "Strike" 
                || techList[activeCombatList[bcheck].pCombatants[index].techniques[i.values[0]]].techType === "Ki" 
                || techList[activeCombatList[bcheck].pCombatants[index].techniques[i.values[0]]].techType === "Debuff") {
                targetI = activeCombatList[bcheck].pCombatants[index].eTarget;
                target = activeCombatList[bcheck].NPCombatants[targetI];
              }
              else {
                targetI = activeCombatList[bcheck].pCombatants[index].aTarget;
                target = activeCombatList[bcheck].pCombatants[targetI];
              }

              let action = activeCombatList[bcheck].skill(activeCombatList[bcheck].pCombatants[index],target,techList[activeCombatList[bcheck].pCombatants[index].techniques[i.values[0]]], activeCombatList[bcheck].pCombatants[index].isCharging);
              action.push(index);
              action.push(targetI);
              activeCombatList[bcheck].actions.push(action);

              collector.stop();
              try {
                i.update({ embeds: [embed[0]], components: [] })
                        .then(battleTurn(bcheck));
              } catch (error) { console.error(error); }
            }
          }
        }
        else if(i.customId === 'strike') {
          if(team === 1) {
            let index = 0;
            for(let i = 0; i < activeCombatList[bcheck].NPCombatants.length; i++) {
                if(activeCombatList[bcheck].NPCombatants[i].playerID+activeCombatList[bcheck].NPCombatants[i].name === char.playerID+char.name) {
                index = i;
                break;
              }
            }
            if(activeCombatList[bcheck].NPCombatants[index].eTarget > (activeCombatList[bcheck].pCombatants.length-1) || activeCombatList[bcheck].NPCombatants[index].eTarget < 0) {
                activeCombatList[bcheck].NPCombatants[index].eTarget = 0;
            }
            if(activeCombatList[bcheck].pCombatants[activeCombatList[bcheck].NPCombatants[index].eTarget].battleCurrAtt.health <= 0) {
              let npchar = activeCombatList[bcheck].NPCombatants[index];
              while((npchar.eTarget < 0 || npchar.eTarget > (activeCombatList[bcheck].pCombatants.length-1) || activeCombatList[bcheck].pCombatants[npchar.eTarget].battleCurrAtt.health <= 0)) {
                if(npchar.eTarget > (activeCombatList[bcheck].pCombatants.length-1) || npchar.eTarget < 0) npchar.eTarget = 0;
                else npchar.eTarget++;
              }
            }

            let action = activeCombatList[bcheck].strike(activeCombatList[bcheck].NPCombatants[index],activeCombatList[bcheck].pCombatants[charList[ID].eTarget]);
            action.push(index);
            action.push(activeCombatList[bcheck].NPCombatants[index].eTarget);
            activeCombatList[bcheck].NPCactions.push(action);

            collector.stop();
              try {
                i.update({ embeds: [embed[0]], components: [] })
                        .then(battleTurn(bcheck));
              } catch (error) { console.error(error); }
          }
          else {
            let index = 0;
            for(let i = 0; i < activeCombatList[bcheck].pCombatants.length; i++) {
                if(activeCombatList[bcheck].pCombatants[i].playerID+activeCombatList[bcheck].pCombatants[i].name === char.playerID+char.name) {
                index = i;
                break;
              }
            }
            if(activeCombatList[bcheck].pCombatants[index].eTarget > (activeCombatList[bcheck].NPCombatants.length-1) || activeCombatList[bcheck].pCombatants[index].eTarget < 0) {
                activeCombatList[bcheck].pCombatants[index].eTarget = 0;
            }
            if(activeCombatList[bcheck].NPCombatants[activeCombatList[bcheck].pCombatants[index].eTarget].battleCurrAtt.health <= 0) {
              let npchar = activeCombatList[bcheck].pCombatants[index];
              while((npchar.eTarget < 0 || npchar.eTarget > (activeCombatList[bcheck].NPCombatants.length-1) || activeCombatList[bcheck].NPCombatants[npchar.eTarget].battleCurrAtt.health <= 0)) {
                if(npchar.eTarget > (activeCombatList[bcheck].NPCombatants.length-1) || npchar.eTarget < 0) npchar.eTarget = 0;
                else npchar.eTarget++;
              }
            }

            let action = activeCombatList[bcheck].strike(activeCombatList[bcheck].pCombatants[index],activeCombatList[bcheck].NPCombatants[char.eTarget]);
            action.push(index);
            action.push(activeCombatList[bcheck].pCombatants[index].eTarget);
            activeCombatList[bcheck].actions.push(action);

            collector.stop();
            try {
              i.update({ embeds: [embed[0]], components: [] })
                      .then(battleTurn(bcheck));
            } catch (error) { console.error(error); }
          }
        }
        else if(i.customId === 'burst') {
          if(team === 1) {
            let index = 0;
            for(let i = 0; i < activeCombatList[bcheck].NPCombatants.length; i++) {
                if(activeCombatList[bcheck].NPCombatants[i].playerID+activeCombatList[bcheck].NPCombatants[i].name === char.playerID+char.name) {
                index = i;
                break;
              }
            }
            if(activeCombatList[bcheck].NPCombatants[index].eTarget > (activeCombatList[bcheck].pCombatants.length-1) || activeCombatList[bcheck].NPCombatants[index].eTarget < 0) {
                activeCombatList[bcheck].NPCombatants[index].eTarget = 0;
            }
            if(activeCombatList[bcheck].pCombatants[activeCombatList[bcheck].NPCombatants[index].eTarget].battleCurrAtt.health <= 0) {
              let npchar = activeCombatList[bcheck].NPCombatants[index];
              while((npchar.eTarget < 0 || npchar.eTarget > (activeCombatList[bcheck].pCombatants.length-1) || activeCombatList[bcheck].pCombatants[npchar.eTarget].battleCurrAtt.health <= 0)) {
                if(npchar.eTarget > (activeCombatList[bcheck].pCombatants.length-1) || npchar.eTarget < 0) npchar.eTarget = 0;
                else npchar.eTarget++;
              }
            }

            let action = activeCombatList[bcheck].burst(activeCombatList[bcheck].NPCombatants[index],activeCombatList[bcheck].pCombatants[char.eTarget]);
            action.push(index);
            action.push(activeCombatList[bcheck].NPCombatants[index].eTarget);
            activeCombatList[bcheck].NPCactions.push(action);

            collector.stop();
            try {
              i.update({ embeds: [embed[0]], components: [] })
                      .then(battleTurn(bcheck));
            } catch (error) { console.error(error); }
          }
          else {
            let index = 0;
            for(let i = 0; i < activeCombatList[bcheck].pCombatants.length; i++) {
                if(activeCombatList[bcheck].pCombatants[i].playerID+activeCombatList[bcheck].pCombatants[i].name === char.playerID+char.name) {
                index = i;
                break;
              }
            }
            if(activeCombatList[bcheck].pCombatants[index].eTarget > (activeCombatList[bcheck].NPCombatants.length-1) || activeCombatList[bcheck].pCombatants[index].eTarget < 0) {
                activeCombatList[bcheck].pCombatants[index].eTarget = 0;
            }
            if(activeCombatList[bcheck].NPCombatants[activeCombatList[bcheck].pCombatants[index].eTarget].battleCurrAtt.health <= 0) {
              let npchar = activeCombatList[bcheck].pCombatants[index];
              while((npchar.eTarget < 0 || npchar.eTarget > (activeCombatList[bcheck].NPCombatants.length-1) || activeCombatList[bcheck].NPCombatants[npchar.eTarget].battleCurrAtt.health <= 0)) {
                if(npchar.eTarget > (activeCombatList[bcheck].NPCombatants.length-1) || npchar.eTarget < 0) npchar.eTarget = 0;
                else npchar.eTarget++;
              }
            }

            let action = activeCombatList[bcheck].burst(activeCombatList[bcheck].pCombatants[index],activeCombatList[bcheck].NPCombatants[charList[ID].eTarget]);
            action.push(index);
            action.push(activeCombatList[bcheck].pCombatants[index].eTarget);
            activeCombatList[bcheck].actions.push(action);

            collector.stop();
            try {
              i.update({ embeds: [embed[0]], components: [] })
                      .then(battleTurn(bcheck));
            } catch (error) { console.error(error); }
          }
        }
        else if(i.customId === 'charge') {
          if(team === 1) {
            let index = 0;
            for(let i = 0; i < activeCombatList[bcheck].NPCombatants.length; i++) {
                if(activeCombatList[bcheck].NPCombatants[i].playerID+activeCombatList[bcheck].NPCombatants[i].name === char.playerID+char.name) {
                index = i;
                break;
              }
            }
            let action = activeCombatList[bcheck].charge(activeCombatList[bcheck].NPCombatants[index],activeCombatList[bcheck]);
            action.push(index);
            action.push(-1);
            activeCombatList[bcheck].NPCactions.push(action);

            collector.stop();
            try {
              i.update({ embeds: [embed[0]], components: [] })
                      .then(battleTurn(bcheck));
            } catch (error) { console.error(error); }
          }
          else {
            let index = 0;
            for(let i = 0; i < activeCombatList[bcheck].pCombatants.length; i++) {
                if(activeCombatList[bcheck].pCombatants[i].playerID+activeCombatList[bcheck].pCombatants[i].name === char.playerID+char.name) {
                index = i;
                break;
              }
            }
            let action = activeCombatList[bcheck].charge(activeCombatList[bcheck].pCombatants[index]);
            action.push(index);
            action.push(-1);
            activeCombatList[bcheck].actions.push(action);

            collector.stop();
            try {
              i.update({ embeds: [embed[0]], components: [] })
                      .then(battleTurn(bcheck));
            } catch (error) { console.error(error); }
          }
        }
      });
      collector.on('end', collected => {
      })
    });
  }
  else {
    let char = ID;
    let name = char.name.replace(/\_/g,' ');
    if(char.isTransformed !== -1) {
        if(techList[char.transformation].name == "Potential_Unleashed" || techList[char.transformation].name.search("Saiyan") !== -1) {
          name = techList[char.transformation].name.replace(/\_/g,' ') + ' ' + char.name.replace(/\_/g,' ');
        }
        else name += ', ' + techList[char.transformation].name.replace(/\_/g,' ');
    }

    let currEmbed = new Discord.MessageEmbed(statusEmbed).setTitle(name);
    if(char.image === '' || char.image === null) { currEmbed.setThumbnail(msg.author.avatarURL()); }
    else { currEmbed.setThumbnail(char.image); }

    let team = -5;
    let bcheck = getCurrentBattle(char.playerID, char.name);
    let combatI = activeCombatList[bcheck].pCombatants.map(function(e) { return e.playerID+e.name; }).indexOf(char.playerID+char.name);
    if(combatI === -1) {
      team = 2; //NPC team
    }
    else team = 1; //player team

    if(team == 2 && activeCombatList[bcheck].raid !== 0) {
      currEmbed.setFooter({ text: "Focusing on " + activeCombatList[bcheck].pCombatants[char.threatlist[0][0]].name.replace(/\_/g,' ') });
    }
    else if(activeCombatList[bcheck].raid !== 0) {
      currEmbed.setFooter({ text: "Focusing on " + activeCombatList[bcheck].NPCombatants[char.threatlist[0][0]].name.replace(/\_/g,' ') });
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
      { name: 'Team ' + team.toLocaleString(), value: 'Slot ' + placement.toLocaleString(), inline: true  },

      { name: ':red_circle: Health', value: hpStr, inline: true },
      //{ name: '\u200b', value: '\u200b', inline: true  },
      { name: ':blue_circle: Energy', value: engStr, inline: true },
      { name: ':yellow_circle: Charge', value: chargeStr, inline: true },
    );

    if(activeCombatList[bcheck].raid === 0) {
      let dogiN = "None";
      let weaponN = "None";
      if(char.dogi !== null) dogiN = char.dogi.name.replace(/\_/g,' ');
      if(char.weapon !== null) weaponN = char.weapon.name.replace(/\_/g,' ');
      currEmbed.addFields(
        { name: 'Dogi', value: dogiN, inline: true  },
        { name: 'Weapon', value: weaponN, inline: true  },
        { name: 'Fighting Style', value: char.styleName.replace(/\_/g,' '), inline: true  }
      );
    }

    /*let scaleLvl = Math.round((char.battleCurrAtt.stotal + char.level)/2);
    let str = "";
    if(char.techniques.length >= 1) {
      str = 'Type ' + techList[char.techniques[0]].techType + '\n';
      currEmbed.addField(':one: ' + techList[char.techniques[0]].name.replace(/\_/g,' '), str, true);
    }
    else {
      currEmbed.addField(':one: None', '\u200b', true);
    }
    if(char.techniques.length >= 2) {
      str = 'Type ' + techList[char.techniques[1]].techType + '\n';
      currEmbed.addField(':two: ' + techList[char.techniques[1]].name.replace(/\_/g,' '), str, true);
    }
    else {
      currEmbed.addField(':two: None', '\u200b', true);
    }
    if(char.techniques.length >= 3) {
      str = 'Type ' + techList[char.techniques[2]].techType + '\n';
      currEmbed.addField(':three: ' + techList[char.techniques[2]].name.replace(/\_/g,' '), str, true); 
    }
    else {
      currEmbed.addField(':three: None', '\u200b', true);
    }
    if(char.techniques.length >= 4) {
      str = 'Type ' + techList[char.techniques[3]].techType + '\n';
       currEmbed.addField(':four: ' + techList[char.techniques[3]].name.replace(/\_/g,' '), str, true);
    }
    else {
      currEmbed.addField(':four: None', '\u200b', true);
    }
    if(char.techniques.length >= 5) {
      str = 'Type ' + techList[char.techniques[4]].techType + '\n';
       currEmbed.addField(':five: ' + techList[char.techniques[4]].name.replace(/\_/g,' '), str, true);
    }
    else {
      currEmbed.addField(':five: None', '\u200b', true);
    }

    if(char.transformation !== -1) {
      currEmbed.addField('<:t_red:832763572919992390> ' + techList[char.transformation].name.replace(/\_/g,' '), str, true);
    }
    else {
      currEmbed.addField('<:t_red:832763572919992390> None', '\u200b', true);
    }*/

    msg.channel.send({ embeds: [currEmbed] });
  }
}

  function findID(ID) {
    ID = ID.replace("<","");
    ID = ID.replace("@","");
    ID = ID.replace(">","");
    let index = -1;
    index = getCharListIndex(ID);
    if(index === null) return -1;
    else index = users[index].getCurrentChar();
    return index;
  }

  function getCharList(ID) {
    ID = ID.replace("<","");
    ID = ID.replace("@","");
    ID = ID.replace(">","");
    if(isNaN(ID)) return null;
    for(let i = 0; i < users.length; i++) {
      if(ID === users[i].userID)
      {
        return users[i];
      }
    }

    if(ID !== 'NPC' && ID !== 'Random') msg.channel.send('No characters associated with that ID.')
    return null;
  }

  function getCharListIndex(ID) {
    ID = ID.replace("<","");
    ID = ID.replace("@","");
    ID = ID.replace(">","");
    if(isNaN(ID)) return null;
    for(let i = 0; i < users.length; i++) {
      if(ID === users[i].userID)
      {
        return i;
      }
    }

    if(ID !== 'NPC' && ID !== 'Random') msg.channel.send('No characters associated with that ID.')
    return null;
  }

  function findNPCID(ID) {
    let index = -1;
    for(let i = 0; i < npcList.length; i++) {
      if(ID.toLowerCase() === npcList[i].name.toLowerCase())
      {
        index = i;
        break;
      }
    }
    if(index === -1) {
      if(ID !== 'NPC' && ID !== 'Random') msg.channel.send('No NPC associated with that name.')
    }
    return index;
  }

})

function startTraining(char, player) {
  if(char.trainingType === 'xp') {
    setInterval(function() {
      if(char.training > 0) {
        char.training--;
        let xp = calcXPTrainingGain(char, player);
        if(player.trainingLog.length < 2000) {
          player.trainingLog += '\n**' + char.name.replace(/\_/g,' ') + '** has gained ' + xp.toLocaleString(undefined) + ' exp.'
          player.trainingLog += char.addEXP(xp);
        }
        else char.addEXP(xp);
        loader.characterSaver(charList);
        loader.userSaver(users);
      }
      if(char.training <= 0) {
        clearInterval(this);
      }
    }, 1000*60*60) //*60*60
    //1000 miliseconds * 60 seconds * 60 minutes => 1 hour 
  }
  else if(char.trainingType === 'txp') {
    setInterval(function() {
      if(char.training > 0) {
        char.training--;
        let xp = calcTXPTrainingGain(char, player);
        if(player.trainingLog.length < 2000) {
          player.trainingLog += '\n**' + char.name.replace(/\_/g,' ') + '** has gained ' + xp.toLocaleString(undefined) + ' exp.'
          player.trainingLog += char.addEXP(xp);
        }
        else char.addEXP(xp);
        loader.characterSaver(charList);
        loader.userSaver(users);
      }
      if(char.training <= 0) {
        clearInterval(this);
      }
    }, 1000*60*60) //*60*60
    //1000 miliseconds * 60 seconds * 60 minutes => 1 hour 
  }
  else {
    setInterval(function() {
      if(char.training > 0) {
        char.training--;
        let tp = calcTPTrainingGain(char, player);
        if(player.trainingLog.length < 2000) {
          player.trainingLog += '\n**' + char.name.replace(/\_/g,' ') + '** has gained ' + tp.toLocaleString(undefined) + ' technique points.'
        }
        char.techniquePoints += tp;
        loader.characterSaver(charList);
        loader.userSaver(users);
      }
      if(char.training <= 0) {
        clearInterval(this);
      }
    }, 1000*60*60) //*60*60
    //1000 miliseconds * 60 seconds * 60 minutes => 1 hour 
  }
}

function calcNPCTrainingGain(char) {
  let highest = char.attributes.stotal*statEXP+char.level*levelEXP;
  let xp = 1+Math.round(trainingModifier * highest / 4);

  return Math.floor(xp);
}

function calcXPTrainingGain(char, user) {
  let highest = 0;
  for(let i = 0; i < user.charIDs.length; i++) {
    let value = charList[user.charIDs[i]].attributes.stotal*statEXP+charList[user.charIDs[i]].level*levelEXP;
    if(value >= highest) {
      highest = value;
    }
  }
  let xp = 1+Math.round(trainingModifier * highest);
  if(char.level >= trainingSoftCap) {
    xp = 1 + Math.round(char.level * trainingModifier)
  }
  if(user.dojo !== null && char.styleName === user.dojo.guildStyle) {
    xp *= 1.25;
  }
  else if(user.dojo !== null) {
    xp *= 1.15;
  }

  return Math.floor(xp);
}

function calcTXPTrainingGain(char, user) {
  let highest = 0;
  for(let i = 0; i < user.charIDs.length; i++) {
    let value = charList[user.charIDs[i]].attributes.stotal*statEXP+charList[user.charIDs[i]].level*levelEXP;
    if(value >= highest) {
      highest = value;
    }
  }
  let xp = 1+Math.round(trainingModifier * highest / 1.5);
  if(char.level >= trainingSoftCap) {
    xp = 1 + Math.round(char.level * trainingModifier / 1.5)
  }
  if(user.dojo !== null && char.styleName === user.dojo.guildStyle) {
    xp *= 1.25;
  }
  else if(user.dojo !== null) {
    xp *= 1.15;
  }

  return Math.floor(xp);
}

function calcTPTrainingGain(char, user) {
  let highest = 30;
  for(let i = 0; i < user.charIDs.length; i++) {
    if(charList[user.charIDs[i]].fightingStyle == null) continue;
    let value = charList[user.charIDs[i]].fightingStyle.getTotalChange();
    if(value >= highest) {
      highest = value;
    }
  }
  let tp = 1+Math.round(trainingModifier * highest / 1.5);
  if(user.dojo !== null && char.styleName === user.dojo.guildStyle) {
    tp *= 1.25;
  }
  else if(user.dojo !== null) {
    tp *= 1.15;
  }

  return Math.floor(tp);
}

