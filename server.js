const fetch                                 = require('node-fetch');
const cpus                                  = require('os').cpus();
const cluster                               = require('cluster');
const { TextEncoder, TextDecoder }          = require('text-encoding');
const url                                   = require('url');
const fs                                    = require('fs'); 
const HttpsProxyAgent                       = require('https-proxy-agent');
const SocksProxyAgent                       = require('socks-proxy-agent');
const cloudscraper                          = require('cloudscraper');
const express                               = require("express");

const app       = express(); 
const nodeType  = (cluster.isMaster) ? 'Master' : 'Worker';

const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json())


if (cluster.isMaster) {
    for (let i = 0; i < (cpus.length * 1.0); i++) {
        cluster.fork();
    }; 
    cluster.on('exit', (worker, code, signal) => {
        console.log('Worker #' + worker.process.pid, 'exited');
        cluster.fork();
    }); 
} else {

    app.get("/", (req, res) => {
        res.setHeader('Content-Type', 'text/html');
        res.write("<html>"); 
        res.write("<head>"); 
        res.write(`<title>now-express</title>`); 
        res.write("</head>"); 
        res.write("<body>"); 
        res.write(`<h1>now-express ${ process.pid }</h1>`); 
        res.write("</body>"); 
        res.write("<html>"); 
        res.end(); 
    });
    
    app.post("/v1/chain/push_transaction/:protocol/:ippool", (req, res) => {
        cloudscraper({
            method             : 'POST',
            headers            : {
                "accept"              : "*/*",
                "accept-language"     : "en-US,en;q=0.9",
                "content-type"        : "text/plain;charset=UTF-8",
                'origin'              : 'https://play.alienworlds.io',
                'referer'             : 'https://play.alienworlds.io/',
            },
            url                : 'https://aw-guard.yeomen.ai/v1/chain/push_transaction',
            body               : JSON.stringify(req.body), 
            referrer           : "https://play.alienworlds.io/", 
            proxy              : `${ req.params.protocol }://${ req.params.ippool }`
        }).then(result => {
            console.log( result ); 
            res.setHeader('Content-Type', 'application/json'); 
            res.end(result); 
        }).catch(err => {
            console.log( err ); 
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify( err )); 
        });
    });
    
    app.get("/trace", (req, res) => {
        fetch(
            'https://www.cloudflare.com/cdn-cgi/trace'
        ).then(
            result => result.text()
        ).then(result => {
            console.log(result)
            res.setHeader('Content-Type', 'text/html');
            res.write("<html>"); 
            res.write("<head>"); 
            res.write("<title>trace</title>"); 
            res.write("</head>"); 
            res.write("<body>"); 
            res.write(`<pre>${ result }</pre>`); 
            res.write("</body>"); 
            res.write("<html>"); 
            res.end(); 
        });
    });
    
    // Listen on port 5000
    app.listen(port, () => {
        console.log(`Server is booming on port 5000 Visit http://localhost:${port}`);
    }); 
    
}; 

console.log(nodeType + ' #' + process.pid, 'is running');
