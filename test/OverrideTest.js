describe('XHRWrapper Override Test', function() {

    var xhrAdaptorJs = null;
    var xhrTestUtils = null;
    var XHRClass = null;

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
        require(["xhr-adaptor-js", "xhrTestUtils"], function(xhrAdaptorJsNS, xhrTestUtilsNS) {
            xhrAdaptorJs = xhrAdaptorJsNS;
            xhrTestUtils = xhrTestUtilsNS;

            XHRClass = function () {
                // Call the parent constructor
                this.parent.call(this).constructor.call(this, xhrTestUtils.createNativeXhr());
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

    describe('Simple Override Tests', function() {

        it("Sends successfully", function (done) {

            var xhr = new XHRClass();
            xhr.open("get", "data/simpleSentence.txt");

            xhr.onreadystatechange = function () {

                if (this.readyState == 4) {
                    assert.equal(this.responseText, "hello there", "Failed to retrieve data");
                    done();
                }
            };
            xhr.send();
        });

        it("Sends successfully with open override", function (done) {

            var openCallback = sinon.spy();

            XHRClass.prototype.open = function (verb, url, async) {
                openCallback();
                this.parent.call(this).open.call(this, verb, url, async);
            };

            var xhr = new XHRClass();
            xhr.open("get", "data/simpleSentence.txt");

            xhr.onreadystatechange = function () {

                if (this.readyState == 4) {
                    assert.equal(this.responseText, "hello there", "Failed to retrieve data");
                    done();
                }
            };

            sinon.assert.calledOnce(openCallback);
            xhr.send();
        });
    });

    // Can't seem to find a non-event read/write property that is actually supported on
    // the ActiveX XHR so only run these unit tests for native only XHR based browsers
    if(!isActiveXObjectSupported()) {
        describe('Test that a non-event read/write property override works', function () {

            it("Calls get/set timeout successfully", function () {
                var xhr = new XHRClass();
                xhr.open("get", "data/simpleSentence.txt");

                xhr.timeout = 500;
                assert.equal(xhr.timeout, 500);
            });

            it("Calls get/set timeout with override successfully", function(){
                var getCallback = sinon.spy();
                var setCallback = sinon.spy();

                var xhr = new XHRClass();
                xhr.open("get", "data/simpleSentence.txt");

                Object.defineProperty(XHRClass.prototype, "timeout", {
                    get : function() {
                        getCallback();
                        return this.parentProperty.call(this, "timeout").get.call(this);
                    },
                    set : function(value) {
                        setCallback(value);
                        this.parentProperty.call(this, "timeout").set.call(this, value);
                    }
                });

                xhr.timeout = 500;

                assert.equal(xhr.timeout, 500);
                sinon.assert.calledOnce(getCallback);
                sinon.assert.calledWith(setCallback, sinon.match(500));
            });

        });
    }

    describe('Test that a non-event read/write property override works', function () {
        it("Overrides responseText successfully", function(done) {
            var getCallback = sinon.spy();

            Object.defineProperty(XHRClass.prototype, "responseText", {
                get : function() {
                    getCallback();
                    return this.parentProperty.call(this, "responseText").get.call(this);
                }
            });

            var xhr = new XHRClass();

            xhr.open("get", "data/simpleSentence.txt");
            xhr.onreadystatechange = function() {

                if(this.readyState == 4) {
                    assert.equal( this.responseText, "hello there", "Failed to retrieve data");
                    sinon.assert.calledOnce(getCallback);
                    done();
                }
            };

            xhr.send();
        });
    });

    describe("Test that a event read/write property override works", function() {
       it("Calls get method of onReadyStateChange when overridden", function() {
           var getCallback = sinon.spy();

           var xhr = new XHRClass();
           // Call open to set the request as asynchronous so that
           // setting 'withCredentials' does not throw an exception
           xhr.open("get", "data/simpleSentence.txt");

           Object.defineProperty(XHRClass.prototype, "onreadystatechange", {
               get : function() {
                   getCallback();
                   return this.parentProperty.call(this, "onreadystatechange").get.call(this);
               },
               set : function(value) {
                   this.parentProperty.call(this, "onreadystatechange").set.call(this, value);
               }
           });

           var rscFunc = function() {};
           xhr.onreadystatechange = rscFunc;
           var rscDelegate = xhr.onreadystatechange;

           sinon.assert.calledOnce(getCallback);
       });

        it("Calls set method of onReadyStateChange when overridden", function() {
            var setCallback = sinon.spy();

            var xhr = new XHRClass();
            // Call open to set the request as asynchronous so that
            // setting 'withCredentials' does not throw an exception
            xhr.open("get", "data/simpleSentence.txt");

            Object.defineProperty(XHRClass.prototype, "onreadystatechange", {
                get : function() {
                    return this.parentProperty.call(this, "onreadystatechange").get.call(this);
                },
                set : function(value) {
                    setCallback();
                    this.parentProperty.call(this, "onreadystatechange").set.call(this, value);
                }
            });

            var rscFunc = function() {};
            xhr.onreadystatechange = rscFunc;
            var rscDelegate = xhr.onreadystatechange;

            sinon.assert.calledOnce(setCallback);
        });

        it("Calls event when set method of onReadyStateChange is overridden", function(done) {

            Object.defineProperty(XHRClass.prototype, "onreadystatechange", {
                get : function() {
                    return this.parentProperty.call(this, "onreadystatechange").get.call(this);
                },
                set : function(value) {
                    this.parentProperty.call(this, "onreadystatechange").set.call(this, value);
                }
            });

            var xhr = new XHRClass();

            xhr.open("get", "data/simpleSentence.txt");
            xhr.onreadystatechange = function() {

                if(this.readyState == 4) {
                    assert.equal( this.responseText, "hello there", "Failed to retrieve data");
                    done();
                }
            };
            xhr.send();

        });

        // Tests that event properties always wrap the event handler in a delegate that
        // binds the wrapped XHR object to this, rather than the raw XMLHttpRequest object.
        it("Uses XHRWrapper instance as this pointer within event handler", function(done) {
            var xhr = new XHRClass();

            xhr.open("get", "data/simpleSentence.txt");
            xhr.onreadystatechange = function() {

                if(this.readyState == 4) {
                    assert.ok( this instanceof xhrAdaptorJs.XHRWrapper, "Expected this to be an instance of xhrAdaptorJs.XHRWrapper");
                    done();
                }
            };
            xhr.send();
        });
    });

    describe("Test that a event delegate works", function() {
        it("Only calls event delegate", function(done) {
            var delegateOnReadyCallback = sinon.spy();
            var onReadyCallback = sinon.spy();

            XHRClass.prototype.eventDelegate = {
                onreadystatechange : function () {

                    if(this._xhr.readyState == 4) {
                        delegateOnReadyCallback();
                    } else {
                        // NB make sure you always call this as the ActiveX XHR
                        // will actually cease to call onreadystatechange if this is not called
                        // i.e. you will only get the first event where readyState == 1
                        this.applyRealHandler(arguments);
                    }
                }
            };

            var xhr = new XHRClass();

            xhr.open("get", "data/simpleSentence.txt");
            xhr.onreadystatechange = function() {

                if(this.readyState == 4) {
                    onReadyCallback();
                }
            };
            xhr.send();

            setTimeout(function() {
                sinon.assert.calledOnce(delegateOnReadyCallback);
                sinon.assert.notCalled(onReadyCallback);
                done();
            }, 500);
        });

        it("Calls event delegate that chains to real handler", function(done) {
            var delegateOnReadyCallback = sinon.spy();

            XHRClass.prototype.eventDelegate = {
                onreadystatechange : function () {
                    delegateOnReadyCallback();
                    this.applyRealHandler(arguments);
                }
            };

            var xhr = new XHRClass();

            xhr.open("get", "data/simpleSentence.txt");
            xhr.onreadystatechange = function() {

                if(this.readyState == 4) {
                    sinon.assert.callCount(delegateOnReadyCallback, 4);
                    done();
                }
            };
            xhr.send();
        });

        it("Calls event delegate when no onReadyStateChange set", function(done) {
            XHRClass.prototype.eventDelegate = {
                onreadystatechange : function () {
                    if(this._xhr.readyState == 4) {
                        this.applyRealHandler(arguments);
                        done();
                    }
                }
            };

            var xhr = new XHRClass();

            xhr.open("get", "data/simpleSentence.txt");

            xhr.send();
        });
    });

});