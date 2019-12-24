// can be improved

function packPixel(x, y, col){
    return (x << 12 | y) << 7 | col
}

function unpackPixel(num){
    return [
        num >>> 19,
        num >>> 7 & 0xFFF,
        num & 0b1111111
    ]
}

module.exports = {
    packPixel,
    unpackPixel
}