define(["app", "js/index/indexView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;
    var user = {};
    var authProvider = null;

    var bindings = [
        {
            element: '#btnFbSignin',
            event: 'click',
            handler: fbAuthentication
        }, {
            element: "#btnGpSignin",
            event: 'click',
            handler: googleAuth
        }, {
            element: '#btnSignIn',
            event: 'click',
            handler: regularAuth
        }
    ];


    function init() {
        initPopups();
        checkAuthentication();
        console.log(app);
        View.render({
            bindings: bindings
        });
    }

    function regularAuth() {
        loginPopup.close();
    }

    function initPopups() {
        loginPopup = app.f7.popup.create({
            el: '.popup-login',
            animate: true,
            on: {
                open: function () {
                    Cookies.set(cookienames.authenticated, false);
                }
            }
        });
        registerPopup = app.f7.popup.create({
            el: '.popup-signup',
            animate: true
        });
        fgtPswdPopup = app.f7.popup.create({
            el: '.popup-forgot-password',
            animate: true
        });
        activationPopup = app.f7.popup.create({
            el: '.popup-activation',
            animate: true,
            on: {
                open: function () {
                    preloadForActivation();
                }
            }
        });
    }

    function preloadForActivation() {

    }

    function checkAuthentication() {
        var authenticated = functions.hasCookie(cookienames.authenticated);
        var activateUp = functions.hasCookie(cookienames.activate);
        if (Cookies.get(cookienames.activate) !== undefined || Cookies.get(cookienames.activate) === true) {
            console.log('opening activate');
            activationPopup.open();
        } else {
            if (authenticated && functions.hasCookie(cookienames.user)) {
                console.log('preparing page');
                preparePage();
            } else {
                if (functions.hasCookie(cookienames.activate) && Cookies.get(cookienames.activate)) {
                    console.log('opening activate 2');
                    activationPopup.open();
                }
                loginPopup.open();
                functions.appDefaultSettings();
            }
        }
    }

    function fbAuthentication() {
        authProvider = new firebase.auth.FacebookAuthProvider();
        authProvider.addScope('user_birthday');
        firebase.auth().signInWithRedirect(authProvider).then(function () {
            return firebase.auth().getRedirectResult();
        }).then(function (result) {
            console.log(result);
        }).catch(function (error) {
            console.log(error);
            var errorCode = error.code;
            var errorMessage = error.message;
            app.f7.dialog.alert(errorMessage);
        });
    }

    function googleAuth() {
        authProvider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithRedirect(authProvider).then(function () {
            return firebase.auth().getRedirectResult();
        }).then(function (result) {
            console.log(result);
        }).catch(function (error) {
            console.log(error);
            var errorCode = error.code;
            var errorMessage = error.message;
            app.f7.dialog.alert(errorMessage);
        });
    }

    function onOut() {
        console.log('index outting');
    }

    return {
        init: init,
        onOut: onOut,
        reinit: init
    };
});