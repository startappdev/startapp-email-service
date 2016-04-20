'use strict';

describe('Mandrill email provider service', () => {


    let rewire = require('rewire');
    let sinon = require('sinon');
    let should = require('should');

    let mandrillEmailServiceClass,
        mandrillEmailService,
        templateService,
        template,
        mandrill_client,
        renderOptions;

    before(function () {

        template = {
            "name": "InternalMessage",
            "path": "test/test.html",
            "from": {
                "email": "test@test.com",
                "name": "Test"
            },
            "subject": "Message from test"
        };

        renderOptions = {
            "message": "test",
            "lang": "en_US"
        };
    });

    beforeEach(function () {
        mandrillEmailServiceClass = rewire('../providers/mandrill.provider.js');

        templateService = {
            getHtml: sinon.stub().returns(Promise.resolve())
        };
        
        mandrill_client = {
            messages: {
                send: sinon.spy(function (message, successCb, errorCb) {
                    successCb([{status: "sent", email: "test@test.com"}]);
                })
            }
        };

        mandrillEmailServiceClass.__set__("templateService", templateService);
        mandrillEmailService = new mandrillEmailServiceClass({ testApiKey: "123215125dwadawdw" });
        mandrillEmailService.mandrill_client = mandrill_client;
    });

    describe("Mandrill service tests without API requests", () => {

        it("should succeed with multiple recipients", function (done) {
            let mailSettings = {
                "to": [
                    "test@test.com",
                    "test2@test.com"
                ]
            };

            mandrill_client.messages.send = sinon.spy(function (message, successCb, errorCb) {
                successCb([
                    {status: "sent", email: "test@test.com"},
                    {status: "sent", email: "test2@test.com"}
                ]);
            });
            
            mandrillEmailService.send(template, mailSettings, renderOptions)
                .then((res) => {
                    templateService.getHtml.calledOnce.should.be.true();
                    mandrill_client.messages.send.calledOnce.should.be.true();

                    return res;
                }, (err) => {
                    // make sure to show error when promise fails
                    return Promise.reject(new Error(`Send failed: ${err}`));
                })
                // call done when promise is resolved or rejected
                .then(done.bind(null, null), done);
        });

        it("should succeed with single recipient", function (done) {
            let mailSettings = {
                "to": "test@test.com"
            };

            mandrillEmailService.send(template, mailSettings, renderOptions)
                .then((res) => {
                    templateService.getHtml.calledOnce.should.be.true();
                    mandrill_client.messages.send.calledOnce.should.be.true();

                    return res;
                }, (err) => {
                    // make sure to show error when promise fails
                    return Promise.reject(new Error(`Send failed: ${err}`));
                })
                // call done when promise is resolved or rejected
                .then(done.bind(null, null), done);
        });
    });
});