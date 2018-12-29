const dgram = require('dgram');
const events = require('events');
const Brick = require('./Brick');

class Manager extends events.EventEmitter {
    constructor() {
        super();

        this.socket = dgram.createSocket('udp4');
        this.bricks = [];

        this.socket.on('error', (err) => {
            console.log(`EV3 Manager socket error:\n${err.stack}`);
            server.close();
        });

        this.socket.on('message', (message, rinfo) => {
            //console.log(`EV3 Manager message: ${message} from ${rinfo.address}:${rinfo.port}`);
            this.handleMessage(message, rinfo);
        });

        this.socket.on('listening', () => {
            const address = this.socket.address();
            console.log(`EV3 Manager listening ${address.address}:${address.port}`);
        });
    }

    bind() {
        this.socket.bind(3015);
    }

    handleMessage(message, info) {
        const definition = {
            ip: info.address,
            udpPort: info.port,
        };

        message.toString().split('\r\n').forEach(line => {
            const parts = line.split(': ');

            switch (parts[0]) {
                case 'Serial-Number':
                    definition.serialNumber = parts[1];
                    break;
                case 'Port':
                    definition.port = parts[1];
                    break;
                case 'Name':
                    definition.name = parts[1];
                    break;
                case 'Protocol':
                    definition.protocol = parts[1];
                    break;
            }
        });

        this.addBrick(definition);
    }

    addBrick(definition) {
        // Si le numéro de série existe déjà sur une brique connue on ne l'ajoute pas à nouveau
        if (this.bricks.some(brick => brick.serialNumber === definition.serialNumber)) {
            return;
        }

        const brick = new Brick(definition);

        console.log('EV3 Manager found brick', brick);
        this.bricks.push(brick);

        this.emit('foundBrick', brick);
    }
}

module.exports = Manager;
