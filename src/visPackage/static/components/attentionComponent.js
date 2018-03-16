/*

Based class for attention visualization

*/

//beside margin matrix will take 2/3 width and 2/3 height space
class attentionComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        this.subscribeDatabyNames(["attention", "currentPair", "highlight"]);

        this.margin = {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
        };

        //init member
        this.srcIndexMaskSet = new Set();
        this.targIndexMaskSet = new Set();

        this.aggregationIndex = {};
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

            this.svg.selectAll("text,rect,path, defs").remove();

            this.svgSave.updatePos([this.width - 10, 10])
            this.svgSave.draw();
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

        //this.drawDepTree();
    }

    collapseTarget(mask) {
        this.targIndexMaskSet.clear();
        mask.map((d, i) => {
            if (d === 0) {
                this.targIndexMaskSet.add(i);
            }
        });

        //this.drawDepTree();
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
                // this.srcDepTreeData = undefined;
                // this.targDepTreeData = undefined;
                //normalize att
                this.rawAttention = this.data["attention"];
                this.normAttention = this.rawAttention.map(d => this.softmax(
                    d));
                // console.log(this.rawAttention);
                console.log(this.normAttention);
                // this.normAttention =

                this.draw();

                //parse the sentence
                let currentPair = this.data["currentPair"]["sentences"];
                if (this.srcDepTreeData === undefined) {
                    this.callFunc("parseSentence", {
                        "sentence": currentPair[0]
                    });
                }
                if (this.targDepTreeData === undefined) {
                    this.callFunc("parseSentence", {
                        "sentence": currentPair[1]
                    });
                }

                break;

            case "currentPair":
                let pair = msg["data"]["data"]["sentences"];
                if (this.oldPair) {
                    //clear the current dependency
                    if (this.oldPair[0].length !== pair[0].length) {
                        this.srcDepTreeData = undefined;
                    }
                    if (this.oldPair[1].length !== pair[1].length) {
                        this.targDepTreeData = undefined;
                    }
                }

                this.srcWords = pair[0].match(/\S+/g);
                this.targWords = pair[1].match(/\S+/g);
                this.oldPair = pair;

                break;
        }
    }

    parseFunctionReturn(msg) {
        switch (msg["func"]) {
            case "parseSentence":
                this.handleParsedSentence(msg["data"]["data"]);
        }
    }

    handleParsedSentence(parseResult) {
        let parsedSen = parseResult["sentence"];
        if (parsedSen == this.data["currentPair"]["sentences"][0]) {
            //draw structure
            this.srcDepTreeData = parseResult["depTree"];
        } else if (parsedSen == this.data["currentPair"]["sentences"][1]) {
            this.targDepTreeData = parseResult["depTree"];
        }
        this.draw();
    }

    aggregationMatrix(root, nodes) {
        //check whether the aggregate root already exist
        if (root in this.aggregationIndex) {
            delete this.aggregationIndex[root];
        } else {
            this.aggregationIndex[root] = nodes;
        }

        //clone object
        this.aggregatedMatrix = this.normAttention.map(function(arr) {
            return arr.slice();
        })

        //TODO: aggregate the information base on this.normAttention
        for (const root in this.aggregationIndex) {
            this.aggregationMatrixHelper(root, this.aggregationIndex[root]);
        }

    }

    aggregationMatrixHelper(root, indexs) {

        for (let i = 0; i < this.aggregatedMatrix.length; i++) {
            let maxvalue = this.aggregatedMatrix[i][root];
            for (let j = 0; j < this.aggregatedMatrix[i].length; j++) {
                if (indexs.includes(j)) {
                    if (maxvalue < this.aggregatedMatrix[i][j]) {
                        maxvalue = this.aggregatedMatrix[i][j];
                    }
                    this.aggregatedMatrix[i][j] = 0;
                }
            }
            this.aggregatedMatrix[i][root] = maxvalue;
        }
    }

    softmax(arr) {
        return arr.map(function(value, index) {
            return Math.exp(value) / arr.map(function(y /*value*/ ) {
                return Math.exp(y)
            }).reduce(function(a, b) {
                return a + b
            })
        })
    }
}
