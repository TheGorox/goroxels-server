const config = {
    chunkSize: 512,
    boardWidth: 8, // in chunks
    boardHeight: 8,
    palette: [
        [240, 240, 220],
        [250, 200, 0],
        [16, 200, 64],
        [0, 160, 200],
        [210, 64, 64],
        [160, 105, 75],
        [115, 100, 100],
        [16, 24, 32]
    ]
}

config.realBoardWid = config.boardWidth * this.chunkSize;
config.realBoardHei = config.boardHeight * this.chunkSize;

module.exports = config