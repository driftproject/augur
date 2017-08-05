"use strict";

var abi = require("augur-abi");
var assert = require("chai").assert;
var BigNumber = require("bignumber.js");
var calculateSettlementFee = require("../../../../src/trading/simulation/calculate-settlement-fee");

describe("trading/simulation/calculate-settlement-fee", function () {
  var test = function (t) {
    it(t.description, function () {
      var output;
      try {
        output = calculateSettlementFee(t.params.completeSets, t.params.marketCreatorFeeRate, t.params.range, t.params.shouldCollectReportingFees, t.params.reportingFeeRate, t.params.sharePrice);
      } catch (exc) {
        output = exc;
      }
      t.assertions(output);
    });
  };
  test({
    description: "2 complete sets, 1% reporting fee, no market creator fee",
    params: {
      completeSets: new BigNumber("2", 10),
      marketCreatorFeeRate: new BigNumber("0", 10),
      range: new BigNumber("1", 10),
      shouldCollectReportingFees: 1,
      reportingFeeRate: new BigNumber("0.01", 10),
      sharePrice: new BigNumber("0.6", 10)
    },
    assertions: function (output) {
      assert.deepEqual(output, new BigNumber("0.008", 10));
    }
  });
  test({
    description: "2 complete sets, 1% reporting fee, 1.5% market creator fee",
    params: {
      completeSets: new BigNumber("2", 10),
      marketCreatorFeeRate: new BigNumber("0.015", 10),
      range: new BigNumber("1", 10),
      shouldCollectReportingFees: 1,
      reportingFeeRate: new BigNumber("0.01", 10),
      sharePrice: new BigNumber("0.6", 10)
    },
    assertions: function (output) {
      assert.deepEqual(output, new BigNumber("0.02", 10));
    }
  });
  test({
    description: "2 complete sets, 1% reporting fee, 1.5% market creator fee, do not collect reporting fees",
    params: {
      completeSets: new BigNumber("2", 10),
      marketCreatorFeeRate: new BigNumber("0.015", 10),
      range: new BigNumber("1", 10),
      shouldCollectReportingFees: 0,
      reportingFeeRate: new BigNumber("0.01", 10),
      sharePrice: new BigNumber("0.6", 10)
    },
    assertions: function (output) {
      assert.deepEqual(output, new BigNumber("0.012", 10));
    }
  });
  test({
    description: "2 complete sets, 1% reporting fee, 1.5% market creator fee, range 3",
    params: {
      completeSets: new BigNumber("2", 10),
      marketCreatorFeeRate: new BigNumber("0.015", 10),
      range: new BigNumber("3", 10),
      shouldCollectReportingFees: 1,
      reportingFeeRate: new BigNumber("0.01", 10),
      sharePrice: new BigNumber("0.6", 10)
    },
    assertions: function (output) {
      assert.deepEqual(output, new BigNumber("0.012", 10));
    }
  });
});
