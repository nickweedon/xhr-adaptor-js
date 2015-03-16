/**\
 * This class follows both the template and abstract factory design pattern
 * 
 * All of the factory logic lies in this abstract class and the derived classes
 * implement the actual property and method accessing logic.
 * 
 */
function PropMethodFactoryBase() {
	
}

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
		
		if(this.eventDelegate !== undefined && propertyName in this.eventDelegate) {
			delFunc = this.eventDelegate[propertyName];
		} else {
			delFunc = function() {
				this.applyRealHandler(arguments);					
			};
		}
			 
		var delState = { 
				realHandler: value,
				callRealHandler : function() {
					delState.realHandler.apply(me, arguments);
				},
				applyRealHandler : function(argArray) {
					delState.realHandler.apply(me, argArray);
				}
		};
		var delWrapper = function() {
			delState.realScope = this;
			delFunc.apply(delState, arguments);
		};
		
		factoryMe.setProperty(this.impl, propertyName, delWrapper);
	};
};
