let attention_src_filter_node = [];
let attention_targ_filter_node = [];
let aggregation_src = {}
let aggregation_targ = {}

let attention_para = null;


let rectw = 50;
let recth = 30;
let canvas = d3.select('#canvas').append('svg').attr('width', 3000).attr('height', 3000);
let div = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);


bindingEvent();
load_sentences(INIT);
/*
fetch all possible sentence in the server side.
**/
function INIT(para){
	let s_sens = para.source,
	t_sens = para.target;
	
	//source option
	let source_string_buffer = '';
	s_sens.forEach(d=>{
		source_string_buffer += '<option>'+d+'</option>';
	});
	$('#source_sentences').html(source_string_buffer);
	
	//target option
	let target_string_buffer = '';
	t_sens.forEach(d=>{
		target_string_buffer += '<option>'+d+'</option>';
	});
	$('#target_sentences').html(target_string_buffer);
	
	load_data({'index':0, 'source':s_sens[0], 'target':t_sens[0]}, resetData);
}

function draw_attention_matrix(x, y, matrix, row, col){
	let width = col * rectw,
	height = row * recth,
	colorscale = d3.interpolateRdBu;
	
	//maxtrix render
	canvas.append('g').selectAll('.attentionMatrixRect')
	.data(matrix)
	.enter()
	.append('rect')
	.attr('x', (d, i)=>{
		return x + i % col * rectw;
	})
	.attr('y', (d, i)=>{
		return y + Math.floor(i / col) * recth;
	})
	.attr('width', rectw)
	.attr('height', recth)
	.style('stroke', 'black')
	.style('stroke-width', '1px')
	.style('fill', d=>{return colorscale(1 - d)});
	
	//color scale map
	linearGradient = canvas.append('defs').append('linearGradient')
	.attr('id', 'attention_heatmap_gradient')
	.attr('x1', '0%')
	.attr('y1', '0%')
	.attr('x2', '0%')
	.attr('y2', '100%');
	
	//color gradient break point
	for(let i = 0; i <= 10; i++){
		linearGradient.append('stop')
		.attr('offset', (i * 10) + '%')
		.attr('stop-color', colorscale(i/10));
	}
	
	linearGradient.append('stop')
	.attr('offset', '100%')
	.attr('stop-color', colorscale(1));
	
	//render color scale map
	canvas.append('rect')
	.attr('x', x + (col + 1) * rectw)
	.attr('y', y)
	.attr('width', 30)
	.attr('height', row * recth)
	.style('fill', 'url(#attention_heatmap_gradient)');
	
	//render color bar text
	canvas.selectAll('.colorscalebartext').append('g').data([1, 0]).enter()
	.append('text')
	.attr('x', x + (col + 2) * rectw)	
	.attr('y', (d,i)=>{
		return i==0 ? y: y + recth * row ; 
	})
	.text(d=>{return d;})
	.attr('text-anchor', 'middle')
	.attr('dominant-baseline', 'central')
	.style('font-size', 14);
}



function draw_sentence_tree(x, y, node, hOrv, depth, tree_width=0, tree_height=0){
	
	//whether the current node is leaf
	if(typeof(node) == 'string'){
		//render node
		canvas.selectAll('.treenode').data([node]).enter().append('rect')
		.attr('x', d=>{return hOrv?x:tree_width - rectw;})
		.attr('y', hOrv?tree_height - recth:y)
		.attr('rx', 5)
		.attr('ry', 5)
		.attr('width', rectw)
		.attr('height', recth)
		.style('fill','white')
		.style('stroke','gray')
		.style('stroke-width', 1);
		
		canvas.selectAll('.treenode_text').data([node]).enter().append('text')
		.text(d=>{return d;})
		.attr('x', d=>{return hOrv?x + rectw/2:tree_width-rectw/2;})
		.attr('y', hOrv?tree_height-recth/2:y + recth /2)
		.attr('text-anchor', 'middle')
		.attr('dominant-baseline', 'central')
		.style('font-size', 12);
		
		return hOrv?{'w':rectw,'key':node}:{'h':recth,'key':node};//true is horizontal false is vertical
	}
	else{
		let key = Object.keys(node);
		
		var lineFunction = d3.line()
    	    	.x(function(d) { return d[0]; })
    	    	.y(function(d) { return d[1]; });
		
		//horizontal tree
		if(hOrv){
			//whether current node is filtered
			let flag = attention_src_filter_node.indexOf(key + depth) == -1,
			w = flag?0:rectw;//if the node is filter, stop draw the child node and w set 60
			
			//draw child node
			let child_position = [];
			let cur_t={'w':w, 'key':''};
			let id = depth
			//node is not filtered
			if(flag){
				for(let i = 0; i < node[key].length; i++){
					sub_t = draw_sentence_tree(x + w, y+recth, node[key][i], hOrv, ++depth, tree_width, tree_height);
					if(typeof(node[key][i]) == 'string')
						child_position.push([x + w + sub_t.w/2, tree_height-recth]);
					else
						child_position.push([x + w + sub_t.w/2, y+recth]);
					w += sub_t.w;
					cur_t.key += sub_t.key+' ';
				}
				cur_t.w = w;
			}
			//node is filtered
			else{
				//TODO:get the representitive leaf and plot it
				let rs = getRepresentative_leaf(node, hOrv);
				cur_t.key = rs.rep;
				draw_sentence_tree(x, y+recth, rs.key, hOrv, depth, tree_width, tree_height);
				child_position.push([x + rectw/2, tree_height - recth]);
				//depth += count_tree_nodes(node);
			}
			
			//TODO: generate the path between parents node and child node
			for(let i = 0; i < child_position.length; i++){
				let path = []
				path.push([x+w/2, y+recth/2]);
				path.push(child_position[i]);
				
				canvas.append('path')
				.attr("d", lineFunction(path))
				.attr("stroke", "steelblue")
				.attr("stroke-width", 2)
				.attr("fill", "none");
			}
			
			//draw node
			canvas.selectAll('.treenode').data([[key, cur_t.key, id]]).enter().append('circle')
			.attr('cx', (d, i)=>{return x + w/2})
			.attr('cy', y+recth/2)
			.attr('r', recth/2)
			.style('fill', flag?'white':'steelblue')
			.style('stroke', 'gray')
			.style('stroke-width', 1)
			.on('mouseover', d=>{
				if(!flag){
					div.transition()
			                .duration(200)
			                .style("opacity", .9);
			              	div.html(d[1])
			                .style("left", (d3.event.pageX) + "px")
			                .style("top", (d3.event.pageY - 28) + "px");
			              
				}
			})
			.on('mouseout', d=>{
		       	 	div.transition()
		                .duration(500)
		                .style("opacity", 0);
			})
			.on('click', d=>{
				let index = attention_src_filter_node.indexOf(d[0]+d[2]);
				if(index > -1){
					attention_src_filter_node.splice(index,1);
					delete aggregation_src[d[0]+d[2]];
				}else{
					attention_src_filter_node.push(d[0]+d[2]);
					aggregation_src[d[0]+d[2]] = d[1];
				}
				update();
			});
			
			//text
			canvas.selectAll('.treenode_text').data([key]).enter().append('text')
			.text(d=>{return d;})
			.attr('x', (d, i)=>{return x + w/2})
			.attr('y', y + recth / 2)
	        	.attr("text-anchor", "middle")
	        	.attr("dominant-baseline", "central")
	        	.style('font-size', 12)
			.style('pointer-events', 'none');;
			
			//return the horizontal space this node take
			return cur_t;
		}
		else{
			//whether current node is filtered
			let flag = attention_targ_filter_node.indexOf(key+depth) == -1,
			h = flag?0:recth;//if the node is filter, stop draw the child node and h set 30
			let child_position = [];
			let cur_t={'h':h, 'key':''};
			let id = depth;
			
			//node is not filtered
			if(flag){
				for(let i = 0; i < node[key].length; i++){
					sub_t = draw_sentence_tree(x + rectw, y + h, node[key][i], hOrv, ++depth, tree_width, tree_height);
					
					if(typeof(node[key][i]) == 'string')
						child_position.push([tree_width-rectw, y + sub_t.h/2 + h]);
					else
						child_position.push([x + rectw + 10, y + sub_t.h/2 + h]);
					
					h += sub_t.h;
					cur_t.key += sub_t.key+' ';
				}
				cur_t.h = h;
			}
			//node is filtered
			else{
				//TODO:get the representitive leaf and plot it
				let rs = getRepresentative_leaf(node, hOrv);
				cur_t.key = rs.rep;
				draw_sentence_tree(x + rectw, y, rs.key, hOrv, depth, tree_width, tree_height);
				child_position.push([tree_width-rectw, y+recth/2]);
				//depth += count_tree_nodes(node);
			}
			
			//TODO: generate the path between parents node and child node
			for(let i = 0; i < child_position.length; i++){
				let path = []
				path.push([x + rectw/2, y + h/2]);
				path.push(child_position[i]);
				
				canvas.append('path')
				.attr("d", lineFunction(path))
				.attr("stroke", "steelblue")
				.attr("stroke-width", 2)
				.attr("fill", "none");
			}
			//node
			canvas.selectAll('.treenode').data([[key, cur_t.key, id]]).enter().append('circle')
			.attr('cx', (d, i)=>{return x + rectw/2})
			.attr('cy', y+h/2)
			.attr('r', recth/2)
			.style('fill', flag?'white':'steelblue')
			.style('stroke', 'gray')
			.style('stroke-width', 1)
			.on('mouseover', d=>{
				if(!flag){
					div.transition()
			                .duration(200)
			                .style("opacity", .9);
			              	div.html(d[1])
			                .style("left", (d3.event.pageX) + "px")
			                .style("top", (d3.event.pageY - 28) + "px");
			              
				}
			})
			.on('mouseout', d=>{
		       	 	div.transition()
		                .duration(500)
		                .style("opacity", 0);
			})
			.on('click', d=>{
				let index = attention_targ_filter_node.indexOf(d[0]+d[2])
				if(index >-1){
					
					attention_targ_filter_node.splice(index, 1);
					delete aggregation_targ[d[0]+d[2]];
				}else{
					attention_targ_filter_node.push(d[0]+d[2]);
					aggregation_targ[d[0]+d[2]] = d[1];
				}
				update();
			});
			
			canvas.selectAll('.treenode_text').data([key]).enter().append('text')
			.text(d=>{return d;})
			.attr('x', (d, i)=>{return x + rectw/2})
			.attr('y', y + h/2)
        		.attr("text-anchor", "middle")
        		.attr("dominant-baseline", "central")
        		.style('font-size', 12)
			.style('pointer-events', 'none');
			
			return cur_t;
		}
	}
	
	
}

function draw_dep_tree(x, y, sen, sen_dep_tree, horv){
	
	//location of text
	let text_loc = {};
	
	
	for(let i = 0; i < sen.length; i++){
		if(horv=='h'){
			text_loc[sen[i]+i] = {'x': x + i * rectw, 'y': y};
		}else if(horv=='v'){
			text_loc[sen[i]+i] = {'x': x, 'y': y + recth * i};
		}else{
			throw Error('unknow confi. in draw_dep_tree');
		}
	}
	
	
	//text
	canvas.selectAll('.dep_tree_word').data(sen).enter()
	.append('text')
	.text(function(d){return d;})
	.attr('x', function(d, i){return text_loc[d+i].x;})
	.attr('y', function(d, i){return text_loc[d+i].y;})
	.attr('text-anchor', 'middle')
	.attr('dominant-baseline', 'central')
	.style('font-size', 12);
	
	//path
	let lineFunction = d3.svg.line()
	.x(function(d){ return d.x;})
	.y(function(d){ return d.y;})
	..curve(d3.curveBasis);
	
	canvas.selectAll('.dep_tree_dep_path').data(sen_dep_tree).enter()
	.append('path')
	.attr('d', function(d, i){
		
	});
	
	
	//component rect
	
	
	//component text
	
	
}



function resetData(para){
	attention_para = para;
	update();
}

function update(){
	Render(attention_para);
}

function Render(para){
	//clean panel
	canvas.html('');
	let x = 200,
	y = 200;
	
	
	draw_dep_tree(x + rectw * 2.5, y, para.target, para.target_tree, 'h')
	draw_dep_tree(x, y + recth * 2.5, para.source, para.source_tree, 'v')
	
	let col = para.target.length + 1;//first row is null
	let row = para.source.length + 1;//first col is null
	
	draw_attention_matrix(x + rectw, y + recth, para.matrix, row, col);
	
	$('#result_label').html('result:'+para.label);
}

//aggregate matrix data base on current filter node
function matrixAggregation(){
	let col_filter_index = [],
	row_filter_index = [];
	
	//aggregation_targ col
	for(key in aggregation_targ){
		words = aggregation_targ[key].trim().split(' ');
		words.forEach(d=>{
			col_filter_index.push(attention_para.sen2.indexOf(d)+1)
		});
	}
	
	//aggregation_src row
	for(key in aggregation_src){
		words = aggregation_src[key].trim().split(' ');
		words.forEach(d=>{
			row_filter_index.push(attention_para.sen1.indexOf(d)+1)
		});
	}
	
	
	//getAggregateIndexs(attention_para.sen1_tree.ROOT[0], attention_src_filter_node, false, [-1], col_filter_index, 1);
	//getAggregateIndexs(attention_para.sen2_tree.ROOT[0], attention_targ_filter_node, false, [-1], row_filter_index, 1);
	
	let matrix1 = [],
	row = attention_para.sen1.length + 1,
	col = attention_para.sen2.length + 1;
	
	//aggreate col
	//aggregate strategy: take the col with cell has maximum value
	for(let i = 0; i < attention_para.matrix.length; i++){
		let index =  i % col,
		flag = false;
		
		for(let j = 0; j < col_filter_index.length; j++){
			if(index == col_filter_index[j][0]+1){//+1 skip the first null character
				let l = col_filter_index[j][1] - col_filter_index[j][0];
				matrix1.push(d3.max(attention_para.matrix.slice(i, i+l+1)));
				i += l;
				flag = true;
				break;
			}
		}
		//no aggregate element
		if(!flag)
			matrix1.push(attention_para.matrix[i]);
	}
	
	//reduce the size of col
	for(let i = 0; i < col_filter_index.length; i++){
		let l = col_filter_index[i][1] - col_filter_index[i][0];
		col -= l;
	}
	
	let matrix=[]
	//aggregate row
	for(let i = 0; i < matrix1.length; i++){
		let index = Math.floor(i / col),
		flag = false;
		
		
		for(let j = 0; j < row_filter_index.length; j++){
			if(index == row_filter_index[j][0] + 1){//+1 skip the first null character
				for(let k = 0; k < col; k++){
					let temp =[];
					for(let h = index; h <= row_filter_index[j][1]; h++){
						temp.push(matrix1[i + k + (h - index) * col])
					}
					matrix.push(d3.max(temp));
				}
				i += (row_filter_index[j][1] - row_filter_index[j][0] + 1) * col - 1; 
				flag = true;
			}
			
		}
		if(!flag)
			matrix.push(matrix1[i]);
	}
	//reduce the size of row
	for(let i = 0; i < row_filter_index.length; i++){
		let l = row_filter_index[i][1] - row_filter_index[i][0];
		row -= l;
	}
	
	return [matrix, row, col];
}

function getAggregateIndexs(tree, filter_set, isAggregate, index, aggregateindex, depth){
	let key = Object.keys(tree);
	
	if(typeof(tree) == 'string'){
		index[0]++;
		if(isAggregate)
			aggregateindex.push(index[0]);
	}else{
		//aggregate all nodes under this node.
		if(filter_set.indexOf(key+depth) > -1 && !isAggregate){
			isAggregate = true;
			let indexs = []
			for(let i = 0; i < tree[key].length; i++){
				getAggregateIndexs(tree[key][i], filter_set, isAggregate, index, indexs, depth+1);
			}
			if(indexs.length > 1)
				aggregateindex.push(d3.extent(indexs));
		}
		else{
			for(let i = 0; i < tree[key].length; i++){
				getAggregateIndexs(tree[key][i], filter_set, isAggregate, index, aggregateindex, depth+1);
			}
		}
	}
}

//get the height of the tree
function getTreeHeight(node, filter_set, depth){
	let key = Object.keys(node);
	
	if(typeof(node) == 'string'){
		return depth;
	}else{
		if(filter_set.indexOf(key+depth) > -1){
			return depth;
		}else{
			let result = []
			for(let i = 0; i < node[key].length; i++){
				result.push(getTreeHeight(node[key][i], filter_set, depth+1));
			}
			return d3.max(result);
		}
	}
}

//TODO:get representitive node of the tree
function getRepresentative_leaf(node, hOrv){
	
	let leaves = tree_leaf(node);
	let index = 0;
	let col = attention_para.sen2.length + 1;
	let row = attention_para.sen1.length + 1;
	let maxvalue = -1;//all value are positive
	let maxindex = -1;
	let key ='';
	let rep ='';
	for(let i = 0; i < leaves.length; i++){
		if(hOrv){
			index = attention_para.sen2.indexOf(leaves[i]) + 1;//skip the first null char
			for(let r = 0; r < row; r++){
				if(maxvalue < attention_para.matrix[index + r * col]){
					maxvalue = attention_para.matrix[index + r * col];
					maxindex = index;
				}
			}
			key = attention_para.sen2[maxindex-1];
		}
		else{
			index = attention_para.sen1.indexOf(leaves[i]) + 1;//skip the first null char
			for(let c = 0; c < col; c++){
				if(maxvalue < attention_para.matrix[index * col + c]){
					maxvalue = attention_para.matrix[index * col + c];
					maxindex = index;
				}
			}
			key = attention_para.sen1[maxindex-1];
		}
		rep += leaves[i]+' ';
	}
	
	return {'key':key, 'rep':rep};
}

function tree_leaf(node){
	if(typeof(node) == 'string'){
		return [node];
	}else{
		let key = Object.keys(node);
		let leaves = [];
		for(let i = 0; i < node[key].length; i++){
			leaves = leaves.concat(tree_leaf(node[key][i]));
		}
		return leaves;
	}
}

function count_tree_nodes(node){
	if(typeof(node) == 'string'){
		return 1;
	}else{
		let key = Object.keys(node);
		let count = 1;
		for(let i = 0; i < node[key].length; i++){
			count += count_tree_nodes(tree_leaf(node[key][i]));
		}
		return count;
	}
}

function bindingEvent(){
	//source change event setup
	$('#source_sentences').change(function(){
		let index = $('#source_sentences option:selected').index(),
			sen1 = $('#source_sentences').val();
		
		$('#target_sentences').prop('selectedIndex', index);
		let	sen2 = $('#target_sentences').val();
		
		load_data({'index':index, 'source':sen1, 'target':sen2}, resetData);
	});

	//target change event setup
	$('#target_sentences').change(function(){
		let index = $('#target_sentences option:selected').index(),
			sen2 = $('#target_sentences').val();
		
		$('#source_sentences').prop('selectedIndex', index);
		let sen1 = $('#source_sentences').val();

		
		load_data({'index':index, 'source':sen1, 'target':sen2}, resetData);
	});
}

function load_data(json, callback){
	$.ajax({
		url:'/_getData',
		type:'POST',
		contentType:'application/json',
		data:JSON.stringify(json),
		dataType:'json',
		success:function(para){
			callback(para);
		}
	});
}

function load_sentences(callback){
	$.ajax({
		url:'/_getSentences',
		type:'POST',
		contentType:'application/json',
		dataType:'json',
		success:function(para){
			callback(para);
		}
	});
}