pragma solidity ^0.4.13;

import 'ROOT/Controller.sol';
import 'ROOT/Mutex.sol';
import 'ROOT/reporting/Interfaces.sol';
import 'ROOT/extensions/MarketFeeCalculator.sol';
import 'ROOT/legacy_reputation/SafeMath.sol';


// AUDIT: Ensure that a malicious market can't subversively cause share tokens to be paid out incorrectly.
/**
 * @title ClaimProceeds
 * @dev This allows users to claim their money from a market by exchanging their shares
 */
contract ClaimProceeds is Controlled {
    using SafeMath for uint256;

    function publicClaimProceeds(IMarket _market) onlyInGoodTimes public returns(bool) {
        Mutex _mutex = Mutex(controller.lookup("Mutex"));
        _mutex.acquire();

        require(_market.isFinalized());
        require(block.timestamp > _market.getFinalizationTime() + 3 days);

        ReportingToken _winningReportingToken = _market.getFinalWinningReportingToken();

        for (uint8 _outcome = 0; _outcome < _market.getNumberOfOutcomes(); ++_outcome) {
            IShareToken _shareToken = _market.getShareToken(_outcome);
            uint256 _numberOfShares = _shareToken.balanceOf(msg.sender);
            var (_shareHolderShare, _creatorShare, _reporterShare) = divideUpWinnings(_market, _winningReportingToken, _outcome, _numberOfShares);

            // always destroy shares as it gives a minor gas refund and is good for the network
            if (_numberOfShares > 0) {
                _shareToken.destroyShares(msg.sender, _numberOfShares);
            }
            ERC20 _denominationToken = _market.getDenominationToken();
            // NOTE: rounding error here will result in _very_ tiny amounts of denominationToken left in the market
            if (_shareHolderShare > 0) {
                require(_denominationToken.transferFrom(_market, msg.sender, _shareHolderShare));
            }
            if (_creatorShare > 0) {
                require(_denominationToken.transferFrom(_market, _market.getCreator(), _creatorShare));
            }
            if (_reporterShare > 0) {
                require(_denominationToken.transferFrom(_market, _market.getReportingWindow(), _reporterShare));
            }
        }

        _mutex.release();

        return true;
    }

    function divideUpWinnings(IMarket _market, ReportingToken _winningReportingToken, uint8 _outcome, uint256 _numberOfShares) constant returns (uint256 _shareHolderShare, uint256 _creatorShare, uint256 _reporterShare) {
        uint256 _proceeds = calculateProceeds(_market, _winningReportingToken, _outcome, _numberOfShares);
        _creatorShare = calculateMarketCreatorFee(_market, _proceeds);
        _reporterShare = calculateReportingFee(_market, _proceeds);
        _shareHolderShare = _proceeds.sub(_creatorShare).sub(_reporterShare);
        return (_shareHolderShare, _creatorShare, _reporterShare);
    }

    function calculateProceeds(IMarket _market, ReportingToken _winningReportingToken, uint8 _outcome, uint256 _numberOfShares) constant returns (uint256) {
        uint256 _completeSetCostInAttotokens = _market.getCompleteSetCostInAttotokens();
        uint256 _payoutNumerator = _winningReportingToken.getPayoutNumerator(_outcome);
        uint256 _getPayoutDenominator = _market.getPayoutDenominator();
        return _numberOfShares.mul(_completeSetCostInAttotokens).div(10**18).mul(_payoutNumerator).div(_getPayoutDenominator);
    }

    function calculateReportingFee(IMarket _market, uint256 _amount) constant returns (uint256) {
        if (!_market.shouldCollectReportingFees()) {
            return 0;
        }

        MarketFeeCalculator _marketFeeCalculator = MarketFeeCalculator(controller.lookup("MarketFeeCalculator"));
        ReportingWindow _reportingWindow = _market.getReportingWindow();
        uint256 _reportingFeeAttoethPerEth = _marketFeeCalculator.getReportingFeeInAttoethPerEth(_reportingWindow);
        return _amount.mul(_reportingFeeAttoethPerEth).div(10**18);
    }

    function calculateMarketCreatorFee(IMarket _market, uint256 _amount) constant returns (uint256) {
        uint256 _marketCreatorFeeAttoEthPerEth = _market.getMarketCreatorSettlementFeeInAttoethPerEth();
        return _amount.mul(_marketCreatorFeeAttoEthPerEth).div(10**18);
    }
}
