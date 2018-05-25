class attentionAsymmetricComponent extends attentionComponent {
    constructor(uuid) {
        super(uuid);
        // this.subscribeDatabyNames(["attention", "currentPair"]);

        //create default colormap
        this.colormap = generateColormap([0.0, 1.0], ["#253494", "#2c7fb8",
            "#41b6c4", "#a1dab4",
            "#ffffcc"
        ]);

        this.ratio = 0.5; //between 0 - 1, 1 uniform, 0 only show highest value
        this.pixelBars = [];
        this.widthscale = d3.scaleLinear().domain([0, 1]).range([0, 3]);
        this.aggregateSen = true;
    }

    parseDataUpdate(msg) {
        super.parseDataUpdate(msg);
        switch (msg["name"]) {
            case "attention":
                // console.log(msg["data"]);
                break;
            case "currentPair":
                // console.log(msg["data"]);
                this.parseParagraph(msg["data"]["data"]["sentences"][0]);
                this.question = msg["data"]["data"]["sentences"][1];
                this.question = this.question.trim().split(/\s+/);
                break;
        }
    }

    ///// highlight entry /////
    handleHighlightEvent(srcIndex, targIndex) {
        // console.log("highlight placeholder");
        this.svg.selectAll(".paraSenText").each(function(d, i) {
            if (srcIndex === i) {
                d3.select(this).style("fill", "orange");
                d3.select(this).style("font-weight", "bold");
            } else {
                d3.select(this).style("fill", "black");
                d3.select(this).style("font-weight", "normal");
            }
        });

        this.svg.selectAll(".questionText").each(function(d, i) {
            if (targIndex === i) {
                d3.select(this).style("fill", "orange");
                d3.select(this).style("font-weight", "bold");
            } else {
                d3.select(this).style("fill", "black");
                d3.select(this).style("font-weight", "normal");
            }
        });

        // let that = this;
        // this.svg.selectAll(".paraSenLink").each(function(d, i) {
        //     // console.log("i:", i, " index:", srcIndex * that.subMat[
        //     // 0].length +
        //     // targIndex)
        //     if (i === srcIndex * that.subMat[0].length + targIndex) {
        //         d3.select(this).attr("stroke", "orange");
        //         d3.select(this).attr("fill", "orange");
        //         // d3.select(this).attr("stroke-width", );
        //         console.log("highlgith link", i)
        //     }
        // })

        if (srcIndex >= 0 && targIndex >= 0) {
            let linkIndex = srcIndex * this.subMat[0].length + targIndex;
            console.log(linkIndex, this.svg.select("#paraSenLink" +
                linkIndex));
            this.svg.select("#paraSenLink" + linkIndex)
                .style("stroke", "orange");
            // .attr("stroke-width", 10)
            // .attr("opacity", 0.0);
        }

        if (srcIndex === -1 && targIndex === -1) {
            this.svg.selectAll(".paraSenText").style("fill", "black");
            this.svg.selectAll(".paraSenText").style("font-weight",
                "normal");

            this.svg.selectAll(".questionText").style("fill", "black");
            this.svg.selectAll(".questionText").style("font-weight",
                "normal");
            this.svg.selectAll(".paraSenLink").style("stroke", "#87CEFA")
        }
    }

    parseParagraph(paragraph) {
        this.segmentList = paragraph.trim().match(
            /([^\.!\?]+[\.!\?]+)|([^\.!\?]+$)/g);
        this.segmentList = this.segmentList.map(d => d.trim().split(/\s+/));
        // console.log(this.segmentList)
    }

    draw() {
        this._updateWidthHeight();

        if (this.rawAttention !== undefined) {
            // init svg
            this.initSvg();
            let paragraphLen = this.rawAttention.length;

            console.log("paragraphLen:", paragraphLen);
            //organize the pixelBar
            //for each text segment
            let pos = 5;
            let minIndex = 0

            ///FIXME duplicated code from attentionGraphComponent
            ////////// getting attention normalized //////
            let attMatrix = this.normAttention;
            var srcAtt = attMatrix.map(d => d.reduce((a, b) => a +
                b));
            let srcAttMax = Math.max(...srcAtt);
            let srcAttMin = Math.min(...srcAtt);
            this.srcAtt = srcAtt.map(d =>
                (d - srcAttMin) / (srcAttMax - srcAttMin));

            var targAtt = attMatrix[0].map((d, i) => {
                // console.log(d, i);
                var sum = 0;
                for (var j = 0; j < attMatrix.length; j++)
                    sum += attMatrix[j][i];
                return sum;
            });
            let targAttMax = Math.max(...targAtt);
            targAtt = targAtt.map(d => d / targAttMax);

            let unit = this.width * 0.85 / paragraphLen;
            this.paraPos = [];
            for (var i = 0; i < this.segmentList.length; i++) {
                let senLen = this.segmentList[i].length;
                let size = senLen * unit;
                let maxIndex = minIndex + senLen;
                // console.log(minIndex, maxIndex);
                let atts = this.srcAtt.slice(minIndex, maxIndex +
                    1);
                let words = this.segmentList[i];
                let indexRange = [minIndex, maxIndex];
                minIndex = maxIndex;

                ///// generate paraPos //////
                if (!this.aggregateSen) {
                    for (var j = 0; j < this.segmentList[i].length; j++) {
                        this.paraPos.push({
                            "x": pos + (0.5 + j) * unit,
                            "y": 35
                        });
                    }
                } else {
                    this.paraPos.push({
                        "x": pos + (0.5 + senLen * 0.5) * unit,
                        "y": 35
                    });
                }

                //////////////////////////////

                let pixel = new pixelBar(this.svg, [pos, 15], [size, 20],
                    atts, words, this.ratio, this.colormap, indexRange);
                pixel.bindShowSentenceCallback(this.showParagraphSentence.bind(
                    this));

                pos += (size + 20);

                pixel.draw();
                this.pixelBars.push(pixel);
                // this.segmentList.push();
            }


            ////////////// draw question //////////////
            this.questionPos = this.drawSentence(this.question,
                this.width - 20, 60, [10,
                    this.height /
                    3 * 2.5
                ], targAtt, "question");

            // console.log(this.questionPos);
            if (this.aggregateSen) {
                this.aggregateMatrix = this.aggregateMatrixBySen(attMatrix,
                    this.segmentList);
                this.drawLink(this.paraPos, this.questionPos, this.aggregateMatrix);
            } else {
                this.drawLink(this.paraPos, this.questionPos, attMatrix);
            }

        }
    }

    aggregateMatrixBySen(matrix, segmentList) {
        let aggMat = [];
        let index = 0;
        for (let i = 0; i < this.segmentList.length; i++) {
            let tempList = [];
            for (let j = 0; j < this.segmentList[i].length; j++) {
                tempList.push(matrix[index]);
                index++;
            }
            let maxList = tempList[0].map((_, index) => {
                return Math.max(...tempList.map(d => d[index]));
            })
            aggMat.push(maxList);
        }
        return aggMat;
    }

    /*
        width, height of the sentence bar
    */

    showParagraphSentence(sentence, att, startPos, endPos, indexRange) {
        // console.log(sentence, att);
        if (sentence) {
            let width = this.width - 20;
            let height = 60;
            let posX = 10;
            let posY = this.height * 0.3;

            let srcWidth = endPos[0] - startPos[0];

            this.selectParaSenPos = this.drawSentence(sentence, width,
                height, [posX, posY], att, "paraSen");
            var targWidth = width / sentence.length;
            var curveGen = d3.line()
                // .curve(d3.curveCatmullRom.alpha(0));
                .curve(d3.curveBasis);
            // .curve(d3.curveLinear);
            let rightCurve = curveGen([
                endPos, [endPos[0], endPos[1] + 25],
                [(endPos[0] + posX + width) * 0.5,
                    endPos[1] + (posY - endPos[1]) * 0.8
                ],
                [posX + width, posY]
            ]);
            let leftCurve = curveGen([
                [posX, posY],
                [(posX + startPos[0]) * 0.5,
                    startPos[1] + (posY - startPos[1]) * 0.8
                ],
                [startPos[0], startPos[1] + 25],
                startPos
            ]);
            // console.log(leftCurve, rightCurve);
            let polygonList = [
                startPos,
                endPos, [posX + width, posY],
                [posX, posY]
            ];
            this.svg.selectAll("." + "paraSen" + "Polygon").remove();
            this.svg.append("path")
                .attr("class", "paraSen" + "Polygon")
                .attr("d", rightCurve + "L" + posX + "," + posY + leftCurve +
                    "L" + endPos[0] + "," + endPos[1])
                // .attr("d", leftCurve)
                .attr("stroke", "grey")
                .attr("fill", "lightgrey")
                .attr("opacity", 0.4);

            this.subMat = this.normAttention.slice(
                indexRange[0],
                indexRange[1]);
            this.setData("selectionRange", [indexRange[0], indexRange[1]]);

            // console.log("subMat", subMat, indexRange);
            // console.log(this.selectParaSenPos, this.questionPos);
            this.drawLink(this.selectParaSenPos.map(d => {
                    return {
                        "x": d.x,
                        "y": d.y + height
                    };
                }),
                this.questionPos, this.subMat);

        } else {
            this.svg.selectAll("." + "paraSen" + "Rect").remove();
            this.svg.selectAll("." + "paraSen" + "Text").remove();
            this.svg.selectAll("." + "paraSen" + "Link").remove();
            this.svg.selectAll("." + "paraSen" + "Polygon").remove();

            if (this.aggregateSen) {
                this.drawLink(this.paraPos, this.questionPos, this.aggregateMatrix);
            } else {
                this.drawLink(this.paraPos, this.questionPos, this.normAttention);
            }
        }
    }

    drawSentence(sentence, width, height, offset, targAtt,
        classPrefix) {
        let targPos = sentence.map((d, i) => {
            return {
                'x': offset[0] + width / (sentence.length) * (i +
                    0.5),
                'y': offset[1]
            };
        });

        var targWidth = width / sentence.length;

        this.svg.selectAll("." + classPrefix + "Rect").remove();
        this.svg.selectAll("." + classPrefix + "Rect")
            .data(sentence)
            .enter()
            .append("rect")
            .attr('class', classPrefix + "Rect")
            .attr("x", (d, i) => targPos[i].x - targWidth * 0.5)
            .attr("y", (d, i) => targPos[i].y)
            .attr("width", targWidth)
            .attr("height", height)
            .style("fill", (d, i) => this.colormap(targAtt[i]))
            // .style("opacity", (d, i) => targAtt[i])
            .on('mouseover', (d, i, nodes) => {
                // this.highlight_and_linkAlignSrc('highlight', i,
                //     nodes);
            })
            .on('mouseout', (d, i, nodes) => {
                // this.highlight_and_linkAlignSrc('clean', i, nodes);
            })
            .on("click", (d, i) => {
                this.draw();
            });


        this.svg.selectAll("." + classPrefix + "Text").remove();
        this.svg.selectAll("." + classPrefix + "Text")
            .data(sentence)
            .enter()
            .append("text")
            .attr('class', classPrefix + "Text")
            .text(d => d)
            .attr("x", (d, i) => targPos[i].x)
            .attr("y", (d, i) => targPos[i].y + height * 0.5)
            // .style("font-size", this.checkFontSize.bind(this))
            .style("writing-mode", d => {
                var cbbox = this.svg.select("." + classPrefix + "Rect")
                    .node().getBBox();
                // console.log(cbbox);
                if (cbbox.height > cbbox.width)
                    return "vertical-rl";
                else
                    return "hortizontal-rl";
            })
            .style("alignment-baseline", "middle")
            .style("text-anchor", "middle")
            .style('pointer-events', 'none');

        return targPos;
    }

    drawLink(srcPos, targPos, attMatrix, classPrefix = "paraSen") {

        var d3line = d3.line()
            .x(function(d) {
                return d[0];
            })
            .y(function(d) {
                return d[1];
            })
            .curve(d3.curveBasis);

        this.svg.selectAll("." + classPrefix + "Link").remove();

        this.attList = [];
        for (var i = 0; i < attMatrix.length; i++) //src
            for (var j = 0; j < attMatrix[i].length; j++) { //targ
            this.attList.push([i, j, attMatrix[i][j]]);
        }

        // console.log(this.attList);
        let heighGap = targPos[0].y - srcPos[0].y;

        let connections = this.svg.selectAll("." + classPrefix + "Link")
            .data(this.attList)
            .enter()
            .append("path")
            .attr("d", d => {
                var lineData = [
                    [
                        srcPos[d[0]].x,
                        srcPos[d[0]].y
                    ],
                    [
                        srcPos[d[0]].x,
                        srcPos[d[0]].y + heighGap * 0.15
                    ],
                    [
                        targPos[d[1]].x,
                        targPos[d[1]].y - heighGap * 0.15
                    ],
                    [
                        targPos[d[1]].x,
                        targPos[d[1]].y
                    ]
                ];

                return d3line(lineData);
            })
            .attr("class", classPrefix + "Link")
            .attr("id", (d, i) => classPrefix + "Link" + i)
            .style("stroke-width", d => this.widthscale(d[2]))
            .style("stroke", "#87CEFA")
            .style("opacity", d => 0.1 + d[2])
            .style("fill", "none");

        return connections;
    }
}