QUnit.config.autostart = false;

require(["xhr-adaptor-js", "test-utils"], function(xhrAdaptorJs) {
	QUnit.start();
	
	module("xhrManager Tests");

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

	if(!isActiveXObjectSupported()) {
		// Non-IE tests
		QUnit.test( "getXhrClassFailsOverWhenXMLHttpRequestNotAvailable", function( assert ) {
	
			window.XMLHttpRequest = undefined;
			var xhr = null;
			
			assert.throws(function () {
						xhr = new (xhrAdaptorJs.xhrManager.getXhrClass())(); 
					},
					/This browser does not support XMLHttpRequest./, 
					"Expected an exception but one did not occur");
		});
	} else { 
		// IE Tests
		QUnit.test( "getXhrClassFailsOverWhenXMLHttpRequestNotAvailable", function( assert ) {
			
			window.XMLHttpRequest = undefined;
			var xhr = null;

			var xhr = new (xhrAdaptorJs.xhrManager.getXhrClass())();
			xhr.open("get", "data/simpleSentence.txt", false);
			xhr.send();
			assert.equal( xhr.responseText, "hello there", "Failed to retrieve data");
		});
	}
});
	

