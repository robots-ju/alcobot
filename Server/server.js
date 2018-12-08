const http = require('http');
const hostname = '127.0.0.1';
const port = 3000;

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
    listeDesCommande.push(new Commande(boisson));
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