/**
 * Like the GoF template design pattern, this abstract class calls methods
 * which are defined only in derived classes. The class also follows the GoF abstract factory
 * pattern in so far as that the actual factory logic itself lies in this abstract class 
 * but the derived classes implement the specific property and method accessing logic.
 * 
 * @summary Abstract base class for builder factories
 * @private
 * @global
 * @class
 */
function PropMethodFactoryBase() {
	
}

/**
 * Convenience method that is used to return the prototype of the parent class.
 * Most useful for calling parent class methods within an overriden implementation.
 * This method should not be called directly on the PropMethodFactoryBase class but should
 * instead only be called by derived classes.
 * 
 * @summary Return the prototype of the parent class
 * @returns Returns the prototype of the parent class
 * @memberOf PropMethodFactoryBase
 */
PropMethodFactoryBase.prototype._parent = function() {
	return Object.getPrototypeOf(Object.getPrototypeOf(this));
};

/**
 * Create a method invoking function for the specified method
 * 
 * @param methodName {String} The name of the method to create the method invoking function for
 * @returns {Function}
 * @memberOf PropMethodFactoryBase
 */
PropMethodFactoryBase.prototype.createMethod = function(methodName) {
	var me = this;
	
	return function() {
		return me.invokeMethod(this.impl, methodName, arguments);
	};
};

/**
 * Create a property getter function for the specified property
 * 
 * @param propertyName {String} The name of the property to create the getter for
 * @returns {Function}
 * @memberOf PropMethodFactoryBase
 */
PropMethodFactoryBase.prototype.createPropGetter = function(propertyName) {
	var me = this;
	
	return function() {
		return me.getProperty(this.impl, propertyName);
	};
};

/**
 * Create a property setter function for the specified property
 * 
 * @param propertyName {String} The name of the property to create the setter for
 * @returns {Function}
 * @memberOf PropMethodFactoryBase
 */
PropMethodFactoryBase.prototype.createPropSetter = function(propertyName) {
	var me = this;
	
	return function(value) {
		me.setProperty(this.impl, propertyName, value);
	};
};

/**
 * This method checks to see if a delegate is defined for the property and if so,
 * it sets the event handler on the underlying object to a wrapper which calls the
 * supplied delegate, allowing the delegate to then perform some custom logic and then
 * optionally call the real handler.
 * If there is no delegate defined for the property then a simple wrapper is set on the
 * implementation allowing the {@link xhrAdaptorJs.XHRWrapper} derived class object to 
 * be used as the 'this' context for the xhr caller supplied handler. 
 * 
 * @summary Create a property setter for an event based property
 * @param propertyName {String} The name of the property to supply the event
 * @returns {Function}
 * @memberOf PropMethodFactoryBase
 */
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
		factoryMe.setEventProperty(this.impl, propertyName, delState, delFunc, value);
	};
};

/**
 * Return the specified property from the object
 * 
 * @param {Object} obj The XHR implementation
 * @param {String} propertyName The name of the property to retrieve
 * @memberOf PropMethodFactoryBase
 * @abstract
 */
PropMethodFactoryBase.prototype.getProperty = function(obj, propertyName) {
	throw new Error("Must be implemented in subclass!");
};

/**
 * Set the specified property on the object
 * 
 * @param {Object} obj The XHR implementation
 * @param {String} propertyName The name of the property to set
 * @param value {Object} The value to set 
 * @memberOf PropMethodFactoryBase
 * @abstract
 */
PropMethodFactoryBase.prototype.setProperty = function(obj, propertyName, value) {
	throw new Error("Must be implemented in subclass!");
};

/**
 * Invoke the specified method on the object
 * 
 * @param {Object} obj The XHR implementation
 * @param {String} propertyName The name of the method to invoke
 * @param args {array} The array of arguments to supply to the method 
 * @memberOf PropMethodFactoryBase
 * @abstract
 */
PropMethodFactoryBase.prototype.invokeMethod = function(obj, methodName, args) {
	throw new Error("Must be implemented in subclass!");
};

/**
 * Set an event based property by assigning the delegate function that in turn will call
 * the real handler.
 * 
 * @param {Object} obj The XHR implementation
 * @param {String} propertyName The name of the method to invoke
 * @param {Object} delState The delegate state object that is to be used as the 'this' context 
 * by the delegate function.
 * @param {function} delFunc The delegate function that is to be called, using delState as its 'this'
 * context.
 * @param {function} realHandler The actual real handler that the xhr caller has supplied. This parameter
 * is not required by the implementation as it is already stored within the delState object and invoked
 * via delState.callRealHandler or delState.applyRealHandler. The argument is supplied purely to allow
 * for an implementation to log the handler that has been supplied by the xhr caller.
 * @param args {array} The array of arguments to supply to the method
 * @memberOf PropMethodFactoryBase
 * @abstract
 */
PropMethodFactoryBase.prototype.setEventProperty = function(obj, propertyName, delState, delFunc, realHandler) {
	throw new Error("Must be implemented in subclass!");
};


