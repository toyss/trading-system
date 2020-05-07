const app = $('#app');
const remind = $('#remind');
const loading = $('#loading');
const bgJs = chrome.extension.getBackgroundPage();
const allCoins = bgJs.getAllCoinNames();

function completeInstrumentName(coin) {
    return `${coin}-USD-SWAP`;
}

function getData(allCoins) {
    return bgJs.getAllInstances().then(resp => resp && allCoins.map(coin => {
        return resp.find(v => v.instrument_id === completeInstrumentName(coin));
    }));
}

function renderPage() {
    return getData(allCoins).then(resp => {
        const el = structureTable(resp);
        loading.hide();
        app.append(el);
    }).catch(() => renderPage());
}

function structureTable(data) {
    const ul = document.createElement('ul');
    ul.className = 'table';
    let content = '';
    data.forEach((item, index) => {
        const itemContent = `<li class="table-item">
            <span class="table-item-name">${allCoins[index]}</span>
            <span class="table-item-price">${Number(item.last).toFixed(2)}</span>
            <a href="/options.html" class="table-item-link">设置</a>
        </li>`;
        content += itemContent;
    });
    ul.innerHTML = content;
    return ul;
}

function setTitle() {
    if (remind.is('.ban')) {
        remind.attr('title', '当前状态：关闭提醒');
    } else {
        remind.attr('title', '当前状态：打开提醒');
    }
}

window.onload = function () {
    renderPage();
    const hasTimers = bgJs.hasTimers();
    if (!hasTimers) {
        remind.addClass('ban');
    }
    setTitle();
    remind.click(() => {
        if (remind.is('.ban')) {
            remind.removeClass('ban');
            remind.attr('title', '当前状态：打开提醒');
            bgJs.setTimers.call(bgJs);
            bgJs.notice({
                title: '预览',
                message: '已打开提醒',
            });
        } else {
            remind.addClass('ban');
            remind.attr('title', '当前状态：关闭提醒');
            bgJs.clearTimers.call(bgJs);
            bgJs.notice({
                title: '预览',
                message: '已关闭提醒',
            });
        }
        setTitle();
    });
}
