class ChessEngine{
    constructor(){
        var stockfish = require("stockfish");
        this.engine = stockfish();
        this.engine.onmessage = function (message) {
            console.log("received: " + message);
        }
        this.engine.postMessage('uci');
    }

    message(){
        this.engine.postMessage('isready');
    }

    evalPosition(fenString){
        this.engine.postMessage('position fen ' + fenString);
        this.engine.postMessage('eval');
    }
}

let engine = new ChessEngine();
engine.evalPosition("rnbqkbnr/1ppp1Qp1/p6p/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4");


