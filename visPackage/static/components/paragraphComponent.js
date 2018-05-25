class paragraphComponenet extends sentenceComponent {
    constructor(uuid) {
        super(uuid);
        this.subscribeDatabyNames(["prediction"]);
        //init
        this.callFunc("initSetup");
    }

    parseDataUpdate(msg) {
        super.parseDataUpdate(msg);
        switch (msg['name']) {
            case "dynamicSourceHighlight":
                break;
            case "prediction":
                this.predP1 = this.data["prediction"][0][0];
                this.predP2 = this.data["prediction"][1][0];
                // console.log(this.predP2, this.predP1)
                this.showPrediction();
                break;
        }
    }

    onReceiveCurrentPair() {
        var currentPair = this.data['currentPair']["sentences"];
        // console.log(this.data["currentPair"]["sentences"]);

        this.source = currentPair[0];
        this.target = currentPair[1];
        if (this.data["allTargetSens"])
            this.orig_source = this.data["allTargetSens"][0];

        d3.select(this.div + "src").html(this.source);
        d3.select(this.div + "targ").property("value", this.target);

        // console.log("----------", this.data["allSourceSens"]);
        // if (this.data["allSourceSens"]) {
        //     $(this.div + "src").highlightWithinTextarea({
        //         highlight: this.getSentenceDiff(
        //             this.data["allSourceSens"][0].substring(
        //                 4),
        //             currentPair[0].substring(
        //                 4)), //
        //         className: 'blue'
        //     });
        // }
        if (this.data["allTargetSens"]) {
            $(this.div + "targ").highlightWithinTextarea({
                highlight: this.getSentenceDiff(this.orig_source,
                    this.target), //
                className: 'blue'
            });
        }
    }

    showPrediction() {
        let indexS = this.predP1.indexOf(Math.max(...this.predP1));
        let indexE = this.predP2.indexOf(Math.max(...this.predP2));
        let prob = new Array(this.predP1.length).fill(0);

        for (let i = indexS; i < indexE + 1; i++) {
            prob[i] = 1.0;
        }
        console.log(indexS, indexE, prob);

        let coloredSrc = this.colorSentenceByValue(this.source, prob,
            "yellow");
        d3.select(this.div + "src").html(coloredSrc);
    }

    colorSentenceByValue(sentence, prob, color) {
        let wordList = sentence.split(" ");
        var outputStr = "";
        let d3color = d3.color(color);

        for (let i = 0; i < wordList.length; i++) {
            d3color.opacity = prob[i];
            let word = "<span style=\"background:" + d3color.toString() +
                ";\">" +
                wordList[i] +
                "</span>";
            word += " "
            outputStr += word;
        }

        return outputStr;
    }
}
// onReceiveSentenceList() {
//     // console.log("sentenceList:", this.data["sentenceList"]);
//     d3.select(this.div + "selectExample")
//         .on("change", this.onChangeOriginalPair.bind(this));
//     var options = d3.select(this.div + "selectExample")
//         .selectAll('option')
//         .data(this.data["sentenceList"]).enter()
//         .append('option')
//         .text(function(d) {
//             return d["src"].substring(4) + " | " + d["targ"].substring(
//                 4);
//         })
//         .property("value", (d, i) => i);
// }
