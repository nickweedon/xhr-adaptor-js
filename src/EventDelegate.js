/**
 * This constructor is used internally and is not publicly available outside of the 
 * {@link xhrAdaptorJs} package.
 *  
 * @summary The private EventDelegate class constructor
 * @param xhr {xhrAdaptorJs.XHRWrapper} The XHRWrapper derived object.
 * @param realHandler {Function} The real event handler. 
 * 
 * @classdesc
 * <p>
 * The EventDelegate class is used as the call context for all {@link xhrAdaptorJs.XHRWrapper} 
 * event delegates.
 * </p>
 * <p>
 * This class can be used to invoke the real handler as well as to provide direct 
 * access to the underlying {@link xhrAdaptorJs.XHRWrapper} derived object.
 * </p>
 * The EventDelegate object may be stored and then later used to invoke the real handler,
 * thereby delaying the event, perhaps until some other event has occurred.
 * 
 * @see xhrAdaptorJs.XHRWrapper
 * @class
 * @global
 */
function EventDelegate(xhr, realHandler) {
	this._xhr = xhr;
	this.realHandler = realHandler;
}

/**
 * This method is used to invoke the real handler, using the {@link xhrAdaptorJs.XHRWrapper} 
 * derived object as the call context.
 * Like the built-in Javascript 'call' method, this method accepts a variable number of arguments 
 * which are passed to the real handler.
 * @summary Invoke the real event handler using 'call' semantics
 * @param {...any} - The arguments to pass to the real handler.
 * @memberOf EventDelegate
 * @see EventDelegate#applyRealHandler
 * 
 */
EventDelegate.prototype.callRealHandler = function() {
	this.realHandler.apply(this._xhr, arguments);
};

/**
 * This method is used to invoke the real handler, using the {@link xhrAdaptorJs.XHRWrapper} 
 * derived object as the call context.
 * Like the built-in Javascript 'apply' method, this method accepts an array of arguments 
 * which are supplied as formal arguments to the real handler.
 * 
 * @summary Invoke the real event handler using 'apply' semantics
 * @param {array} argArray The array of arguments that will be supplied as formal arguments to
 * the real handler.
 * @memberOf EventDelegate
 * @see EventDelegate#callRealHandler
 * 
 */
EventDelegate.prototype.applyRealHandler = function(argArray) {
	this.realHandler.apply(this._xhr, argArray);
};

/**
 * This read-only property provides access to the {@link xhrAdaptorJs.XHRWrapper} derived object.
 * 
 * @summary The {@link xhrAdaptorJs.XHRWrapper} derived object.
 * @type xhrAdaptorJs.XHRWrapper
 * @instance
 * @name xhr
 * @memberOf EventDelegate
 * @readonly
 */
Object.defineProperty(EventDelegate.prototype, "xhr", {
	get : function() {
		return this._xhr;
	}
}); 
