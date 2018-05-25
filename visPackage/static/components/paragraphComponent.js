class paragraphComponenet extends sentenceComponent {
    constructor(uuid) {
        super(uuid);
        // this.subscribeDatabyNames(["sentenceList", "currentPair"]);
        //init
        this.callFunc("initSetup");
    }

    parseDataUpdate(msg) {
        super.parseDataUpdate(msg);
        switch (msg['name']) {
            case "dynamicSourceHighlight":
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
}

colorSentenceByValue(sentence, prob) {

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
