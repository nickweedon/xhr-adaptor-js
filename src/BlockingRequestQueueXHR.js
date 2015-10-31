/**
 *
 *
 * @clsss
 * @summary XHR setup and management functionality
 * @param impl
 * @memberOf xhrAdaptorJs
 *
 */
xhrAdaptorJs.BlockingRequestQueueXHR = function(impl) {
	// Set by 'open'
	this.requestUrl = null;
};

xhrAdaptorJs.BlockingRequestQueueXHR.prototype = Object.create(xhrAdaptorJs.XHRWrapper.prototype);
xhrAdaptorJs.BlockingRequestQueueXHR.constructor = xhrAdaptorJs.BlockingRequestQueueXHR;

//////////////////////////////// 'private' functions /////////////////////////////////////////////
// Creates a callback which is passed to the the matching registered handler
// and called when ajax processing should continue
function createContinueCallback(args, requestHandlerObj) {
	return function () {
		this.applyRealHandler(args);
		requestHandlerObj.isBlocked = false;
	};
}

// Returns either the a response handler object that matches the URL of this 
// XHR object or NULL if there is no matcing response handler. 
function findResponseHandlerMatch() {
	for(var key in Object.getPrototypeOf(this).responseHandlerMap) {
		if(this.requestUrl.match(key))
			return Object.getPrototypeOf(this).responseHandlerMap[key];
	}
	return null;
}

function processResponse(args) {

	var me = this;
	
	// Check each of the registered response handlers to see if their key (a regex)
	// matches the URL that is being opened
	var handlerObj = findResponseHandlerMatch.call(this);
	
	if(handlerObj === null) {
		// No match, just allow the request to continue as usual
		this.applyRealHandler(args);
		return;
	}
	
	// There is a match but before calling the handler, check if the request is already blocked
	if(handlerObj.isBlocked) {
		// Add the handler to the queue as a closure but do not call it yet
		Object.getPrototypeOf(this).requestQueue.push(function() {
			handlerObj.invokeHandler(me, args);
		});
		return;
	}
	
	// Call the matching handler
	handlerObj.invokeHandler(this, args);
}
////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////// 'statics' ////////////////////////////////////////////////////
// The response handler 'key => value' map where the key is a URL regEx and the value is
// an object with the following fields:
// 		handler: A function which represents the response handler set by the caller
//      blocked: A boolean flag indicating whether requests matching this key are currently blocked.
//
xhrAdaptorJs.BlockingRequestQueueXHR.prototype.responseHandlerMap = {};

// The request queue of blocked requests. This is an array of closure functions wrapping
// either the parent classes 'send', 'onload' or 'onreadystatechange' method. 
// This allows requests to be 'suspended' and then later resumed by calling the closure.
xhrAdaptorJs.BlockingRequestQueueXHR.prototype.requestQueue = [];
//////////////////////////////////////////////////////////////////////////////////////////

// Override simply to capture the URL of the XHR request
xhrAdaptorJs.BlockingRequestQueueXHR.prototype.open = function(verb, url, async) {
	this.requestUrl = url;
	this.parent.call(this).open.call(this, verb, url, async);
};

// This override will check to see if the request URL matches that of a currently blocked
// response. If the response for the URL is blocked then the request is simply queued for later
// execution.
xhrAdaptorJs.BlockingRequestQueueXHR.prototype.send = function() {

	var me = this;
	
	// Check each of the registered response handlers to see if their key (a regex)
	// matches the URL that is being opened
	var handlerObj = findResponseHandlerMatch.call(this);
	
	// There is a match so check if the request is blocked
	if(handlerObj.isBlocked) {
		// Add the handler to the queue as a closure but do not call it yet
		Object.getPrototypeOf(this).requestQueue.push(function() {
			this.parent.call(this).open.call(this, verb, url, async);
		});
		return;
	}
	
	this.parent.call(this).send.apply(this, arguments);
};


xhrAdaptorJs.BlockingRequestQueueXHR.prototype.registerResponseHandler = function(urlRegEx, responseHandler) {
	
	Object.getPrototypeOf(this).responseHandlerMap[urlRegEx] = {
		handler: responseHandler,
		isBlocked: false,
		invokeHandler : function (delegateObj, args) {
			this.isBlocked = true;
			this.handler(function () {
				delegateObj.applyRealHandler(args);
				requestHandlerObj.isBlocked = false;
			});
		}
	};
};

xhrAdaptorJs.BlockingRequestQueueXHR.prototype.unregisterResponseHandler = function(urlRegEx) {
	delete Object.getPrototypeOf(this).responseHandlerMap[urlRegEx];
};


xhrAdaptorJs.BlockingRequestQueueXHR.prototype.delegate.eventDelegate = {
	onreadystatechange : function () {
		
		var args = arguments;
		
		if(this.readyState == 4) {
	
			processResponse.call(this, arguments);
			
		} else {
			// NB make sure you always call this as the ActiveX version of XHR
			// will actually cease to call onreadystatechange if this is not called
			// i.e. you will only get the first event where readyState == 1
			this.applyRealHandler(arguments);
		}
	},
	onload : function () {
		processResponse.call(this, arguments);
	}
};
