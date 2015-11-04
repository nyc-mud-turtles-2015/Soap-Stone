SoapStone.Map.prototype.addSurroundingDrops = function (allDropsData) {//allDropData is the array of all point we get from the ajax
  var self = this;//the map
  self.allDrops.forEach(function (drop, i) {
    drop.marker.setMap(null);
  });
  self.allDrops = [];
  allDropsData.forEach(function (dropData) {
    self.allDrops.push(self.addDrop(dropData));
  });
  this.controller.mapView.showDrops(self.allDrops);
};


SoapStone.Map.prototype.addDrop = function (dropData) {
  var self = this;
  var drop = new SoapStone.Drop(dropData);
  if (drop.lat && drop.lon) {//sanity check
    var iconObj;
    if (drop.distanceFromTarget(self.controller.mapView.trackingLocation) > 330){
      drop.withinRange = false;
      iconObj = {
        path: 'M -2,0 0,-2 2,0 0,2 z',//google.maps.SymbolPath.BACKWARD_OPEN_ARROW,
        scale: 4,
        strokeColor: "hsla("+drop.user.hue+",100%,50%,0.4)",
        strokeWeight: 2
      }
    }else{
      drop.withinRange = true;
      iconObj = {
        path: 'M -2,0 0,-2 2,0 0,2 z',//google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 1,//4,
        strokeColor: "hsla("+drop.user.hue+",100%,50%,0.9)",
        strokeWeight: 5//3
      }
    }
    drop.marker = new google.maps.Marker({
      position: new google.maps.LatLng(drop.lat, drop.lon),
      icon: iconObj
    });
    drop.marker.setMap(self.controller.mapView.map);
  }
  return drop;
};

SoapStone.Map.prototype.refreshDrops = function () {
  var self = this;
  self.allDrops.forEach(function(drop){
    var distance = drop.distanceFromTarget(self.controller.mapView.trackingLocation);//fuck demeter
    
    console.log("      ME: ", self.controller.mapView.trackingLocation.lat(), self.controller.mapView.trackingLocation.lng())
    console.log("   Other: ", drop.googleLatLng.lat(), drop.googleLatLng.lng())
    console.log("DISTANCE: ", distance)
    if (distance > 330){//refactor the 330 to be an attribute on the map instead of just being here
      drop.withinRange = false;
      drop.marker.icon = {
        path: 'M -2,0 0,-2 2,0 0,2 z',//google.maps.SymbolPath.BACKWARD_OPEN_ARROW,
        scale: 4,
        strokeColor: "hsla("+drop.user.hue+",100%,50%,0.4)",
        strokeWeight: 2
      }
    }else{
      drop.withinRange = true;
      drop.marker.icon = {
        path: 'M -2,0 0,-2 2,0 0,2 z',//google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 1,//4,
        strokeColor: "hsla("+drop.user.hue+",100%,50%,0.9)",
        strokeWeight: 5//3
      }
    }
  });//forEach
  debugger;
  self.controller.mapView.showDrops(self.allDrops);
};