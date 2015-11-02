SoapStone.Controller = function() {
  this.dropView = new SoapStone.DropView();
  this.dropView.controller = this;
  this.mapView = new SoapStone.MapView();
  this.mapView.controller = this;

  this.mapView.watchCurrentPosition();
  this.map = new SoapStone.Map();
  this.initDrops();
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
    self.dropView.showUploadSuccess.bind(self.dropView)() 
    var drop = this;
    drop.marker = new google.maps.Marker({
      map: self.mapView.map,
      position: new google.maps.LatLng(drop.lat, drop.lon),
      animation: google.maps.Animation.DROP,
      icon: {
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 6,
        strokeColor: "hsl("+drop.calculateUserColor(response.user_id)+",80%,50%)",
        strokeWeight: 1
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

SoapStone.Controller.prototype.initDrops = function() {
  var self = this;
  return this.mapView.init().then(function () {
    self.map.loadDrops().then(function(){
      self.mapView.showDrops(self.map.clickableDrops, self.map.outsideDrops);
      self.dropView.clearDropList();
      self.dropView.showDropList(self.map.clickableDrops);
      self.pollDrops()
    });
  });
};

SoapStone.Controller.prototype.pollDrops = function (){
    var self = this;
    console.log("in the poll drops function")
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
}
