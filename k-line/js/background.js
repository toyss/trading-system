const okexUrlPrefix = 'https://api.btcgateway.pro/';

function fetchData(api) {
    return fetch(okexUrlPrefix + api)
        .then((res) => res.json())
        .catch(() => null);
}

function fetchGet(api, params) {
    if (params) {
        const paramsArray = [];
        Object.keys(params).forEach((key) => paramsArray.push(key + '=' + params[key]));
        if (api.search(/\?/) === -1) {
            api += '?' + paramsArray.join('&');
        } else {
            api += '&' + paramsArray.join('&');
        }
    }

    return fetchData(api);
}

function getSpotApi(coin) {
    return `api/spot/v3/instruments/${coin}-USDT/candles`;
}

function getAllCoinNames() {
    return ['BTC', 'ETH', 'ETC', 'LTC', 'EOS', 'BCH', 'BSV'];
}

function getGranularities() {
    return {
        '15m': 60 * 15,
        h: 60 * 60,
        '4h': 60 * 60 * 4,
        d: 60 * 60 * 24,
        w: 60 * 60 * 24 * 7,
    };
}

chrome.browserAction.onClicked.addListener(() => chrome.tabs.create({ url: chrome.extension.getURL('index.html') }));
