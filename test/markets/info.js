/**
 * augur.js tests
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var assert = require("chai").assert;
var abi = require("augur-abi");
var runner = require("../runner");
var tools = require("../tools");

describe("Unit tests", function () {
    describe("eth_call", function () {
        runner(this.title, [{
            method: "getCreator",
            parameters: ["address"]
        }, {
            method: "getCreationFee",
            parameters: ["address"]
        }, {
            method: "getDescription",
            parameters: ["hash"]
        }]);
    });
    describe("eth_sendTransaction", function () {
        runner(this.title, [{
            method: "setInfo",
            parameters: ["hash", "string", "address", "fixed"]
        }]);
    });
});

describe("Integration tests", function () {

    var augur = tools.setup(require("../../src"), process.argv.slice(2));
    var constants = augur.constants;
    var branchID = augur.branches.dev;
    var accounts = tools.get_test_accounts(augur, tools.MAX_TEST_ACCOUNTS);
    var testAccount = accounts[0];
    var markets = augur.getMarketsInBranch(branchID);
    var marketID = markets[0];
    var market_creator_1 = testAccount;
    var marketID2 = markets[1];
    var market_creator_2 = testAccount;
    var eventID = augur.getMarketEvents(marketID)[0];

    function check_account(account, testAccount) {
        assert.isAbove(abi.bignum(account).toNumber(), 0);
        if (augur.rpc.nodes.local && augur.rpc.version() === "10101") {
            assert(abi.bignum(account).eq(abi.bignum(testAccount)));
        }
    }

    // info.se
    describe("info.se", function () {
        describe("getCreator(" + eventID + ") [event]", function () {
            var test = function (r) {
                check_account(r, testAccount);
            };
            it("sync", function () {
                test(augur.getCreator(eventID));
            });
            it("async", function (done) {
                augur.getCreator(eventID, function (r) {
                    test(r); done();
                });
            });
            if (!augur.rpc.wsUrl) {
                it("batched-async", function (done) {
                    var batch = augur.createBatch();
                    batch.add("getCreator", [eventID], function (r) {
                        test(r);
                    });
                    batch.add("getCreator", [eventID], function (r) {
                        test(r); done();
                    });
                    batch.execute();
                });
            }
        });
        describe("getCreator(" + marketID + ") [market]", function () {
            var test = function (r) {
                check_account(r, testAccount);
            };
            it("sync", function () {
                test(augur.getCreator(marketID));
            });
            it("async", function (done) {
                augur.getCreator(marketID, function (r) {
                    test(r); done();
                });
            });
            if (!augur.rpc.wsUrl) {
                it("batched-async", function (done) {
                    var batch = augur.createBatch();
                    batch.add("getCreator", [marketID], function (r) {
                        test(r);
                    });
                    batch.add("getCreator", [marketID], function (r) {
                        test(r); done();
                    });
                    batch.execute();
                });
            }
        });
        describe("getCreationFee(" + marketID + ") [event]", function () {
            var test = function (r) {
                assert(Number(r) > 0);
            };
            it("sync", function () {
                test(augur.getCreationFee(marketID));
            });
            it("async", function (done) {
                augur.getCreationFee(marketID, function (r) {
                    test(r); done();
                });
            });
            if (!augur.rpc.wsUrl) {
                it("batched-async", function (done) {
                    var batch = augur.createBatch();
                    batch.add("getCreationFee", [marketID], function (r) {
                        test(r);
                    });
                    batch.add("getCreationFee", [marketID], function (r) {
                        test(r); done();
                    });
                    batch.execute();
                });
            }
        });
        describe("getCreationFee(" + marketID + ") [market]", function () {
            var test = function (r) {
                assert(Number(r) > 0);
            };
            it("sync", function () {
                test(augur.getCreationFee(marketID));
            });
            it("async", function (done) {
                augur.getCreationFee(marketID, function (r) {
                    test(r); done();
                });
            });
            if (!augur.rpc.wsUrl) {
                it("batched-async", function (done) {
                    var batch = augur.createBatch();
                    batch.add("getCreationFee", [marketID], function (r) {
                        test(r);
                    });
                    batch.add("getCreationFee", [marketID], function (r) {
                        test(r); done();
                    });
                    batch.execute();
                });
            }
        });
        describe("getDescription(" + eventID + ")", function () {
            var test = function (r) {
                assert.isAbove(r.length, 0);
            };
            it("sync", function () {
                test(augur.getDescription(eventID));
            });
            it("async", function (done) {
                augur.getDescription(eventID, function (r) {
                    test(r); done();
                });
            });
            if (!augur.rpc.wsUrl) {
                it("batched-async", function (done) {
                    var batch = augur.createBatch();
                    batch.add("getDescription", [eventID], function (r) {
                        test(r);
                    });
                    batch.add("getDescription", [eventID], function (r) {
                        test(r); done();
                    });
                    batch.execute();
                });
            }
        });
    });

});
