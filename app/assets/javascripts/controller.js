SoapStone.Controller = function() {
  if ($("[data-view='map']").exists()) {
    this.dropView = new SoapStone.DropView();
    this.dropView.controller = this;
    this.mapView = new SoapStone.MapView();
    this.mapView.controller = this;
    this.mapView.watchCurrentPosition();
    this.map = new SoapStone.Map();
    var userId = this.getUserId();
    this.initDrops(userId);
  }
  if ($("[data-view='user']").exists()) {
    this.user = new SoapStone.User();
    this.userView = new SoapStone.UserView();
    Promise.all([this.loadFollows(), this.loadDrops()]).then(function() {
      //viewstuff
    });
  }
};

SoapStone.Controller.prototype.getUserId = function(){
  var match = /user_id=(\d*)/.exec( location.href);
  if (match){
    return match[1]-0;//the -0 is to turn it into a number
  }
  else{
    return false;
  }
};

SoapStone.Controller.prototype.createDrop = function(form) {
  var self = this;
  var dropData = {
    lat: this.mapView.trackingLocation.lat(),
    lon: this.mapView.trackingLocation.lng()
  };
  var drop = new SoapStone.Drop(dropData);
  var formData = new FormData($(form)[0]);
  this.dropView.showUploadIndicator();
  drop.save(formData)
  .then(function (response) { 
    self.dropView.showUploadSuccess.bind(self.dropView)();
    var drop = this;
    drop.marker = new google.maps.Marker({
      map: self.mapView.map,
      position: new google.maps.LatLng(drop.lat, drop.lon),
      // animation: google.maps.Animation.DROP,
      icon: {
        path: 'M -2,0 0,-2 2,0 0,2 z',//google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 4,
        strokeColor: "hsla("+drop.user.hue+",100%,50%,0.9)",
        strokeWeight: 3
      }
    });
  }.bind(drop))
  .fail(self.dropView.showUploadFailure.bind(self.dropView));
};

SoapStone.Controller.prototype.showDrop = function(id) {
  var self = this;
  drop = new SoapStone.Drop();
  drop.find(id).then(function(drop) {
    self.dropView.showDrop(drop);
  });
};

SoapStone.Controller.prototype.initDrops = function(filter) {
  var self = this;
  self.mapView.filter = filter;
  return self.mapView.init().then(function () {
    self.map.loadDrops(self.mapView.filter).then(function(){
      self.mapView.showDrops(self.map.clickableDrops, self.map.outsideDrops);
      self.dropView.clearDropList();
      self.dropView.showDropList(self.map.clickableDrops);
      self.pollDrops();
    });
  });
};

SoapStone.Controller.prototype.pollDrops = function (){
    var self = this;
    console.log("in the poll drops function");
    window.recentPollInterval = setInterval(function(){
      self.refreshDrops(self.mapView.filter);
    }, 5000);
};

SoapStone.Controller.prototype.refreshDrops = function(filter) {
  var self = this;
  self.mapView.filter = filter;
  self.map.refreshDrops(filter).then(function(){
    self.mapView.showDrops(self.map.clickableDrops, self.map.outsideDrops);
    self.dropView.clearDropList();
    self.dropView.showDropList(self.map.clickableDrops);
  });
};

SoapStone.Controller.prototype.loadDrops = function(filter) {
  var self = this;
  self.mapView.filter = filter;
  self.map.loadDrops(filter).then(function(){
    self.mapView.showDrops(self.map.clickableDrops, self.map.outsideDrops);
    self.dropView.clearDropList();
    self.dropView.showDropList(self.map.clickableDrops);
  });
};

SoapStone.Controller.prototype.addSnap = function(drop){
  var self = this;
  drop.addSnap().then(function(){
    self.dropView.updateSnapButton(drop);
  });
};

SoapStone.Controller.prototype.createComment = function(drop){
  var self = this;
  drop.createComment().then(function () {
    self.dropView.updateComments(drop);
  });
};

SoapStone.Controller.prototype.loadFollows = function() {
  var self = this;
  id = location.href.split('/').slice(-1);
  return this.user.loadFollows(id);  
};

