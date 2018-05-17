class paragraphComponenet extends sentenceComponent {
    constructor(uuid) {
        super(uuid);
        // this.subscribeDatabyNames(["sentenceList", "currentPair"]);

    }

    parseDataUpdate(msg) {
        super.parseDataUpdate(msg);
        switch (msg['name']) {
            case "dynamicSourceHighlight":
                break;
        }
    }

    // draw() {
    //     //sync highlight with attention
    //
    // }
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
