const winston = require('winston');
const Koa = require('koa');
const { KoaSseMiddleware, KoaSseTransport } = require('..');

const app = new Koa();
app.use(KoaSseMiddleware);

winston.add(KoaSseTransport);
winston.level = 'debug';

let i = 0;
setInterval(() => {
    winston.error("one error log", i++);
    winston.info("info is good as well", i);
    winston.debug("debug works too", i);
}, 1000);

app.listen(3000);