// DCT type II, unscaled. Algorithm by Byeong Gi Lee, 1984.
// See: http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.118.3056&rep=rep1&type=pdf#page=34
export function transform(vector: Array<number>): void {
    const n: number = vector.length;
    if (n <= 0 || (n & (n - 1)) != 0)
        throw new RangeError("Length must be power of 2");
    transformInternal(vector, 0, n, new Float64Array(n));
}


function transformInternal(vector: Array<number> | Float64Array, off: number, len: number, temp: Array<number> | Float64Array): void {
    if (len == 1)
        return;
    const halfLen: number = Math.floor(len / 2);
    for (let i = 0; i < halfLen; i++) {
        const x: number = vector[off + i];
        const y: number = vector[off + len - 1 - i];
        temp[off + i] = x + y;
        temp[off + i + halfLen] = (x - y) / (Math.cos((i + 0.5) * Math.PI / len) * 2);
    }
    transformInternal(temp, off, halfLen, vector);
    transformInternal(temp, off + halfLen, halfLen, vector);
    for (let i = 0; i < halfLen - 1; i++) {
        vector[off + i * 2 + 0] = temp[off + i];
        vector[off + i * 2 + 1] = temp[off + i + halfLen] + temp[off + i + halfLen + 1];
    }
    vector[off + len - 2] = temp[off + halfLen - 1];
    vector[off + len - 1] = temp[off + len - 1];
}