SoapStone.User = function(args) {
  if (args) {
    this.setAttributes(args);
  }
};

SoapStone.User.prototype.setAttributes = function(args) {
  this.id = this.id || args.id;
  this.username = this.username || args.username;
  this.avatar = this.avatar || args.avatar;
  if (this.id) {
    this.hue = this.calculateUserColor(this.id);
  }
  this.followers = this.followers || args.followers;
  this.followees = this.followers || args.followees;
  this.drops = this.drops || args.drops;
};

SoapStone.User.prototype.calculateUserColor = function (userId) {
  Math.seedrandom(userId);
  return Math.floor(Math.random() * 359) + 1;
};

SoapStone.User.prototype.loadDrops = function(id) {
  var self = this;
  return new Promise(function(resolve, reject) {
    $.ajax({
      type: "GET",
      url: "/users/" + id + "/drops",
      dataType: "json"
    })
    .then(function (response) {
      self.drops = response.drops;
      resolve(self);
    })
    .fail(function () {
      reject();
    });
  });
};

SoapStone.User.prototype.loadFollows = function(id) {
  var self = this;
  return new Promise(function(resolve, reject) {
    $.ajax({
      type: "GET",
      url: "/users/" + id + "/follows",
      dataType: "json"
     })
    .then(function (response) {
      self.followees = response.followees;
      self.followers = response.followers;
      resolve(self);
    })
    .fail(function () {
      reject();
    });
  });
};

SoapStone.UserView = function() {
  var showTemplateSource   = $("[data-template='show-user']").html();
  var showDropSource = $("[data-template='show-drop']").html();
  this.showTemplate = Handlebars.compile(showTemplateSource);
  this.showDropTemplate = Handlebars.compile(showDropSource);
  Handlebars.registerPartial("snap-button", $("[data-partial='snap-button-partial']").html());
  this.snapButtonTemplate = Handlebars.compile($("[data-partial='snap-button-partial']").html());
  Handlebars.registerPartial("comment", $("[data-partial='comment-partial']").html());
  this.commentsTemplate = Handlebars.compile($("[data-partial='comment-partial']").html());
  this.suggestionTemplate = Handlebars.compile($("[data-template='user-suggestions']").html());
  this.setUpEventHandlers();
};

SoapStone.UserView.prototype.setUpEventHandlers = function(){
  var self = this;

  $("[data-role='show-followers']").on('click', function(event){
    event.preventDefault();
    SoapStone.app.userView.showFollowers(SoapStone.app.user);
  });

  $("[data-role='show-followees']").on('click', function(event){
    event.preventDefault();
    SoapStone.app.userView.showFollowees(SoapStone.app.user);
  });

  $("#drops").on('click', function(event){
    event.preventDefault();
    var id = location.href.split('/').slice(-1); //WET code same line as 66
    window.location.href = "/?user_id="+id;
  });

  $(".open-drop").on('click', function(event){
    event.preventDefault();
    url = this.children[0].href;
    SoapStone.app.userView.showDrop(url);
  });

  $("[data-button='profile-button']").on('click', function (event) {
    event.preventDefault();
    SoapStone.app.userView.showEditUserForm();
  });

  $(".edit_user").on('submit', function (event) {
    event.preventDefault();
    SoapStone.app.userView.updateUser($(".edit_user"));
  });

  $('#search-form').on('submit', function(event){
    event.preventDefault();
    var myUrl = '/users/search';
    var myData = $(this).serialize();
    var myType = "POST";
    $.ajax({
      url:myUrl,
      type: myType,
      data: myData
    }).done(function (response) {
      var id = response.user_id;
      window.location.replace("/users/"+id)
    }).fail(function (responseObj) {
      toastr.error("Could not find that user", "Error");
    })
  });

  $('#search-form #search').keyup(debounce(function(e){
    var myData =$(this).serialize(); 
    $.ajax({
      data: myData,
      url:'/users/filter',
      type: "POST"
    }).then(function(response){
      self.suggestionShow(response);//response is an obj {users: [users collection]}
    })
  }, 250));
};


SoapStone.UserView.prototype.suggestionShow = function (response) {
  var self = this;
  if (response){
    // $().val( input.val() + "more text" );
    $("[data-role='suggestions']").html(self.suggestionTemplate(response))
    $("[data-role='suggestions']").show()
  }
};

SoapStone.UserView.prototype.showEditUserForm = function () {
  $(".user").hide();
  $("[data-view='user-form']").show();
};

SoapStone.UserView.prototype.showFollowers = function(user) {
  var self = this;
  var followerHtml = this.showTemplate({users: user.followers,
    title: "Followers"});
  $(".user").hide();
  $('body').append(followerHtml);
  $("[data-button='close-follow']").on('click', function (event) {
    self.closeFollows();
  });
};

SoapStone.UserView.prototype.showFollowees = function(user) {
  var self = this;
  var followeeHtml = this.showTemplate({users: user.followees,
    title: "Following"});
  $(".user").hide();
  $('body').append(followeeHtml);
  $("[data-button='close-follow']").on('click', function (event) {
    self.closeFollows();
  });
};

SoapStone.UserView.prototype.showDrop = function(url) {
  var self = this;
  $.ajax({
    type: "GET",
    url: url,
    dataType: "json"
   })
  .then(function (response) {
    drop = new SoapStone.Drop(response);
    $('body').append(self.showDropTemplate(drop));
    window.setTimeout(function() {
      $('body').addClass('drop-open');
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
  })
  .fail(function () {
    reject();
  });
};

SoapStone.UserView.prototype.closeFollows = function () {
  $(".follow-page").remove();
  $(".user").show();
};

SoapStone.UserView.prototype.closeDrop  = function () {
  $('body').removeClass('drop-open');
  window.setTimeout(function() {
      $("[data-view='drop']").remove();
  }, 500);
};

SoapStone.UserView.prototype.updateSnapButton = function (drop) {
  $("[data-role='snaps']").replaceWith(this.snapButtonTemplate(drop));
};

SoapStone.UserView.prototype.updateComments = function (drop) {
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
