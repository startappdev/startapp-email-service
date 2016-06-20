'use strict';

describe('Email template service', () => {

    let rewire = require('rewire');
    let sinon = require('sinon');
    let should = require('should');

    // mocks
    let swig,
        templateService;

    beforeEach(function () {
        templateService = rewire('./template.service.js');

        swig = {};
        templateService.__set__("swig", swig);
    });

    it("should reject when template is undefined", function () {
        return templateService.getHtml(undefined, {}).should.be.rejectedWith({message: "Template is not defined"});
    });

    it("should resolve when template is returned", function () {
        swig.renderFile = sinon.spy(function (path, renderOptions, cb) {
            cb(null, "test");
        });
        return templateService.getHtml({name: "TestTemplate", path: "/test/test"}, {}).should.be.fulfilledWith("test");
    });

    it("should reject when swig fails to render template", function () {
        swig.renderFile = sinon.spy(function (path, renderOptions, cb) {
            cb(new Error("error"));
        });
        return templateService.getHtml({name: "TestTemplate", path: "/test/test"}, {}).catch((err) => {
            swig.renderFile.called.should.be.true();
            return Promise.reject(err);
        }).should.be.rejectedWith("error");
    });
});