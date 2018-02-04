/*

add dependencyTreePlot to an existing svg
*/

class dependencyTreePlot {
	
        //pos: The index position
	//width: The width of sentence
	//heigth: The height of sentence 
    constructor(svg, orientation, pos, dep_triples, width, height) {
        this.svg = svg;
        this.orientation = orientation;
	this.pos = pos;
	this.dep_triples = dep_triples;
	this.width = width;
	this.heigth = height;
	
	//text box width and height
	this.text_box_width = 15;
	this.text_box_height = 10;
	
	this.draw();
    }

    setCollapseHandle(func) {
        this.callback = func;
    }

    onHandleCollapse() {
        this.callback(this.sentenceMask); //[1,0,0,1]
    }

    //draw the dependency tree over sentence
    draw() {
    	
	//arrow
        this.svg.append("svg:defs")
        .append("svg:marker")
	.attr("id", "arrow")
	.attr('viewBox', '0 0 10 10')
        .attr("refX", 1)
        .attr("refY", 5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M 0 0 L 10 5 L 0 10 z")
        .style('fill', 'steelblue');

	//line function
        let lineFunction = d3.line()
        .x(function(d) {
                return d.x;
        })
    	.y(function(d) {
                return d.y;
        })
    	.curve(d3.curveLinear);

	//path
	let path_loc = this.pathLocation();
        this.svg.selectAll('.dep_tree_dep_path').data(path_loc)
	.enter()
        .append('path')
        .attr('d', function(d){
		return lineFunction(d);
	})
    	.attr("fill", "none")
    	.attr("stroke", "gray")
	.attr("stroke-opacity", 0.5)
    	.attr("stroke-linejoin", "round")
    	.attr("stroke-linecap", "round")
    	.attr("stroke-width", 1.5)
    	.style("stroke-dasharray", "4,4")
    	.style("marker-end", "url(#arrow)");

        //component rect
	let text_loc = this.textLocation();
	
	//text background rect
        /*this.svg.selectAll('.dep_tree_rel_rect').data(text_loc).enter()
    	.append('rect')
    	.attr('width', this.text_box_width)
    	.attr('height', this.text_box_height)
    	.attr('rx', 2)
    	.attr('ry', 2)
    	.attr('x', function(d, i) {
        	return d.x;
    	})
    	.attr('y', function(d, i) {
        	return d.y;
    	})
    	.attr('class', function(d, i) {
                //let word = sen[d[0]];
                //return word + '_' + d[0] + '_rect';
    	})
    	.attr('font-size', 8)
    	.attr('fill', 'white')
    	.style('stroke', 'gray')
    	.style('stroke-width', '1px');*/
	
        //component text
        this.svg.selectAll('.dep_tree_rel_text').data(text_loc)
	.enter()
    	.append('text')
    	.text(function(d) {
                return d.text;
    	})
    	.attr('x', function(d, i) {
        	return d.x;
    	})
    	.attr('y', function(d, i) {
                return d.y;
    	})
    	.attr('font-size', 8)
    	.attr("text-anchor", "middle")
    	.attr("dominant-baseline", "central");
	
	

        
    }
    
    textLocation(){
	let data = [];
    	for(let i = 0; i < this.dep_triples.length; i++){
		let d = this.dep_triples[i],
		word1_loc = this.pos[d[0]],
	        word2_loc = this.pos[d[2]],
		item = {'text':d[1]};

		 
	        if (this.orientation == 'h-top') {
			item['x'] = (word1_loc.x + word2_loc.x) / 2;
			item['y'] = word1_loc.y - Math.abs(d[0] - d[2]) * this.text_box_height - this.text_box_height * 1.5;
	        } 
		else if(this.orientation == 'v-left') {
			item['x'] = word1_loc.x - Math.abs(d[0] - d[2]) * this.text_box_width - this.text_box_width * 1.5;
	        	item['y'] = (word1_loc.y + word2_loc.y) / 2;
		}  
		data.push(item)
	}
	return data;
    }

    pathLocation(){
	    let data = [];
	    
	    for(let i = 0; i < this.dep_triples.length; i++){
		let d = this.dep_triples[i],
		word1_loc = this.pos[d[0]],
        	word2_loc = this.pos[d[2]],
		item = [];

           	if (this.orientation == 'h-top') {
                	//first point
                	item.push({
                		'x':word1_loc.x,
				'y':word1_loc.y - this.text_box_height * 1.5
                	});
                	//second point
                	item.push({
                		'x': word1_loc.x * 5 / 6 + word2_loc.x * 1 / 6,
				'y': word1_loc.y - Math.abs(d[0]-d[2]) * this.text_box_height - this.text_box_height * 1.5
               	 	});
                	//third point
               	 	item.push({
               		 	'x': word1_loc.x * 1 / 6 + word2_loc.x * 5 / 6,
                    	        'y': word1_loc.y - Math.abs(d[0]-d[2]) * this.text_box_height - this.text_box_height * 1.5
                	});
                	//fourth point
               	 	item.push({
               	 		'x':word2_loc.x,
				'y':word2_loc.y - this.text_box_height * 1.5
               	 	});
       	   	}
		else if(this.orientation == 'v-left') {
                	//first point
                	item.push({
                		'x':word1_loc.x - this.text_box_width * 1.5,
				'y':word1_loc.y
                	});
                	//second point
                	item.push({
                		'x': word1_loc.x - Math.abs(d[0] - d[2]) * this.text_box_width - this.text_box_width * 1.5,
               		 	'y': word1_loc.y * 5 / 6 + word2_loc.y * 1 / 6
               	 	});
                	//third point
                	item.push({
                    	        'x': word1_loc.x - Math.abs(d[0] - d[2]) * this.text_box_width - this.text_box_width * 1.5, 
                    	        'y': word1_loc.y * 1 / 6 + word2_loc.y * 5 / 6
                	});
                	//fourth point
                	item.push({
                		'x':word2_loc.x - this.text_box_width * 1.5,
				'y':word2_loc.y
                	});
            	}
		else
			throw Error('unknow orientation');
		
		data.push(item);
	    }
	    return data;
    }
}
