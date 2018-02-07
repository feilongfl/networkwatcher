<template>
<section>
    <div class="container" id="index">
        <!-- system info -->
        <div class="container">
            <div class="media">
                <img class="mr-3" data-src="holder.js/64x64" id="neko" alt="64×64" style="width: 64px; height: 64px;" src="/static/img/neko/neko1.png"
                  data-holder-rendered="true">
                <div class="media-body text-left">
                    <h5 class="mt-0"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">Network Watcher</font></font></h5>
                    <font style="vertical-align: inherit;">
                        <!-- <font style="vertical-align: inherit;">You can watch your Network Usage and Speed via this tool.</font> -->
                        <font style="vertical-align: inherit;" id="connmsg">Waiting connect...</font>
                    </font>
                </div>
            </div>
        </div>
        <!-- used data -->
        <div class="container">
            <div class="row">
                <div class="col-sm">
                    <canvas id="data-detial" width="200" height="200"></canvas>
                </div>
                <div class="col-sm">
                    <canvas id="datasum" width="200" height="200"></canvas>
                </div>
                <div class="col-sm">
                    <canvas id="data-speed" width="200" height="200"></canvas>
                </div>
            </div>
        </div>

        <!-- speed show -->
        <div class="container">
            <canvas id="nowSpeed" class="chartjs" width="500" height="300"></canvas>
        </div>
        <!-- socket.io -->
        <script src="/static/js/core.js"></script>
    </div>
</section>
</template>

<script>
import {
    mapActions
} from 'vuex';

function setState(store) {
    store.dispatch('appShell/appHeader/setAppHeader', {
        show: true,
        title: 'NetworkWatcher',
        showMenu: true,
        showBack: false,
        showLogo: false,
        // actions: [{
        //     icon: 'search',
        //     route: '/search'
        // }]
    });
}

export default {
    name: 'index',
    metaInfo: {
        title: 'Overview',
        titleTemplate: '%s - NetworkWatcher',
        meta: [{
                name: 'keywords',
                content: 'network watcher'
            },
            {
                name: 'description',
                content: 'network watcher'
            }
        ]
    },
    async asyncData({
        store,
        route
    }) {
        setState(store);
    },
    activated() {
        setState(this.$store);
    }
};
</script>
