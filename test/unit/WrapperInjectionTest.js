QUnit.config.autostart = false;

require(["xhr-adaptor-js", "test-utils"], function(xhrAdaptorJs) {
	QUnit.start();
	
	module("Wrapper Injection Tests");

	QUnit.test( "testSingleLevelWrapperInjection", function( assert ) {

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
        
        xhr = new XMLHttpRequest();
        
		xhr.open("get", "data/simpleSentence.txt");
		
		xhr.onreadystatechange = function() {
			
			 if(this.readyState == 4) {
        		assert.equal( this.responseText, "hello there", "Failed to retrieve data");
                done();
            }			
        }
		xhr.send();
	});
	
	QUnit.test( "testTwoLevelWrapperInjection", function( assert ) {

		assert.expect(2);
		
		var done = assert.async();

		function XHRResponseClass(impl) {
			xhrAdaptorJs.XHRWrapper.call(this, impl);
		};
		XHRResponseClass.prototype = Object.create(xhrAdaptorJs.XHRWrapper.prototype);
		XHRResponseClass.constructor = XHRClass;
		Object.defineProperty(XHRResponseClass.prototype, "responseText", {
			get : function() {
			    var parentProp = Object.getOwnPropertyDescriptor(xhrAdaptorJs.XHRWrapper.prototype, "responseText");
			    return parentProp.get.call(this).replace("there", "bob");
			}
		})
        xhrAdaptorJs.XHRManager.injectWrapper(XHRResponseClass);
		
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
        
        xhr = new XMLHttpRequest();
        
		xhr.open("get", "data/simpleSentence.txt");
		
		xhr.onreadystatechange = function() {
			
			 if(this.readyState == 4) {
        		assert.equal( this.responseText, "hello bob", "Failed to retrieve data");
                done();
            }			
        }
		xhr.send();
	});	
	
});
	

