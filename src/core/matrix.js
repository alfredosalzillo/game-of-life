export const reduce = (matrix, callbackFn, acc = []) => (matrix || [])
    .reduce((acc, r, y) => r.reduce((acc, c, x) => callbackFn(acc, c, x, y), acc), acc);
export const map = (matrix, callbackFn) => (matrix || [])
    .map((r, y) => r.map((c, x) => callbackFn(c, x, y)));
export const filter = (matrix, callbackFn) => reduce(matrix, (acc, c, x, y) => (callbackFn(c, x, y) ? [...acc, c] : acc), []);
export const toList = matrix => reduce(matrix, (acc, c) => [...acc, c], []);
export const count = (matrix, callbackFn = () => true) => reduce(matrix, (acc, c, x, y) => acc + (callbackFn(c, x, y) ? 1 : 0), 0);
