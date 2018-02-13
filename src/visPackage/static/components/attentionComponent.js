/*

Matrix representation of attention

*/

//beside margin matrix will take 2/3 width and 2/3 height space
class attentionComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        this.subscribeDatabyNames(["attention", "currentPair"]);

        this.margin = {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
        };

        //init member
        this.srcIndexMaskSet = new Set();
        this.targIndexMaskSet = new Set()
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

            this.svgSave = new svgExporter(this.svgContainer, [this.width -
                10, 10
            ]);
        } else {

            this.svgContainer
                .attr("width", this.pwidth)
                .attr("height", this.pheight)

            this.svg.selectAll("text,rect,path").remove();

            this.svgSave.updatePos([this.width - 10, 10])
            this.svgSave.draw();
        }
    }

    draw() {
        this._updateWidthHeight();

        if (this.data["attention"] !== undefined && this.data["currentPair"] !==
            undefined) {

            //init svg
            this.initSvg();

            //attention matrix
            let attMatrix = this.data['attention'];

            ////////////////////add colormap //////////////////////
            this.colorbar =
                new d3UIcolorMap(this.svg, this.uuid, [0, 1], [0, 0], [this
                    .width * 0.22, 24
                ], 2);
            this.colorbar.draw();
            this.colorbar.callback(this.updateMatrixColormap.bind(this));

            //data

            //location of words
            var pair = this.data["currentPair"];

            this.attList = [];
            for (let i = 0; i < attMatrix.length; i++) {
                for (let j = 0; j < attMatrix[i].length; j++) {
                    if (!this.srcIndexMaskSet.has(i) && !this.targIndexMaskSet
                        .has(j))
                        this.attList.push(attMatrix[i][j]);
                }
            }

            this.srcWords = this.collapSenBySet(this.sen2words(pair[0]),
                this.srcIndexMaskSet);
            this.targWords = this.collapSenBySet(this.sen2words(pair[1]),
                this.targIndexMaskSet);

            console.log(this.srcWords, this.targWords, this.attList);

            this.computeWordPosition(this.srcWords, this.targWords);

            this.drawDepTree();

            //matrix
            let rectw = (this.width * (3 / 4)) / this.targWords.length;
            let recth = (this.height * (3 / 4)) / this.srcWords.length;

            this.rectw = rectw;
            this.recth = recth;

            this.svg.selectAll('.attentionComponent_matrix_rect')
                .data(this.attList)
                .enter()
                .append('rect')
                .attr('class', 'attentionComponent_matrix_rect')
                .attr('x', (d, i) => {
                    return this.width * 1 / 4 + (i % this.targWords.length) *
                        rectw;
                })
                .attr('y', (d, i) => {
                    return this.height * 1 / 4 + Math.floor(i / this.targWords
                        .length) * recth;
                })
                .attr('width', rectw)
                .attr('height', recth)
                .style('stroke', 'black')
                .style('stroke-width', '1px')
                .style('fill', d => {
                    return this.colorbar.lookup(1.0 - d);
                });

            //Draw targ text
            this.svg.selectAll('.attentionComponent_targWords')
                .data(this.targWords)
                .enter()
                .append('text')
                .text(d => d)
                .attr('x', (d, i) => this.targPos[i].x)
                .attr("y", (d, i) => this.targPos[i].y)
                .attr("transform", (d, i) => {
                    return "rotate(-45, " + this.targPos[i].x + ' , ' +
                        this.targPos[i].y + ')';
                })
                .style("font-size", 10)
                .style("alignment-baseline", "middle")
                .style("text-anchor", "middle")
                .on('click', (d, i) => {
                    this.targ_dep.collapse(i);
                });

            //Draw src text
            this.svg.selectAll('.attentionCompoentn_srcWords')
                .data(this.srcWords)
                .enter()
                .append('text')
                .text(d => d)
                .attr('x', (d, i) => this.srcPos[i].x)
                .attr("y", (d, i) => this.srcPos[i].y)
                .style("alignment-baseline", "middle")
                .style("font-size", 10)
                .style("text-anchor", "middle")
                .on('click', (d, i) => {
                    this.src_dep.collapse(i);
                });

        }
    }

    drawDepTree() {
        if (this.srcDepTreeData) {
            if (this.src_dep === undefined || this.src_dep.getDepTreeData() !==
                this.srcDepTreeData) {

                // if (this.src_dep)
                //     this.src_dep.clear();
                this.src_dep = new dependencyTreePlot(this.svg, 'v-left',
                    this.srcWords, this.srcPos, this.srcDepTreeData,
                    this.width, this.height);
                this.src_dep.setCollapseHandle(this.collapseSrc.bind(
                    this));
                // console.log("create tree");
            } else {
                this.src_dep.updatePos(this.srcPos);
            }
        }

        if (this.targDepTreeData) {
            if (this.targ_dep === undefined || this.targ_dep.getDepTreeData() !==
                this.targDepTreeData) {

                // if (this.targ_dep)
                //     this.targ_dep.clear();
                this.targ_dep = new dependencyTreePlot(this.svg, 'h-top',
                    this.targWords, this.targPos, this.targDepTreeData,
                    this.width, this.height);
                this.targ_dep.setCollapseHandle(this.collapseTarget.bind(
                    this));

            } else {
                this.targ_dep.updatePos(this.targPos);
            }
        }
    }

    sen2words(sen) {
        var words = sen.match(/\S+/g);
        // words.unshift("\<s\>");
        return words;
    }


    collapSenBySet(words, maskSet) {
        var collapWords = [];
        for (var i = 0; i < words.length; i++) {
            if (!maskSet.has(i))
                collapWords.push(words[i]);
        }
        return collapWords;
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

    updateMatrixColormap() {
        if (this.svg) {
            this.svg.selectAll('.attentionComponent_matrix_rect')
                .data(this.attList)
                .style('fill', d => {
                    return this.colorbar.lookup(1.0 - d);
                });
        }
    }

    computeWordPosition(src, targ) {
        // console.log(src, targ);
        this.srcPos = this.srcWords.map((d, i) => {
            return {
                'y': (this.height * 0.75) / this.srcWords.length *
                    (i + 0.5) + this.height / 4,
                'x': this.width * 1 / 4 - this.margin.left
            };
        });

        this.targPos = this.targWords.map((d, i) => {
            return {
                'x': (this.width * 0.75) / this.targWords.length *
                    (i + 0.5) + this.width / 4,
                'y': this.height * 1 / 4 - this.margin.top
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
                //parse the sentence
                let currentPair = this.data["currentPair"];
                this.callFunc("parseSentence", {
                    "sentence": currentPair[0]
                });
                this.callFunc("parseSentence", {
                    "sentence": currentPair[1]
                });
                break;
            case "currentPair":
                let pair = msg["data"]["data"];

                this.srcWords = pair[0].match(/\S+/g);
                this.targWords = pair[1].match(/\S+/g);

                break;
        }
    }

    parseFunctionReturn(msg) {
        switch (msg["func"]) {
            case "parseSentence":
                this.handleParsedSentence(msg["data"]["data"]);
        }
    }

    /////////////// handler /////////////////
    handleRowCollapse(collapseMask) {

    }

    handleColCollapse(collapseMask) {

    }

    handleParsedSentence(parseResult) {
        if (parseResult["sentence"] == this.data["currentPair"][0]) {
            //draw structure
            this.srcDepTreeData = parseResult["depTree"];
        } else if (parseResult["sentence"] == this.data[
                "currentPair"][1]) {
            this.targDepTreeData = parseResult["depTree"];
        }
        this.draw();
    }

}
