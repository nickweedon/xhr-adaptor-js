QUnit.config.autostart = false;

require(["xhr-adaptor-js"], function(xhrAdaptorJs) {
	
	function isActiveXObjectSupported() {
		try {
			var dummy = {} instanceof ActiveXObject;
		} catch(e) {
			return false;
		}
		return true;
	}

	function createNativeXhr() {
		// Always test the ActiveX xhr on IE
		return isActiveXObjectSupported() ? 
				new ActiveXObject('MSXML2.XMLHTTP.3.0') :
				new window.XMLHttpRequest();
	}
	
	QUnit.start();
	
	module("Override Tests");

	QUnit.test( "sendSucceeds", function( assert ) {

		var done = assert.async();

		function XHRClass() {
			xhrAdaptorJs.XHRWrapper.call(this, createNativeXhr());
		};
		XHRClass.prototype = Object.create(xhrAdaptorJs.XHRWrapper.prototype);
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
			xhrAdaptorJs.XHRWrapper.call(this, createNativeXhr());
		};
		XHRClass.prototype = Object.create(xhrAdaptorJs.XHRWrapper.prototype);
		XHRClass.constructor = XHRClass;
		XHRClass.prototype.open = function(verb, url, async) {
			assert.ok( true, "Overriden function was not called");
            xhrAdaptorJs.XHRWrapper.prototype.open.call(this, verb, url, async);
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
	// Can't seem to find a non-event read/write property that is actually supported on
	// the ActiveX XHR so only run these unit tests for native only XHR based browsers
	if(!isActiveXObjectSupported()) {
		
		QUnit.test( "getSetTimeoutSucceeds", function( assert ) {
			
			function XHRClass() {
				xhrAdaptorJs.XHRWrapper.call(this, createNativeXhr());
			};
			XHRClass.prototype = Object.create(xhrAdaptorJs.XHRWrapper.prototype);
			XHRClass.constructor = XHRClass;
	        
			var xhr = new XHRClass();
			xhr.open("get", "data/simpleSentence.txt");
			
			xhr.timeout = 500;
			assert.equal(xhr.timeout, 500);
		});
		
		QUnit.test( "setGetTimeoutWithOverrideSucceeds", function( assert ) {
			
			assert.expect(3);
			
			function XHRClass() {
				xhrAdaptorJs.XHRWrapper.call(this, createNativeXhr());
			};
			XHRClass.prototype = Object.create(xhrAdaptorJs.XHRWrapper.prototype);
			XHRClass.constructor = XHRClass;
	        
			var xhr = new XHRClass();
			xhr.open("get", "data/simpleSentence.txt");
	
			Object.defineProperty(XHRClass.prototype, "timeout", {
				get : function() {
					assert.ok(true);
				    var parentProp = Object.getOwnPropertyDescriptor(xhrAdaptorJs.XHRWrapper.prototype, "timeout");
				    return parentProp.get.call(this);
				},
				set : function(value) {
					assert.equal(value, 500);
				    var parentProp = Object.getOwnPropertyDescriptor(xhrAdaptorJs.XHRWrapper.prototype, "timeout");
				    parentProp.set.call(this, value);
				}
			})
			
			xhr.timeout = 500;
			assert.equal(xhr.timeout, 500);
		});
	}
	/////////////////////////////////////////////////////////////////////////////////
	//////////// Test that a non-event read only property override works ////////////
	/////////////////////////////////////////////////////////////////////////////////
	QUnit.test( "responseTextOverrideCalled", function( assert ) {
		
		assert.expect(2);
		
		var done = assert.async();
		
		function XHRClass() {
			xhrAdaptorJs.XHRWrapper.call(this, createNativeXhr());
		};
		XHRClass.prototype = Object.create(xhrAdaptorJs.XHRWrapper.prototype);
		XHRClass.constructor = XHRClass;
		Object.defineProperty(XHRClass.prototype, "responseText", {
			get : function() {
				assert.ok(true);
			    var parentProp = Object.getOwnPropertyDescriptor(xhrAdaptorJs.XHRWrapper.prototype, "responseText");
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
			xhrAdaptorJs.XHRWrapper.call(this, createNativeXhr());
		};
		XHRClass.prototype = Object.create(xhrAdaptorJs.XHRWrapper.prototype);
		XHRClass.constructor = XHRClass;
        
		var xhr = new XHRClass();
		// Call open to set the request as asynchronous so that 
		// setting 'withCredentials' does not throw an exception
		xhr.open("get", "data/simpleSentence.txt");
		
		Object.defineProperty(XHRClass.prototype, "onreadystatechange", {
			get : function() {
				assert.ok(true);
			    var parentProp = Object.getOwnPropertyDescriptor(xhrAdaptorJs.XHRWrapper.prototype, "onreadystatechange");
			    return parentProp.get.call(this);
			},
			set : function(value) {
			    var parentProp = Object.getOwnPropertyDescriptor(xhrAdaptorJs.XHRWrapper.prototype, "onreadystatechange");
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
			xhrAdaptorJs.XHRWrapper.call(this, createNativeXhr());
		};
		XHRClass.prototype = Object.create(xhrAdaptorJs.XHRWrapper.prototype);
		XHRClass.constructor = XHRClass;
        
		var xhr = new XHRClass();
		// Call open to set the request as asynchronous so that 
		// setting 'withCredentials' does not throw an exception
		xhr.open("get", "data/simpleSentence.txt");
		
		Object.defineProperty(XHRClass.prototype, "onreadystatechange", {
			get : function() {
			    var parentProp = Object.getOwnPropertyDescriptor(xhrAdaptorJs.XHRWrapper.prototype, "onreadystatechange");
			    return parentProp.get.call(this);
			},
			set : function(value) {
				assert.ok(true);				
			    var parentProp = Object.getOwnPropertyDescriptor(xhrAdaptorJs.XHRWrapper.prototype, "onreadystatechange");
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
			xhrAdaptorJs.XHRWrapper.call(this, createNativeXhr());
		};
		XHRClass.prototype = Object.create(xhrAdaptorJs.XHRWrapper.prototype);
		XHRClass.constructor = XHRClass;
		Object.defineProperty(XHRClass.prototype, "onreadystatechange", {
			get : function() {
			    var parentProp = Object.getOwnPropertyDescriptor(xhrAdaptorJs.XHRWrapper.prototype, "onreadystatechange");
			    return parentProp.get.call(this);
			},
			set : function(value) {
			    var parentProp = Object.getOwnPropertyDescriptor(xhrAdaptorJs.XHRWrapper.prototype, "onreadystatechange");
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
	QUnit.test( "eventThisRefIsInstanceOfXHRWrapper", function( assert ) {
		
		assert.expect(1);
		
		var done = assert.async();
		
		function XHRClass() {
			xhrAdaptorJs.XHRWrapper.call(this, createNativeXhr());
		};
		XHRClass.prototype = Object.create(xhrAdaptorJs.XHRWrapper.prototype);
		XHRClass.constructor = XHRClass;

		var xhr = new XHRClass();
		
		xhr.open("get", "data/simpleSentence.txt");
		xhr.onreadystatechange = function() {
			
			if(this.readyState == 4) {
				assert.ok( this instanceof xhrAdaptorJs.XHRWrapper, "Expected this to be an instance of xhrAdaptorJs.XHRWrapper");
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
			xhrAdaptorJs.XHRWrapper.call(this, createNativeXhr());
		};
		XHRClass.prototype = Object.create(xhrAdaptorJs.XHRWrapper.prototype);
		XHRClass.constructor = XHRClass;
        XHRClass.prototype.eventDelegate = {
			onreadystatechange : function () {
		
				if(this.realScope.readyState == 4) {
					assert.ok(true);
				} else {
					// NB make sure you always call this as the ActiveX XHR
					// will actually cease to call onreadystatechange if this is not called
					// i.e. you will only get the first event where readyState == 1
					this.applyRealHandler(arguments);
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
			xhrAdaptorJs.XHRWrapper.call(this, createNativeXhr());
		};
		XHRClass.prototype = Object.create(xhrAdaptorJs.XHRWrapper.prototype);
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
	

