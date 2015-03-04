// If the native XMLHttpRequest object is not supported then define a custom factory
// that will return a wrapped version of an object with the same interface as XMLHttpRequest
// The reason that we wrap it is so that it behaves as XMLHttpRequest does w.r.t. methods like apply and call.
if (window.XMLHttpRequest === undefined) {
    try { 
    	return new xhrAdaptorJs.xhrWrapper(new ActiveXObject("Msxml2.XMLHTTP.6.0")); 
    } catch (e) {}
    try { 
    	return new xhrAdaptorJs.xhrWrapper(new ActiveXObject("Msxml2.XMLHTTP.3.0")); 
    } catch (e) {}
    try { 
    	return new xhrAdaptorJs.xhrWrapper(new ActiveXObject("Microsoft.XMLHTTP")); 
    } catch (e) {}
    
    throw new Error("This browser does not support XMLHttpRequest.");
}			

xhrAdaptorJs.xhr = window.XMLHttpRequest;
