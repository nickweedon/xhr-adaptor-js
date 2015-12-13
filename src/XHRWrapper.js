//@@include('PropMethodFactory/PropMethodFactoryBase.js')
//@@include('PropMethodFactory/NativePropMethodFactory.js')
//@@include('PropMethodFactory/ActiveXAwarePropMethodFactory.js')
//@@include('PropMethodFactory/DebugPropMethodFactory.js')
//@@include('XHRWrapperProtoBuilder.js')

var xhrAdaptorJs = xhrAdaptorJs || {};

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
 *   xhrAdaptorJs.XHRWrapper.prototype.constructor.call(this, impl);
 * }
 * myXhrWrapper.prototype = Object.create(xhrAdaptorJs.XHRWrapper.prototype);
 * myXhrWrapper.constructor = myXhrWrapper;
 * myXhrWrapper.open = function(method, url) {
 *   console.debug("Opening " + url);
 *   // Always call the parent method
 *   xhrAdaptorJs.XHRWrapper.prototype.open.call(this, verb, url, async);
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
 *		var parentProp = Object.getOwnPropertyDescriptor(xhrAdaptorJs.XHRWrapper.prototype, "responseText");
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
 *	xhrAdaptorJs.XHRWrapper.prototype.constructor.call(this, impl);
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
 *	xhrAdaptorJs.XHRWrapper.prototype.constructor.call(this, impl);
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
