/*
* This view contain 4 elements
*	1. heat-map visualization matrix
*	2. sentence1 dependency or grammar tree
*	3. sentence3 dependency or grammar tree
*	4. menu
**/

let attention_data = null;

let rectw = 50, recth = 20;//width and height of a rect

let canvas = d3.select('#canvas').append('svg').attr('width' 3000).attr('height', 3000);



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