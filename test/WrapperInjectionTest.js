define(["xhr-adaptor-js", "test-utils"], function(xhrAdaptorJs) {

	module("Wrapper Injection Tests", {
			teardown: function () {
				xhrAdaptorJs.manager.resetXHR();
			}
		}
	);

	QUnit.test( "testSingleLevelWrapperInjection", function( assert ) {

		assert.expect(2);
		
		var done = assert.async();
		
		function XHRClass(impl) {
			// Call the parent constructor
			this.parent.call(this).constructor.call(this, impl);
		};
		XHRClass.prototype = Object.create(xhrAdaptorJs.XHRWrapper.prototype);
		XHRClass.constructor = XHRClass;
		XHRClass.prototype.open = function(verb, url, async) {
			assert.ok( true, "Overriden function was not called");
			this.parent.call(this).open.call(this, verb, url, async);
        };

        xhrAdaptorJs.manager.injectWrapper(XHRClass);
        
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
			// Call the parent constructor
			this.parent.call(this).constructor.call(this, impl);
		}
		XHRResponseClass.prototype = Object.create(xhrAdaptorJs.XHRWrapper.prototype);
		XHRResponseClass.constructor = XHRClass;
		Object.defineProperty(XHRResponseClass.prototype, "responseText", {
			get : function() {
				return this.parentProperty.call(this, "responseText").get.call(this).replace("there", "bob");
			}
		});
        xhrAdaptorJs.manager.injectWrapper(XHRResponseClass);
		
		function XHRClass(impl) {
			// Call the parent constructor
			this.parent.call(this).constructor.call(this, impl);
		}
		XHRClass.prototype = Object.create(xhrAdaptorJs.XHRWrapper.prototype);
		XHRClass.constructor = XHRClass;
		XHRClass.prototype.open = function(verb, url, async) {
			assert.ok( true, "Overriden function was not called");
			this.parent.call(this).open.call(this, verb, url, async);
        };

        xhrAdaptorJs.manager.injectWrapper(XHRClass);
        
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
	

