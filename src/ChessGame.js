class Chess{
    constructor(){
        this.resetBoard();
    }
    
    resetBoard(){
        this.enPassantSquare = -100;
        this.capturedPiece = null;
        this.capturedWhitePieces = [];
        this.capturedBlackPieces = [];
        this.moves = [];
        this.board = Array(8);
        this.whiteToMove = true;
        this.halfMoveClock = 0;
        for(let i=0; i<this.board.length; i++){
            this.board[i] = Array(8).fill(null);
        }
        for(let i=0; i<8; i++){
            this.board[1][i] = new Pawn("w");
            this.board[6][i] = new Pawn("b");
        }
        this.board[0][0] = new Rook("w");
        this.board[0][7] = new Rook("w");
        this.board[0][1] = new Knight("w");
        this.board[0][6] = new Knight("w");
        this.board[0][2] = new Bishop("w");
        this.board[0][5] = new Bishop("w");
        this.board[0][3] = new Queen("w");
        this.board[0][4] = new King("w");

        this.board[7][0] = new Rook("b");
        this.board[7][7] = new Rook("b");
        this.board[7][1] = new Knight("b");
        this.board[7][6] = new Knight("b");
        this.board[7][2] = new Bishop("b");
        this.board[7][5] = new Bishop("b");
        this.board[7][3] = new Queen("b");
        this.board[7][4] = new King("b");
    }

    getValidSquares(rank, file, whiteToMove){
        if(this.board[rank][file] !== null){  
            if((whiteToMove && this.board[rank][file].name[0] === 'w') ||
            (!whiteToMove && this.board[rank][file].name[0] === 'b')){  
                let validSquares = this.board[rank][file].getValidSquares(rank, file, this.getStringBoard(this.board), this.enPassantSquare);
                if(this.board[rank][file].type === "king" && this.board[rank][file].firstMove && !this.inCheck(this.board[rank][file].color, this.board, this.getStringBoard(this.board))){
                    if(this.board[rank][file].color === "w"){
                        if(this.board[0][0] !== null && this.board[0][0].name === "wr" && this.board[0][0].firstMove && this.board[0][1] === null &&
                        this.board[0][2] === null && this.board[0][3] === null && this.noAttackers(0, 3, "b")){
                            validSquares.push("02");
                        }
                        if(this.board[0][7] !== null && this.board[0][7].name === "wr" && this.board[0][7].firstMove && this.board[0][6] === null &&
                        this.board[0][5] === null && this.noAttackers(0, 5, "b")){
                            validSquares.push("06");
                        }
                    }else if(this.board[rank][file].color === "b"){
                        if(this.board[7][0] !== null && this.board[7][0].name === "br" && this.board[7][0].firstMove && this.board[7][1] === null &&
                        this.board[7][2] === null && this.board[7][3] === null && this.noAttackers(7, 3, "w")){
                            validSquares.push("72");
                        }
                        if(this.board[7][7] !== null && this.board[7][7].name === "br" && this.board[7][7].firstMove && this.board[7][6] === null &&
                        this.board[7][5] === null && this.noAttackers(7, 5, "w")){
                            validSquares.push("76");
                        }
                    }
                }
                let validSquaresWithoutCheck = [];
                for(let i=0; i<validSquares.length; i++){
                    let board = this.getStringBoard(this.board).slice();
                    let color = board[rank][file][0];
                    board[validSquares[i][0]][validSquares[i][1]] = board[rank][file];
                    board[rank][file] = null;
                    if(!this.inCheck(color, this.board, board)){
                        validSquaresWithoutCheck.push(validSquares[i]);
                    }
                }
                return validSquaresWithoutCheck;
            }
        }
        return [];
    }

    noAttackers(rankNum, fileNum, colorAttacking){
        let stringBoard = this.getStringBoard(this.board);
        for(let rank=0; rank<stringBoard.length; rank++){
            for(let file=0; file<stringBoard[rank].length; file++){
                if(stringBoard[rank][file] !== null && stringBoard[rank][file][0] === colorAttacking){
                    let validSquares = this.board[rank][file].getValidSquares(rank, file, this.getStringBoard(this.board), this.enPassantSquare);
                    for(let i=0; i<validSquares.length; i++){
                        if(validSquares[i] === rankNum+""+fileNum){
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }

    setPiece(startRank, startFile, endRank, endFile){
        let ambiguityChar = "";
        if(this.board[startRank][startFile].name[1] !== "p"){
            let stringBoard = this.getStringBoard(this.board);
            let count = 0;
            for(let rank=0; rank<stringBoard.length; rank++){
                for(let file=0; file<stringBoard[rank].length; file++){
                    if(stringBoard[rank][file] !== null && stringBoard[rank][file] === this.board[startRank][startFile].name && !(startRank === rank && startFile === file)){
                        let valids = this.getValidSquares(rank, file, this.board[startRank][startFile].name[0]==="w"?true:false);
                        for(let i=0; i<valids.length; i++){
                            if(valids[i] === endRank+""+endFile){
                                count++;
                                if(startFile !== file){
                                    ambiguityChar = this.getFile(startFile);
                                }else{
                                    ambiguityChar = startRank+1;
                                }
                            }
                        }
                    }
                }
            }
            if(count > 1){
                ambiguityChar = this.getFile(startFile) + "" + (startRank+1);
            }
        }
        this.capturedPiece = this.board[endRank][endFile] !== null ? this.board[endRank][endFile].name : null;
        this.board[endRank][endFile] = this.board[startRank][startFile];
        this.board[startRank][startFile] = null;
        let castleQueen = false;
        let castleKing = false;
        if(this.board[endRank][endFile].name === "wk"){
            if(endRank === 0 && endFile === 2 && this.board[endRank][endFile].firstMove){
                this.board[0][3] = this.board[0][0];
                this.board[0][0] = null;
                castleQueen = true;
            }
            if(endRank === 0 && endFile === 6 && this.board[endRank][endFile].firstMove){
                this.board[0][5] = this.board[0][7];
                this.board[0][7] = null;
                castleKing = true;
            }
        }else if(this.board[endRank][endFile].name === "bk"){
            if(endRank === 7 && endFile === 2 && this.board[endRank][endFile].firstMove){
                this.board[7][3] = this.board[7][0];
                this.board[7][0] = null;
                castleQueen = true;
            }
            if(endRank === 7 && endFile === 6 && this.board[endRank][endFile].firstMove){
                this.board[7][5] = this.board[7][7];
                this.board[7][7] = null;
                castleKing = true;
            }
        }
        if(this.board[endRank][endFile].name === "wp"){
            if(endRank === 7){
                this.board[endRank][endFile] = new Queen("w");
            }
            if(this.enPassantSquare === endRank+""+endFile){
                this.capturedPiece = this.board[endRank-1][endFile].name;
                this.board[endRank-1][endFile] = null;
            }
            if(this.board[endRank][endFile].firstMove && endRank === 3){
                this.enPassantSquare = (endRank-1)+""+endFile;
            }else{
                this.enPassantSquare = -100;
            }
        }else if(this.board[endRank][endFile].name === "bp"){
            if(endRank === 0){
                this.board[endRank][endFile] = new Queen("b");
            }
            if(this.enPassantSquare === endRank+""+endFile){
                this.capturedPiece = this.board[endRank+1][endFile].name;
                this.board[endRank+1][endFile] = null;
            }
            if(this.board[endRank][endFile].firstMove && endRank === 4){
                this.enPassantSquare = (endRank+1)+""+endFile;
            }else{
                this.enPassantSquare = -100;
            }
        }else{
            this.enPassantSquare = -100;
        }
        this.board[endRank][endFile].firstMove = false;
        if(this.capturedPiece !== null){
            if(this.capturedPiece[0] === "w"){
                this.capturedWhitePieces.push(this.capturedPiece);
            }else{
                this.capturedBlackPieces.push(this.capturedPiece);
            }
        }
        let currentMove = "";
        if(castleKing){
            currentMove = "O-O";
        }else if(castleQueen){
            currentMove = "O-O-O";
        }else{
            if(this.board[endRank][endFile].name[1] !== "p"){
                currentMove += this.board[endRank][endFile].name[1].toUpperCase() + ambiguityChar;
            }else if(this.capturedPiece !== null){
                currentMove += this.getFile(startFile);
            }
            if(this.capturedPiece !== null){
                currentMove += "x"
            }
            currentMove += this.getSquareName(endRank, endFile);
            if(this.inCheck(this.board[endRank][endFile].name[0]==="w"?"b":"w", this.board, this.getStringBoard(this.board))){
                if(this.isCheckMate(this.board[endRank][endFile].name[0]==="w"?"b":"w")){
                    currentMove += "#";
                }else{
                    currentMove += "+";
                }
            }
        }
        this.moves.push(currentMove);
        if(this.board[endRank][endFile].type === "pawn" || this.capturedPiece !== null){
            this.halfMoveClock = 0;
        }else{
            this.halfMoveClock++;
        }
        this.whiteToMove = !this.whiteToMove;
    }

    getFile(file){
        let fileTranslation = {
            0 : "a",
            1 : "b",
            2 : "c",
            3 : "d",
            4 : "e",
            5 : "f",
            6 : "g",
            7 : "h",
        }
        return fileTranslation[file];
    }

    getSquareName(rank, file){
        let rankTranslation = rank + 1;
        return this.getFile(file) + rankTranslation;
    }

    getStringBoard(board){
        let stringBoard = Array(8);
        for(let i=0; i<stringBoard.length; i++){
            stringBoard[i] = Array(8).fill(null);
        }
        for(let rank=0; rank<board.length; rank++){
            for(let file=0; file<board[rank].length; file++){
                if(board[rank][file] !== null){
                    stringBoard[rank][file] = board[rank][file].name;
                }
            }
        }
        return stringBoard;
    }

    inCheck(colorInQuestion, board, stringBoard){
        let oppositeColor = {
            "w" : "b",
            "b" : "w",
        }
        let kingsPos = -100;
        for(let rank=0; rank<stringBoard.length; rank++){
            for(let file=0; file<stringBoard[rank].length; file++){
                if(stringBoard[rank][file] !== null && stringBoard[rank][file] === colorInQuestion+"k"){
                    kingsPos = rank+""+file;
                    break;
                }
            }
        }
        for(let rank=0; rank<stringBoard.length; rank++){
            for(let file=0; file<stringBoard[rank].length; file++){
                if(stringBoard[rank][file] !== null && stringBoard[rank][file][0] === oppositeColor[colorInQuestion]){
                    let validSquares = board[rank][file].getValidSquares(rank, file, stringBoard, this.enPassantSquare);
                    for(let i=0; i<validSquares.length; i++){
                        if(validSquares[i] === kingsPos){
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    isCheckMate(colorInQuestion){
        for(let rank=0; rank<this.board.length; rank++){
            for(let file=0; file<this.board[rank].length; file++){
                if(this.board[rank][file] !== null && this.board[rank][file].name[0] === colorInQuestion){
                    let validSquares = this.getValidSquares(rank, file, colorInQuestion==="w"?true:false);
                    if(validSquares.length > 0){
                        return false;
                    }
                }
            }
        }
        return true;
    }

    isStalemate(colorToMove){
        for(let rank=0; rank<this.board.length; rank++){
            for(let file=0; file<this.board[rank].length; file++){
                if(this.board[rank][file] !== null && this.board[rank][file].name[0] === colorToMove){
                    let validSquares = this.getValidSquares(rank, file, colorToMove==="w"?true:false);
                    if(validSquares.length > 0){
                        return false;
                    }
                }
            }
        }
        return true;
    }

    getLine(){
        let line = "";
        let moveNumber = 0;
        for(let i=0; i<this.moves.length; i++){
            if(i%2 === 0){
                line += ++moveNumber + ". ";
            }
            line += this.moves[i] + " ";
        }
        return line.substring(0, line.length-1);
    }

    getFENString(){
        let stringBoard = this.getStringBoard(this.board);
        let ret = "";
        for(let rank=7; rank>=0; rank--){
            let nullCounter = 0;
            for(let file=0; file<stringBoard[rank].length; file++){
                if(stringBoard[rank][file] !== null){
                    if(nullCounter > 0){
                        ret += nullCounter + "";
                    }
                    if(stringBoard[rank][file][0] === "w"){
                        ret += stringBoard[rank][file][1].toUpperCase();
                    }else{
                        ret += stringBoard[rank][file][1];
                    }
                    nullCounter = 0;
                }else{
                    nullCounter++;
                }
            }
            if(nullCounter > 0){
                ret += nullCounter + "";
            }
            if(rank !== 0){
                ret+= "/"
            }
        }
        if(this.whiteToMove){
            ret += " w ";
        }else{
            ret += " b ";
        }
        let whiteCastleQueen = stringBoard[0][0] === "wr" && this.board[0][0].firstMove && 
        stringBoard[0][4] === "wk" && this.board[0][4].firstMove;
        let whiteCastleKing = stringBoard[0][7] === "wr" && this.board[0][7].firstMove && 
        stringBoard[0][4] === "wk" && this.board[0][4].firstMove;
        let blackCastleQueen = stringBoard[7][0] === "br" && this.board[7][0].firstMove && 
        stringBoard[7][4] === "bk" && this.board[7][4].firstMove;
        let blackCastleKing = stringBoard[7][7] === "br" && this.board[7][7].firstMove && 
        stringBoard[7][4] === "bk" && this.board[7][4].firstMove;
        if(!whiteCastleKing && !whiteCastleQueen && !blackCastleKing && !blackCastleQueen){
            ret += "-";
        }else {
            if(whiteCastleKing){
                ret += "K";
            }
            if(whiteCastleQueen){
                ret += "Q";
            }
            if(blackCastleKing){
                ret += "k";
            }
            if(blackCastleQueen){
                ret += "q";
            }
        }
        if(this.enPassantSquare === -100){
            ret += " - ";
        }else{
            ret += " " + this.getSquareName(parseInt(this.enPassantSquare[0]), parseInt(this.enPassantSquare[1])) + " ";
        }

        ret += this.halfMoveClock + " ";

        let fullMoves = Math.ceil(this.moves.length/2);

        ret += fullMoves + "";

        return ret;
    }
}

class King{
    constructor(color){
        this.color = color;
        this.name = color + "k";
        this.firstMove = true;
        this.type = "king";
    }

    getValidSquares(rank, file, board, enPassantSquare){
        let validSquares = [];
        let oppositeColor = {
            "w" : "b",
            "b" : "w",
        }
        // Up
        if(rank+1<8 && (board[rank+1][file] === null || board[rank+1][file][0] === oppositeColor[this.color])){
            validSquares.push((rank+1)+""+file);
        }
        // Down
        if(rank-1>=0 && (board[rank-1][file] === null || board[rank-1][file][0] === oppositeColor[this.color])){
            validSquares.push((rank-1)+""+file);
        }
        // Left
        if(file-1>=0 && (board[rank][file-1] === null || board[rank][file-1][0] === oppositeColor[this.color])){
            validSquares.push((rank)+""+(file-1));
        }
        // Right
        if(file+1<8 && (board[rank][file+1] === null || board[rank][file+1][0] === oppositeColor[this.color])){
            validSquares.push((rank)+""+(file+1));
        }
        // Up Left
        if(rank+1<8 && file-1>=0 && (board[rank+1][file-1] === null || board[rank+1][file-1][0] === oppositeColor[this.color])){
            validSquares.push((rank+1)+""+(file-1));
        }
        // Down Left
        if(rank-1>=0 && file-1>=0 && (board[rank-1][file-1] === null || board[rank-1][file-1][0] === oppositeColor[this.color])){
            validSquares.push((rank-1)+""+(file-1));
        }
        // Up Right
        if(rank+1<8 && file+1<8 && (board[rank+1][file+1] === null || board[rank+1][file+1][0] === oppositeColor[this.color])){
            validSquares.push((rank+1)+""+(file+1));
        }
        // Down Right
        if(rank-1>=0 && file+1<8 && (board[rank-1][file+1] === null || board[rank-1][file+1][0] === oppositeColor[this.color])){
            validSquares.push((rank-1)+""+(file+1));
        }
        return validSquares;
    }
}

class Queen{
    constructor(color){
        this.color = color;
        this.name = color + "q";
        this.firstMove = true;
        this.type = "queen";
    }

    getValidSquares(rank, file, board, enPassantSquare){
        let validSquares = [];
        let oppositeColor = {
            "w" : "b",
            "b" : "w",
        }
        // Up
        for(let rankNum=rank+1; rankNum<8; rankNum++){
            if(board[rankNum][file] === null){
                validSquares.push(rankNum+""+file);
            }else{
                if(board[rankNum][file][0] === oppositeColor[this.color]){
                    validSquares.push(rankNum+""+file);
                }
                break;
            }
        }
        // Down
        for(let rankNum=rank-1; rankNum>=0; rankNum--){
            if(board[rankNum][file] === null){
                validSquares.push(rankNum+""+file);
            }else{
                if(board[rankNum][file][0] === oppositeColor[this.color]){
                    validSquares.push(rankNum+""+file);
                }
                break;
            }
        }
        // Left
        for(let fileNum=file-1; fileNum>=0; fileNum--){
            if(board[rank][fileNum] === null){
                validSquares.push(rank+""+fileNum);
            }else{
                if(board[rank][fileNum][0] === oppositeColor[this.color]){
                    validSquares.push(rank+""+fileNum);
                }
                break;
            }
        }
        // Right
        for(let fileNum=file+1; fileNum<8; fileNum++){
            if(board[rank][fileNum] === null){
                validSquares.push(rank+""+fileNum);
            }else{
                if(board[rank][fileNum][0] === oppositeColor[this.color]){
                    validSquares.push(rank+""+fileNum);
                }
                break;
            }
        }
        // Up Left
        for(let rankNum=rank+1, fileNum=file-1; rankNum<8 && fileNum>=0; rankNum++, fileNum--){
            if(board[rankNum][fileNum] === null){
                validSquares.push(rankNum+""+fileNum);
            }else{
                if(board[rankNum][fileNum][0] === oppositeColor[this.color]){
                    validSquares.push(rankNum+""+fileNum);
                }
                break;
            }
        }
        // Up right
        for(let rankNum=rank+1, fileNum=file+1; rankNum<8 && fileNum<8; rankNum++, fileNum++){
            if(board[rankNum][fileNum] === null){
                validSquares.push(rankNum+""+fileNum);
            }else{
                if(board[rankNum][fileNum][0] === oppositeColor[this.color]){
                    validSquares.push(rankNum+""+fileNum);
                }
                break;
            }
        }
        // Down Left
        for(let rankNum=rank-1, fileNum=file-1; rankNum>=0 && fileNum>=0; rankNum--, fileNum--){
            if(board[rankNum][fileNum] === null){
                validSquares.push(rankNum+""+fileNum);
            }else{
                if(board[rankNum][fileNum][0] === oppositeColor[this.color]){
                    validSquares.push(rankNum+""+fileNum);
                }
                break;
            }
        }
        // Down Right
        for(let rankNum=rank-1, fileNum=file+1; rankNum>=0 && fileNum<8; rankNum--, fileNum++){
            if(board[rankNum][fileNum] === null){
                validSquares.push(rankNum+""+fileNum);
            }else{
                if(board[rankNum][fileNum][0] === oppositeColor[this.color]){
                    validSquares.push(rankNum+""+fileNum);
                }
                break;
            }
        }
        return validSquares;
    }
}

class Rook{
    constructor(color){
        this.color = color;
        this.name = color + "r";
        this.firstMove = true;
        this.type = "rook";
    }

    getValidSquares(rank, file, board, enPassantSquare){
        let validSquares = [];
        let oppositeColor = {
            "w" : "b",
            "b" : "w",
        }
        // Up
        for(let rankNum=rank+1; rankNum<8; rankNum++){
            if(board[rankNum][file] === null){
                validSquares.push(rankNum+""+file);
            }else{
                if(board[rankNum][file][0] === oppositeColor[this.color]){
                    validSquares.push(rankNum+""+file);
                }
                break;
            }
        }
        // Down
        for(let rankNum=rank-1; rankNum>=0; rankNum--){
            if(board[rankNum][file] === null){
                validSquares.push(rankNum+""+file);
            }else{
                if(board[rankNum][file][0] === oppositeColor[this.color]){
                    validSquares.push(rankNum+""+file);
                }
                break;
            }
        }
        // Left
        for(let fileNum=file-1; fileNum>=0; fileNum--){
            if(board[rank][fileNum] === null){
                validSquares.push(rank+""+fileNum);
            }else{
                if(board[rank][fileNum][0] === oppositeColor[this.color]){
                    validSquares.push(rank+""+fileNum);
                }
                break;
            }
        }
        // Right
        for(let fileNum=file+1; fileNum<8; fileNum++){
            if(board[rank][fileNum] === null){
                validSquares.push(rank+""+fileNum);
            }else{
                if(board[rank][fileNum][0] === oppositeColor[this.color]){
                    validSquares.push(rank+""+fileNum);
                }
                break;
            }
        }
        return validSquares;
    }
}

class Bishop{
    constructor(color){
        this.color = color;
        this.name = color + "b";
        this.firstMove = true;
        this.bishop = "bishop"
    }

    getValidSquares(rank, file, board, enPassantSquare){
        let validSquares = [];
        let oppositeColor = {
            "w" : "b",
            "b" : "w",
        }
        // Up Left
        for(let rankNum=rank+1, fileNum=file-1; rankNum<8 && fileNum>=0; rankNum++, fileNum--){
            if(board[rankNum][fileNum] === null){
                validSquares.push(rankNum+""+fileNum);
            }else{
                if(board[rankNum][fileNum][0] === oppositeColor[this.color]){
                    validSquares.push(rankNum+""+fileNum);
                }
                break;
            }
        }
        // Up right
        for(let rankNum=rank+1, fileNum=file+1; rankNum<8 && fileNum<8; rankNum++, fileNum++){
            if(board[rankNum][fileNum] === null){
                validSquares.push(rankNum+""+fileNum);
            }else{
                if(board[rankNum][fileNum][0] === oppositeColor[this.color]){
                    validSquares.push(rankNum+""+fileNum);
                }
                break;
            }
        }
        // Down Left
        for(let rankNum=rank-1, fileNum=file-1; rankNum>=0 && fileNum>=0; rankNum--, fileNum--){
            if(board[rankNum][fileNum] === null){
                validSquares.push(rankNum+""+fileNum);
            }else{
                if(board[rankNum][fileNum][0] === oppositeColor[this.color]){
                    validSquares.push(rankNum+""+fileNum);
                }
                break;
            }
        }
        // Down Right
        for(let rankNum=rank-1, fileNum=file+1; rankNum>=0 && fileNum<8; rankNum--, fileNum++){
            if(board[rankNum][fileNum] === null){
                validSquares.push(rankNum+""+fileNum);
            }else{
                if(board[rankNum][fileNum][0] === oppositeColor[this.color]){
                    validSquares.push(rankNum+""+fileNum);
                }
                break;
            }
        }
        return validSquares;
    }
}

class Knight{
    constructor(color){
        this.color = color;
        this.name = color + "n";
        this.firstMove = true;
        this.knight = "knight";
    }

    getValidSquares(rank, file, board, enPassantSquare){
        let validSquares = [];
        let oppositeColor = {
            "w" : "b",
            "b" : "w",
        }
        // Up
        if(rank+2<8){
            if(file-1>=0 && (board[rank+2][file-1] === null || board[rank+2][file-1][0] === oppositeColor[this.color])){
                validSquares.push((rank+2)+""+(file-1));
            }
            if(file+1<8 && (board[rank+2][file+1] === null || board[rank+2][file+1][0] === oppositeColor[this.color])){
                validSquares.push((rank+2)+""+(file+1));
            }
        }
        // Down
        if(rank-2>=0){
            if(file-1>=0 && (board[rank-2][file-1] === null || board[rank-2][file-1][0] === oppositeColor[this.color])){
                validSquares.push((rank-2)+""+(file-1));
            }
            if(file+1<8 && (board[rank-2][file+1] === null || board[rank-2][file+1][0] === oppositeColor[this.color])){
                validSquares.push((rank-2)+""+(file+1));
            }
        }
        // Left
        if(file-2>=0){
            if(rank+1<8 && (board[rank+1][file-2] === null || board[rank+1][file-2][0] === oppositeColor[this.color])){
                validSquares.push((rank+1)+""+(file-2));
            }
            if(rank-1>=0 && (board[rank-1][file-2] === null || board[rank-1][file-2][0] === oppositeColor[this.color])){
                validSquares.push((rank-1)+""+(file-2));
            }
        }
        // Right
        if(file+2<8){
            if(rank+1<8 && (board[rank+1][file+2] === null || board[rank+1][file+2][0] === oppositeColor[this.color])){
                validSquares.push((rank+1)+""+(file+2));
            }
            if(rank-1>=0 && (board[rank-1][file+2] === null || board[rank-1][file+2][0] === oppositeColor[this.color])){
                validSquares.push((rank-1)+""+(file+2));
            }
        }
        return validSquares;
    }
}

class Pawn{
    constructor(color){
        this.color = color;
        this.name = color + "p";
        this.firstMove = true;
        this.type = "pawn";
    }

    getValidSquares(rank, file, board, enPassantSquare){
        let validSquares = [];
        let oppositeColor = {
            "w" : "b",
            "b" : "w",
        }
        let direction = {
            "w" : 1,
            "b" : -1,
        }
        if(board[rank+direction[this.color]][file] === null){
            validSquares.push((rank+direction[this.color]) + "" + file);
            if(this.firstMove && board[rank+2*direction[this.color]][file] === null){
                validSquares.push((rank+2*direction[this.color]) + "" + file);
            }
        }
        if(file>0 && board[rank+direction[this.color]][file-1] !== null && board[rank+direction[this.color]][file-1][0] === oppositeColor[this.color]){
            validSquares.push(rank+direction[this.color] + "" + (file-1));
        }
        if(file<7 && board[rank+direction[this.color]][file+1] !== null && board[rank+direction[this.color]][file+1][0] === oppositeColor[this.color]){
            validSquares.push(rank+direction[this.color] + "" + (file+1));
        }
        if(file>0 && (rank+direction[this.color])+""+(file-1) === enPassantSquare){
            validSquares.push((rank+direction[this.color])+""+(file-1));
        }
        if(file<7 && (rank+direction[this.color])+""+(file+1) === enPassantSquare){
            validSquares.push((rank+direction[this.color])+""+(file+1));
        }
        return validSquares;
    }
}

export {Chess};