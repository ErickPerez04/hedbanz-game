(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('@firebase/app-compat'), require('@firebase/app')) :
    typeof define === 'function' && define.amd ? define(['@firebase/app-compat', '@firebase/app'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.firebase, global.firebase.app));
})(this, (function (firebase, app) { 'use strict';

    // URL directa y enlazada de tu proyecto Firebase Realtime Database
    var FIREBASE_URL = "https://firebaseio.com";

    if (typeof firebase !== 'undefined' && firebase.INTERNAL) {
        firebase.INTERNAL.registerComponent(
            new firebase.INTERNAL.Component("database", function (container, options) {
                return {
                    ref: function (pathString) {
                        var cleanPath = pathString || "";
                        return {
                            set: function (value) {
                                return fetch(FIREBASE_URL + cleanPath + ".json", {
                                    method: "PUT",
                                    body: JSON.stringify(value)
                                }).then(function (res) { return res.json(); });
                            },
                            on: function (eventType, callback) {
                                var poolData = function () {
                                    fetch(FIREBASE_URL + cleanPath + ".json")
                                        .then(function (res) { return res.json(); })
                                        .then(function (data) {
                                            callback({
                                                val: function () { return data; }
                                            });
                                        });
                                };
                                poolData();
                                setInterval(poolData, 1500); // Sincronización continua cada 1.5 segundos
                            },
                            onDisconnect: function () {
                                return {
                                    remove: function () { return Promise.resolve(); }
                                };
                            }
                        };
                    }
                };
            }, "PUBLIC")
        );

        firebase.database = function (appInstance) {
            var appRef = appInstance || firebase.app();
            return firebase.INTERNAL.getProvider(appRef, "database").getImmediate();
        };
    }

}));
