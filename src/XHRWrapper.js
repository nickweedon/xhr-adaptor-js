//@@include('PropMethodFactory/PropMethodFactoryBase.js')
//@@include('PropMethodFactory/NativePropMethodFactory.js')
//@@include('PropMethodFactory/ActiveXAwarePropMethodFactory.js')
//@@include('PropMethodFactory/DebugPropMethodFactory.js')
//@@include('XHRWrapperProtoBuilder.js')

/**
 * This class is essentially a proxy class and wraps all of the methods and properties of the
 * underlying implementation which is provided as a parameter to the constructor.
 * 
 * This class is normally used as a base class which is derived from. The derived class can then
 * either be instantiated and used directly or 'injected' into the browser so that it is seamlessly 
 * instantiated in place of the native XMLHttpRequest class.
 * 
 * When instantiating the derived class directly it is helpful to instantiate the native 
 * XMLHttpRequest object using the 
 *
 * @summary The base class for further XHR behavior customization
 * @param {XMLHttpRequest} impl The implementation object that this XHRWrapper object is to wrap.
 * @class
 * @memberOf xhrAdaptorJs
 */
xhrAdaptorJs.XHRWrapper = function(impl) {
	
	console.assert(impl !== undefined, "Wrapped implementation must be passed as the first argument to the XHRWrapper constructor.");
	
	this.impl = impl;
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
