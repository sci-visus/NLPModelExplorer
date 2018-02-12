/*

Graph representation of attention

*/

class attentionSentenceComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        this.subscribeDatabyNames(["attention", "currentPair"]);

        this.margin = {
            top: 5,
            right: 10,
            bottom: 5,
            left: 15
        };

        //init member
        this.srcIndexMaskSet = new Set();
        this.targIndexMaskSet = new Set();

        this.startRange = 0.6;
        this.endRange = 2.3;

        // this.draw();
    }

    collapseSrc(mask) {
        this.srcIndexMaskSet.clear();
        mask.map((d, i) => {
            if (d === 0) {
                this.srcIndexMaskSet.add(i)
            }
        });
        this.draw();
    }

    collapseTarget(mask) {
        this.targIndexMaskSet.clear();
        mask.map((d, i) => {
            if (d === 0) {
                this.targIndexMaskSet.add(i);
            }
        });
        this.draw();
    }

    initSvg() {
        //create svg
        if (this.svgContainer === undefined) {
            this.svgContainer = d3.select(this.div).append("svg")
                .attr("width", this.pwidth)
                .attr("height", this.pheight);
            this.svg = this.svgContainer
                .append("g")
                .attr("transform", "translate(" + this.margin.left + "," +
                    this.margin.top + ")");

            this.svgSave = new svgExporter(this.svg);

        } else {

            this.svgContainer
                .attr("width", this.pwidth)
                .attr("height", this.pheight)

            this.svg.selectAll("text,rect,path").remove();
            this.svgSave.draw();
        }
    }

    draw() {
        this._updateWidthHeight();


        if (this.data["attention"] !== undefined) {

            // init svg
            this.initSvg();

            var pair = this.data["currentPair"];
            //draw attention
            var attMatrix = this.data["attention"];
            // console.log(attMatrix);

            var srcAtt = attMatrix.map(d => d.reduce((a, b) => a + b));
            var targAtt = attMatrix[0].map((d, i) => {
                // console.log(d, i);
                var sum = 0;
                for (var j = 0; j < attMatrix.length; j++)
                    sum += attMatrix[j][i];
                return sum;
            });

            this.attList = [];
            for (var i = 0; i < attMatrix.length; i++)
                for (var j = 0; j < attMatrix[i].length; j++) {
                    this.attList.push([i, j, attMatrix[i][j]]);
                }

            // console.log(srcAtt, targAtt);

            var src = this.sen2words(pair[0]);
            var targ = this.sen2words(pair[1]);
            this.collapSrcTarg(src, targ, srcAtt, targAtt);

            //drawing sentence
            // console.log(this.srcWords);
            var srcWidth = this.width / (this.srcWords.length + 1);
            var targWidth = this.width / (this.targWords.length + 1);
            this.rectHeight = this.height / 3.0 * 0.5;
            // console.log(srcWidth, targWidth);

            //sentence position
            this.computeWordPosition(this.srcWords, this.targWords);
            // console.log(this.srcWords, this.targWords);

            this.svg.append("text")
                .attr("x", 2)
                .attr("y", this.startRange / 3 * this.height + this.rectHeight /
                    2.0)
                .attr("font-family", "sans-serif")
                .attr("font-size", 15)
                .attr("fill", "black")
                .text("Premise")
                .style("writing-mode", "vertical-rl")
                .style("alignment-baseline", "middle")
                .style("text-anchor", "middle");

            this.svg.append("text")
                .attr("class", "text")
                .attr("x", 2)
                .attr("y", this.endRange / 3 * this.height - this.rectHeight /
                    2.0)
                .attr("font-family", "sans-serif")
                .attr("font-size", 15)
                .attr("fill", "black")
                .text("Hypothesis")
                .style("writing-mode", "vertical-rl")
                .style("alignment-baseline", "middle")
                .style("text-anchor", "middle");

            ///////////////////// draw dependency tree //////////////////
            this.drawDepTree();
            ///////////////////// drawing line //////////////////////
            this.drawConnection();

            ///////////////////// drawing rect //////////////////////
            this.svg.selectAll(".sourceRect")
                .data(this.srcWords)
                .enter()
                .append("rect")
                .attr("x", (d, i) => this.srcPos[i].x - srcWidth / 2.0)
                .attr("y", (d, i) => this.srcPos[i].y)
                .attr("width", srcWidth)
                .attr("height", this.rectHeight)
                .attr("class", "sourceRect")
                .style("fill", "#87CEFA")
                .style("opacity", (d, i) => this.srcAtt[i] * 0.5);

            this.svg.selectAll(".targRect")
                .data(this.targWords)
                .enter()
                .append("rect")
                .attr("x", (d, i) => this.targPos[i].x - targWidth / 2.0)
                .attr("y", (d, i) => this.targPos[i].y - this.rectHeight)
                .attr("width", targWidth)
                .attr("height", this.rectHeight)
                .attr("class", "targRect")
                .style("fill", "#87CEFA")
                .style("opacity", (d, i) => this.targAtt[i] * 0.5);

            ///////////////////// drawing text ////////////////////
            this.svg.selectAll(".srcWords")
                .data(this.srcWords)
                .enter()
                .append("text")
                .attr("class", "text")
                .text(d => d)
                .attr("x", (d, i) => this.srcPos[i].x)
                .attr("y", (d, i) => this.srcPos[i].y + this.rectHeight *
                    0.5)
                .style("font-size", this.checkFontSize.bind(this))
                .style("writing-mode", this.checkOrientation.bind(this))
                .style("text-anchor", "middle")
                .on("click", (d, i) => {
                    this.src_dep.collapse(i);
                });

            this.svg.selectAll(".targWords")
                .data(this.targWords)
                .enter()
                .append("text")
                .attr("class", "text")
                .text(d => d)
                .attr("x", (d, i) => this.targPos[i].x)
                .attr("y", (d, i) => this.targPos[i].y - this.rectHeight *
                    0.5)
                .style("font-size", this.checkFontSize.bind(this))
                .style("writing-mode", this.checkOrientation.bind(this))
                .style("alignment-baseline", "middle")
                .style("text-anchor", "middle")
                .on("click", (d, i) => {
                    this.targ_dep.collapse(i);
                });
        }
    }

    drawDepTree() {
        if (this.srcDepTreeData) {
            if (this.src_dep === undefined || this.src_dep.getDepTreeData() !==
                this.srcDepTreeData) {

                this.src_dep = new dependencyTreePlot(this.svg, 'h-top',
                    this.srcWords,
                    this.srcPos, this.srcDepTreeData, this.height, this
                    .height);
                this.src_dep.setCollapseHandle(this.collapseSrc.bind(this));
                // console.log("create tree");
            } else {
                this.src_dep.updatePos(this.srcPos);
            }
        }

        if (this.targDepTreeData) {
            if (this.targ_dep === undefined || this.targ_dep.getDepTreeData() !==
                this.targDepTreeData) {

                this.targ_dep = new dependencyTreePlot(this.svg, 'h-bottom',
                    this.targWords,
                    this.targPos, this.targDepTreeData, this.height,
                    this
                    .height);

                this.targ_dep.setCollapseHandle(this.collapseTarget.bind(
                    this));
                // console.log("create tree");
            } else {
                this.targ_dep.updatePos(this.targPos);
                // console.log("draw tree");
            }
        }
    }


    drawConnection() {
        var d3line = d3.line()
            .x(function(d) {
                return d[0];
            })
            .y(function(d) {
                return d[1];
            });
        // .curve("d3.curveLinear");
        // console.log(this.attList);
        this.svg.selectAll(".attConnect").remove();
        this.svg.selectAll(".attConnect")
            .data(this.attList)
            .enter()
            .append("path")
            .attr("d", d => {
                // console.log(d);
                //mapped from original index to collapsed index
                let mappedSrcIndex = this.srcCollapMap[d[0]];
                let mappedTargIndex = this.targCollapMap[d[1]];

                if (mappedSrcIndex >= 0 && mappedTargIndex >= 0) {

                    var lineData = [
                        [
                            this.srcPos[mappedSrcIndex].x,
                            this.srcPos[mappedSrcIndex].y +
                            this.rectHeight
                        ],
                        [
                            this.targPos[mappedTargIndex].x,
                            this.targPos[mappedTargIndex].y -
                            this.rectHeight
                        ]
                    ];
                    // console.log(d, lineData);
                    return d3line(lineData);
                }
            })
            .attr("class", "attConnect")
            .style("stroke-width", d => d[2] * 5)
            .style("stroke", "#87CEFA")
            .style("opacity", d => 0.1 + d[2])
            .style("fill", "none");
    }

    computeWordPosition(src, targ) {
        // console.log(src, targ);
        this.srcPos = src.map((d, i) => {
            return {
                'x': this.width / (src.length + 1) * (i + 1),
                'y': this.height / 3 * this.startRange
            };
        });
        this.targPos = targ.map((d, i) => {
            return {
                'x': this.width / (targ.length + 1) * (i + 1),
                'y': this.height / 3 * this.endRange
            };
        });
    }

    resize() {
        //you can redraw or resize your vis here
        this.draw();
    }

    parseDataUpdate(msg) {
        super.parseDataUpdate(msg);
        switch (msg["name"]) {
            case "attention":
                //if attention is updated, redraw attention
                this.srcDepTreeData = undefined;
                this.targDepTreeData = undefined;

                this.draw();
                var pair = this.data["currentPair"];

                this.callFunc("parseSentence", {
                    "sentence": pair[0]
                });
                this.callFunc("parseSentence", {
                    "sentence": pair[1]
                });
                break;
                // case "currentPair":
                //     var pair = msg["data"]["data"];
                //parse the sentence

                // break;
        }
    }

    parseFunctionReturn(msg) {
        switch (msg["func"]) {
            case "parseSentence":
                this.handleParsedSentence(msg["data"]["data"]);
        }
    }

    /////////////// handler /////////////////
    handleParsedSentence(parseResult) {
        if (parseResult["sentence"] == this.data["currentPair"][0]) {
            this.srcDepTreeData = parseResult["depTree"];
        } else if (parseResult["sentence"] == this.data["currentPair"][1]) {
            this.targDepTreeData = parseResult["depTree"];
        }
        this.draw();
    }

    ///////////// helper //////////////
    collapSrcTarg(src, targ, srcAtt, targAtt) {
        //save the original files
        this.originSrcWords = src;
        this.originTargWords = targ;

        this.srcWords = this.collapSenBySet(src, this.srcIndexMaskSet);
        this.targWords = this.collapSenBySet(targ, this.targIndexMaskSet);

        this.srcAtt = this.collapSenAttBySet(srcAtt, this.srcIndexMaskSet);
        this.targAtt = this.collapSenAttBySet(targAtt, this.targIndexMaskSet);

        this.srcCollapMap = this.generateIndexMap(src, this.srcWords)
        this.targCollapMap = this.generateIndexMap(targ, this.targWords)

        // console.log(this.srcCollapMap, this.targCollapMap);
    }

    sen2words(sen) {
        var words = sen.match(/\S+/g);
        // words.unshift("\<s\>");
        return words
    }

    collapSenBySet(words, maskSet) {
        var collapWords = [];
        for (var i = 0; i < words.length; i++) {
            if (!maskSet.has(i))
                collapWords.push(words[i]);
        }
        return collapWords;
    }

    collapSenAttBySet(att, maskSet) {
        var collapAtt = [];
        for (var i = 0; i < att.length; i++) {
            if (!maskSet.has(i))
                collapAtt.push(att[i]);
        }
        return collapAtt;
    }

    /*
    generate index from original sentence to the collapsed sentence
    */
    generateIndexMap(originSen, collapSen) {
        var j = 0;
        var map = []
        for (var i = 0; i < originSen.length; i++) {
            if (originSen[i] == collapSen[j]) {
                map.push(j);
                j += 1;
            } else {
                //if the entry is deleted
                map.push(-1);
            }
        }
        return map
    }

    checkFontSize(d) {
        var cbbox = this.svg.select(".targRect").node().getBBox();
        // console.log(cbbox);
        return 14;
    }

    checkOrientation(d) {
        var cbbox = this.svg.select(".targRect").node().getBBox();
        // console.log(cbbox);
        if (cbbox.height > cbbox.width)
            return "vertical-rl";
        else
            return "hortizontal-rl";

    }
}
