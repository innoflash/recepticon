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
        }, {
            element: '#btnMoreLogOff',
            event: 'click',
            handler: logOut
        }, {
            element: '#inviteOthers',
            event: 'click',
            handler: inviteOthers
        }, {
            element: '#btnResetPassword',
            event: 'click',
            handler: forgotPassword
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
    
    function forgotPassword() {
        var VF = [
            $('#forgot_email'),
            $('#forgot_phone')
        ];

        if (functions.isFieldsValid(VF, app)) {
            app.f7.dialog.confirm('Resetting the password makes us change your current one and give you a new one of our own, Proceed?', function () {
                app.f7.dialog.preloader('Resetting password');
                $.ajax({
                    url: app_apis.shopper + 'forgotpassword',
                    method: 'POST',
                    timeout: 5000,
                    data: {
                        email: $('#forgot_email').val(),
                        phone: $('#forgot_phone').val()
                    }
                }).success(function (data) {
                    app.f7.dialog.alert(data.message, function () {
                        if (data.success) {
                            $("input[type=text], textarea").val("");
                            fgtPswdPopup.close();
                        }
                    });
                }).error(function (error) {
                    app.f7.dialog.alert(messages.server_error);
                }).always(function () {
                    app.f7.dialog.close();
                });
            });
        }
    }

    function logOut() {
        var side = Cookies.get(cookienames.auth_side);
        console.log(side, 1324);
        app.f7.dialog.confirm('Are you sure you want to log out now?', function () {
            Cookies.remove(cookienames.auth_side);
            Cookies.remove(cookienames.user);
            Cookies.remove(cookienames.authenticated);
            if (side == auth_side.abiri_direct + "") {
                loginPopup.open()
            } else {
                firebase.auth().signOut().then(function () {
                    loginPopup.open();
                }).catch(function (error) {
                    // An error happened.
                });
            }
        });
    }

    function inviteOthers() {
        var options = {
            message: "Hi, I am Shopper.Try my new services and experience the fun of smart travelling. \n\nGet me from ", // not supported on some apps (Facebook, Instagram)
            subject: 'Shopper', // fi. for email
            url: 'https://www.innoflash.net',
            chooserTitle: 'Share with' // Android only, you can override the default share sheet title
        };

        var onSuccess = function (result) {
            /*   console.log("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
               console.log("Shared to app: " + result.app); // On Android result.app is currently empty. On iOS it's empty when sharing is cancelled (result.completed=false)

               app.f7.alert("Shared to app: " + result.app);
               app.f7.alert("Share completed? " + result.completed);*/
        };

        var onError = function (msg) {
            console.log("Sharing failed with message: " + msg);
            app.f7.alert("Sharing failed with message: " + msg);
        };

        window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
    }

    function regularAuth() {
        var VF = [
            $('#user_phone'),
            $('#user_password')
        ];

        if (functions.isFieldsValid(VF, app)) {
            app.f7.dialog.preloader('Signing in...');
            $.ajax({
                method: 'POST',
                url: app_apis.shopper + 'login',
                timeout: 5000,
                data: {
                    phone: $('#user_phone').val(),
                    password: $('#user_password').val()
                }
            }).success(function (data) {
                console.log(data);
                $("input[type=text], textarea").val("");
                app.f7.dialog.alert(data.message);
                if (data.success) {
                    Cookies.set(cookienames.user, data.user);
                    if (data.activate) {
                        Cookies.set(cookienames.activate, true);
                        activationPopup.open();
                    } else {
                        loginPopup.close({
                            animate: true
                        });
                        Cookies.set(cookienames.auth_side, auth_side.app_direct);
                        Cookies.set(cookienames.authenticated, true);
                        preparePage();
                    }
                }

            }).error(function (error) {
                console.log(error);
                app.f7.dialog.alert(messages.server_error);
            }).always(function () {
                app.f7.dialog.close();
            });
        }
    }

    function preparePage() {
        user = Cookies.getJSON(cookienames.user);
        View.fillImage();
        View.fillUser(user);
        //todo shuffle the ad pic
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
                },
                close: function () {
                    Cookies.remove(cookienames.activate);
                }
            }
        });
    }

    function preloadForActivation() {
        user = Cookies.getJSON(cookienames.user);
        View.fillActivation(user);

        $('#btnActivate').on('click', function () {
            var VF = [
                $('#activation_code')
            ];

            if (functions.isFieldsValid(VF, app)) {
                app.f7.dialog.preloader('Activating account');
                $.ajax({
                    url: app_apis.shopper + 'accountactivation',
                    method: 'POST',
                    timeout: 5000,
                    data: {
                        shopper_id: user.id,
                        unique_id: user.user_id,
                        phone: user.phone,
                        code: $('#activation_code').val()
                    }
                }).success(function (data) {
                    console.log(data);
                    app.f7.dialog.alert(data.message);
                    if (data.success) {
                        $("input[type=text], textarea").val("");
                        Cookies.set(cookienames.authenticated, true);
                        Cookies.set(cookienames.auth_side, auth_side.abiri_direct);
                        loginPopup.close();
                        activationPopup.close();
                        registerPopup.close();
                        Cookies.set(cookienames.activate, false);
                        Cookies.remove(cookienames.activate);
                        preparePage();
                    }
                }).error(function (error) {
                    console.log(error);
                    app.f7.dialog.alert(messages.server_error);
                }).always(function () {
                    app.f7.dialog.close();
                });
            }

        });

        $('#cancelAccount').on('click', function () {
            app.f7.dialog.confirm('Are you sure you want to cancel your pending account?', function () {
                app.f7.dialog.preloader('Please wait');
                $.ajax({
                    url: app_apis.shopper + 'deleteprofile',
                    method: 'POST',
                    timeout: 5000,
                    data: {
                        id: user.id,
                        unique_id: user.user_id,
                        phone: user.phone
                    }
                }).success(function (data) {
                    console.log(data);
                    app.f7.dialog.alert(data.message, function () {
                        if (data.success) {
                            activationPopup.close();
                            loginPopup.open();
                            Cookies.remove(cookienames.user);
                            Cookies.remove(cookienames.authenticated);
                            $("input[type=text], textarea").val("");
                        }
                    });
                }).error(function () {
                    app.f7.dialog.alert(messages.server_error);
                }).always(function () {
                    app.f7.dialog.close();
                });
            });
        });

        $('#resendCode').on('click', function () {
            app.f7.dialog.confirm('You didn`t receive the activation code and you want us resend to you?', function () {
                console.log('sending reactivation code');
                app.f7.dialog.preloader('Resending code');
                $.ajax({
                    url: app_apis.shopper + 'reactivate',
                    method: 'POST',
                    timeout: 5000,
                    data: {
                        shopper_id: user.id,
                        unique_id: user.user_id,
                        phone: user.phone
                    }
                }).success(function (data) {
                    app.f7.dialog.alert(data.message);
                }).error(function (error) {
                    console.log(error);
                    app.f7.dialog.alert(messages.server_error);
                }).always(function () {
                    app.f7.dialog.close();
                });
            });
        });
    }

    function checkAuthentication() {
        var authenticated = functions.hasCookie(cookienames.authenticated);
        var activateUp = functions.hasCookie(cookienames.activate);
        if (functions.hasCookie(cookienames.activate) && Cookies.get(cookienames.activate) == "true") {
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