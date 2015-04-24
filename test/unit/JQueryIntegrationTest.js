QUnit.config.autostart = false;

require(["xhr-adaptor-js", "jquery", "test-utils"], function(xhrAdaptorJs) {
	QUnit.start();
	
	module("JQuery Integration Tests");
	
	QUnit.test( "testJQueryWrapperInjectionWorks", function( assert ) {

		assert.expect(2);
		
		var done = assert.async();
		
		function XHRClass(impl) {
			xhrAdaptorJs.XHRWrapper.call(this, impl);
		};
		XHRClass.prototype = Object.create(xhrAdaptorJs.XHRWrapper.prototype);
		XHRClass.constructor = XHRClass;
		XHRClass.prototype.open = function(verb, url, async) {
			assert.ok( true, "Overriden function was not called");
            xhrAdaptorJs.XHRWrapper.prototype.open.call(this, verb, url, async);
        };

        xhrAdaptorJs.XHRManager.injectWrapper(XHRClass);

        $.get( "http://127.0.0.1:8020/test/unit/data/simpleSentence.txt", function( data ) {
    		assert.equal( data, "hello there", "Failed to retrieve data");
            done();
        })
	});
	
	QUnit.test( "testJQueryOnLoadEventDelegateWorks", function( assert ) {

		assert.expect(2);
		
		var done = assert.async();
		
		function XHRClass(impl) {
			xhrAdaptorJs.XHRWrapper.call(this, impl);
		};
		XHRClass.prototype = Object.create(xhrAdaptorJs.XHRWrapper.prototype);
		XHRClass.constructor = XHRClass;
		XHRClass.prototype.eventDelegate = {
			onload : function () {
				assert.ok( true, "Overriden function was not called");
				this.applyRealHandler(arguments);
			}
		};

        xhrAdaptorJs.XHRManager.injectWrapper(XHRClass);

        $.get( "http://127.0.0.1:8020/test/unit/data/simpleSentence.txt", function( data ) {
    		assert.equal( data, "hello there", "Failed to retrieve data");
            done();
        })
	});
	// TODO: Add unit test that overrides response event (the one that JQuery uses)
});
	

