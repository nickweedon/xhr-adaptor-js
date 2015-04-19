require.config({
  shim: {
	  'jquery-colorbox' : {
		  deps : ['jquery']
	  }
  },
  paths: {
    jquery: "../../../bower_components/jquery/dist/jquery",
    requirejs: "../../../bower_components/requirejs/require",
    "xhr-adaptor-js": "../../../dist/xhr-adaptor-js",
    "jquery-colorbox": "../../../bower_components/jquery-colorbox/jquery.colorbox",
    "test-utils": "js/test-utils",
  },
  packages: [

  ]
});
