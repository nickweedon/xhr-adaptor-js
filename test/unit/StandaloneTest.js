QUnit.config.autostart = false;

require(["xhr-adaptor-js"], function(xhrAdaptorJs) {
	QUnit.start();
	
	module("Standalone Tests");
	
	QUnit.test( "instantiateTest", function( assert ) {
		
			var xhrWrapper = new xhrAdaptorJs.xhrWrapper(new window.XMLHttpRequest());
			assert.ok( xhrWrapper !== undefined, "Failed to instantiate xhrAdaptorJs.xhrWrapper" );
	});
});
