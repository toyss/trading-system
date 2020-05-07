const upColor = '#25a69a';
const downColor = '#ef534f';

const appId = 'chart';
const panelId = 'control-panel';
const kLabelId = 'k-label-container';
const bbiLabelId = 'bbi-label-container';

const options = {
    width: 900,
    height: 600,
    localization: {
        timeFormatter(n) {
            const timestamp = n * 1000;
            const time = getTimeFormat(timestamp);
            return `${time.year}/${time.month}/${time.day} ${time.hour}:${time.minute}`;
        }
    },
    priceScale: {
        autoScale: true,
        scaleMargins: {
            top: 0.3,
            bottom: 0.25
        },
    },
    timeScale: {
        rightOffset: 1,
    },
    crosshair: {
        mode: 0,
    },
}

const bgJs = chrome.extension.getBackgroundPage();
const GRANULARITIES = bgJs.getGranularities();

const app = document.getElementById(appId);
const panel = document.getElementById(panelId);
const chart = LightweightCharts.createChart(app, options);
const candlestickSeries = chart.addCandlestickSeries();
const fastBBILineSeries = chart.addLineSeries({
    color: upColor,
    lineWidth: 1,
    crosshairMarkerVisible: false,
    priceLineVisible: false,
    lastValueVisible: false
});
const slowBBILineSeries = chart.addLineSeries({
    color: downColor,
    lineWidth: 1,
    crosshairMarkerVisible: false,
    priceLineVisible: false,
    lastValueVisible: false
});

window.globalRowData = [];

function removeKLabel() {
    const lastContainer = document.getElementById(kLabelId);

    if (lastContainer) {
        lastContainer.parentElement.removeChild(lastContainer);
    }
}

function renderKLabel(rowData) {
    const container = document.createElement('div');
    container.setAttribute('id', kLabelId);

    const color = rowData.close > rowData.open ? upColor : downColor;

    container.innerHTML = `
        <div>高：<span style="color: ${color}">${getNum(rowData.high)}</span></div>
        <div>开：<span style="color: ${color}">${getNum(rowData.open)}</span></div>
        <div>收：<span style="color: ${color}">${getNum(rowData.close)}</span></div>
        <div>低：<span style="color: ${color}">${getNum(rowData.low)}</span></div>
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
        content += `<div>快：<span style="color: ${upColor}">${fastBBI}</span></div>`
    }
    if (slowBBI && !isNaN(slowBBI)) {
        content += `<div>慢：<span style="color: ${downColor}">${slowBBI}</span></div>`
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
        await getKData('BTC', lastFrom * 1000, GRANULARITIES['4h']).then(resp => render(resp));
        chart.timeScale().scrollToPosition(position, false);
    }
}

function getKData(coin, lastTime, granularity) {
    const api = bgJs.getSpotApi(coin);

    return bgJs.fetchGet(api, {
        start: getISOTime('2017-01-01'),
        end: getISOTime(lastTime),
        granularity,
    });
}

function render(responseData = []) {
    const candlestickData = responseData.map(item => {
        return {
            time: +new Date(item[0]) / 1000,
            open: Number(item[1]),
            high: Number(item[2]),
            low: Number(item[3]),
            close: Number(item[4]),
        };
    });
    candlestickData.forEach(item => {
        candlestickSeries.update(item);
        window.globalRowData.push(item);
    });

    const fastBBILineData = calculateBBI(window.globalRowData, 5, 7, 10, 14).map((value, index) => {
        return {
            time: window.globalRowData[index].time,
            value,
        };
    });
    fastBBILineData.forEach(item => {
        fastBBILineSeries.update(item);
    });

    const slowBBILineData = calculateBBI(window.globalRowData, 10, 20, 30, 60).map((value, index) => {
        return {
            time: window.globalRowData[index].time,
            value,
        };
    });
    slowBBILineData.forEach(item => {
        slowBBILineSeries.update(item);
    });
}

function loadControlOptions() {
    // const controlOptions = chrome.storage.sync.get()
}

window.onload = () => {
    candlestickSeries.setData([]);
    fastBBILineSeries.setData([]);
    slowBBILineSeries.setData([]);

    chart.subscribeCrosshairMove(handleCrosshairMoved);
    chart.subscribeVisibleTimeRangeChange(debounce(handleVisibleTimeRangeChange));

    loadControlOptions();

    getKData('BTC', new Date(), GRANULARITIES['4h']).then(resp => render(resp));
}

