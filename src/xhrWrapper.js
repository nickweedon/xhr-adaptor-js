
var adaptor = {
	send : function() {
		this.xhr.send.apply(this, arguments);
	}
};

xhrAdaptorJs.xhrWrapper = function(impl, isNativeImpl) {
	
	if(impl === undefined)
		impl = {};
	
	if(inheritDefaults === undefined)
		inheritDefaults = true;

	if(!isNativeImpl) {
		for(var key in adaptor) {
			if(!(key in impl))
				impl[key] = adaptor[key];
		}
		// Supply the impl object with an xhr instance so the real (or in fact wrapped) XHR can be called
		impl.xhr = new xhrAdaptorJs.xhr();
	}

	this.impl = impl;
};

// Note that .apply or .call cannot be used within the wrapper methods as the adaptor may be a activeX object

xhrAdaptorJs.xhrWrapper.prototype.send = function() {
	
	switch(arguments.length) {
		case 0:
			return this.impl.send();
		case 1:
			return this.impl.send(arguments[0]);
	}
	
    throw new Error("Send does not support more than 1 argument.");
};

/*
xhrAdaptorJs.xhrWrapper.prototype.xhrAdaptor = {
	send : function() {
		xhrAdaptorJs.xhr.apply();
	}
};
*/




