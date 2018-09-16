import { map, count } from './matrix';

export const nextSnapshot = (
    matrix, {
        adj = (matrix, c, x, y) => count(matrix, (c1, x1, y1) => c1 && (x !== x1 || y !== y1) && (((x - x1) ** 2 + (y - y1) ** 2) <= 2)),
        callbackFn = (c, x, y, n) => (((!c && n === 3) || (c && n <= 3 && n >= 2)) ? 1 : 0),
    } = {},
) => map(matrix, (c, x, y) => callbackFn(c, x, y, adj(matrix, c, x, y)));

export default {
    nextSnapshot,
};
