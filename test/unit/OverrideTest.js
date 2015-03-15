QUnit.config.autostart = false;

require(["xhr-adaptor-js"], function(xhrAdaptorJs) {
	QUnit.start();
	
	module("Override Tests");

	QUnit.test( "sendSucceeds", function( assert ) {

		var done = assert.async();

		function XHRClass() {
			xhrAdaptorJs.xhrWrapper.call(this, new window.XMLHttpRequest());
		};
		XHRClass.prototype = Object.create(xhrAdaptorJs.xhrWrapper.prototype);
		XHRClass.constructor = XHRClass;

		var xhr = new XHRClass();
		xhr.open("get", "data/simpleSentence.txt");
		
		xhr.onreadystatechange = function() {
			
			 if(this.readyState == 4) {
        		assert.equal( this.responseText, "hello there", "Failed to retrieve data");
                done();
            }			
        }
		xhr.send();
	});

	// Test that a method override works
	QUnit.test( "sendSucceedsWithOpenOverride", function( assert ) {
		assert.expect(2);

		var done = assert.async();

		function XHRClass() {
			xhrAdaptorJs.xhrWrapper.call(this, new window.XMLHttpRequest());
		};
		XHRClass.prototype = Object.create(xhrAdaptorJs.xhrWrapper.prototype);
		XHRClass.constructor = XHRClass;
		XHRClass.prototype.open = function(verb, url, async) {
			assert.ok( true, "Overriden function was not called");
            xhrAdaptorJs.xhrWrapper.prototype.open.call(this, verb, url, async);
        };

		var xhr = new XHRClass();
		xhr.open("get", "data/simpleSentence.txt");
		
		xhr.onreadystatechange = function() {
			
			 if(this.readyState == 4) {
        		assert.equal( this.responseText, "hello there", "Failed to retrieve data");
                done();
            }			
        }
		xhr.send();
	});
	
	/////////////////////////////////////////////////////////////////////////////////
	//////////// Test that a non-event read/write property override works ///////////
	/////////////////////////////////////////////////////////////////////////////////
	QUnit.test( "setWithCredentialsSucceeds", function( assert ) {
		
		function XHRClass() {
			xhrAdaptorJs.xhrWrapper.call(this, new window.XMLHttpRequest());
		};
		XHRClass.prototype = Object.create(xhrAdaptorJs.xhrWrapper.prototype);
		XHRClass.constructor = XHRClass;
        
		var xhr = new XHRClass();
		// Call open to set the request as asynchronous so that 
		// setting 'withCredentials' does not throw an exception
		xhr.open("get", "data/simpleSentence.txt");
		
		assert.equal(xhr.withCredentials, false);
		xhr.withCredentials = true;
		assert.equal(xhr.withCredentials, true);
	});
	
	QUnit.test( "getWithCredentialsWithOverrideSucceeds", function( assert ) {
		
		assert.expect(2);
		
		function XHRClass() {
			xhrAdaptorJs.xhrWrapper.call(this, new window.XMLHttpRequest());
		};
		XHRClass.prototype = Object.create(xhrAdaptorJs.xhrWrapper.prototype);
		XHRClass.constructor = XHRClass;
        
		var xhr = new XHRClass();
		// Call open to set the request as asynchronous so that 
		// setting 'withCredentials' does not throw an exception
		xhr.open("get", "data/simpleSentence.txt");

		Object.defineProperty(XHRClass.prototype, "withCredentials", {
			get : function() {
				assert.ok(true);
			    var parentProp = Object.getOwnPropertyDescriptor(xhrAdaptorJs.xhrWrapper.prototype, "withCredentials");
			    return parentProp.get.call(this);
			},
			set : function(value) {
			    var parentProp = Object.getOwnPropertyDescriptor(xhrAdaptorJs.xhrWrapper.prototype, "withCredentials");
			    parentProp.set.call(this, value);
			}
		})
		
		assert.equal(xhr.withCredentials, false);
	});

	QUnit.test( "setWithCredentialsWithOverrideSucceeds", function( assert ) {
		
		assert.expect(2);
		
		function XHRClass() {
			xhrAdaptorJs.xhrWrapper.call(this, new window.XMLHttpRequest());
		};
		XHRClass.prototype = Object.create(xhrAdaptorJs.xhrWrapper.prototype);
		XHRClass.constructor = XHRClass;
        
		var xhr = new XHRClass();
		// Call open to set the request as asynchronous so that 
		// setting 'withCredentials' does not throw an exception
		xhr.open("get", "data/simpleSentence.txt");

		Object.defineProperty(XHRClass.prototype, "withCredentials", {
			get : function() {
			    var parentProp = Object.getOwnPropertyDescriptor(xhrAdaptorJs.xhrWrapper.prototype, "withCredentials");
			    return parentProp.get.call(this);
			},
			set : function(value) {
				assert.equal(value, true);
			    var parentProp = Object.getOwnPropertyDescriptor(xhrAdaptorJs.xhrWrapper.prototype, "withCredentials");
			    parentProp.set.call(this, value);
			}
		})
		
		xhr.withCredentials = true;
		assert.equal(xhr.withCredentials, true);
	});

	/////////////////////////////////////////////////////////////////////////////////
	//////////// Test that a non-event read only property override works ////////////
	/////////////////////////////////////////////////////////////////////////////////
	QUnit.test( "responseTextOverrideCalled", function( assert ) {
		
		assert.expect(2);
		
		var done = assert.async();
		
		function XHRClass() {
			xhrAdaptorJs.xhrWrapper.call(this, new window.XMLHttpRequest());
		};
		XHRClass.prototype = Object.create(xhrAdaptorJs.xhrWrapper.prototype);
		XHRClass.constructor = XHRClass;
		Object.defineProperty(XHRClass.prototype, "responseText", {
			get : function() {
				assert.ok(true);
			    var parentProp = Object.getOwnPropertyDescriptor(xhrAdaptorJs.xhrWrapper.prototype, "responseText");
			    return parentProp.get.call(this);
			}
		})

		var xhr = new XHRClass();
		
		xhr.open("get", "data/simpleSentence.txt");
		xhr.onreadystatechange = function() {
			
			if(this.readyState == 4) {
				assert.equal( this.responseText, "hello there", "Failed to retrieve data");
                done();
            }			
        }
		xhr.send();		
	});
		
	/////////////////////////////////////////////////////////////////////////////////
	//////////// Test that a event read/write property override works ///////////////
	/////////////////////////////////////////////////////////////////////////////////
	QUnit.test( "getOnReadyStateChangeWithOverrideSucceeds", function( assert ) {
		
		assert.expect(1);
		
		function XHRClass() {
			xhrAdaptorJs.xhrWrapper.call(this, new window.XMLHttpRequest());
		};
		XHRClass.prototype = Object.create(xhrAdaptorJs.xhrWrapper.prototype);
		XHRClass.constructor = XHRClass;
        
		var xhr = new XHRClass();
		// Call open to set the request as asynchronous so that 
		// setting 'withCredentials' does not throw an exception
		xhr.open("get", "data/simpleSentence.txt");
		
		Object.defineProperty(XHRClass.prototype, "onreadystatechange", {
			get : function() {
				assert.ok(true);
			    var parentProp = Object.getOwnPropertyDescriptor(xhrAdaptorJs.xhrWrapper.prototype, "onreadystatechange");
			    return parentProp.get.call(this);
			},
			set : function(value) {
			    var parentProp = Object.getOwnPropertyDescriptor(xhrAdaptorJs.xhrWrapper.prototype, "onreadystatechange");
			    parentProp.set.call(this, value);
			}
		})
		
		var rscFunc = function() {};
		xhr.onreadystatechange = rscFunc; 
		var rscDelegate = xhr.onreadystatechange;
	});
	
	QUnit.test( "setOnReadyStateChangeWithOverrideSucceeds", function( assert ) {
		
		assert.expect(1);
		
		function XHRClass() {
			xhrAdaptorJs.xhrWrapper.call(this, new window.XMLHttpRequest());
		};
		XHRClass.prototype = Object.create(xhrAdaptorJs.xhrWrapper.prototype);
		XHRClass.constructor = XHRClass;
        
		var xhr = new XHRClass();
		// Call open to set the request as asynchronous so that 
		// setting 'withCredentials' does not throw an exception
		xhr.open("get", "data/simpleSentence.txt");
		
		Object.defineProperty(XHRClass.prototype, "onreadystatechange", {
			get : function() {
			    var parentProp = Object.getOwnPropertyDescriptor(xhrAdaptorJs.xhrWrapper.prototype, "onreadystatechange");
			    return parentProp.get.call(this);
			},
			set : function(value) {
				assert.ok(true);				
			    var parentProp = Object.getOwnPropertyDescriptor(xhrAdaptorJs.xhrWrapper.prototype, "onreadystatechange");
			    parentProp.set.call(this, value);
			}
		})
		
		var rscFunc = function() {};
		xhr.onreadystatechange = rscFunc; 
		var rscDelegate = xhr.onreadystatechange;
	});

	QUnit.test( "eventCalledWhenSetOnReadyStateChangeWithOverride", function( assert ) {
		
		assert.expect(1);
		
		var done = assert.async();
		
		function XHRClass() {
			xhrAdaptorJs.xhrWrapper.call(this, new window.XMLHttpRequest());
		};
		XHRClass.prototype = Object.create(xhrAdaptorJs.xhrWrapper.prototype);
		XHRClass.constructor = XHRClass;
		Object.defineProperty(XHRClass.prototype, "onreadystatechange", {
			get : function() {
			    var parentProp = Object.getOwnPropertyDescriptor(xhrAdaptorJs.xhrWrapper.prototype, "onreadystatechange");
			    return parentProp.get.call(this);
			},
			set : function(value) {
			    var parentProp = Object.getOwnPropertyDescriptor(xhrAdaptorJs.xhrWrapper.prototype, "onreadystatechange");
			    parentProp.set.call(this, value);
			}
		})

		var xhr = new XHRClass();
		
		xhr.open("get", "data/simpleSentence.txt");
		xhr.onreadystatechange = function() {
			
			 if(this.readyState == 4) {
        		assert.equal( this.responseText, "hello there", "Failed to retrieve data");
                done();
            }			
        }
		xhr.send();		
	});
	
	// Tests that event properties always wrap the event handler in a delegate that
	// binds the wrapped XHR object to this, rather than the raw XMLHttpRequest object. 
	QUnit.test( "eventThisRefIsInstanceOfXhrWrapper", function( assert ) {
		
		assert.expect(1);
		
		var done = assert.async();
		
		function XHRClass() {
			xhrAdaptorJs.xhrWrapper.call(this, new window.XMLHttpRequest());
		};
		XHRClass.prototype = Object.create(xhrAdaptorJs.xhrWrapper.prototype);
		XHRClass.constructor = XHRClass;

		var xhr = new XHRClass();
		
		xhr.open("get", "data/simpleSentence.txt");
		xhr.onreadystatechange = function() {
			
			if(this.readyState == 4) {
				assert.ok( this instanceof xhrAdaptorJs.xhrWrapper, "Expected this to be an instance of xhrAdaptorJs.xhrWrapper");
                done();
            }			
        }
		xhr.send();		
	});
	
	/////////////////////////////////////////////////////////////////////////////////
	///////////////// Test that a event delegate works //////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////
	QUnit.test( "onlyEventDelegateCalled", function( assert ) {
		
		assert.expect(1);
		
		var done = assert.async();
		
		function XHRClass() {
			xhrAdaptorJs.xhrWrapper.call(this, new window.XMLHttpRequest());
		};
		XHRClass.prototype = Object.create(xhrAdaptorJs.xhrWrapper.prototype);
		XHRClass.constructor = XHRClass;
        XHRClass.prototype.eventDelegate = {
			onreadystatechange : function () {
		
				if(this.realScope.readyState == 4) {
					assert.ok(true);
				}
			}
		};
		
		var xhr = new XHRClass();
        
		xhr.open("get", "data/simpleSentence.txt");
		xhr.onreadystatechange = function() {
			
			 if(this.readyState == 4) {
        		assert.ok(true);
            }			
        }
		xhr.send();
		
		setTimeout(function() {
			done();
		}, 500);
	});
	
	QUnit.test( "eventDelegateChainsToRealHandler", function( assert ) {
		
		assert.expect(1);
		
		var done = assert.async();
		
		function XHRClass() {
			xhrAdaptorJs.xhrWrapper.call(this, new window.XMLHttpRequest());
		};
		XHRClass.prototype = Object.create(xhrAdaptorJs.xhrWrapper.prototype);
		XHRClass.constructor = XHRClass;
        XHRClass.prototype.eventDelegate = {
			onreadystatechange : function () {
				this.applyRealHandler(arguments);
			}
		};
		
		var xhr = new XHRClass();
        
		xhr.open("get", "data/simpleSentence.txt");
		xhr.onreadystatechange = function() {
			
			 if(this.readyState == 4) {
        		assert.ok(true);
            }			
        }
		xhr.send();
		
		setTimeout(function() {
			done();
		}, 500);
	});
});
	

