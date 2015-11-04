SoapStone.Controller = function() {
  if ($("[data-view='map']").exists()) {
    this.dropView = new SoapStone.DropView();
    this.dropView.controller = this;
    this.mapView = new SoapStone.MapView();
    this.mapView.controller = this;
    // this.mapView.watchCurrentPosition();
    this.map = new SoapStone.Map();
    this.map.controller = this;
    var userId = this.getUserId();
    this.initDrops(userId);
  }
  if ($("[data-view='user']").exists()) {
    this.user = new SoapStone.User();
    this.userView = new SoapStone.UserView();
    Promise.all([this.loadFollows(), this.loadDrops()]).then(function() {
      //viewstuff
    });
  }
};

SoapStone.Controller.prototype.getUserId = function(){
  var match = /user_id=(\d*)/.exec( location.href);
  if (match){
    return match[1]-0;//the -0 is to turn it into a number
  }
  else{
    return false;
  }
};

SoapStone.Controller.prototype.createDrop = function(form) {
  var self = this;
  var dropData = {
    lat: this.mapView.trackingLocation.lat(),
    lon: this.mapView.trackingLocation.lng()
  };
  var drop = new SoapStone.Drop(dropData);
  var formData = new FormData($(form)[0]);
  this.dropView.showUploadIndicator();
  drop.save(formData)
  .then(function (response) {
    self.dropView.showUploadSuccess.bind(self.dropView)();
    var args = response.drop_info;
    args.user = response.user_info;
    var newDrop = new SoapStone.Drop(args);
    newDrop.marker = new google.maps.Marker({
      icon: {
        path: 'M -2,0 0,-2 2,0 0,2 z',//google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 1,//4,
        strokeColor: "hsla("+newDrop.user.hue+",100%,50%,0.9)",
        strokeWeight: 5//3
      },
      position: new google.maps.LatLng(newDrop.lat, newDrop.lon)
    });
    newDrop.marker.setMap(self.mapView.map);
    self.map.allDrops.push(newDrop);
    self.map.refreshDrops(self.mapView.filter);
  }.bind(drop))
  .fail(self.dropView.showUploadFailure.bind(self.dropView));
};

SoapStone.Controller.prototype.showDrop = function(id) {
  var self = this;
  drop = new SoapStone.Drop();
  drop.find(id).then(function(drop) {
    self.dropView.showDrop(drop);
  });
};

SoapStone.Controller.prototype.initDrops = function(filter) {
  var self = this;
  self.mapView.filter = filter;
  return self.mapView.init().then(function () {
    self.map.loadDrops(self.mapView.filter).then(function(){
      self.mapView.showDrops(self.map.allDrops);
      self.dropView.clearDropList();
      var turnedOnDrops = self.map.allDrops.filter(function(drop){//check for drop.withinRange == true
        return drop.withinRange;
      });
      self.dropView.showDropList(turnedOnDrops);
      self.mapView.watchCurrentPosition();//is this where it should go??????????????????   
      self.pollDrops();
    });
  });
};

SoapStone.Controller.prototype.pollDrops = function (){
    var self = this;
    window.recentPollInterval = setInterval(function(){
      self.refreshDrops(self.mapView.filter);
    }, 30000);//increase this later
};

SoapStone.Controller.prototype.refreshDrops = function(filter) {
  var self = this;
  self.mapView.filter = filter;
  self.map.hitTheDataBaseForDrops(filter).then(function(){//HDBfD used to be the refreshdrops function on the Map
    self.mapView.showDrops(self.map.allDrops);
    self.dropView.clearDropList();
    var turnedOnDrops = self.map.allDrops.filter(function(drop){//check for drop.withinRange == true
      return drop.withinRange;
    });
    self.dropView.showDropList(turnedOnDrops);
  });
};

SoapStone.Controller.prototype.loadDrops = function(filter) {
  var self = this;
  self.mapView.filter = filter;
  self.map.loadDrops(filter).then(function(){
    self.mapView.showDrops(self.map.allDrops);
    self.dropView.clearDropList();
    var turnedOnDrops = self.map.allDrops.filter(function(drop){//check for drop.withinRange == true
      return drop.withinRange;
    });
    self.dropView.showDropList(turnedOnDrops);
  });
};

SoapStone.Controller.prototype.addSnap = function(drop){
  var self = this;
  drop.addSnap().then(function(){
    self.dropView.updateSnapButton(drop);
  });
};

SoapStone.Controller.prototype.createComment = function(drop){
  var self = this;
  drop.createComment().then(function () {
    self.dropView.updateComments(drop);
  });
};

SoapStone.Controller.prototype.loadFollows = function() {
  var self = this;
  id = location.href.split('/').slice(-1);
  return this.user.loadFollows(id);  
};

