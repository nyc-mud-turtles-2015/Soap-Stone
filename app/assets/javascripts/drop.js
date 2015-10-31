SoapStone.Drop = function(args) {
  if (args) {
    this.setAttributes(args);
  }
};

SoapStone.Drop.prototype.setAttributes = function(args) {
  if (args.coords) {
    this.coords = {};
    this.coords.longitude = args.coords.longitude;
    this.coords.latitude = args.coords.latitude;
  }
  this.text = args.text;
  this.photo = args.photo;
  this.created_at = args.created_at;
  if (args.user) {
    this.user = {};
    this.user.username = args.user.username;
    this.user.avatar = args.user.avatar;
  }
};

SoapStone.Drop.prototype.save = function() {
  var data = {};
  data.drop = {};
  for (var key in this) {
    if (this.hasOwnProperty(key)) {
      data.drop[key] = this[key];
    }
  }
  return $.ajax({
    type: "POST",
    url:  "/drops",
    data: data
  });
};

SoapStone.Drop.prototype.find = function(id) {
  var self = this;
  return new Promise(function(resolve, reject) {
    $.ajax({
      type: "GET",
      url: "/drops/" + id,
      dataType: 'json'
     })
    .then(function (response) {
      self.setAttributes(response);
      resolve(self);
    })
    .fail(function () {
      reject();
    });
  });
};


SoapStone.DropView = function() {
  var showTemplateSource   = $("[data-template='show-drop']").html();
  this.showTemplate = Handlebars.compile(showTemplateSource);
  this.setUpEventHandlers()
};

SoapStone.DropView.prototype.getLocation = function() {
return new Promise(function(resolve, reject) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
          var coords = {};
          coords.latitude = position.coords.latitude;
          coords.longitude = position.coords.longitude;
          resolve(coords);
        });
      } else {
          reject("Geolocation Not Available");
      }
  });
};

SoapStone.DropView.prototype.setUpEventHandlers = function(){
  $("[data-role='drop-form']").on('submit', function(event){
    event.preventDefault();
    var text = $(this).find("[name='text']").val();
    var photo = $(this).find("[name='photo']").val();
    $("#form-container").hide();
    SoapStone.app.createDrop({text: text, photo: photo});
  })
  
  $("[data-role='new-drop']").on('click', function(event){
    $("#form-container").show();
  })
}

SoapStone.DropView.prototype.showDrop = function(drop) {
  console.log(drop);
  console.log(this.showTemplate(drop));
  $('body').append(this.showTemplate(drop));
};

SoapStone.Controller = function() {
  this.view = new SoapStone.DropView();
  this.view.controller = this;
};

SoapStone.Controller.prototype.createDrop = function(dropParams) {
  this.view.getLocation().then(function(location) {
    var dropData = {
      text: dropParams.text,
      photo: dropParams.photo,
      coords: location
    };
    var drop = new SoapStone.Drop(dropData);
    drop.save()
    .then(function(response) {console.log(response);})
    .fail(function(response) {console.log(response);});
  });
};

SoapStone.Controller.prototype.showDrop = function(id) {
  var self = this;
  drop = new SoapStone.Drop();
  drop.find(id).then(function(drop) {
    self.view.showDrop(drop);
  });
};


//this needs to go in the event handler for form posting
$( document ).ready(function() {
  SoapStone.app = new SoapStone.Controller();
});
