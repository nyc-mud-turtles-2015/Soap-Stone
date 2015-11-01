SoapStone.Map = function () {
  this.outsideDrops = [];
	this.clickableDrops = [];
  $('#set-center').on('click',function(e){
    SoapStone.app.mapView.centerMap();
  });
};

SoapStone.Map.prototype.addClickableDrop = function (drop) {
  this.clickableDrops.push(new SoapStone.Drop(drop));
  this.clickableDrops[this.clickableDrops.length-1].marker.setMap(SoapStone.app.mapView.map)
};

SoapStone.Map.prototype.addOutsideDrop = function (drop) {
	this.outsideDrops.push(new SoapStone.Drop(drop));
  this.outsideDrops[this.outsideDrops.length-1].marker.setMap(SoapStone.app.mapView.map)

};

SoapStone.Map.prototype.clearMarkers = function(){
  this.clickableDrops.forEach(function(drop){
    drop.marker.setMap(null)
  }); 
  this.outsideDrops.forEach(function(drop){
    drop.marker.setMap(null)
  });
  this.clickableDrops = [];
  this.outsideDrops = [];
}

SoapStone.Map.prototype.loadDrops= function (filter) {
  this.clearMarkers();
	var self = this;
	var myUrl = '/drops';
  if (filter){
    myUrl+=filter
  }
  var myPosition = SoapStone.app.mapView.trackingLocation// is this ok to do???????
	return $.ajax({
    url: myUrl,
    method : "get",
    data: { lat: myPosition.lat(), lon : myPosition.lng()}
  })
	.then(function(response) {
    console.log("in the then in map.js")
    var clickableArray = response[0];
    var outsideArray = response[1];
    clickableArray.forEach(function(drop) {
      self.addClickableDrop(drop);
    });
    outsideArray.forEach(function(drop) {
			self.addOutsideDrop(drop);
		});
	});
};

SoapStone.MapView = function () {};

SoapStone.MapView.prototype.getLocation = function() {
return new Promise(function(resolve, reject) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
          var coords = {};
          coords.latitude = position.coords.latitude;
          coords.longitude = position.coords.longitude;
          resolve(coords);
        });
      } else {
          reject(); //Geolocation not available
      }
  });
};


SoapStone.MapView.prototype.init = function () {
  var self = this;
    var mapStyles = [
    {
      featureType: "all",
      elementType: "labels.icon",
      stylers: [
        { visibility: "off" }
      ]
    }
  ];
  return new Promise(function (resolve, reject) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
          self.trackingLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          self.mapProp = {
            center: self.trackingLocation, //find center of collection
            zoom:17,
            streetViewControl: false,
            styles: mapStyles,
            mapTypeId:google.maps.MapTypeId.ROADMAP
         };
         self.map = new google.maps.Map(document.getElementById("googleMap"),self.mapProp);
         self.currentPositionMarker = new google.maps.Marker({
            map: self.map,
            icon: "https://robohash.org/jake.bmp?size=40x40",
            position: self.trackingLocation,
            animation: google.maps.Animation.DROP,
            title: "you are here"
          });
          self.circle = new google.maps.Circle({
            strokeColor: '#0000FF',
            strokeOpacity: 0.25,
            strokeWeight: 2,
            fillColor: '#00FFFF',
            fillOpacity: 0.25,
            map: self.map,
            center: self.trackingLocation,
            radius: 321.869//meters
          });
          resolve(self);
        });
      } else { 
        reject(); //Geolocation not available
      }
  });
};

SoapStone.MapView.prototype.showDrops = function (clickable, outside) {
	var self = this;
  clickable.forEach(function(drop){
    drop.marker.setMap(self.map);
    drop.marker.addListener('click', function() {
      SoapStone.app.showDrop(drop.id);
    });
  });
  outside.forEach(function(drop){
 		drop.marker.setMap(self.map);
	});
};

SoapStone.MapView.prototype.centerMap = function(){
  var self = this;
  self.map.panTo(self.trackingLocation);
};

SoapStone.MapView.prototype.watchCurrentPosition = function() {
  var self = this;
  var positionTimer = navigator.geolocation.watchPosition(function (position) {
    console.log("in the watchCurrentPosition function", self.trackingLocation.lat(), self.trackingLocation.lng() )
      self.trackingLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      setMarkerPosition(self.currentPositionMarker,position);
    });
};

function setMarkerPosition(marker, position) {
  marker.setPosition(new google.maps.LatLng(
    position.coords.latitude,
    position.coords.longitude)
  );
}



