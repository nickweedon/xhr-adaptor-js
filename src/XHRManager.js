var xhrAdaptorJs = xhrAdaptorJs || {};

/**
 * The XHRManager class provides setup and management functionality related to XHR.
 * An instance of this class is globally available as {@link xhrAdaptorJs.manager}   
 * 
 * @summary XHR setup and management functionality
 * @memberOf xhrAdaptorJs
 *
 * @class
 */
xhrAdaptorJs.XHRManager = function() {
};

/**
 * This method either retrieves the XMLHttpRequest class or in the case that
 * the XMLHttpRequest class is not available (such as on older IE browsers) the method
 * will return a psuedo-constructor that will instantiate the relevant ActiveX based
 * xhr object in place of a XMLHttpRequest object.
 * 
 * @summary Return a XMLHttpRequest class or ActiveX XMLHTTP object constructor.
 * @returns XHR object constructor/class
 * @memberOf xhrAdaptorJs.XHRManager
 */
xhrAdaptorJs.XHRManager.prototype.getXhrClass = function() {

	if(window.XMLHttpRequest !== undefined)
		return window.XMLHttpRequest;
	
	return function() {
	    try { 
	    	return new ActiveXObject("Msxml2.XMLHTTP.6.0");
	    } catch (e) {}
	    try { 
	    	return new ActiveXObject("Msxml2.XMLHTTP.3.0");
	    } catch (e) {}
	    try { 
	    	return new ActiveXObject("Microsoft.XMLHTTP");
	    } catch (e) {}
	    
	    throw new Error("This browser does not support XMLHttpRequest or ActiveX XMLHTTP.");
	};
};

// Private helper function to extract the class name of an object as a string
function getTypeString(obj) {
	var funcNameRegex = /function (.{1,})\(/;
	var results = (funcNameRegex).exec(obj.constructor.toString());
	return (results && results.length > 1) ? results[1] : "";
}

/**
 * This method injects the provided {@link xhrAdaptorJs.XHRWrapper} derived wrapper class into 
 * the XMLHttpRequest wrapper chain so that any code executing "new XMLHttpRequest()" will instead
 * instantiate the provided wrapper class.
 * 
 * This method may be called multiple times in order to build a chain of {@link xhrAdaptorJs.XHRWrapper}
 * objects.
 * 
 * @summary Inject a wrapper class into the XMLHttpRequest wrapper chain.
 * @param {xhrAdaptorJs.XHRWrapper} xhrWrapperClass The XHRWrapper derived class to inject. Note that
 * the constructor of the wrapper class must accept the 'impl' parameter and pass this to the parent
 * wrapper classes constructor.
 * @memberOf xhrAdaptorJs.XHRManager
 */
xhrAdaptorJs.XHRManager.prototype.injectWrapper = function(xhrWrapperClass) {

	var prevXhr = this.getXhrClass();

	var typeString = getTypeString(window.XMLHttpRequest.prototype);

	if(typeString != "xhrWrapperClosure") {
		window.origXMLHttpRequest = prevXhr;
	}

	XMLHttpRequest = function xhrWrapperClosure() {
		return new xhrWrapperClass(new prevXhr());
	};
};

/**
 * The DOM XMLHttpRequest object is reset by having first captured the original object when
 * {@link xhrAdaptorJs.XHRManager.injectWrapper} is called
 * and then replacing window.XMLHttpRequest with this original object.
 *
 * @summary Reset the DOM with the original XMLHttpRequest object
 * @memberOf xhrAdaptorJs.XHRManager
 *
 */
xhrAdaptorJs.XHRManager.prototype.resetXHR = function() {

	if(window.origXMLHttpRequest !== undefined ) {
		window.XMLHttpRequest = window.origXMLHttpRequest;
	}
};

/**
 *
 * @memberOf xhrAdaptorJs
 * @static 
 * @type {xhrAdaptorJs.XHRManager}
 * 
 */
xhrAdaptorJs.manager = new xhrAdaptorJs.XHRManager();
