define(["app", "js/settings/settingsView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;

    var bindings = [

    ];

    function preparePage() {
    }


    function init() {
        preparePage();
        View.render({
            bindings: bindings
        });
    }

    function reinit() {
        console.log('reinitialising');
    }

    function onOut() {
        console.log('settings outting');
    }


    return {
        init: init,
        onOut: onOut,
        reinit: reinit
    };
});