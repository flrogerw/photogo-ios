var FotobarUI = function() {
    
    this.defaultSku = "703040";
    this.current_image_id;
    this.current_canvas;
    this.current_social_media;
    this.max_text_length = 19;
    this.maxImageCount = 50;
    this.slider_index = 0;
    this.photo_limit = 15;
    this.contact_form = {};
    this.cc_form = {};
    this.mime_types = {
        'jpg' : 'image/jpeg',
        'png' : 'image/png'
    }
    this.current_size;
    this.faceBook = new FotobarFacebook();
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
                              return fotobarCart.getCartTotal();
                              });
    
    $.get("js/partials/states_select.hbs", function(data) {
          Handlebars.registerPartial("states_select", data);
          });
    
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
    
    if (fotobar.imageCount() < 2 && ev_type != null) {
        return;
    }
    
    var imageArray = Object.keys(fotobar.images).sort().reverse();
    var current_id = (fotobarUI.current_image == null) ? imageArray[0]
    : fotobarUI.current_image.id;
    var current_id_index = imageArray.indexOf(current_id.toString());
    var current_image = "#container_" + current_id;
    
    switch (ev_type) {
            
        case ('swipeleft'):
            
            var next_id = (current_id_index == (imageArray.length - 1)) ? imageArray[0]
            : imageArray[(current_id_index + 1)];
            
            $(current_image).animate({
                                     left : '-50%'
                                     }, 500, function() {
                                     $(current_image).css('left', '150%');
                                     // $(current_image).appendTo('#swipe_panels');
                                     });
            
            fotobarUI.getNextImage(ev_type);
            
            var margin = $("#container_" + next_id).css('margin-left');
            var margin_left = (($(window).width() - $("#container_" + next_id)
                                .width()) / 2)
            + Math.abs(parseInt(margin));
            
            $("#container_" + next_id).animate({
                                               left : margin_left
                                               }, 500);
            
            fotobarUI.setCurrentElements(next_id);
            break;
            
        case ('swiperight'):
            
            var prev_id = (current_id_index == 0) ? imageArray[(imageArray.length - 1)]
            : imageArray[(current_id_index - 1)];
            
            $(current_image).animate({
                                     left : '150%'
                                     }, 500, function() {
                                     $(current_image).css('left', '150%');
                                     $(current_image).appendTo('#swipe_panels');
                                     });
            
            fotobarUI.getNextImage(ev_type);
            
            var margin = $("#container_" + prev_id).css('margin-left');
            var margin_left = (($(window).width() - $("#container_" + prev_id)
                                .width()) / 2)
            + Math.abs(parseInt(margin));
            
            $("#container_" + prev_id).css('left', '-50%');
            $("#container_" + prev_id).animate({
                                               left : margin_left
                                               }, 500);
            
            fotobarUI.setCurrentElements(prev_id);
            break;
            
        default:
            
            var margin = $(current_image).css('margin-left');
            var margin_left = (($(window).width() - $(current_image).width()) / 2)
            + Math.abs(parseInt(margin));
            
            $(current_image).animate({
                                     left : margin_left
                                     }, 500);
            
            fotobarUI.setCurrentElements(current_id);
            break;
    }
    
    $("div.qty").each(
                      function() {
                      
                      var itemCount = fotobarCart.getImageItemCount($(this).attr(
                                                                                 'sku'), fotobarUI.current_image.id);
                      $(' > span', this).html(itemCount);
                      });
    
    $("div.qty-indicator[sku]").each(function() {
                                     
                                     $(this).text(fotobarCart.getItemCount($(this).attr('sku')));
                                     });
    
    current_id_index = imageArray
    .indexOf(fotobarUI.current_image.id.toString());
    $("#image_legend").html(
                            (current_id_index + 1) + ' of ' + fotobar.imageCount());
};

FotobarUI.prototype.addGestures = function(current_canvas) {
    
    this.lastScale = 0;
    
    var gestures = new Hammer.Manager(current_canvas);
    // var pinch = new Hammer.Pinch();
    
    var swipe = new Hammer.Swipe({
                                 threshold : 3,
                                 velocity : .3
                                 });
    
    gestures.add([ swipe ]);
    
    gestures.on("swipeleft swiperight", function(ev) {
                
                fotobarUI.showNextImage(ev.type);
                // ev.gesture.stopDetect();
                });
};

FotobarUI.prototype.renderImages = function(imageArray) {
    
    fotobarUI.renderImageView();
    $.when(fotobar.factory(imageArray)).done(function() {
                                             
                                             //fotobarUI.renderImageView();
                                             fotobarUI.redrawCurrent();
                                             $(".preview_overlay").css('opacity', 0);
                                             fotobarUI.showNextImage(null);
                                             });
};

FotobarUI.prototype.getImages = function() {
    
    var fotoselect = new FotoSelect();
    var max_selections = fotobarUI.getSelectCount();
    
    if (max_selections != 0) {
        
        $.when(fotoselect.getImages(fotoselect, max_selections)).done(
                                                                      function() {
                                                                      
                $.when(fotobar.factory(fotoselect.images)).done(function() {
                                                                                                                      
                    fotobarUI.renderImageView();
                    fotobarUI.redrawCurrent();
                    $(".preview_overlay").css('opacity', 0);
                    fotobarUI.current_image = null
                    fotobarUI.showNextImage(null);
                });
            }).fail(function() {
                                                                              // fotobarUI.alertUser({type : 'error',text : 'Could not get
                                                                              // images.'});
                                                                              }).always(function() {
                                                                                        // fotobarUI.showNextImage(null);
                                                                                        });
    } else {
        
        fotobarUI.renderImageView();
        fotobarUI.redrawCurrent();
        $(".preview_overlay").css('opacity', 0);
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
            
            current_image.ty = current_image.tx = 0;
            current_image.plot_y = current_image.plot_x = 0;
            
            current_image.image_scale = (current_image.image_width / fotobar.polaroidWidth);
            current_image.ty = current_image.tx = 0;
            current_image.plot_y = current_image.plot_x = 0;
            // current_image.plot_height = current_image.image_height;
            // current_image.plot_width = current_image.image_width;
            
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
            
            current_image.image_scale = (current_image.image_height / fotobar.polaroidHeight);
            
            current_image.ty = current_image.plot_y = 0;
            current_image.tx = left * -1;
            
            current_image.plot_x = Math.floor((current_image.tx * current_image.image_scale));
            // current_image.plot_width = Math.floor((fotobar.polaroidHeight *
            // current_image.image_scale));
            // current_image.plot_height = current_image.image_height;
            
            break;
            
        default: // portrait
            
            canvas_image.width = fotobar.polaroidWidth;
            canvas_image.height = fotobar.polaroidWidth
            * current_image.aspect_ratio;
            
            top = (current_image.is_polaroid) ? (Math
                                                 .floor((canvas_image.height - fotobar.polaroidHeight) / 2) * -1)
            : 0;
            
            current_image.image_scale = (current_image.image_width / fotobar.polaroidWidth);
            current_image.ty = top * -1;
            current_image.tx = current_image.plot_tx = 0;
            current_image.plot_y = Math.floor(current_image.ty
                                              * current_image.image_scale);
            // current_image.plot_height = floor(fotobar.polaroidWidth *
            // current_image.image_scale);
            // current_image.plot_width = current_image.image_width;
            
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
        canvas_image.width = fotobar.images[image.id].canvas_width
        * fotobar.images[image.id].zoom;
        canvas_image.height = fotobar.images[image.id].canvas_height
        * fotobar.images[image.id].zoom;
        canvas_image.style.marginTop = (fotobar.images[image.id].ty * -1)
        + 'px';
        canvas_image.style.marginLeft = (fotobar.images[image.id].tx * -1)
        + 'px';
        
        // fotobar.images[image.id].plot_width =
        // Math.floor(fotobar.images[image.id].image_width /
        // fotobar.images[image.id].zoom);
        // fotobar.images[image.id].plot_height =
        // Math.floor(fotobar.images[image.id].image_height /
        // fotobar.images[image.id].zoom);
        
        fotobar.images[image.id].plot_x = Math.floor(fotobar.images[image.id].tx * fotobar.images[image.id].image_scale);
        fotobar.images[image.id].plot_y = Math.floor(fotobar.images[image.id].ty * fotobar.images[image.id].image_scale);
        
    }
    
    //console.log(fotobar.images[image.id]);
    
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
    
    input_text.addEventListener('keyup', function() {
            $(this).val($(this).val().replace(/[^A-Za-z0-9.,:;<>%@#+=?$&\'"\_\/\*\- !{}()\[\]]/g, "")); 
                                                }, false);
    
    
    
    input_text.className = "none";
    input_text.setAttribute("id", "text_" + image.id);
    input_text.setAttribute("placeholder", "Add Caption");
    input_text.setAttribute("type", "text");
    
    fotodiv.appendChild(input_text);
    
    $('#swipe_panels').prepend(fotodiv);
    
    switch (true) {
            
        case (fotobar.contains([ 2, 3 ], fotobar.images[image.id].format)):
            $(input_text).hide();
            break;
            
        case (fotobar.contains([ 4 ], fotobar.images[image.id].format)):
            $(input_text).css("top", "82%");
            $(input_text).css("width", "90%");
            $(input_text).css("margin-left", "0%");
            break;
            
        default:
            $(input_text).css("top", "85%");
            $(input_text).css("width", "90%");
            $(input_text).css("margin-left", "0%");
            break;
            
    }
    
    $(input_text).attr('maxlength', fotobarUI.max_text_length);
    $(input_text).val(fotobar.images[image.id].text);
    
   	$(input_text).on('tap',function(){
                     
                     $(this).focus();
                     });
    
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
    
    // alert(fotobar.margin.x);
    
    $('#edit_panel').css(
                         {
                         'padding' : fotobar.frame_margin.x + 'px',
                         'top' : '25vh',
                         'left' : (($(window).width() - $('#edit_panel').width()) / 2)
                         - fotobar.frame_margin.x
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
    
    $('#menu-fx div.fx')
    .on(
        'click',
        function() {
        
        $('#edit_image').removeClass(
                                     fotobarUI.current_image.effect);
        fotobarUI.current_image.image.effect = '';
        $('#edit_image').removeClass();
        
        if ($(this).attr('filter') != 'none') {
        
        fotobarUI.current_image.effect = fotobarUI.current_image.image.effect = $(
                                                                                  this).attr('filter');
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
    
    $('#zoom-in').on(
                     'click',
                     function() {
                     
                     picture.guillotine('zoomIn');
                     var zoom_factor = parseInt($('div.guillotine-canvas').css(
                                                                               'width'))
                     / fotobarUI.current_image.canvas_width;
                     fotobarUI.updateImageCoords(picture.guillotine('getData'),
                                                 zoom_factor);
                     });
    
    $('#zoom-out').on(
                      'click',
                      function() {
                      
                      picture.guillotine('zoomOut');
                      var zoom_factor = parseInt($('div.guillotine-canvas').css(
                                                                                'width'))
                      / fotobarUI.current_image.canvas_width;
                      fotobarUI.updateImageCoords(picture.guillotine('getData'),
                                                  zoom_factor);
                      });
    
    $('#edit_done_btn').on(
                           'click',
                           function() {
                           
                           var zoom_factor = parseInt($('div.guillotine-canvas').css(
                                                                                     'width'))
                           / fotobarUI.current_image.canvas_width;
                           fotobarUI.updateImageCoords(picture.guillotine('getData'),
                                                       zoom_factor);
                           picture.guillotine('remove');
                           
                           fotobarUI.renderImageView();
                           fotobarUI.redrawCurrent();
                           $(".preview_overlay").css('opacity', 0);
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

FotobarUI.prototype.renderCheckoutView = function() {
    
    var isCartValid = fotobarCart.validateCart();
    
    if (isCartValid !== true) {
        
        fotobarUI.alertUser(isCartValid);
        return;
    }
    
    $('body').html(this.checkOutTpl({
                                    
                                    cart_details : fotobarCart.getCartDetailsDisplay(),
                                    locations : fotobarConfig.configure.locations
                                    }));
    
    fotobarUI.repopForm(fotobarUI.contact_form);
    fotobarUI.repopForm(fotobarUI.cc_form);
    
    $("#mobile").mask("?(999) 999-9999", {
                      placeholder : "  "
                      });
    
    $('#total_with_shipping_cost, #checkout_total').html(
                                                         fotobarCart.getGrandTotal());
    
    $('#ship_state, #ship_type').on(
                                    'change',
                                    function() {
                                    
                                    if ($('#ship_state').val() == 0) {
                                    $('#ship_state').css('color', '#A39D9D');
                                    alertUser({
                                              type : 'error',
                                              text : 'Please select a state for shipping'
                                              
                                              });
                                    } else {
                                    $('#ship_state').css('color', '#323030');
                                    var setShipping = fotobarCart.setShippingRate($(
                                                                                    '#ship_type').val(), $('#ship_state').val());
                                    
                                    setShipping.done(function() {
                                                     $('#total_with_shipping_cost, #checkout_total').html(
                                                                                                          fotobarCart.getGrandTotal());
                                                     });
                                    
                                    }
                                    });
    
    /**
     * Update Taxes on Zip Code Change
     */
    $("#ship_zip").on(
                      'blur',
                      function() {
                      
                      $(this).css({
                                  "border-color" : "#323030"
                                  });
                      
                      if (!/^\d{5}(-\d{4})?$/.test($(this).val())) {
                      
                      $(this).css({
                                  "border-color" : "red"
                                  });
                      fotobarUI.alertUser({
                                          type : 'error',
                                          text : 'Please enter a valid zip code'
                                          });
                      } else {
                      var tax_zip = $(this).val().split('-')[0];
                      var setTaxRate = fotobarCart.setTaxRate(tax_zip, 'ship');
                      setTaxRate.done(function() {
                                      
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
        $('#location_select').css('color', '#323030');
        $(
          "#location_hours,#location_address,#location_city,#location_phone")
								.empty();
        $("#address_info").show();
        
        var storeId = $("#location_select option:selected")
								.val();
        fotobarCart.storeInfo = fotobarConfig.configure.locations
								.filter(function(obj) {
                                        return obj.id === storeId;
                                        })[0];
        
        var setTaxRate = fotobarCart.setTaxRate(
                                                fotobarCart.storeInfo.zip_code, 'pick_up');
        setTaxRate.done(function() {
                        
                        $('#total_with_shipping_cost, #checkout_total')
                        .html(fotobarCart.getGrandTotal());
                        });
        
        var streetArray = [ fotobarCart.storeInfo.addr1,
                           fotobarCart.storeInfo.addr2,
                           fotobarCart.storeInfo.addr3 ];
        streetArray = streetArray.filter(function(e) {
                                         return e === 0 || e
                                         });
        $("#location_address").append(streetArray.join(', '))
        $("#location_city").append(
                                   fotobarCart.storeInfo.city + ', '
                                   + fotobarCart.storeInfo.state + ' '
                                   + fotobarCart.storeInfo.zip_code);
        $("#location_phone")
								.append(fotobarCart.storeInfo.phone);
        for (line in fotobarCart.storeInfo.hours) {
        
        var storeHours = fotobarCart.storeInfo.hours[line];
        $("#location_hours").append(
                                    "<tr><td>" + storeHours.day + "</td><td>"
                                    + storeHours.hours + "</td></tr>");
        }
        });
    
    $("#checkout_back_btn").on('click', function() {
                               
                               fotobarUI.contact_form = $('#contact_form').serializeFormJSON();
                               fotobarUI.cc_form = $('#cc_form').serializeFormJSON();
                               
                               fotobarUI.renderImageView();
                               fotobarUI.redrawCurrent();
                               $(".preview_overlay").css('opacity', 0);
                               fotobarUI.showNextImage(null);
                               });
    
    $("#checkout_btn").on('click', function() {
                          
                          $('#contact_form').submit();
                          });
    
    $('#contact_form').submit(
                              function(e) {
                              e.preventDefault();
                              var missing_input_errors = [];
                              
                              var hasErrors = false;
                              var hasCCErrors = false;
                              var hasShipErrors = false;
                              var hasLocationErrors = false;
                              var hasContactErrors = false;
                              
                              $("input, select").css({
                                                     "border-color" : "#323030"
                                                     });
                              
                              var pickup_options = $(
                                                     'input[name="delivery_options"]:checked',
                                                     '#contact_form').val();
                              
                              $("input, select", this).each(
                                                            function() {
                                                            
                                                            switch ($(this).attr('name')) {
                                                            
                                                            case ('location_select'):
                                                            
                                                            if ($(this).val() == 0
                                                                && pickup_options == 'pick_up') {
                                                            hasErrors = true;
                                                            hasLocationErrors = true;
                                                            $(this).css({
                                                                        "border-color" : "red"
                                                                        });
                                                            }
                                                            break;
                                                            
                                                            case ('name'):
                                                            
                                                            if ($(this).val() == '') {
                                                            hasErrors = true;
                                                            hasContactErrors = true;
                                                            $(this).css({
                                                                        "border-color" : "red"
                                                                        });
                                                            }
                                                            break;
                                                            
                                                            case ('email'):
                                                            
                                                            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($(this)
                                                                                                   .val())) {
                                                            hasErrors = true;
                                                             hasContactErrors = true;
                                                            $(this).css({
                                                                        "border-color" : "red"
                                                                        });
                                                            }
                                                            break;
                                                            
                                                            case ('mobile'):
                                                            
                                                            if (!/^(\()?\d{3}(\))?(-|\s)?\d{3}(-|\s)\d{4}$/
                                                                .test($(this).val())) {
                                                            hasErrors = true;
                                                             hasContactErrors = true;
                                                            $(this).css({
                                                                        "border-color" : "red"
                                                                        });
                                                            }
                                                            break;
                                                            
                                                            default:
                                                            
                                                            if (pickup_options == 'ship') {
                                                            
                                                            switch ($(this).attr('name')) {
                                                            
                                                            case ('ship_state'):
                                                            
                                                            if ($(this).val() == '') {
                                                            hasShipErrors = true;
                                                            hasErrors = true;
                                                            $(this).css({
                                                                        "border-color" : "red"
                                                                        });
                                                            }
                                                            break;
                                                            
                                                            case ('ship_first_name'):
                                                            case ('ship_last_name'):
                                                            case ('ship_address'):
                                                            case ('ship_city'):
                                                            
                                                            if ($(this).val() == '') {
                                                            hasErrors = true;
                                                            hasShipErrors = true;
                                                            $(this).css({
                                                                        "border-color" : "red"
                                                                        });
                                                            }
                                                            break;
                                                            
                                                            case ('ship_zip'):
                                                            if (!/^\d{5}(-\d{4})?$/.test($(this)
                                                                                         .val())) {
                                                            hasErrors = true;
                                                            hasShipErrors = true;
                                                            $(this).css({
                                                                        "border-color" : "red"
                                                                        });
                                                            }
                                                            break;
                                                            }
                                                            }
                                                            
                                                            break;
                                                            }
                                                            });
                              
                              var payment_radio = $(
                                                    "input:radio[name=payment_options]:checked").val();
                              
                              if (payment_radio == 'now') {
                              
                              $("#cc_form > input").each(function() {
                                                         
                                                         switch ($(this).attr('name')) {
                                                         
                                                         case ('cc_exp_year'):
                                                         
                                                         if (!/^\d{2}$/.test($(this).val())) {
                                                         hasErrors = true;
                                                         hasCCErrors = true;
                                                         $(this).css({
                                                                     "border-color" : "red"
                                                                     });
                                                         }
                                                         break;
                                                         
                                                         case ('cc_number'):
                                                         
                                                         if (!/^(?:\d){13,16}\b$/.test($(this).val())) {
                                                         
                                                         hasErrors = true;
                                                         hasCCErrors = true;
                                                         $(this).css({
                                                                     "border-color" : "red"
                                                                     });
                                                         }/*
                                                           * else{ $(this).val( $(this).val().replace(/[
                                                           * -]/g, "") ) }
                                                           */
                                                         break;
                                                         
                                                         case ('ccv'):
                                                         
                                                         if (!/(^\d{3,4}$)/.test($(this).val())) {
                                                         hasErrors = true;
                                                         hasCCErrors = true;
                                                         $(this).css({
                                                                     "border-color" : "red"
                                                                     });
                                                         }
                                                         break;
                                                         case ('cc_exp_month'):
                                                         
                                                         if (!/^(0[1-9]|1[0-2])$/.test($(this).val())) {
                                                         hasErrors = true;
                                                         hasCCErrors = true;
                                                         $(this).css({
                                                                     "border-color" : "red"
                                                                     });
                                                         }
                                                         break;
                                                         
                                                         case ('cc_zip'):
                                                         if (!/^\d{5}(-\d{4})?$/.test($(this).val())) {
                                                         hasErrors = true;
                                                         hasCCErrors = true;
                                                         $(this).css({
                                                                     "border-color" : "red"
                                                                     });
                                                         }
                                                         break;
                                                         }
                                                         });
                              
                              }
                              
                              if (hasErrors === false) {
                              
                              $("input:focus", this).blur();
                              // $(this).off();
                              // $("#checkout_back_btn").off();
                              
                              setTimeout(function() {
                                         
                                         var customer_form = $('#contact_form')
                                         .serializeFormJSON();
                                         var cc_form = document.getElementById('cc_form');
                                         fotobarCart.processOrder(customer_form, cc_form);
                                         }, 500);
                              
                              } else {
                              
                              
                              var alert_text = 'Please Confirm the Following:<BR>'
                              
                              if(hasContactErrors){alert_text += '<BR> * Contact Information *'}
                              if(hasShipErrors){alert_text += '<BR> * Shipping Information *'}
                              if(hasLocationErrors){alert_text += '<BR> * Pick Up Location *'}
                              if(hasCCErrors){alert_text += '<BR> * Credit Card Information *'}
                              
                              fotobarUI.alertUser({
                                                  type : 'error',
                                                  text : alert_text
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
        hasErrors = false;
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
        case (payment_radio == 'now'):
        
        $("#cc_details, #payment_print").show();
        $("#payment_no_print").hide();
        $('input:radio[name=payment_options]:nth(1)').prop(
                                                           'checked', true);
        fotobarCart.is_cc_charge = true;
        fotobarCart.captured = (delivery_radio == 'ship') ? false
        : true;
        fotobarCart.is_shipped = (delivery_radio == 'ship') ? true
        : false;
        break;
        
        default:
        $("#cc_details, #payment_print").hide();
        $("#payment_no_print").show();
        fotobarCart.is_cc_charge = false;
        fotobarCart.captured = false;
        fotobarCart.is_shipped = false;
        break;
        
        }
        
        var tax_zip;
        var options;
        
        if (!fotobarCart.is_shipped) {
        
        var storeId = $("#location_select option:selected")
        .val();
        options = 'pick_up';
        
        if (storeId == 0) {
								tax_zip = 00000;
        } else {
        
								var storeInfo = fotobarConfig.configure.locations
        .filter(function(obj) {
                return obj.id === storeId;
                })[0];
        
								tax_zip = storeInfo.zip_code;
        }
        
        } else {
        
        tax_zip = $("#ship_zip").val();
        options = 'ship';
        }
        
        var setTaxRate = fotobarCart.setTaxRate(tax_zip,
                                                options);
        setTaxRate.done(function() {
                        $('#total_with_shipping_cost, #checkout_total')
                        .html(fotobarCart.getGrandTotal());
                        });
        });
};

FotobarUI.prototype.renderImageSrcView = function() {
    
    $('body').html(this.imageSourceTpl());
    $("#cam_src_btn").on("click", fotobarUI.getImages);
    $("#fb_src_btn").on("click", fotobarUI.getFbAlbums);
    $("#gram_src_btn").on("click", fotobarUI.getIgImages);
    
    if (fotobarUI.FbLoginStatus == 'connected') {
        $("#fb_logout").show();
    }
    
    if (fotobarUI.instagram.isLoggedIn() == true) {
        $("#ig_logout").show();
    }
    
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
                                   $(".preview_overlay").css('opacity', 0);
                                   fotobarUI.showNextImage(null);
                                   }
                                   });
    
    $("#fb_logout").on('click', function() {
                       fotobarUI.faceBook.logout();
                       $("#fb_logout").hide();
                       });
    
    $("#ig_logout").on('click', function() {
                       fotobarUI.instagram.logout();
                       $("#ig_logout").hide();
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
        fotobarCart.updateQuantity(sku, quantityUpdate,
                                   fotobarUI.current_image.id);
        
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
    var swipe = new Hammer.Swipe({
                                 threshold : 5,
                                 velocity : .3
                                 });
    
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
    
    switch (true) {
            
        case (fotobarCart.is_shipped === true):
            $("#ship-message").show();
            break;
            
        case (fotobarCart.is_cc_charge === false):
            $("#pickup-message-no-pay").show();
            break;
            
        default:
            
            $("#pickup-message").show();
            
            break;
            
    }
    
    if (fotobarCart.is_shipped === false) {
        
        $("#thankyou_address_info").show();
        var streetArray = [ fotobarCart.storeInfo.addr1,
                           fotobarCart.storeInfo.addr2, fotobarCart.storeInfo.addr3 ];
        streetArray = streetArray.filter(function(e) {
                                         return e === 0 || e
                                         });
        $("#location_address").append(streetArray.join(', '))
        $("#location_city").append(
                                   fotobarCart.storeInfo.city + ', ' + fotobarCart.storeInfo.state
                                   + ' ' + fotobarCart.storeInfo.zip_code);
        $("#location_phone").append(fotobarCart.storeInfo.phone);
        for (line in fotobarCart.storeInfo.hours) {
            
            var storeHours = fotobarCart.storeInfo.hours[line];
            $("#location_hours").append(
                                        "<tr><td>" + storeHours.day + "</td><td>"
                                        + storeHours.hours + "</td></tr>");
        }
    }
    
    $("#thank_you_close").on('click', function() {
                             navigator.app.exitApp();
                             });
    
    $("#thank_you_back_btn").on('click', function() {
                                
                                fotobarUI.contact_form = {};
                                fotobarUI.cc_form = {};
                                fotobarCart.is_cc_charge = false;
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
                                   
                                   fotobarUI.slider_index = 0;
                                   fotobarUI.current_image = null;
                                   fotobarUI.renderImageView();
                                   fotobarUI.redrawCurrent();
                                   $(".preview_overlay").css('opacity', 0);
                                   fotobarUI.showNextImage(null);
                                   
                                   } else {
                                   
                                   fotobarUI.renderImageSrcView();
                                   fotobarUI.current_image = null;
                                   fotobarUI.alertUser({
                                                       type : 'error',
                                                       text : 'You have deleted all of your pictures.'
                                                       });
                                   }
                                   }
                                   }, 'GoPrints by Photo & Go', 'Delete,Cancel');
};

FotobarUI.prototype.frameButtonClick = function(buttonId) {
    
    var canvas_image = $(this.current_canvas).children('img');
    
    switch (buttonId) {
            
        case ('full_frame_button_p'):
            
            // $(canvas_image).css('top', 0);
            $("#text_" + this.current_image.id).hide();
            this.current_image.is_polaroid = false;
            this.current_image.is_spectra = false;
            this.current_image.format = 2;
            break;
            
        case ('full_frame_button_l'):
            
            // $(canvas_image).css('left', 0);
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
    // this.setPolaroidCords($(this.current_canvas).children('img'),
    // this.current_image.id);
    
    fotobarUI.renderEditView();
    
    // var imageContainer = document.getElementById('container_'
    // + this.current_image.id);
    // fotobarUI.carousel.updateFormat(imageContainer, this.current_image);
};

/*******************************************************************************
 * SOCIAL MEDIA
 */
FotobarUI.prototype.appendRemotePhotos = function(photos) {
    
    return $
    .Deferred(function() {
              
              var self = this;
              
              // $("div.photo_list").off('click');
              
              var photoArrayLength = photos.length;
              
              for (var i = 0; i < photoArrayLength; i++) {
              
              // var currentPhoto = photos[photo];
              var newImage = new Image();
              newImage.onload = function() {
              
              var div = document.createElement("div");
              div.className = 'photo_list';
              // div.setAttribute('id', currentPhoto.id);
              div.setAttribute('image_url', this.src);
              
              var img = document.createElement("img");
              img.setAttribute('src', this.src);
              img.className = (this.height > this.width) ? 'social_square_portrait'
              : 'social_square_land';
              div.appendChild(img);
              
              var imgSelected = document.createElement("img");
              imgSelected.setAttribute('src',
                                       'assets/img/CheckMark.png');
              imgSelected.className = 'image_check';
              div.appendChild(imgSelected);
              
              $(div).on(
                        'click',
                        function() {
                        
                        if ($(this).children('img.image_check').is(
                                                                   ':visible')) {
                        
                        $(this).toggleClass('image_selected');
                        $(this).children('img.image_check')
                        .toggle();
                        } else {
                        
                        var max_selections = fotobarUI
                        .getSelectCount($(
                                          "div.image_selected")
                                        .size());
                        
                        if (max_selections > 0) {
                        
                        $(this).toggleClass(
                                            'image_selected');
                        $(this).children('img.image_check')
                        .toggle();
                        }
                        }
                        });
              
              $('#photo_list').append(div);
              
              photos.shift();
              if (photos.length == 0) {
              
              self.resolve();
              }
              
              }
              newImage.src = photos[i].url;
              }
              
              });
};

FotobarUI.prototype.showRemotePhotos = function(photos) {
    
    fotobarUI.appendRemotePhotos(photos);
    
    switch (fotobarUI.current_social_media) {
            
        case ('ig'):
            
            if (fotobarUI.instagram.paginationUrl != null) {
                $("#show_more").show();
            }
            break;
            
        case ('fb'):
            
            if (fotobarUI.faceBook.paginationUrl != null) {
                $("#show_more").show();
            }
            break;
    }
    
    $('#show_more').on(
                       'click',
                       function() {
                       
                       $("#pagination_loading").show();
                       $("#show_more").hide();
                       
                       switch (fotobarUI.current_social_media) {
                       
                       case ('ig'):
                       
                       var getPagination = fotobarUI.instagram.pagination();
                       getPagination.done(function(photos) {
                                          
                                          var paginationDisplay = fotobarUI
                                          .appendRemotePhotos(photos);
                                          paginationDisplay.done(function() {
                                                                 $("body, html").scrollTop(
                                                                                           $("#photo_list").prop("scrollHeight"));
                                                                 $("#pagination_loading").hide();
                                                                 
                                                                 if (fotobarUI.instagram.paginationUrl != null) {
                                                                 $("#show_more").show();
                                                                 }
                                                                 });
                                          });
                       break;
                       
                       case ('fb'):
                       
                       var getPagination = fotobarUI.faceBook.pagination();
                       getPagination.done(function(photos) {
                                          
                                          var paginationDisplay = fotobarUI.appendRemotePhotos(photos);
                                          paginationDisplay.done(function() {
                                                                 $("body, html").scrollTop(
                                                                                           $("#photo_list").prop("scrollHeight"));
                                                                 $("#pagination_loading").hide();
                                                                 
                                                                 if (fotobarUI.faceBook.paginationUrl != null) {
                                                                 $("#show_more").show();
                                                                 }
                                                                 });
                                          
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
                                              fotobarUI.current_image = null;
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
                   fotobarUI.alertUser({
                                       type : 'error',
                                       message : error
                                       });
                   });
};

FotobarUI.prototype.getFbAlbums = function() {
    
    if (fotobarConfig.user.facebook_accessToken == null
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
                 }, 'GoPrints by Photo & Go', 'Log In, No Thanks');
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
                                           text : 'We could not get your albums at this time.'
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
        
        var div = document.createElement("div");
        div.className = 'album_list';
        
        var img = document.createElement("img");
        img.setAttribute('src', currentImage);
        img.setAttribute('align', "middle");
        img.className = "social_square_album";
        
        div.appendChild(img);
        li.appendChild(div);
        
        var span = document.createElement("div");
        $(span).css({
                    'display' : 'inline-block',
                    'white-space' : 'pre-wrap',
                    'width' : '60%',
                    'vertical-align' : 'middle'
                    });
        
        // span.innerHTML = currentAlbum.name + ' - ' + albumPhoteCount;
        span.innerHTML = currentAlbum.name;
        
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
                                    $(".preview_overlay").css('opacity', 0);
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
                                   
                                   self.reject({
                                               type : 'error',
                                               text : 'Could not connect to Instagram.'
                                               });
                                   });
                      }
                      });
};

FotobarUI.prototype.getIgImages = function() {
    
    $("#gram_src_btn").click(false);
    
    var getAccessToken = fotobarUI.getIgAccessToken();
    
    getAccessToken.done(function(access_key) {
                        
                        var igPhotos = fotobarUI.instagram.getPhotos(access_key);
                        igPhotos.done(function(photos) {
                                      
                                      $('body').html(fotobarUI.imageDisplayTpl());
                                      fotobarUI.showRemotePhotos(photos);
                                      });
                        
                        igPhotos.fail(function(err) {
                                      
                                      fotobarUI.instagram.logout();
                                      $("#gram_src_btn").on("click", fotobarUI.getIgImages);
                                      fotobarUI.alertUser({
                                                          type : 'error',
                                                          text : 'Could not get your Instagram Photos.'
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
        
        $("#controls-container, #image_legend_wrapper").show();
    } else {
        
        $("#controls-container, #image_legend_wrapper").hide();
    }
};

FotobarUI.prototype.getSelectCount = function(selected_images) {
    
    var current_image_count = fotobar.imageCount();
    
    current_image_count = (typeof (selected_images) !== 'undefined') ? (current_image_count + selected_images)
    : current_image_count;
    var remainderCount = (fotobarUI.maxImageCount - current_image_count);
    
    if (remainderCount == 0) {
        fotobarUI.alertUser({
                            type : 'error',
                            text : 'There is a maximum image selection of '
                            + this.maxImageCount + ' images.'
                            });
    }
    return (remainderCount);
};

FotobarUI.prototype.repopForm = function(form) {
    
    for (i in form) {
        
        switch ($("input[name='" + i + "'],select[name='" + i + "']").attr(
                                                                           'type')) {
                
            case ('tel'):
            case ('email'):
            case ('select'):
                $("select option[value='" + form[i] + "']").attr('selected',
                                                                 'selected')
            case ('text'):
                
                $("input[name='" + i + "'], select[name='" + i + "']").val(form[i])
                break;
                
            case ('radio'):
                
                $("input[value='" + form[i] + "']").prop('checked', true);
                
                switch (form[i]) {
                        
                    case ('ship'):
                        
                        $("#ship_details, #pickup_details").toggle();
                        $("#total_shipping, #total_no_shipping").toggle();
                        break;
                        
                    case ('now'):
                        
                        $("#cc_details").show();
                        break;
                }
                
                break;
        }
        
    }
    
    if (form.location_select != null && form.location_select != 0) {
        
        fotobarUI.popStoreAddress(form.location_select);
        $("#address_info").show();
    }
    
};

FotobarUI.prototype.popStoreAddress = function(storeId) {
    
    $("#location_select option[value='0']").remove();
    
    var storeInfo = fotobarConfig.configure.locations.filter(function(obj) {
                                                             return obj.id === storeId;
                                                             })[0];
    
    var streetArray = [ storeInfo.addr1, storeInfo.addr2, storeInfo.addr3 ];
    streetArray = streetArray.filter(function(e) {
                                     return e === 0 || e
                                     });
    $("#location_address").append(streetArray.join(', '))
    $("#location_city").append(
                               storeInfo.city + ', ' + storeInfo.state + ' ' + storeInfo.zip_code);
    $("#location_phone").append(storeInfo.phone);
    for (line in storeInfo.hours) {
        
        var storeHours = storeInfo.hours[line];
        $("#location_hours").append(
                                    "<tr><td>" + storeHours.day + "</td><td>" + storeHours.hours
                                    + "</td></tr>");
    }
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
                      
                      if (error.text.length < 5) {
                      self.resolve();
                      }
                      
                      var self = this;
                      
                      var currentClass = (error.type == 'error') ? 'errorDiv' : 'succesDiv';
                      
                      $('<div/>', {
                        id : 'alert_message',
                        class : currentClass,
                        html : error.text
                        }).prependTo('body');
                      
                      $('#alert_message').center();
                      $(window).scroll(function() {
                                       $('#alert_message').center();
                                       });
                      
                      setTimeout(function() {
                                 
                                 $("#alert_message").remove();
                                 self.resolve();
                                 }, 5000);
                      
                      });
};

FotobarUI.prototype.filterTimestamp = function(timestamp) {
    
    var image = fotobar.images.filter(function(obj) {
                                      return obj.timestamp === timestamp;
                                      })[0];
    
    return (image.id);
};

FotobarUI.prototype.setCurrentElements = function(current_id) {
    
    $(this.current_canvas).off();
    this.current_canvas = document.getElementById(current_id);
    this.current_image = fotobar.images[current_id];
    $(this.current_canvas).on('doubletap', fotobarUI.renderEditView);
};