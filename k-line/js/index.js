const upColor = '#26a69a';
const downColor = '#ef5350';
const fastColor = '#b2379a';
const slowColor = '#333333';

const appId = 'chart';
const panelId = 'control-panel';
const kLabelId = 'k-label-container';
const bbiLabelId = 'bbi-label-container';

const options = {
    width: 1200,
    height: 800,
    localization: {
        timeFormatter(n) {
            const timestamp = n * 1000;
            const time = getTimeFormat(timestamp);
            return `${time.year}/${time.month}/${time.day} ${time.hour}:${time.minute}`;
        },
    },
    priceScale: {
        autoScale: true,
        scaleMargins: {
            top: 0.3,
            bottom: 0.25,
        },
    },
    timeScale: {
        rightOffset: 1,
    },
    crosshair: {
        mode: 0,
    },
};

const bgJs = chrome.extension.getBackgroundPage();
const GRANULARITIES = bgJs.getGranularities();

const app = document.getElementById(appId);
const panel = document.getElementById(panelId);
const chart = LightweightCharts.createChart(app, options);
const candlestickSeries = chart.addCandlestickSeries();
const fastBBILineSeries = chart.addLineSeries({
    color: fastColor,
    lineWidth: 1,
    crosshairMarkerVisible: false,
    priceLineVisible: false,
    lastValueVisible: false,
});
const slowBBILineSeries = chart.addLineSeries({
    color: slowColor,
    lineWidth: 1,
    crosshairMarkerVisible: false,
    priceLineVisible: false,
    lastValueVisible: false,
});

window.globalRowData = [];

function removeKLabel() {
    const lastContainer = document.getElementById(kLabelId);

    if (lastContainer) {
        lastContainer.parentElement.removeChild(lastContainer);
    }
}

function renderKLabel(row) {
    const container = document.createElement('div');
    container.setAttribute('id', kLabelId);

    const isRise = row.close > row.open;
    const color = isRise ? upColor : downColor;
    const rate = ((row.close - row.open) * 100) / (isRise ? row.open : row.close);

    container.innerHTML = `
        <div>高：<span style="color: ${color}">${getNum(row.high)}</span></div>
        <div>开：<span style="color: ${color}">${getNum(row.open)}</span></div>
        <div>收：<span style="color: ${color}">${getNum(row.close)}</span></div>
        <div>低：<span style="color: ${color}">${getNum(row.low)}</span></div>
        <div>率：<span style="color: ${color}">${getNum(rate)}%</span></div>
    `;

    app.append(container);
}

function removeBBILabel() {
    const lastContainer = document.getElementById(bbiLabelId);

    if (lastContainer) {
        lastContainer.parentElement.removeChild(lastContainer);
    }
}

function renderBBILabel(fastBBI, slowBBI) {
    const container = document.createElement('div');
    container.setAttribute('id', bbiLabelId);

    let content = '';
    if (fastBBI && !isNaN(fastBBI)) {
        content += `<div>快：<span style="color: ${fastColor}">${fastBBI}</span></div>`;
    }
    if (slowBBI && !isNaN(slowBBI)) {
        content += `<div>慢：<span style="color: ${slowColor}">${slowBBI}</span></div>`;
    }
    container.innerHTML = content;

    app.append(container);
}

function handleCrosshairMoved(param) {
    removeKLabel();
    removeBBILabel();

    if (!param.point) {
        return;
    }

    let iterator = param.seriesPrices.values();

    // K柱
    const rowData = iterator.next();
    rowData.value && renderKLabel(rowData.value);

    // BBI
    const fastBBI = iterator.next();
    const slowBBI = iterator.next();
    renderBBILabel(getNum(fastBBI.value), getNum(slowBBI.value));
}

async function handleVisibleTimeRangeChange(range) {
    window.lastFrom = window.globalRowData[window.globalRowData.length - 1].time;

    if (range.from === window.lastFrom && window.lastFrom > 1508083200) {
        const position = chart.timeScale().scrollPosition();
        await getKData('BTC', lastFrom * 1000, GRANULARITIES['4h']).then((resp) => render(resp.data));
        chart.timeScale().scrollToPosition(position, false);
    }
}

function getKData(coin, lastTime, granularity) {
    const api = bgJs.getSpotApi(coin);
    const params = new URLSearchParams(location.search);
    const periods = {
        '15m': '15min',
        '1h': '60min',
        '4h': '4hour',
        '1d': '1day',
    };
    return bgJs.fetchGet('market/history/kline', {
        // start: getISOTime('2017-01-01'),
        // end: getISOTime(lastTime),
        // granularity,
        symbol: `${params.get('b')}_CQ`,
        period: `${periods[params.get('p')]}`,
        size: 2000,
    });
}

function render(responseData = []) {
    const candlestickData = responseData.map((item) => {
        return {
            time: item.id,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
        };
    });
    candlestickData.forEach((item) => {
        window.globalRowData.push(item);
        candlestickSeries.update(item);
    });

    const fastBBILineData = calculateBBI(window.globalRowData, 5, 10, 20, 30).map((value, index) => {
        window.globalRowData[index].fast = value || undefined;
        return {
            time: window.globalRowData[index].time,
            value,
        };
    });
    fastBBILineData.forEach((item) => {
        fastBBILineSeries.update(item);
    });

    const slowBBILineData = calculateBBI(window.globalRowData, 30, 60, 80, 120).map((value, index) => {
        window.globalRowData[index].slow = value || undefined;
        return {
            time: window.globalRowData[index].time,
            value,
        };
    });
    slowBBILineData.forEach((item) => {
        slowBBILineSeries.update(item);
    });
}

function loadControlOptions() {
    // const controlOptions = chrome.storage.sync.get()
}

window.onload = () => {
    const params = new URLSearchParams(location.search);
    if (!params.get('b') || !params.get('p')) {
        const b = localStorage.getItem('b') || 'btc';
        const p = localStorage.getItem('p') || '4h';
        window.location.href = `${location.href}?b=${b}&p=${p}`;
    } else {
        localStorage.setItem('b', params.get('b'));
        localStorage.setItem('p', params.get('p'));
    }
    candlestickSeries.setData([]);
    fastBBILineSeries.setData([]);
    slowBBILineSeries.setData([]);

    chart.subscribeCrosshairMove(handleCrosshairMoved);
    chart.subscribeVisibleTimeRangeChange(debounce(handleVisibleTimeRangeChange));

    loadControlOptions();

    getKData('BTC', new Date(), GRANULARITIES['4h']).then((resp) => render(resp.data));
};
