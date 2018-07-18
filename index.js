const winston = require('winston');
const Koa = require('koa');
const util = require('util');
const PassThrough = require('stream').PassThrough;

const sse = (type, msg) => {
    const multiLineMsg = msg.split('\n').join('\ndata: ');
    return `event: ${ type }\ndata: ${ multiLineMsg }\n\n`
}

let connectionStreams = []; 
const stream = new PassThrough();
const send = (type, msg) => {
    const sseEvent = sse(type, msg);
    const healthyStreams = [];
    const nbStreams = connectionStreams.length;
    let writeDone = 0; 
    connectionStreams.forEach(stream => {
        if (stream.closed) {
            stream.removeAllListeners();
            writeDone++;
            return;
        }
        stream.write(sseEvent, (error) => {
            writeDone++;
            if (!error) {
                healthyStreams.push(stream);
            }
            if (writeDone === nbStreams) {
                connectionStreams = healthyStreams;
            }
        });
    });
}

class KoaSseTransport {
    /**
     * Core logging method exposed to Winston. Metadata is optional.
     * @function log
     * @param level {string} Level at which to log the message.
     * @param msg {string} Message to log.
     * @param meta {?Object} Additional metadata to attach.
     * @param callback {function} Continuation to respond to when complete.
     */
    log(level, msg, meta, callback) {
        send(level, msg);
        callback();
    }
}

util.inherits(KoaSseTransport, winston.Transport);


const middleware = ctx => {
    ctx.type = "text/event-stream";
    ctx.set("Cache-Control", "no-cache");
    ctx.set("Connection", "keep-alive");
    ctx.set("Access-Control-Allow-Origin", "*");
    const stream = new PassThrough();
    stream.on('close', () => {
        stream.closed = true; 
    });
    stream.write(
        sse("info", 'Connected successfully on LOG stream')
    );
    connectionStreams.push(stream);
    ctx.body = stream;
}

//Define as a property of winston transports for backward compatibility
winston.transports.KoaSseTransport = KoaSseTransport;
module.exports = KoaSseTransport;
//The rest of winston transports uses (module).name convention
//Create a field to allow consumers to interact in the same way
module.exports.KoaSseTransport = KoaSseTransport;

module.exports.KoaSseMiddleware = middleware;
