
function isActiveXObjectSupported() {
	try {
		var dummy = {} instanceof ActiveXObject;
	} catch(e) {
		return false;
	}
	return true;
}

function createNativeXhr() {
	// Always test the ActiveX xhr on IE
	return isActiveXObjectSupported() ? 
			new ActiveXObject('MSXML2.XMLHTTP.3.0') :
			new window.XMLHttpRequest();
}
