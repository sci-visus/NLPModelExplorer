/*

Matrix representation of attention

*/


class attentionMatrixComponent extends attentionComponent {

    constructor(uuid) {
        super(uuid);
    }

    draw() {
        this._updateWidthHeight();

        if (this.data["attention"] !== undefined && this.data["currentPair"] !==
            undefined) {

            //init svg
            this.initSvg();

            //attention matrix
            // let attMatrix = this.data['attention'];
            let attMatrix = this.normAttention;
            ////////////////////add colormap //////////////////////
            this.colorbar =
                new d3UIcolorMap(this.svg, this.uuid, [0, 1], [10, 10], [
                    this
                    .width * 0.22, 24
                ], 2);
            this.colorbar.draw();
            this.colorbar.callback(this.updateMatrixColormap.bind(this));

            //data

            //location of words
            var pair = this.data["currentPair"];

            this.attList = this.generateMatrixGeometry();
	    
	    this.srcWords = this.sen2words(pair[0]);
	    this.targWords = this.sen2words(pair[1]);

            this.computeWordPosition(this.srcWords, this.targWords);

            this.drawDepTree();

            //matrix
            this.rectw = (this.width * (3 / 4)) / this.targWords.length;
            this.recth = (this.height * (3 / 4)) / this.srcWords.length;

		
	   let rects = this.svg.selectAll('.attentionComponent_matrix_rect')
		.data(this.attList)
		.enter()
		.append('rect')
                .attr('class', 'attentionComponent_matrix_rect')
                .attr('x', (d, i) => {
			return d.x;
                })
                .attr('y', (d, i) => {
                    	return d.y;
                })
                .attr('width', (d)=>{return d.width;})
                .attr('height', (d)=>{return d.height;})
                .style('stroke', 'black')
                .style('stroke-width', '1px')
                .style('fill', d => {
                    return this.colorbar.lookup(d.value);
                });
	    /////////////////////// draw text /////////////////////////
	    let texts = this.generateTextGeometry();
            //Draw targ text
            let targtext = this.svg.selectAll('.attentionComponent_targWords')
                .data(texts.targ)
                .enter()
                .append('text')
                .text(d => d.text)
		.attr('class', 'attentionComponent_targWords')
                .attr('x', (d, i) => d.x)
                .attr("y", (d, i) => d.y)
	    	.attr('display', d=>d.display)
                .attr("transform", (d, i) => {
                    return "rotate(-45, " + d.x + ' , ' +
                        d.y + ')';
                })
                .style("font-size", 12)
                .style("alignment-baseline", "middle")
                .style("text-anchor", "middle")
		.on('mouseover', (d, i)=>{
			this.targ_dep.highlight(i);
		})
		.on('mouseout', (d, i)=>{
			this.targ_dep.highlight(-1);
		})
                .on('click', (d, i) => {
                    this.targ_dep.collapse(i);
		    this.collapse_Animation();
                });

            //Draw src text
            let srctext = this.svg.selectAll('.attentionComponent_srcWords')
                .data(texts.src)
                .enter()
                .append('text')
                .text(d => d.text)
		.attr('class', 'attentionComponent_srcWords')
                .attr('x', (d, i) => d.x)
                .attr("y", (d, i) => d.y)
                .style("alignment-baseline", "middle")
                .style("font-size", 12)
		.attr('display', d=>d.display)
                .style("text-anchor", "middle")
		.on('mouseover', (d, i)=>{
			this.src_dep.highlight(i);
		})
		.on('mouseout', (d, i)=>{
			this.src_dep.highlight(-1);
		})
                .on('click', (d, i) => {
			this.src_dep.collapse(i);
			this.collapse_Animation();
                });
		
    	    ////////////// rect mouse over event ///////////////
    	    rects.on('mouseover', (d, i)=>{
	    	
    		    let col = i % this.targWords.length,
    		    row = Math.floor(i / this.targWords.length);
		    
    		    rects.style('stroke', (data, index)=>{
    			    if(col == index % this.targWords.length || row == Math.floor(index / this.targWords.length))
    				    return 'orange';
    			    else
    				    return 'black';
    		    });
		    
		    targtext.style('font-size', (d, i)=>{return i==col?'16':'12';})
		    	.style('font-weight', (d, i)=>{return i==col?'bold':'normal';})
			.attr('fill', (d, i)=>{return i==col?'orange':'black'});
			
		    srctext.style('font-size', (d, i)=>{return i==row?'16':'12';})
			.style('font-weight', (d, i)=>{return i==row?'bold':'normal';})
			.attr('fill', (d, i)=>{return i==row?'orange':'black';});
			
    		    this.targ_dep.highlight(col);
    		    this.src_dep.highlight(row);		
    	    })
    	    .on('mouseout', (d, i)=>{
		    targtext.style('font-size', 12).style('font-weight', 'normal').attr('fill', 'black');
		    srctext.style('font-size', 12).style('font-weight', 'normal').attr('fill', 'black');
    		    rects.style('stroke','black');
    		    this.targ_dep.highlight(-1);
    		    this.src_dep.highlight(-1);
    	    });
	 
		
	     //draw text background
	     this.svg.selectAll('.attentionMatrixComponent_background_text')
		.data(['Premise', 'Hypothesis'])
		.enter()
		.append('text')
		.text(d=>d)
                .attr('x', (d, i) => {
			return i == 0 ? this.width/32 : this.width * 5/8;
		})
                .attr("y", (d, i) => {
                	return i == 0? this.height * 5/8 : this.width/16;
                })
    	    	.style('writing-mode',(d,i)=>{
    		     	return i == 0?'vertical-lr':'horizontal-tb';
    	   	 })
                .style("alignment-baseline", "middle")
                .style("font-size", 32)
		.style('fill', 'steelblue')
		.style('fill-opacity', 0.2)
		.style("text-anchor", "middle")
		.style('pointer-events', 'none');
	

        }
    }

    //define each rect's width, height, x, y and color map value
    generateMatrixGeometry(){
	    
	    let attMatrix = this.normAttention;
	    
	    let targWords = this.sen2words(this.data["currentPair"][1]);
	    
	    let srcWords = this.sen2words(this.data["currentPair"][0]);
	    
	    let w = this.width * 3/4 / (targWords.length -  this.targIndexMaskSet.size);
	    
	    let h = this.height * 3/4 / (srcWords.length  - this.srcIndexMaskSet.size);
	    
	    let attList = [];
	    
	    //init x location of visualization
	    let attx = this.width * 1/4;
	    
	    //init y location of visualization
	    let atty = this.height * 1/4;
	    
	    //row
            for (let i = 0; i < attMatrix.length; i++) {    
		attx = this.width * 1/4;
		//column
		//init location, width and height value of each rect in the heatmap matrix 
                for (let j = 0; j < attMatrix[i].length; j++) {
			let item = {'x': attx, 'y':atty, 'value':attMatrix[i][j]};
			if (!this.srcIndexMaskSet.has(i) && !this.targIndexMaskSet.has(j)){
				item['width'] = w;
				item['height'] = h;
				attx += w;
			}
			else{
				item['width'] = 0;
				item['height'] = 0;
			}
                       	attList.push(item); 
                }
		
		//if current row is not filtered 
		if(!this.srcIndexMaskSet.has(i)){
			atty += h;
		}
            }
	    
	    return attList;
    }
    
    //define each text font x, y, and font-size base on whether they are filtered
    generateTextGeometry(){
	    
	    let srcText = [];
	
	    let srcWords = this.sen2words(this.data["currentPair"][0]);
	    
	    let h = (this.height * 0.75) / (srcWords.length - this.srcIndexMaskSet.size);
	    
	    let text_loc = h/2 + this.height / 4;
	    for(let i = 0; i < srcWords.length; i++){
		    let item = {};
		    if(!this.srcIndexMaskSet.has(i)){
			    item['x'] = this.width * 1 / 4 - this.margin.left * 3;
			    item['y'] = text_loc;		    
			    item['display'] = 'block';
			    item['text'] = srcWords[i];
			    text_loc += h;
		    }else{
			    item['x'] = this.width * 1 / 4 - this.margin.left * 3;
			    item['y'] = text_loc;		    
			    item['display'] = 'none';
			    item['text'] = srcWords[i];
		    }   
		    srcText.push(item);
	    }
	    
	    let targText = [];
	    
	    let targWords = this.sen2words(this.data["currentPair"][1]);
	    
	    let w = (this.width * 0.75) / (targWords.length - this.targIndexMaskSet.size);
	    
	    text_loc = w/2 + this.width / 4;
	    for(let i = 0; i < targWords.length; i++){
		    let item = {};
		    if(!this.targIndexMaskSet.has(i)){
			    item['x'] = text_loc;
			    item['y'] = this.height * 1 / 4 - this.margin.top * 3;		    
			    item['display'] = 'block';
			    item['text'] = targWords[i];
			    text_loc += w;
		    }else{
			    item['x'] = text_loc;
			    item['y'] = this.height * 1 / 4 - this.margin.top * 3;		    
			    item['display'] = 'none';
			    item['text'] = targWords[i];
		    }
		    targText.push(item);  
	    }
	    
	    return {'src':srcText, 'targ':targText};
	    
    }
    
    collapse_Animation(){
	    
	    //////////////////// rect animation ////////////////////
	    let attMatrix = this.generateMatrixGeometry();
	    
	    let rects = d3.selectAll('.attentionComponent_matrix_rect').data(attMatrix);
	    
	    rects.exit().remove();
	    
	    rects.append('rect');
	    
	    rects.transition()
            .duration(2000)
            .attr('x', (d, i) => {
		    return d.x;
            })
            .attr('y', (d, i) => {
		    return d.y;
            })
            .attr('width', (d)=>{return d.width;})
            .attr('height', (d)=>{return d.height;})
            .style('fill', d => {
                return this.colorbar.lookup(d.value);
            });  
	    
	    let texts = this.generateTextGeometry(); 
	    /////////////////  src text animation ///////////////////
	    let srctext = this.svg.selectAll('.attentionComponent_srcWords')
	    .data(texts.src);
	    
	    srctext.exit().remove();
	    srctext.append('text')
            
            srctext
	    .transition()
            .duration(2000)
	    .attr('x', (d, i) => d.x)
            .attr("y", (d, i) => d.y)
            .attr("display", (d)=>d['display']);
	    
	    /////////////////  targ text animation ///////////////////
    	    let targtext = this.svg.selectAll('.attentionComponent_targWords')
    	    .data(texts.targ);
    
    	    targtext.exit().remove();
    	    targtext.append('text');
            
            targtext
	    .transition()
	    .duration(2000)
            .attr('x', (d, i) => d.x)
	    .attr("y", (d, i) => d.y)
            
            .attr("transform", (d, i) => {
                return "rotate(-45, " + d.x + ' , ' +
                    d.y + ')';
            })
	    .attr("display", (d)=>d['display']);
	    
	    
	     ///////////////// dependency tree animation ///////////////////
	    this.srcWords = this.collapSenBySet(this.sen2words(this.data["currentPair"][0]),this.srcIndexMaskSet);
	    this.targWords = this.collapSenBySet(this.sen2words(this.data["currentPair"][1]),this.targIndexMaskSet);
	    this.computeWordPosition(this.srcWords, this.targWords);
	    this.drawDepTree();
    }
    
    updateMatrixColormap() {
        if (this.svg) {
            this.svg.selectAll('.attentionComponent_matrix_rect')
                .data(this.attList)
                .style('fill', d => {
                    return this.colorbar.lookup(d);
                });
        }
    }

    drawDepTree() {
        if (this.srcDepTreeData) {
            if (this.src_dep === undefined || this.src_dep.getDepTreeData() !==
                this.srcDepTreeData) {

                // if (this.src_dep)
                //     this.src_dep.clear();
                this.src_dep = new dependencyTreePlot(this.svg, 'v-left',
                    this.srcWords, this.srcPos, this.srcDepTreeData,
                    this.width, this.height);
                this.src_dep.setCollapseHandle(this.collapseSrc.bind(
                    this));
                // console.log("create tree");
            } else {
		    this.src_dep.updatePos(this.srcPos);
            }
        }

        if (this.targDepTreeData) {
            if (this.targ_dep === undefined || this.targ_dep.getDepTreeData() !==
                this.targDepTreeData) {

                // if (this.targ_dep)
                //     this.targ_dep.clear();
                this.targ_dep = new dependencyTreePlot(this.svg, 'h-top',
                    this.targWords, this.targPos, this.targDepTreeData,
                    this.width, this.height);
                this.targ_dep.setCollapseHandle(this.collapseTarget.bind(
                    this));

            } else {
		    this.targ_dep.updatePos(this.targPos);
            }
        }
    }

    computeWordPosition(src, targ) {
        // console.log(src, targ);
        this.srcPos = this.srcWords.map((d, i) => {
            return {
                'y': (this.height * 0.75) / this.srcWords.length *
                    (i + 0.5) + this.height / 4,
                'x': this.width * 1 / 4 - this.margin.left * 3
            };
        });

        this.targPos = this.targWords.map((d, i) => {
            return {
                'x': (this.width * 0.75) / this.targWords.length *
                    (i + 0.5) + this.width / 4,
                'y': this.height * 1 / 4 - this.margin.top * 3
            };
        });
    }

}
