// If the native XMLHttpRequest object is not supported then define a custom factory
// that will return a wrapped version of an object with the same interface as XMLHttpRequest
// The reason that we wrap it is so that it behaves as XMLHttpRequest does w.r.t. methods like apply and call.
if (window.XMLHttpRequest === undefined) {
	
	window.XMLHttpRequest = function() {
	    try { 
	    	return new xhrAdaptorJs.XHRWrapper({}, new ActiveXObject("Msxml2.XMLHTTP.6.0"), true); 
	    } catch (e) {}
	    try { 
	    	return new xhrAdaptorJs.XHRWrapper({}, new ActiveXObject("Msxml2.XMLHTTP.3.0"), true); 
	    } catch (e) {}
	    try { 
	    	return new xhrAdaptorJs.XHRWrapper({}, new ActiveXObject("Microsoft.XMLHTTP"), true); 
	    } catch (e) {}
	    
	    throw new Error("This browser does not support XMLHttpRequest.");
	};
} else {
	// Wrap it anyway for consistency
	var origXhr = null;
	var wrappedXhr = null; 
	

	console.debug("Got here");
	
	origXhr = window.XMLHttpRequest;
	
	wrappedXhr = function(objParameters) {
		console.debug("Create");
		return new xhrAdaptorJs.XHRWrapper({}, new origXhr(objParameters), true);
	};
	
	window.XMLHttpRequest = wrappedXhr; 
}		

xhrAdaptorJs.xhr = window.XMLHttpRequest;
