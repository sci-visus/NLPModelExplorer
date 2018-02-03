/*

Matrix representation of attention


*/

class attentionSentenceComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        this.subscribeDatabyNames(["attention", "currentPair"]);

        this.margin = {
            top: 15,
            right: 15,
            bottom: 15,
            left: 15
        };

        //init member
        this.srcMaskSet = new Set();
        this.targMaskSet = new Set();

        //filter the visualization by modify the mask set
        // this.srcMaskSet.add("to");
        // this.srcMaskSet.add("go");
        // this.srcMaskSet.add("packages");
        // this.targMaskSet.add("to");

        this.draw();
    }

    updateMask(srcList, targList) {
        this.srcMaskSet.clear();
        this.targMaskSet.clear();
        srcList.map(d => this.srcMaskSet.add(d));
        targList.map(d => this.targMaskSet.add(d));
        this.draw();
    }

    draw() {
        this._updateWidthHeight();

        if (this.data["attention"] !== undefined) {
            //clear all
            if (!d3.select(this.div).select("svg").empty())
                d3.select(this.div).select("svg").remove();
            //draw your stuff here
            //the dimension of the panel is this.width, this.height
            //the attention is store at this.data["attention"]
            // console.log("attention:", this.data["attention"]);
            // console.log("currentPair:", this.data["currentPair"]);

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

            //sentence position
            this.computeWordPosition(this.srcWords, this.targWords);
            // console.log(this.srcWords, this.targWords);
            // console.log(this.srcPos, this.targPos);

            //create svg
            this.svg = d3.select(this.div).append("svg")
                .attr("width", this.width)
                .attr("height", this.height)
                .append("g")
                .attr("transform", "translate(" + this.margin.left + "," +
                    this.margin.top + ")");

            //drawing sentence
            // console.log(this.srcWords);
            var srcWidth = this.width / (this.srcWords.length + 1);
            var targWidth = this.width / (this.targWords.length + 1);
            // console.log(srcWidth, targWidth);



            //////// drawing line ///////////
            this.drawConnection();

            //////// drawing rect ///////////
            this.svg.selectAll(".sourceRect")
                .data(this.srcWords)
                .enter()
                .append("rect")
                .attr("x", (d, i) => this.srcPos[i] - srcWidth / 2.0)
                .attr("y", this.height / 3 * 0.5)
                .attr("width", srcWidth)
                .attr("height", this.height / 3 * 0.5)
                .attr("class", "sourceRect")
                .style("fill", "#87CEFA")
                .style("opacity", (d, i) => this.srcAtt[i] * 0.5);

            this.svg.selectAll(".targRect")
                .data(this.targWords)
                .enter()
                .append("rect")
                .attr("x", (d, i) => this.targPos[i] - targWidth / 2.0)
                .attr("y", this.height / 3 * 2.0)
                .attr("width", targWidth)
                .attr("height", this.height / 3 * 0.5)
                .attr("class", "targRect")
                .style("fill", "#87CEFA")
                .style("opacity", (d, i) => this.targAtt[i] * 0.5)

            //////// drawing text ///////////
            this.svg.selectAll(".srcWords")
                .data(this.srcWords)
                .enter()
                .append("text")
                .text(d => d)
                .attr("x", (d, i) => this.srcPos[i])
                .attr("y", this.height / 3 * 0.75)
                .style("font-size", this.checkFontSize.bind(this))
                .style("writing-mode", this.checkOrientation.bind(this))
                // .style("alignment-baseline", "middle")
                .style("text-anchor", "middle");

            //////// drawing text ///////////
            this.svg.selectAll(".targWords")
                .data(this.targWords)
                .enter()
                .append("text")
                .text(d => d)
                .attr("x", (d, i) => this.targPos[i])
                .attr("y", this.height / 3 * 2.25)
                .style("font-size", this.checkFontSize.bind(this))
                .style("writing-mode", this.checkOrientation.bind(this))
                .style("alignment-baseline", "middle")
                .style("text-anchor", "middle");
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

        this.svg.selectAll(".attConnect")
            .data(this.attList)
            .enter()
            .append("path")
            .attr("d", d => {
                // console.log(d);
                let mappedSrcIndex = this.srcCollapMap[d[0]];
                let mappedTargIndex = this.targCollapMap[d[1]];

                if (mappedSrcIndex && mappedTargIndex) {

                    var lineData = [
                        [
                            this.srcPos[mappedSrcIndex],
                            this.height / 3 * 1
                        ],
                        [
                            this.targPos[mappedTargIndex],
                            this.height / 3 * 2
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
            return this.width / (src.length + 1) * (i + 1)
        });
        this.targPos = targ.map((d, i) => {
            return this.width / (targ.length + 1) * (i + 1)
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
                this.draw();
                break;
            case "currentPair":
                var pair = msg["data"]["data"];
                //parse the sentence
                // this.callFunc("parseSentence", {
                //     "sentence": pair[0]
                // });
                // this.callFunc("parseSentence", {
                //     "sentence": pair[1]
                // });
                break;
        }
    }

    parseFunctionReturn(msg) {
        switch (msg["func"]) {
            case "parseSentence":
                this.handleParsedSentence(msg["data"]);
        }
    }

    /////////////// handler /////////////////
    handleParsedSentence(parseResult) {
        console.log(parseResult);
        if (parseResult["sentence"] == this.data["currentPair"][0]) {
            //draw structure
            // this.srcDepTree = new dependencyTreePlot(this.svg);
            // this.srcDepTree.setCollapseHandle(this.redraw.bind(this));
        }
    }

    ///////////// helper //////////////

    collapSrcTarg(src, targ, srcAtt, targAtt) {
        //save the original files
        this.originSrcWords = src;
        this.originTargWords = targ;

        this.srcWords = this.collapSenBySet(src, this.srcMaskSet);
        this.targWords = this.collapSenBySet(targ, this.targMaskSet);

        this.srcAtt = this.collapSenAttBySet(src, srcAtt, this.srcMaskSet);
        this.targAtt = this.collapSenAttBySet(targ, targAtt, this.targMaskSet);

        this.srcCollapMap = this.generateIndexMap(src, this.srcWords)
        this.targCollapMap = this.generateIndexMap(targ, this.targWords)

        console.log(this.srcCollapMap, this.targCollapMap);
    }

    sen2words(sen) {
        var words = sen.match(/\S+/g);
        words.unshift("\<s\>");
        return words
    }

    collapSenBySet(words, maskSet) {
        var collapWords = [];
        for (var i = 0; i < words.length; i++) {
            if (!maskSet.has(words[i]))
                collapWords.push(words[i]);
        }
        return collapWords;
    }

    collapSenAttBySet(words, att, maskSet) {
        var collapAtt = [];
        for (var i = 0; i < words.length; i++) {
            if (!maskSet.has(words[i]))
                collapAtt.push(att[i]);
        }
        return collapAtt;
    }

    /*
    generate index from collapsed sentence to the original sentence
    */
    generateIndexMap(originSen, collapSen) {
        var j = 0;
        var map = []
        for (var i = 0; i < originSen.length; i++) {
            if (originSen[i] == collapSen[j]) {
                map.push(j);
                j += 1;
            } else {
                map.push(undefined);
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
