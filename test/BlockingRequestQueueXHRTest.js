define(["xhr-adaptor-js", "test-utils"], function(xhrAdaptorJs) {

	module("BlockingRequestQueueXHR Tests", {
			teardown: function () {
				xhrAdaptorJs.manager.resetXHR();
				xhrAdaptorJs.BlockingRequestQueueXHR.prototype.clearResponseHandlers();
			}
		}
	);

	QUnit.test( "instantiateSucceeds", function( assert ) {
		var xhr = new xhrAdaptorJs.BlockingRequestQueueXHR(createNativeXhr());
		assert.ok( xhr !== undefined, "Failed to instantiate xhrAdaptorJs.BlockingRequestQueueXHR" );
	});

	QUnit.test( "sendNotMatchingFilterSucceeds", function( assert ) {

		assert.expect(1);

		var done = assert.async();

		var requestHandler = {
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

		var requestHandler = {
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

	QUnit.test( "sendMatchingFilterBlocksBeforeContinue", function( assert ) {
		assert.expect(3);

		var done = assert.async();
		var hasContinued = false;

		var timeout = setTimeout(function() {
			assert.ok( false, "Timeout while waiting for handler to be called" );
			done();
		}, 1000 );

		var requestHandler = {
			doStuff: function(doContinue, xhr) {
				if(xhr.responseText == "Authorization required!") {
					assert.ok(true, "Failed to call callback");
					setTimeout(function() {
						hasContinued = true;
						doContinue();
					} , 500);
				} else {
					doContinue();
				}
			}
		};

		xhrAdaptorJs.BlockingRequestQueueXHR.prototype.registerResponseHandler("data", requestHandler.doStuff, requestHandler);
		xhrAdaptorJs.manager.injectWrapper(xhrAdaptorJs.BlockingRequestQueueXHR);

		xhr = new XMLHttpRequest();
		xhr.open("get", "data/needAuth.txt");
		xhr.send();

		secondXhr = new XMLHttpRequest();
		secondXhr.open("get", "data/secondSentence.txt");
		secondXhr.onreadystatechange = function() {

			if(this.readyState == 4) {
				assert.equal( this.responseText, "hi this is another sentence", "Failed to retrieve data");
				assert.equal(hasContinued, true, "Second call has completed before the first call has 'continued'");
				clearTimeout(timeout);
				done();
			}
		};
		secondXhr.send();
	});
});
	

