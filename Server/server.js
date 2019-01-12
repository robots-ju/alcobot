const http = require('http');
const hostname = '127.0.0.1';
const port = 3000;
const Manager = require('./ev3/BrickManager');

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Ceci est la page du server ;)\n');
});
const io = require('socket.io')(server);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

io.on('connection', function (socket) {
  socket.emit('ready', 'ready');
  socket.on('my other event', function (data) {
    console.log(data);
  });
  socket.on('commandes', function (boisson) {
    console.log(boisson)
    sendCommande(boisson);
    listeDesCommande.push(new Commande(boisson, boisson));
    console.log(listeDesCommande);
    io.emit('listeCommandes', listeDesCommande);
    socket.emit('confirmation', lastNumberCommande);

  })
});

class Commande {
  constructor(typeDeBoisson) {
    this.typeDeBoisson = typeDeBoisson;
    this.number = ++lastNumberCommande;
    this.etat = 'wait';
  }
}
let lastNumberCommande = 0;
let listeDesCommande = [];

//robotique//

let nextRobot = 1;
let numberOfRobot = 2;

// Les noms de brique se passent en arguments
const allowedBrickNames = process.argv.slice(2);

//Tableau des briques connecté
const availableBricks = [];

//Créations du manager
const manager = new Manager();
manager.bind();

function indexFromBrickName(name) {
  return availableBricks.findIndex(brick => brick.name === name);
}

manager.on('foundBrick', brick => {
  if (allowedBrickNames.indexOf(brick.name) === -1) {
    console.info('Détecté la brique ' + brick.name + ' mais elle n\'est pas whitelistée. Pas connecté.');

    return;
  }

  console.log("Hey, j'ai vu cette brique: " + brick.name);

  brick.connect();

  brick.on('ready', () => {
    console.log('Nouvelle brique connectée. Liste des briques:');

    availableBricks.push(brick);

    availableBricks.forEach((brick, index) => {
      console.log('#' + (index + 1) + ' - Nom: ' + brick.name + ' - SN: ' + brick.serialNumber);
    });
  });
});

function convertBoissonToNumber (boisson) {
  switch (boisson) {
    case 'theFroid':
    return 1;
    case 'eauPlate':
    return 2;
    case 'eauGazeuse': 
    return 3;
    case 'coca':
    return 4;
  }
    
}

function sendCommande (boisson) {
  if(availableBricks.length > 0) {
    let robotFind = findNextRobot(nextRobot);
    if(robotFind) {
      robotFind.sendMailboxMessage('command', convertBoissonToNumber(boisson));
      if(nextRobot < numberOfRobot) {
        nextRobot++;
      }
      else{
        nextRobot = 1;
      }
    }
    else {
      console.log('Le robot qui devait recevoir la commande n\'est pas connecté');
    }
    
  }
  
} 

function findNextRobot (robotNumber) {
  robotName = 'Alcobot' + robotNumber;
  console.log(robotName);
  return availableBricks.find(
     (robot) => {
        return robot.name === robotName;
  });
}