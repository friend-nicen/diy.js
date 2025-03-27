export function toFixed(num, decimalPlaces) {

    let factor = Math.pow(10, decimalPlaces);

    return Math.floor(num * factor) / factor;
}


export function percentToValue(percentage, total) {
    if (typeof percentage === 'string' && percentage.endsWith('%')) {
        const numericValue = parseFloat(percentage);
        return (numericValue / 100) * total;
    }

    return percentage;
}


export function toFixedNumber(number, decimalPlaces) {
    return parseFloat(number.toFixed(decimalPlaces));
}