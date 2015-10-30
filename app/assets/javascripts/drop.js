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

SoapStone.Controller = function() {
  this.view = new SoapStone.DropView();
  this.view.controller = this;
};

SoapStone.Controller.prototype.createDrop = function(dropParams) {
  this.view.getLocation().then(function(location) {
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

SoapStone.app = new SoapStogne.Controller();

//this needs to go in the event handler for form posting
SoapStone.app.createDrop({});





