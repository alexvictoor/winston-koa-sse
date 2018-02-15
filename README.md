# winston-koa-transport

A winston transport for KOA applications that streams logs to your browser leveraging SSE

## Installation
``` bash
  $ npm install winston-koa-sse

  or

  $ yarn add winston-koa-sse
```

## Usage
On the server-side:

``` js
  import winston from 'winston';
  import Koa from 'koa';
  import KoaRouter from 'koa-router';
  import { KoaSseMiddleware, KoaSseTransport } from 'winston-koa-sse';

  // Adds the transport to winston
  winston.add(KoaSseTransport);

  // Plug logs stream on route /logs
  const router = new KoaRouter();
  router.get('/logs', KoaSseMiddleware);

```

On the browser-side you need to consume logs using an EventSource object. Below a script that you can include in your page, assuming your node server is reachable at URl http://localhost:3000 :

``` js
    const streamUrl = 'http://localhost:3000';
    const source = new EventSource(streamUrl); 
    
    const levels = ['debug', 'info', 'warn', 'error', 'fatal'];
    levels.forEach(level => {
        source.addEventListener(level, function(event) {
            console[level](event.data);
        });
    });

```

You can also use a bookmarklet to execute this script. Below the same script in a bookmarklet flavor:
``` js
javascript: (function(){const streamUrl = 'http://localhost:3000'; const source = new EventSource(streamUrl); const levels = ['debug', 'info', 'warn', 'error', 'fatal']; levels.forEach(level => { source.addEventListener(level, function(event) { console[level](event.data); }); });})();

```

## Disclaimer

1. For obvious security concerns, **do not activate it in production!**  
2. This is a first basic not opimized implementation, no batching of log messages, etc
