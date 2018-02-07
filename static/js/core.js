// console.log(Date.now())

// if (typeof socket != "undefined") {
//     throw new Error('reinit core js');
// }

var socket = io(window.location.origin);
var datasumcanvas;
var datadetialcanvas;
var dataspeedcanvas;
var nowspeedcanvas;

var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

function bytesToSize(bytes) {
    //https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript/18650828#18650828
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return [Math.round(bytes / Math.pow(1024, i), 2),
        i,
        Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
    ];
};

socket.on('networkMsg', function(data) {
    // throw new Error('debuging');
    // console.log(data);

    //fix number
    var _upsum = data.upSum / (1024 ** Math.min(bytesToSize(data.upSum)[1], bytesToSize(data.downSum)[1]));
    var _downsum = data.downSum / (1024 ** Math.min(bytesToSize(data.upSum)[1], bytesToSize(data.downSum)[1]));
    var _upspeed = data.upSpeed / (1024 ** Math.min(bytesToSize(data.upSpeed)[1], bytesToSize(data.downSpeed)[1]));
    var _downspeed = data.downSpeed / (1024 ** Math.min(bytesToSize(data.upSpeed)[1], bytesToSize(data.downSpeed)[1]));
    // console.log(_upsum, _downsum, _upspeed, _downspeed,
    //     (1024 ** Math.min(bytesToSize(data.upSum)[1], bytesToSize(data.downSum)[1])),
    //     (1024 ** Math.min(bytesToSize(data.upSpeed)[1], bytesToSize(data.downSpeed)[1]))
    // );

    //update canvas
    // console.log(!(datasumcanvas.animating ||
    //     datadetialcanvas.animating ||
    //     dataspeedcanvas.animating ||
    //     nowspeedcanvas.animating));

    //not update in animating
    if (!(datasumcanvas.animating ||
            datadetialcanvas.animating ||
            dataspeedcanvas.animating ||
            nowspeedcanvas.animating)) {
        //update datasets
        //download 0
        //upload 1
        datasumcanvas.data.datasets[0].data[0] = data.downSum;
        datasumcanvas.data.datasets[0].data[1] = data.upSum;

        datadetialcanvas.data.datasets[0].data[0] = _downsum;
        datadetialcanvas.data.datasets[0].data[1] = _upsum;
        datadetialcanvas.data.datasets[0].label = 'Used (' +
            sizes[Math.min(bytesToSize(data.upSum)[1], bytesToSize(data.downSum)[1])] + ')';

        dataspeedcanvas.data.datasets[0].data[0] = _downspeed;
        dataspeedcanvas.data.datasets[0].data[1] = _upspeed;
        dataspeedcanvas.data.datasets[0].label = 'Speed (' +
            sizes[Math.min(bytesToSize(data.upSpeed)[1], bytesToSize(data.downSpeed)[1])] + ')';

        nowspeedcanvas.data.datasets[0].data.shift();
        nowspeedcanvas.data.datasets[0].data.push(_downspeed);
        nowspeedcanvas.data.datasets[1].data.shift();
        nowspeedcanvas.data.datasets[1].data.push(_upspeed);
        // console.log(_downspeed, _upspeed);

        datasumcanvas.update();
        datadetialcanvas.update();
        dataspeedcanvas.update();
        nowspeedcanvas.update();

        //miao~
        document.getElementById('connmsg').innerText = 'miao~~';
        document.getElementById('neko').src = '/static/img/neko/neko2.png';
    }
});

function waitReady() {
    console.log('miao~');
    if (typeof window.__INITIAL_STATE__ == "undefined") {
        setTimeout(waitReady, 200);
    } else if (window.__INITIAL_STATE__.appShell.common.isPageSwitching) {
        setTimeout(waitReady, 200);
    } else {
        setTimeout(function() {
            socket.emit('ready', 'ping');
        }, 2000);
    }
}
waitReady();

socket.on('ready', function() {
    console.log('ready');
    // throw new Error('debuging');

    datasumcanvas = new Chart(document.getElementById('datasum'), {
        "type": "doughnut",
        "data": {
            "labels": ["Download", "Upload"],
            "datasets": [{
                "label": "Data",
                "data": [50, 100],
                "backgroundColor": ["rgb(54, 162, 235)", "rgb(255, 205, 86)"]
            }]
        }
    });

    datadetialcanvas = new Chart(document.getElementById('data-detial'), {
        "type": "bar",
        "data": {
            "labels": ["Download", "Upload"],
            "datasets": [{
                "label": "Used",
                "data": [50, 100],
                "fill": false,
                "backgroundColor": ["rgb(54, 162, 235)", "rgb(255, 205, 86)"],
                "borderColor": ["rgb(255, 205, 86)", "rgb(54, 162, 235)"],
                "borderWidth": 1
            }]
        },
        "options": {
            "scales": {
                "yAxes": [{
                    "ticks": {
                        "beginAtZero": true
                    }
                }]
            }
        }
    });

    dataspeedcanvas = new Chart(document.getElementById('data-speed'), {
        "type": "bar",
        "data": {
            "labels": ["Download", "Upload"],
            "datasets": [{
                "label": "Speed",
                "data": [50, 100],
                "fill": false,
                "backgroundColor": ["rgb(54, 162, 235)", "rgb(255, 205, 86)"],
                "borderColor": ["rgb(255, 205, 86)", "rgb(54, 162, 235)"],
                "borderWidth": 1
            }]
        },
        "options": {
            "scales": {
                "yAxes": [{
                    "ticks": {
                        "beginAtZero": true
                    }
                }]
            }
        }
    });

    nowspeedcanvas = new Chart(document.getElementById("nowSpeed"), {
        "type": "line",
        "data": {
            "labels": ["1", "2", "3", "4", "5", "6", "7"],
            "datasets": [{
                "label": "Download",
                "data": [65, 59, 80, 81, 56, 55, 40],
                "fill": false,
                "borderColor": "rgb(54, 162, 235)",
                "lineTension": 0.1
            }, {
                "label": "Upload",
                "data": [1, 5, 130, 81, 50, 25, 60],
                "fill": false,
                "borderColor": "rgb(255, 205, 86)",
                "lineTension": 0.1
            }]
        },
        "options": {}
    });

    function miao() {
        socket.emit('heartMsg', 'miao~'); // i love neko.
        setTimeout(miao, 1000);
    }

    // setTimeout(miao, 5000)
    // Chart.defaults.global.animation.onComplete = function() {
    nowspeedcanvas.data.datasets[0].data = new Array(50);
    nowspeedcanvas.data.datasets[1].data = new Array(50);
    nowspeedcanvas.data.labels = Array.from(new Array(50), (val, index) => String(index + 1));
    // };
    miao();
});
