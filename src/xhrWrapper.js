//@@include('PropMethodFactory/PropMethodFactoryBase.js')
//@@include('PropMethodFactory/NativePropMethodFactory.js')
//@@include('PropMethodFactory/ActiveXAwarePropMethodFactory.js')

function isActiveXObjectSupported() {
	try {
		var dummy = {} instanceof ActiveXObject;
	} catch(e) {
		return false;
	}
	return true;
}

var factory = isActiveXObjectSupported() ? new ActiveXAwarePropMethodFactory() : new NativePropMethodFactory();

xhrAdaptorJs.xhrWrapper = function(impl) {
	
	console.assert(impl !== undefined, "Wrapped implementation must be passed as the first argument to the xhrWrapper constructor.");
	
	this.impl = impl;
};

var methodNames = [
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
];

// Create methods
for(var i = 0; i < methodNames.length; i++) {
	var methodName = methodNames[i];
	xhrAdaptorJs.xhrWrapper.prototype[methodName] = factory.createMethod(methodName);
}

var evtPropertyNames = [
	"onreadystatechange",
	"ontimeout"
];

// Create event based properties (the handler injects a delegate if one is defined)
for(var i = 0; i < evtPropertyNames.length; i++) {
	var propertyName = evtPropertyNames[i];
	Object.defineProperty(xhrAdaptorJs.xhrWrapper.prototype, propertyName, {
		get : factory.createPropGetter(propertyName),
		set : factory.createEvtPropSetter(propertyName)
	}); 
}

// Create standard read/write properties
var readWritePropertyNames = [
	"responseType",
	"timeout",
	"withCredentials",
	// Non-standard properties
	"mozBackgroundRequest",
	"multipart"
];

for(var i = 0; i < readWritePropertyNames.length; i++) {
	var propertyName = readWritePropertyNames[i];
	Object.defineProperty(xhrAdaptorJs.xhrWrapper.prototype, propertyName, {
		get : factory.createPropGetter(propertyName),
		set : factory.createPropSetter(propertyName)
	});
}

// Create standard read-only properties
var readOnlyPropertyNames = [
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
];

for(var i = 0; i < readOnlyPropertyNames.length; i++) {
	var propertyName = readOnlyPropertyNames[i];
	Object.defineProperty(xhrAdaptorJs.xhrWrapper.prototype, propertyName, {
		get : factory.createPropGetter(propertyName)
	});
}

