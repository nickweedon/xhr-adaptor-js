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

// Argument 'realHandler' is supplied here simply so that the derived classes 
// have access to it for logging/debugging purposes
NativePropMethodFactory.prototype.setEventProperty = function(obj, propertyName, delState, delFunc, realHandler) {
	
	// This final wrapper function acts as a closure that merely sets 
	// the 'this' context to delState before calling the delegate function
	var delWrapper = function() {
		delFunc.apply(delState, arguments);
	};
	this.setProperty(obj, propertyName, delWrapper);	
};

