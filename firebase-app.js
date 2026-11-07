(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.firebase = factory());
})(this, (function () { 'use strict';

    var Component = function (name, instanceFactory, type) {
        this.name = name;
        this.instanceFactory = instanceFactory;
        this.type = type;
    };

    var Provider = function (name, container) {
        this.name = name;
        this.container = container;
        this.instances = new Map();
    };
    Provider.prototype.getImmediate = function (options) {
        return this.instances.get("[DEFAULT]") || null;
    };
    Provider.prototype.setComponent = function (component) {
        this.component = component;
    };

    var ComponentContainer = function (name) {
        this.name = name;
        this.providers = new Map();
    };
    ComponentContainer.prototype.addComponent = function (component) {
        var provider = this.getProvider(component.name);
        provider.setComponent(component);
    };
    ComponentContainer.prototype.getProvider = function (name) {
        if (this.providers.has(name)) return this.providers.get(name);
        var provider = new Provider(name, this);
        this.providers.set(name, provider);
        return provider;
    };

    var firebaseNamespace = (function () {
        var firebase = {
            _apps: new Map(),
            SDK_VERSION: "10.7.1",
            app: function (name) {
                name = name || "[DEFAULT]";
                return this._apps.get(name);
            },
            initializeApp: function (options, config) {
                config = config || {};
                var name = config.name || "[DEFAULT]";
                if (this._apps.has(name)) return this._apps.get(name);
                
                var container = new ComponentContainer(name);
                var appInstance = {
                    name: name,
                    options: options,
                    container: container
                };
                
                container.addComponent(new Component("app", function () { return appInstance; }, "PUBLIC"));
                this._apps.set(name, appInstance);
                return appInstance;
            },
            INTERNAL: {
                registerComponent: function (component) {
                    if (firebase._apps.has("[DEFAULT]")) {
                        firebase._apps.get("[DEFAULT]").container.addComponent(component);
                    }
                },
                Component: Component,
                getProvider: function (app, name) {
                    return app.container.getProvider(name);
                }
            }
        };
        return firebase;
    })();

    return firebaseNamespace;
}));
