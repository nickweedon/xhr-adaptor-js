describe('Wrapper Injection Test', function() {

    var xhrAdaptorJs = null;
    var XHRClass = null;

    beforeEach(function(done) {
        require(["xhr-adaptor-js"], function(xhrAdaptorJsNS) {
            xhrAdaptorJs = xhrAdaptorJsNS;
            XHRClass = function (impl) {
                // Call the parent constructor
                this.parent.call(this).constructor.call(this, impl);
            };
            XHRClass.prototype = Object.create(xhrAdaptorJs.XHRWrapper.prototype);
            XHRClass.constructor = XHRClass;
            done();
        });
    });

    afterEach(function () {
        xhrAdaptorJs.manager.resetXHR();
        XHRClass = null;
    });

    it("Can perform single level wrapper injection", function (done) {

        XHRClass.prototype.open = function(verb, url, async) {
            assert.ok( true, "Overriden function was not called");
            this.parent.call(this).open.call(this, verb, url, async);
        };

        xhrAdaptorJs.manager.injectWrapper(XHRClass);
        xhr = new XMLHttpRequest();

        xhr.open("get", "data/simpleSentence.txt");
        xhr.onreadystatechange = function() {

            if(this.readyState == 4) {
                assert.equal( this.responseText, "hello there", "Failed to retrieve data");
                done();
            }
        };
        xhr.send();
        done();
    });

    it("Can perform two level wrapper injection", function (done) {

        //assert.equal(1, 2, "Need to finish this test...");
        var openCallback = sinon.spy();

        function XHRResponseClass(impl) {
            // Call the parent constructor
            this.parent.call(this).constructor.call(this, impl);
        }
        XHRResponseClass.prototype = Object.create(xhrAdaptorJs.XHRWrapper.prototype);
        XHRResponseClass.constructor = XHRClass;
        Object.defineProperty(XHRResponseClass.prototype, "responseText", {
            get : function() {
                return this.parentProperty.call(this, "responseText").get.call(this).replace("there", "bob");
            }
        });
        xhrAdaptorJs.manager.injectWrapper(XHRResponseClass);

        XHRClass.prototype.open = function(verb, url, async) {
            openCallback();
            this.parent.call(this).open.call(this, verb, url, async);
        };

        xhrAdaptorJs.manager.injectWrapper(XHRClass);

        xhr = new XMLHttpRequest();

        xhr.open("get", "data/simpleSentence.txt");

        xhr.onreadystatechange = function() {

            if(this.readyState == 4) {
                assert.equal( this.responseText, "hello bob", "Failed to retrieve data");
                done();
            }
        };
        xhr.send();

        sinon.assert.calledOnce(openCallback);
    });


});