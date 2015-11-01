SoapStone.Controller = function() {
  this.dropView = new SoapStone.DropView();
  this.dropView.controller = this;
  this.mapView = new SoapStone.MapView();
  this.mapView.controller = this;

  this.mapView.watchCurrentPosition();
  this.map = new SoapStone.Map();
  this.initDrops();
};

SoapStone.Controller.prototype.createDrop = function() {
  var dropData = {
    lat: this.mapView.trackingLocation.lat(),
    lon: this.mapView.trackingLocation.lng()
  };
  var drop = new SoapStone.Drop(dropData);
  drop.save()
  .then(function(response) {console.log(response);})
  .fail(function(response) {console.log(response);});
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
  console.log("in the controller load drops");
  console.log("XXXXX",this.mapView);
  return this.mapView.init().then(function () {
    console.log("in the mapView init")
    self.map.loadDrops().then(function(){
      self.mapView.showDrops(self.map.clickableDrops, self.map.outsideDrops);
    });
  });
};

SoapStone.Controller.prototype.loadDrops = function(filter) {
  var self = this;
  console.log("in the controller load drops");
  console.log("XXXXX",this.mapView);
  console.log("in the mapView init")
  self.map.loadDrops(filter).then(function(){
    self.mapView.showDrops(self.map.clickableDrops, self.map.outsideDrops);
  });
};

