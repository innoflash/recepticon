require.config({
    paths: {
        handlebars: "lib/handlebars-v4.0.11",
        config: 'js/config',
        hbshelper: "js/hbshelper",
        text: "lib/text",
        hbs: "lib/hbs"
    },
    shim: {
        handlebars: {
            exports: "Handlebars"
        }
    }
});
define('app', ['js/router'], function (Router) {
    Router.init();
    Router.onOut();
    Router.reinit();

    var f7 = new Framework7({
        root: '#app',
        name: 'ABIRI',
        id: 'net.innoflash.app',
        animateNavBackIcon: true,
        panel: {
            swipe: 'left',
        },
        routes: [
            {
                path: '/index',
                url: 'index.html'
            }, {
                path: '/receipts',
                url: 'pages/receipts.html'
            }, {
                path: '/specials',
                url: 'pages/specials.html'
            }, {
                path: '/promotions',
                url: 'pages/promotions.html'
            }, {
                path: '/reviews',
                url: 'pages/reviews.html'
            }, {
                path: '/contact',
                url: 'pages/contact.html'
            }, {
                path: '/about',
                url: 'pages/about.html'
            }, {
                path: '/settings',
                url: 'pages/settings.html'
            }, {
                path: '/profile',
                url: 'pages/profile.html'
            }
        ],
        theme: 'ios',
        upscroller: {
            text: 'Go down',
            ignorePages: ['index']
        },
        dialog: {
            title: 'ABIRI',
            buttonCancel: 'Nope!'
        },
        statusbar: {
            iosOverlaysWebview: true
        },
        notification: {
            title: 'App',
            closeTimeout: 2500,
        },
        view: {
            pushState: true,
            pushStateAnimate: true,
            pushStateSeparator: '#!'
        }
    });

    var mainView = f7.views.create('.view-main', {
        dynamicNavbar: true
    });

    return {
        f7: f7,
        mainView: mainView,
        router: Router
    };
});