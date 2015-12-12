describe('Standalone Test', function() {

    var xhrAdaptorJs = null;
    var xhr = null;

    beforeEach(function(done) {
        require(["xhr-adaptor-js"], function(xhrAdaptorJsNS) {
            xhrAdaptorJs = xhrAdaptorJsNS;
            xhr = new xhrAdaptorJs.XHRWrapper(new window.XMLHttpRequest());
            done();
        });
    });

    afterEach(function () {
        xhrAdaptorJs.manager.resetXHR();
        xhr = null;
    });

    it("Can synchronously send and retrieves data", function () {
        xhr.open("get", "data/simpleSentence.txt", false);
        xhr.send();
        assert.equal( xhr.responseText, "hello there", "Failed to retrieve data");
    });

    it("Can asynchronously send and retrieves data and callback is called", function (done) {
        xhr.open("get", "data/simpleSentence.txt");
        xhr.onreadystatechange = function() {
            if(xhr.readyState == 4) {
                done();
            }
        };
        xhr.send();
    });

    it("Can asynchronously send and retrieves data", function (done) {
        xhr.open("get", "data/simpleSentence.txt");
        xhr.onreadystatechange = function() {

            if(this.readyState == 4) {
                assert.equal( xhr.responseText, "hello there", "Failed to retrieve data");
                done();
            }
        };
        xhr.send();
    });
});