var Vue = require('vue');
Vue.use(require('vue-resource'));

var moment    = require('moment');
var URL       = require('url-parse');
var nprogress = require('nprogress');

var ITEMS_CACHE_KEY         = 'pocket-items';
var USERNAME_CACHE_KEY      = 'pocket-username';

new Vue({
	el: '#pocketApp',

	data: {
		username: '',
		items: {},
		count: 8,
		current_offset: 0,
	},

	created: function () {

		this.username = this.cacheGetString(USERNAME_CACHE_KEY);

		if (this.username) {

			// Populate items list from local storage before retrieving updated list.
			if (this.cacheKeyExists(ITEMS_CACHE_KEY)) {
				this.items = this.cacheGetJson(ITEMS_CACHE_KEY);
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

				this.cacheStore(USERNAME_CACHE_KEY, this.username);

				this.getItems(this.count, 0);

			});
		},

		doAction: function(action, item_id) {

			// Remove item from the list immediately, then make POST call
			this.items.$delete(item_id);

			this.startProgress();

			this.$http.post('/item/' + item_id + '/' + action, function(data, status, request) {

				this.endProgress();

				// Get the next page of items if there aren't any left.
				if (this.itemsKeys.length === 0) {
					this.getItems(this.count, 0);
				}

			}.bind(this)).error(function (data, status, request) {
				this.endProgress();
				alert('An error occurred');
			});
		},

		// Replaces the existing list of items.
		getItems: function(num, offset) {

			var postData = {
				count:         num,
				offset:        offset
			};

			this.current_offset = offset;

			this.sendPostRequest(postData, this.replaceItems);
		},

		// Callback function for sendPostRequest
		addItems: function(newItems) {

			// Add the downloaded items to the items list.
			Object.keys(newItems).forEach(function(key) {
				this.items.$add(key, newItems[key]);
			}.bind(this));
		},

		// Callback function for sendPostRequest
		replaceItems: function(newItems) {

			// Remove all existing items.
			this.itemsKeys.forEach(function(key) {
				this.items.$delete(key);
			}.bind(this));

			this.addItems(newItems);
		},

		// postData = object with the token, count and offset
		// callback = function that takes this and an object of items
		sendPostRequest: function(postData, callback) {

			this.startProgress();

			this.$http.post('/items', postData, function(data, status, request) {

				this.endProgress();

				if (data.list === null || typeof data.list === 'undefined') {
					window.data = data;
					console.log('The request was successful, but there were no items');
					console.log(data);
					alert('There was an error retrieving the items');
					return;
				}

				callback(data.list);

				// Only cache the first page of items.
				if (this.current_offset === 0) {
					this.cacheStore(ITEMS_CACHE_KEY, data.list);
				}

			}.bind(this)).error(function (data, status, request) {
				this.endProgress();
				alert('An error occurred getting items');
			}.bind(this));
		},

		logout: function(e) {

			e.preventDefault();

			this.$http.get('/auth/logout');

			this.cacheRemove(ITEMS_CACHE_KEY);
			this.cacheRemove(USERNAME_CACHE_KEY);

			this.username = '';
			this.current_offset = 0;
		},

		cacheKeyExists: function(key) {
			return localStorage.hasOwnProperty(key);
		},

		cacheStore: function(key, value) {
			if (typeof value === 'object') {
				value = JSON.stringify(value);
			}

			localStorage.setItem(key, value);
		},

		cacheGetString: function(key) {
			if (! this.cacheKeyExists(key)) {
				return '';
			}

			return localStorage.getItem(key);
		},

		cacheGetJson: function(key) {
			if (! this.cacheKeyExists(key) || localStorage.getItem(key) === 'undefined') {
				return {};
			}

			return JSON.parse(localStorage.getItem(key));
		},

		cacheRemove: function(key) {
			localStorage.removeItem(key);
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