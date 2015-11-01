SoapStone.Map = function () {
	this.drops = [];
  $('#set-center').on('click',function(e){
    SoapStone.app.mapView.centerMap();
  });
};

SoapStone.Map.prototype.addDrop = function (drop) {
	this.drops.push(new SoapStone.Drop(drop));
};

SoapStone.Map.prototype.loadDrops= function () {
	var self = this;
	var url = '/drops';
	return $.get(url)
	.then(function(response) {
		response.forEach(function(drop) {
			self.addDrop(drop);
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
            radius: 60
          });
          resolve(self);
        });
      } else { 
        reject(); //Geolocation not available
      }
  });
};

SoapStone.MapView.prototype.showDrops = function (drops) {
	var self = this;
  console.log(self);
	drops.drops.forEach(function(drop){
 		drop.marker.setMap(self.map);
 		drop.marker.addListener('click', function() {
    	//drop.infowindow.open(self.map, drop.marker);
      SoapStone.app.showDrop(drop.id);
    });
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



