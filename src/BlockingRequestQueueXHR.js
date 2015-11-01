/**
 *
 *
 * @clsss
 * @summary XHRWrapper implementation that queues requests until
 * @param impl
 * @memberOf xhrAdaptorJs
 *
 * This
 *
 */
xhrAdaptorJs.BlockingRequestQueueXHR = function(impl) {
	// Set by 'open'
	this.requestUrl = null;
	this.parent.call(this).constructor.call(this, impl);
};

xhrAdaptorJs.BlockingRequestQueueXHR.prototype = Object.create(xhrAdaptorJs.XHRWrapper.prototype);
xhrAdaptorJs.BlockingRequestQueueXHR.constructor = xhrAdaptorJs.BlockingRequestQueueXHR;

//////////////////////////////// 'private' functions /////////////////////////////////////////////
// Creates a callback which is passed to the the matching registered handler
// and called when ajax processing should continue
function createContinueCallback(delegateObj, requestHandlerObj, args) {
	return function () {
		delegateObj.applyRealHandler(args);
		requestHandlerObj.isBlocked = false;
		// Process all of the remaining requests
		var requestQueue = xhrAdaptorJs.BlockingRequestQueueXHR.prototype.requestQueue;
		if(requestQueue === undefined)
			return;
		while(requestQueue.length > 0) {
			var request = xhrAdaptorJs.BlockingRequestQueueXHR.prototype.requestQueue.shift();
			request();
		}

	};
}

// Returns either the a response handler object that matches the URL of this 
// XHR object or NULL if there is no matcing response handler. 
function findResponseHandlerMatch() {
	for(var key in Object.getPrototypeOf(this).responseHandlerMap) {
		if(new RegExp(key, "g").test(this.requestUrl))
			return Object.getPrototypeOf(this).responseHandlerMap[key];
	}
	return null;
}

function processResponse(args) {

	var me = this;
	
	// Check each of the registered response handlers to see if their key (a regex)
	// matches the URL that is being opened
	var handlerObj = findResponseHandlerMatch.call(this._xhr);
	
	if(handlerObj === null) {
		// No match, just allow the request to continue as usual
		me.applyRealHandler(args);
		return;
	}

	// There is a match but before calling the handler, check if the request is already blocked
	if(handlerObj.isBlocked) {
		consle.warn("Failed to catch blocked request in time.");
		return;
	}
	
	// Set the matching handler to blocked and invoke it
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

	var args = arguments;
	
	// Check each of the registered response handlers to see if their key (a regex)
	// matches the URL that is being opened
	var handlerObj = findResponseHandlerMatch.call(this);
	
	// There is a match so check if the request is blocked
	if(handlerObj !== null && handlerObj.isBlocked) {
		// Add the handler to the queue as a closure but do not call it yet
		xhrAdaptorJs.BlockingRequestQueueXHR.prototype.requestQueue.push(function() {
			me.parent.call(me).send.apply(me, args);
		});
		return;
	}

	me.parent.call(me).send.apply(me, args);
};

xhrAdaptorJs.BlockingRequestQueueXHR.prototype.registerResponseHandler = function(urlRegEx, responseHandler, handlerContext) {

	if(urlRegEx in xhrAdaptorJs.BlockingRequestQueueXHR.prototype.responseHandlerMap) {
		console.error("Attempted to register handler for existing regex expression '" + urlRegEx + "'");
		return;
	}

	var requestHandlerEntry = {
		handler: responseHandler,
		context: handlerContext,
		isBlocked: false,
		invokeHandler : function (delegateObj, args) {
			requestHandlerEntry.isBlocked = true;
			requestHandlerEntry.handler.call(handlerContext, createContinueCallback(delegateObj, requestHandlerEntry, args), delegateObj._xhr);
		}
	};

	xhrAdaptorJs.BlockingRequestQueueXHR.prototype.responseHandlerMap[urlRegEx] = requestHandlerEntry;
};

xhrAdaptorJs.BlockingRequestQueueXHR.prototype.unregisterResponseHandler = function(urlRegEx) {
	delete xhrAdaptorJs.BlockingRequestQueueXHR.prototype.responseHandlerMap[urlRegEx];
};

xhrAdaptorJs.BlockingRequestQueueXHR.prototype.clearResponseHandlers = function() {
	xhrAdaptorJs.BlockingRequestQueueXHR.prototype.responseHandlerMap = {};
};

xhrAdaptorJs.BlockingRequestQueueXHR.prototype.eventDelegate = {
	onreadystatechange : function () {
		
		var args = arguments;
		var xhr = this._xhr;
		
		if(xhr.readyState == 4) {
			processResponse.call(this, args);
		} else {
			// NB make sure you always call this as the ActiveX version of XHR
			// will actually cease to call onreadystatechange if this is not called
			// i.e. you will only get the first event where readyState == 1
			this.applyRealHandler(args);
		}
	}
	//TODO: Detect if onload is implemented and use in preference to onreadystatechange
	/*
	onload : function () {
		processResponse.call(this, arguments);
	}
	*/
};
