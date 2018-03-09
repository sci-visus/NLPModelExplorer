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

            this.attList = [];
            for (let i = 0; i < attMatrix.length; i++) {
                for (let j = 0; j < attMatrix[i].length; j++) {
                    if (!this.srcIndexMaskSet.has(i) && !this.targIndexMaskSet
                        .has(j))
                        this.attList.push(attMatrix[i][j]);
                }
            }

            this.srcWords = this.collapSenBySet(this.sen2words(pair[0]),
                this.srcIndexMaskSet);
            this.targWords = this.collapSenBySet(this.sen2words(pair[1]),
                this.targIndexMaskSet);

            // console.log(this.srcWords, this.targWords, this.attList);

            this.computeWordPosition(this.srcWords, this.targWords);

            this.drawDepTree();

            //matrix
            let rectw = (this.width * (3 / 4)) / this.targWords.length;
            let recth = (this.height * (3 / 4)) / this.srcWords.length;

            this.rectw = rectw;
            this.recth = recth;

            let rects = this.svg.selectAll('.attentionComponent_matrix_rect')
                .data(this.attList)
                .enter()
                .append('rect')
                .attr('class', 'attentionComponent_matrix_rect')
                .attr('x', (d, i) => {
                    return this.width * 1 / 4 + (i % this.targWords.length) *
                        rectw;
                })
                .attr('y', (d, i) => {
                    return this.height * 1 / 4 + Math.floor(i / this.targWords
                        .length) * recth;
                })
                .attr('width', rectw)
                .attr('height', recth)
                .style('stroke', 'black')
                .style('stroke-width', '1px')
                .style('fill', d => {
                    return this.colorbar.lookup(d);
                });
		
	    

            //Draw targ text
            let targtext = this.svg.selectAll('.attentionComponent_targWords')
                .data(this.targWords)
                .enter()
                .append('text')
                .text(d => d)
                .attr('x', (d, i) => this.targPos[i].x)
                .attr("y", (d, i) => this.targPos[i].y)
                .attr("transform", (d, i) => {
                    return "rotate(-45, " + this.targPos[i].x + ' , ' +
                        this.targPos[i].y + ')';
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
                });

            //Draw src text
            let srctext = this.svg.selectAll('.attentionCompoentn_srcWords')
                .data(this.srcWords)
                .enter()
                .append('text')
                .text(d => d)
                .attr('x', (d, i) => this.srcPos[i].x)
                .attr("y", (d, i) => this.srcPos[i].y)
                .style("alignment-baseline", "middle")
                .style("font-size", 12)
                .style("text-anchor", "middle")
		.on('mouseover', (d, i)=>{
			this.src_dep.highlight(i);
		})
		.on('mouseout', (d, i)=>{
			this.src_dep.highlight(-1);
		})
                .on('click', (d, i) => {
                    this.src_dep.collapse(i);
                });
		
    	    ////////////// rect mouse over event ///////////////
    	    rects.on('mouseover', (d, i)=>{
	    	
    		    let col = i % this.targWords.length,
    		    row = Math.floor(i / this.targWords.length);
		    
    		    rects.style('stroke', (data, index)=>{
    			    if(col == index % this.targWords.length || row == Math.floor(index / this.targWords.length))
    				    return 'red';
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
