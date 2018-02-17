/*

Based class for attention visualization

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
