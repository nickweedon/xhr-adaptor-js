
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
