/*
Display sentences and apply perturbation to the sentences
*/

class sentenceComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        this.subscribeDatabyNames(["predictionsHighlight", "sentenceList",
            "currentPair"
        ]);

        //setup UI
        d3.select(this.div + "perturbTarget").on("click", this.perturbTarget
            .bind(this));
        d3.select(this.div + "perturbSource").on("click", this.perturbSource
            .bind(this));
    }

    draw() {
        if (this.data["sentenceList"] !== undefined) {
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

        //update currentPair display
        if (this.data["currentPair"] !== undefined) {
            var currentPair = this.data['currentPair'];
            this.updateDisplayedPair(currentPair);
        }
    }

    onChangeOriginalPair() {
        var index = Number(d3.select(this.div + "selectExample").property(
            'value'));
        // console.log(index);
        var currentPair = [this.data["sentenceList"][index]["src"],
            this.data["sentenceList"][index]["targ"]
        ];
        this.updateDisplayedPair(currentPair);
    }

    updateDisplayedPair(pair) {
        d3.select(this.div + "src").property("value", pair[0]);
        d3.select(this.div + "targ").property("value", pair[1]);
    }

    parseFunctionReturn(msg) {
        switch (msg['func']) {
            case 'perturbSentence':
                this.updatePerturbedSentences(msg["data"]);
                break;
                // case 'functionReturn':
                //     this.parseFunctionReturn(msg);
                //     return;
        }

    }

    updatePerturbedSentences(sentences) {
        console.log(sentences);
    }

    perturbSource() {
        console.log("perturb source\n");
        if (this.data["currentPair"] !== undefined) {
            this.callFunc("perturbSentence", {
                "sentence": this.data["currentPair"][0]
            });
        }
    }

    perturbTarget() {
        if (this.data["currentPair"] !== undefined) {
            this.callFunc("perturbSentence", {
                "sentence": this.data["currentPair"][1]
            });
        }
    }


}
