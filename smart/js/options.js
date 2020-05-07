const app = $('#app');
const save = $('#save');
const clear = $('#clear');
const bgJs = chrome.extension.getBackgroundPage();
const allCoins = bgJs.getAllCoinNames();

function structureTable() {
    const ul = document.createElement('ul');
    ul.className = 'table';
    let content = '';
    allCoins.forEach(item => {
        const itemContent = `<li class="table-item">
            <span class="table-item-name">${item}</span>
            <input id="${item}-upper" class="table-item-upper" placeholder="上涨">
            <input id="${item}-under" class="table-item-under" placeholder="下跌">
        </li>`;
        content += itemContent;
    });
    ul.innerHTML = content;
    return ul;
}

function getFormData() {
    const data = {};
    allCoins.forEach(coin => {
        const upper = $(`#${coin}-upper`).val();
        const under = $(`#${coin}-under`).val();
        data[coin] = { upper, under };
    });
    return data;
}

function getNullFormData() {
    const data = {};
    allCoins.forEach(coin => {
        data[coin] = { upper: undefined, under: undefined };
    });
    return data;
}

function setFormData(data) {
    allCoins.forEach(coin => {
        const item = data[coin];
        if (item) {
            $(`#${coin}-upper`).val(item.upper);
            $(`#${coin}-under`).val(item.under);
        }
    });
}

window.onload = function () {
    const table = structureTable();
    app.append(table);
    chrome.storage.sync.get(allCoins, data => setFormData(data));
    save.click(() => {
        const data = getFormData();
        chrome.storage.sync.set(data);
        bgJs.notice({
            title: '设置',
            message: 'storage 设置成功',
        });
    });
    clear.click(() => {
        const data = getNullFormData();
        setFormData(data);
        chrome.storage.sync.set(data);
        bgJs.notice({
            title: '设置',
            message: 'storage 清空成功',
        });
    });
}
