var cartmgr = {
	container_id: '#cart_container',
	
	toggle: function () {
		$(this.container_id).slideToggle();
	},
	
	add: function(product_id, price_id) {
		$.ajax({
			url: SITE_ROOT + '/orders/add/product:' + product_id + '/priceid:' + price_id,
			type: 'POST',
			success: function( response ) {
				//alert( response );
				$('#total_product').text(response);
			}
		});
	}
}