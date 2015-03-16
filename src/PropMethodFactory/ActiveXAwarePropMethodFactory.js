function ActiveXAwarePropMethodFactory() {
	
} 

ActiveXAwarePropMethodFactory.prototype = Object.create(NativePropMethodFactory.prototype);
ActiveXAwarePropMethodFactory.constructor = ActiveXAwarePropMethodFactory;

ActiveXAwarePropMethodFactory.prototype.getProperty = function(obj, propertyName) {
	
	if(obj instanceof ActiveXObject) {
		/*jshint -W061 */
		return eval("obj." + propertyName + ";");
	}
	return NativePropMethodFactory.prototype.getProperty.apply(this, arguments);
};

ActiveXAwarePropMethodFactory.prototype.setProperty = function(obj, propertyName, value) {
	if(obj instanceof ActiveXObject) {
		/*jshint -W061 */
		eval("obj." + propertyName + " = value;");
		return;
	}
	NativePropMethodFactory.prototype.setProperty.apply(this, arguments);
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
	
	return NativePropMethodFactory.prototype.invokeMethod.apply(this, arguments);
};
