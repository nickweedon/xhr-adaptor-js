define(["xhr-adaptor-js", "test-utils"], function(xhrAdaptorJs) {

	module("BlockingRequestQueueXHR Tests", {
			teardown: function () {
				xhrAdaptorJs.manager.resetXHR();
			}
		}
	);

	QUnit.test( "instantiateSucceeds", function( assert ) {
		var xhr = new xhrAdaptorJs.BlockingRequestQueueXHR(createNativeXhr());
		assert.ok( xhr !== undefined, "Failed to instantiate xhrAdaptorJs.BlockingRequestQueueXHR" );
	});

	QUnit.test( "sendNotMatchingFilterSucceeds", function( assert ) {

		var done = assert.async();

		requestHandler = {
			doStuff: function() {
				assert.ok(false, "Not expecting this to be called");
			}
		};

		xhrAdaptorJs.BlockingRequestQueueXHR.prototype.registerResponseHandler("http://www.google.com", requestHandler.doStuff, requestHandler);

		xhrAdaptorJs.manager.injectWrapper(xhrAdaptorJs.BlockingRequestQueueXHR);

		xhr = new XMLHttpRequest();

		xhr.open("get", "data/simpleSentence.txt");

		xhr.onreadystatechange = function() {

			if(this.readyState == 4) {
				assert.equal( this.responseText, "hello there", "Failed to retrieve data");
				done();
			}
		};

		xhr.send();
	});

	QUnit.test( "sendMatchingFilterCallsCalback", function( assert ) {

		assert.expect(2);

		var done = assert.async();

		var timeout = setTimeout(function() {
			assert.ok( false, "Timeout while waiting for handler to be called" );
			done();
		}, 500 );

		requestHandler = {
			doStuff: function(doContinue) {
				assert.ok(true, "Failed to call callback");
				doContinue();
				clearTimeout(timeout);
				done();
			}
		};

		xhrAdaptorJs.BlockingRequestQueueXHR.prototype.registerResponseHandler("data", requestHandler.doStuff, requestHandler);

		xhrAdaptorJs.manager.injectWrapper(xhrAdaptorJs.BlockingRequestQueueXHR);

		xhr = new XMLHttpRequest();

		xhr.open("get", "data/simpleSentence.txt");

		xhr.onreadystatechange = function() {

			if(this.readyState == 4) {
				assert.equal( this.responseText, "hello there", "Failed to retrieve data");
			}
		};

		xhr.send();
	});

});
	

