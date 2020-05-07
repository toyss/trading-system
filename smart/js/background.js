const okexUrlPrefix = 'https://www.okex.me/';
const allInstancesApi = 'api/swap/v3/instruments/ticker';
const timers = {};
const counts = {};


function fetchData(api) {
	return fetch(okexUrlPrefix + api).then(res => res.json()).catch(() => null);
}

function getInstanceApi(coin) {
	return `api/swap/v3/instruments/${coin.toLocaleUpperCase()}-USD-SWAP/ticker`;
}

function getAllInstances() {
	return fetchData(allInstancesApi);
}

function getInstance(coin) {
	const api = getInstanceApi(coin);
	return fetchData(api);
}

function notice(data) {
	chrome.notifications.create(null, {
		type: 'basic',
		iconUrl: 'img/icon.png',
		title: data.title,
		message: data.message,
	});
}

function getAllCoinNames() {
	return [
		'BTC',
		'ETH',
		'ETC',
		'LTC',
		'EOS',
		'BCH',
		'BSV',
	];
}

function clearTimers() {
	const timerNames = Object.keys(timers);
	timerNames.forEach(name => {
		clearInterval(timers[name]);
		timers[name] = null;
		counts[name] = 0;
	});
}

function hasTimers() {
	const timerValues = Object.values(timers);
	const timerItems = [];
	timerValues.forEach(values => values && timerItems.push(Object.values(values)));
	return timerItems.find(timer => !!timer);
}

function setTimers() {
	clearTimers();
	const coins = getAllCoinNames();
	chrome.storage.sync.get(coins, data => {
		coins.forEach(coin => {
			const item = data[coin];
			const { upper, under } = item;
			if (upper || under) {
				timers[coin] = setInterval(() => {
					getInstance(coin).then(resp => {
						const last = resp && resp.last;
						if (last && last > upper) {
							notice({
								title: `监控-${coin}-${last}`,
								message: `${coin} 价格已高于 ${upper}`
							});
							counts[coin]++;
						}
						if (last && last < under) {
							notice({
								title: `监控-${coin}-${last}`,
								message: `${coin} 价格已低于 ${under}`
							})
							counts[coin]++;
						}
						if (counts[coin] > 50) {
							clearTimers();
						}
					});
				}, 1000);
			}
		})
	});
}

chrome.storage.onChanged.addListener(() => setTimers());

chrome.commands.onCommand.addListener((command) => {
	if (command === 'turnOffRemind') {
		clearTimers();
		notice({
			title: '监控',
			message: '已关闭提醒',
		});
	}
	if (command === 'turnOnRemind') {
		setTimers();
		notice({
			title: '监控',
			message: '已打开提醒',
		});
	}
});
