/*
Display sentences and apply perturbation to the sentences
*/

class sentenceComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        this.subscribeDatabyNames(["sentenceList", "currentPair"]);

        //setup UI
        d3.select(this.div + "perturbTarget").on("click", this.perturbTarget
            .bind(this));
        d3.select(this.div + "perturbSource").on("click", this.perturbSource
            .bind(this));


        d3.select(this.div + "Predict").on("click", d => {
            this.callFunc("predict");
        });
        d3.select(this.div + "PredictAll").on("click", d => {
            //produce all combinations
            this.callFunc("predictAll");
        });

        //update data when currentPair changes
        d3.select(this.div + "src").on("change", this.onUpdateCurrentPair.bind(
            this));
        d3.select(this.div + "targ").on("change", this.onUpdateCurrentPair.bind(
            this));
    }

    draw() {
        //add to sentence list
        if (this.data["sentenceList"] !== undefined) {
            this.onReceiveSentenceList();
        }
        //update currentPair display
        if (this.data["currentPair"] !== undefined) {
            this.onReceiveCurrentPair();
        }
    }

    parseDataUpdate(msg) {
        super.parseDataUpdate(msg);

        switch (msg['name']) {
            case "sentenceList":
                this.onReceiveSentenceList();
                break;
            case "currentPair":
                // console.log(msg, this.data["currentPair"]);
                this.onReceiveCurrentPair();
                break;
        }
    }

    parseFunctionReturn(msg) {
        switch (msg['func']) {
            case 'perturbSentence':
                this.updatePerturbedSentences(msg["data"]["data"], msg[
                    "data"]);
                break;
                // case 'functionReturn':
                //     this.parseFunctionReturn(msg);
                //     return;
        }
    }


    /////////////////// event handler /////////////////////
    onReceiveSentenceList() {
        // console.log("sentenceList:", this.data["sentenceList"]);
        d3.select(this.div + "selectExample")
            .on("change", this.onChangeOriginalPair.bind(this));
        var options = d3.select(this.div + "selectExample")
            .selectAll('option')
            .data(this.data["sentenceList"]).enter()
            .append('option')
            .text(function(d) {
                return d["index"] + "-" + d["src"] + "/" + d["targ"];
            })
            .property("value", (d, i) => i);
    }

    onReceiveCurrentPair() {
        var currentPair = this.data['currentPair'];
        // console.log(this.data["currentPair"]);

        d3.select(this.div + "src").property("value", currentPair[0]);
        d3.select(this.div + "targ").property("value", currentPair[1]);
        // console.log("----------", this.data["allSourceSens"]);
        if (this.data["allSourceSens"]) {

            $(this.div + "src").highlightWithinTextarea({
                highlight: this.getSentenceDiff(
                    this.data["allSourceSens"][0],
                    currentPair[0]), //
                className: 'blue'
            });
        }
        if (this.data["allTargetSens"]) {
            $(this.div + "targ").highlightWithinTextarea({
                highlight: this.getSentenceDiff(
                    this.data["allTargetSens"][0],
                    currentPair[1]), //
                className: 'blue'
            });
        }
    }

    onChangeOriginalPair() {
        var index = Number(d3.select(this.div + "selectExample").property(
            'value'));
        // console.log(index);
        var currentPair = [this.data["sentenceList"][index]["src"],
            this.data["sentenceList"][index]["targ"]
        ];
        // console.log(currentPair);
        // this.onReceiveCurrentPair()
        this.data["currentPair"] = currentPair;
        d3.select(this.div + "src").property("value", currentPair[0]);
        d3.select(this.div + "targ").property("value", currentPair[1]);

        //update rest of the views
        this.setData("currentPair", currentPair);

        this.clearDropdown(this.div + "srcInput");
        this.clearDropdown(this.div + "targInput");

        this.setData("allSourceSens", [currentPair[0]]);
        this.setData("allTargetSens", [currentPair[1]]);
    }

    onUpdateCurrentPair() {
        var currentPair = [d3.select(this.div + "src").property("value"),
            d3.select(this.div + "targ").property("value")
        ];
        // console.log(currentPair);
        this.setData("currentPair", currentPair);
    }

    updatePerturbedSentences(sentences) {

        if (this.data["currentPair"][0] == sentences[0]) {
            this.setData("allSourceSens", sentences);
            this.addDropdown(this.div + "srcInput", sentences, this.div +
                "src");
        } else if (this.data["currentPair"][1] == sentences[0]) {
            this.setData("allTargetSens", sentences);
            this.addDropdown(this.div + "targInput", sentences, this.div +
                "targ");
        }
    }

    perturbSource() {
        if (this.data["currentPair"] !== undefined) {
            this.isPerturbSource = true;
            this.callFunc("perturbSentence", {
                "sentence": this.data["currentPair"][0]
            });
        }
    }

    perturbTarget() {
        if (this.data["currentPair"] !== undefined) {
            this.isPerturbTarget = true;
            this.callFunc("perturbSentence", {
                "sentence": this.data["currentPair"][1]
            });
        }
    }

    clearDropdown(selector) {
        d3.select(selector).select(".dropdown-toggle").remove();
        d3.select(selector).select(".dropdown-menu")
            .selectAll(".dropdown-item").remove();
    }

    addDropdown(selector, sentences, labelSelector) {
        if (d3.select(selector).select(".dropdown-toggle").empty()) {
            // console.log("add Button");
            d3.select(selector).append("button")
                .attr("class",
                    "btn btn-outline-secondary dropdown-toggle dropdown-toggle-split"
                )
                .attr("data-toggle", "dropdown")
                .attr("aria-haspopup", "true")
                .attr("aria-expanded", "false")
                .append("span")
                .attr("class", "sr-only");
            d3.select(selector)
                .append("div")
                .attr("class", "dropdown-menu");


            //cleanup
            // console.log(menu);
            var menu = d3.select(selector).select(".dropdown-menu");

            menu.selectAll(".dropdown-item").remove();
            menu.selectAll(".dropdown-item")
                .data(sentences)
                .enter()
                .append("a")
                .attr("class", "dropdown-item")
                .html(d => this.colorSentenceDiff(sentences[0], d))
                .on("click", (d, i) => {
                    //update sentence edit box
                    d3.select(labelSelector).property("value", d);
                    $(labelSelector).highlightWithinTextarea({
                        highlight: this.getSentenceDiff(
                            sentences[0],
                            d), //
                        className: 'blue'
                    });

                    this.onUpdateCurrentPair();
                });
        }
        /////////////////// reference /////////////////
        // <button type="button" class="btn btn-outline-secondary dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        //   <span class="sr-only">Toggle Dropdown</span>
        // </button>
        // <div class="dropdown-menu" id="{{id}}selectTarget">
        //   <a class="dropdown-item" href="#">Action</a>
        // </div>
    }

    ////////////////////// helper /////////////////////

    colorSentenceDiff(origin, perturbed) {
        var originList = origin.split(" ");
        var perturbedList = perturbed.split(" ");
        if (originList.length === perturbedList.length) {
            var outputStr = "";
            for (var i = 0; i < originList.length; i++) {
                var word = perturbedList[i];
                if (word !== originList[i] && word !== ".") {
                    // console.log(word, "-", originList[i]);
                    word = "<span style=\"background:#87CEFA\">" + word +
                        "</span>";
                }
                word += " "

                outputStr += word;
            }
            // <span style="color:#FF0000">some text</span>
            return outputStr;
        }
        return perturbed;
    }

    getSentenceDiff(origin, perturbed) {
        var originList = origin.split(" ");
        var perturbedList = perturbed.split(" ");
        var wordList = [];
        if (originList.length === perturbedList.length) {
            var outputStr = "";
            for (var i = 0; i < originList.length; i++) {
                var word = perturbedList[i];
                if (word !== originList[i] && word !== ".") {
                    // console.log(word, "-", originList[i]);
                    wordList.push(word);
                }
            }
        }
        return wordList;
    }
}
