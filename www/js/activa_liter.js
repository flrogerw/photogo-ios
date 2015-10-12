$(document).ready(function() {

	$("a.order_history").click(function(event) {
		event.preventDefault();
		var record_id = $(this).attr('href');
		$("#list").empty();
		getSingleHistory(record_id);
	});

});

function getSingleHistory(record_id) {

	$.ajax({
		type : "POST",
		url : "single_history.php",
		dataType : "json",
		data : {
			record_id : record_id
		},
		success : function(data) {

			images = jQuery.parseJSON(data.order_string);

			for (i in images) {

				createHistoryCanvas(i);
			}
		}
	});
}

function createHistoryCanvas(image_id) {

	images[image_id].image = new Image();
	images[image_id].image.src = images[image_id].location;

	images[image_id].image.onload = function() {
		
		current_mask_image = new Image();

		images[image_id].plot_width = images[image_id].width;
		images[image_id].plot_height = images[image_id].height;
		current_image = images[image_id];
		current_image.is_dragable = false;
		current_image_id = image_id;

		createImageContainer( image_id, false );
		setImageParams();
		drawRotated();

	}

	
}