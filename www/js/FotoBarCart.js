var FotobarCart = function(products) {
    
    this.captured = false;
    this.is_cc_charge = false;
    this.items = {};
    this.contact_info;
    this.order = {
        images : null,
        contact : null
    };
    this.products = products;
    this.tax_rate = 0;
    this.is_shipped = false;
    this.shipping_cost = 0;
    this.taxByZip = {
        ship : 0,
        pick_up : 0
    };
    this.storeInfo = {};
    
};

FotobarCart.prototype.deleteImageItems = function(imageId) {
    
    delete this.items[imageId];
};

FotobarCart.prototype.setTaxRate = function(zip_code, delivery_option) {
    
    return $.Deferred(function() {
                      
                      var self = this;
                      var currentZips = Object.keys(fotobarCart.taxByZip);
                      
                      if (currentZips.indexOf(zip_code) > -1) {
                      
                      fotobarCart.tax_rate = fotobarCart.taxByZip[zip_code];
                      fotobarCart.taxByZip[delivery_option] = zip_code;
                      self.resolve();
                      } else {
                      
                      var getAPI = new FotobarRest(fotobarConfig.configure.servers.api);
                      
                      var getTax = getAPI.getCall('getTax', {
                                                  zip_code : zip_code
                                                  });
                      
                      getTax.done(function(data) {
                                  
                                  fotobarCart.tax_rate = parseFloat(data.tax_rate).toFixed(2);
                                  fotobarCart.taxByZip[delivery_option] = zip_code;
                                  fotobarCart.taxByZip[zip_code] = fotobarCart.tax_rate;
                                  });
                      
                      getTax.always(function() {
                                    self.resolve();
                                    });
                      }
                      });
};

FotobarCart.prototype.getTaxTotal = function() {
    
    var tax_amount = (fotobarCart.getCartTotal() * fotobarCart.tax_rate);
    return (tax_amount);
};

FotobarCart.prototype.getShippingTotal = function() {
    
    var shipping_total = (fotobarCart.is_shipped !== true) ? 0
    : fotobarCart.shipping_cost;
    return (shipping_total);
};

FotobarCart.prototype.setShippingRate = function(ship_method, state) {
    
    return $.Deferred(function() {
                      var self = this;
                      
                      var getAPI = new FotobarRest(fotobarConfig.configure.servers.api);
                      
                      var getShipping = getAPI.getCall('getShipping', {
                                                       sub_total : fotobarCart.getCartTotal(),
                                                       ship_method : ship_method,
                                                       state : state,
                                                       items : fotobarCart.items
                                                       });
                      
                      getShipping.done(function(data) {
                                       
                                       fotobarCart.shipping_cost = data.shipping_cost;
                                       
                                       });
                      
                      getShipping.fail(function(data) {
                                       
                                       });
                      
                      getShipping.always(function(data) {
                                         
                                         self.resolve(data);
                                         });
                      
                      });
};

FotobarCart.prototype.getGrandTotal = function() {
    
    var total = this.getCartTotal();
    total += (this.is_shipped) ? this.getShippingTotal() : 0;
    total += this.getTaxTotal();
    
    return (total.toFixed(2));
};

FotobarCart.prototype.getCartTotal = function() {
    
    var currentTotal = 0;
    var cartDetails = this.getCartDetails();
    
    for (item in cartDetails) {
        
        currentTotal += cartDetails[item].total;
    }
    return (currentTotal);
};

FotobarCart.prototype.getItemSize = function(sku) {
    
    var current_item = this.filter(sku, this.products);
    var response = (current_item == null) ? 'ERROR' : current_item.size;
    return (response);
};

FotobarCart.prototype.getItemPrice = function(sku) {
    
    var current_item = this.filter(sku, this.products);
    var response = (current_item == null) ? 0 : current_item.price;
    return (response);
};

FotobarCart.prototype.getImageItemCount = function(sku, imageId) {
    
    if (typeof (this.items[imageId]) == 'undefined') {
        return (0);
    }
    
    var current_item = this.filter(sku, this.items[imageId]);
    var returnQuantity = (current_item == null) ? 0 : current_item.quantity;
    return (returnQuantity);
};

FotobarCart.prototype.getProduct = function(sku) {
    
    var product = this.filter(sku, this.products);
    return (product);
};

FotobarCart.prototype.getTotalItemCount = function() {
    
    var totalCount = 0;
    for (image in this.items) {
        
        this.items[image].map(function(item) {
                              
                              totalCount += item.quantity;
                              });
        
    }
    return (totalCount);
};

FotobarCart.prototype.getItemCount = function(sku) {
    
    var returnQuantity = 0;
    
    for (imageId in this.items) {
        
        var current_item = this.filter(sku, this.items[imageId]);
        returnQuantity += (current_item == null) ? 0 : current_item.quantity;
        
    }
    return (returnQuantity);
};

FotobarCart.prototype.uploadImages = function(customer_form, itemIterator) {
    
    var postAPI = new FotobarRest(fotobarConfig.configure.servers.api);
    // var orderForm = new FormData();
    var cartImageCount = Object.keys(fotobarCart.items).length;
    var nextImageId = itemIterator.shift();
    var currentUploadCount = (cartImageCount - itemIterator.length);
    
    $('#image_upload_count').html(currentUploadCount + ' of ' + cartImageCount);
    
    var current_image = fotobar.images[nextImageId].image;
    var accountFolder = fotobarConfig.tokens.key + '/'
    var postToS3 = fotobarUI.postS3(current_image.org_uri, accountFolder
                                    + current_image.name);
    
    postToS3.done(function(response) {
                  
                  if (response.responseCode >= 300) {
                  
                  fotobarCart.processOrderError(response.response, customer_form);
                  } else {
                  
                  if (itemIterator.length == 0) {
                  
                  fotobarUI.updateCheckoutProgress(75, 1);
                  
                  var imageStrings = fotobar.getImagesOrderString(Object
                                                                  .keys(fotobarCart.items));
                  
                  customer_form.items = fotobarCart.items;
                  
                  var postOrder = postAPI.postCall('postorder', {
                                                   order : customer_form,
                                                   images : imageStrings
                                                   });
                  
                  postOrder.done(function(data) {
                                 
                                 fotobar.deleteCurrentImages();
                                 fotobarCart.items = {};
                                 fotobarUI.slider_index = 0;
                                 fotobarUI.updateCheckoutProgress(100, 2);
                                 setTimeout(function() {
                                            fotobarUI.renderThankyouView();
                                            fotobarUI.alertUser({
                                                                type : 'success',
                                                                text : 'Your order is complete.'
                                                                });
                                            }, 1000);
                                 });
                  
                  postOrder.fail(function(err) {
                                 fotobarUI.alertUser({
                                                     type : 'error',
                                                     text : err
                                                     });
                                 });
                  
                  } else {
                  
                  fotobarCart.uploadImages(customer_form, itemIterator);
                  }
                  }
                  });
    
    postToS3.fail(function(err) {
                  
                  fotobarUI.alertUser({
                                      type : 'error',
                                      text : 'Could not post to the Server'
                                      });
                  });
};

FotobarCart.prototype.processOrder = function(customer_form, cc_form) {
    
    $("#dialog").show();
    $('#dialog').center();
    $(window).scroll(function() {
                     $('#dialog').center();
                     });
    
    var pickup_option = $("input[name=delivery_options]:checked").val();
    pickup_option = (pickup_option == 'ship') ? 'shipped' : $(
                                                              "#location_select option:selected").text();
    
    setTimeout(function() {
               
               var itemIterator = Object.keys(fotobarCart.items);
               var pingServer = fotobarConfig.pingServer();
               pingServer.done(function() {
                               
                               if (fotobarCart.is_cc_charge) {
                               
                               var payment = new FotobarPayment();
                               var order_data = {
                               identifier : customer_form.email,
                               amount : fotobarCart.getGrandTotal(),
                               tax_total : fotobarCart.getTaxTotal(),
                               location : pickup_option,
                               ship_total : fotobarCart.getShippingTotal(),
                               //auth_only : (pickup_option == 'shipped') ? true : false
                               auth_only : false
                               };
                               
                               var getCharge = payment.postStripeCharge(cc_form, order_data);
                               getCharge.done(function(data) {
                                              
                                              var stripeCharge = JSON.parse(data);
                                              customer_form.stripe_token = stripeCharge.message
                                              fotobarUI.updateCheckoutProgress(25, 0);
                                              fotobarCart.uploadImages(customer_form, itemIterator);
                                              });
                               
                               getCharge.fail(function(error) {
                                              
                                              fotobarUI.alertUser(error);
                                              $("#dialog").hide();
                                              });
                               
                               } else {
                               
                               fotobarUI.updateCheckoutProgress(25, 0);
                               fotobarCart.uploadImages(customer_form, itemIterator);
                               
                               }
                               });
               
               pingServer.fail(function(err) {
                               
                               fotobarCart.processOrderError(err, customer_form);
                               });
               
               }, 1000);
    
};

FotobarCart.prototype.processOrderError = function(err, customer_form) {
    
    fotobarUI.renderCheckoutView();
    
    $('input', customer_form).each(function() {
                                   $('#' + $(this).attr('id')).val($(this).val());
                                   });
    
    $('select', customer_form).each(
                                    function() {
                                    $(
                                      '#' + $(this).attr('id') + ' option[value='
                                      + $(this).val() + ']').prop('selected', true);
                                    });
    
    fotobarUI.alertUser({
                        type : 'error',
                        text : 'Could not process your order at this time.'
                        });
};

FotobarCart.prototype.getCartDetailsDisplay = function() {
    
    var itemsCount = {};
    var cartDetails = [];
    
    for (imageId in this.items) {
        
        if (this.items[imageId].length > 0) {
            
            var imageCart = this.items[imageId];
            var cart_display = [];
            
            for (item in imageCart) {
                
                var productInfo = this.filter(imageCart[item].sku,
                                              this.products);
                cart_display.push(imageCart[item].quantity + ' '
                                  + productInfo.name);
                
                if (itemsCount[productInfo.name] == null) {
                    itemsCount[productInfo.name] = {
                        quantity : 0,
                        total : 0
                    }
                }
                itemsCount[productInfo.name].quantity += imageCart[item].quantity;
                itemsCount[productInfo.name].total += (productInfo.price * imageCart[item].quantity);
                itemsCount[productInfo.name].price = productInfo.price;
                
            }
        }
    }
    
    var indexes = Object.keys(itemsCount);
    for (i in indexes) {
        var imageDetail = {};
        imageDetail.quantity = itemsCount[indexes[i]].quantity;
        imageDetail.price = itemsCount[indexes[i]].price;
        imageDetail.text = indexes[i];
        imageDetail.total = itemsCount[indexes[i]].total;
        cartDetails.push(imageDetail);
    }
    return (cartDetails);
};

FotobarCart.prototype.sortCartDetails = function(property) {
    var sortOrder = 1;
    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function(a, b) {
        var result = (a[property] < b[property]) ? -1
        : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
};

FotobarCart.prototype.getCartDetails = function() {
    
    var cartDetails = [];
    
    for (imageId in this.items) {
        
        if (this.items[imageId].length > 0) {
            
            var imageCart = this.items[imageId];
            var cart_display = [];
            var imageDetail = {};
            var lineItemTotal = 0;
            
            // imageDetail.image = fotobar.images[imageId].image.src;
            
            for (item in imageCart) {
                
                var productInfo = fotobarCart.filter(imageCart[item].sku,
                                                     fotobarCart.products);
                
                cart_display.push(imageCart[item].quantity + ' '
                                  + productInfo.name);
                
                lineItemTotal = lineItemTotal
                + (productInfo.price * imageCart[item].quantity);
            }
            
            imageDetail.text = cart_display.join(', ')
            imageDetail.total = lineItemTotal;
            cartDetails.push(imageDetail);
        }
    }
    
    return (cartDetails);
};

FotobarCart.prototype.filter = function(sku, haystack) {
    
    var item = haystack.filter(function(obj) {
                               return obj.sku === sku;
                               })[0];
    
    return (item);
};

/*
 * FotobarCart.prototype.filterTaxState = function(state) {
 * 
 * var item = fotobarConfig.locations.filter(function(obj) { return obj.state
 * === state; })[0];
 *  };
 */

FotobarCart.prototype.updateQuantity = function(itemSku, itemQuantity, imageId) {
    
    // var imageId = fotobarUI.current_image.id;
    
    if (typeof (this.items[imageId]) == 'undefined') {
        
        this.items[imageId] = [];
    }
    
    var current_item = this.filter(itemSku, this.items[imageId]);
    
    if (current_item == null) {
        
        current_item = {
            sku : itemSku,
            quantity : 0,
            shipped : false
        }
        this.items[imageId].push(current_item);
    }
    
    current_item.quantity += itemQuantity;
    
    if (current_item.quantity < 1) {
        
        this.items[imageId]
        .splice(this.items[imageId].indexOf(current_item), 1);
    }
};

FotobarCart.prototype.validateCart = function() {
    
    var inValid = [];
    var processed = []
    
    for (image in this.items) {
        
        this.items[image]
        .map(function(item) {
             
             var product = fotobarCart.getProduct(item.sku);
             var itemCount = fotobarCart.getItemCount(item.sku);
             var totalItemCount = fotobarCart.getTotalItemCount();
             // var text = product.name + " requires a minimum of
             // "+product.minQty+" total to checkout. ";
             var text = "Order does not meet minimum total of<br>6 Original size or 1 Medium/Large.";
             
             if (itemCount < product.minQty) {
             
             if (product.minQty > 0 && product.minOverride
                 // && itemCount < product.minQty
                 && totalItemCount <= itemCount) {
             
             if (processed.indexOf(product.name) == -1) {
             inValid.push({
                          type : 'error',
                          text : text
                          });
             processed.push(product.name);
             }
             } else if (!product.minOverride) {
             
             if (processed.indexOf(product.name) == -1) {
             
             inValid.push({
                          type : 'error',
                          text : text
                          });
             processed.push(product.name);
             }
             }
             
             }
             });
    }
    
    var outcome = (inValid.length > 0) ? inValid : true;
    return (outcome);
};