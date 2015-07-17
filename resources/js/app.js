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
		count: 5,
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
        	})
		},

		updateItems: function() {

			this.$http.post('/items', {token: this.token, count: this.count}, function(data, status, request) {

				// Cache the items
				this.cacheStore(this.itemsCacheKey, data.list);

				this.items = data.list;

			}).error(function (data, status, request) {
            	alert('An error occurred');
        	})
		},

		doAction: function(action, item_id) {

			this.$http.post('/item/' + item_id + '/' + action, {token: this.token}, function(data, status, request) {

				// Remove item we performed the action on
				this.items.$delete(item_id);

				this.getNextItem();

			}).error(function (data, status, request) {
            	alert('An error occurred');
        	})
		},

		getNextItem: function() {
			var offset = this.count - 1; // offset is 0-based

			this.$http.post('/items', {token: this.token, count: 1, offset: offset}, function(data, status, request) {

				// Add the new item
				var item_id = Object.keys(data.list)[0];
				this.items.$add(item_id, data.list[item_id]);

				// Cache the updated items list
				this.cacheStore(this.itemsCacheKey, data.list);

			}).error(function (data, status, request) {
            	alert('An error occurred');
        	})
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
		}
	}
});