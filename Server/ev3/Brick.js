const net = require('net');
const dgram = require('dgram');
const events = require('events');
const Command = require('./Command');
const CommandManager = require('./CommandManager');

class Brick extends events.EventEmitter {
    constructor({
        serialNumber,
        port,
        udpPort,
        name,
        protocol,
        ip,
    }) {
        super();

        this.serialNumber = serialNumber;
        this.port = port;
        this.udpPort = udpPort;
        this.name = name;
        this.protocol = protocol;
        this.ip = ip;

        this.socket = null;
        this.ready = false;

        this.commands = new CommandManager();
    }

    connect() {
        const socket = net.createConnection(this.port, this.ip);

        socket.on('connect', () => {
            this.emit('connect');

            this.sendUnlockMessage();
        });

        socket.on('end', () => {
            console.log('EV3 Brick socket ended');

            this.ready = false;
        });

        socket.on('error', error => {
            console.log(`EV3 Brick socket error:\n${error.stack}`);
        });

        socket.on('data', buffer => {
            console.log('EV3 Brick data', buffer, buffer.toString());

            if (buffer.toString().indexOf('Accept:EV340') === 0) {
                console.log('EV3 Brick unlocked');

                this.ready = true;

                this.emit('ready');
            } else if (buffer.length > 5) {
                const response = this.commands.parseResponse(buffer);

                switch (true) {
                    case response.replyType() === Command.SYSTEM_REPLY_ERROR:
                        let errors = {};
                        errors[Command.UNKNOWN_HANDLE] = 'Unknown handle';
                        errors[Command.HANDLE_NOT_READY] = 'Handle not ready';
                        errors[Command.CORRUPT_FILE] = 'Corrupt file';
                        errors[Command.NO_HANDLES_AVAILABLE] = 'No handles available';
                        errors[Command.NO_PERMISSION] = 'No permission';
                        errors[Command.ILLEGAL_PATH] = 'Illegal path';
                        errors[Command.FILE_EXITS] = 'File exists';
                        errors[Command.END_OF_FILE] = 'End of file';
                        errors[Command.SIZE_ERROR] = 'Size error';
                        errors[Command.ILLEGAL_FILENAME] = 'Illegal filename';
                        errors[Command.ILLEGAL_CONNECTION] = 'Illegal connection';

                        console.error('Reply error (' + errors[response.replyError()] + ')', response);

                        break;
                    case response.commandType() === Command.SYSTEM_COMMAND_NO_REPLY && response.systemCommand() === Command.WRITEMAILBOX:
                        const message = this.commands.readMailboxResponse(response);

                        console.log('Got mailbox message');

                        this.emit('receiveMailbox', message);

                        break;
                    case response.replyType() === Command.SYSTEM_REPLY && response.systemCommand() === Command.BEGIN_GETFILE:
                    case response.replyType() === Command.SYSTEM_REPLY && response.systemCommand() === Command.CONTINUE_GETFILE:
                        console.log('Got file content response');

                        this.emit('fileContent', this.commands.readFileContentResponse(response));

                        break;
                    default:
                        console.error('Unhandled response', response);
                }
            } else {
                console.error('Invalid buffer size', buffer);
            }
        });

        this.socket = socket;
    }

    sendUnlockMessage() {
        // based on http://www.monobrick.dk/guides/how-to-establish-a-wifi-connection-with-the-ev3-brick/
        console.log('EV3 Brick: sending wakeup message');
        const client = dgram.createSocket('udp4');

        client.send('1', this.udpPort, this.ip, () => {
            console.log('EV3 Brick: sending unlock message');
            this.socket.write(Buffer.from('GET /target?sn=' + this.serialNumber + ' VMTP1.0\r\nProtocol: EV3'));
        });
    }

    sendCommand(command) {
        this.socket.write(command.buffer);
    }

    sendMailboxMessage(mailboxName, payload) {
        console.log('Sending mailbox message', mailboxName, payload);

        this.sendCommand(this.commands.createMailboxCommand(mailboxName, payload));
    }

    readFile(path) {
        console.log('Sending file read command', path);

        this.sendCommand(this.commands.createFileReadCommand(path));
    }
}

module.exports = Brick;
