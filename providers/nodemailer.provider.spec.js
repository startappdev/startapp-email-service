'use strict';

describe('nodemailer email provider service', () => {


    let rewire = require('rewire');
    let should = require('should');

    let nodemailerEmailServiceClass,
        nodemailerEmailProvider,
        templateServiceMock,
        template,
        transport,
        nodemailerMock;

    before(function () {
        template = {
            "from": {
                "email": "test@test.com",
                "name": "Test"
            }
        };
    });

    beforeEach(function () {
        nodemailerEmailServiceClass = rewire('./nodemailer.provider.js');

        templateServiceMock = {
            getHtml: () => Promise.resolve(),
            getHtmlSubject: () => Promise.resolve()
        };

        transport = {
            sendMail: () => Promise.resolve({
                accepted: ["test@test.com"],
                rejected: []
            })
        };

        nodemailerMock = {
            createTransport: () => {
                return transport;
            }
        };

        nodemailerEmailServiceClass.__set__("templateService", templateServiceMock);
        nodemailerEmailServiceClass.__set__("nodemailer", nodemailerMock);

        nodemailerEmailProvider = new nodemailerEmailServiceClass();

    });


    it("should return multiple results for multiple recipients", (done) => {
        transport = {
            sendMail: () => Promise.resolve({
                accepted: [
                    "test@test.com",
                    "test2@test.com"
                ],
                rejected: []
            })
        };

        nodemailerEmailProvider.send(template,  {},  {}).then((res) => {
            res.length.should.equal(2);
            return res;
        }).then(done.bind(null, null), done);
    });

    it("should return single result with single recipient", (done) => {
        nodemailerEmailProvider.send(template,  {},  {}).then((res) => {
            res.length.should.equal(1);
            return res;
        }).then(done.bind(null, null), done);
    });

    it("should return result object", (done) => {
        nodemailerEmailProvider.send(template,  {},  {}).then((res) => {
            let result = res[0];
            result.should.have.ownProperty('status');
            result.should.have.ownProperty('email');
            return res;
        }).then(done.bind(null, null), done);
    });

    it("should reject if template service fails", () => {
        templateServiceMock.getHtml = () => Promise.reject(new Error("Template Service Error"));
        return nodemailerEmailProvider.send(template, {},  {}).should.be.rejectedWith("Template Service Error");
    });

    it("should reject if nodemailer service fails", () => {
        transport.sendMail = () => Promise.reject(new Error("nodemailer error"));
        return nodemailerEmailProvider.send(template, {}, {}).should.be.rejectedWith("nodemailer error");
    });

    it("should return status rejected if nodemailer rejects", (done) => {
        transport.sendMail = () => Promise.resolve({
            accepted: [],
            rejected: ["test@test.com"]
        });
        return nodemailerEmailProvider.send(template, {}, {}).then((res) => {
            res[0].status.should.equal("rejected");
        }).then(done.bind(null, null), done);
    });

});