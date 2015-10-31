define('xhr-adaptor-js', 
    
	[],
    function () {
    
	
	/**
	 * For the AMD module version of the library, the xhrAdaptorJs namespace
	 * does not exist but refers instead to the AMD module itself.
	 *
	 * @summary The xhrAdaptorJs namespace and AMD module
	 * @version 1.0
	 * @exports xhr-adaptor-js
	 * @namespace {object} xhrAdaptorJs
	 */
	var xhrAdaptorJs = xhrAdaptorJs || {};
	
	//@@include('XHRWrapper.js')
	//@@include('XHRManager.js')
	//@@include('BlockingRequestQueueXHR.js')

    return xhrAdaptorJs;
});
