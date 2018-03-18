/*

Matrix representation of attention

*/


class attentionMatrixComponent extends attentionComponent {

    constructor(uuid) {
        super(uuid);
    }

    draw() {
        this._updateWidthHeight();

        if (this.data["attention"] !== undefined && this.data["currentPair"]
            ["sentences"] !==
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
            var pair = this.data["currentPair"]["sentences"];

            this.aggregatedMatrix = Object.assign(this.normAttention);

            this.attList = this.generateMatrixGeometry();

            this.srcWords = this.sen2words(pair[0]);
            this.targWords = this.sen2words(pair[1]);

            this.computeWordPosition(this.srcWords, this.targWords);

            this.drawDepTree();

            //matrix
            this.rectw = (this.width * (3 / 4)) / this.targWords.length;
            this.recth = (this.height * (3 / 4)) / this.srcWords.length;


            let rects = this.svg.selectAll(
                    '.attentionComponent_matrix_rect')
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
                .attr('width', (d) => {
                    return d.width;
                })
                .attr('height', (d) => {
                    return d.height;
                })
                .style('stroke', 'black')
                .style('stroke-width', '1px')
                .style('fill', d => {
                    return this.colorbar.lookup(d.value);
                })
		.call(d3.drag()
		.on('start', (d, i, nodes)=>{
			this.dragEventX = d3.event.x;
		})
		.on('drag', (d, i, nodes)=>{
			this.rectDragEvent(i, d, nodes);
		})
		.on('end', (d, i)=>{
			this.dragEventX == undefined;
		}));
            /////////////////////// draw text /////////////////////////
            let texts = this.generateTextGeometry();
            //Draw targ text
            let targtext = this.svg.selectAll(
                    '.attentionComponent_targWords')
                .data(texts.targ)
                .enter()
                .append('text')
                .text(d => d.text)
                .attr('class', 'attentionComponent_targWords')
                .attr('x', (d, i) => d.x)
                .attr("y", (d, i) => d.y)
                .attr('display', d => d.display)
                .attr("transform", (d, i) => {
                    return "rotate(-45, " + d.x + ' , ' +
                        d.y + ')';
                })
                .attr('text-anchor', 'middle')
                .classed('attentionMatrixComponent_text_normal', true)
                .on('mouseover', (d, i, nodes) => {
			this.highlight(i);
                })
                .on('mouseout', (d, i, nodes) => {
			this.highlight(-1);
                })
                .on('click', (d, i, nodes) => {
			this.collapse(i, nodes, 'vertical');
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
                .attr('display', d => d.display)
                .attr('text-anchor', 'middle')
                .classed('attentionMatrixComponent_text_normal', true)
                .on('mouseover', (d, i) => {
                    this.src_dep.highlight(i);
                })
                .on('mouseout', (d, i) => {
                    this.src_dep.highlight(-1);
                })
                .on('click', (d, i, nodes) => {
                    this.collapse(i, nodes, 'horizontal');
                });

            ////////////// rect mouse over event ///////////////
            this.rectMouseEvent(rects, targtext, srctext);

            //draw text background
            this.svg.selectAll('.attentionMatrixComponent_background_text')
                .data(['Premise', 'Hypothesis'])
                .enter()
                .append('text')
                .text(d => d)
                .attr('x', (d, i) => {
                    return i == 0 ? this.width / 32 : this.width * 5 /
                        8;
                })
                .attr("y", (d, i) => {
                    return i == 0 ? this.height * 5 / 8 : this.width /
                        16;
                })
                .style('writing-mode', (d, i) => {
                    return i == 0 ? 'vertical-lr' : 'horizontal-tb';
                })
                .classed('attentionMatrixComponent_background_text', true);
        }
    }

    rectDragEvent(i, d, nodes){
	    
	    if(this.dragEventX < d3.event.x){
		    if(d.value + 0.1 <= 1){
			    d.value += 0.1;
		    	d3.select(nodes[i])
			    .style('fill', (d)=>{
				    return this.colorbar.lookup(d.value);
			    });
		    }
	    }
	    else if(this.dragEventX > d3.event.x){
		    if(d.value - 0.1 >= 0){
			    d.value  -= 0.1;
		    	d3.select(nodes[i])
			    .style('fill', (d)=>{
				    return this.colorbar.lookup(d.value);
			    });
		    }
	    }
	    
    	    //renormalize current row.
	    let row = Math.floor(i / this.normAttention[0].length);
	    let col = i % this.normAttention[0].length;
	
	    this.normAttention[row][col] = d.value;
	    //this.aggregatedMatrix[row] = 
	    //TODO: this may be a bug if you try to renormalize the the matrix after collaspe
	    this.normAttention[row] = this.normalization(this.normAttention[row]);
	    
	    d3.selectAll(nodes).style('fill', (d, i)=>{
		    let r = Math.floor(i / this.normAttention[0].length);
		    let c = i % this.normAttention[0].length;
    
		    if(r == row){
			    d.value = this.normAttention[row][c];
		    }
		    return this.colorbar.lookup(d.value);
	    });
    }

    highlight(i){
            this.targ_dep.highlight(i);
            this.setData("highlight", i);
    }
    
    collapse(i, nodes, orientation){
    	d3.select(nodes[i])
        .classed('attentionMatrixComponent_text_normal', !
            d3.select(nodes[i]).classed(
                "attentionMatrixComponent_text_normal")
        )
        .classed(
            'attentionMatrixComponent_text_collapse', !
            d3.select(nodes[i]).classed(
                "attentionMatrixComponent_text_collapse"
            ));
	
	    if(orientation == 'vertical'){
    		    this.aggregationMatrix(i, this.targ_dep.getChild(i));
		    this.targ_dep.collapse(i);
    		
	    }else if(orientation == 'horizontal'){
		    this.src_dep.collapse(i);    
	    }
	    
	    this.collapse_Animation(orientation);
    }

    ////////////// rect mouse over event ///////////////
    rectMouseEvent(rects, targtext, srctext) {
        rects.on('mouseover', (d, i) => {

                let targWords = this.sen2words(this.data["currentPair"]
                        ["sentences"][1]),
                    col = i % targWords.length,
                    row = Math.floor(i / this.targWords.length);

                rects.style('stroke', (data, index) => {
                    if (col == index % targWords.length || row ==
                        Math.floor(index / targWords.length))
                        return 'orange';
                    else
                        return 'black';
                });

                targtext
                    .classed('attentionMatrixComponent_text_normal', (d,
                        i, nodes) => {
                        if (d3.select(nodes[i]).classed(
                                "attentionMatrixComponent_text_collapse"
                            )) return false;
                        return i == col ? false : true;
                    })
                    .classed('attentionMatrixComponent_text_highlight', (
                        d, i, nodes) => {
                        if (d3.select(nodes[i]).classed(
                                "attentionMatrixComponent_text_collapse"
                            )) return false;
                        return i == col ? true : false;
                    });

                srctext
                    .classed('attentionMatrixComponent_text_normal', (d,
                        i, nodes) => {
                        if (d3.select(nodes[i]).classed(
                                "attentionMatrixComponent_text_collapse"
                            )) return false;
                        return i == row ? false : true;
                    })
                    .classed('attentionMatrixComponent_text_highlight', (
                        d, i, nodes) => {
                        if (d3.select(nodes[i]).classed(
                                "attentionMatrixComponent_text_collapse"
                            )) return false;
                        return i == row ? true : false;
                    });

                this.targ_dep.highlight(col);
                this.src_dep.highlight(row);
            })
            .on('mouseout', (d, i) => {
                let targWords = this.sen2words(this.data["currentPair"]
                        ["sentences"][1]),
                    col = i % targWords.length,
                    row = Math.floor(i / this.targWords.length);

                targtext
                    .classed('attentionMatrixComponent_text_normal', (d,
                        i, nodes) => {
                        return d3.select(nodes[i]).classed(
                            "attentionMatrixComponent_text_collapse"
                        ) ? false : true;
                    })
                    .classed('attentionMatrixComponent_text_highlight',
                        false);

                srctext
                    .classed('attentionMatrixComponent_text_normal', (d,
                        i, nodes) => {
                        return d3.select(nodes[i]).classed(
                            "attentionMatrixComponent_text_collapse"
                        ) ? false : true;
                    })
                    .classed('attentionMatrixComponent_text_highlight',
                        false);

                rects.style('stroke', 'black');
                this.targ_dep.highlight(-1);
                this.src_dep.highlight(-1);
            });
    }

    //define each rect's width, height, x, y and color map value
    generateMatrixGeometry() {

        let attMatrix = this.aggregatedMatrix;

        let targWords = this.sen2words(this.data["currentPair"]["sentences"]
            [1]);

        let srcWords = this.sen2words(this.data["currentPair"]["sentences"]
            [0]);

        let w = this.width * 3 / 4 / (targWords.length - this.targIndexMaskSet
            .size);

        let h = this.height * 3 / 4 / (srcWords.length - this.srcIndexMaskSet
            .size);

        let attList = [];

        //init x location of visualization
        let attx = this.width * 1 / 4;

        //init y location of visualization
        let atty = this.height * 1 / 4;

        //row
        for (let i = 0; i < attMatrix.length; i++) {
            attx = this.width * 1 / 4;
            //column
            //init location, width and height value of each rect in the heatmap matrix
            for (let j = 0; j < attMatrix[i].length; j++) {
                let item = {
                    'x': attx,
                    'y': atty,
                    'value': attMatrix[i][j]
                };
                if (!this.srcIndexMaskSet.has(i) && !this.targIndexMaskSet.has(
                        j)) {
                    item['width'] = w;
                    item['height'] = h;
                    attx += w;
                } else {
                    item['width'] = 0;
                    item['height'] = 0;
                }
                attList.push(item);
            }

            //if current row is not filtered
            if (!this.srcIndexMaskSet.has(i)) {
                atty += h;
            }
        }

        return attList;
    }

    //define each text font x, y, and font-size base on whether they are filtered
    generateTextGeometry() {

        let srcText = [];

        let srcWords = this.sen2words(this.data["currentPair"]["sentences"]
            [0]);

        let h = (this.height * 0.75) / (srcWords.length - this.srcIndexMaskSet
            .size);

        let text_loc = h / 2 + this.height / 4;
        for (let i = 0; i < srcWords.length; i++) {
            let item = {};

            item['x'] = this.width * 1 / 4 - this.margin.left * 3;

            item['y'] = text_loc;

            item['text'] = srcWords[i];

            if (!this.srcIndexMaskSet.has(i)) {
                item['display'] = 'block';
                text_loc += h;
            } else {
                item['display'] = 'none';
            }
            srcText.push(item);
        }

        let targText = [];

        let targWords = this.sen2words(this.data["currentPair"]["sentences"]
            [1]);

        let w = (this.width * 0.75) / (targWords.length - this.targIndexMaskSet
            .size);

        text_loc = w / 2 + this.width / 4;
        for (let i = 0; i < targWords.length; i++) {
            let item = {};

            item['x'] = text_loc;

            item['y'] = this.height * 1 / 4 - this.margin.top * 3;

            item['text'] = targWords[i];

            if (!this.targIndexMaskSet.has(i)) {
                item['display'] = 'block';
                text_loc += w;
            } else {
                item['display'] = 'none';

            }
            targText.push(item);
        }

        return {
            'src': srcText,
            'targ': targText
        };

    }

    collapse_Animation(direction) {

        //////////////////// rect animation ////////////////////
        let attMatrix = this.generateMatrixGeometry();

        let rects = d3.selectAll('.attentionComponent_matrix_rect').data(
            attMatrix);

        rects.exit().remove();

        rects.append('rect');

        //if(direction == 'horizontal'){
        rects
            .transition()
            .duration(1000)
            .attr('x', (d, i) => {
                return d.x;
            })
            .attr('y', (d, i) => {
                return direction == 'vertical' && d.height == 0 ? this.height /
                    4 : d.y;
            })
            .attr('width', (d) => {
                return d.width;
            })
            .attr('height', (d) => {
                return d.height;
            })
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
            .duration(1000)
            .attr('x', (d, i) => d.x)
            .attr("y", (d, i) => d.y)
            .attr("display", (d) => d['display']);

        /////////////////  targ text animation ///////////////////
        let targtext = this.svg.selectAll('.attentionComponent_targWords')
            .data(texts.targ);

        targtext.exit().remove();
        targtext.append('text');

        targtext
            .transition()
            .duration(1000)
            .attr('x', (d, i) => d.x)
            .attr("y", (d, i) => d.y)
            .attr("transform", (d, i) => {
                return "rotate(-45, " + d.x + ' , ' + d.y + ')';
            })
            .attr("display", (d) => d['display']);


        ///////////////// dependency tree animation ///////////////////
        this.srcWords = this.collapSenBySet(this.sen2words(this.data[
            "currentPair"]["sentences"][0]), this.srcIndexMaskSet);
        this.targWords = this.collapSenBySet(this.sen2words(this.data[
            "currentPair"]["sentences"][1]), this.targIndexMaskSet);
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
            if (this.src_dep === undefined) {

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
            if (this.targ_dep === undefined) {

                // if (this.targ_dep)
                //     this.targ_dep.clear();
                this.targ_dep = new dependencyTreePlot(this.svg, 'h-top',
                    this.targWords, this.targPos, this.targDepTreeData,
                    this.width, this.height);
                this.targ_dep.setCollapseHandle(this.collapseTarget.bind(
                    this));

            } else {
                // this.targ_dep.setData(this.targDepTreeData);
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
