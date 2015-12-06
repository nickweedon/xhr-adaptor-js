define('xhr-adaptor-js', 
    
	[],
    function () {
    
	
	/**
	 * For the AMD module version of the library, the xhrAdaptorJs namespace
	 * does not exist but refers instead to the AMD module itself.
	 *
	 * @summary The xhrAdaptorJs namespace and AMD module
	 * @version 1.0
	 * @exports xhr-adaptor-js
	 * @namespace {object} xhrAdaptorJs
	 */
	var xhrAdaptorJs = xhrAdaptorJs || {};

	/**
 * This constructor is used internally and is not publicly available outside of the 
 * {@link xhrAdaptorJs} package.
 *  
 * @summary The private EventDelegate class constructor
 * @param xhr {xhrAdaptorJs.XHRWrapper} The XHRWrapper derived object.
 * @param realHandler {Function} The real event handler. 
 * 
 * @classdesc
 * <p>
 * The EventDelegate class is used as the call context for all {@link xhrAdaptorJs.XHRWrapper} 
 * event delegates.
 * </p>
 * <p>
 * This class can be used to invoke the real handler as well as to provide direct 
 * access to the underlying {@link xhrAdaptorJs.XHRWrapper} derived object.
 * </p>
 * The EventDelegate object may be stored and then later used to invoke the real handler,
 * thereby delaying the event, perhaps until some other event has occurred.
 * 
 * @see xhrAdaptorJs.XHRWrapper
 * @class
 * @global
 */
function EventDelegate(xhr, realHandler) {
	this._xhr = xhr;
	this.realHandler = realHandler;
}

/**
 * This method is used to invoke the real handler, using the {@link xhrAdaptorJs.XHRWrapper} 
 * derived object as the call context.
 * Like the built-in Javascript 'call' method, this method accepts a variable number of arguments 
 * which are passed to the real handler.
 * @summary Invoke the real event handler using 'call' semantics
 * @param {...any} - The arguments to pass to the real handler.
 * @memberOf EventDelegate
 * @see EventDelegate#applyRealHandler
 * 
 */
EventDelegate.prototype.callRealHandler = function() {
	this.realHandler.apply(this._xhr, arguments);
};

/**
 * This method is used to invoke the real handler, using the {@link xhrAdaptorJs.XHRWrapper} 
 * derived object as the call context.
 * Like the built-in Javascript 'apply' method, this method accepts an array of arguments 
 * which are supplied as formal arguments to the real handler.
 * 
 * @summary Invoke the real event handler using 'apply' semantics
 * @param {array} argArray The array of arguments that will be supplied as formal arguments to
 * the real handler.
 * @memberOf EventDelegate
 * @see EventDelegate#callRealHandler
 * 
 */
EventDelegate.prototype.applyRealHandler = function(argArray) {
	this.realHandler.apply(this._xhr, argArray);
};

/**
 * This read-only property provides access to the {@link xhrAdaptorJs.XHRWrapper} derived object.
 * 
 * @summary The {@link xhrAdaptorJs.XHRWrapper} derived object.
 * @type xhrAdaptorJs.XHRWrapper
 * @instance
 * @name xhr
 * @memberOf EventDelegate
 * @readonly
 */
Object.defineProperty(EventDelegate.prototype, "xhr", {
	get : function() {
		return this._xhr;
	}
}); 


/**
 * The PropMethodFactoryBase constructor
 * 
 * @classdesc
 * <p>
 * Like the GoF template design pattern, this abstract class calls methods
 * which are defined only in derived classes.
 * </p> 
 * <p>
 * The class also follows the GoF abstract factory
 * pattern in so far as that the actual factory logic itself lies in this abstract class 
 * but the derived classes implement the specific property and method accessing logic.
 * </p>
 * <p>
 * While currently private to the xhrAdaptorJs library, this class hierarchy could potentially
 * be enhanced a made public to provide a convenient method for constructing custom XHR proxies.
 * </p>
 * 
 * @private
 * @global
 * @class
 */
function PropMethodFactoryBase() {
	
}

/**
 * Convenience method that is used to return the prototype of the parent class.
 * Most useful for calling parent class methods within an overriden implementation.
 * This method should not be called directly on the PropMethodFactoryBase class but should
 * instead only be called by derived classes.
 * 
 * @summary Return the prototype of the parent class
 * @returns Returns the prototype of the parent class
 * @memberOf PropMethodFactoryBase
 */
PropMethodFactoryBase.prototype._parent = function() {
	return Object.getPrototypeOf(Object.getPrototypeOf(this));
};

/**
 * Create a method invoking function for the specified method
 * 
 * @param methodName {String} The name of the method to create the method invoking function for
 * @returns {Function}
 * @memberOf PropMethodFactoryBase
 */
PropMethodFactoryBase.prototype.createMethod = function(methodName) {
	var me = this;
	
	return function() {
		return me.invokeMethod(this.impl, methodName, arguments);
	};
};

/**
 * Create a property getter function for the specified property
 * 
 * @param propertyName {String} The name of the property to create the getter for
 * @returns {Function}
 * @memberOf PropMethodFactoryBase
 */
PropMethodFactoryBase.prototype.createPropGetter = function(propertyName) {
	var me = this;
	
	return function() {
		return me.getProperty(this.impl, propertyName);
	};
};

/**
 * Create a property setter function for the specified property
 * 
 * @param propertyName {String} The name of the property to create the setter for
 * @returns {Function}
 * @memberOf PropMethodFactoryBase
 */
PropMethodFactoryBase.prototype.createPropSetter = function(propertyName) {
	var me = this;
	
	return function(value) {
		me.setProperty(this.impl, propertyName, value);
	};
};

/**
 * This method checks to see if a delegate is defined for the property and if so,
 * it sets the event handler on the underlying object to a wrapper which calls the
 * supplied delegate, allowing the delegate to then perform some custom logic and then
 * optionally call the real handler.
 * If there is no delegate defined for the property then a simple wrapper is set on the
 * implementation allowing the {@link xhrAdaptorJs.XHRWrapper} derived class object to 
 * be used as the 'this' context for the xhr caller supplied handler. 
 * 
 * @summary Create a property setter for an event based property
 * @param propertyName {String} The name of the property to supply the event
 * @returns {Function}
 * @memberOf PropMethodFactoryBase
 */
PropMethodFactoryBase.prototype.createEvtPropSetter = function(propertyName) {
	var factoryMe = this;
	
	return function(value) {
		var me = this;
		var delFunc = null;

		// Check if an event delegate is defined 
		if(propertyName in this.eventDelegate) {
			delFunc = this.eventDelegate[propertyName];
		} else {
			// If there is no delegate then don't just assign the function directly
			// as we still want to intercept the event so we can apply the wrapped object
			// as the 'this' context for the real event handler instead of the 
			// raw XMLHttpRequest or ActiveX object.
			delFunc = function() {
				this.applyRealHandler(arguments);
			};
		}
			 
		// Define the state object which which will be used as the 'this' context
		// for the delegate function that calls or can call the real handler
		var delState = new EventDelegate(me, value);
		/*
		var delState = {
				// Provide the XHR wrapper object in case it is needed by the delegate
				// function for any reason.
				xhr : me,  
				realHandler: value,
				// Provide these two convenience methods to allow the real
				// handler to be called while still providing the XHR wrapper
				// as the 'this' context
				callRealHandler : function() {
					delState.realHandler.apply(me, arguments);
				},
				applyRealHandler : function(argArray) {
					delState.realHandler.apply(me, argArray);
				}
		};
		*/
		
		// This final wrapper function acts as a closure that merely sets 
		// the 'this' context to delState before calling the delegate function
		var delWrapper = function() {
			delFunc.apply(delState, arguments);
		};
		factoryMe.setEventProperty(this.impl, propertyName, delState, delFunc, value);
	};
};

/**
 * Return the specified property from the object
 * 
 * @param {Object} obj The XHR implementation
 * @param {String} propertyName The name of the property to retrieve
 * @memberOf PropMethodFactoryBase
 * @abstract
 */
PropMethodFactoryBase.prototype.getProperty = function(obj, propertyName) {
	throw new Error("Must be implemented in subclass!");
};

/**
 * Set the specified property on the object
 * 
 * @param {Object} obj The XHR implementation
 * @param {String} propertyName The name of the property to set
 * @param value {Object} The value to set 
 * @memberOf PropMethodFactoryBase
 * @abstract
 */
PropMethodFactoryBase.prototype.setProperty = function(obj, propertyName, value) {
	throw new Error("Must be implemented in subclass!");
};

/**
 * Invoke the specified method on the object
 * 
 * @param {Object} obj The XHR implementation
 * @param {String} propertyName The name of the method to invoke
 * @param args {array} The array of arguments to supply to the method 
 * @memberOf PropMethodFactoryBase
 * @abstract
 */
PropMethodFactoryBase.prototype.invokeMethod = function(obj, methodName, args) {
	throw new Error("Must be implemented in subclass!");
};

/**
 * Set an event based property by assigning the delegate function that in turn will call
 * the real handler.
 * 
 * @param {Object} obj The XHR implementation
 * @param {String} propertyName The name of the method to invoke
 * @param {Object} delState The delegate state object that is to be used as the 'this' context 
 * by the delegate function.
 * @param {function} delFunc The delegate function that is to be called, using delState as its 'this'
 * context.
 * @param {function} realHandler The actual real handler that the xhr caller has supplied. This parameter
 * is not required by the implementation as it is already stored within the delState object and invoked
 * via delState.callRealHandler or delState.applyRealHandler. The argument is supplied purely to allow
 * for an implementation to log the handler that has been supplied by the xhr caller.
 * @param args {array} The array of arguments to supply to the method
 * @memberOf PropMethodFactoryBase
 * @abstract
 */
PropMethodFactoryBase.prototype.setEventProperty = function(obj, propertyName, delState, delFunc, realHandler) {
	throw new Error("Must be implemented in subclass!");
};



/**
 * This factory creates accessors, setters and methods that simply directly call the
 * underlying implementation using javascript's 'apply' feature for calling methods
 * and its property indexing operator [] for proxying property access.
 * 
 * @summary Factory for native only (non-activeX) proxying
 * @private
 * @global
 * @class
 * @augments PropMethodFactoryBase
 */
function NativePropMethodFactory() {
	
}

NativePropMethodFactory.prototype = Object.create(PropMethodFactoryBase.prototype);
NativePropMethodFactory.constructor = NativePropMethodFactory; 

NativePropMethodFactory.prototype.getProperty = function(obj, propertyName) {
	return obj[propertyName];
};

NativePropMethodFactory.prototype.setProperty = function(obj, propertyName, value) {
	obj[propertyName] = value;
};

NativePropMethodFactory.prototype.invokeMethod = function(obj, methodName, args) {
	return obj[methodName].apply(obj, args);
};

NativePropMethodFactory.prototype.setEventProperty = function(obj, propertyName, delState, delFunc, realHandler) {
	
	// This final wrapper function acts as a closure that merely sets 
	// the 'this' context to delState before calling the delegate function
	var delWrapper = function() {
		delFunc.apply(delState, arguments);
	};
	this.setProperty(obj, propertyName, delWrapper);	
};


/**
 * This factory creates accessors, setters and methods that call into an ActiveX based
 * implementation.
 * This means that javascript based features such as 'apply' and the property indexing 
 * operator [] are unavailable.
 * This factory therefore provides setters, getters and method invoking functions which
 * use 'eval' in order to invoke the underlying method.
 * 
 * @summary Factory for ActiveX proxying
 * @private
 * @global
 * @class
 * @augments NativePropMethodFactory
 */
function ActiveXAwarePropMethodFactory() {
	
} 

ActiveXAwarePropMethodFactory.prototype = Object.create(NativePropMethodFactory.prototype);
ActiveXAwarePropMethodFactory.constructor = ActiveXAwarePropMethodFactory;

ActiveXAwarePropMethodFactory.prototype.getProperty = function(obj, propertyName) {
	
	if(obj instanceof ActiveXObject) {
		/*jshint -W061 */
		return eval("obj." + propertyName + ";");
	}
	return this._parent().getProperty.apply(this, arguments);
};

ActiveXAwarePropMethodFactory.prototype.setProperty = function(obj, propertyName, value) {
	if(obj instanceof ActiveXObject) {
		/*jshint -W061 */
		eval("obj." + propertyName + " = value;");
		return;
	}
	return this._parent().setProperty.apply(this, arguments);
};

ActiveXAwarePropMethodFactory.prototype.invokeMethod = function(obj, methodName, args) {
	
	if(obj instanceof ActiveXObject) {
		var evalStr = "obj." + methodName + "(";
		
		if(args.length > 0) {
			evalStr += "args[0]";
		}
		
		for(var i = 1; i < args.length; i++) {
			evalStr += ", args[" + i + "]";
		}
		
		evalStr += ");";
		
		/*jshint -W061 */	
		return eval(evalStr);	
	}

	return this._parent().invokeMethod.apply(this, arguments);
};


/**
 * This function dynamically derives a debug class from the specified base class
 * 
 * @param baseClass
 * @global
 * @private
 * @returns {DebugNativePropMethodFactory}
 */
function deriveDebugFactoryFrom(baseClass) {
	
	/**
	 * This factory simply derives from an existing factory and augments the factory
	 * with debug logging such that all getters, setters and method invocaction is logged.
	 * The {@link deriveDebugFactoryFrom} function is used to conveniently create a 
	 * DebugNativePropMethodFactory class that derives from an arbitrary {@link PropMethodFactoryBase}
	 * based parent class. 
	 * 
	 * @summary Factory class that adds debugging information 
	 * @private
	 * @global
	 * @class
	 * @augments Any
	 */
	function DebugNativePropMethodFactory() {
		
	}

	DebugNativePropMethodFactory.prototype = Object.create(baseClass.prototype);
	DebugNativePropMethodFactory.constructor = DebugNativePropMethodFactory; 

	DebugNativePropMethodFactory.prototype.getProperty = function(obj, propertyName) {
		console.debug("Retrieving value for property '" + propertyName + "'");
		return this._parent().getProperty.apply(this, arguments);
	};

	DebugNativePropMethodFactory.prototype.setProperty = function(obj, propertyName, value) {
		if(!('_skipPropLog' in obj))
			console.debug("Setting value of property '" + propertyName + "' to: " + value);
		this._parent().setProperty.apply(this, arguments);	
	};

	DebugNativePropMethodFactory.prototype.invokeMethod = function(obj, methodName, args) {
		var arrArgs = [];
		for(var i = 0; i < args.length; i++)
			arrArgs[i] = args[i];
		console.debug("Invoking " + methodName + "(" + JSON.stringify(arrArgs) + ")");
		return this._parent().invokeMethod.apply(this, arguments);	
	};

	DebugNativePropMethodFactory.prototype.setEventProperty = function(obj, propertyName, delState, delFunc, realHandler) {
		console.debug("Setting value of property '" + propertyName + "' to: " + realHandler);
		obj._skipPropLog = true;
		try {
			this._parent().setEventProperty.apply(this, arguments);
		} finally {
			delete obj._skipPropLog;
		}
	};
	
	return DebugNativePropMethodFactory;
}



/**
 * This is a classic GoF builder that uses the provided abstract factory
 * to build the provided prototype.
 */
function XHRWrapperProtoBuilder(factory, proto) {
	this.factory = factory;
	this.proto = proto; 
}

XHRWrapperProtoBuilder.prototype.buildMethods = function() {

	for(var i = 0; i < arguments.length; i++) {
		var methodName = arguments[i];
		this.proto[methodName] = this.factory.createMethod(methodName);
	}

	return this;
};

// Create event based properties (the handler injects a delegate if one is defined)
XHRWrapperProtoBuilder.prototype.buildEventProperties = function() {
	
	for(var i = 0; i < arguments.length; i++) {
		var propertyName = arguments[i];
		Object.defineProperty(this.proto, propertyName, {
			get : this.factory.createPropGetter(propertyName),
			set : this.factory.createEvtPropSetter(propertyName)
		}); 
	}

	return this;
};

//Create standard read/write properties
XHRWrapperProtoBuilder.prototype.buildReadWriteProperties = function() {

	for(var i = 0; i < arguments.length; i++) {
		var propertyName = arguments[i];
		Object.defineProperty(this.proto, propertyName, {
			get : this.factory.createPropGetter(propertyName),
			set : this.factory.createPropSetter(propertyName)
		});
	}

	return this;
};

// Create standard read-only properties
XHRWrapperProtoBuilder.prototype.buildReadOnlyProperties = function() {
	
	for(var i = 0; i < arguments.length; i++) {
		var propertyName = arguments[i];
		Object.defineProperty(this.proto, propertyName, {
			get : this.factory.createPropGetter(propertyName)
		});
	}

	return this;
};


xhrAdaptorJs = xhrAdaptorJs || {};

/**
 * XHRWrapper constructor
 * 
 * @summary The base class for further XHR behavior customization
 * @param {XMLHttpRequest} impl The implementation object that this XHRWrapper object is to wrap.
 * 
 * @classdesc
 * <p>
 * The XHRWrapper class is a proxy class that wraps all of the methods and properties of the
 * underlying XHR based implementation which is provided as a parameter to the constructor.
 * </p><p>
 * This class is normally used as a base class which is extended by a derived class to perform tasks
 * such as intercepting and logging XHR request or filtering or even delaying events. The derived 
 * class can either be instantiated and used directly or 'injected' into the browser so that it 
 * is seamlessly instantiated in place of the native XMLHttpRequest class.
 * </p><p>
 * When instantiating the derived class directly it is helpful to instantiate the native 
 * XMLHttpRequest object using the {@link xhrAdaptorJs.XHRManager#getXhrClass} method.
 * </p><p>
 * In addition to the methods and properties mentioned here, this class also implements all of
 * the properties and methods of the XMLHttpRequest object. For details of these properties and
 * methods refer to {@link https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest} as well as the more
 * recently added properties described in 
 * {@link https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIXMLHttpRequestEventTarget}.
 * If in doubt, use the force and read the source.
 * </p>
 * @example
 * <caption>
 * <H4>Deriving from XHRWrapper</H4>
 * This example shows how to derive from XHRWrapper while overriding the 'open' method.
 * </caption>
 *
 * function myXhrWrapper(impl) {
 *   // Always call the parent constructor, passing 'impl'
 *   this.parent.call(this).constructor.call(this, impl);
 * }
 * myXhrWrapper.prototype = Object.create(xhrAdaptorJs.XHRWrapper.prototype);
 * myXhrWrapper.constructor = myXhrWrapper;
 * myXhrWrapper.open = function(method, url) {
 *   console.debug("Opening " + url);
 *   // Always call the parent method
 *   this.parent.call(this).open.call(this, verb, url, async);
 * }
 *
 * @example
 * <caption>
 * <H4>Instantiating the XHRWrapper derived class</H4>
 * Building upon the previous example, this example shows how to 
 * instantiate the derived wrapper while passing a real XMLHttpRequest object to
 * its constructor. The XMLHttpRequest object is instantiated using the 
 * {@link xhrAdaptorJs.XHRManager#getXhrClass} method.
 * </caption> 
 * 
 * var wrapper = new myXhrWrapper(xhrAdaptorJs.manager.getXhrClass());
 * 
 * @example
 * <caption>
 * <H4>Injecting the XHRWrapper derived class</H4>
 * Building upon the first example, this example shows how to use
 * the derived wrapper as a XMLHttpRequest replacement.
 * </caption>
 * 
 * // Inject the derived class by invoking the xhrAdaptorJs.manager's 
 * // {@link xhrAdaptorJs.XHRManager#injectWrapper} method. 
 * xhrAdaptorJs.manager.injectWrapper(myXhrWrapper);
 * 
 * // This is actually instantiating a myXhrWrapper class 
 * var xhr = new XMLHttpRequest();
 *
 * @example
 * <caption>
 * <H4>Overriding a property</H4>
 * Building upon the first example, this example shows how override a property. Note that it is not
 * strictly necessary to call the parent getter if you do not need to access the real value (e.g.
 * if you are always returning the same string such as if you were to construct a testing mock object).
 * </caption>
 * Object.defineProperty(myXhrWrapper.prototype, "responseText", {
 * 	get : function() {
 * 		// Retrieve the parent property
 *		var parentProp = this.parentProperty.call(this, "onreadystatechange")
 *		// Call the parent getter and retrieve the value
 *		var value = parentProp.get.call(this);
 *		// Do something with the value before returning it
 *		return value.replace("Bob", "Jane");
 *	}
 * });
 * 
 * @class
 * @memberOf xhrAdaptorJs
 */
xhrAdaptorJs.XHRWrapper = function(impl) {
	
	console.assert(impl !== undefined, "Wrapped implementation must be passed as the first argument to the XHRWrapper constructor.");
	
	this.impl = impl;

	// If an event delegate exists then assign a 'no-op' event hanndler so that the event delegate is always called
	for(var event in this.eventDelegate) {
		this[event] = function() {};
	}
};

/**
 * <p>
 * This prototype member object is used to describe mappings between event based properties and
 * delegates where a delegate is essentially a specialized kind of event handler that is executed
 * before the underlying event that was provided to the XHR object.
 * </p>
 * <p> The delegate acts as an intermediary and can execute custom logic before calling the real 
 * handler or perhaps decide to defer the call to the real handler until much later or even based 
 * on some other event such as a user entering their credentials into a login dialog.
 * </p>
 * <p>
 * An {@link EventDelegate} object is provided as the call context to the delegate and this object
 * can be used to invoke the real handler as well as to gain access the XHRWrapper instance.
 * </p> 
 *   
 * @example
 * <caption>
 * <h4>Create a 'onreadystatechange' delegate</h4>
 * This example shows how to create a 'onreadystatechange' event delegate that will
 * delay the response by 3 seconds.
 * </caption>
 * function myXhrWrapper(impl) {
 * 	// Always call the parent constructor, passing 'impl'
 *	this.parent.call(this).constructor.call(this, impl);
 * }
 * myXhrWrapper.prototype = Object.create(xhrAdaptorJs.XHRWrapper.prototype);
 * myXhrWrapper.constructor = myXhrWrapper;
 * // Register the delegate
 * myXhrWrapper.prototype.eventDelegate = {
 *	onreadystatechange : function () {
 *		
 *		if(this.readyState == 4) {
 *			// Delay the event for 3 seconds
 *			window.setTimeout(function() {
 *				// When the timer expires, call the real handler via the
 *				// {@link EventDelegate#applyRealHandler} method.
 *				this.applyRealHandler(arguments);
 *			}, 3000);
 *		} else {
 *			// NB make sure you always still call the parent for events that
 *			// you are not interested in as the ActiveX version of XHR
 *			// will actually cease to call onreadystatechange if this is not called
 *			// i.e. you will only get the first event where readyState == 1
 *			this.applyRealHandler(arguments);
 *		}
 *	}
 * };
 *
 * // Inject the wrapper class into the browser so that it is instantiated in place of the 
 * // regular XMLHttpRequest class. 
 * xhrAdaptorJs.manager.injectWrapper(myXhrWrapper);
 *
 * // Now make a get request to "data/simpleSentence.txt" and show an alert with the response text.
 * // The delegate will delay this response by 3 seconds.
 * var xhr = new XMLHttpRequest();
 * xhr.open("get", "data/simpleSentence.txt");
 * xhr.onreadystatechange = function() {
 * 
 * 	if(this.readyState == 4) {
 * 		// Note that 'this' still refers to the myXhrWrapper class object 
 * 		alert(this.responseText);
 * 	}			
 * };
 * xhr.send();
 * 
 * @example
 * <caption>
 * <h4>Create a 'onload' delegate to trap JQuery requests</h4>
 * This example shows how to create a 'onload' event delegate print a console debug
 * message whenever a JQuery ajax response is received.
 * </caption>
 * function myXhrWrapper(impl) {
 * 	// Always call the parent constructor, passing 'impl'
 *	this.parent.call(this).constructor.call(this, impl);
 * }
 * myXhrWrapper.prototype = Object.create(xhrAdaptorJs.XHRWrapper.prototype);
 * myXhrWrapper.constructor = myXhrWrapper;
 * // Register the delegate
 * 
 * XHRClass.prototype.eventDelegate = {
 *	onload : function () {
 *		console.debug("The response is: " + this.xhr.responseText);
 * 		// Now call the real handler via the {@link EventDelegate#applyRealHandler} method.
 *		this.applyRealHandler(arguments);
 *	}
 * };
 *
 * // Inject the wrapper class into the browser so that it is instantiated in place of the 
 * // regular XMLHttpRequest class. 
 * xhrAdaptorJs.manager.injectWrapper(myXhrWrapper);
 *
 * // Now make a get request to "data/simpleSentence.txt" and show an alert with the response text.
 * // The delegate will output the response to the console before it is displayed as an alert. 
 * $.get( "http://127.0.0.1:8020/test/unit/data/simpleSentence.txt", function( data ) {
 * 	alert("Got data: " + data);
 * });
 *   
 * @summary Event based property delegate map
 * @see EventDelegate
 * @type {Object}
 * @memberOf xhrAdaptorJs.XHRWrapper
 */
xhrAdaptorJs.XHRWrapper.prototype.eventDelegate = {};

/**
 * This is a simple helper method to simplify calling parent methods and constructors.
 * Note that this method should always be called in the context of the child.
 *
 * @example
 * <caption>
 * Example of using the  'parent' helper method to call the parent constructor
 * </caption>
 * this.parent.call(this).constructor.call(this, impl);
 *
 * @summary Return the parent object's prototype
 * @memberOf xhrAdaptorJs.XHRWrapper
 *
 * @returns {Object}
 */
xhrAdaptorJs.XHRWrapper.prototype.parent = function() {
	return Object.getPrototypeOf(Object.getPrototypeOf(this));
};

/**
 * This is a simple helper method to simplify retrieval of parent properties.
 * Note that this method should always be called in the context of the child.
 *
 * @example
 * <caption>
 * Example of using the  'parentProperty' helper method to call the getter of a parent property
 * </caption>
 * return this.parentProperty.call(this, "onreadystatechange").get.call(this);
 *
 * @summary Return the specified property of the parent object's prototype
 * @memberOf xhrAdaptorJs.XHRWrapper
 *
 * @returns {Object} The parent property
 */
xhrAdaptorJs.XHRWrapper.prototype.parentProperty = function(propertyName) {
	return Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Object.getPrototypeOf(this)), propertyName);
};


/**
 * This method determines whether the browser supports the ActiveXObject type.
 * 
 * @summary is the ActiveXObject type defined
 * @global
 * @private
 * @returns {Boolean}
 */
function isActiveXObjectSupported() {
	try {
		var dummy = {} instanceof ActiveXObject;
	} catch(e) {
		return false;
	}
	return true;
}

/**
 * Set this manually here to turn on internal debugging
 * @global
 * @private
 */ 
var debugXHR = false;

// Construct the XHRWrapper class prototype
(function() {
	var baseFactoryClass = isActiveXObjectSupported() ? ActiveXAwarePropMethodFactory : NativePropMethodFactory;
	var factoryClass = debugXHR ? deriveDebugFactoryFrom(baseFactoryClass) : baseFactoryClass;
	var factory = new factoryClass();
	var builder = new XHRWrapperProtoBuilder(factory, xhrAdaptorJs.XHRWrapper.prototype);

	builder
		.buildMethods(
			"abort",
			"getAllResponseHeaders",
			"getResponseHeader",
			"open",
			"overrideMimeType",
			"send",
			"setRequestHeader",
			"init",
			"openRequest",
			"sendAsBinary"
		)
		.buildEventProperties(
			"onreadystatechange",
			"ontimeout",
			"onloadstart",
			"onprogress",
			"onabort",
			"onerror",
			"onload",
			"onloadend"
		)
		.buildReadWriteProperties(
			"responseType",
			"timeout",
			"withCredentials",
			// Non-standard properties
			"mozBackgroundRequest",
			"multipart"
		)
		.buildReadWriteProperties(
			"readyState",
			"response",
			"responseText",
			"responseXML",
			"status",
			"statusText",
			"upload",
			// Non-standard properties
			"channel",
			"mozAnon",
			"mozSystem",
			"mozResponseArrayBuffer"
		);
})();

	xhrAdaptorJs = xhrAdaptorJs || {};

/**
 * The XHRManager class provides setup and management functionality related to XHR.
 * An instance of this class is globally available as {@link xhrAdaptorJs.manager}   
 * 
 * @summary XHR setup and management functionality
 * @memberOf xhrAdaptorJs
 *
 * @class
 */
xhrAdaptorJs.XHRManager = function() {
};

/**
 * This method either retrieves the XMLHttpRequest class or in the case that 
 * the XMLHttpRequest class is not available (such as on older IE browsers) the method
 * will return a psuedo-constructor that will instantiate the relevant ActiveX based
 * xhr object in place of a XMLHttpRequest object.
 * 
 * @summary Return a XMLHttpRequest class or ActiveX XMLHTTP object constructor.
 * @returns XHR object constructor/class
 * @memberOf xhrAdaptorJs.XHRManager
 */
xhrAdaptorJs.XHRManager.prototype.getXhrClass = function() {

	if(window.XMLHttpRequest !== undefined)
		return window.XMLHttpRequest;
	
	return function() {
	    try { 
	    	return new ActiveXObject("Msxml2.XMLHTTP.6.0"); 
	    } catch (e) {}
	    try { 
	    	return new ActiveXObject("Msxml2.XMLHTTP.3.0");
	    } catch (e) {}
	    try { 
	    	return new ActiveXObject("Microsoft.XMLHTTP");
	    } catch (e) {}
	    
	    throw new Error("This browser does not support XMLHttpRequest or ActiveX XMLHTTP.");
	};
};

// Private helper function to extract the class name of an object as a string
function getTypeString(obj) {
	var funcNameRegex = /function (.{1,})\(/;
	var results = (funcNameRegex).exec(obj.constructor.toString());
	return (results && results.length > 1) ? results[1] : "";
}

/**
 * This method injects the provided {@link xhrAdaptorJs.XHRWrapper} derived wrapper class into 
 * the XMLHttpRequest wrapper chain so that any code executing "new XMLHttpRequest()" will instead
 * instantiate the provided wrapper class.
 * 
 * This method may be called multiple times in order to build a chain of {@link xhrAdaptorJs.XHRWrapper}
 * objects.
 * 
 * @summary Inject a wrapper class into the XMLHttpRequest wrapper chain.
 * @param {xhrAdaptorJs.XHRWrapper} xhrWrapperClass The XHRWrapper derived class to inject. Note that
 * the constructor of the wrapper class must accept the 'impl' parameter and pass this to the parent
 * wrapper classes constructor.
 * @memberOf xhrAdaptorJs.XHRManager
 */
xhrAdaptorJs.XHRManager.prototype.injectWrapper = function(xhrWrapperClass) {

	var prevXhr = this.getXhrClass();

	var typeString = getTypeString(window.XMLHttpRequest.prototype);

	if(typeString != "xhrWrapperClosure") {
		window.origXMLHttpRequest = prevXhr;
	}

	XMLHttpRequest = function xhrWrapperClosure() {
		return new xhrWrapperClass(new prevXhr());
	};
};

/**
 * The DOM XMLHttpRequest object is reset by having first caputed the original object when
 * {@link xhrAdaptorJs.XHRManager.injectWrapper} is called
 * and then replacing window.XMLHttpRequest with this original object.
 *
 * @summary Reset the DOM with the original XMLHttpRequest object
 * @memberOf xhrAdaptorJs.XHRManager
 *
 */
xhrAdaptorJs.XHRManager.prototype.resetXHR = function() {

	if(window.origXMLHttpRequest !== undefined ) {
		window.XMLHttpRequest = window.origXMLHttpRequest;
	}
};

/**
 *
 * @memberOf xhrAdaptorJs
 * @static 
 * @type {xhrAdaptorJs.XHRManager}
 * 
 */
xhrAdaptorJs.manager = new xhrAdaptorJs.XHRManager();

	xhrAdaptorJs = xhrAdaptorJs || {};

/**
 * @summary The BlockingRequestQueueXHR allows a response to be intercepted and processed while queuing all other requests until processing is complete
 *
 * This class is allows special processing to occur in certain situations, based on an ajax response, while queuing background requests.
 * A callback is provided to allow the queued requests to be processed meaning that the 'special processing' can occur asynchronously.
 * An example use case for the BlockingRequestQueueXHR is where it can be used to pop open an authentication dialog and wait for a user to authenticate,
 * meanwhile all requests are queued while the system waits for the user's input. This prevents the scenario of having multiple ajax calls being denied since
 * once the user is authenticated, the queued requests can then continue through to the server where they can be processed normally, in an authenticated context.
 *
 * @class
 * @memberOf xhrAdaptorJs
 * @augments xhrAdaptorJs.XHRWrapper
 * @tutorial BlockingRequestQueue
 *
 * @param {XMLHttpRequest} impl The implementation object that this BlockingRequestQueueXHR object is to wrap.
 *
 */
xhrAdaptorJs.BlockingRequestQueueXHR = function(impl) {
	// Set by 'open'
	this.openArgs = null;
	this.parent().constructor.call(this, impl);
};

xhrAdaptorJs.BlockingRequestQueueXHR.prototype = Object.create(xhrAdaptorJs.XHRWrapper.prototype);
xhrAdaptorJs.BlockingRequestQueueXHR.constructor = xhrAdaptorJs.BlockingRequestQueueXHR;

//////////////////////////////// 'private' functions /////////////////////////////////////////////

/**
 * Creates a callback which is associated to the provided requestHandlerObj
 * that, when called, will unblock the request queue, allowing requests to
 * be processed.
 *
 * @summary Create a 'continue' callback function for the user defined function to call
 * @global
 * @private
 * @param {Object} delegateObj The event delegate object provided to the XHRWrapper 'onreadystatechange' event
 * @param {Object} requestHandlerEntry The requestHandlerEntry that the continue callback will unblock
 * @param {...any} args Arguments that were passed to the initial 'onreadystatechange' event delegate callback.
 * @returns {Function} Returns a function that when called, will unblock the request queue
 */
function createContinueCallback(delegateObj, requestHandlerEntry, args) {

	return function (relayEvent) {

		if(relayEvent || relayEvent === undefined) {
			delegateObj.applyRealHandler(args);
		}

		requestHandlerEntry.isBlocked = false;

		// Process all of the remaining requests
		var requestQueue = xhrAdaptorJs.BlockingRequestQueueXHR.prototype.requestQueue;

		if(requestQueue === undefined)
			return;
		while(requestQueue.length > 0) {
			var request = xhrAdaptorJs.BlockingRequestQueueXHR.prototype.requestQueue.shift();
			request();
		}
	};
}

/**
 * Returns either the response handler entry that matches the URL of this
 * XHR object or NULL if there is no matching response handler.
 *
 * @summary Find the first request handler entry that matches the provided request URL
 * @global
 * @private
 * @param {String} requestURL The URL that is being matched.
 * @returns {Object} Either the request handler entry that matches the URL or null if there are no matches.
 */
function findResponseHandlerMatch(requestURL) {
	//var handlerMap = Object.getPrototypeOf(this).responseHandlerMap;
	for(var key in this.responseHandlerMap) {
		if(!this.responseHandlerMap.hasOwnProperty(key)) continue;

		if(new RegExp(key, "g").test(requestURL))
			return Object.getPrototypeOf(this).responseHandlerMap[key];
	}
	return null;
}

/**
 * This method will invoke the first matching response handler, causing any further matching requests
 * to be blocked until the 'continue' callback is invoked in the user defined response handler.
 * If there are no matching response handler entries then the response will pass through as normal.
 *
 * @summary Invoke the first matching response handler.
 * @global
 * @private
 * @param {...any} args Arguments that were passed to the initial 'onreadystatechange' event delegate callback.
 */
function processResponse(args) {

	var me = this;
	
	// Check each of the registered response handlers to see if their key (a regex)
	// matches the URL that is being opened
	var handlerObj = findResponseHandlerMatch.call(this._xhr, this._xhr.getRequestURL());
	
	if(handlerObj === null) {
		// No match, just allow the request to continue as usual
		me.applyRealHandler(args);
		return;
	}

	// There is a match but before calling the handler, check if the request is already blocked
	if(handlerObj.isBlocked) {
		this._xhr.resend();
		console.debug("Failed to catch blocked request in time, ignoring response and adding request to queue.");
		return;
	}
	
	// Set the matching handler to blocked and invoke it
	handlerObj.invokeHandler(this, args);
}
////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////// 'statics' ////////////////////////////////////////////////////

/**
 * @summary The static response handler entry map
 *
 * This map stores all the response handler entries registered by {@link xhrAdaptorJs.BlockingRequestQueueXHR.registerResponseHandler}
 * The response handler entries are stored in 'key => value' pairs where the key is a URL regEx and the value is
 * an object with the following fields:
 *   handler: A function which represents the response handler set by the caller
 *   blocked: A boolean flag indicating whether requests matching this key are currently blocked.
 *
 * @memberOf xhrAdaptorJs.BlockingRequestQueueXHR
 * @static
 * @private
 * @type {Object}
 *
 */
xhrAdaptorJs.BlockingRequestQueueXHR.prototype.responseHandlerMap = {};

/**
 * @summary The request queue
 *
 * The request queue of blocked requests. This is an array of closure functions wrapping
 * either the parent classes 'send', 'onload' or 'onreadystatechange' method.
 * This allows requests to be 'suspended' and then later resumed by calling the closure.
 *
 * @memberOf xhrAdaptorJs.BlockingRequestQueueXHR
 * @static
 * @private
 * @type {Array}
 *
 */
xhrAdaptorJs.BlockingRequestQueueXHR.prototype.requestQueue = [];
//////////////////////////////////////////////////////////////////////////////////////////

//
/**
 * @summary Open the specified URL
 *
 * This simple override is used to capture the URL of the XHR request so it can be retrieved later when
 * 'send' is called.
 *
 * @memberOf xhrAdaptorJs.BlockingRequestQueueXHR
 * @private
 */
xhrAdaptorJs.BlockingRequestQueueXHR.prototype.open = function(verb, url, async) {
	this.openArgs = arguments;
	this.parent().open.apply(this, this.openArgs);
};

/**
 * @summary send the request
 *
 * This override will check to see if the request URL matches that of a currently blocked
 * response handler entry. If the response handler entry for the URL is blocked then the request is simply queued for later
 * execution.
 *
 * @memberOf xhrAdaptorJs.BlockingRequestQueueXHR
 * @private
 */
xhrAdaptorJs.BlockingRequestQueueXHR.prototype.send = function() {

	var me = this;

	var args = arguments;
	
	// Check each of the registered response handlers to see if their key (a regex)
	// matches the URL that is being opened
	var handlerObj = findResponseHandlerMatch.call(this, this.getRequestURL());
	
	// There is a match so check if the request is blocked
	if(handlerObj !== null && handlerObj.isBlocked) {
		// Add the handler to the queue as a closure but do not call it yet
		xhrAdaptorJs.BlockingRequestQueueXHR.prototype.requestQueue.push(function() {
			me.parent().send.apply(me, args);
		});
		return;
	}

	me.parent().send.apply(me, args);
};

/**
 * @summary Resend the request
 * @description
 * This convenience method will resend a request by performing the following steps:
 * - Calling 'open' again on the underlying xhr object, passing the same arguments that were originally given.
 * - Calling 'send' again on the underlying xhr object.
 *
 * @memberOf xhrAdaptorJs.BlockingRequestQueueXHR
 * @private
 */
xhrAdaptorJs.BlockingRequestQueueXHR.prototype.resend = function() {
	this.open.apply(this, this.openArgs);
	this.send.apply(this, arguments);
};

/**
 * @summary Get the request URL
 * @description
 * Retrieves the request URL that was passed to 'open'
 *
 * @memberOf xhrAdaptorJs.BlockingRequestQueueXHR
 * @private
 * @returns {String} The request URL or null if one has not been provided.
 */
xhrAdaptorJs.BlockingRequestQueueXHR.prototype.getRequestURL = function() {

	if(this.openArgs === null || this.openArgs.length < 2) {
		return null;
	}
	return this.openArgs[1];
};

/**
 * @summary Get the request verb (e.g. 'get', 'post' etc)
 * @description
 * Retrieves the request verb that was passed to 'open'
 *
 * @memberOf xhrAdaptorJs.BlockingRequestQueueXHR
 * @private
 * @returns {String} The request verb or null if one has not been provided.
 */
xhrAdaptorJs.BlockingRequestQueueXHR.prototype.getRequestVerb = function() {

	if(this.openArgs === null || this.openArgs.length < 1) {
		return null;
	}
	return this.openArgs[0];
};


/**
 * @summary Register a response handler and a URL matching regular expression.
 * @description
 * This method should be used to register a response handler for a particular URL.
 * The provided response handler should be a function which takes the following two arguments:
 *
 * - doContinue - This is a function that should be called to signal that request processing should continue (see below)
 * - xhr 	    - This is the XMLHttpRequest object that sent the request (actually a BlockingRequestQueueXHR object)
 *
 * When the provided response handler callback is called, all further requests that match the associated URL
 * regular expression will be queued until the 'doContinue' callback function is invoked.
 *
 * The 'doContinue' function itself supports one optional boolean argument (defaults to true) which when true will cause the
 * response to be relayed back to the XMLHttpRequest object that initiated the request. If this argument is false then
 * the event will not be relayed.
 *
 * @example
 * <caption>
 * <H4>Example response handler</H4>
 * This example shows what a simple response handler function should look like.
 * </caption>
 *     var responseHandler = function(doContinue, xhr) {

 *     		if(xhr.responseText == "Whoa!! not so fast, you need to log in!") {
 *     			// Do some stuff
 *     			...
 *     			// Call this when finished, passing false to indicate that we handled the event
 *     			// Note that there is no need to necessarily have to call this within this function,
 *     			// doContinue could also be called say, on a 'onClick' event of a button or something similar.
 *     			doContinue(false);
 *     		} else {
 *     			// No need to do anything here, just continue and pass true to indicate that this
 *     			// event is to be handled by the XMLHttpRequest object that sent it.
 *     			doContinue(true);
 *     		}
 *     }
 *
 * @example
 * <caption>
 * <H4>Example registration of a response handler</H4>
 * This example shows how to register a response handler that will be executed when
 * requesting any URL containing 'www.acme.com'.
 * </caption>
 *     xhrAdaptorJs.BlockingRequestQueueXHR.registerResponseHandler("www.acme.com", responseHandler);
 *
 * @function registerResponseHandler
 * @memberOf xhrAdaptorJs.BlockingRequestQueueXHR
 * @static
 * @param {String} urlRegEx The URL regular expression string (without the starting and ending forward slash).
 * @param {Function} responseHandler The response handler function that is to be invoked on a matching URL.
 * @param {Object} [handlerContext] This optional argument allows for a context object to be used when invoking the response handler.
 * 									If one is not provided then the BlockingRequestQueueXHR object will be used as the call context.
 */
xhrAdaptorJs.BlockingRequestQueueXHR.prototype.registerResponseHandler = function(urlRegEx, responseHandler, handlerContext) {

	if(urlRegEx in xhrAdaptorJs.BlockingRequestQueueXHR.prototype.responseHandlerMap) {
		console.error("Attempted to register handler for existing regex expression '" + urlRegEx + "'");
		return;
	}

	var me = this;

	var requestHandlerEntry = {
		handler: responseHandler,
		context: handlerContext || me,
		isBlocked: false,
		invokeHandler : function (delegateObj, args) {
			requestHandlerEntry.isBlocked = true;
			requestHandlerEntry.handler.call(handlerContext, createContinueCallback(delegateObj, requestHandlerEntry, args), delegateObj._xhr);
		}
	};

	xhrAdaptorJs.BlockingRequestQueueXHR.prototype.responseHandlerMap[urlRegEx] = requestHandlerEntry;
};
xhrAdaptorJs.BlockingRequestQueueXHR.registerResponseHandler = xhrAdaptorJs.BlockingRequestQueueXHR.prototype.registerResponseHandler;

/**
 * @summary unregister a response handler entry.
 *
 * This method is used to unregister a previously registered response handler.
 *
 * @function unregisterResponseHandler
 * @memberOf xhrAdaptorJs.BlockingRequestQueueXHR
 * @static
 * @param {String} urlRegEx The URL regular expression string that was used to register the response handler
 *                          that should now be unregistered.
 */
xhrAdaptorJs.BlockingRequestQueueXHR.prototype.unregisterResponseHandler = function(urlRegEx) {
	delete xhrAdaptorJs.BlockingRequestQueueXHR.prototype.responseHandlerMap[urlRegEx];
};
xhrAdaptorJs.BlockingRequestQueueXHR.unregisterResponseHandler = xhrAdaptorJs.BlockingRequestQueueXHR.prototype.unregisterResponseHandler;

/**
 * @summary unregister all response handler entries.
 *
 * @function clearResponseHandlers
 * @memberOf xhrAdaptorJs.BlockingRequestQueueXHR
 * @static
 */
xhrAdaptorJs.BlockingRequestQueueXHR.prototype.clearResponseHandlers = function() {
	xhrAdaptorJs.BlockingRequestQueueXHR.prototype.responseHandlerMap = {};
};
xhrAdaptorJs.BlockingRequestQueueXHR.clearResponseHandlers = xhrAdaptorJs.BlockingRequestQueueXHR.prototype.clearResponseHandlers;

/**
 * @summary Hook the 'onreadystatechange' event so that the response handlers can be checked.
 *
 * @memberOf xhrAdaptorJs.BlockingRequestQueueXHR
 * @static
 * @private
 */
xhrAdaptorJs.BlockingRequestQueueXHR.prototype.eventDelegate = {
	onreadystatechange : function () {
		
		var args = arguments;
		var xhr = this._xhr;
		
		if(xhr.readyState == 4) {
			processResponse.call(this, args);
		} else {
			// NB make sure you always call this as the ActiveX version of XHR
			// will actually cease to call onreadystatechange if this is not called
			// i.e. you will only get the first event where readyState == 1
			this.applyRealHandler(args);
		}
	}
	//TODO: Detect if onload is implemented and use in preference to onreadystatechange
	/*
	onload : function () {
		processResponse.call(this, arguments);
	}
	*/
};


    return xhrAdaptorJs;
});
