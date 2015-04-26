//@@include('PropMethodFactory/PropMethodFactoryBase.js')
//@@include('PropMethodFactory/NativePropMethodFactory.js')
//@@include('PropMethodFactory/ActiveXAwarePropMethodFactory.js')
//@@include('PropMethodFactory/DebugPropMethodFactory.js')
//@@include('XHRWrapperProtoBuilder.js')

/**
 * XHRWrapper constructor
 * 
 * @summary The base class for further XHR behavior customization
 * @param {XMLHttpRequest} impl The implementation object that this XHRWrapper object is to wrap.
 * 
 * @classdesc
 * <p>
 * This class is essentially a proxy class that wraps all of the methods and properties of the
 * underlying XHR based implementation which is provided as a parameter to the constructor.
 * </p><p>
 * This class is normally used as a base class which is extended by a derived class to perform tasks
 * such as intercepting and logging XHR request or filtering or even delaying events. The derived 
 * class can either be instantiated and used directly or 'injected' into the browser so that it 
 * is seamlessly instantiated in place of the native XMLHttpRequest class.
 * </p><p>
 * When instantiating the derived class directly it is helpful to instantiate the native 
 * XMLHttpRequest object using the {@link xhrAdaptorJs.XHRManager#getXhrClass} method.
 * </p>
 * @example
 * <caption>
 * <H4>Deriving from XHRWrapper</H4>
 * This example shows how to derive from XHRWrapper
 * </caption>
 *  
 * function myXhrWrapper(impl) {
 * 		// Always call the parent constructor, passing 'impl'
 * 		xhrAdaptorJs.XHRWrapper.call(this, impl);
 * }
 * myXhrWrapper.prototype = Object.create(xhrAdaptorJs.XHRWrapper.prototype);
 * myXhrWrapper.constructor = myXhrWrapper;
 * myXhrWrapper.open = function(method, url) {
 * 		console.debug("Opening " + url);
 * 		// Always call the parent method
 * 		xhrAdaptorJs.XHRWrapper.prototype.open.apply(this, arguments);
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
 * // Note that we pass the actual derived class, not an instance of the class 
 * xhrAdaptorJs.manager.injectWrapper(myXhrWrapper);
 * 
 * // This is actually instantiating a myXhrWrapper class 
 * var xhr = new XMLHttpRequest();
 * 
 * 
 * @class
 * @memberOf xhrAdaptorJs
 */
xhrAdaptorJs.XHRWrapper = function(impl) {
	
	console.assert(impl !== undefined, "Wrapped implementation must be passed as the first argument to the XHRWrapper constructor.");
	
	this.impl = impl;
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
 *   
 * @example
 * <caption>
 * <h4>Create a 'onreadystatechange' delegate</h4>
 * This example shows how to create a 'onreadystatechange' event delegate that will
 * delay the response by 3 seconds.
 * </caption>
 * function myXhrWrapper(impl) {
 * 	// Always call the parent constructor, passing 'impl'
 * 	xhrAdaptorJs.XHRWrapper.call(this, impl);
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
 * 	xhrAdaptorJs.XHRWrapper.call(this, impl);
 * }
 * myXhrWrapper.prototype = Object.create(xhrAdaptorJs.XHRWrapper.prototype);
 * myXhrWrapper.constructor = myXhrWrapper;
 * // Register the delegate
 * 
 * XHRClass.prototype.eventDelegate = {
 *	onload : function () {
 *		console.debug("The response is: " + this.xhr.responseText);
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
 * @type {Object}
 * @memberOf xhrAdaptorJs.XHRWrapper
 */
xhrAdaptorJs.XHRWrapper.prototype.eventDelegate = {};

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
	
	builder.buildMethods(
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
	);
	
	builder.buildEventProperties(
		"onreadystatechange",
		"ontimeout",
		"onloadstart",
		"onprogress",
		"onabort",
		"onerror",
		"onload",
		"onloadend"
	);
	
	
	builder.buildReadWriteProperties(
		"responseType",
		"timeout",
		"withCredentials",
		// Non-standard properties
		"mozBackgroundRequest",
		"multipart"
	);
	
	builder.buildReadWriteProperties(
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
