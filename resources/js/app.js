var Vue = require('vue');
Vue.use(require('vue-resource'));

var moment    = require('moment');
var URL       = require('url-parse');
var nprogress = require('nprogress');
var cache     = require('./local_storage');

var ITEMS_CACHE_KEY    = 'pocket-items';
var USERNAME_CACHE_KEY = 'pocket-username';

new Vue({
    el: '#pocketApp',

    data: {
        username      : '',
        items         : {},
        count         : 8,
        current_offset: 0,
        total_items   : null,
    },

    created: function () {

        this.username = cache.getString(USERNAME_CACHE_KEY);

        if (this.username) {

            // Populate items list from local storage before retrieving updated list.
            if (cache.keyExists(ITEMS_CACHE_KEY)) {
                this.items = cache.getJson(ITEMS_CACHE_KEY);
            }

            this.getItems(this.count, 0);

        } else {
            this.getItemsIfLoggedIn();
        }
    },

    methods: {

        authorize: function() {

            this.startProgress();

            this.$http.get('/auth/request', function(data, status, request) {

                this.endProgress();

                if (data.redirect_to) {
                    window.location = data.redirect_to;
                }

            });
        },

        getItemsIfLoggedIn: function() {

            this.$http.get('/auth/user', function(data, status, request) {

                if (! data.username) {
                    return;
                }

                this.username = data.username;

                cache.store(USERNAME_CACHE_KEY, this.username);

                this.getItems(this.count, 0);

            });
        },

        // Replaces the existing list of items.
        getItems: function(num, offset) {

            var postData = {
                count : num,
                offset: offset
            };

            this.current_offset = offset;

            this.sendPostRequest(postData, this.replaceItems);
        },

        getItemsCount: function() {

            this.startProgress();

            this.$http.get('/items/all', function(data, status, request) {

                this.endProgress();

                this.total_items = Object.keys(data.list).length;
            });
        },

        decrementTotalItemsCount: function() {
            if (this.total_items === null) {
                return;
            }

            this.total_items--;
        },

        // Callback function for sendPostRequest
        addItems: function(newItems) {

            // Add the downloaded items to the items list.
            Object.keys(newItems).forEach(function(key) {
                Vue.set(this.items, key, newItems[key]);
            }.bind(this));
        },

        // Callback function for sendPostRequest
        replaceItems: function(newItems) {

            // Remove all existing items.
            this.itemsKeys.forEach(function(key) {
                Vue.delete(this.items, key);
            }.bind(this));

            this.addItems(newItems);
        },

        doAction: function(action, item_id) {

            // Remove item from the list immediately, then make POST call
            Vue.delete(this.items, item_id);

            this.decrementTotalItemsCount();

            // Update cache with new list
            cache.store(ITEMS_CACHE_KEY, this.items);

            this.startProgress();

            this.$http.post('/item/' + item_id + '/' + action, function(data, status, request) {

                this.endProgress();

                // Get the next page of items if there aren't any left.
                if (this.itemsKeys.length === 0) {
                    this.getItems(this.count, 0);
                }

            }.bind(this))

            .error(function (data, status, request) {
                this.endProgress();
                alert('An error occurred - the item may not have been archived or deleted.');
            });
        },

        // postData = object with the token, count and offset
        // callback = function that takes this and an object of items
        sendPostRequest: function(postData, callback) {

            this.startProgress();

            this.$http.post('/items', postData, function(data, status, request) {

                this.endProgress();

                if (data.list === null || typeof data.list === 'undefined') {
                    window.data = data;
                    console.log('The request was successful, but there were no items. Logging out.');
                    console.log(data);
                    this.logout();
                    return;
                }

                callback(data.list);

                // Only cache the first page of items.
                if (this.current_offset === 0) {
                    cache.store(ITEMS_CACHE_KEY, data.list);
                }

            }.bind(this))

            .error(function (data, status, request) {
                this.endProgress();
                this.logout();

            }.bind(this));
        },

        logout: function() {

            this.$http.get('/auth/logout');

            cache.remove(ITEMS_CACHE_KEY);
            cache.remove(USERNAME_CACHE_KEY);

            this.username = '';
            this.current_offset = 0;
        },

        startProgress: function () {
            nprogress.start();
        },

        endProgress: function() {
            nprogress.done();
        },
    },

    filters: {

        formatDate: function(date) {
            // return moment.unix(date).format('ddd, DD MMM YYYY HH:mm:ss');
            return moment.unix(date).fromNow();
        },

        baseUrl: function(url) {
            var domain = new URL(url).hostname;
            if (domain.substr(0, 4) === 'www.') {
                return domain.substr(4);
            }
            return domain;
        },

        // If the value is undefined or empty, replace it with a default value.
        getDefault: function(string, defaultValue) {
            if (typeof string === 'undefined' || string.length === 0) {
                return defaultValue;
            }

            return string;
        }
    },

    computed: {

        itemsKeys: function() {
            return Object.keys(this.items);
        },

        currentPage: function() {
            return (this.current_offset / this.count) + 1;
        }
    }
});