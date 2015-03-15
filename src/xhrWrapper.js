
xhrAdaptorJs.xhrWrapper = function(impl) {
	
	console.assert(impl !== undefined, "Wrapped implementation must be passed as the first argument to the xhrWrapper constructor.");
	
	this.impl = impl;
};

function invokeActiveXMethod(funcName, impl, args) {
	
	var evalStr = "impl." + funcName + "(";
	
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

function isActiveXObjectSuppoerted() {
	try {
		var dummy = {} instanceof ActiveXObject;
	} catch(e) {
		return false;
	}
	return true;
}

var activeXAwarePropMethodFactory = {
	createMethod : function(methodName) {
		return function() {
			if(this.impl instanceof ActiveXObject)
				return invokeActiveXMethod(methodName, this.impl, arguments);
			return this.impl[methodName].apply(this.impl, arguments);
		};
	},
	createPropGetter : function(propertyName) {
		return function() {
			if(this.impl instanceof ActiveXObject) {
				/*jshint -W061 */
				return eval("this.impl." + propertyName + ";");
			}
			return this.impl[propertyName];
		};
	},
	createPropSetter : function(propertyName) {
		return function(value) {
			if(this.impl instanceof ActiveXObject) {
				/*jshint -W061 */
				eval("this.impl." + propertyName + " = value;");
			} else {
				this.impl[propertyName] = value;
			}
		};
	},
	createEvtPropSetter : function(propertyName) {
		return function(value) {
			if(this.eventDelegate !== undefined && propertyName in this.eventDelegate) {
				var delFunc = this.eventDelegate[propertyName];
				var delState = { realHandler: value };
				var delWrapper = function() {
					delState.realScope = this;
					delFunc.apply(delState, arguments);
				};
				
				if(this.impl instanceof ActiveXObject) {
					/*jshint -W061 */
					eval("this.impl." + propertyName + " = delWrapper;");
				} else {
					this.impl[propertyName] = delWrapper;
				}
					
				return;
			}
			if(this.impl instanceof ActiveXObject) {
				/*jshint -W061 */
				eval("this.impl." + propertyName + " = value;");
			} else {
				this.impl[propertyName] = value;
			}
		};
	},
	createNullPropSetter : function () {}
};

var nativePropMethodFactory = {
	createMethod : function(methodName) {
		return function() {
			return this.impl[methodName].apply(this.impl, arguments);
		};
	},
	createPropGetter : function(propertyName) {
		return function() {
			return this.impl[propertyName];
		};
	},
	createPropSetter : function(propertyName) {
		return function(value) {
			this.impl[propertyName] = value;
		};
	},
	createEvtPropSetter : function(propertyName) {
		return function(value) {
			if(this.eventDelegate !== undefined && propertyName in this.eventDelegate) {
				var me = this;
				var delFunc = this.eventDelegate[propertyName];
				var delState = { 
						realHandler: value,
						callRealHandler : function() {
							delState.realHandler.apply(me, arguments);
						}
				};
				var delWrapper = function() {
					delState.realScope = this;
					delFunc.apply(delState, arguments);
				};
				
				this.impl[propertyName] = delWrapper;
				return;
			}
			
			this.impl[propertyName] = value;
		};
	},
	createNullPropSetter : function () {}
};

var factory = isActiveXObjectSuppoerted() ? activeXAwarePropMethodFactory : nativePropMethodFactory;

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
		set : factory.createNullPropSetter(propertyName),
		get : factory.createPropGetter(propertyName)
	});
}


///////////// Properties ////////////////////////