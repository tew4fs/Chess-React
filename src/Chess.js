import React from 'react';
import { Plus, ChevronLeft, ChevronRight, ChevronDoubleLeft, ChevronDoubleRight, ArrowCounterclockwise} from 'react-bootstrap-icons';
import './Chess.css';
import {Chess} from './ChessGame.js';
import axios from 'axios';

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

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

        let gameBoardClassName = this.props.flipBoard ? "flipped game-board" : "game-board";
        
        return (
            <div className={gameBoardClassName}  onMouseDown={this.props.onMouseDown} onContextMenu={(e)=> e.preventDefault()}>
                <div className="hover" id="hover-square" style={{visibility: "hidden"}}></div>
                <div className="moving-piece" id="moving-piece" style={{visibility: "hidden"}}></div>
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
        };
    }

    handleMouseDown(){
        let e = window.event;
        let obj = this;
        if(e.button === 0){
            let highlights = document.querySelectorAll(".highlight");
            highlights.forEach(element => {
                element.remove();
            });
            let arrows = document.querySelectorAll("line");
            arrows.forEach(element => {
            element.remove();
            });
            let board = document.getElementsByClassName("game-board")[0];
            let hoverSquare = document.getElementById("hover-square");
            let rank = Math.floor((board.offsetHeight - (e.pageY - board.offsetTop)) / hoverSquare.offsetHeight);
            let file = Math.floor((e.pageX - board.offsetLeft) / hoverSquare.offsetWidth);
            rank = this.state.flipBoard ? 7-rank : rank;
            file = this.state.flipBoard ? 7-file : file;
            let startRank = rank;
            let startFile = file;
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

            dragMouseDown(e);
            function dragMouseDown(e) {
                e = e || window.event;
                e.preventDefault();
                document.onmouseup = closeDragElement;
                document.onmousemove = elementDrag;
              }
            
              function elementDrag(e) {
                e = e || window.event;
                e.preventDefault();
                let xPos = e.pageX - board.offsetLeft;
                let yPos = e.pageY - board.offsetTop;
                movingPiece.style.top = (yPos - movingPiece.offsetHeight/2) + "px";
                movingPiece.style.left = (xPos - movingPiece.offsetWidth/2) + "px";
                rank = Math.floor((board.offsetHeight - yPos) / piece.offsetHeight);
                file = Math.floor(xPos / piece.offsetWidth);
                rank = obj.state.flipBoard ? 7-rank : rank;
                file = obj.state.flipBoard ? 7-file : file;
                if(rank < 8 && rank >= 0 && file < 8 && file >= 0){
                    hoverSquare.style.visibility = "visible";
                    hoverSquare.className = "hover square-" + rank + "" + file;
                }else{
                    hoverSquare.style.visibility = "hidden";
                }
              }
            
              function closeDragElement(e) {
                document.onmouseup = null;
                document.onmousemove = null;
                let endRank = rank;
                let endFile = file;
                let valids = document.querySelectorAll(".valid");
                valids.forEach(element => {
                    element.remove();
                });
                let validCaptures = document.querySelectorAll(".capture");
                validCaptures.forEach(element => {
                    element.remove();
                });
                hoverSquare.style.visibility = "hidden";
                movingPiece.style.visibility = "hidden";
                piece.style.visibility = "visible";
                let validMove = false;
                for(let i=0; i<validSquares.length; i++){
                    if(validSquares[i] === endRank+""+endFile){
                        validMove = true;
                    }
                }
                if(validMove){
                    obj.setPiece(startRank, startFile, endRank, endFile);
                }
              }
        }else if(e.button === 2){
            let board = document.getElementsByClassName("game-board")[0];
            let piece = document.getElementById("moving-piece");
            let rank = Math.floor((board.offsetHeight - (e.pageY - board.offsetTop)) / piece.offsetHeight);
            let file = Math.floor((e.pageX - board.offsetLeft) / piece.offsetWidth);
            rank = this.state.flipBoard ? 7-rank : rank;
            file = this.state.flipBoard ? 7-file : file;
            let startRank = rank;
            let startFile = file;
            dragMouseDown(e);
            function dragMouseDown(e) {
                e = e || window.event;
                e.preventDefault();
                document.onmouseup = closeDragElement;
                document.onmousemove = elementDrag;
              }
            
              function elementDrag(e) {
                e = e || window.event;
                e.preventDefault();
                let xPos = e.pageX - board.offsetLeft;
                let yPos = e.pageY - board.offsetTop;
                rank = Math.floor((board.offsetHeight - yPos) / piece.offsetHeight);
                file = Math.floor(xPos / piece.offsetWidth);
                rank = obj.state.flipBoard ? 7-rank : rank;
                file = obj.state.flipBoard ? 7-file : file;
              }
            
              function closeDragElement(e) {
                document.onmouseup = null;
                document.onmousemove = null;
                let endRank = rank;
                let endFile = file;
                if(startRank === endRank && startFile === endFile){
                    let alreadyHighlighted = document.querySelectorAll(`.highlight.square-${startRank}${startFile}`);
                    if(alreadyHighlighted.length > 0){
                        alreadyHighlighted[0].remove();
                    }else{
                        let highlight = document.createElement('div');
                        highlight.className = "highlight square-"+endRank+""+endFile;
                        board.appendChild(highlight);
                    }
                }else if (endFile >= 0 && endFile < 8 && endRank >= 0 && endRank < 8){
                    let oldArrow = document.getElementById("arrow" + startRank + "" + startFile + "" + endRank + "" + endFile);
                    let canvas = document.getElementById('canvas');
                    if (oldArrow === null){
                        var svgns = "http://www.w3.org/2000/svg";
                        
                        let define = document.createElementNS(svgns, "defs");
                        let arrowHead = document.createElementNS(svgns, 'marker');
                        arrowHead.id="arrowhead";
                        arrowHead.setAttributeNS(null, "markerWidth", "10");
                        arrowHead.setAttributeNS(null, "markerHeight", "7");
                        arrowHead.setAttributeNS(null, "refX", "2");
                        arrowHead.setAttributeNS(null, "refY", "2.5");
                        arrowHead.setAttributeNS(null, "orient", "auto");
                        let points = document.createElementNS(svgns, 'polygon');
                        points.setAttributeNS(null, 'style', 'fill: rgba(255, 170, 0, 0.9);');
                        points.setAttributeNS(null, "points", "-2 0, 3 2.5, -2 5");
                        arrowHead.appendChild(points);
                        define.appendChild(arrowHead);
                        let arrow = document.createElementNS(svgns, 'line');
                        arrow.id="arrow"+ startRank + "" + startFile + "" + endRank + "" + endFile;
                        if(obj.state.flipBoard){
                            let xIncrementStart = 5;
                            let xIncrementEnd = 5;
                            if(startFile > endFile){
                                xIncrementStart = 7.5;
                                xIncrementEnd = 4;
                            }else if(startFile < endFile){
                                xIncrementStart = 2.5;
                                xIncrementEnd = 6;
                            }
                            let yIncrementStart = 5;
                            let yIncrementEnd = 5;
                            if(startRank > endRank){
                                yIncrementStart = 2.5;
                                yIncrementEnd = 6;
                            }else if(startRank < endRank){
                                yIncrementStart = 7.5;
                                yIncrementEnd = 4;
                            }
                            arrow.setAttributeNS(null, "x1", ((7-startFile) * 10)+xIncrementStart);
                            arrow.setAttributeNS(null, "y1", ((startRank) * 10)+yIncrementStart);
                            arrow.setAttributeNS(null, "x2", ((7-endFile) * 10)+xIncrementEnd);
                            arrow.setAttributeNS(null, "y2", ((endRank) * 10)+yIncrementEnd);
                        }else{
                            let xIncrementStart = 5;
                            let xIncrementEnd = 5;
                            if(startFile > endFile){
                                xIncrementStart = 2.5;
                                xIncrementEnd = 6;
                            }else if(startFile < endFile){
                                xIncrementStart = 7.5;
                                xIncrementEnd = 4;
                            }
                            let yIncrementStart = 5;
                            let yIncrementEnd = 5;
                            if(startRank > endRank){
                                yIncrementStart = 7.5;
                                yIncrementEnd = 4;
                            }else if(startRank < endRank){
                                yIncrementStart = 2.5;
                                yIncrementEnd = 6;
                            }
                            arrow.setAttributeNS(null, "x1", (startFile * 10)+xIncrementStart);
                            arrow.setAttributeNS(null, "y1", ((7-startRank) * 10)+yIncrementStart);
                            arrow.setAttributeNS(null, "x2", (endFile * 10)+xIncrementEnd);
                            arrow.setAttributeNS(null, "y2", ((7-endRank) * 10)+yIncrementEnd);
                        }
                        arrow.setAttributeNS(null, 'style', 'stroke: rgba(255, 170, 0, 0.9); stroke-width: 1.5px;');
                        arrow.setAttributeNS(null, 'marker-end', "url(#arrowhead)");
                        canvas.appendChild(define);
                        canvas.appendChild(arrow);
                    }else{
                        oldArrow.remove();
                    }
                }
              }
        }
    }

    setPiece(startRank, startFile, endRank, endFile){
        this.game.setPiece(startRank, startFile, endRank, endFile);
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
        })
        if(this.state.history.length < 10){
            const proxyurl = "https://obscure-meadow-07599.herokuapp.com/";
            const url = "https://www.365chess.com/eco.php";
            let currentLine = this.game.getLine(); 
            let opening = "";
            fetch(proxyurl + url)
            .then(response => response.text())
            .then(contents => {
                const dom = new JSDOM(contents);
                let lines = dom.window.document.querySelectorAll(".line");
                for(let i=0; i<lines.length; i++) {
                    let line = lines[i].querySelector('.opmoves').textContent;
                    if(line[line.length-1] === " "){
                        line = line.substring(0, line.length-1);
                    }
                    if(currentLine === line){
                        opening = lines[i].querySelector('.opname').textContent
                        this.setState({
                            currentOpening: opening,
                        })
                        break;
                    }
                }
            })
            .catch(() => console.log("Can’t access " + url + " response. Blocked by browser?"))
        }
        let FENString = this.game.getFENString();
        console.log(FENString);
        axios
        .post('http://localhost:9000/testAPI', {string: FENString})
        .then(() => console.log('Stockfish used'))
        .catch(err => {
          console.error(err);
        });
        /*fetch('http://localhost:9000/testAPI')
        .then(res => res.text())
        .then(res => console.log(res));*/
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
            moves.push(<tr>
                <td>{Math.floor((i/2)+1)}</td>
                <td onClick={() => this.jumpTo(i+1)} style={{color: this.state.moveNumber===i+1?"white":"black"}}>{this.state.moves[i]}</td>
                <td onClick={() => this.jumpTo(i+2)} style={{color: this.state.moveNumber===i+2?"white":"black"}}>{this.state.moves[i+1]}</td>
            </tr>)
        }
      return (
    <div className="view-box">
        <div className='left-game-panel'></div>
        <div className='game-view-box'>
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
        <div className='right-game-panel'>
            {this.state.gameStatus}
            <div className="game-moves">
                <table className="table-moves">
                    {moves}
                </table>
            </div>
            <div>
                <button className="info-button" title="Go to beginning" onClick={() => this.jumpTo(0)}><ChevronDoubleLeft/></button>
                <button className="info-button" title="Go to previous move" onClick={() => this.jumpTo(this.state.moveNumber>0?this.state.moveNumber-1:0)}><ChevronLeft/></button>
                <button className="info-button" title="Go to next move" onClick={() => this.jumpTo(this.state.moveNumber<this.state.history.length-1?this.state.moveNumber+1:this.state.history.length-1)}><ChevronRight/></button>
                <button className="info-button" title="Go to end" onClick={() => this.jumpTo(this.state.history.length-1)}><ChevronDoubleRight/></button>
                <button className="info-button" title="Rotate board" onClick={() => this.flipBoard()}><ArrowCounterclockwise/></button>
                <button className="info-button" title="New game" onClick={() => this.resetBoard()}><Plus/></button>
            </div>
            {this.state.currentOpening}
        </div>
      </div>
      );
    }
  }

export default Game;