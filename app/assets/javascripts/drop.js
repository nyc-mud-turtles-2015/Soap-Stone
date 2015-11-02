//Drop Model
SoapStone.Drop = function (args) {
  if (args) {
    this.setAttributes(args);
  }
};

SoapStone.Drop.prototype.setAttributes = function (args) {
  this.id = args.id;
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
  this.text = args.text;
  this.photo = args.photo;
  this.distance = args.distance;
  this.has_photo = args["has_photo?"];
  this.created_at = args.created_at;
  this.snaps_count = args.snaps_count;
  this.comments_count = args.comments_count;
  this.snapped_by_you = args["snapped_by?"];
  if (args.user) {
    this.user = {};
    this.user.id = args.user.id;
    this.user.username = args.user.username;
    this.user.avatar = args.user.avatar;
    Math.seedrandom(args.user.id)
    this.user.hue = Math.floor(Math.random() * 359) + 1
  }
  if (args.comments) {
    this.comments = args.comments.map(function (data) {
      return new SoapStone.Comment(data);
    });
  }
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
}

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

  $("[data-role='drop-form']").on('submit', function (event) {
    event.preventDefault();
    self.controller.createDrop($("[data-role='drop-form']"));
  });

  $("[data-button='friend-filter']").on('click', function (e) {
    self.controller.loadDrops("/followees");
  });

  $("[data-button='public-filter']").on('click', function (e) {
    self.controller.loadDrops();
  });

  $("[data-button='new-button']").on('click', function (event) {
    event.preventDefault();
    self.showNewDropForm();
  });

  $("[data-button='close-form']").on('click', function (event) {
    event.preventDefault();
    self.hideNewDropForm();
  });
};

SoapStone.DropView.prototype.showNewDropForm = function () {
  $("[data-view='new-form']").show();
};

SoapStone.DropView.prototype.hideNewDropForm = function () {
  $("[data-view='new-form']").removeClass('uploading');
  $("[data-view='new-form']").hide();
};

SoapStone.DropView.prototype.showUploadIndicator = function () {
  $("[data-view='new-form']").addClass('uploading');
};

SoapStone.DropView.prototype.showUploadSuccess = function (response) {
  console.log("Drop posted successfuly!");
  toastr.success("Drop Posted", "Success");
  this.hideNewDropForm();
};

SoapStone.DropView.prototype.showUploadFailure = function (response) {
  console.log("Drop failed to post.");
  toastr.error("Drop failed to post.", "Error");
  this.hideNewDropForm();
};

SoapStone.DropView.prototype.updateSnapButton = function (drop) {
  $("[data-button='snap-button']").replaceWith(this.snapButtonTemplate(drop));
};

SoapStone.DropView.prototype.updateComments = function (drop) {
  $(".comment-list").replaceWith(this.commentsTemplate(drop));
}

SoapStone.DropView.prototype.showDrop = function (drop) {
  var self = this;
  $('body').append(this.showTemplate(drop));
  $("[data-view='map']").hide();
  $("[data-menu='map']").hide();
  $("[data-button='close-drop']").on('click', function (event) {
    self.closeDrop();
  });

  $("[data-button='snap-button']").on('click', function (event) {
    event.preventDefault();
    self.controller.addSnap(drop);
  });

  $("[data-button='comment-button']").on('click', function (event){
    event.preventDefault();
    self.controller.createComment(drop)
    $("[data-form='comment-form']").val('')
  });
};

SoapStone.DropView.prototype.clearDropList = function (drop) {
  $(".drop-list").remove();
};

SoapStone.DropView.prototype.showDropList = function (drops) {
  var self = this;
  $("[data-view='map']").append(this.dropListTemplate(drops));
  $(".drop-list").on('click', 'a', function(event){
    if (event.target.dataset.drop) {
      event.preventDefault();
      var dropId = event.target.dataset.drop;
      self.controller.showDrop(dropId);
    }
  });
};


SoapStone.DropView.prototype.closeDrop  = function () {
  $("[data-view='drop']").remove();
  $("[data-menu='drop']").remove();
  $("[data-view='map']").show();
  $("[data-menu='map']").show();
};
