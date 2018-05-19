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
                for (var j = 0; j < this.segmentList[i].length; j++) {
                    this.paraPos.push({
                        "x": pos + (0.5 + j) * unit,
                        "y": 35
                    });
                }

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
            this.drawLink(this.paraPos, this.questionPos, attMatrix);
        }
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

            this.selectParaSenPos = this.drawSentence(sentence, width,
                height, [posX, posY], att, "paraSen");
            var targWidth = width / sentence.length;
            let polygonList = [
                startPos,
                endPos, [posX + width, posY],
                [posX, posY]
            ];
            this.svg.selectAll("." + "paraSen" + "Polygon").remove();
            this.svg.selectAll("." + "paraSen" + "Polygon")
                .data([polygonList])
                .enter().append("polygon")
                .attr("class", "paraSen" + "Polygon")
                .attr("points", function(d) {
                    return d.map(function(d) {
                        // console.log(d);
                        return d.join(",");
                    }).join(" ");
                })
                .attr("stroke", "grey")
                .attr("fill", "lightgrey")
                .attr("opacity", 0.4);

            let subMat = this.normAttention.slice(
                indexRange[0],
                indexRange[1]);
            // console.log("subMat", subMat, indexRange);
            // console.log(this.selectParaSenPos, this.questionPos);
            this.drawLink(this.selectParaSenPos.map(d => {
                    return {
                        "x": d.x,
                        "y": d.y + height
                    };
                }),
                this.questionPos, subMat);

        } else {
            this.svg.selectAll("." + "paraSen" + "Rect").remove();
            this.svg.selectAll("." + "paraSen" + "Text").remove();
            this.svg.selectAll("." + "paraSen" + "Link").remove();
            this.svg.selectAll("." + "paraSen" + "Polygon").remove();
            this.drawLink(this.paraPos, this.questionPos, this.normAttention);
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

    drawLink(srcPos, targPos, attMatrix, classPrefix = "para") {

        var d3line = d3.line()
            .x(function(d) {
                return d[0];
            })
            .y(function(d) {
                return d[1];
            });

        this.svg.selectAll("." + classPrefix + "Link").remove();

        this.attList = [];
        for (var i = 0; i < attMatrix.length; i++) //src
            for (var j = 0; j < attMatrix[i].length; j++) { //targ
            this.attList.push([i, j, attMatrix[i][j]]);
        }

        // console.log(this.attList);

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
                        targPos[d[1]].x,
                        targPos[d[1]].y
                    ]
                ];

                return d3line(lineData);
            })
            .attr("class", classPrefix + "Link")
            .style("stroke-width", d => this.widthscale(d[2]))
            .style("stroke", "#87CEFA")
            .style("opacity", d => 0.1 + d[2])
            .style("fill", "none");

        return connections;
    }
}
