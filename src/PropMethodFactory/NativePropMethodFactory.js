/**
 * This factory creates accessors, setters and methods that simply directly call the
 * underlying implementation using javascript's 'apply' feature for calling methods
 * and its property indexing operator [] for proxying property access.
 * 
 * @summary Factory for native only (non-activeX) proxying
 * @private
 * @global
 * @class
 * @augments PropMethodFactoryBase
 */
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

NativePropMethodFactory.prototype.setEventProperty = function(obj, propertyName, delState, delFunc, realHandler) {
	
	// This final wrapper function acts as a closure that merely sets 
	// the 'this' context to delState before calling the delegate function
	var delWrapper = function() {
		delFunc.apply(delState, arguments);
	};
	this.setProperty(obj, propertyName, delWrapper);	
};

