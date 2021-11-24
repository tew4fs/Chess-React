function dragMouseDownZero(e, movingPiece, piece, hoverSquare, startRank, startFile, board, validSquares, obj) {
    e = e || window.event;
    e.preventDefault();
    document.onmouseup = () => {
        closeDragElementZero(movingPiece, piece, hoverSquare, startRank, startFile, validSquares, board, obj);
    }
    document.onmousemove = () => {
        elementDragZero(movingPiece, piece, hoverSquare, board, obj);
    }   
}

function elementDragZero(movingPiece, piece, hoverSquare, board, obj) {
    let e = window.event;
    e.preventDefault();
    let xPos = e.pageX - board.offsetLeft;
    let yPos = e.pageY - board.offsetTop;
    movingPiece.style.top = (yPos - movingPiece.offsetHeight/2) + "px";
    movingPiece.style.left = (xPos - movingPiece.offsetWidth/2) + "px";
    let rank = Math.floor((board.offsetHeight - yPos) / piece.offsetHeight);
    let file = Math.floor(xPos / piece.offsetWidth);
    rank = obj.state.flipBoard ? 7-rank : rank;
    file = obj.state.flipBoard ? 7-file : file;
    if(rank < 8 && rank >= 0 && file < 8 && file >= 0){
        hoverSquare.style.visibility = "visible";
        hoverSquare.className = "hover square-" + rank + "" + file;
    }else{
        hoverSquare.style.visibility = "hidden";
    }
}

function closeDragElementZero(movingPiece, piece, hoverSquare, startRank, startFile, validSquares, board, obj) {
    document.onmouseup = null;
    document.onmousemove = null;
    let e = window.event;
    e.preventDefault();
    let xPos = e.pageX - board.offsetLeft;
    let yPos = e.pageY - board.offsetTop;
    let rank = Math.floor((board.offsetHeight - yPos) / piece.offsetHeight);
    let file = Math.floor(xPos / piece.offsetWidth);
    rank = obj.state.flipBoard ? 7-rank : rank;
    file = obj.state.flipBoard ? 7-file : file;
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



function dragMouseDownTwo(e, piece, startRank, startFile, board, obj) {
    e = e || window.event;
    e.preventDefault();
    document.onmouseup = () => {
        closeDragElementTwo(piece, startRank, startFile, board, obj);
    }
}

function closeDragElementTwo(piece, startRank, startFile, board, obj) {
    document.onmouseup = null;
    document.onmousemove = null;
    let e = window.event;
    e.preventDefault();
    let xPos = e.pageX - board.offsetLeft;
    let yPos = e.pageY - board.offsetTop;
    let endRank = Math.floor((board.offsetHeight - yPos) / piece.offsetHeight);
    let endFile = Math.floor(xPos / piece.offsetWidth);
    endRank = obj.state.flipBoard ? 7-endRank  : endRank;
    endFile = obj.state.flipBoard ? 7-endFile : endFile;
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
        obj.highlightsAndArrows.createArrow(startFile, endFile, startRank, endRank, obj)
    }
}

export {dragMouseDownZero, dragMouseDownTwo}