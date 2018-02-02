/*

Matrix representation of attention


*/

class attentionComponent extends baseComponent {
    constructor(uuid) {
        super(uuid);
        this.subscribeDatabyNames(["attention", "currentPair"]);

        this.margin = {
            top: 25,
            right: 25,
            bottom: 25,
            left: 25
        };

        this.draw();
    }

    draw() {
        this._updateWidthHeight();

        if (this.data["attention"] !== undefined) {
            //draw your stuff here
            //the dimension of the panel is this.width, this.height
            //the attention is store at this.data["attention"]
	    //TODO: I need sentence, and dependency tree of the sentence
            //console.log("attention:", this.data["attention"]);
	    
	    //clear all
	    if(this.svg)
		    d3.select(this.div).html('');
	    
	    let pair = this.data['currentPair'];
	    
	    //draw attention
	    let attMatrix = this.data['attention'];
	    
	    
	    //data
    	    this.attList = [];
	    for(let i = 0; i < attMatrix.length; i++)
		    for(let j = 0; j < attMatrix[i].length; j++){
		    	this.attList.push(attMatrix[i][j])
		    }
		    
	    this.srcWords = pair[0].match(/\S+/g);
	    this.srcWords = ["\<s\>"].concat(this.srcWords);
	    this.targWords = pair[1].match(/\S+/g);
	    this.targWords = ["\<s\>"].concat(this.targWords);    
		    
            
            //sentence position
            this.computeWordPosition(this.srcWords, this.targWords);
	    
	    //init svg
	    this.svg = d3.select(this.div).append("svg")
            .attr("width", this.pwidth)
            .attr("height", this.pheight)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," +
            	this.margin.top + ")");
		
	    //Draw src text
	    this.svg.selectAll('.attentionComponent_srcwords')
	    	.data(this.srcWords)
		.enter()
		.append('text')
		.text(d => d)
		.attr('x', (d, i) => this.srcPos[i])
		.attr("y", this.margin.top)
		.style("font-size", 10)
                .style("alignment-baseline", "middle")
                .style("text-anchor", "middle");
		
	    //Draw targ text
	    this.svg.selectAll('.attentionCompoentn_targwords')
		.data(this.targWords)
		.enter()
		.append('text')
		.text(d=>d)
		.attr('x', this.margin.left)
		.attr("y", (d, i) => this.targPos[i])
		.style("alignment-baseline", "middle")
		.style("font-size", 10)
                .style("text-anchor", "middle");
		
	
	
	
	    //sentence position
	    
	
        }
    }
	
    draw_attention(matrx, row, col){
    	
    }
    
    draw_dep_tree(sen, sen_dep, horv){
    	
    }

    computeWordPosition(src, targ) {
        // console.log(src, targ);
        this.srcPos = src.map((d, i) => {
            return this.width / (src.length + 1) * (i + 2)
        });
	
        this.targPos = targ.map((d, i) => {
		return this.height / (targ.length + 1) * (i + 0.5) + this.margin.top;
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
        }
    }
}
