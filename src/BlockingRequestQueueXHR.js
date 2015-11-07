xhrAdaptorJs = xhrAdaptorJs || {};

/**
 * @summary The BlockingRequestQueueXHR allows a response to be intercepted and processed while queuing all other requests until processing is complete
 *
 * This class is allows special processing to occur in certain situations, based on an ajax response, while queuing background requests.
 * A callback is provided to allow the queued requests to be processed meaning that the 'special processing' can occur asynchronously.
 * An example use case for the BlockingRequestQueueXHR is where it can be used to pop open an authentication dialog and wait for a user to authenticate,
 * meanwhile all requests are queued while the system waits for the user's input. This prevents the scenario of having multiple ajax calls being denied since
 * once the user is authenticated, the queued requests can then continue through to the server where they can be processed normally, in an authenticated context.
 *
 * @class
 * @memberOf xhrAdaptorJs
 * @augments xhrAdaptorJs.XHRWrapper
 * @tutorial BlockingRequestQueue
 *
 * @param {XMLHttpRequest} impl The implementation object that this BlockingRequestQueueXHR object is to wrap.
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

/**
 * Creates a callback which is associated to the provided requestHandlerObj
 * that, when called, will unblock the request queue, allowing requests to
 * be processed.
 *
 * @summary Create a 'continue' callback function for the user defined function to call
 * @global
 * @private
 * @param {Object} delegateObj The event delegate object provided to the XHRWrapper 'onreadystatechange' event
 * @param {Object} requestHandlerEntry The requestHandlerEntry that the continue callback will unblock
 * @param {...any} args Arguments that were passed to the initial 'onreadystatechange' event delegate callback.
 * @returns {Function} Returns a function that when called, will unblock the request queue
 */
function createContinueCallback(delegateObj, requestHandlerEntry, args) {
	return function () {
		delegateObj.applyRealHandler(args);
		requestHandlerEntry.isBlocked = false;
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

/**
 * Returns either the response handler entry that matches the URL of this
 * XHR object or NULL if there is no matching response handler.
 *
 * @summary Find the first request handler entry that matches the provided request URL
 * @global
 * @private
 * @param {String} requestURL The URL that is being matched.
 * @returns {Object} Either the request handler entry that matches the URL or null if there are no matches.
 */
function findResponseHandlerMatch(requestURL) {
	//var handlerMap = Object.getPrototypeOf(this).responseHandlerMap;
	for(var key in this.responseHandlerMap) {
		if(!this.responseHandlerMap.hasOwnProperty(key)) continue;

		if(new RegExp(key, "g").test(requestURL))
			return Object.getPrototypeOf(this).responseHandlerMap[key];
	}
	return null;
}

/**
 * This method will invoke the first matching response handler, causing any further matching requests
 * to be blocked until the 'continue' callback is invoked in the user defined response handler.
 * If there are no matching response handler entries then the response will pass through as normal.
 *
 * @summary Invoke the first matching response handler.
 * @global
 * @private
 * @param {...any} args Arguments that were passed to the initial 'onreadystatechange' event delegate callback.
 */
function processResponse(args) {

	var me = this;
	
	// Check each of the registered response handlers to see if their key (a regex)
	// matches the URL that is being opened
	var handlerObj = findResponseHandlerMatch.call(this._xhr, this._xhr.requestUrl);
	
	if(handlerObj === null) {
		// No match, just allow the request to continue as usual
		me.applyRealHandler(args);
		return;
	}

	// There is a match but before calling the handler, check if the request is already blocked
	if(handlerObj.isBlocked) {
		console.warn("Failed to catch blocked request in time.");
		return;
	}
	
	// Set the matching handler to blocked and invoke it
	handlerObj.invokeHandler(this, args);
}
////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////// 'statics' ////////////////////////////////////////////////////

/**
 * @summary The static response handler entry map
 *
 * This map stores all the response handler entries registered by {@link xhrAdaptorJs.BlockingRequestQueueXHR.registerResponseHandler}
 * The response handler entries are stored in 'key => value' pairs where the key is a URL regEx and the value is
 * an object with the following fields:
 *   handler: A function which represents the response handler set by the caller
 *   blocked: A boolean flag indicating whether requests matching this key are currently blocked.
 *
 * @memberOf xhrAdaptorJs.BlockingRequestQueueXHR
 * @static
 * @private
 * @type {Object}
 *
 */
xhrAdaptorJs.BlockingRequestQueueXHR.prototype.responseHandlerMap = {};

/**
 * @summary The request queue
 *
 * The request queue of blocked requests. This is an array of closure functions wrapping
 * either the parent classes 'send', 'onload' or 'onreadystatechange' method.
 * This allows requests to be 'suspended' and then later resumed by calling the closure.
 *
 * @memberOf xhrAdaptorJs.BlockingRequestQueueXHR
 * @static
 * @private
 * @type {Array}
 *
 */
xhrAdaptorJs.BlockingRequestQueueXHR.prototype.requestQueue = [];
//////////////////////////////////////////////////////////////////////////////////////////

//
/**
 * @summary Open the specified URL
 *
 * This simple override is used to capture the URL of the XHR request so it can be retrieved later when
 * 'send' is called.
 *
 * @memberOf xhrAdaptorJs.BlockingRequestQueueXHR
 * @private
 */
xhrAdaptorJs.BlockingRequestQueueXHR.prototype.open = function(verb, url, async) {
	this.requestUrl = url;
	this.parent.call(this).open.call(this, verb, url, async);
};

/**
 * @summary send the request
 *
 * This override will check to see if the request URL matches that of a currently blocked
 * response handler entry. If the response handler entry for the URL is blocked then the request is simply queued for later
 * execution.
 *
 * @memberOf xhrAdaptorJs.BlockingRequestQueueXHR
 * @private
 */
xhrAdaptorJs.BlockingRequestQueueXHR.prototype.send = function() {

	var me = this;

	var args = arguments;
	
	// Check each of the registered response handlers to see if their key (a regex)
	// matches the URL that is being opened
	var handlerObj = findResponseHandlerMatch.call(this, this.requestUrl);
	
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

/**
 * @summary register a response handler and a URL matching regular expression.
 *
 * This method should be used to register a response handler for a particular URL.
 * The response handler should be in the form of a function taking one argument which is a callback function
 * that should be called when processing is complete.
 * When the provided response handler callback is called, all further reqeusts that match the associated URL
 * regular expression will be queued until the 'doContinue' callback function is invoked.

 * @example
 * <caption>
 * <H4>Example response handler</H4>
 * This example shows what a simple response handler function should look like.
 * </caption>
 * <pre>
 *     var responseHandler = function(doContinue) {
 *     		// Do some stuff
 *     		...
 *     		doContinue(); // Call this when finished
 *     }
 * </pre>
 *
 * @example
 * <caption>
 * <H4>Example registration of a response handler</H4>
 * This example shows how to register a response handler that will be executed when
 * requesting any URL containing 'www.acme.com'.
 * </caption>
 * <pre>
 *     xhrAdaptorJs.BlockingRequestQueueXHR.registerResponseHandler("www.acme.com", responseHandler);
 * </pre>
 *
 * @function registerResponseHandler
 * @memberOf xhrAdaptorJs.BlockingRequestQueueXHR
 * @static
 * @param {String} urlRegEx The URL regular expression string (without the starting and ending forward slash).
 * @param {Function} responseHandler The response handler function that is to be invoked on a matching URL.
 * @param {Object} [handlerContext] This optional argument allows for a context object to be used when invoking the response handler.
 * 									If one is not provided then the BlockingRequestQueueXHR object will be used as the call context.
 */
xhrAdaptorJs.BlockingRequestQueueXHR.prototype.registerResponseHandler = function(urlRegEx, responseHandler, handlerContext) {

	if(urlRegEx in xhrAdaptorJs.BlockingRequestQueueXHR.prototype.responseHandlerMap) {
		console.error("Attempted to register handler for existing regex expression '" + urlRegEx + "'");
		return;
	}

	var me = this;

	var requestHandlerEntry = {
		handler: responseHandler,
		context: handlerContext || me,
		isBlocked: false,
		invokeHandler : function (delegateObj, args) {
			requestHandlerEntry.isBlocked = true;
			requestHandlerEntry.handler.call(handlerContext, createContinueCallback(delegateObj, requestHandlerEntry, args), delegateObj._xhr);
		}
	};

	xhrAdaptorJs.BlockingRequestQueueXHR.prototype.responseHandlerMap[urlRegEx] = requestHandlerEntry;
};
xhrAdaptorJs.BlockingRequestQueueXHR.registerResponseHandler = xhrAdaptorJs.BlockingRequestQueueXHR.prototype.registerResponseHandler;

/**
 * @summary unregister a response handler entry.
 *
 * This method is used to unregister a previously registered response handler.
 *
 * @function unregisterResponseHandler
 * @memberOf xhrAdaptorJs.BlockingRequestQueueXHR
 * @static
 * @param {String} urlRegEx The URL regular expression string that was used to register the response handler
 *                          that should now be unregistered.
 */
xhrAdaptorJs.BlockingRequestQueueXHR.prototype.unregisterResponseHandler = function(urlRegEx) {
	delete xhrAdaptorJs.BlockingRequestQueueXHR.prototype.responseHandlerMap[urlRegEx];
};
xhrAdaptorJs.BlockingRequestQueueXHR.unregisterResponseHandler = xhrAdaptorJs.BlockingRequestQueueXHR.prototype.unregisterResponseHandler;

/**
 * @summary unregister all response handler entries.
 *
 * @function clearResponseHandlers
 * @memberOf xhrAdaptorJs.BlockingRequestQueueXHR
 * @static
 */
xhrAdaptorJs.BlockingRequestQueueXHR.prototype.clearResponseHandlers = function() {
	xhrAdaptorJs.BlockingRequestQueueXHR.prototype.responseHandlerMap = {};
};
xhrAdaptorJs.BlockingRequestQueueXHR.clearResponseHandlers = xhrAdaptorJs.BlockingRequestQueueXHR.prototype.clearResponseHandlers;

/**
 * @summary Hook the 'onreadystatechange' event so that the response handlers can be checked.
 *
 * @memberOf xhrAdaptorJs.BlockingRequestQueueXHR
 * @static
 * @private
 */
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
