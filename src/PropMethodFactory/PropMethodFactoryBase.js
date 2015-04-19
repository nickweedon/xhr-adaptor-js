/**\
 * This class follows both the template and abstract factory design pattern
 * 
 * All of the factory logic lies in this abstract class and the derived classes
 * implement the actual property and method accessing logic.
 * 
 */
function PropMethodFactoryBase() {
	
}

PropMethodFactoryBase.prototype._parent = function() {
	return Object.getPrototypeOf(Object.getPrototypeOf(this));
};

PropMethodFactoryBase.prototype.createMethod = function(methodName) {
	var me = this;
	
	return function() {
		return me.invokeMethod(this.impl, methodName, arguments);
	};
};

PropMethodFactoryBase.prototype.createPropGetter = function(propertyName) {
	var me = this;
	
	return function() {
		return me.getProperty(this.impl, propertyName);
	};
};

PropMethodFactoryBase.prototype.createPropSetter = function(propertyName) {
	var me = this;
	
	return function(value) {
		me.setProperty(this.impl, propertyName, value);
	};
};

PropMethodFactoryBase.prototype.createEvtPropSetter = function(propertyName) {
	var factoryMe = this;
	
	return function(value) {
		var me = this;
		var delFunc = null;

		// Check if an event delegate is defined 
		if(this.eventDelegate !== undefined && propertyName in this.eventDelegate) {
			delFunc = this.eventDelegate[propertyName];
		} else {
			// If there is no delegate then don't just assign the function directly
			// as we still want to intercept the event so we can apply the wrapped object
			// as the 'this' context for the real event handler instead of the 
			// raw XMLHttpRequest or ActiveX object.
			delFunc = function() {
				this.applyRealHandler(arguments);
			};
		}
			 
		// Define the state object which which will be used as the 'this' context
		// for the delegate function that calls or can call the real handler
		var delState = {
				// Provide the XHR wrapper object in case it is needed by the delegate
				// function for any reason.
				xhr : me,  
				realHandler: value,
				// Provide these two convenience methods to allow the real
				// handler to be called while still providing the XHR wrapper
				// as the 'this' context
				callRealHandler : function() {
					delState.realHandler.apply(me, arguments);
				},
				applyRealHandler : function(argArray) {
					delState.realHandler.apply(me, argArray);
				}
		};
		
		// This final wrapper function acts as a closure that merely sets 
		// the 'this' context to delState before calling the delegate function
		var delWrapper = function() {
			delFunc.apply(delState, arguments);
		};
		
		factoryMe.setProperty(this.impl, propertyName, delWrapper);
	};
};
