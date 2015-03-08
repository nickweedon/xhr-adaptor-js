
var adaptor = {
	abort : function() {
		this.xhr.abort.apply(this.xhr, arguments);
	},
	getAllResponseHeaders : function() {
		this.xhr.getAllResponseHeaders.apply(this.xhr, arguments);
	},
	getResponseHeader : function() {
		this.xhr.getResponseHeader.apply(this.xhr, arguments);
	},
	open : function() {
		this.xhr.open.apply(this.xhr, arguments);
	},
	overrideMimeType : function() {
		this.xhr.overrideMimeType.apply(this.xhr, arguments);
	},
	send : function() {
		this.xhr.send.apply(this.xhr, arguments);
	},
	setRequestHeader : function() {
		this.xhr.setRequestHeader.apply(this.xhr, arguments);
	},
	////////// non-standard methods ////////////////////
	init : function() {
		this.xhr.init.apply(this.xhr, arguments);
	},
	openRequest : function() {
		this.xhr.openRequest.apply(this.xhr, arguments);
	},
	sendAsBinary : function() {
		this.xhr.sendAsBinary.apply(this.xhr, arguments);
	},
	////////////// Properties /////////////////////////
	onreadystatechange : {
		get : function() {
			return this.xhr.onreadystatechange; 
		},
		set : function(value) {
			this.xhr.onreadystatechange = value; 
		}
	}
	/*
	readyState : {
		get : function() {
			return this.xhr.readyState; 
		},
		set : function(value) {
			this.xhr.readyState = value; 
		}
	},
	response : {
		get : function() {
			return this.xhr.response; 
		},
		set : function(value) {
			this.xhr.response = value; 
		}
	},
	responseText : {
		get : function() {
			return this.xhr.responseText; 
		},
		set : function(value) {
			this.xhr.responseText = value; 
		}
	},
	responseType : {
		get : function() {
			return this.xhr.responseType; 
		},
		set : function(value) {
			this.xhr.responseType = value; 
		}
	},
	responseXML : {
		get : function() {
			return this.xhr.responseXML; 
		},
		set : function(value) {
			this.xhr.responseXML = value; 
		}
	},
	status : {
		get : function() {
			return this.xhr.status; 
		},
		set : function(value) {
			this.xhr.status = value; 
		}
	},
	responseXML : {
		get : function() {
			return this.xhr.responseXML; 
		},
		set : function(value) {
			this.xhr.responseXML = value; 
		}
	},
	responseXML : {
		get : function() {
			return this.xhr.responseXML; 
		},
		set : function(value) {
			this.xhr.responseXML = value; 
		}
	},
	responseXML : {
		get : function() {
			return this.xhr.responseXML; 
		},
		set : function(value) {
			this.xhr.responseXML = value; 
		}
	},
	
	
	statusText
	timeout
	ontimeout
	upload
	withCredentials
	channel
	mozAnon
	mozSystem
	mozBackgroundRequest
	mozResponseArrayBuffer
	multipart
	*/
	
};

xhrAdaptorJs.xhrWrapper = function(objParameters, impl, isNativeImpl) {
	
	if(impl === undefined)
		impl = {};
	
	if(isNativeImpl === undefined)
		isNativeImpl = false;

	if(!isNativeImpl) {
		for(var key in adaptor) {
			if(!(key in impl))
				impl[key] = adaptor[key];
		}
		// Supply the impl object with an xhr instance so the real (or in fact wrapped) XHR can be called
		impl.xhr = new xhrAdaptorJs.xhr(objParameters);
	}
	
	this.impl = impl;
	this.isNativeImpl = isNativeImpl;
};

// Note that .apply or .call cannot be used within the wrapper methods as the adaptor may be a activeX object
// I am therefore using these horrible switch statements in order to ensure compatibility
xhrAdaptorJs.xhrWrapper.prototype.abort = function() {
	return this.impl.abort();
};

xhrAdaptorJs.xhrWrapper.prototype.getAllResponseHeaders = function() {
	return this.impl.getAllResponseHeaders();
};

xhrAdaptorJs.xhrWrapper.prototype.getResponseHeader = function() {
	return this.impl.getResponseHeader(arguments[0]);
};

xhrAdaptorJs.xhrWrapper.prototype.open = function() {
	
	switch(arguments.length) {
		case 0:
			return this.impl.open();
		case 1:
			return this.impl.open(arguments[0]);
		case 2:
			return this.impl.open(arguments[0], arguments[1]);
		case 3:
			return this.impl.open(arguments[0], arguments[1], arguments[2]);
		case 4:
			return this.impl.open(arguments[0], arguments[1], arguments[2], arguments[3]);
		case 5:
			return this.impl.open(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
	}
	
    throw new Error("Open does not support more than 5 arguments.");
};

xhrAdaptorJs.xhrWrapper.prototype.overrideMimeType = function() {
	return this.impl.overrideMimeType(arguments[0]);
};

xhrAdaptorJs.xhrWrapper.prototype.send = function() {
	
	switch(arguments.length) {
		case 0:
			return this.impl.send();
		case 1:
			return this.impl.send(arguments[0]);
	}
	
    throw new Error("Send does not support more than 1 argument.");
};

xhrAdaptorJs.xhrWrapper.prototype.setRequestHeader = function() {
	return this.impl.setRequestHeader(arguments[0], arguments[1]);
};

///// non-standard methods ////////////
xhrAdaptorJs.xhrWrapper.prototype.init = function() {
	return this.impl.init(arguments[0], arguments[1], arguments[2]);
};

xhrAdaptorJs.xhrWrapper.prototype.openRequest = function() {
	return this.impl.openRequest(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
};

xhrAdaptorJs.xhrWrapper.prototype.sendAsBinary = function() {
	return this.impl.sendAsBinary(arguments[0]);
};

///////////// Properties ////////////////////////
Object.defineProperty(xhrAdaptorJs.xhrWrapper.prototype, "onreadystatechange", {
	get : function() {
		if(this.isNativeImpl)
			return this.impl.onreadystatechange;
		else 
			return this.impl.onreadystatechange.get.call(this.impl);
	},
	set : function(value) {
		if(this.isNativeImpl)
			this.impl.onreadystatechange = value;
		else 
			this.impl.onreadystatechange.set.call(this.impl, value);
	}
});
