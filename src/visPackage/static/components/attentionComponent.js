/*

Matrix representation of attention


*/

class attentionComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        this.subscribeDatabyNames(["attention"]);

        this.margin = {
            top: 25,
            right: 25,
            bottom: 25,
            left: 25
        };
	
	this.rectw = 50;
	
	this.recth = 30;

        this.draw();
    }

    draw() {
        this._updateWidthHeight();

        if (this.data["attention"] !== undefined) {
            //draw your stuff here
            //the dimension of the panel is this.width, this.height
            //the attention is store at this.data["attention"]
		//TODO: I need sentence, and dependency tree of the sentence
            console.log("attention:", this.data["attention"]);
	    
	    let h_sen = this.data['attention'].targ_sen,
	    v_sen = this.data['attention'].src_sen,
	    matrix = this.data['attention'].matrix;
        }
    }
	
    draw_attention(matrx, row, col){
    	
    }
    
    draw_dep_tree(sen, sen_dep, horv){
    	
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
        }
    }
}
