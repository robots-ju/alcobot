const Command = require('./Command');

class CommandManager {
    constructor() {
        this.counter = 0;
    }

    createCommand(args) {
        args.messageCounter = ++this.counter;

        return new Command(args);
    }

    parseResponse(buffer) {
        return new Command({
            data: buffer,
        });
    }

    // Thanks to https://siouxnetontrack.wordpress.com/2013/09/27/connecting-the-pc-to-our-ev3/
    createMailboxCommand(mailboxName, payload) {
        // add null bytes if necessary
        if (mailboxName.charCodeAt(mailboxName.length - 1) !== 0) {
            mailboxName += '\0';
        }

        const mailboxNameLength = mailboxName.length;

        let payloadBytes = 0;
        switch (typeof payload) {
            case 'string':
                if (payload.charCodeAt(payload.length - 1) !== 0) {
                    payload += '\0';
                }

                payloadBytes = payload.length;
                break;
            case 'number':
                payloadBytes = 4;
                break;
            case 'boolean':
                payloadBytes = 1;
                break;
            default:
                throw 'Unhandled payload type ' + (typeof payload);
        }

        const MAILBOX_NAME_LENGTH_BYTES = 1;
        const PAYLOAD_LENGTH_BYTES = 2;

        const bufferLength = MAILBOX_NAME_LENGTH_BYTES + PAYLOAD_LENGTH_BYTES + mailboxNameLength + payloadBytes;

        const buffer = Buffer.alloc(bufferLength);

        // mailbox length
        buffer.writeUIntLE(mailboxNameLength, 0, MAILBOX_NAME_LENGTH_BYTES);
        // mailbox
        buffer.write(mailboxName, MAILBOX_NAME_LENGTH_BYTES, mailboxNameLength);
        // payload length
        buffer.writeUIntLE(payloadBytes, MAILBOX_NAME_LENGTH_BYTES + mailboxNameLength, PAYLOAD_LENGTH_BYTES);
        // payload
        const payloadIndexStart = MAILBOX_NAME_LENGTH_BYTES + PAYLOAD_LENGTH_BYTES + mailboxNameLength;
        switch (typeof payload) {
            case 'string':
                buffer.write(payload, payloadIndexStart, payloadBytes);
                break;
            case 'number':
                buffer.writeFloatLE(payload, payloadIndexStart);
                break;
            case 'boolean':
                // true is sent as 1, false as 0
                buffer.writeUIntLE(payload ? 1 : 0, payloadIndexStart, payloadBytes);
                break;
        }

        return this.createCommand({
            commandType: Command.SYSTEM_COMMAND_NO_REPLY,
            systemCommand: Command.WRITEMAILBOX,
            data: buffer,
        });
    }

    readMailboxResponse(response) {
        const buffer = response.buffer;
        const mailBoxNameLength = buffer.readUIntLE(6, 1);
        const mailBoxName = buffer.toString('ascii', 7, 6 + mailBoxNameLength); // without null byte
        const payloadLength = buffer.readUIntLE(7 + mailBoxNameLength, 2);

        const payloadIndexStart = 9 + mailBoxNameLength;
        let payload = null;

        if (payloadLength === 1) {
            // type boolean is a single byte, 1=true, 0=false
            payload = !!buffer.readUIntLE(payloadIndexStart, 1);
        } else if (payloadLength === 4 && buffer.toString()) {
            // type number is a float on 4 bytes
            payload = buffer.readFloatLE(payloadIndexStart);
        } else {
            // default type is string
            payload = buffer.toString('ascii', payloadIndexStart, payloadIndexStart + payloadLength);

            // remove ending null byte
            if (payload.chatCodeAt(payload.length - 1) === 0) {
                payload = payload.substr(0, payload.length - 1);
            }
        }

        return {
            response,
            mailBoxName,
            payload,
        };
    }

    createFileReadCommand(path) {
        if (path.charCodeAt(path.length - 1) !== 0) {
            path += '\0';
        }

        const MAX_BYTES_LENGTH = 2;
        const data = Buffer.alloc(MAX_BYTES_LENGTH + path.length);
        data.writeUIntLE(1024, 0, MAX_BYTES_LENGTH);
        data.write(path, MAX_BYTES_LENGTH, path.length);

        return this.createCommand({
            commandType: Command.SYSTEM_COMMAND_REPLY,
            systemCommand: Command.BEGIN_GETFILE,
            data,
        });
    }

    readFileContentResponse(response) {
        const returnStatus = response.buffer.readUIntLE(6, 1);
        const fileSize = response.buffer.readUIntLE(7, 4);
        const handle = response.buffer.readUIntLE(11, 1);
        const payload = response.buffer.toString('ascii', 12);

        return {
            response,
            returnStatus,
            fileSize,
            handle,
            payload,
        };
    }
}

module.exports = CommandManager;
