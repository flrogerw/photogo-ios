 (function($) {
  
  $("body").on(
               'keydown',
               function(e) {
               
               if (e.which == 13) {
               e.preventDefault();
               $("input:focus").blur();
               //$("#text_" + fotobarUI.current_image.id).blur();
               fotobarUI.current_image.text = $(
                                                "#text_" + fotobarUI.current_image.id).val();
               return false;
               }
               });
  
  (function($){
   $.fn.extend({
               center: function () {
               return this.each(function() {
                                var top = ($(window).height() - $(this).outerHeight()) / 2;
                                top += document.body.scrollTop;
                                $(this).css({position:'absolute', margin:'auto', top: (top > 0 ? top : 0)+'px'});
                                });
               }
               });
   })(jQuery);
  
  $.fn.serializeFormJSON = function() {
  
		var o = {};
		var a = this.serializeArray();
		$.each(a, function() {
               if (o[this.name]) {
               if (!o[this.name].push) {
               o[this.name] = [ o[this.name] ];
               }
               o[this.name].push(this.value || '');
               } else {
               o[this.name] = this.value || '';
               }
               });
		return o;
  };
  })(jQuery);

var fotobar;
var fotobarCart;
var fotobarConfig;
var fotobarUI;


$(document).ready(
                  function() {
                  
                  document.addEventListener('deviceready', function() {
                                            
                                            //navigator.app.clearCache();
                                            $('body').show();
                                            
                                            //playAudio();
                                            //var green_fade = $("div.slide01").animate({
                                            //'opacity' : 0
                                            //}, 5000);
                                            
                                            screen.lockOrientation('portrait');
                                            FastClick.attach(document.body);
                                            
                                            if (navigator.notification) {
                                            
                                            window.alert = function(message) {
                                            navigator.notification.alert(message, // message
                                                                         null, // callback
                                                                         "GoPrints by Photo & Go", // title
                                                                         'OK' // buttonName
                                                                         );
                                            };
                                            }
                                            
                                            fotobar = new Fotobar();
                                            fotobarConfig = new FotobarConfig();
                                            var configReady = fotobarConfig.initialize();
                                            configReady.done(function() {
                                                             
                                                             fotobarCart = new FotobarCart(
                                                                                           fotobarConfig.configure.products);
                                                             fotobarUI = new FotobarUI();
                                                             
                                                             fotobarUI.renderHomeView();
                                                             
                                                             setTimeout(function(){
                                                                        navigator.splashscreen.hide();
                                                                        if(fotobarConfig.errors.display.length > 0){
                                                                        fotobarUI.alertUser(fotobarConfig.errors.display);
                                                                        }
                                                                        }, 1000);
                                                             
                                                             
                                                             window.addEventListener('native.keyboardshow',
                                                                                     fotobarUI.keyboardDisplay);
                                                             window.addEventListener('native.keyboardhide',
                                                                                     fotobarUI.keyboardDisplay);
                                                             
                                                             
                                                             });
                                            
                                            configReady.fail(function(e) {
                                                             
                                                             // alert('Could not load configuration. Polaroid FotoBar
                                                             // will close.');
                                                             // setTimeout(function(){ navigator.app.exitApp(); }, 4000);
                                                             });
                                            
                                            configReady.always(function(data) {
                                                               });
                                            
                                            }, false);
                  
                  });