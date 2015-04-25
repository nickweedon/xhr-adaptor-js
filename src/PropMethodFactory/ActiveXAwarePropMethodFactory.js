/**
 * This factory creates accessors, setters and methods that call into an ActiveX based
 * implementation.
 * This means that javascript based features such as 'apply' and the property indexing 
 * operator [] are unavailable.
 * This factory therefore provides setters, getters and method invoking functions which
 * use 'eval' in order to invoke the underlying method.
 * 
 * @summary Factory for ActiveX proxying
 * @private
 * @global
 * @class
 * @augments NativePropMethodFactory
 */
function ActiveXAwarePropMethodFactory() {
	
} 

ActiveXAwarePropMethodFactory.prototype = Object.create(NativePropMethodFactory.prototype);
ActiveXAwarePropMethodFactory.constructor = ActiveXAwarePropMethodFactory;

ActiveXAwarePropMethodFactory.prototype.getProperty = function(obj, propertyName) {
	
	if(obj instanceof ActiveXObject) {
		/*jshint -W061 */
		return eval("obj." + propertyName + ";");
	}
	return this._parent().getProperty.apply(this, arguments);
};

ActiveXAwarePropMethodFactory.prototype.setProperty = function(obj, propertyName, value) {
	if(obj instanceof ActiveXObject) {
		/*jshint -W061 */
		eval("obj." + propertyName + " = value;");
		return;
	}
	return this._parent().setProperty.apply(this, arguments);
};

ActiveXAwarePropMethodFactory.prototype.invokeMethod = function(obj, methodName, args) {
	
	if(obj instanceof ActiveXObject) {
		var evalStr = "obj." + methodName + "(";
		
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

	return this._parent().invokeMethod.apply(this, arguments);
};
