import React from 'react';
import { Plus, ChevronLeft, ChevronRight, ChevronDoubleLeft, ChevronDoubleRight, ArrowCounterclockwise} from 'react-bootstrap-icons';
import './Chess.css';
import {Chess} from './ChessGame.js';
import {HighlightsAndArrows} from './HightlightsAndArrows.js';
import {dragMouseDownZero, dragMouseDownTwo} from './MouseActions.js';
import {OpeningBook} from './OpeningBook.js';

class Board extends React.Component{
    render(){
        const renderSquares = () => {
            let squaresList = []
            for(let rank=0; rank<this.props.squares.length; rank++){
                for(let file=0; file<this.props.squares[rank].length; file++){
                    if(this.props.squares[rank][file] !== null){
                        let className = "square-" + rank + "" + file + " piece " + this.props.squares[rank][file];
                        squaresList.push(<div className={className}></div>);
                    }
                }
            }
            return squaresList;
        }

        const previousMove = () => {
            let previousMove = [];
            if(this.props.startSquare !== null && this.props.endSquare !== null){
                let classNameStart = "previous-move square-"+this.props.startSquare;
                let classNameEnd = "previous-move square-"+this.props.endSquare;
                previousMove.push(<div className={classNameStart}></div>);
                previousMove.push(<div className={classNameEnd}></div>);
            }
            return previousMove;
        }

        let flipped = this.props.flipBoard ? "flipped " : "";
        
        return (
            <div className={flipped + "game-board"}   onMouseDown={this.props.onMouseDown} onContextMenu={(e)=> e.preventDefault()}>
                <div className="hover" id="hover-square" style={{visibility: "hidden"}}></div>
                <div className="moving-piece" id="moving-piece" style={{visibility: "hidden"}}></div>
                <div className={flipped + "promotion-white"} style={{visibility: "hidden"}}>
                    <div className="promotion-wq" id="promotion-wq"></div>
                    <div className="promotion-wr" id="promotion-wr"></div>
                    <div className="promotion-wb" id="promotion-wb"></div>
                    <div className="promotion-wn" id="promotion-wn"></div>
                </div>
                <div className={flipped + "promotion-black"} style={{visibility: "hidden"}}>
                    <div className="promotion-bq" id="promotion-bq"></div>
                    <div className="promotion-br" id="promotion-br"></div>
                    <div className="promotion-bb" id="promotion-bb"></div>
                    <div className="promotion-bn" id="promotion-bn"></div>
                </div>
                {renderSquares()}
                {previousMove()}
                <svg viewBox="0 0 80 80" className="arrows" id="canvas"></svg>
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props){
        super(props);
        this.game = new Chess();
        this.highlightsAndArrows = new HighlightsAndArrows();
        this.openingBook = new OpeningBook();
        this.openingBook.getOpenings();
        this.state = {
            history: [{
                squares: this.game.getStringBoard(this.game.board),
                startSquare: null,
                endSquare: null,
            }],
            whiteToMove: true,
            gameOver: false,
            moveNumber: 0,
            flipBoard: false,
            gameStatus: "White to move",
            moves: [],
            currentOpening: "",
            promotion: ""
        };
    }

    addKeyListeners(obj){
        document.onkeydown = (event) => {
            if(event.key === "ArrowLeft") {
                obj.jumpTo(obj.state.moveNumber>0?obj.state.moveNumber-1:0);
            }
            else if(event.key === "ArrowRight") {
                obj.jumpTo(obj.state.moveNumber<obj.state.history.length-1?obj.state.moveNumber+1:obj.state.history.length-1);
            }
        };
    }

    handleMouseDown(){
        let e = window.event;
        let obj = this;
        if(e.button === 0){
            this.highlightsAndArrows.removeHighlightsAndArrows()
            let board = document.getElementsByClassName("game-board")[0];
            let hoverSquare = document.getElementById("hover-square");
            let rank = Math.floor((board.offsetHeight - (e.pageY - board.offsetTop)) / hoverSquare.offsetHeight);
            let file = Math.floor((e.pageX - board.offsetLeft) / hoverSquare.offsetWidth);
            rank = this.state.flipBoard ? 7-rank : rank;
            file = this.state.flipBoard ? 7-file : file;
            let startRank = rank;
            let startFile = file;
            let promotions = document.querySelectorAll(`.square-${startRank}${startFile}.piece.promotion`);
            if(promotions.length > 0){
                this.promote(promotions[0].id, startFile)
                return;
            }
            this.setState({promotion: startRank+""+startFile});
            promotions = document.querySelectorAll(`.promotion`);
            promotions.forEach(element => element.style.visibility = "hidden");
            let pieces = document.querySelectorAll(`.square-${startRank}${startFile}.piece`);
            let piece;
            if(pieces.length === 0){
                return;
            }
            piece = pieces[0];
            let movingPiece = document.getElementById("moving-piece");
            movingPiece.className = "moving-piece " + piece.className.substring(piece.className.length-2);
            movingPiece.style.top = (e.pageY - board.offsetTop - movingPiece.offsetHeight/2) + "px";
            movingPiece.style.left = (e.pageX - board.offsetLeft - movingPiece.offsetWidth/2) + "px";
            movingPiece.style.visibility = "visible";
            piece.style.visibility = "hidden";
            let validSquares = this.game.getValidSquares(rank, file, this.state.whiteToMove);
            if(this.state.history.length-1 !== this.state.moveNumber || this.state.gameOver){
                validSquares = [];
            }
            for(let i=0; i<validSquares.length; i++){
                let valid = document.createElement("div");
                if(document.querySelectorAll(`.square-${validSquares[i]}.piece`).length > 0){
                    valid.className = "capture square-" + validSquares[i];
                }else{
                    valid.className = "valid square-" + validSquares[i];
                }
                board.appendChild(valid);
            }

            dragMouseDownZero(e, movingPiece, piece, hoverSquare, startRank, startFile, board, validSquares, obj);
        }else if(e.button === 2){
            let promotions = document.querySelectorAll(`.promotion`);
            promotions.forEach(element => element.style.visibility = "hidden");
            let board = document.getElementsByClassName("game-board")[0];
            let piece = document.getElementById("moving-piece");
            let rank = Math.floor((board.offsetHeight - (e.pageY - board.offsetTop)) / piece.offsetHeight);
            let file = Math.floor((e.pageX - board.offsetLeft) / piece.offsetWidth);
            rank = this.state.flipBoard ? 7-rank : rank;
            file = this.state.flipBoard ? 7-file : file;
            let startRank = rank;
            let startFile = file;
            dragMouseDownTwo(e, piece, startRank, startFile, board, obj);
        }
    }

    promote(piece, endFile){
        let startRank = this.state.promotion[0];
        let startFile = this.state.promotion[1]
        let wq = document.getElementById("promotion-wq");
        let wr = document.getElementById("promotion-wr");
        let wb = document.getElementById("promotion-wb");
        let wn = document.getElementById("promotion-wn");
        wq.className = "promotion-wq";
        wr.className = "promotion-wr";
        wb.className = "promotion-wb";
        wn.className = "promotion-wn";
        let bq = document.getElementById("promotion-bq");
        let br = document.getElementById("promotion-br");
        let bb = document.getElementById("promotion-bb");
        let bn = document.getElementById("promotion-bn");
        bq.className = "promotion-bq";
        br.className = "promotion-br";
        bb.className = "promotion-bb";
        bn.className = "promotion-bn";
        if(piece === "promotion-wq"){
            this.setPiece(startRank, startFile, 7, endFile, "q")
        }else if(piece === "promotion-wr"){
            this.setPiece(startRank, startFile, 7, endFile, "r")
        }else if(piece === "promotion-wb"){
            this.setPiece(startRank, startFile, 7, endFile, "b")
        }else if(piece === "promotion-wn"){
            this.setPiece(startRank, startFile, 7, endFile, "n")
        }else if(piece === "promotion-bq"){
            this.setPiece(startRank, startFile, 0, endFile, "q")
        }else if(piece === "promotion-br"){
            this.setPiece(startRank, startFile, 0, endFile, "r")
        }else if(piece === "promotion-bb"){
            this.setPiece(startRank, startFile, 0, endFile, "b")
        }else if(piece === "promotion-bn"){
            this.setPiece(startRank, startFile, 0, endFile, "n")
        }
        let promotions = document.querySelectorAll(`.promotion`);
        promotions.forEach(element => element.style.visibility = "hidden");
    }

    promotionPrompt(startRank, startFile, endRank, endFile, color) {
        let q;
        let r;
        let b;
        let n;
        if(color === "w"){
            q = document.getElementById("promotion-wq");
            r = document.getElementById("promotion-wr");
            b = document.getElementById("promotion-wb");
            n = document.getElementById("promotion-wn");
            q.classList.add("square-"+endRank+endFile);
            r.classList.add("square-"+(endRank-1)+endFile);
            b.classList.add("square-"+(endRank-2)+endFile);
            n.classList.add("square-"+(endRank-3)+endFile);
        }else{
            q = document.getElementById("promotion-bq");
            r = document.getElementById("promotion-br");
            b = document.getElementById("promotion-bb");
            n = document.getElementById("promotion-bn");
            q.classList.add("square-"+endRank+endFile);
            r.classList.add("square-"+(endRank+1)+endFile);
            b.classList.add("square-"+(endRank+2)+endFile);
            n.classList.add("square-"+(endRank+3)+endFile);
        }
        q.style.visibility = "visible";
        q.classList.add("piece");
        q.classList.add("promotion");

        r.style.visibility = "visible";
        r.classList.add("piece");
        r.classList.add("promotion");

        b.style.visibility = "visible";
        b.classList.add("piece");
        b.classList.add("promotion");

        n.style.visibility = "visible";
        n.classList.add("piece");
        n.classList.add("promotion");
    }

    setPiece(startRank, startFile, endRank, endFile, promotion=""){
        if(promotion === ""){
            if(this.game.board[startRank][startFile].name === "wp" && endRank === 7){
                this.promotionPrompt(startRank, startFile, endRank, endFile, "w");
                this.setState({promotion: startRank+""+startFile});
                return;
            }
            if(this.game.board[startRank][startFile].name === "bp" && endRank === 0){
                this.promotionPrompt(startRank, startFile, endRank, endFile, "b");
                this.setState({promotion: startRank+""+startFile});
                return;
            }
        }
        this.game.setPiece(startRank, startFile, endRank, endFile, promotion);
        const history = this.state.history.slice(0, this.state.history.length);
        let squares = this.game.getStringBoard(this.game.board);
        let gameOver = false;
        let inCheck = this.game.inCheck(this.state.whiteToMove?"b":"w", this.game.board, squares);
        let checkMate = false;
        let staleMate = false;
        if(inCheck){
            checkMate = this.game.isCheckMate(this.state.whiteToMove?"b":"w");
        }else{
            staleMate = this.game.isStalemate(this.state.whiteToMove?"b":"w")
        }
        let repetitionCount = 0;
        for(let i=0; i<this.state.history.length; i++){
            if(JSON.stringify(squares) === JSON.stringify(this.state.history[i].squares)){
                repetitionCount++;
            }
        }
        let drawByRepeitition = repetitionCount >= 2 ? true : false;
        let status = this.state.whiteToMove ? "Black to move" : "White to move";
        if(checkMate){
            status = this.state.whiteToMove ? "White wins by checkmate" : "Black wins by checkmate";
            gameOver = true;
        }else if(staleMate){
            status = "Game is a draw by stalemate";
            gameOver = true;
        }else if(drawByRepeitition){
            status = "Game is draw by repetition";
            gameOver = true;
        }
        let EPDString = this.game.getEPDString();
        let opening = this.openingBook.findOpening(EPDString);
        opening = opening === "" ? this.state.currentOpening : opening; 
        this.setState({
            history: history.concat([{
                squares: squares,
                startSquare: startRank+""+startFile,
                endSquare: endRank+""+endFile,
            }]),
            whiteToMove: !this.state.whiteToMove,
            moveNumber: this.state.history.length,
            gameStatus: status,
            gameOver: gameOver,
            moves: this.game.moves,
            promotion: "",
            currentOpening: opening
        })
    }

    jumpTo(moveNumber){
        this.setState({
            moveNumber: moveNumber,
        })
    }

    flipBoard(){
        this.setState({
            flipBoard: !this.state.flipBoard,
        })
        let arrows = document.querySelectorAll("line");
        arrows.forEach(element => {
            element.remove();
        });
    }

    resetBoard(){
        this.game.resetBoard();
        this.setState({
            history: [{
                squares: this.game.getStringBoard(this.game.board),
                startSquare: null,
                endSquare: null,
            }],
            whiteToMove: true,
            moveNumber: 0,
            gameStatus: "White to move",
            gameOver: false,
            moves: [],
            currentOpening: "",
        })
    }

    render () {
        document.onkeydown = null;
        this.addKeyListeners(this);
        let current = this.state.history[this.state.moveNumber];
        let capturedWhitePieces = this.game.capturedWhitePieces;
        let capturedBlackPieces = this.game.capturedBlackPieces;
        let order = {
            "p" : 0,
            "n" : 1,
            "b" : 2,
            "r" : 3,
            "q" : 4,
        }
        capturedWhitePieces.sort(function(a, b) {
            let keyA = a,
              keyB = b;
            if (order[keyA[1]] < order[keyB[1]]) return -1;
            if (order[keyA[1]] > order[keyB[1]]) return 1;
            return 0;
        });
        capturedBlackPieces.sort(function(a, b) {
            let keyA = a,
              keyB = b;
            if (order[keyA[1]] < order[keyB[1]]) return -1;
            if (order[keyA[1]] > order[keyB[1]]) return 1;
            return 0;
        });
        let topCapturedPieces = [];
        let bottomCapturedPieces = [];
        capturedWhitePieces.forEach(element => {
            this.state.flipBoard ? bottomCapturedPieces.push(<div className={"captured " + element}></div>) : 
            topCapturedPieces.push(<div className={"captured " + element}></div>);
        });
        capturedBlackPieces.forEach(element => {
            this.state.flipBoard ? topCapturedPieces.push(<div className={"captured " + element}></div>) : 
            bottomCapturedPieces.push(<div className={"captured " + element}></div>);
        });
        let moves = [];
        for(let i=0; i<this.state.moves.length; i+=2){
            moves.push(
            <tr>
                <td>{Math.floor((i/2)+1)}</td>
                <td onClick={() => this.jumpTo(i+1)} style={{color: this.state.moveNumber===i+1?"white":"black"}}>{this.state.moves[i]}</td>
                <td onClick={() => this.jumpTo(i+2)} style={{color: this.state.moveNumber===i+2?"white":"black"}}>{this.state.moves[i+1]}</td>
            </tr>)
        }


      return (
            <div className="container-fluid">
                <div className="row">
                    <div className='col-md-5'>
                        <div className='captured-pieces-top'>
                            {topCapturedPieces}
                        </div>
                        <Board 
                        squares={current.squares}
                        startSquare={current.startSquare}
                        endSquare={current.endSquare}
                        flipBoard={this.state.flipBoard}
                        onMouseDown={() => this.handleMouseDown()}
                        ></Board>
                        <div className='captured-pieces-bottom'>
                            {bottomCapturedPieces}
                        </div>
                    </div>
                    <div className='col-md-3 ml-2'>
                        <h2 className="text-center">{this.state.gameStatus}</h2>
                        <h4 className="text-center">{this.state.currentOpening}</h4>
                        <div className="game-moves container-fluid">
                            <table className="table table-moves">
                                <tbody>
                                    {moves}
                                </tbody>
                            </table>
                        </div>
                        <div>
                            <button className="btn btn-primary text-light mt-3 mx-1" title="Go to beginning" onClick={() => this.jumpTo(0)}><ChevronDoubleLeft/></button>
                            <button className="btn btn-primary text-light mt-3 mx-1" title="Go to previous move" onClick={() => this.jumpTo(this.state.moveNumber>0?this.state.moveNumber-1:0)}><ChevronLeft/></button>
                            <button className="btn btn-primary text-light mt-3 mx-1" title="Go to next move" onClick={() => this.jumpTo(this.state.moveNumber<this.state.history.length-1?this.state.moveNumber+1:this.state.history.length-1)}><ChevronRight/></button>
                            <button className="btn btn-primary text-light mt-3 mx-1" title="Go to end" onClick={() => this.jumpTo(this.state.history.length-1)}><ChevronDoubleRight/></button>
                            <button className="btn btn-primary text-light mt-3 mx-1" title="Rotate board" onClick={() => this.flipBoard()}><ArrowCounterclockwise/></button>
                            <button className="btn btn-primary text-light mt-3 mx-1" title="New game" onClick={() => this.resetBoard()}><Plus/></button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
  }

export default Game;