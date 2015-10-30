
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

// Drop.prototype.save = function() {
// 	var url = '/drops';
// 	var data = { user: this.user,
// 		text: this.text, 
// 		lonlat: this.lonlat,
// 		photo: this.photo,
// 		snaps_count: this.snaps_count,
// 		comments_count: this.comments_count};
// 	return $.ajax({
// 		type: "POST",
// 		url: url,
// 		data: data
// 	});
// }

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
	var url = '/drops/show'
	return $.get(url)
	.then(function(response) {
		response.forEach(function(drop) {
			self.addDrop(drop);
		});
	});
};

// function initialize() {
// 	App.controller = new Controller();
// 	App.controller.loadDrops();
//   var mapProp = {
//     center:new google.maps.LatLng(40.7127,-74.0059),
//     zoom:5,
//     mapTypeId:google.maps.MapTypeId.ROADMAP
//   };
//   var map=new google.maps.Map(document.getElementById("googleMap"),mapProp);

//  	App.controller.drops.drops.forEach(function(drop){
//  		drop.marker.setMap(map);
//  		drop.marker.addListener('click', function() {
//     drop.infowindow.open(map, drop.marker);
//     // debugger;
//   	});
//  	});
// }

// function loadScript() {
//   var script = document.createElement("script");
//   script.type = "text/javascript";
//   script.src = "http://maps.googleapis.com/maps/api/js?key=&sensor=false&callback=initialize";
//   document.body.appendChild(script);
// }

// window.onload = loadScript; //async

var DropsView = function () {
 this.mapProp = {
    center:new google.maps.LatLng(40.7064,-74.0078), //find center of collection
    zoom:16,
    mapTypeId:google.maps.MapTypeId.ROADMAP
 };
 this.map = new google.maps.Map(document.getElementById("googleMap"),this.mapProp); 
}

DropsView.prototype.showDrops = function (drops) {
	var self = this;
	drops.drops.forEach(function(drop){
 		drop.marker.setMap(self.map);
 		// debugger;
 		drop.marker.addListener('click', function() {
    	drop.infowindow.open(self.map, drop.marker);
    });
	});
};

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
});