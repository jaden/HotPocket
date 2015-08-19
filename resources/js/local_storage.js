module.exports = {

	keyExists: function(key) {
		return localStorage.hasOwnProperty(key);
	},

	store: function(key, value) {
		if (typeof value === 'object') {
			value = JSON.stringify(value);
		}

		localStorage.setItem(key, value);
	},

	getString: function(key) {
		if (! this.keyExists(key)) {
			return '';
		}

		return localStorage.getItem(key);
	},

	getJson: function(key) {
		if (! this.keyExists(key) || localStorage.getItem(key) === 'undefined') {
			return {};
		}

		return JSON.parse(localStorage.getItem(key));
	},

	remove: function(key) {
		localStorage.removeItem(key);
	},
};