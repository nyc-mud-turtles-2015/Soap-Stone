
// google.maps.event.addDomListener(window, 'load', initialize); sync



var x = document.getElementById("demo");

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}


function showPosition(position) {
    // var latlon = position.coords.latitude + "," + position.coords.longitude;
    var latlon = "40.706547761016004,-74.00974883127942"
    var img_url = "http://maps.googleapis.com/maps/api/staticmap?center="
    +latlon+"&zoom=14&size=400x300&sensor=false";
    document.getElementById("mapholder").innerHTML = "<img src='"+img_url+"'>";
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            x.innerHTML = "User denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            x.innerHTML = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            x.innerHTML = "The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            x.innerHTML = "An unknown error occurred."
            break;
    }
}

var App = {};

var Drop = function (drop) {
  this.id = drop.id;
	this.user = drop.user_id;
	this.text = drop.text;
	this.latlon = convertToLatLon(drop.lonlat); //needs conversion
	this.photo = drop.photo;
	this.snaps_count = drop.snaps_count;
	this.comments_count = drop.comments_count;
	this.updated_at = drop.updated_at;
	this.contentString =  '<div id="content">'+
      '<div id="siteNotice">'+
      '</div>'+
      '<h1 id="firstHeading" class="firstHeading">'+this.text+'</h1>'+
      '<div id="bodyContent">'+
      '<p><b>'+this.user_id+'</b>, has '+this.comments_count+' comments and '+this.snaps_count+' snaps</p>'+
      '<p><img src="https://robohash.org/'+this.photo+'.png">'+
      '('+this.updated_at+').</p>'+
      '</div>'+
      '</div>';
  this.marker= new google.maps.Marker({
	  position:new google.maps.LatLng(this.latlon[0],this.latlon[1]),
	  title: this.user_id
  });
  this.infowindow= new google.maps.InfoWindow({
    content: this.contentString
  });

};

function convertToLatLon(lonlat) {
	var dataPoints = lonlat.replace(/[()]/g, '').split(' ');
	return [Number(dataPoints[2]),Number(dataPoints[1])];
}

SoapStone.Map = function () {
	this.drops = [];
};

SoapStone.Map.prototype.addDrop = function (drop) {
	this.drops.push(new Drop(drop));
}

SoapStone.Map.prototype.loadDrops= function () {
	var self = this;
	var url = '/drops'
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
            zoom:15,
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
  self.map.panTo(self.trackingLocation)
};

SoapStone.MapView.prototype.watchCurrentPosition = function() {
  var self = this;
  var positionTimer = navigator.geolocation.watchPosition(function (position) {
    console.log("in the watchCurrentPosition function", self.trackingLocation.lat(), self.trackingLocation.lng() )
      self.trackingLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      setMarkerPosition(self.currentPositionMarker,position);
    });
}
function setMarkerPosition(marker, position) {
  marker.setPosition(new google.maps.LatLng(
    position.coords.latitude,
    position.coords.longitude)
  );
}

var Controller = function() {
	this.mapView = new SoapStone.MapView();
	this.drops = new SoapStone.Map();
	this.loadDrops();
};

Controller.prototype.loadDrops = function() {
	var self = this;
	return this.mapView.init().then(function () {
    self.drops.loadDrops().then(function(){
  		self.mapView.showDrops(self.drops);
  	});
  });
};

$(document).ready(function() {
	App.controller = new Controller();
  App.controller.mapView.watchCurrentPosition();

  var test = App.controller;
  $('#set-center').on('click',function(e){
    test.mapView.centerMap();
  })

});
