describe('XHRManager Test', function() {

    var xhrAdaptorJs = null;

    // Need to duplicate this code and declare this locally as it is used to exclude tests (before the 'beforeEach' method)
    function isActiveXObjectSupported() {
        try {
            var dummy = {} instanceof ActiveXObject;
        } catch (e) {
            return false;
        }
        return true;
    }

    beforeEach(function(done) {
        require(["xhr-adaptor-js"], function(xhrAdaptorJsNS) {
            xhrAdaptorJs = xhrAdaptorJsNS;
            done();
        });
    });

    afterEach(function () {
        xhrAdaptorJs.manager.resetXHR();
        XHRClass = null;
    });

    it("Can instantiate via class returned from geXhrClass", function () {
        var xhrClass = xhrAdaptorJs.manager.getXhrClass();
        var xhr = new xhrClass();
        assert.equal( typeof xhr, "object", "Expected xhrAdaptorJs.XHRManager.getXhrClass() to return a class" );
    });

    it("Can synchronously send and retrieves data using getXhrClass instance", function () {
        var xhr = new (xhrAdaptorJs.manager.getXhrClass())();
        xhr.open("get", "data/simpleSentence.txt", false);
        xhr.send();
        assert.equal( xhr.responseText, "hello there", "Failed to retrieve data");
    });

    if(!isActiveXObjectSupported()) {
        // Non-IE tests
        it("Will throw exception when XMLHttpRequest is not available", function () {
            window.XMLHttpRequest = undefined;
            var xhr = null;

            assert.throws(function () {
                    xhr = new (xhrAdaptorJs.manager.getXhrClass())();
                },
                /This browser does not support XMLHttpRequest./,
                "Expected an exception but one did not occur");
        });
    } else {
        // IE tests
        it("Will fail over to IE xhr when XMLHttpRequest is not available", function () {
            window.XMLHttpRequest = undefined;
            var xhr = null;

            var xhr = new (xhrAdaptorJs.manager.getXhrClass())();
            xhr.open("get", "data/simpleSentence.txt", false);
            xhr.send();
            assert.equal( xhr.responseText, "hello there", "Failed to retrieve data");
        });
    }
});