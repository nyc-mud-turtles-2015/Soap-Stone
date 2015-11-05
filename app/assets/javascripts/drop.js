//Drop Model
SoapStone.Drop = function (args) {
  if (args) {
    this.setAttributes(args);
  }
};

SoapStone.Drop.prototype.setAttributes = function (args) {
  this.id = args.id;
  this.withinRange;
  if (args.coords) {
    this.coords = {};
    this.coords.longitude = args.coords.longitude;
    this.coords.latitude = args.coords.latitude;
  }
  if (args.lon && args.lat) {
    this.coords = {};
    this.coords.latitude = args.lat;
    this.coords.longitude = args.lon;
  }
  if (this.coords) {
    this.lat = this.coords.latitude;
    this.lon = this.coords.longitude;
  }
  this.googleLatLng = new google.maps.LatLng(this.lat, this.lon);
  this.text = args.text;
  this.photo = args.photo;
  this.distance = args.distance;//depricated
  this.has_photo = args["has_photo?"];
  this.created_at = args.created_at;
  this.snaps_count = args.snaps_count;
  this.comments_count = args.comments_count;
  this.snapped_by_you = args["snapped_by?"];
  if (args.user) {
    this.user = new SoapStone.User(args.user);
  }
  if (args.comments) {
    this.comments = args.comments.map(function (data) {
      return new SoapStone.Comment(data);
    });
  }
};

SoapStone.Drop.prototype.distanceFromTarget = function (target) {//we will use target as me for now but this can be used generally
  var meterDistance = google.maps.geometry.spherical.computeDistanceBetween(target, this.googleLatLng);
  this.distance = meterDistance/1609.34;
  return meterDistance*3.28084;//convert the meters which we get from the google function to feet to use in our if statements
};

SoapStone.Drop.prototype.save = function (formData) {
  formData.append('drop[lat]', this.lat);
  formData.append('drop[lon]', this.lon);
  return $.ajax({
    type: "POST",
    url:  "/drops",
    cache: false,
    contentType: false,
    processData: false,
    data: formData
  });
};

SoapStone.Drop.prototype.find = function (id) {
  var self = this;
  return new Promise(function (resolve, reject) {
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

SoapStone.Drop.prototype.addSnap = function () {
  var self = this;
  return $.ajax({
    type:"POST",
    url: "/drops/" + self.id + "/snaps"
  }).then(function () {
    self.snaps_count +=1;
    self.snapped_by_you = true;
  });
};

SoapStone.Drop.prototype.createComment = function (comment) {
  var self = this;
  return $.ajax({
    type:"POST",
    url: "/drops/" + self.id + "/comments",
    data:{comment: $("[data-form='comment-form']").val()}
  }).then(function (response) {
    self.comments.push(new SoapStone.Comment(response));
    self.comments_count += 1;
  });
};



SoapStone.Comment = function (args) {
  this.text = args.text;
  if (args.user) {
    this.user = {};
    this.user.id = args.user.id;
    this.user.username = args.user.username;
    this.user.avatar = args.user.avatar;
  }
};

// View
SoapStone.DropView = function () {
  this.showTemplate = Handlebars.compile($("[data-template='show-drop']").html());
  this.dropListTemplate = Handlebars.compile($("[data-template='drop-list']").html());
  Handlebars.registerPartial("snap-button", $("[data-partial='snap-button-partial']").html());
  this.snapButtonTemplate = Handlebars.compile($("[data-partial='snap-button-partial']").html());
  Handlebars.registerPartial("comment", $("[data-partial='comment-partial']").html());
  this.commentsTemplate = Handlebars.compile($("[data-partial='comment-partial']").html());
  this.setUpEventHandlers();
};

SoapStone.DropView.prototype.setUpEventHandlers = function () {
  var self = this;

  // Filter tabs
  $("[data-button='friend-filter']").on('click', function (e) {
    $('.tabs .tab').removeClass('selected');
    $('.tabs .friend').addClass('selected');
    self.controller.loadDrops("/followees");
  });

  $("[data-button='public-filter']").on('click', function (e) {
    $('.tabs .tab').removeClass('selected');
    $('.tabs .public').addClass('selected');
    self.controller.loadDrops();
  });

  // Floating buttons
  $("[data-button='new']").on('click', function (event) {
    event.preventDefault();
    self.showNewDropForm();
  });

  $("[data-button='center']").on('click', function (event) {
    self.controller.mapView.centerMap();
    if ($("[data-view='map'].drop-list-open").exists()) {
      self.controller.mapView.panVertically($(window).height() * 0.25);
    }
  });

  $("[data-button='list']").on('click', function (event) {
    event.preventDefault();
    self.popupDropList();
  });

  $("[data-button='profile']").on('click', function (e) {
    location.replace('/users/me');
  });

  // New drop form handlers
  $("[data-role='photo-upload']").on('change', function (event) {
    if (this.files.length > 0) {
      $("[data-role='photo-label']")
      .removeClass('orange').addClass('white').addClass('has-file')
      .html($('<span>PHOTO READY TO DROP</span>'));
    } else {
      $("[data-role='photo-label']")
      .addClass('orange').removeClass('white').removeClass('has-file')
      .html('<span>ADD A PHOTO</span>');

    }
  });

  $("[data-role='drop-form']").on('submit', function (event) {
    event.preventDefault();
    self.controller.createDrop($("[data-role='drop-form']"));
  });

  $("[data-button='close-form']").add('.new-form-lightbox').on('click', function (event) {
    event.preventDefault();
    self.hideNewDropForm();
  });
};

SoapStone.DropView.prototype.showNewDropForm = function () {
  $("[data-view='map']").addClass("drop-form-open");
};

SoapStone.DropView.prototype.hideNewDropForm = function () {
  $("[data-view='new-form']").removeClass('uploading');
  $("[data-view='map']").removeClass("drop-form-open");
};

SoapStone.DropView.prototype.showUploadIndicator = function () {
  $("[data-view='new-form']").addClass('uploading');
};

SoapStone.DropView.prototype.showUploadSuccess = function (response) {
  console.log("Drop posted successfuly!");
  toastr.success("Drop Posted", "Success");
  $("[data-role='drop-form']")[0].reset();
  $("[data-role='photo-label']")
  .addClass('orange').removeClass('white').removeClass('has-file')
  .html('<span>ADD A PHOTO</span>');
  this.hideNewDropForm();
};

SoapStone.DropView.prototype.showUploadFailure = function (response) {
  console.log("Drop failed to post.");
  toastr.error("Drop failed to post.", "Error");
  this.hideNewDropForm();
};

SoapStone.DropView.prototype.updateSnapButton = function (drop) {
  $("[data-role='snaps']").replaceWith(this.snapButtonTemplate(drop));
};

SoapStone.DropView.prototype.updateComments = function (drop) {
  var self = this;

  $(".comment-list").replaceWith(this.commentsTemplate(drop));

  $("[data-button='comment-button']").on('click', function (event){
    event.preventDefault();
    self.controller.createComment(drop);
    $("[data-form='comment-form']").val('');
  });

  $("[data-button='snap-button']").on('click', function (event) {
    event.preventDefault();
    self.controller.addSnap(drop);
  });
};

SoapStone.DropView.prototype.showDrop = function (drop) {
  var self = this;
  $("[data-view='map']").append(this.showTemplate(drop));
  window.setTimeout(function() {
    $("[data-view='map']").addClass('drop-open');
    $("[data-button='close-drop']").on('click', function (event) {
      self.closeDrop();
    });
  }, 50);

  $("[data-button='snap-button']").on('click', function (event) {
    event.preventDefault();
    self.controller.addSnap(drop);
  });

  $("[data-button='comment-button']").on('click', function (event){
    event.preventDefault();
    self.controller.createComment(drop);
    $("[data-form='comment-form']").val('');
  });
};

SoapStone.DropView.prototype.clearDropList = function (drop) {
  $(".drop-list").remove();
};

SoapStone.DropView.prototype.getMarker = function (drops, id) {
  for (var i = 0; i < drops.length; i++) {
    var drop = drops[i];
    if (drop.id === id) {
      return drop.marker;
    }
  }
};

SoapStone.DropView.prototype.clearMarkerAnimations = function (drops) {
  for (var i = 0; i < drops.length; i++) {
    var drop = drops[i];
    drop.marker.setAnimation(null);
  }
};

SoapStone.DropView.prototype.popupDropList = function() {
  $("[data-view='map']").addClass("drop-list-open");
  this.controller.mapView.panVertically($(window).height() * 0.25);
};

SoapStone.DropView.prototype.hideDropList = function() {
  var self = this;
  $("[data-view='map']").removeClass("drop-list-open");
  this.controller.mapView.panVertically(-$(window).height() * 0.25);
  window.setTimeout(function() {
    google.maps.event.trigger(self.controller.mapView.map, 'resize');
  }, 500);
};

SoapStone.DropView.prototype.sortAndFilter = function (drops) {
  var orderedDrops = drops.sort(function (drop) {return drop.created_at}).reverse();
  return orderedDrops.slice(0,30);
};

SoapStone.DropView.prototype.showDropList = function (drops) {
  var self = this;
  drops = self.sortAndFilter(drops);
  $("[data-view='map']").append(this.dropListTemplate(drops));
  $(".drop-list").on('click', 'a', function(event){
    if (event.target.dataset.drop) {
      event.preventDefault();
      var dropId = event.target.dataset.drop;
      self.controller.showDrop(dropId);
    }
  });
  $(".drop-list").on('mouseenter', '.droplist-item', function(event) {
    $(this).addClass("selected");
    var marker = self.getMarker(drops, Number(this.dataset.dropId));
    if (marker) {
      marker.setAnimation(google.maps.Animation.BOUNCE);
    }
  });
  $(".drop-list").on('mouseleave', '.droplist-item', function(event) {
    $(this).removeClass("selected");
    var marker = self.getMarker(drops, Number(this.dataset.dropId));
    if (marker) {
      marker.setAnimation(null);
    }
  });
  $(".drop-list").on('click', '.droplist-item', function(event) {
    $('.drop-item').removeClass("selected");
    $(this).addClass("selected");
    self.clearMarkerAnimations(drops);
    var marker = self.getMarker(drops, Number(this.dataset.dropId));
    if (marker) {
      marker.setAnimation(google.maps.Animation.BOUNCE);
    }
  });
  $("[data-button='close-list']").add('.new-form-lightbox').on('click', function (event) {
    event.preventDefault();
    self.hideDropList();
  });
};

SoapStone.DropView.prototype.closeDrop  = function () {
  $("[data-view='map']").removeClass('drop-open');
  window.setTimeout(function() {
      $("[data-view='drop']").remove();
  }, 500);
};
