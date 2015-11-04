var TRACKING_TESTING_ON = true;
var TRACKING_TESTING_LAT = 40.704887199999995, TRACKING_TESTING_LON = -74.0123736;
moveMe = function (i) {
  console.log("moving you");
  var self = SoapStone.app.mapView;
  self.trackingLocation =  new google.maps.LatLng(TRACKING_TESTING_LAT += i/10000, TRACKING_TESTING_LON += i/10000);
  self.setCirclePosition(self.circle, {coords: {latitude: TRACKING_TESTING_LAT += i/10000, longitude: TRACKING_TESTING_LON += i/10000}});
  self.controller.refreshDrops();
};


SoapStone.Map = function () {
  this.allDrops = [];
 //  this.outsideDrops = [];
	// this.clickableDrops = [];
  $('#set-center').on('click',function(e){
    SoapStone.app.mapView.centerMap();
  });
};

SoapStone.Map.prototype.addClickableDrop = function (dropData) {
  var drop = new SoapStone.Drop(dropData);
  if (drop.lat && drop.lon) {
    drop.marker = new google.maps.Marker({
      position: new google.maps.LatLng(drop.lat, drop.lon),
      cursor: 'crosshair',
      icon: {
        path: 'M -2,0 0,-2 2,0 0,2 z',//google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 1,//4,
        strokeColor: "hsla("+drop.user.hue+",100%,50%,0.9)",
        strokeWeight: 5//3
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
    clickable: false,
    icon: {
      path: 'M -2,0 0,-2 2,0 0,2 z',//google.maps.SymbolPath.BACKWARD_OPEN_ARROW,
      scale: 4,
      strokeColor: "hsl("+drop.user.hue+",30%,50%)",
      strokeWeight: 3,
    }
  });
  drop.marker.setMap(SoapStone.app.mapView.map);
  SoapStone.app.map.outsideDrops.unshift(drop);
  }
};

SoapStone.Map.prototype.clearMarkers = function(){
  this.allDrops.forEach(function(drop){
    drop.marker.setMap(null);
  }); 
  this.allDrops = [];
};

SoapStone.Map.prototype.hitTheDataBaseForDrops = function (filter) {
  debugger;
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
    self.addSurroundingDrops(response);//takes all the data within a mileish and turns them into drops and puts them on an array at self.allDrops
    // var clickableArray = response[0];
    // var outsideArray = response[1];
    // clickableArray.updateDropsArray(self.addClickableDrop, self.clickableDrops, self.outsideDrops, 50)
    // outsideArray.updateDropsArray(self.addOutsideDrop, self.outsideDrops, self.clickableDrops, 100)
  });
};

SoapStone.Map.prototype.loadDrops = function (filter) {
  this.clearMarkers();
  debugger;
	var self = this;
  var myPosition = self.controller.mapView.trackingLocation;
  var myData = { lat: myPosition.lat(), lon: myPosition.lng() }
  var myUrl = '/drops';//drops/filter
  if (filter){
    if (typeof filter !== "number"){
      myUrl+=filter;// '/followees'
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
	.then(function(response) {//response should be ONE array of all drops within a mileish
    debugger;
    self.addSurroundingDrops(response);
	});
};

// SoapStone.MapView.prototype.getLocation = function() {
//     return new Promise(function(resolve, reject) {
//       if ("geolocation" in navigator) {
//         navigator.geolocation.getCurrentPosition(function(position) {
//           var coords = {};
//           coords.latitude = position.coords.latitude;
//           coords.longitude = position.coords.longitude;
//           resolve(coords);
//         });
//       } else {
//           reject(); //Geolocation not available
//       }
//   });
// };

SoapStone.MapView = function () {
  this.filter = null;
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
          if (TRACKING_TESTING_ON) {
            self.trackingLocation = new google.maps.LatLng(TRACKING_TESTING_LAT, TRACKING_TESTING_LON);
          } else {
            self.trackingLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);  
          }
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
          self.circle = new google.maps.Circle({
            strokeColor: '#0000FF',
            strokeOpacity: 0.25,
            strokeWeight: 2,
            fillColor: '#00FFFF',
            fillOpacity: 0.25,
            map: self.map,
            center: self.trackingLocation,//new google.maps.LatLng(TRACKING_TESTING_LAT, TRACKING_TESTING_LON),//self.trackingLocation,
            radius: 330 * 0.3048 //feet to meters
          });
          resolve(self);
        });
      } else { 
        reject(); //Geolocation not available
      }
  });
};

SoapStone.MapView.prototype.showDrops = function (allDrops) {
	var self = this;
  debugger;
  allDrops.forEach(function(drop){
    if(drop.withinRange){
      if (drop.hasEventListener == null){
        drop.marker.addListener('click', function() {
          SoapStone.app.showDrop(drop.id);
        })
      }
      drop.hasEventListener = true;
    }else{
      if (drop.hasEventListener){
        drop.marker.removeListener('click', function() {//remove??
          SoapStone.app.showDrop(drop.id);
        });
      }
      drop.hasEventListener = null;
    }
  });
};


SoapStone.MapView.prototype.centerMap = function(){
  var self = this;
  self.map.panTo(self.trackingLocation);
};

SoapStone.MapView.prototype.watchCurrentPosition = function() {
  var self = this;
  navigator.geolocation.watchPosition(function (position) {
    if (TRACKING_TESTING_ON) {
      self.trackingLocation = new google.maps.LatLng(TRACKING_TESTING_LAT, TRACKING_TESTING_LON);
    } else {
      self.trackingLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);  
    }
    self.setCirclePosition(self.circle, position);
    debugger;
    self.controller.map.refreshDrops();
  });
};

SoapStone.MapView.prototype.setCirclePosition = function (circle, position) {
  circle.setCenter( new google.maps.LatLng(
    position.coords.latitude,
    position.coords.longitude)
  );
};



