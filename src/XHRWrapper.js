//@@include('PropMethodFactory/PropMethodFactoryBase.js')
//@@include('PropMethodFactory/NativePropMethodFactory.js')
//@@include('PropMethodFactory/ActiveXAwarePropMethodFactory.js')
//@@include('PropMethodFactory/DebugPropMethodFactory.js')
//@@include('XHRWrapperProtoBuilder.js')

xhrAdaptorJs.XHRWrapper = function(impl) {
	
	console.assert(impl !== undefined, "Wrapped implementation must be passed as the first argument to the XHRWrapper constructor.");
	
	this.impl = impl;
};

function isActiveXObjectSupported() {
	try {
		var dummy = {} instanceof ActiveXObject;
	} catch(e) {
		return false;
	}
	return true;
}

// Set this manually here to turn on internal debugging
var debugXHR = false;

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


