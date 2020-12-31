const log = (val:number) => {
    return Math.log(val) / Math.log(2);
}

const p = (x: object, i) => {
    return x[i] / Object.values(x).reduce((a, b) => a + b, 0)
}

export default (body:string) => {
    body = body.toLowerCase();
    let x = {};
    for (let letter of body) {
        if (Object.keys(x).includes(letter)) {
            x[letter] ++
        } else {
            x[letter] = 1
        }
    }

    let h = 0;
    for (let i in x) {
        h += p(x, i) * log(1/p(x, i))
    }
    return h;
}