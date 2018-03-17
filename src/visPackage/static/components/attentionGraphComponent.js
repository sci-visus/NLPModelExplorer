/*

Graph representation of attention

*/

class attentionGraphComponent extends attentionComponent {
    constructor(uuid) {
        super(uuid);

        this.startRange = 0.6;
        this.endRange = 2.3;
    }

    draw() {
        this._updateWidthHeight();

        if (this.data["attention"] !== undefined) {
            // init svg
            this.initSvg();

            var pair = this.data["currentPair"]["sentences"];
            //draw attention
            var attMatrix = this.normAttention;
            //var attMatrix = this.data["attention"];
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

            var src = this.sen2words(pair[0]);
            var targ = this.sen2words(pair[1]);
            this.collapSrcTarg(src, targ, srcAtt, targAtt);

            //drawing sentence
            var srcWidth = this.width / (this.srcWords.length + 1);
            var targWidth = this.width / (this.targWords.length + 1);
            this.rectHeight = this.height / 3.0 * 0.5;

            //sentence position
            this.computeWordPosition(this.srcWords, this.targWords);
            // console.log(this.srcWords, this.targWords);

            this.svg.append("text")
                .attr("x", 2)
                .attr("y", this.startRange / 3 * this.height + this.rectHeight / 2.0)
                .attr("font-family", "sans-serif")
                .attr("font-size", 15)
                .attr("fill", "black")
                .text("Premise")
                .style("writing-mode", "vertical-rl")
                .style("alignment-baseline", "middle")
                .style("text-anchor", "middle");

            this.svg.append("text")
                .attr("x", 2)
                .attr("y", this.endRange / 3 * this.height - this.rectHeight / 2.0)
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
            let connections = this.drawConnection();

            ///////////////////// drawing rect //////////////////////
            this.svg.selectAll(".attentionGraphComponentSrcRect")
                .data(this.srcWords)
                .enter()
                .append("rect")
                .attr('class', 'attentionGraphComponentSrcRect')
                .attr("x", (d, i) => this.srcPos[i].x - srcWidth / 2.0)
                .attr("y", (d, i) => this.srcPos[i].y)
                .attr("width", srcWidth)
                .attr("height", this.rectHeight)
                .attr("class", "srcRect")
                .style("fill", "#87CEFA")
                .style("opacity", (d, i) => this.srcAtt[i] * 0.5);

            this.svg.selectAll(".attentionGraphComponentTargRect")
                .data(this.targWords)
                .enter()
                .append("rect")
                .attr('class', 'attentionGraphComponentTargRect')
                .attr("x", (d, i) => this.targPos[i].x - targWidth / 2.0)
                .attr("y", (d, i) => this.targPos[i].y - this.rectHeight)
                .attr("width", targWidth)
                .attr("height", this.rectHeight)
                .attr("class", "targRect")
                .style("fill", "#87CEFA")
                .style("opacity", (d, i) => this.targAtt[i] * 0.5);

            ///////////////////// drawing text ////////////////////
            let srcWords = this.svg.selectAll(".attentionGraphComponentSrcText")
                .data(this.srcWords)
                .enter()
                .append("text")
                .attr('class', 'attentionGraphComponentSrcText')
                .text(d => d)
                .attr("x", (d, i) => this.srcPos[i].x)
                .attr("y", (d, i) => this.srcPos[i].y + this.rectHeight *
                    0.5)
                .style("font-size", this.checkFontSize.bind(this))
                .style("writing-mode", this.checkSrcOrientation.bind(this))
                .style("text-anchor", "middle")
                .on('mouseover', (d, i, nodes) => {
                    d3.select(nodes[i]).style('fill', 'orange');
                    this.highlight_and_linkAlignTarg(i);
                })
                .on('mouseout', (d, i, nodes) => {
                    d3.select(nodes[i]).style('fill', 'black');
                    this.highlight_and_linkAlignTarg('clean');
                })
                .on("click", (d, i) => {
                    this.src_dep.collapse(this.src_dep.display_index[i]);
		    this.draw();
                });

            let targWords = this.svg.selectAll(".attentionGraphComponentTargText")
                .data(this.targWords)
                .enter()
                .append("text")
                .attr('class', 'attentionGraphComponentTargText')
                .text(d => d)
                .attr("x", (d, i) => this.targPos[i].x)
                .attr("y", (d, i) => this.targPos[i].y - this.rectHeight *
                    0.5)
                .style("font-size", this.checkFontSize.bind(this))
                .style("writing-mode", this.checkTargOrientation.bind(this))
                .style("alignment-baseline", "middle")
                .style("text-anchor", "middle")
                .on('mouseover', (d, i, nodes) => {
                    d3.select(nodes[i]).style('fill', 'orange');
                    this.highlight_and_linkAlignSrc(i);
                })
                .on('mouseout', (d, i, nodes) => {
                    d3.select(nodes[i]).style('fill', 'black');
                    this.highlight_and_linkAlignSrc('clean');
                })
                .on("click", (d, i) => {
                    this.targ_dep.collapse(this.targ_dep.display_index[i]);
		    this.draw()
                });
        }
    }

    highlight_and_linkAlignSrc(index) {

        if (index == 'clean') {
            this.targ_dep.highlight(-1);
            this.src_dep.highlight(-1);

            d3.selectAll('.attentionGraphComponentSrcText').style('fill',
                'black');
            d3.selectAll('.attentionGraphComponentSrcRect').style('fill',
                '#87CEFA');
            d3.selectAll('.attentionGraphComponentAttConnect').style(
                'stroke', '#87CEFA');
        } else {
            this.targ_dep.highlight(index);
            this.currentMatrix = this.normAttention;

            //maximum value index
            let max = -1;
            let maxindex = -1;
            for (let i = 0; i < this.currentMatrix.length; i++) {
                if (max < this.currentMatrix[i][index]) {
                    max = this.currentMatrix[i][index];
                    maxindex = i;
                }
            }

            d3.selectAll('.attentionGraphComponentSrcText').filter((d, i) => {
                    return i == maxindex;
                })
                .style('fill', 'orange');
            d3.selectAll('.attentionGraphComponentSrcRect').filter((d, i) => {
                    return i == maxindex;
                })
                .style('fill', 'orange');
            d3.selectAll('.attentionGraphComponentAttConnect').filter((d, i) => {
                    return i == (maxindex * this.currentMatrix[0].length +
                        index);
                })
                .style('stroke', 'orange');
            this.src_dep.highlight(maxindex);
        }
    }

    highlight_and_linkAlignTarg(index) {

        if (index == 'clean') {
            this.targ_dep.highlight(-1);
            this.src_dep.highlight(-1);

            d3.selectAll('.attentionGraphComponentTargText').style('fill',
                'black');
            d3.selectAll('.attentionGraphComponentTargRect').style('fill',
                '#87CEFA');
            d3.selectAll('.attentionGraphComponentAttConnect').style(
                'stroke', '#87CEFA');
        } else {
            this.src_dep.highlight(index);
            this.currentMatrix = this.normAttention;

            //maximum value index
            let max = -1;
            let maxindex = -1;
            for (let i = 0; i < this.currentMatrix[index].length; i++) {
                if (max < this.currentMatrix[index][i]) {
                    max = this.currentMatrix[index][i];
                    maxindex = i;
                }
            }

            d3.selectAll('.attentionGraphComponentTargText').filter((d, i) => {
                    return i == maxindex;
                })
                .style('fill', 'orange');
            d3.selectAll('.attentionGraphComponentTargRect').filter((d, i) => {
                    return i == maxindex;
                })
                .style('fill', 'orange');
            d3.selectAll('.attentionGraphComponentAttConnect').filter((d, i) => {
                    return i == (index * this.currentMatrix[0].length +
                        maxindex);
                })
                .style('stroke', 'orange');

            this.targ_dep.highlight(maxindex);
        }
    }

    generateTextGeometry() {

        ////////// src words ////////////////
        let srcText = [];

        let srcRect = [];

        let srcWords = this.sen2word2(this.data['currentPair'][0]);

        let text_loc = this.width / (srcWords.length + 1);

        for (let i = 0; i < srcWords.length; i++) {
            let textitem = {};
            let rectitem = {};

            textitem['x'] = text_loc;

            textitem['y'] = this.height / 3 * this.startRange + this.rectHeight *
                0.5;

            textitem['text'] = srcWords[i];

            if (!this.srcIndexMaskSet.has(i)) {
                textitem['display'] = 'block'
                text_loc += this.width / (src.length + 1);
            } else {
                textitem['display'] = 'none';
            }
            srcText.push(textitem);
        }


        ////////// targ words ////////////////
        let targText = [];

        let targWords = this.sen2words(this.data['currentPair'][1]);

        text_loc = this.width / (targWords.length + 1);

        for (let i = 0; i < targWords.length; i++) {
            let item = {};

            item['x'] = text_loc;

            item['y'] = this.height / 3 * this.endRange;

            item['text'] = targWords[i];

            if (!this.targIndexMaskSet.has(i)) {
                item['display'] = 'block';
                text_loc += this.width / (src.length + 1);
            } else {
                item['display'] = 'none';
            }

            targText.push(item);
        }

        return {
            'src': srcText,
            'targ': targText
        };
    }

    generateMatrixGeometry() {

    }

    drawDepTree() {
        if (this.srcDepTreeData) {
            if (this.src_dep === undefined) {

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
            if (this.targ_dep === undefined) {

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

    collapseAnimation() {

    }

    drawConnection() {
        var d3line = d3.line()
            .x(function(d) {
                return d[0];
            })
            .y(function(d) {
                return d[1];
            });

        this.svg.selectAll(".attentionGraphComponentAttConnect").remove();
        let connections = this.svg.selectAll(".attentionGraphComponentAttConnect")
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

                    return d3line(lineData);
                }
            })
            .attr("class", 'attentionGraphComponentAttConnect')
            .style("stroke-width", d => d[2] * 5)
            .style("stroke", "#87CEFA")
            .style("opacity", d => 0.1 + d[2])
            .style("fill", "none");

        return connections;
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

    /*
        parseDataUpdate(msg) {
            super.parseDataUpdate(msg);
            switch (msg["name"]) {
                case "attention":
                    //if attention is updated, redraw attention
                    this.srcDepTreeData = undefined;
                    this.targDepTreeData = undefined;

                    this.draw();
                    var pair = this.data["currentPair"]["sentences"];

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
        if (parseResult["sentence"] == this.data["currentPair"]["sentences"][0]) {
            this.srcDepTreeData = parseResult["depTree"];
        } else if (parseResult["sentence"] == this.data["currentPair"]["sentences"][1]) {
            this.targDepTreeData = parseResult["depTree"];
        }
        this.draw();
    }
    */
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

    checkSrcOrientation(d) {
        var cbbox = this.svg.select(".srcRect").node().getBBox();
        // console.log(cbbox);
        if (cbbox.height > cbbox.width)
            return "vertical-rl";
        else
            return "hortizontal-rl";

    }

    checkTargOrientation(d) {
        var cbbox = this.svg.select(".targRect").node().getBBox();
        // console.log(cbbox);
        if (cbbox.height > cbbox.width)
            return "vertical-rl";
        else
            return "hortizontal-rl";

    }

}
