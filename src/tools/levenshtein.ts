import { distance } from 'fastest-levenshtein';
const average = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;
export default (bodies: Array<string>) => {
    let results = []
    for (let i = 0; i < bodies.length - 1; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
            results.push(distance(bodies[i], bodies[j]) / Math.max(bodies[i].length, bodies[j].length))
        }
    }
    return average(results) || 1
}