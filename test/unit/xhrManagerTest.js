QUnit.config.autostart = false;

require(["xhr-adaptor-js"], function(xhrAdaptorJs) {
	QUnit.start();
	
	module("xhrManager Tests");

	/*
	QUnit.test( "getXhrClassReturnsClass", function( assert ) {
		//var xhr = new xhrAdaptorJs.XHRWrapper(new window.XMLHttpRequest());
		var xhrClass = xhrAdaptorJs.xhrManager.getXhrClass();
		
		assert.equal( typeof xhrClass, "function", "Expected xhrAdaptorJs.xhrManager.getXhrClass() to return a class (function)" );
	});
	*/

	QUnit.test( "canInstantiateGetXhrClassReturnValue", function( assert ) {
		
		var xhrClass = xhrAdaptorJs.xhrManager.getXhrClass();
		
		var xhr = new xhrClass();
		
		assert.equal( typeof xhr, "object", "Expected xhrAdaptorJs.xhrManager.getXhrClass() to return a class" );
	});
	
	
	QUnit.test( "getXhrClassInstanceCanSynchronousSendRetrievesData", function( assert ) {
		
		var xhr = new (xhrAdaptorJs.xhrManager.getXhrClass())();
		xhr.open("get", "data/simpleSentence.txt", false);
		xhr.send();
		assert.equal( xhr.responseText, "hello there", "Failed to retrieve data");
	});

	//TODO: finish this off (assert throw and add IE case)
	QUnit.test( "getXhrClassFailsOverWhenXMLHttpRequestNotAvailable", function( assert ) {

		window.XMLHttpRequest = undefined;
		
		var xhr = new (xhrAdaptorJs.xhrManager.getXhrClass())();
		xhr.open("get", "data/simpleSentence.txt", false);
		xhr.send();
		assert.equal( xhr.responseText, "hello there", "Failed to retrieve data");
	});
	
});
	

