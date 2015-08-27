var Using = (function(){

	'use strict';

	var modules = {};

	function expose(key, module) {

		if(modules.hasOwnProperty(key)) {

			throw 'Error: A module with that name already exists';
		}

		modules[key] = module;
	}


	function require (key) {
		
		if(modules.hasOwnProperty(key)) {

			return modules[key];
		}
		else {

			return null;
		}

	}

	return {

		Expose : expose,
		Require : require
	};

}());