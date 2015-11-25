var FotobarPayment = function() {
    
};

FotobarPayment.prototype.postStripeCharge = function(cc_form, order_data, debug) {
    
    return $.Deferred(function(){
                      
                      var self = this;
                      
                      Stripe.setPublishableKey(fotobarConfig.stripe_pk);
                      
                      Stripe.card.createToken(cc_form, function(status, response){
                                              
                                              if (response.error) {
                                              
                                              self.reject({
                                                          type : 'error',
                                                          text : response.error.message
                                                          });
                                              } else {
                                              
                                              var stripePost = new FotobarRest(fotobarConfig.configure.servers.api);
                                              var ccPostForm = new FormData();
                                              ccPostForm.append('stripe_token', response.id);
                                              ccPostForm.append('customer_id', order_data.identifier);//'bob@bob.com');
                                              ccPostForm.append('amount', order_data.amount); //fotobarCart.getGrandTotal());
                                              ccPostForm.append('auth_only', order_data.auth_only);
                                              ccPostForm.append('metadata', JSON.stringify({
                                                                                           tax : order_data.tax_total, //fotobarCart.getTaxTotal(),
                                                                                           location : order_data.location, //'shipped',
                                                                                           shipping : order_data.ship_total, //fotobarCart.getShippingTotal()
                                                                                           debug: order_data.debug
                                                                                           }));
                                              
                                              var stripePost = stripePost.postForm('orders', ccPostForm);
                                              stripePost.done(function(data) {
                                                              
                                                              var parsed_data = JSON.parse(data);
                                                              
                                                              if( parsed_data.error === true ){
                                                              self.reject({
                                                                          type : 'error',
                                                                          text : 'An Error Occured. Your Card was NOT Charged.'
                                                                          });
                                                              
                                                              }else{
                                                              
                                                              self.resolve(data);
                                                              }
                                                              });
                                              }				
                                              });
                      
                      });
};