SoapStone.Controller = function() {
  this.dropView = new SoapStone.DropView();
  this.dropView.controller = this;
  this.mapView = new SoapStone.MapView();
  this.mapView.controller = this;

  this.mapView.watchCurrentPosition();
  this.drops = new SoapStone.Map();
  this.loadDrops();
};

SoapStone.Controller.prototype.createDrop = function(dropParams) {
  this.dropView.getLocation().then(function(location) {
    var dropData = {
      text: dropParams.text,
      photo: dropParams.photo,
      coords: location
    };
    var drop = new SoapStone.Drop(dropData);
    drop.save()
    .then(function(response) {console.log(response);})
    .fail(function(response) {console.log(response);});
  });
};

SoapStone.Controller.prototype.showDrop = function(id) {
  var self = this;
  drop = new SoapStone.Drop();
  drop.find(id).then(function(drop) {
    self.dropView.showDrop(drop);
  });
};

SoapStone.Controller.prototype.loadDrops = function() {
  var self = this;
  return this.mapView.init().then(function () {
    self.drops.loadDrops().then(function(){
      self.mapView.showDrops(self.drops);
    });
  });
};
