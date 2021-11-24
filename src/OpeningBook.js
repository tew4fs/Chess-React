
class OpeningBook{

    constructor(){
        this.openings = [];
    }
    
    getOpenings(){
        this.openings = [];
        var ajaxA = new XMLHttpRequest();
        var ajaxB = new XMLHttpRequest();
        var ajaxC = new XMLHttpRequest();
        var ajaxD = new XMLHttpRequest();
        var ajaxE = new XMLHttpRequest();

        // A openings
        var start = Date.now();
        var book = this;
        ajaxA.open("GET", "https://raw.githubusercontent.com/tew4fs/chess-openings/master/dist/a.tsv", true);
        ajaxA.send(null);
        ajaxA.addEventListener("load", function() {
            if (this.status === 200) { 
                book.openingsA = book.readTSV(this.response);
            }
        });
        ajaxA.addEventListener("error", function() {
            console.error("AJAX Error: " + this.status);
        });
    
        var end = Date.now();
        console.log("Retrieve A Openings Time: " + (end - start));

        // B Openings
        start = Date.now();
        ajaxB.open("GET", "https://raw.githubusercontent.com/tew4fs/chess-openings/master/dist/b.tsv", true);
        ajaxB.send(null);
        ajaxB.addEventListener("load", function() {
            if (this.status === 200) { 
                book.openingsA = book.readTSV(this.response);
            }
        });
        ajaxB.addEventListener("error", function() {
            console.error("AJAX Error: " + this.status);
        });
    
        end = Date.now();
        console.log("Retrieve B Openings Time: " + (end - start));

        // C openings
        start = Date.now();
        ajaxC.open("GET", "https://raw.githubusercontent.com/tew4fs/chess-openings/master/dist/c.tsv", true);
        ajaxC.send(null);
        ajaxC.addEventListener("load", function() {
            if (this.status === 200) { 
                book.openingsA = book.readTSV(this.response);
            }
        });
        ajaxC.addEventListener("error", function() {
            console.error("AJAX Error: " + this.status);
        });
    
        end = Date.now();
        console.log("Retrieve C Openings Time: " + (end - start));

        // D Openings
        start = Date.now();
        ajaxD.open("GET", "https://raw.githubusercontent.com/tew4fs/chess-openings/master/dist/d.tsv", true);
        ajaxD.send(null);
        ajaxD.addEventListener("load", function() {
            if (this.status === 200) { 
                book.openingsA = book.readTSV(this.response);
            }
        });
        ajaxD.addEventListener("error", function() {
            console.error("AJAX Error: " + this.status);
        });
        end = Date.now();
        console.log("Retrieve D Openings Time: " + (end - start));

        // E openings
        start = Date.now();
        ajaxE.open("GET", "https://raw.githubusercontent.com/tew4fs/chess-openings/master/dist/e.tsv", true);
        ajaxE.send(null);
        ajaxE.addEventListener("load", function() {
            if (this.status === 200) { 
                book.openingsA = book.readTSV(this.response);
            }
        });
        ajaxE.addEventListener("error", function() {
            console.error("AJAX Error: " + this.status);
        });
        end = Date.now();
        console.log("Retrieve E Openings Time: " + (end - start));
    
    }
    
    readTSV(str){
        var x = str.split('\n');
        for (var i=0; i<x.length; i++) {
            var y = x[i].split('\t');
            x[i] = y;
        }
        this.openings.push(x);
        return x;
    }
    
    findOpening(epd){
        var start = Date.now();
        var opening = "";
        for(var k=0; k<this.openings.length; k++){
            for(var i=0; i<this.openings[k].length; i++){
                if(this.openings[k][i].includes(epd)){
                    opening = this.openings[k][i][1];
                }
            }
        }
        var end = Date.now();
        console.log("findOpening() Time: " + (end - start));
        return opening;
    }
}

export {OpeningBook};