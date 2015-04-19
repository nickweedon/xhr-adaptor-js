
/**
 * This function dynamically derives a debug class from the specified base class
 * 
 * @param baseClass
 * @returns {DebugNativePropMethodFactory}
 */
function deriveDebugFactoryFrom(baseClass) {
	
	function DebugNativePropMethodFactory() {
		
	}

	DebugNativePropMethodFactory.prototype = Object.create(baseClass.prototype);
	DebugNativePropMethodFactory.constructor = DebugNativePropMethodFactory; 

	DebugNativePropMethodFactory.prototype.getProperty = function(obj, propertyName) {
		console.debug("Retrieving value for property " + propertyName);
		return this._parent().getProperty.apply(this, arguments);
	};

	DebugNativePropMethodFactory.prototype.setProperty = function(obj, propertyName, value) {
		if(!('_skipPropLog' in obj))
			console.debug("Setting value of property " + propertyName + " to: " + value);
		this._parent().setProperty.apply(this, arguments);	
	};

	DebugNativePropMethodFactory.prototype.invokeMethod = function(obj, methodName, args) {
		var arrArgs = [];
		for(var i = 0; i < args.length; i++)
			arrArgs[i] = args[i];
		console.debug("Invoking " + methodName + "(" + JSON.stringify(arrArgs) + ")");
		return this._parent().invokeMethod.apply(this, arguments);	
	};


	DebugNativePropMethodFactory.prototype.setEventProperty = function(obj, propertyName, delState, delFunc, realHandler) {
		console.debug("Setting value of property " + propertyName + " to: " + realHandler);
		obj._skipPropLog = true;
		try {
			this._parent().setEventProperty.apply(this, arguments);
		} finally {
			delete obj._skipPropLog;
		}
		
	};
	
	return DebugNativePropMethodFactory;
}

