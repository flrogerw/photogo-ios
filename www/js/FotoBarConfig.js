var FotobarConfig = function() {
    
    this.is_debug = true;
    this.root_directory = 'Photogo';
    this.aws_container = 'loopback-upload'
    this.ig_auth_url = 'https://api.instagram.com/oauth/authorize';
    this.ig_app_id = '87a6373396d941eab4b61a3cfa7259a5';
    this.ig_redirect = 'http://photoandgo.com';
    this.ig_api_url = 'https://api.instagram.com/v1/';
    //this.stripe_pk = 'pk_test_gj1pPepZi2KqMUl8wtHB8YZE';
    
    
    //this.stripe_pk = ( this.is_debug === true )? 'pk_test_nSZz2pA51q7nF3nP0oxTXN0g': 'pk_live_wePip2ZEAbuzTeRPqIheTrDO';// mine = live
    this.stripe_pk = ( this.is_debug === true )? 'pk_test_nSZz2pA51q7nF3nP0oxTXN0g': 'pk_test_gj1pPepZi2KqMUl8wtHB8YZE';// mine = live
    this.stripe_script_url = 'https://js.stripe.com/v2/';
    this.products;
    this.server_alive = false;
    this.gps;
    this.locations;
    this.reader;
    this.isNewUser = false;
    this.mainConfig = 'fotobar.json';
    this.configAPI;
    this.errors = {
        display : []
    };
    this.tokens = {
    access: '',
    key: ''
    };
    this.user = {
        name : '',
        email : '',
        mobile : '',
        facebook_userID : '',
        facebook_accessToken : null,
        ig_id : '',
        ig_oauth : null,
        oauth_token : '',
        oauth_key : ''
    };
    
    this.configure = {
        "servers" : {
            "api" : "https://api.photoandgo.com:3001/api/Methods/"
        },
        "files" : {
            "main" : "fotobar.json",
            "history" : "fotobar_history.json",
            "user" : "fotobar_user.json"
        },
        "products" : [ {
                      "sku" : "703041",
                      "price" : 10,
                      "description" : "12in x 12in",
                      "category" : "polaroid",
                      "sub_category" : "size three",
                      "size" : "9x11",
                      "color" : "",
                      "mobile" : true,
                      "img_url" : "",
                      "name" : "large",
                      "minOverride" : false,
                      "minQty" : 0
                      }, {
                      "sku" : "703047",
                      "price" : 5,
                      "description" : "5in x 6in",
                      "category" : "polaroid",
                      "sub_category" : "size two",
                      "size" : "6x7.25",
                      "color" : "",
                      "mobile" : true,
                      "img_url" : "",
                      "name" : "medium",
                      "minOverride" : false,
                      "minQty" : 0
                      }, {
                      "sku" : "703040",
                      "price" : 1,
                      "description" : "original sized polaroid",
                      "category" : "polaroid",
                      "sub_category" : "size one",
                      "size" : "3.5x4.25",
                      "color" : "",
                      "mobile" : true,
                      "img_url" : "",
                      "name" : "original",
                      "minOverride" : false,
                      "minQty" : 6
                      } ],
        "locations" : [ {
                       "location_id" : 1,
                       "name" : "Las Vegas - The Linq",
                       "addr1" : "3545 Las Vegas Blvd South",
                       "addr2" : "Suite L-7",
                       "addr3" : "",
                       "city" : "Las Vegas",
                       "state" : "NV",
                       "zip_code" : "89109",
                       "hours" : [ {
                                  "day" : "Sun - Thurs",
                                  "hours" : "10:00am - 12:00am"
                                  }, {
                                  "day" : "Fri - Sat",
                                  "hours" : "10:00am - 2:00am"
                                  } ],
                       "phone" : "702-202-2288",
                       "id" : "55afac1f01db453306a8187b"
                       } ]
    }
    
};

FotobarConfig.prototype.initialize = function() {
    
    var d = new Date();
    this.gps = d.currentTime();
    
    return $.Deferred(function() {
                      
                      var that = this;
                      var reader = new FotobarFileReader();
                      var initReader = reader.initialize(fotobarConfig.mainConfig, fotobarConfig.root_directory);
                      
                      initReader.done(function(file) {
                                      
                                      var configArchive = reader.readFile(file);
                                      configArchive.done(function(data) {
                                                         
                                                         fotobarConfig.configure = JSON.parse(data);
                                                         });
                                      });
                      
                      initReader.fail(function(e) {
                                      
                                      fotobarConfig.errors.archive = JSON.stringify(e);
                                      fotobarConfig.updateArchive();
                                      fotobarConfig.errors.display.push({type : 'error',text : 'Could not read Settings file'});
                                      });
                      
                      initReader.always(function() {
                                        
                                        fotobarConfig.configAPI = new FotobarRest(
                                                                                  fotobarConfig.configure.servers.api);
                                        
                                        var getUser = fotobarConfig.getUser();
                                        getUser.done(function(user) {
                                                    
                                                     var getLocations = fotobarConfig.getLocations();
                                                     getLocations.done(function(locations) {
                                                           
                                                                       var getProducts = fotobarConfig.getProducts();
                                                                       getProducts.done(function(products) {
                                                                                        
                                                                                        switch (true) {
                                                                                        
                                                                                        case (fotobarConfig.errors.archive != null && (fotobarConfig.products === false || fotobarConfig.locations === false)):
                                                                                        
                                                                                        that.resolve();
                                                                                        break;
                                                                                        
                                                                                        case (fotobarConfig.products === true || fotobarConfig.locations === true):
                                                                                        
                                                                                        fotobarConfig.updateArchive();
                                                                                        //fotobarConfig.errors.display.push({type : 'success',text : 'Updated Settings'});
                                                                                        that.resolve();
                                                                                        break;
                                                                                        default:
                                                                                        
                                                                                        that.resolve();
                                                                                        break;
                                                                                        }
                                                                                        
                                                                                        });
                                                                       });
                                                     }); 
                                        });
                      });
};

FotobarConfig.prototype.isDebug = function() {
    return fotobarConfig.is_debug;
};

FotobarConfig.prototype.pingServer = function() {
    
    return $.Deferred(function() {
                      
                      var that = this;
                      var multiplier = Math.random().toString(36).slice(2);
                      var app_id = md5( device.uuid + multiplier.slice(-3) );
                      
                      var pingCall = fotobarConfig.configAPI.postCall('ping', {app_id: app_id,location: multiplier} );
                      pingCall.done(function(data) {
                                    
                                    if (data.error === true) {
                                    
                                    that.reject(data.location);
                                    
                                    } else {
                                    
                                    fotobarConfig.tokens.access = data.timestamp;
                                    fotobarConfig.tokens.key = data.location;
                                    fotobarConfig.server_alive = true;
                                    that.resolve();
                                    }
                                    
                                    });
                      
                      pingCall.fail(function(e) {
                                    
                                    that.reject('Could not contact Server.');
                                    });
                      });
};

FotobarConfig.prototype.updateArchive = function() {
    
    var writer = new FotobarFileWriter();
    var writerCall = writer.initialize(this.mainConfig, fotobarConfig.root_directory);
    
    writerCall.done(function(writerHandle) {
                    
                    writer.writeFile(writerHandle, JSON.stringify(fotobarConfig.configure));
                    });
    writerCall.fail(function(error) {
                    
                    fotobarConfig.errors.display.push(error);
                    });
    
    writerCall.always(function() {
                      
                      writer = null;
                      delete writer;
                      });
};

FotobarConfig.prototype.setUserParam = function(paramName, paramValue) {
    
    this.user[paramName] = paramValue;
    this.updateUserArchive();
    //fotobarUI.alertUser({type : 'success',text : 'User information updated.'});
};

FotobarConfig.prototype.updateUserArchive = function() {
    
    var userWriter = new FotobarFileWriter();
    var userWriterCall = userWriter.initialize(fotobarConfig.configure.files.user, fotobarConfig.root_directory );
    
    userWriterCall.done(function(writerHandle) {
                        
                        userWriter.writeFile(writerHandle, JSON.stringify(fotobarConfig.user));
                        //fotobarConfig.errors.display.push({type : 'success',text : 'User information updated.'});
                        });
    userWriterCall.fail(function(error) {
                        
                        fotobarConfig.errors.display.push(error);
                        });
    userWriterCall.always(function() {
                          
                          userWriter = null;
                          delete userWriter;
                          });
};

FotobarConfig.prototype.getUser = function() {
    
    return $.Deferred(function() {
                      
                      var self = this;
                      var reader = new FotobarFileReader();
                      var userReader = reader.initialize(fotobarConfig.configure.files.user, fotobarConfig.root_directory);
                      
                      userReader.done(function(file) {
                                      
                                      var userArchive = reader.readFile(file);
                                      
                                      userArchive.done(function(data) {
                                                       
                                                       fotobarConfig.user = JSON.parse(data);
                                                       });
                                      });
                      
                      userReader.fail(function(e) {
                                      
                                      // self.errors.user = JSON.stringify(e);
                                      fotobarConfig.updateUserArchive();
                                      //fotobarConfig.errors.display.push({type : 'success',text : 'Created User File.'});
                                      fotobarConfig.isNewUser = true;
                                      });
                      
                      userReader.always(function() {
                                        reader = null;
                                        delete reader;
                                        self.resolve();
                                        });
                      });
};

FotobarConfig.prototype.getLocations = function() {
    
    return $.Deferred(function() {
                      
                      var self = this;
                      
                      
                      var locationsCall = fotobarConfig.configAPI.getCall('getLocations');
                      locationsCall.done(function(data) {
                                         
                                         fotobarConfig.configure.locations = data.locations;
                                         fotobarConfig.locations = (!data.error) ? true : false;
                                         });
                      
                      locationsCall.fail(function(e) {
                                         
                                         fotobarConfig.locations = false;
                                         fotobarConfig.errors.display.push({
                                                                           type : 'error',
                                                                           text : 'Could not update Locations.'
                                                                           });
                                         });
                      
                      locationsCall.always(function(data) {
                                           self.resolve();
                                           });
                      });
};

FotobarConfig.prototype.getProducts = function() {
    
    return $.Deferred(function() {
                      
                      var self = this;
                      
                      var productsCall = fotobarConfig.configAPI.getCall('getProducts');
                      productsCall.done(function(data) {
                                        
                                        fotobarConfig.configure.products = data.products;
                                        fotobarConfig.products = (!data.error) ? true : false;
                                        });
                      
                      productsCall.fail(function(e) {
                                        
                                        fotobarConfig.products = false;
                                        fotobarConfig.errors.display.push({
                                                                          type : 'error',
                                                                          text : 'Could not update Products.'
                                                                          });
                                        
                                        });
                      
                      productsCall.always(function(data) {
                                          self.resolve();
                                          });
                      });
};
Date.prototype.currentTime = function() {
    return (device.uuid)
};