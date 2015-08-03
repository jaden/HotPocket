var Vue = require('vue');
Vue.use(require('vue-resource'));

var moment = require('moment');
var URL = require('url-parse');

new Vue({
	el: '#items',

	data: {
		passphrase: '',
		token: '',
		items: {},
		count: 10,
		current_offset: 0,
		tokenCacheKey: 'pocket-token',
		itemsCacheKey: 'pocket-items',
	},

	created: function () {

		this.token = this.cacheGetString(this.tokenCacheKey);

		if (this.token) {

			// Prefill with items in cache before retrieving new ones
			if (this.cacheKeyExists(this.itemsCacheKey)) {
				this.items = this.cacheGetJson(this.itemsCacheKey);
			}

			this.getItems(this.count, 0);
		}
	},

	methods: {

		getToken: function(e) {

			e.preventDefault();

			this.$http.post('/auth', {passphrase: this.passphrase}, function(data, status, request) {

				this.cacheStore(this.tokenCacheKey, data.token);

				this.token = data.token;

				this.getItems(this.count, 0);

			}).error(function (data, status, request) {
				alert('An error occurred');
			});
		},

		doAction: function(action, item_id) {

			// Remove item from the list immediately, then make POST call
			this.items.$delete(item_id);

			this.$http.post('/item/' + item_id + '/' + action, {token: this.token}, function(data, status, request) {

				// Get more items only if we've archived/deleted at least 50%
				var halfCount = Math.round(this.count / 2);
				if (this.itemsKeys.length <= halfCount) {
					this.appendItems(halfCount, this.itemsKeys.length);
				}

			}.bind(this)).error(function (data, status, request) {
				alert('An error occurred');
			});
		},

		// Appends retrieved items to the list.
		// num    - The number of new items to retrieve
		// offset - The 0-based offset of where to start retrieving items from the Pocket API.
		appendItems: function(num, offset) {

			var postData = {
				token:  this.token,
				count:  num,
				offset: offset
			};

			this.sendPostRequest(postData, this.addItems);
		},

		// Replaces the existing list of items.
		getItems: function(num, offset) {

			var postData = {
				token:  this.token,
				count:  num,
				offset: offset
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
			Object.keys(this.items).forEach(function(key) {
				this.items.$delete(key);
			}.bind(this));

			this.addItems(newItems);
		},

		// postData = object with the token, count and offset
		// callback = function that takes this and an object of items
		sendPostRequest: function(postData, callback) {

			this.$http.post('/items', postData, function(data, status, request) {

				if (data.list === null || typeof data.list === 'undefined') {
					console.log('The request was successful, but there were no items');
				}

				callback(data.list);

				// Only cache the first page of items.
				if (this.current_offset === 0) {
					this.cacheStore(this.itemsCacheKey, data.list);
				}

			}.bind(this)).error(function (data, status, request) {
				alert('An error occurred getting items');
			});
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
		}
	},

	filters: {

		formatDate: function(date) {
			return moment.unix(date).format('ddd, DD MMM YYYY HH:mm:ss');
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