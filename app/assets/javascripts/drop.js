SoapStone.Drop = function(args) {
  this.coords = {};
  this.coords.longitude = args.coords.longitude;
  this.coords.latitude = args.coords.latitude;
  this.text = args.text;
  this.photo = args.photo;
};

SoapStone.Drop.prototype.save = function() {
  return $.ajax({
    type: "POST",
    url:  "/drops",
    data: this
  });
};

SoapStone.DropView = function() {};

SoapStone.DropView.prototype.getLocation = function() {
return new Promise(function(resolve, reject) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
          resolve(position.coords);
        });
      } else {
          reject("Geolocation Not Available");
      }
  });
};

var view = new SoapStone.DropView();
view.getLocation().then(function(location) {
  var drop = new SoapStone.Drop({coords: location});
  drop.save();
});


