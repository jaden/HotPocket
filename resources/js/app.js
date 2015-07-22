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

			this.updateItems();
		}
	},

	methods: {

		getToken: function(e) {

			e.preventDefault();

			this.$http.post('/auth', {passphrase: this.passphrase}, function(data, status, request) {

				this.cacheStore(this.tokenCacheKey, data.token);

				this.token = data.token;

				this.updateItems();

			}).error(function (data, status, request) {
				alert('An error occurred');
			});
		},

		updateItems: function() {

			this.$http.post('/items', {token: this.token, count: this.count}, function(data, status, request) {

				// Cache the items
				this.cacheStore(this.itemsCacheKey, data.list);

				this.items = data.list;

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
					this.getMoreItems(halfCount);
				} else {
					console.log('items remaining: ' + this.itemsKeys.length);
				}

			}).error(function (data, status, request) {
				alert('An error occurred');
			});
		},

		// num - The number of new items to retrieve
		getMoreItems: function(num) {

			// The offset is 0-based, where to start retrieving items from Pocket API
			var postData = {
				token: this.token,
				count: num,
				offset: this.count - this.itemsKeys.length - 1
			};

			this.$http.post('/items', postData, function(data, status, request) {

				// Add the downloaded items to the items list.
				var newKeys = Object.keys(data.list);
				newKeys.forEach(function(key) {
					this.items.$add(key, data.list[key]);
				}.bind(this));

				// Cache the list of items
				this.cacheStore(this.itemsCacheKey, data.list);

			}).error(function (data, status, request) {
				alert('An error occurred');
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
			if (! this.cacheKeyExists(key)) {
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
		}
	}
});