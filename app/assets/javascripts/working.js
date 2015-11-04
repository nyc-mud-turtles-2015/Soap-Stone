SoapStone.Map.prototype.addSurroundingDrops = function (allDropsData) {//allDropData is the array of all point we get from the ajax
  var self = this;//the map
  self.allDrops.forEach(function (drop, i) {
    drop.marker.setMap(null);
  });
  self.allDrops = [];
  allDropsData.forEach(function (dropData) {
    self.allDrops.push(self.addDrop(dropData));
  });
  this.refreshDrops();
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
  var closeDrops = [];
  self.allDrops.forEach(function(drop){
    var distance = drop.distanceFromTarget(self.controller.mapView.trackingLocation);//fuck demeter
    if (distance > 330){//refactor the 330 to be an attribute on the map instead of just being here
      drop.withinRange = false;
      drop.marker.setIcon({
        path: 'M -2,0 0,-2 2,0 0,2 z',//google.maps.SymbolPath.BACKWARD_OPEN_ARROW,
        scale: 4,
        strokeColor: "hsla("+drop.user.hue+",100%,50%,0.4)",
        strokeWeight: 2}
      )
    }else{
      drop.withinRange = true;
      closeDrops.push(drop);
      drop.marker.setIcon({
        path: 'M -2,0 0,-2 2,0 0,2 z',//google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 1,//4,
        strokeColor: "hsla("+drop.user.hue+",100%,50%,0.9)",
        strokeWeight: 5}//3
      )
    }
  });//forEach
  self.pinClutterHelper(closeDrops);
  self.controller.mapView.showDrops(self.allDrops);
  self.controller.dropView.clearDropList();
    var turnedOnDrops = self.allDrops.filter(function(drop){//check for drop.withinRange == true
      return drop.withinRange;
    });
  self.controller.dropView.showDropList(turnedOnDrops);
};

SoapStone.Map.prototype.pinClutterHelper = function (closeDrops) {
  var pinClutterLimit = 30;
  var newestCloseDrops = closeDrops.sort(function (drop) {return drop.created_at}).reverse();
  filteredOutDrops = [];
  if (newestCloseDrops.length > pinClutterLimit) {
    filteredOutDrops = newestCloseDrops.splice(pinClutterLimit);
  }
  filteredOutDrops.forEach(function (drop) {
    drop.marker.setMap(null);
  })
};