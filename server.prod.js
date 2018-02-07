/**
 * @file server.prod.js
 * @author lavas
 */

const LavasCore = require('lavas-core-vue');
const stoppable = require('stoppable');
const express = require('express');
const app = express();

let port = process.env.PORT || 3000;

let core = new LavasCore(__dirname);

let io;
let fs = require("fs");
let networkfile = '/proc/net/dev';
var networkinfo = fs.readFileSync(networkfile);
var networkinfoarr = networkinfo.toString().match(/wlp7s0: (.*)/)[1].split(/ +/);
var networkTime = Date.now();
let date;
var networkcardname = 'wlp7s0'

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
        networkinfoarr = networkinfo.toString().match(/wlp7s0: (.*)/)[1].split(/ +/);
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
    setTimeout(getNetworkInfo, 1000);
}

getNetworkInfo();

core.init(process.env.NODE_ENV || 'production')
    .then(() => core.runAfterBuild())
    .then(() => {
        app.use(core.expressMiddleware());
        // app.listen(port, () => {
        //     console.log('server started at localhost:' + port);
        // });

        //start socket.io
        // var server = http.createServer(app);
        server = stoppable(app.listen(port, () => {
            console.log('server started at localhost:' + port);
        }));
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
    }).catch(err => {
        console.log(err);
    });

// catch promise error
process.on('unhandledRejection', (err, promise) => {
    console.log('in unhandledRejection');
    console.log(err);
    // cannot redirect without ctx!
});
