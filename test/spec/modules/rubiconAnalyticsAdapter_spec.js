import adaptermanager from 'src/adaptermanager';
import rubiconAnalyticsAdapter, { SEND_TIMEOUT } from 'modules/rubiconAnalyticsAdapter';
import CONSTANTS from 'src/constants.json';
import { config } from 'src/config';

let Ajv = require('ajv');
let schema = require('./rubiconAnalyticsSchema.json');
let ajv = new Ajv({
  allErrors: true
});

let validator = ajv.compile(schema);

function validate(message) {
  validator(message);
  expect(validator.errors).to.deep.equal(null);
}

// using es6 "import * as events from 'src/events'" causes the events.getEvents stub not to work...
let events = require('src/events');
let ajax = require('src/ajax');
let utils = require('src/utils');

const {
  EVENTS: {
    AUCTION_INIT,
    AUCTION_END,
    BID_REQUESTED,
    BID_RESPONSE,
    BID_WON,
    BID_TIMEOUT,
    SET_TARGETING
  }
} = CONSTANTS;

const BID = {
  'bidder': 'rubicon',
  'width': 728,
  'height': 90,
  'statusMessage': 'Bid available',
  'adId': '2ecff0db240757',
  'source': 'client',
  'requestId': '2ecff0db240757',
  'currency': 'USD',
  'creativeId': '3571560',
  'cpm': 1.22752,
  'ttl': 300,
  'netRevenue': false,
  'ad': '<html></html>',
  'rubiconTargeting': {
    'rpfl_elemid': '/19968336/header-bid-tag-0',
    'rpfl_14062': '2_tier0100'
  },
  'auctionId': '25c6d7f5-699a-4bfc-87c9-996f915341fa',
  'responseTimestamp': 1519149629415,
  'requestTimestamp': 1519149628471,
  'adUnitCode': '/19968336/header-bid-tag-0',
  'timeToRespond': 944,
  'pbLg': '1.00',
  'pbMg': '1.20',
  'pbHg': '1.22',
  'pbAg': '1.20',
  'pbDg': '1.22',
  'pbCg': '',
  'size': '728x90',
  'adserverTargeting': {
    'hb_bidder': 'rubicon',
    'hb_adid': '2ecff0db240757',
    'hb_pb': '1.20',
    'hb_size': '728x90',
    'hb_source': 'client'
  },
  getStatusCode() {
    return 1;
  }
};

const BID2 = Object.assign({}, BID, {
  adUnitCode: '/19968336/header-bid-tag1',
  adId: '3bd4ebb1c900e2',
  requestId: '3bd4ebb1c900e2',
  cpm: 1.5,
  rubiconTargeting: {
    'rpfl_elemid': '/19968336/header-bid-tag1',
    'rpfl_14062': '2_tier0100'
  },
  adserverTargeting: {
    'hb_bidder': 'rubicon',
    'hb_adid': '3bd4ebb1c900e2',
    'hb_pb': '1.20',
    'hb_size': '728x90',
    'hb_source': 'client'
  }
});

const MOCK = {
  SET_TARGETING: {
    [BID.adUnitCode]: BID.adserverTargeting,
    [BID2.adUnitCode]: BID2.adserverTargeting
  },
  AUCTION_INIT: {
    'timestamp': 1519149536560,
    'auctionId': '25c6d7f5-699a-4bfc-87c9-996f915341fa',
    'timeout': 3000
  },
  BID_REQUESTED: {
    'bidder': 'rubicon',
    'auctionId': '25c6d7f5-699a-4bfc-87c9-996f915341fa',
    'bidderRequestId': '1be65d7958826a',
    'bids': [
      {
        'bidder': 'rubicon',
        'params': {
          'accountId': '14062',
          'siteId': '70608',
          'zoneId': '335918',
          'userId': '12346',
          'keywords': ['a', 'b', 'c'],
          'inventory': 'test',
          'visitor': {'ucat': 'new', 'lastsearch': 'iphone'},
          'position': 'btf'
        },
        'mediaType': 'banner',
        'adUnitCode': '/19968336/header-bid-tag-0',
        'transactionId': 'ca4af27a-6d02-4f90-949d-d5541fa12014',
        'sizes': [[1000, 300], [970, 250], [728, 90]],
        'bidId': '2ecff0db240757',
        'bidderRequestId': '1be65d7958826a',
        'auctionId': '25c6d7f5-699a-4bfc-87c9-996f915341fa'
      },
      {
        'bidder': 'rubicon',
        'params': {
          'accountId': '14062',
          'siteId': '70608',
          'zoneId': '335918',
          'userId': '12346',
          'keywords': ['a', 'b', 'c'],
          'inventory': {'rating': '4-star', 'prodtype': 'tech'},
          'visitor': {'ucat': 'new', 'lastsearch': 'iphone'},
          'position': 'atf'
        },
        'mediaTypes': {
          'banner': {
            'sizes': [[1000, 300], [970, 250], [728, 90]]
          }
        },
        'adUnitCode': '/19968336/header-bid-tag1',
        'transactionId': 'c116413c-9e3f-401a-bee1-d56aec29a1d4',
        'sizes': [[1000, 300], [970, 250], [728, 90]],
        'bidId': '3bd4ebb1c900e2',
        'bidderRequestId': '1be65d7958826a',
        'auctionId': '25c6d7f5-699a-4bfc-87c9-996f915341fa'
      }
    ],
    'auctionStart': 1519149536560,
    'timeout': 5000,
    'start': 1519149562216
  },
  BID_RESPONSE: [
    BID,
    BID2
  ],
  AUCTION_END: {
    'auctionId': '25c6d7f5-699a-4bfc-87c9-996f915341fa'
  },
  BID_WON: [
    Object.assign({}, BID, {
      'status': 'rendered'
    }),
    Object.assign({}, BID2, {
      'status': 'rendered'
    })
  ],
  BID_TIMEOUT: [
    {
      'bidId': '2ecff0db240757',
      'bidder': 'rubicon',
      'adUnitCode': '/19968336/header-bid-tag-0',
      'auctionId': '25c6d7f5-699a-4bfc-87c9-996f915341fa'
    }
  ]
};

const ANALYTICS_MESSAGE = {
  'eventTimeMillis': 1519767013781,
  'integration': 'pbjs',
  'version': '$prebid.version$',
  'referrerUri': 'http://www.test.com/page.html',
  'domain': 'test.com',
  'client': {
    'deviceClass': 'tablet'
  },
  'auctions': [
    {
      'clientTimeoutMillis': 3000,
      'serverTimeoutMillis': 1000,
      'serverAccountId': 1001,
      'adUnits': [
        {
          'adUnitCode': '/19968336/header-bid-tag-0',
          'mediaTypes': [
            'banner'
          ],
          'dimensions': [
            {
              'width': 1000,
              'height': 300
            },
            {
              'width': 970,
              'height': 250
            },
            {
              'width': 728,
              'height': 90
            }
          ],
          'adserverTargeting': {
            'hb_bidder': 'rubicon',
            'hb_adid': '2ecff0db240757',
            'hb_pb': '1.20',
            'hb_size': '728x90',
            'hb_source': 'client'
          },
          'bids': [
            {
              'bidder': 'rubicon',
              'transactionId': 'ca4af27a-6d02-4f90-949d-d5541fa12014',
              'bidId': '2ecff0db240757',
              'status': 'success',
              'source': 'client',
              'clientLatencyMillis': 617477221,
              'params': {
                'accountId': '14062',
                'siteId': '70608',
                'zoneId': '335918'
              },
              'bidResponse': {
                'bidPriceUSD': 1.22752,
                'dimensions': {
                  'width': 728,
                  'height': 90
                },
                'adserverTargeting': {
                  'hb_bidder': 'rubicon',
                  'hb_adid': '2ecff0db240757',
                  'hb_pb': '1.20',
                  'hb_size': '728x90',
                  'hb_source': 'client'
                }
              }
            }
          ]
        },
        {
          'adUnitCode': '/19968336/header-bid-tag1',
          'mediaTypes': [
            'banner'
          ],
          'dimensions': [
            {
              'width': 1000,
              'height': 300
            },
            {
              'width': 970,
              'height': 250
            },
            {
              'width': 728,
              'height': 90
            }
          ],
          'adserverTargeting': {
            'hb_bidder': 'rubicon',
            'hb_adid': '3bd4ebb1c900e2',
            'hb_pb': '1.20',
            'hb_size': '728x90',
            'hb_source': 'client'
          },
          'bids': [
            {
              'bidder': 'rubicon',
              'transactionId': 'c116413c-9e3f-401a-bee1-d56aec29a1d4',
              'bidId': '3bd4ebb1c900e2',
              'status': 'success',
              'source': 'client',
              'clientLatencyMillis': 617477221,
              'params': {
                'accountId': '14062',
                'siteId': '70608',
                'zoneId': '335918'
              },
              'bidResponse': {
                'bidPriceUSD': 1.5,
                'dimensions': {
                  'width': 728,
                  'height': 90
                },
                'adserverTargeting': {
                  'hb_bidder': 'rubicon',
                  'hb_adid': '3bd4ebb1c900e2',
                  'hb_pb': '1.20',
                  'hb_size': '728x90',
                  'hb_source': 'client'
                }
              }
            }
          ]
        }
      ]
    }
  ],
  'bidsWon': [
    {
      'bidder': 'rubicon',
      'transactionId': 'ca4af27a-6d02-4f90-949d-d5541fa12014',
      'bidId': '2ecff0db240757',
      'status': 'success',
      'source': 'client',
      'clientLatencyMillis': 617477221,
      'params': {
        'accountId': '14062',
        'siteId': '70608',
        'zoneId': '335918'
      },
      'bidResponse': {
        'bidPriceUSD': 1.22752,
        'dimensions': {
          'width': 728,
          'height': 90
        },
        'adserverTargeting': {
          'hb_bidder': 'rubicon',
          'hb_adid': '2ecff0db240757',
          'hb_pb': '1.20',
          'hb_size': '728x90',
          'hb_source': 'client'
        }
      }
    },
    {
      'bidder': 'rubicon',
      'transactionId': 'c116413c-9e3f-401a-bee1-d56aec29a1d4',
      'bidId': '3bd4ebb1c900e2',
      'status': 'success',
      'source': 'client',
      'clientLatencyMillis': 617477221,
      'params': {
        'accountId': '14062',
        'siteId': '70608',
        'zoneId': '335918'
      },
      'bidResponse': {
        'bidPriceUSD': 1.5,
        'dimensions': {
          'width': 728,
          'height': 90
        },
        'adserverTargeting': {
          'hb_bidder': 'rubicon',
          'hb_adid': '3bd4ebb1c900e2',
          'hb_pb': '1.20',
          'hb_size': '728x90',
          'hb_source': 'client'
        }
      }
    }
  ]
};

describe('rubicon analytics adapter', () => {
  let sandbox;
  let xhr;
  let requests;
  let oldScreen;
  let clock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    xhr = sandbox.useFakeXMLHttpRequest();
    requests = [];
    xhr.onCreate = request => requests.push(request);

    sandbox.stub(events, 'getEvents').returns([]);

    sandbox.stub(utils, 'getTopWindowUrl').returns('http://www.test.com/page.html');

    oldScreen = window.screen;
    window.screen = {
      width: '375',
      height: '812'
    };

    clock = sandbox.useFakeTimers(1519767013781);

    config.setConfig({
      s2sConfig: {
        timeout: 1000,
        accountId: 1001,
      }
    })
  });

  afterEach(() => {
    window.screen = oldScreen;
    sandbox.restore();
    config.resetConfig();
  });

  it('should be configurable', () => {
    // TODO: determine configuration
  });

  describe('when handling events', () => {
    beforeEach(() => {
      rubiconAnalyticsAdapter.enableAnalytics();
    });

    afterEach(() => {
      rubiconAnalyticsAdapter.disableAnalytics();
    });

    it('should build a batched message from prebid events', () => {
      events.emit(AUCTION_INIT, MOCK.AUCTION_INIT);
      events.emit(BID_REQUESTED, MOCK.BID_REQUESTED);
      events.emit(BID_RESPONSE, MOCK.BID_RESPONSE[0]);
      events.emit(BID_RESPONSE, MOCK.BID_RESPONSE[1]);
      events.emit(AUCTION_END, MOCK.AUCTION_END);
      events.emit(SET_TARGETING, MOCK.SET_TARGETING);
      events.emit(BID_WON, MOCK.BID_WON[0]);
      events.emit(BID_WON, MOCK.BID_WON[1]);

      expect(requests.length).to.equal(1);
      let request = requests[0];

      expect(request.url).to.equal('//localhost:9999/test');

      let message = JSON.parse(request.requestBody);
      validate(message);

      expect(message).to.deep.equal(ANALYTICS_MESSAGE);
    });

    it('should send batched message without BID_WON if necessary and further BID_WON events individually', () => {
      events.emit(AUCTION_INIT, MOCK.AUCTION_INIT);
      events.emit(BID_REQUESTED, MOCK.BID_REQUESTED);
      events.emit(BID_RESPONSE, MOCK.BID_RESPONSE[0]);
      events.emit(BID_RESPONSE, MOCK.BID_RESPONSE[1]);
      events.emit(AUCTION_END, MOCK.AUCTION_END);
      events.emit(SET_TARGETING, MOCK.SET_TARGETING);
      events.emit(BID_WON, MOCK.BID_WON[0]);

      clock.tick(SEND_TIMEOUT + 1000);

      events.emit(BID_WON, MOCK.BID_WON[1]);

      expect(requests.length).to.equal(2);

      let message = JSON.parse(requests[0].requestBody);
      validate(message);
      expect(message.bidsWon.length).to.equal(1);
      expect(message.auctions).to.deep.equal(ANALYTICS_MESSAGE.auctions);
      expect(message.bidsWon[0]).to.deep.equal(ANALYTICS_MESSAGE.bidsWon[0]);

      message = JSON.parse(requests[1].requestBody);
      validate(message);
      expect(message.bidsWon.length).to.equal(1);
      expect(message).to.not.have.property('auctions');
      expect(message.bidsWon[0]).to.deep.equal(ANALYTICS_MESSAGE.bidsWon[1]);
    });

    it('should properly mark bids as timed out', () => {
      events.emit(AUCTION_INIT, MOCK.AUCTION_INIT);
      events.emit(BID_REQUESTED, MOCK.BID_REQUESTED);
      events.emit(BID_TIMEOUT, MOCK.BID_TIMEOUT);
      events.emit(AUCTION_END, MOCK.AUCTION_END);

      clock.tick(SEND_TIMEOUT + 1000);

      expect(requests.length).to.equal(1);

      let message = JSON.parse(requests[0].requestBody);
      validate(message);
      let timedOutBid = message.auctions[0].adUnits[0].bids[0];
      expect(timedOutBid.status).to.equal('error');
      expect(timedOutBid.error.code).to.equal('timeout-error');
      expect(timedOutBid).to.not.have.property('bidResponse');
    });
  });
});
