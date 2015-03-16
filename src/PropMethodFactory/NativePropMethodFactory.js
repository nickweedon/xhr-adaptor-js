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

