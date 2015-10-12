var FotobarUI = function() {
    
    this.current_image_id;
    this.current_canvas;
    this.current_social_media;
    this.max_text_length = 30;
    this.maxImageCount = 8;
    this.slider_index = 0;
    this.photo_limit = 1;
    // this.carousel = new FotobarCarousel();
    this.current_size;
    //this.faceBook = new FotobarFacebook();
    this.instagram = new FotobarInstagram();
    this.FbLoginStatus = null;
    this.defaultAlbumImage = 'assets/img/Alert-Icon-.png';
    
    this.thankYouTpl = Handlebars.compile($("#thank_you").html());
    this.homeTpl = Handlebars.compile($("#home-tpl").html());
    this.imageEditTpl = Handlebars.compile($("#image-edit").html());
    this.imagePreviewTpl = Handlebars.compile($("#image-preview").html());
    this.imageSourceTpl = Handlebars.compile($("#image-source").html());
    this.checkOutTpl = Handlebars.compile($("#checkout").html());
    this.imageDisplayTpl = Handlebars.compile($("#image-display").html());
    this.albumDisplayTpl = Handlebars.compile($("#album-display").html());
    
    Handlebars.registerHelper("getPrice", function(sku) {
                              return fotobarCart.getItemPrice(sku);
                              });
    
    Handlebars.registerHelper("getSize", function(sku) {
                              return fotobarCart.getItemSize(sku);
                              });
    Handlebars.registerHelper("getQuantity", function(sku) {
                              return fotobarCart.getItemCount(sku);
                              });
    Handlebars.registerHelper("getCart", function() {
                              return fotobarCart.getGrandTotal();
                              });
    // alert(document.location.pathname);
    $.get("js/partials/states_select.hbs", function(data) {
          Handlebars.registerPartial("states_select", data);
          });
    
    //this.faceBook.getStatus();
    // this.faceBook.logout();
};

/*******************************************************************************
 * IMAGES
 */
FotobarUI.prototype.getNextImage = function(ev_type) {
    
    switch (ev_type) {
            
        case ('swipeleft'):
            
            if ((fotobarUI.slider_index + 1) < fotobar.imageCount()) {
                fotobarUI.slider_index++;
            } else {
                fotobarUI.slider_index = 0;
            }
            break;
        default:
            
            if (fotobarUI.slider_index == 0) {
                fotobarUI.slider_index = (fotobar.imageCount() - 1);
            } else {
                fotobarUI.slider_index--;
            }
            break;
    }
    
};

FotobarUI.prototype.showNextImage = function(ev_type) {
    
    var imageArray = Object.keys(fotobar.images);
    
    switch (ev_type) {
            
        case ('swipeleft'):
            
            $("#container_" + imageArray[fotobarUI.slider_index]).hide('slide', {
                                                                       direction : 'left'
                                                                       }, 300);
            
            fotobarUI.getNextImage(ev_type);
            
            $("#container_" + imageArray[fotobarUI.slider_index]).show('slide', {
                                                                       direction : 'right'
                                                                       }, 300);
            
            break;
            
        case ('swiperight'):
            
            $("#container_" + imageArray[fotobarUI.slider_index]).hide('slide', {
                                                                       direction : 'right'
                                                                       }, 300);
            
            fotobarUI.getNextImage(ev_type);
            
            $("#container_" + imageArray[fotobarUI.slider_index]).show('slide', {
                                                                       direction : 'left'
                                                                       }, 300);
            
            break;
            
        default:
            
            $("#container_" + imageArray[fotobarUI.slider_index]).show().addClass(
                                                                                  'current');
            break;
    }
    
    fotobarUI.setCurrentElements($(
                                   "#container_" + imageArray[fotobarUI.slider_index]).attr('canvas'));
    
    $("div.qty").each(
                      function() {
                      
                      var itemCount = fotobarCart.getImageItemCount($(this).attr(
                                                                                 'sku'), fotobarUI.current_image.id);
                      $(' > span', this).html(itemCount);
                      });
    
    $("div.qty-indicator[sku]").each(function() {
                                     
                                     $(this).text(fotobarCart.getItemCount($(this).attr('sku')));
                                     });
    $("#image_legend").html( (fotobarUI.slider_index + 1) + ' of ' + fotobar.imageCount());
};

FotobarUI.prototype.addGestures = function(current_canvas) {
    
    this.lastScale = 0;
    
    var vmLocation = {
        pageX : 0,
        pageY : 0
    }
    
    var gestures = new Hammer.Manager(current_canvas);
    // var pinch = new Hammer.Pinch();
    
    var swipe = new Hammer.Swipe({
                                 threshold : 5,
                                 velocity : .3
                                 });
    
    // gestures.add([ pinch, swipe ]);
    gestures.add([ swipe ]);
    
    gestures.on("swipeleft swiperight", function(ev) {
                
                fotobarUI.showNextImage(ev.type);
                // ev.gesture.stopDetect();
                });
    
    /*
     * gestures .on( "pinch", function(ev) { // Zoom if (((parseInt(ev.scale) *
     * fotobarUI.scaleFactor) % fotobarUI.zoomModulus) == 0) {
     *
     * var zoomFactor = (fotobarUI.lastScale > ev.scale) ? -fotobarUI.zoomFactor :
     * fotobarUI.zoomFactor; fotobarUI.current_image.zoom =
     * ((fotobarUI.current_image.zoom + zoomFactor) >= 1 &&
     * (fotobarUI.current_image.zoom + zoomFactor) <= fotobarUI.max_zoom) ?
     * (fotobarUI.current_image.zoom + zoomFactor) :
     * (fotobarUI.current_image.zoom);
     * fotobar.setImageCords(fotobarUI.current_image); }
     *
     * fotobarUI.lastScale = ev.scale; });
     *
     * gestures.on("pinchstart", function(ev) {
     *
     * //fotobarUI.startRedrawInterval(); });
     *
     * gestures.on("pinchend", function(ev) {
     *
     * //clearInterval(fotobarUI.intervalTimer); });
     */
};

FotobarUI.prototype.renderImages = function(imageArray) {
    
    fotobarUI.renderImageView();
    fotobarUI.redrawCurrent();
    
    $.when(fotobar.factory(imageArray)).done(function() {
                                             
                                             fotobarUI.showNextImage(null);
                                             });
};

FotobarUI.prototype.getImages = function() {
    
    var fotoselect = new FotoSelect();
    
    var max_selections = fotobarUI.getSelectCount();
    
    if (max_selections != 0) {
       
        $.when(fotoselect.getImages(fotoselect, max_selections)).done(
                                                                      function() {
                                                                      console.log('THERE');
                                                                      
                                                                      fotobarUI.renderImageView();
                                                                      fotobarUI.redrawCurrent();
                                                                      
                                                                      $.when(fotobar.factory(fotoselect.images)).done(function() {
                                                                                                                      
                                                                                                                      fotobarUI.showNextImage(null);
                                                                                                                      });
                                                                      }).fail(function() {
                                                                              fotobarUI.alertUser({
                                                                                                  type : 'error',
                                                                                                  text : 'Could not get images.'
                                                                                                  });
                                                                              }).always(function() {
                                                                                        // fotobarUI.showNextImage(null);
                                                                                        });
    } else {
        
        fotobarUI.renderImageView();
        fotobarUI.redrawCurrent();
        fotobarUI.showNextImage(null);
    }
};

FotobarUI.prototype.redrawCurrent = function() {
    
    for (currentImage in fotobar.images) {
        
        fotobarUI.initialize(fotobar.images[currentImage].image, false);
        fotobar.setImageParams(fotobar.images[currentImage]);
        
    }
    
};

FotobarUI.prototype.setPolaroidCords = function(canvas_image, imageId) {
    
    var current_image = fotobar.images[imageId];
    var top = 0;
    var left = 0;
    
    switch (true) {
            
        case (current_image.is_square):
            
            canvas_image.width = fotobar.polaroidWidth;
            canvas_image.height = fotobar.polaroidHeight;
            break;
            
        case (current_image.is_landscape || current_image.is_spectra):
            
            canvas_image.height = fotobar.polaroidHeight;
            canvas_image.width = fotobar.polaroidHeight
            * current_image.aspect_ratio;
            
            left = (current_image.is_polaroid) ? (Math
                                                  .floor((canvas_image.width - fotobar.polaroidWidth) / 2) * -1)
            : 0;
            
            break;
            
        default: // portrait
            
            canvas_image.width = fotobar.polaroidWidth;
            canvas_image.height = fotobar.polaroidWidth
            * current_image.aspect_ratio;
            
            top = (current_image.is_polaroid) ? (Math
                                                 .floor((canvas_image.height - fotobar.polaroidHeight) / 2) * -1)
            : 0;
            
            current_image.tx = 0 * -1;
            current_image.ty = top * -1;
            // this.bx = canvas_image.width;
            // this.by = canvas_image.height;
            
            break;
    }
    
    $(canvas_image).animate({
                            top : top,
                            left : left
                            }, this.formatShrink, function() {
                            
                            });
};

FotobarUI.prototype.initialize = function(image, is_new_order) {
    
    current_canvas = document.createElement("div");
    current_canvas.className = 'canvas';
    current_canvas.setAttribute('canvas', image.id);
    current_canvas.setAttribute('id', image.id);
    
    var canvas_image = document.createElement('img');
    canvas_image.setAttribute('id', 'image_' + image.id);
    canvas_image.className = image.effect;
    canvas_image.setAttribute('src', image.src);
    
    if (is_new_order) {
        this.setPolaroidCords(canvas_image, image.id);
    } else {
        canvas_image.width = fotobar.images[image.id].canvas_width * fotobar.images[image.id].zoom;
        canvas_image.height = fotobar.images[image.id].canvas_height * fotobar.images[image.id].zoom;
        canvas_image.style.marginTop = (fotobar.images[image.id].ty * -1) + 'px';
        canvas_image.style.marginLeft = (fotobar.images[image.id].tx * -1) + 'px';
    }
    current_canvas.appendChild(canvas_image);
    
    var fotodiv = document.createElement('div');
    fotodiv.className = "polaroid-picture-container polaroid-shadow";
    fotodiv.setAttribute('id', 'container_' + image.id);
    fotodiv.setAttribute('canvas', image.id);
    fotodiv.style.width = fotobar.setCanvasWidth;
    fotodiv.style.height = fotobar.setCanvasHeight;
    fotodiv.appendChild(current_canvas);
    
    fotobarUI.addGestures(fotodiv);
    
    var input_text = document.createElement('input');
    input_text.addEventListener('blur', function() {
                                fotobar.images[image.id].text = $(this).val();
                                }, false);
    input_text.className = "none";
    input_text.setAttribute("id", "text_" + image.id);
    input_text.setAttribute("placeholder", "Add Caption");
    input_text.setAttribute("type", "text");
    
    fotodiv.appendChild(input_text);
    
    $('#swipe_panels').append(fotodiv);
    
    if (fotobar.contains([ 2, 3 ], fotobar.images[image.id].format)) {
        $(input_text).hide();
    }
    $(input_text).css("top", "82%");
    $(input_text).css("width", "60%");
    $(input_text).css("margin-left", "4%");
    $(input_text).val(fotobar.images[image.id].text);
    // $(input_text).prop('disabled', true);
    
};

/** **************************************************** */
// VIEWS
FotobarUI.prototype.renderEditView = function() {
    
    $('body').html(fotobarUI.imageEditTpl());
    var canvas_image = $(fotobarUI.current_canvas).children('img');
    var current_image = fotobarUI.current_image;
    
    fotobarUI.setFormatButtons();
    
    $('#edit_image').attr('src', $(canvas_image).attr('src'));
    $('#edit_panel').width(current_image.width);
    $('#edit_panel').height(current_image.height);
    $('#edit_image').addClass(current_image.image.effect);
    // $('#edit_image').width(current_image.canvas_width);
    // $('#edit_image').height(current_image.canvas_height);
    
    $('#edit_panel').css({
                         'top' : '25vh',
                         'padding': fotobar.frame_margin.x + 'px',
                         'left' : (($(window).width() - $('#edit_panel').width()) / 2) - fotobar.frame_margin.x
                         });
    
    var picture = $('#edit_image'); // Must be already loaded or cached!
    picture.guillotine('remove');
    picture.guillotine({
                       width : current_image.width,
                       height : current_image.height,
                       init : {
                       scale : current_image.scale,
                       angle : 0,
                       x : current_image.tx,
                       y : current_image.ty
                       }
                       });
    
    $('#menu-fx div.fx').on('click', function() {
                            
                            $('#edit_image').removeClass(fotobarUI.current_image.effect);
                            fotobarUI.current_image.image.effect = '';
                            $('#edit_image').removeClass();
                            
                            if ($(this).attr('filter') != 'none') {
                            
                            fotobarUI.current_image.image.effect = $(this).attr('filter');
                            $('#edit_image').addClass($(this).attr('filter'));
                            }
                            });
    
    // Delete
    $("#delete").on("click", function() {
                    fotobarUI.deleteButtonClick();
                    });
    
    $("#menu-format div.format").on("click", function() {
                                    
                                    if ($(this).css('opacity') == 1 && !$(this).hasClass("selected")) {
                                    
                                    $('#menu-format div.format').removeClass("selected")
                                    $(this).addClass("selected");
                                    fotobarUI.frameButtonClick($(this).attr('id'));
                                    }
                                    });
    
    $('#zoom-in').on('click', function() {
                     
                     picture.guillotine('zoomIn');
                     var zoom_factor = parseInt($('div.guillotine-canvas').css('width')) / fotobarUI.current_image.canvas_width;
                     fotobarUI.updateImageCoords(picture.guillotine('getData'), zoom_factor);
                     });
    
    $('#zoom-out').on('click', function() {
                      
                      picture.guillotine('zoomOut');
                      var zoom_factor = parseInt($('div.guillotine-canvas').css('width')) / fotobarUI.current_image.canvas_width;
                      fotobarUI.updateImageCoords(picture.guillotine('getData'), zoom_factor);
                      });
    
    $('#edit_done_btn').on('click', function() {
                           
                           var zoom_factor = parseInt($('div.guillotine-canvas').css('width')) / fotobarUI.current_image.canvas_width;
                           fotobarUI.updateImageCoords(picture.guillotine('getData'), zoom_factor);
                           picture.guillotine('remove');
                           
                           fotobarUI.renderImageView();
                           fotobarUI.redrawCurrent();
                           fotobarUI.showNextImage(null);
                           });
    // SHOW WHEN CLOSE $(fotobarUI.current_canvas).css('overflow': 'hidden');
};

FotobarUI.prototype.updateImageCoords = function(imageCords, zoom_factor) {
    
    fotobarUI.current_image.tx = imageCords.x;
    fotobarUI.current_image.ty = imageCords.y;
    fotobarUI.current_image.bx = imageCords.x + imageCords.w;
    fotobarUI.current_image.by = imageCords.y + imageCords.h;
    
    fotobarUI.current_image.zoom = zoom_factor;
    fotobarUI.current_image.scale = imageCords.scale;
    
};

FotobarUI.prototype.postS3 = function(imageURI, fileName) {
    
    var deferred = $.Deferred(), ft = new FileTransfer(), options = new FileUploadOptions();
    var policyAPI = new FotobarRest(fotobarConfig.configure.servers.api);
    
    options.fileKey = "file";
    options.fileName = fileName;
    options.mimeType = "image/jpeg";
    options.chunkedMode = false;
    
    var dataObj = {
        "fileName" : fileName
    };
    var getPolicy = policyAPI.postCall('policy', dataObj);
    
    getPolicy.done(function(data) {
                   
                   options.params = {
                   "key" : fileName,
                   "AWSAccessKeyId" : data.message.awsKey,
                   "acl" : "public-read",
                   "policy" : data.message.policy,
                   "signature" : data.message.signature,
                   "Content-Type" : "image/jpeg"
                   };
                   
                   ft.upload(imageURI, "https://" + data.message.bucket
                             + ".s3.amazonaws.com/", function(e) {
                             deferred.resolve(e);
                             }, function(e) {
                             alert("Upload failed: " + JSON.stringify(e));
                             deferred.reject(e);
                             }, options);
                   });
    return deferred.promise();
};

FotobarUI.prototype.renderCheckoutView = function() {
    
    var isCartValid = fotobarCart.validateCart();
    
    if (isCartValid !== true) {
        
        fotobarUI.alertUser(isCartValid);
        return;
    }
    
    $('body').html(this.checkOutTpl({
                                    
                                    cart_details : fotobarCart.getCartDetails(),
                                    locations : fotobarConfig.configure.locations
                                    }));
    
    fotobarCart.resetCart();
    
    $('#total_with_shipping_cost, #checkout_total').html(
                                                         fotobarCart.getGrandTotal());
    
    $('#ship_state, #ship_type').on(
                                    'change',
                                    function() {
                                    
                                    if ($('#ship_state').val() == 0) {
                                    
                                    alert('Please select a state for shipping');
                                    } else {
                                    
                                    var setShipping = fotobarCart.setShippingRate($(
                                                                                    '#ship_type').val(), $('#ship_state').val());
                                    
                                    setShipping.done(function() {
                                                     $('#total_with_shipping_cost, #checkout_total').html(
                                                                                                          fotobarCart.getGrandTotal());
                                                     });
                                    
                                    }
                                    });
    
    $("#location_select")
    .on(
        'change',
        function() {
        
        $("#location_select option[value='0']").remove();
        var storeId = $("#location_select option:selected")
								.val();
        
        $(
          "#location_hours,#location_address,#location_city,#location_phone")
								.empty();
        $("#address_info").show();
        
        var storeInfo = fotobarConfig.configure.locations
								.filter(function(obj) {
                                        return obj.id === storeId;
                                        })[0];
        
        var setTaxRate = fotobarCart.setTaxRate(
                                                storeInfo.zip_code, 'pick_up');
        setTaxRate.done(function() {
                        
                        $('#total_with_shipping_cost').html(
                                                  fotobarCart.getGrandTotal());
                        });
        
        var streetArray = [ storeInfo.addr1, storeInfo.addr2,
                           storeInfo.addr3 ];
        streetArray = streetArray.filter(function(e) {
                                         return e === 0 || e
                                         });
        $("#location_address").append(streetArray.join(', '))
        $("#location_city").append(
                                   storeInfo.city + ', ' + storeInfo.state + ' '
                                   + storeInfo.zip_code);
        $("#location_phone").append(storeInfo.phone);
        for (line in storeInfo.hours) {
        
        var storeHours = storeInfo.hours[line];
        $("#location_hours").append(
                                    "<tr><td>" + storeHours.day + "</td><td>"
                                    + storeHours.hours + "</td></tr>");
        }
        });
    
    $("#checkout_back_btn").on('click', function() {
                               
                               fotobarUI.renderImageView();
                               fotobarUI.redrawCurrent();
                               fotobarUI.showNextImage(null);
                               });
    
    $('#ship_zip').blur(
                        function() {
                        
                        var setTaxRate = fotobarCart.setTaxRate($(this).val(), 'ship');
                        setTaxRate.done(function() {
                                        $('#total_with_shipping_cost, #checkout_total').html(
                                                                                             fotobarCart.getGrandTotal());
                                        });
                        });
    
    $("#checkout_btn").on('click', function() {
                          
                          $('#contact_form').submit();
                          });
    
    $('#contact_form')
    .submit(
            function(e) {
            e.preventDefault();
            window.scrollTo(0, 0);
            var hasErrors = false;
            $("input", this).css({
                                 "border" : "0",
                                 "border-bottom" : "1px solid #989898"
                                 });
            $("select", this).css({
                                  "border" : "0"
                                  });
            
            var pickup_options = $('input[name="delivery_options"]:checked','#contact_form').val();
            
            $("input, select", this)
            .each(
                  function() {
                  
                  switch ($(this).attr('name')) {
                  
                  case ('location_select'):
                  
                  if ($(this).val() == 0
                      && pickup_options == 'pick_up') {
                  hasErrors = true;
                  $(this)
                  .css(
                       {
                       "border" : "1px solid red"
                       });
                  }
                  break;
                  
                  case ('name'):
                  
                  if ($(this).val() == '') {
                  hasErrors = true;
                  $(this)
                  .css(
                       {
                       "border" : "1px solid red"
                       });
                  }
                  break;
                  
                  case ('email'):
                  
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                      .test($(this).val())) {
                  hasErrors = true;
                  $(this)
                  .css(
                       {
                       "border" : "1px solid red"
                       });
                  }
                  break;
                  
                  case ('mobile'):
                  
                  if (!/\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/
                      .test($(this).val())) {
                  hasErrors = true;
                  $(this)
                  .css(
                       {
                       "border" : "1px solid red"
                       });
                  }
                  break;
                  
                  default:
                  
                  if (pickup_options == 'ship') {
                  
                  switch ($(this)
                          .attr('name')) {
                  
                  case ('ship_first_name'):
                  case ('ship_last_name'):
                  case ('ship_address'):
                  case ('ship_city'):
                  case ('ship_state'):
                  case ('ship_zip'):
                  if ($(this).val() == '') {
                  hasErrors = true;
                  $(this)
                  .css(
                       {
                       "border" : "1px solid red"
                       });
                  }
                  break;
                  case ('ship_email'):
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                      .test($(this)
                            .val())) {
                  hasErrors = true;
                  $(this)
                  .css(
                       {
                       "border" : "1px solid red"
                       });
                  }
                  break;
                  }
                  }
                  
                  break;
                  }
                  });
            
            if (hasErrors === false) {
            
            $("input:focus", this).blur();
            // $(this).off();
            // $("#checkout_back_btn").off();
            
            setTimeout(function() {
                       
                       var customer_form = $('#contact_form')
                       .serializeFormJSON();
                       var cc_form = document
                       .getElementById('cc_form');
                       fotobarCart
                       .processOrder(customer_form, cc_form);
                       }, 500);
            
            } else {
            
            fotobarUI
            .alertUser({
                       type : 'error',
                       text : 'Please confirm your information is correct.'
                       });
            }
            
            });
    
    $("input[name=delivery_options]:radio, input[name=payment_options]:radio")
    .on(
        'change',
        function() {
        
        if ($(this).attr('name') == 'delivery_options') {
        
        $('.btn_tab').toggleClass('selected');
        $("#ship_details, #pickup_details").toggle();
        $("#total_shipping, #total_no_shipping").toggle();
        }
        
        var delivery_radio = $(
                               "input:radio[name=delivery_options]:checked")
								.val();
        var payment_radio = $(
                              "input:radio[name=payment_options]:checked")
								.val();
        
        switch (true) {
        
        case (delivery_radio == 'ship'):
        $("#ship_details").show();
        case (delivery_radio == 'ship' || payment_radio == 'now'):
        
        $("#cc_details").show();
        $('input:radio[name=payment_options]:nth(1)').prop(
                                                           'checked', true);
        fotobarCart.is_cc_charge = true;
        fotobarCart.captured = (delivery_radio == 'ship') ? false
        : true;
        fotobarCart.is_shipped = (delivery_radio == 'ship') ? true
        : false;
        break;
        
        default:
        $("#cc_details").hide();
        fotobarCart.is_cc_charge = false;
        fotobarCart.captured = false;
        fotobarCart.is_shipped = false;
        
        break;
        
        }
        $('#total_with_shipping_cost, #checkout_total').html(
                                                             fotobarCart.getGrandTotal());
        });
};

FotobarUI.prototype.renderImageSrcView = function() {
    
    $('body').html(this.imageSourceTpl());
    $("#cam_src_btn").on("click", fotobarUI.getImages);
    $("#fb_src_btn").on("click", fotobarUI.getFbAlbums);
    $("#gram_src_btn").on("click", fotobarUI.getIgImages);
    
    $(".btn_cart").on("click", function() {
                      var cartTotal = fotobarCart.getCartTotal();
                      
                      if (cartTotal == 0) {
                      fotobarUI.alertUser({
                                          type : 'error',
                                          text : 'Your Cart is Empty'
                                          });
                      } else {
                      fotobarUI.renderCheckoutView();
                      }
                      });
    
    $("#image_source_back_btn").on("click", function() {
                                   
                                   if (Object.keys(fotobar.images).length == 0) {
                                   
                                   fotobarUI.renderHomeView();
                                   } else {
                                   
                                   fotobarUI.renderImageView();
                                   fotobarUI.redrawCurrent();
                                   fotobarUI.showNextImage(null);
                                   }
                                   });
    
    $("#fb_logout").on('click',function(){
                       fotobarUI.faceBook.logout();
                       });
    
    $("#ig_logout").on('click',function(){
                       fotobarUI.instagram.logout();
                       console.log(fotobarConfig.user);
                       });
    
    // $("#gram_src_btn").on("click", fotobarUI.faceBook.logout);
};

FotobarUI.prototype.renderImageView = function() {
    
    $('body').html(this.imagePreviewTpl());
    
    $("#swipe_panels").css({
                           height : (fotobar.canvasSetHeight + 10)
                           });
    
    $('input.none').on('singletap', function() {
                       this.focus();
                       });
    
    $(".btn_cart").on("click", function() {
                      
                      var cartTotal = fotobarCart.getCartTotal();
                      
                      if (cartTotal == 0) {
                      fotobarUI.alertUser({
                                          type : 'error',
                                          text : 'Your Cart is Empty'
                                          });
                      } else {
                      fotobarUI.renderCheckoutView();
                      }
                      });
    
    $('#menu-fx div.fx').on('click', function() {
                            
                            var current_image = $(fotobarUI.current_canvas).children('img');
                            $(current_image).removeClass(fotobarUI.current_image.effect);
                            
                            if ($(this).attr('filter') != 'none') {
                            
                            fotobarUI.current_image.effect = $(this).attr('filter');
                            current_image.addClass($(this).attr('filter'));
                            }
                            });
    
    $("#btn_addmore").on("click", function() {
                         fotobarUI.renderImageSrcView();
                         });
    
    // style/size tabs
    $("#size-tab").on("click", function() {
                      
                      $("#tabs div.btn_normal").removeClass('selected');
                      $(this).addClass('selected');
                      $("#menu-size").show();
                      $("#menu-style").hide();
                      
                      });
    $("#style-tab").on("click", function() {
                       
                       $("#tabs div.btn_normal").removeClass('selected');
                       $(this).addClass('selected');
                       $("#menu-size").hide();
                       $("#menu-style").show();
                       });
    
    $("div.qty")
    .children('img')
    .on(
        'click',
        function() {
        
        var sku = $(this).parent("div.qty").attr('sku');
        var quantityUpdate = ($(this).hasClass('minus_count')) ? -1
								: 1;
        fotobarCart.updateQuantity(sku, quantityUpdate);
        
        $("div.qty")
								.each(
                                      function() {
                                      
                                      var itemCount = fotobarCart
                                      .getImageItemCount(
                                                         $(this).attr('sku'),
                                                         fotobarUI.current_image.id);
                                      $(' > span', this).html(itemCount);
                                      });
        
        $("div.qty-indicator[sku]").each(
                                         function() {
                                         
                                         $(this).text(
                                                      fotobarCart.getItemCount($(this)
                                                                               .attr('sku')));
                                         });
        
        $("#cart_total").text(fotobarCart.getCartTotal());
        });
    
    // Boarder Format
    $("#menu-format div.format").on("click", function() {
                                    
                                    if ($(this).css('opacity') == 1 && !$(this).hasClass("selected")) {
                                    
                                    $('#menu-format div.format').removeClass("selected")
                                    $(this).addClass("selected");
                                    fotobarUI.frameButtonClick($(this).attr('id'));
                                    }
                                    });
    
};

FotobarUI.prototype.renderHomeView = function() {
    
    $('body').html(this.homeTpl());
    
    var viewToSwipe = document.getElementById('homeslider');
    var hammer = new Hammer.Manager(viewToSwipe);
    var swipe = new Hammer.Swipe();
    
    hammer.add(swipe);
    
    hammer.on('swipeleft', function() {
              
              var current = $('div.slide:visible');
              var next = current.next('div.slide');
              var currentControl = $('#homeslider-controls div.current');
              var nextControl = currentControl.next('#homeslider-controls div');
              
              if (next.length == 0) {
              return (false);
              }
              
              current.hide('slide', {
                           direction : 'left'
                           }, 300);
              next.show('slide', {
                        direction : 'right'
                        }, 300);
              nextControl.addClass('current');
              currentControl.removeClass('current');
              });
    
    hammer.on('swiperight', function() {
              
              var current = $('div.slide:visible');
              var next = current.prev('div.slide');
              var currentControl = $('#homeslider-controls div.current');
              var nextControl = currentControl.prev('#homeslider-controls div');
              
              if (next.length == 0) {
              return (false);
              }
              current.hide('slide', {
                           direction : 'right'
                           }, 300);
              next.show('slide', {
                        direction : 'left'
                        }, 300);
              nextControl.addClass('current');
              currentControl.removeClass('current');
              });
    
    $("#start_btn").on("tap", function() {
                       fotobarUI.renderImageSrcView();
                       });
};

FotobarUI.prototype.renderThankyouView = function() {
    
    $('body').html(this.thankYouTpl());
    
    ( fotobarCart.is_shipped === true)? $("#ship-message").show(): $("#pickup-menu").show();
    
    $("#thank_you_close").on('click', function() {
                             navigator.app.exitApp();
                             });
    
    $("#thank_you_back_btn").on('click', function() {
                                
                                fotobarUI.renderImageSrcView();
                                });
    
};
/*******************************************************************************
 * BUTTONS
 */
FotobarUI.prototype.setFormatButtons = function() {
    
    var menuArray = $("#menu-format div.format");
    $(menuArray).not('#polaroid_button').css({
                                             opacity : .25
                                             });
    
    switch (true) {
            
        case (this.current_image.is_landscape):
            $('#full_frame_button_l, #spectra_frame_button').css({
                                                                 opacity : 1
                                                                 });
            break;
            
        case (this.current_image.is_square):
            break;
            
        default: // portrait
            $('#full_frame_button_p').css({
                                          opacity : 1
                                          });
            break;
    }
    
    var selectedFormat = $(menuArray).get(this.current_image.format - 1);
    $(menuArray).removeClass('selected');
    $(selectedFormat).addClass('selected');
    $(this.current_image).children('img').addClass(this.current_image.effect);
    
};

FotobarUI.prototype.deleteButtonClick = function() {
    
    navigator.notification.confirm(
                                   'Are you sure you want to remove this image from the order?', // message
                                   function(buttonIndex) {
                                   if (buttonIndex == 1) {
                                   
                                   fotobar.deleteImage(fotobarUI.current_image);
                                   fotobarCart.deleteImageItems(fotobarUI.current_image.id);
                                   
                                   if (fotobar.imageCount() > 0) {
                                   
                                   fotobarUI.renderImageView();
                                   fotobarUI.redrawCurrent();
                                   fotobarUI.showNextImage(null);
                                   
                                   } else {
                                   
                                   alert('You have deleted all of your pictures.');
                                   fotobarUI.renderImageSrcView();
                                   }
                                   }
                                   }, 'Delete Image', 'Delete,Cancel');
};

FotobarUI.prototype.frameButtonClick = function(buttonId) {
    
    var canvas_image = $(this.current_canvas).children('img');
    
    switch (buttonId) {
            
        case ('full_frame_button_p'):
            
            //$(canvas_image).css('top', 0);
            $("#text_" + this.current_image.id).hide();
            this.current_image.is_polaroid = false;
            this.current_image.is_spectra = false;
            this.current_image.format = 2;
            break;
            
        case ('full_frame_button_l'):
            
            //$(canvas_image).css('left', 0);
            $("#text_" + this.current_image.id).hide();
            this.current_image.is_polaroid = false;
            this.current_image.is_spectra = false;
            this.current_image.format = 3;
            break;
            
        case ('spectra_frame_button'):
            
            $("#text_" + this.current_image.id).show();
            this.current_image.is_polaroid = false;
            this.current_image.is_spectra = true;
            this.current_image.format = 4;
            break;
            
        default:
            
            $("#text_" + this.current_image.id).show();
            this.current_image.is_polaroid = true;
            this.current_image.is_spectra = false;
            this.current_image.format = 1;
            break;
    }
    
    fotobar.setImageParams(this.current_image);
    //this.setPolaroidCords($(this.current_canvas).children('img'),
    //this.current_image.id);
    
    fotobarUI.renderEditView();
    
    // var imageContainer = document.getElementById('container_'
    // + this.current_image.id);
    // fotobarUI.carousel.updateFormat(imageContainer, this.current_image);
};

/*******************************************************************************
 * SOCIAL MEDIA
 */
FotobarUI.prototype.appendRemotePhotos = function(photos) {
    
    $("div.photo_list").off('click');
    
    for (photo in photos) {
        
        var currentPhoto = photos[photo];
        var div = document.createElement("div");
        div.className = 'photo_list';
        div.setAttribute('id', currentPhoto.id);
        div.setAttribute('image_url', currentPhoto.url);
        
        var img = document.createElement("img");
        img.className = 'cart_items_img';
        img.setAttribute('src', currentPhoto.url);
        div.appendChild(img);
        
        var imgSelected = document.createElement("img");
        imgSelected.setAttribute('src', 'assets/img/CheckMark.png');
        imgSelected.className = 'image_check';
        div.appendChild(imgSelected);
        
        $('#photo_list').append(div);
    }
    
    $("div.photo_list").on(
                           'click',
                           function() {
                           
                           if ($(this).children('img.image_check').is(':visible')) {
                           
                           $(this).toggleClass('image_selected');
                           $(this).children('img.image_check').toggle();
                           } else {
                           
                           var max_selections = fotobarUI.getSelectCount($(
                                                                           "div.image_selected").size());
                           
                           if (max_selections > 0) {
                           
                           $(this).toggleClass('image_selected');
                           $(this).children('img.image_check').toggle();
                           }
                           }
                           });
};

FotobarUI.prototype.showRemotePhotos = function(photos) {
    
    fotobarUI.appendRemotePhotos(photos);
    
    $('#show_more').on('click', function() {
                       
                       switch (fotobarUI.current_social_media) {
                       
                       case ('ig'):
                       
                       var getPagination = fotobarUI.instagram.pagination();
                       getPagination.done(function(photos) {
                                          
                                          fotobarUI.appendRemotePhotos(photos);
                                          });
                       break;
                       
                       case ('fb'):
                       
                       var getPagination = fotobarUI.faceBook.pagination();
                       getPagination.done(function(photos) {
                                          
                                          fotobarUI.appendRemotePhotos(photos);
                                          });
                       break;
                       
                       default:
                       
                       break;
                       
                       }
                       
                       });
    
    
    $("#image_display_cancel").on(
                                  'click',
                                  function() {
                                  
                                  (fotobarUI.current_social_media == 'ig') ? fotobarUI
                                  .renderImageSrcView() : fotobarUI.getFbAlbums();
                                  
                                  });
    
    $("#image_display_done")
    .on(
        'click',
        function() {
        
        var fotosToSelect = [];
        var imageCounter = 0;
        
        $('div.image_selected')
								.each(
                                      function() {
                                      
                                      var getLocalUrl = fotobar
                                      .getRemoteImage($(this)
                                                      .attr('image_url'));
                                      
                                      getLocalUrl
                                      .done(function(local_url) {
                                            
                                            fotosToSelect
                                            .push(local_url);
                                            
                                            });
                                      
                                      getLocalUrl
                                      .fail(function(err) {
                                            
                                            fotobarUI
                                            .alertUser({
                                                       type : 'error',
                                                       text : 'Could not download image: '
                                                       + err.source
                                                       });
                                            });
                                      
                                      getLocalUrl
                                      .always(function() {
                                              
                                              imageCounter++;
                                              if (imageCounter == $('div.image_selected').length) {
                                              
                                              fotobarUI
                                              .renderImages(fotosToSelect);
                                              }
                                              });
                                      
                                      });
        });
};

FotobarUI.prototype.getFbAlbumPhotos = function(album_id) {
    
    $('body').html(fotobarUI.imageDisplayTpl());
    
    $(".btn_cart").on("click", function() {
                      
                      var cartTotal = fotobarCart.getCartTotal();
                      
                      if (cartTotal == 0) {
                      fotobarUI.alertUser({
                                          type : 'error',
                                          text : 'Your Cart is Empty'
                                          });
                      } else {
                      fotobarUI.renderCheckoutView();
                      }
                      });
    
    var getPhotos = fotobarUI.faceBook.getAlbumPhotos(album_id);
    
    getPhotos.done(function(photos) {
                   
                   fotobarUI.showRemotePhotos(photos);
                   });
    
    getPhotos.fail(function(error) {
                   // pass to alert function
                   alert(error);
                   });
};

FotobarUI.prototype.getFbAlbums = function() {
    
    if (fotobarConfig.user.facebook_userID == ""
        || fotobarUI.FbLoginStatus != 'connected') {
        
        navigator.notification
        .confirm(
                 'You need to be logged into Facebook to access your photos.  Would you like to login?',
                 function(buttonIndex) {
                 
                 if (buttonIndex == 1) {
                 
                 var login = fotobarUI.faceBook.login();
                 
                 login
                 .done(function() {
                       
                       var getAlbums = fotobarUI.faceBook
                       .getAlbums(fotobarConfig.user.facebook_userID);
                       getAlbums
                       .done(function(albums) {
                             
                             fotobarUI.current_social_media = 'fb';
                             
                             fotobarUI
                             .showRemoteAlbums(albums);
                             });
                       
                       getAlbums
                       .fail(function(error) {
                             // alert(error);
                             fotobarUI
                             .alertUser({
                                        type : 'error',
                                        message : 'We could not get your albums at this time.'
                                        });
                             });
                       });
                 
                 login.fail(function(error) {
                            fotobarUI.alertUser({
                                                type : 'error',
                                                message : 'Login Cancelled.'
                                                });
                            });
                 
                 } else {
                 fotobarUI.renderImageSrcView();
                 }
                 }, 'Login Required', 'Log In, No Thanks');
    } else {
        
        var getAlbums = fotobarUI.faceBook
        .getAlbums(fotobarConfig.user.facebook_userID);
        
        getAlbums.done(function(albums) {
                       fotobarUI.current_social_media = 'fb';
                       fotobarUI.showRemoteAlbums(albums);
                       });
        
        getAlbums.fail(function(error) {
                       // alert(error);
                       fotobarUI.alertUser({
                                           type : 'error',
                                           message : 'We could not get your albums at this time.'
                                           });
                       });
        
    }
};

FotobarUI.prototype.showRemoteAlbums = function(albums) {
    
    $('body').html(this.albumDisplayTpl());
    
    for (album in albums.data) {
        
        var currentAlbum = albums.data[album];
        var currentImage = (typeof (currentAlbum.photos) !== 'undefined') ? currentAlbum.photos.data[0].picture
        : this.defaultAlbumImage;
        var albumPhoteCount = (isNaN(parseInt(currentAlbum.count))) ? 0
        : currentAlbum.count;
        
        var li = document.createElement("li");
        li.className = 'photo_albums_list';
        li.setAttribute('id', currentAlbum.id);
        
        var img = document.createElement("img");
        img.setAttribute('src', currentImage);
        li.appendChild(img);
        
        var span = document.createElement("span");
        span.innerHTML = currentAlbum.name + ' - ' + albumPhoteCount;
        li.appendChild(span);
        
        $('#photo_albums').prepend(li);
    }
    
    $("li.photo_albums_list").on('click', function() {
                                 
                                 fotobarUI.getFbAlbumPhotos($(this).attr('id'));
                                 });
    
    $(".btn_cart").on("click", function() {
                      
                      var cartTotal = fotobarCart.getCartTotal();
                      
                      if (cartTotal == 0) {
                      fotobarUI.alertUser({
                                          type : 'error',
                                          text : 'Your Cart is Empty'
                                          });
                      } else {
                      fotobarUI.renderCheckoutView();
                      }
                      });
    
    $("#album_display_back_btn").on('click', function() {
                                    
                                    if (Object.keys(fotobar.images).length == 0) {
                                    
                                    fotobarUI.renderImageSrcView();
                                    } else {
                                    
                                    fotobarUI.renderImageView();
                                    fotobarUI.redrawCurrent();
                                    fotobarUI.showNextImage(null);
                                    }
                                    });
};

FotobarUI.prototype.getIgAccessToken = function() {
    
    return $.Deferred(function() {
                      
                      var self = this;
                      
                      if (fotobarConfig.user.ig_oauth != null) {
                      
                      self.resolve(fotobarConfig.user.ig_oauth);
                      
                      } else {
                      
                      var igLogin = fotobarUI.instagram.login();
                      igLogin.done(function(access_key) {
                                   
                                   fotobarConfig.setUserParam('ig_oauth', access_key);
                                   self.resolve(access_key);
                                   });
                      
                      igLogin.fail(function(err) {
                                   alert(err);
                                   self.reject({
                                               type : 'error',
                                               text : 'Could not connect to InstaGram.'
                                               });
                                   });
                      }
                      });
};

FotobarUI.prototype.getIgImages = function() {
    
    var getAccessToken = fotobarUI.getIgAccessToken();
    
    getAccessToken.done(function(access_key) {
                        
                        var igPhotos = fotobarUI.instagram.getPhotos(access_key);
                        igPhotos.done(function(photos) {
                                      
                                      $('body').html(fotobarUI.imageDisplayTpl());
                                      fotobarUI.showRemotePhotos(photos);
                                      });
                        
                        igPhotos.fail(function(err) {
                                      
                                      fotobarUI.instagram.logout();
                                      fotobarUI.alertUser({
                                                          type : 'error',
                                                          text : 'Could not get your InstaGram Photos.'
                                                          });
                                      });
                        });
    
    getAccessToken.fail(function(err) {
                        
                        fotobarUI.alertUser(err);
                        });
};

/*******************************************************************************
 * UTILS
 */
FotobarUI.prototype.keyboardDisplay = function(event) {
    
    if (event.type == 'native.keyboardhide') {
        $("#controls-container").show();
    } else {
        $("#controls-container").hide();
    }
};

FotobarUI.prototype.getSelectCount = function(selected_images) {
    
    var current_image_count = fotobar.imageCount();
    
    current_image_count = (typeof (selected_images) !== 'undefined') ? (current_image_count + selected_images)
    : current_image_count;
    var remainderCount = (fotobarUI.maxImageCount - current_image_count);
    
    if (remainderCount == 0) {
        alert('There is a maximum image selection of ' + this.maxImageCount
              + ' images.');
    }
    return (remainderCount);
};

FotobarUI.prototype.updateCheckoutProgress = function(progress_percent,
                                                      current_li) {
    
    progress_percent = (progress_percent == 100) ? 100 : Math.floor(Math
                                                                    .random()
                                                                    * ((progress_percent - $("#progressBar").val()) + 1)
                                                                    + $("#progressBar").val());
    
    $("#progressBar").val(progress_percent);
    $("ul.upload_process li").eq(current_li).removeClass('process_loading')
    .addClass('process_complete').next().addClass('process_loading');
    $("#progress_percent").text(progress_percent)
};

FotobarUI.prototype.alertUser = function(error) {
    
    if (Array.isArray(error)) {
        
        var currentError = error.shift();
        var errorDisplay = this.displayAlert(currentError);
        
        errorDisplay.done(function() {
                          if (error.length > 0) {
                          fotobarUI.alertUser(error);
                          }
                          });
    } else {
        this.displayAlert(error);
    }
};

FotobarUI.prototype.displayAlert = function(error) {
    
    return $.Deferred(function() {
                      
                      var self = this;
                      var messageDiv = document.createElement('div');
                      var currentClass = (error.type == 'error') ? 'errorDiv' : 'succesDiv';
                      $(messageDiv).attr('id', 'message_div');
                      $(messageDiv).addClass(currentClass);
                      $(messageDiv).html(error.text);
                      
                      $('<div/>', {
                        id : 'alert_message',
                        class : currentClass,
                        text : error.text
                        }).prependTo('body');
                      
                      $("#alert_message").fadeOut(5000, function() {
                                                  $("#alert_message").remove();
                                                  self.resolve();
                                                  });
                      });
};

FotobarUI.prototype.setCurrentElements = function(current_id) {
    
    $(this.current_canvas).off();
    this.current_canvas = document.getElementById(current_id);
    this.current_image = fotobar.images[current_id];
    $(this.current_canvas).on('doubletap', fotobarUI.renderEditView);
};
