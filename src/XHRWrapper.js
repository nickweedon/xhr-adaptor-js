//@@include('PropMethodFactory/PropMethodFactoryBase.js')
//@@include('PropMethodFactory/NativePropMethodFactory.js')
//@@include('PropMethodFactory/ActiveXAwarePropMethodFactory.js')
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
var factory = isActiveXObjectSupported() ? new ActiveXAwarePropMethodFactory() : new NativePropMethodFactory();
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
	"ontimeout"	
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


