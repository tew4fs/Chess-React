class HighlightsAndArrows{
    
    removeHighlightsAndArrows(){
        let highlights = document.querySelectorAll(".highlight");
            highlights.forEach(element => {
                element.remove();
        });
        let arrows = document.querySelectorAll("line");
        arrows.forEach(element => {
            element.remove();
        });
    }

    createArrow(startFile, endFile, startRank, endRank, obj){
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

            this.setArrowDirection(obj.state.flipBoard, arrow, startFile, endFile, startRank, endRank);
                
            arrow.setAttributeNS(null, 'style', 'stroke: rgba(255, 170, 0, 0.9); stroke-width: 1.5px;');
            arrow.setAttributeNS(null, 'marker-end', "url(#arrowhead)");
            canvas.appendChild(define);
            canvas.appendChild(arrow);
        }else{
            oldArrow.remove();
        }
    }

    setArrowDirection(flippedBoard, arrow, startFile, endFile, startRank, endRank){
        let xIncrementStart = 5;
        let xIncrementEnd = 5;
        let yIncrementStart = 5;
        let yIncrementEnd = 5;
        let offset1 = 0;
        let offset2 = 7;
        let arrowVal1 = 2.5;
        let arrowVal2 = 6;
        let arrowVal3 = 7.5;
        let arrowVal4 = 4;
        let mult1 = -1;
        let mult2 = 1;
        if(flippedBoard){
            offset1 = 7;
            offset2 = 0;
            arrowVal1 = 7.5;
            arrowVal2 = 4;
            arrowVal3 = 2.5;
            arrowVal4 = 6;
            mult1 = 1;
            mult2 = -1;
        }
        if(startFile > endFile){
            xIncrementStart = arrowVal1;
            xIncrementEnd = arrowVal2;
        }else if(startFile < endFile){
            xIncrementStart = arrowVal3;
            xIncrementEnd = arrowVal4;
        }
        if(startRank > endRank){
            yIncrementStart = arrowVal3;
            yIncrementEnd = arrowVal4;
        }else if(startRank < endRank){
            yIncrementStart = arrowVal1;
            yIncrementEnd = arrowVal2;
        }
        arrow.setAttributeNS(null, "x1", ((offset1-mult1*startFile) * 10)+xIncrementStart);
        arrow.setAttributeNS(null, "y1", ((offset2-mult2*startRank) * 10)+yIncrementStart);
        arrow.setAttributeNS(null, "x2", ((offset1-mult1*endFile) * 10)+xIncrementEnd);
        arrow.setAttributeNS(null, "y2", ((offset2-mult2*endRank) * 10)+yIncrementEnd);
    }
}

export {HighlightsAndArrows}