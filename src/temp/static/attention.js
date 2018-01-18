let attention_src_filter_node = [],
attention_targ_filter_node = [],
attention_para = null;


let rectw = 40, 
recth = 20,
canvas = d3.select('#canvas').append('svg').attr('width', 3000).attr('height', 3000);



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
	
	load_data({'index':0, 'sen1':s_sens[0], 'sen2':t_sens[0]}, resetData);
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
	.attr('x', x + (col + 1) * rectw + rectw/2)	
	.attr('y', (d,i)=>{
		return i==0 ? y - recth: y + recth * (row + 1); 
	})
	.text(d=>{return d;})
	.attr('text-anchor', 'middle')
	.attr('dominant-baseline', 'central')
	.style('font-size', 12);
}

function draw_sentence_tree(x, y, node, hOrv, depth, tree_width=0, tree_height=0){
	
	//whether the current node is leaf
	if(typeof(node) == 'string'){
		//render node
		canvas.selectAll('.treenode').data([node]).enter().append('rect')
		.attr('x', x)
		.attr('y', y)
		.attr('rx', 5)
		.attr('ry', 5)
		.attr('width', rectw)
		.attr('heigth', recth)
		.style('fill','white')
		.style('stroke','gray')
		.style('stroke-width', 1);
		
		canvas.selectAll('.treenode_text').data([node]).enter().append('text')
		.text(d=>{return d;})
		.attr('x', d=>{return hOrv?x + rectw/2:tree_width-rectw/2;})
		.attr('y', hOrv?tree_height-recth/2:y + recth /2)
		.attr('text-anchor', 'middle')
		.attr('dominant-baseline', 'central')
		.style('font-size', 10);
		
		return hOrv?rectw:recth;//true is horizontal false is vertical
	}
	else{
		let key = Object.keys(node);
		//horizontal tree
		if(hOrv){
			//whether current node is filtered
			let flag = attention_src_filter_node.indexOf(key+depth) == -1,
			w = flag?0:rectw;//if the node is filter, stop draw the child node and w set 60
			
			if(flag){
				for(let i = 0; i < node[key].length; i++)
					w += draw_sentence_tree(x + w, y+recth, node[key][i], hOrv, depth+1, tree_width, tree_height);
			}
			//node
			canvas.selectAll('.treenode').data([key]).enter().append('rect')
			.attr('x', (d, i)=>{return x + i * w})
			.attr('y', y)
			.attr('rx', 5)
			.attr('ry', 5)
			.attr('width', w)
			.attr('height', recth)
			.style('fill', flag?'white':'steelblue')
			.style('stroke', 'gray')
			.style('stroke-width', 1)
			.on('click', d=>{
				let index = attention_src_filter_node.indexOf(d+depth);
				if(index > -1){
					attention_src_filter_node.splice(index,1);
				}else{
					attention_src_filter_node.push(d+depth);
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
	        	.style('font-size', 12);
			
			//return the horizontal space this node take
			return w;
		}
		else{
			//whether current node is filtered
			let flag = attention_targ_filter_node.indexOf(key+depth) == -1,
			h = flag?0:recth;//if the node is filter, stop draw the child node and h set 30
			
			if(flag){
				for(let i = 0; i < node[key].length; i++){
					h += draw_sentence_tree(x + rectw, y + h, node[key][i], hOrv, depth+1, tree_width, tree_height);
				}
			}
			
			//node
			canvas.selectAll('.treenode').data([key]).enter().append('rect')
			.attr('x', (d, i)=>{return x + i * rectw;})
			.attr('y', y)
			.attr('rx', 5)
			.attr('ry', 5)
			.attr('width', rectw)
			.attr('height', h)
			.style('fill', flag?'white':'steelblue')
			.style("stroke", 'gray')
			.style("stroke-width", 1)
			.on('click', d=>{
				let index = attention_targ_filter_node.indexOf(d+depth)
				if(index >-1){
					attention_targ_filter_node.splice(index, 1);
				}else{
					attention_targ_filter_node.push(d+depth);
				}
				update();
			});
			
			canvas.selectAll('.treenode_text').data([key]).enter().append('text')
			.text(d=>{return d;})
			.attr('x', (d, i)=>{return x + rectw/2})
			.attr('y', y + h/2)
        		.attr("text-anchor", "middle")
        		.attr("dominant-baseline", "central")
        		.style('font-size', 12);
			
			return h;
		}
	}
	
	
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
	let x = 10,
	y = 10;
	
	[matrix, row, col] = matrixAggregation();
	
	src_tree_height = getTreeHeight(para.sen1_tree.ROOT[0], attention_src_filter_node, 1);
	targ_tree_height = getTreeHeight(para.sen2_tree.ROOT[0], attention_targ_filter_node, 1);
	
	let tree_width = x + (targ_tree_height) * rectw,
	tree_height = y + (src_tree_height) * recth;
	
	draw_sentence_tree(tree_width+rectw, y , para.sen1_tree.ROOT[0], true, 1, tree_width, tree_height);
	draw_sentence_tree(x, tree_height+recth, para.sen2_tree.ROOT[0], false, 1, tree_width, tree_height);
	draw_attention_matrix(tree_width, tree_height, matrix, row, col);
	
	$('#result_label').html('result:'+para.label);
}

//aggregate matrix data base on current filter node
function matrixAggregation(){
	let col_filter_index = [],
	row_filter_index = [];
	
	getAggregateIndexs(attention_para.sen1_tree.ROOT[0], attention_src_filter_node, false, [-1], col_filter_index, 1);
	getAggregateIndexs(attention_para.sen2_tree.ROOT[0], attention_targ_filter_node, false, [-1], row_filter_index, 1);
	
	let matrix1 = [],
	row = attention_para.sen1.length + 1,
	col = attention_para.sen2.length + 1;
	
	//aggreate col
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


function bindingEvent(){
	//source change event setup
	$('#source_sentences').change(function(){
		let index = $('#source_sentences option:selected').index(),
			sen1 = $('#source_sentences').val();
		
		$('#target_sentences').prop('selectedIndex', index);
		let	sen2 = $('#target_sentences').val();
		
		load_data({'index':index, 'sen1':sen1, 'sen2':sen2}, resetData);
	});

	//target change event setup
	$('#target_sentences').change(function(){
		let index = $('#target_sentences option:selected').index(),
			sen2 = $('#target_sentences').val();
		
		$('#source_sentences').prop('selectedIndex', index);
		let sen1 = $('#source_sentences').val();

		
		load_data({'index':index, 'sen1':sen1, 'sen2':sen2}, resetData);
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