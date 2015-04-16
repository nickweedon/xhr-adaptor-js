xhrAdaptorJs.xhrManager = {
	
	getXhrClass : function() {

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
	},

	injectWrapper : function(xhrWrapperClass) {
		var prevXhr = this.getXhrClass();
		
		window.XMLHttpRequest = function() {
			return new xhrWrapperClass(new prevXhr());
		};
	}
	
	
};

