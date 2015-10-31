define(["xhr-adaptor-js"], function(xhrAdaptorJs) {

	module("Standalone Tests", {
			teardown: function () {
				xhrAdaptorJs.manager.resetXHR();
			}
		}
	);
	
	QUnit.test( "instantiateSucceeds", function( assert ) {
			var xhr = new xhrAdaptorJs.XHRWrapper(new window.XMLHttpRequest());
			assert.ok( xhr !== undefined, "Failed to instantiate xhrAdaptorJs.XHRWrapper" );
	});
	
	QUnit.test( "synchronousSendRetrievesData", function( assert ) {
		var xhr = new xhrAdaptorJs.XHRWrapper(new window.XMLHttpRequest());
		xhr.open("get", "data/simpleSentence.txt", false);
		xhr.send();
		assert.equal( xhr.responseText, "hello there", "Failed to retrieve data");
	});

	QUnit.test( "asynchronousCallbackIsCalled", function( assert ) {
		assert.expect(0);
		var done = assert.async();
		var isDone = false;
		
		var xhr = new xhrAdaptorJs.XHRWrapper(new window.XMLHttpRequest());
		xhr.open("get", "data/simpleSentence.txt");
		
		xhr.onreadystatechange = function() {
			if(!isDone) {
				isDone = true;
				done();
			}
        }
		xhr.send();
	});
	
	QUnit.test( "asynchronousSendRetrievesData", function( assert ) {
		var done = assert.async();
		
		var xhr = new xhrAdaptorJs.XHRWrapper(new window.XMLHttpRequest());
		xhr.open("get", "data/simpleSentence.txt");
		
		xhr.onreadystatechange = function() {
			
			 if(this.readyState == 4) {
        		assert.equal( xhr.responseText, "hello there", "Failed to retrieve data");
                done();
            }			
        }
		xhr.send();
	});
	
});
	

