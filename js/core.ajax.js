function adCounter( ad_url, ads_id)
{
	window.open(ad_url);
	var url = SITE_ROOT + "/ads/counter/" + ads_id;
	$.post( url );
}

function sendComment() {
	
	var data = {product_id: null, fullname: null, rated: null, comment: null};
	
	data.product_id  = $('#hdProductID').val();
	data.fullname 	= $('#txtFullname').val();
	data.rated 		= $('#dlRated').val();
	data.comment 	= $('#txtContent').val();
	
	$.ajax({
		url: SITE_ROOT+'/products/saveComment/',
		data: data,
		type: 'POST',
		
		success: function( response ) {
			//alert('comment saved!' + response );
			var rd = toJSON(response);
			if( rd.result == 'true' )
			{
				alert(rd.msg);
				$('#comment-input').fadeOut();
				$('#comment-header').fadeOut();
			}
			else
			{
				alert(rd.msg);
			}
		}
	});
}