function getNum(n) {
    return Number(n).toFixed(2);
}

function prefixInteger(num, m) {
    return (Array(m).join(0) + num).slice(-m);
}

function getISOTime(time) {
    return new Date(time).toISOString();
}

function getTimeFormat(time) {
    const date = new Date(time);

    return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: prefixInteger(date.getDate(), 2),
        hour: prefixInteger(date.getHours(), 2),
        minute: prefixInteger(date.getMinutes(), 2),
    };
}

function calculateMA(rows, n) {
    const result = [];
    const len = rows.length;

    rows.forEach((_, index) => {
        if (len - index < n) {
            result.push(undefined);
            return;
        }

        const sum = rows.slice(index, index + n).reduce((a, b) => Number(a) + Number(b.close), 0);

        result.push(sum / n);
    });

    return result;
}

function calculateBBI(rows, n1, n2, n3, n4) {
    const maN1 = calculateMA(rows, n1);
    const maN2 = calculateMA(rows, n2);
    const maN3 = calculateMA(rows, n3);
    const maN4 = calculateMA(rows, n4);

    return maN1.map((_, index) => (maN1[index] + maN2[index] + maN3[index] + maN4[index]) / 4);
}

function debounce(func, delay = 400) {
    let timer;

    return function () {
        const context = this;
        const args = arguments;

        clearTimeout(timer);
        timer = setTimeout(() => func.apply(context, args), delay);
    }
}
