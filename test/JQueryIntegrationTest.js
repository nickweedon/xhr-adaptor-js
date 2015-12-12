describe('JQuery Integration Test', function() {

    var xhrAdaptorJs = null;
    var XHRClass = null;
    var $ = null;

    beforeEach(function(done) {
        require(["xhr-adaptor-js", "jquery"], function(xhrAdaptorJsNS, jqueryNS) {
            xhrAdaptorJs = xhrAdaptorJsNS;
            $ = jqueryNS;
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

    it("Works with JQuery via wrapper injection", function (done) {

        var openCallback = sinon.spy();

        XHRClass.prototype.open = function(verb, url, async) {
            openCallback();
            this.parent.call(this).open.call(this, verb, url, async);
        };

        xhrAdaptorJs.manager.injectWrapper(XHRClass);

        $.get( "http://localhost:9876/data/simpleSentence.txt", function( data ) {
            sinon.assert.calledOnce(openCallback);
            done();
        });
    });


    it("Can perform OnLoad Event Delegate when used with JQuery", function (done) {

        var onLoadCallback = sinon.spy();

        function XHRClass(impl) {
            // Call the parent constructor
            this.parent.call(this).constructor.call(this, impl);
        }

        XHRClass.prototype = Object.create(xhrAdaptorJs.XHRWrapper.prototype);
        XHRClass.constructor = XHRClass;
        XHRClass.prototype.eventDelegate = {
            onload: function () {
                onLoadCallback();
                this.applyRealHandler(arguments);
            }
        };

        xhrAdaptorJs.manager.injectWrapper(XHRClass);

        $.get("http://localhost:9876/data/simpleSentence.txt", function (data) {
            sinon.assert.calledOnce(onLoadCallback);
            done();
        })
    });
    // TODO: Add unit test that overrides response event (the one that JQuery uses)
});