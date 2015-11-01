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
  return this.mapView.init().then(function () {
    self.map.loadDrops().then(function(){
      self.mapView.showDrops(self.map.clickableDrops, self.map.outsideDrops);
    });
  });
};

SoapStone.Controller.prototype.loadDrops = function(filter) {
  var self = this;
  self.map.loadDrops(filter).then(function(){
    self.mapView.showDrops(self.map.clickableDrops, self.map.outsideDrops);
  });
};

SoapStone.Controller.prototype.addSnap = function(drop){
  var self = this;
  drop.addSnap().then(function(){
    self.dropView.updateSnapButton(drop)
  });
}
