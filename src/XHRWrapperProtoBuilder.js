
/**
 * This is a classic GoF builder that uses the provided abstract factory
 * to build the provided prototype.
 */
function XHRWrapperProtoBuilder(factory, proto, nativeXhrInstance) {
	this.factory = factory;
	this.proto = proto;
	this.nativeXhrInstance = nativeXhrInstance;
}

XHRWrapperProtoBuilder.prototype.buildMethods = function() {

	for(var i = 0; i < arguments.length; i++) {
		var methodName = arguments[i];
		if(this.nativeXhrInstance !== null && !(methodName in this.nativeXhrInstance)) {
			continue;
		}
		this.proto[methodName] = this.factory.createMethod(methodName);
	}

	return this;
};

// Create event based properties (the handler injects a delegate if one is defined)
XHRWrapperProtoBuilder.prototype.buildEventProperties = function() {
	
	for(var i = 0; i < arguments.length; i++) {
		var propertyName = arguments[i];

		if(this.nativeXhrInstance !== null && !(propertyName in this.nativeXhrInstance)) {
			continue;
		}

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

		if(this.nativeXhrInstance !== null && !(propertyName in this.nativeXhrInstance)) {
			continue;
		}

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

		if(this.nativeXhrInstance !== null && !(propertyName in this.nativeXhrInstance)) {
			continue;
		}

		Object.defineProperty(this.proto, propertyName, {
			get : this.factory.createPropGetter(propertyName)
		});
	}

	return this;
};
