/*
Display sentences and apply perturbation to the sentences
*/

class sentenceComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        this.subscribeDatabyNames(["predictionsHighlight", "currentPair"]);

        //setup UI
        d3.select(this.div + "perturbTarget").on("click", this.perturbTarget
            .bind(this));
        d3.select(this.div + "perturbSource").on("click", this.perturbSource
            .bind(this));
    }

    draw() {

        if (this.data["sentenceList"] !== undefined) {
            // d3.selet()
        }

        //update currentPair display
        if (this.data["currentPair"] !== undefined) {
            var currentPair = this.data['currentPair'];
            d3.select(this.div + "src").property("value", currentPair[0]);
            d3.select(this.div + "targ").property("value", currentPair[1]);
        }
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
