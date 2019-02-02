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
    listeDesCommande.push(new Commande(boisson, boisson));
    sendCommande(listeDesCommande[0].typeDeBoisson);
    listeDesCommande[0].etat = 'wait';
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
let numberOfRobot = 1;

// Les noms de brique se passent en arguments
const allowedBrickNames = process.argv.slice(2);

//Tableau des briques connecté
const availableBricks = [];

//Créations du manager
const manager = new Manager();
manager.bind();

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
  brick.on('fileContent', file => {
    brick.ready = !!(file.payload.split('\r')[0]);
});
});

function convertBoissonToNumber(boisson) {
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

function sendCommande(boisson) {
  if (availableBricks.length > 0) {
    let robotFind = findNextRobot(nextRobot);
    if (robotFind) {
      robotFind.sendMailboxMessage('command', convertBoissonToNumber(boisson));
      if (nextRobot < numberOfRobot) {
        nextRobot++;
      }
      else {
        nextRobot = 1;
      }
    }
    else {
      console.log('Le robot qui devait recevoir la commande n\'est pas connecté');
    }

  }

}

function findNextRobot(robotNumber) {
  robotName = 'Alcobot' + robotNumber;
  console.log(robotName);
  return availableBricks.find(
    (robot) => {
      return robot.name === robotName;
    });
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
/*
while (true) {
  if (availableBricks <= 0) {
    continue;
  }
  if (listeDesCommande <= 0) {
    console.log('Robot connecté mais pas de commande');  
    continue;
  }
  let command = listeDesCommande.find(
    (com) => {
      return com.etat === 'wait';
    })
  let robot = findNextRobot();
  while (!robot.ready) {
    let isReadyInterval = setInterval(
      () => {
        robot.readFile('../prjs/Alcobot/ready.rtf');
      }, 5000);
  }
  clearInterval(isReadyInterval);
  robot.sendMailboxMessage('command', convertBoissonToNumber(boisson));
  command.etat = 'progress';
  if (nextRobot < numberOfRobot) {
    nextRobot++;
  }
  else {
    nextRobot = 1;
  }
  
}*/