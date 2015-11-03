SoapStone.Map = function () {
  this.outsideDrops = [];
	this.clickableDrops = [];
  $('#set-center').on('click',function(e){
    SoapStone.app.mapView.centerMap();
  });
};

SoapStone.Map.prototype.addClickableDrop = function (dropData) {
  var drop = new SoapStone.Drop(dropData);
  if (drop.lat && drop.lon) {
    drop.marker = new google.maps.Marker({
      position: new google.maps.LatLng(drop.lat, drop.lon),
      icon: {
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,//'M -2,0 0,-2 2,0 0,2 z',//
        scale: 6,
        strokeColor: "hsl("+drop.user.hue+",80%,50%)",
        strokeWeight: 1
      }
    });
    drop.marker.setMap(SoapStone.app.mapView.map);
    SoapStone.app.map.clickableDrops.unshift(drop);//bad???? why was 'this' the window and not a map?
  }
};

SoapStone.Map.prototype.addOutsideDrop = function (dropData) {
  var drop = new SoapStone.Drop(dropData);
  if (drop.lat && drop.lon) {
  drop.marker = new google.maps.Marker({
    position: new google.maps.LatLng(drop.lat, drop.lon),
    icon: {
      path: google.maps.SymbolPath.BACKWARD_OPEN_ARROW,
      scale: 4,
      strokeColor: "hsl("+drop.user.hue+",30%,50%)",
      strokeWeight: 3
    }
  });
  drop.marker.setMap(SoapStone.app.mapView.map);
  SoapStone.app.map.outsideDrops.unshift(drop);
  }
};

SoapStone.Map.prototype.clearMarkers = function(){
  this.clickableDrops.forEach(function(drop){
    drop.marker.setMap(null);
  }); 
  this.outsideDrops.forEach(function(drop){
    drop.marker.setMap(null);
  });
  this.clickableDrops = [];
  this.outsideDrops = [];
};

SoapStone.Map.prototype.refreshDrops = function (filter) {
  var self = this;
  var myUrl = '/drops';
  var myPosition = SoapStone.app.mapView.trackingLocation;
  var myData = { lat: myPosition.lat(), lon: myPosition.lng() }
  if (filter){
    if (typeof filter !== "number"){
      myUrl+=filter;
    }else{
      myData.user_id = filter;
    }
  }
  return $.ajax({
    url: myUrl,
    method : "get",
    data: myData,
    dataType: 'json'
  })
  .then(function(response) {
    var clickableArray = response[0];
    var outsideArray = response[1];
    clickableArray.updateDropsArray(self.addClickableDrop, self.clickableDrops, self.outsideDrops, 50)
    outsideArray.updateDropsArray(self.addOutsideDrop, self.outsideDrops, self.clickableDrops, 100)
  });
};

SoapStone.Map.prototype.loadDrops = function (filter) {
  this.clearMarkers();
	var self = this;
  var myPosition = SoapStone.app.mapView.trackingLocation;
  var myData = { lat: myPosition.lat(), lon: myPosition.lng() }
  var myUrl = '/drops';//drops/filter
  if (filter){
    if (typeof filter !== "number"){
      myUrl+=filter;
    }else{
      myData.user_id = filter;
    }
  }
	return $.ajax({
    url: myUrl,
    method : "get",
    data: myData,
    dataType: 'json'
  })
	.then(function(response) {
    
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

SoapStone.MapView = function () {
  this.filter = null;
};

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
  var mapStyles = [{featureType: "all",
      elementType: "labels.icon",
      stylers: [
        { visibility: "off" }
      ]
    },
    {
    "featureType": "landscape",
    "stylers": [
      {
        "hue": "#FF0300"
      },
      {
        "saturation": -100
      },
      {
        "lightness": 156
      },
      {
        "gamma": 1
      }
    ]
  },
  {
    "featureType": "road.highway",
    "stylers": [
      {
        "hue": "#FF2500"
      },
      {
        "saturation": -100
      },
      {
        "lightness": 138.60000000000002
      },
      {
        "gamma": 1
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "stylers": [
      {
        "hue": "#7F00FF"
      },
      {
        "saturation": -71.42857142857149
      },
      {
        "lightness": 45.709803921568636
      },
      {
        "gamma": 1
      }
    ]
  },
  {
    "featureType": "road.local",
    "stylers": [
      {
        "hue": "#7F00FF"
      },
      {
        "saturation": -71.42857142857149
      },
      {
        "lightness": 46.50980392156862
      },
      {
        "gamma": 1
      }
    ]
  },
  {
    "featureType": "water",
    "stylers": [
      {
        "hue": "#0078FF"
      },
      {
        "saturation": 0
      },
      {
        "lightness": 47
      },
      {
        "gamma": 1
      }
    ]
  },
  {
    "featureType": "poi",
    "stylers": [
      {
        "hue": "#FF1B00"
      },
      {
        "saturation": -95.8
      },
      {
        "lightness": 143.8
      },
      {
        "gamma": 1
      }
    ]}];//folded text for the style press command option ']' to unfold or '[' to refold
  return new Promise(function (resolve, reject) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
          self.trackingLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          self.mapProp = {
            center: self.trackingLocation, //find center of collection
            zoom:17,
            zoomControlOptions: {
              position: google.maps.ControlPosition.TOP_RIGHT
            },
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
            radius: 330 * 0.3048 //feet to meters
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
    if (drop.hasEventListener == null){
      drop.marker.addListener('click', function() {
        SoapStone.app.showDrop(drop.id);
      });
      drop.hasEventListener = true;
    }
    if(drop.marker.map == null){
      drop.marker.setMap(self.map);
    };
  });
  outside.forEach(function(drop){
    if (drop.hasEventListener){
      drop.marker.removeListener('click', function() {//remove??
        SoapStone.app.showDrop(drop.id);
      });
      drop.hasEventListener = null;
    }
    if(drop.marker.map == null){
      drop.marker.setMap(self.map);
    };
  });
};

SoapStone.MapView.prototype.centerMap = function(){
  var self = this;
  self.map.panTo(self.trackingLocation);
};

SoapStone.MapView.prototype.watchCurrentPosition = function() {
  var self = this;
  var positionTimer = navigator.geolocation.watchPosition(function (position) {
    console.log("in the watchCurrentPosition function");
    console.log("lat: ",self.trackingLocation.lat());
    console.log("lng: ",self.trackingLocation.lng());
    self.trackingLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    setMarkerPosition(self.currentPositionMarker,position);
    setCirclePosition(self.circle, position);
    self.controller.refreshDrops(self.filter);
  });
};

function setMarkerPosition(marker, position) {
  marker.setPosition(new google.maps.LatLng(
    position.coords.latitude,
    position.coords.longitude)
  );
}

function setCirclePosition(circle, position) {
  circle.setCenter(new google.maps.LatLng(
    position.coords.latitude,
    position.coords.longitude)
  );
}



