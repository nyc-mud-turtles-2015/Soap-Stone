SoapStone.Drop = function(args) {
  this.coords = {};
  this.coords.longitude = args.coords.longitude;
  this.coords.latitude = args.coords.latitude;
  this.text = args.text;
  this.photo = args.photo;
};

SoapStone.Drop.prototype.save = function() {
  var data = {};
  data.drop = {};
  for (var key in this) {
    if (this.hasOwnProperty(key)) {
      data.drop[key] = this[key];
    }
  }
  console.log(data);
  return $.ajax({
    type: "POST",
    url:  "/drops",
    data: data
  });
};

SoapStone.DropView = function() {};

SoapStone.DropView.prototype.getLocation = function() {
return new Promise(function(resolve, reject) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
          var coords = {};
          coords.latitude = position.coords.latitude;
          coords.longitude = position.coords.longitude;
          resolve(coords);
        });
      } else {
          reject("Geolocation Not Available");
      }
  });
};

var view = new SoapStone.DropView();
view.getLocation().then(function(location) {
  var drop = new SoapStone.Drop({coords: location});
  drop.save()
  .then(function(response) {console.log(response);})
  .fail(function(response) {console.log(response);});
});


