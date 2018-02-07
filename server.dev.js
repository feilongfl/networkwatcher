/**
 * @file server.dev.js
 * @author lavas
 */

'use strict';

const LavasCore = require('lavas-core-vue');
const express = require('express');
const stoppable = require('stoppable');
const proxy = require('http-proxy-middleware');


let configPath = './lavas.config.js';
// fix https://github.com/lavas-project/lavas/issues/50
if (process.argv.length >= 3 && process.argv[2] !== 'dev') {
    configPath = process.argv[2];
}

/**
 * API Proxy Configuration
 *
 * @see https://github.com/chimurai/http-proxy-middleware
 * @type {Object}
 */
const proxyTable = {
    // proxy table example
    // '/api': {
    //     target: 'https://lavas.baidu.com',
    //     changeOrigin: true
    // }
};

let port = process.env.PORT || 3000;
let core = new LavasCore(__dirname);
let app;
let server;
let io;

let fs = require("fs");
let networkfile = '/proc/net/dev';
var networkinfo = fs.readFileSync(networkfile);
var networkinfoarr = networkinfo.toString().match(/eth0: (.*)/)[1].split(/ +/);
var networkTime = Date.now();
let date;
var networkcardname = 'eth0'

var networkUploadSumLast = networkinfoarr[8];
var networkDownloadSumLast = networkinfoarr[0];

var upSum = 0;
var upSpeed = 0;
var downSum = 0;
var downSpeed = 0;
function getNetworkInfo() {
    let time;

    fs.readFile(networkfile, function(err, data) {
        if (err) {
            return console.error(err);
        }

        //cat info to array
        networkinfoarr = networkinfo.toString().match(/eth0: (.*)/)[1].split(/ +/);
        // console.log(networkTime);
        //calc log time
        date = new Date(Date.now() - networkTime);
        time = date.getMilliseconds() / 1000 + date.getSeconds();
        //save info time
        networkTime = Date.now();
        // console.log(time);

        //calc network info
        if (time > 0) {
            upSum = networkinfoarr[8];
            upSpeed = (upSum - networkUploadSumLast) / time;
            downSum = networkinfoarr[0];
            downSpeed = (downSum - networkDownloadSumLast) / time;
            //showLog
            // console.log('info => ' + upSum / (1024*1024*1024) + '\t' + upSpeed / (1024) + '\t' + downSum / (1024*1024*1024) + '\t' + downSpeed / (1024));
            // console.log('info => ' + upSum + '\t' + upSpeed + '\t' + downSum + '\t' + downSpeed);
            //save data
            networkUploadSumLast = networkinfoarr[8];
            networkDownloadSumLast = networkinfoarr[0];
        }
        networkinfo = data;
    });
    setTimeout(getNetworkInfo,1000);
}

getNetworkInfo();

/**
 * start dev server
 */
function startDevServer() {
    app = express();
    core.build()
        .then(() => {
            // API Proxying during development
            Object.keys(proxyTable).forEach(pattern => {
                app.use(pattern, proxy(proxyTable[pattern]));
            });

            app.use(core.expressMiddleware());

            /**
             * server.close() only stop accepting new connections,
             * we need to close existing connections with help of stoppable
             */
            server = stoppable(app.listen(port, () => {
                console.log('server started at localhost:' + port);
            }));

            //start socket.io
            io = require('socket.io').listen(server);

            io.sockets.on('connection', function(socket) {
                socket.on('heartMsg', function(data) {
                    socket.emit('networkMsg', {
                        upSpeed: upSpeed,
                        upSum: upSum,
                        downSpeed: downSpeed,
                        downSum: downSum
                    });
                    // console.log(data);
                });

                socket.on('ready', function(data) {
                    socket.emit('ready', 'pong');
                    console.log('ping');
                });
            });
        })
        .catch(err => {
            console.log(err);
        });
}

let config;

// fix https://github.com/lavas-project/lavas/issues/50
if (process.argv.length >= 3 && process.argv[2] !== 'dev') {
    config = process.argv[2];
}

/**
 * every time lavas rebuild, stop current server first and restart
 */
core.on('rebuild', () => {
    core.close().then(() => {
        server.stop();
        startDevServer();
    });
});

core.init(process.env.NODE_ENV || 'development', true, {
        configPath
    })
    .then(() => startDevServer());

// catch promise error
process.on('unhandledRejection', err => {
    console.warn(err);
});
