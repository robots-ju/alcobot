class Command {
    constructor({
        messageCounter,
        commandType,
        systemCommand,
        data,
    }) {
        if (messageCounter && commandType) {
            let startBufferSize = 5; // 2 for size, 2 for counter, 1 for type

            if (systemCommand) {
                startBufferSize += 1; // 1 for command
            }

            const start = Buffer.alloc(startBufferSize);
            // length
            start.writeUIntLE(startBufferSize + data.length - 2, 0, 2); // Do not count the 2 length bytes
            // counter
            start.writeUIntLE(messageCounter, 2, 2);
            // tt
            start.writeUIntLE(commandType, 4, 1);

            if (systemCommand) {
                // ss
                start.writeUIntLE(systemCommand, 5, 1);
            }

            this.buffer = Buffer.concat([start, data]);
        } else {
            this.buffer = data;
        }
    }

    messageBytes() {
        return this.buffer.readUIntLE(0, 2);
    }

    messageCounter() {
        return this.buffer.readUIntLE(2, 2);
    }

    commandType() {
        return this.buffer.readUIntLE(4, 1);
    }

    systemCommand() {
        return this.buffer.readUIntLE(5, 1);
    }

    replyType() {
        return this.buffer.readUIntLE(4, 1);
    }

    replyStatus() {
        return this.buffer.readUIntLE(5, 1);
    }

    replyError() {
        return this.buffer.readUIntLE(6, 1);
    }
}

// Copied from https://le-www-live-s.legocdn.com/sc/media/files/ev3-developer-kit/lego%20mindstorms%20ev3%20communication%20developer%20kit-f691e7ad1e0c28a4cfb0835993d76ae3.pdf?la=en-us
Command.SYSTEM_COMMAND_REPLY = 0x01;
Command.SYSTEM_COMMAND_NO_REPLY = 0x81;

Command.BEGIN_DOWNLOAD = 0x92;
Command.BEGIN_UPLOAD = 0x93;
Command.BEGIN_UPLOAD = 0x94;
Command.CONTINUE_UPLOAD = 0x95;
Command.BEGIN_GETFILE = 0x96;
Command.CONTINUE_GETFILE = 0x97;
Command.CLOSE_FILEHANDLE = 0x98;
Command.LIST_FILES = 0x99;
Command.CONTINUE_LIST_FILES = 0x9A;
Command.CREATE_DIR = 0x9B;
Command.DELETE_FILE = 0x9C;
Command.LIST_OPEN_HANDLES = 0x9D;
Command.WRITEMAILBOX = 0x9E;
Command.BLUETOOTHPIN = 0x9F;
Command.ENTERFWUPDATE = 0xA0;

Command.SYSTEM_REPLY = 0x03;
Command.SYSTEM_REPLY_ERROR = 0x05;

Command.SUCCESS = 0x00;
Command.UNKNOWN_HANDLE = 0x01;
Command.HANDLE_NOT_READY = 0x02;
Command.CORRUPT_FILE = 0x03;
Command.NO_HANDLES_AVAILABLE = 0x04;
Command.NO_PERMISSION = 0x05;
Command.ILLEGAL_PATH = 0x06;
Command.FILE_EXITS = 0x07;
Command.END_OF_FILE = 0x08;
Command.SIZE_ERROR = 0x09;
Command.UNKNOWN_ERROR = 0x0A;
Command.ILLEGAL_FILENAME = 0x0B;
Command.ILLEGAL_CONNECTION = 0x0C;

module.exports = Command;
