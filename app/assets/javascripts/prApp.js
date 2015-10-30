
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

var Drops = function () {
	this.drops = [];
};

Drops.prototype.addDrop = function (drop) {
	this.drops.push(new Drop(drop));
}

Drops.prototype.loadDrops= function () {
	var self = this;
	var url = '/drops'
	return $.get(url)
	.then(function(response) {
		response.forEach(function(drop) {
			self.addDrop(drop);
		});
	});
};

var DropsView = function () {
  var self = this;
  navigator.geolocation.getCurrentPosition(function(position){
    var currentLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    self.mapProp = {
      center: currentLocation, //find center of collection
      zoom:15,
      mapTypeId:google.maps.MapTypeId.ROADMAP
   };
   self.currentPositionMarker = new google.maps.Marker({
      position: currentLocation,
      animation: google.maps.Animation.DROP,
      title: "you are here"
    });
    debugger;
   self.map = new google.maps.Map(document.getElementById("googleMap"),self.mapProp);
  })
}

DropsView.prototype.showDrops = function (drops) {
	var self = this;
	drops.drops.forEach(function(drop){
 		drop.marker.setMap(self.map);
 		// debugger;
 		drop.marker.addListener('click', function() {
    	//drop.infowindow.open(self.map, drop.marker);
      SoapStone.app.showDrop(drop.id);
    });
	});
};

DropsView.prototype.centerMap = function(){
  var self = this;
  navigator.geolocation.getCurrentPosition(function(position){
  self.map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude), 1);//second aurg?S
  });
};
DropsView.prototype.watchCurrentPosition = function() {
  var positionTimer = navigator.geolocation.watchPosition(function (position) {
      setMarkerPosition(this.currentPositionMarker,position);
    });
}
function setMarkerPosition(marker, position) { 
  marker.setPosition(new google.maps.LatLng( 
    position.coords.latitude,
    position.coords.longitude)
  );
}

var Controller = function() {
	this.dropsView = new DropsView();
	this.drops = new Drops();
	this.loadDrops();
};

Controller.prototype.loadDrops = function() {
	var self = this;
	return this.drops.loadDrops().done(function(){
		self.dropsView.showDrops(self.drops);
	});
}

$(document).ready(function() {
	App.controller = new Controller();
  var test = App.controller;
  $('#set-center').on('click',function(e){
    test.dropsView.centerMap();
  })

});
