SoapStone.User = function(args) {
  if (args) {
    this.setAttributes(args);
  }
};

SoapStone.User.prototype.setAttributes = function(args) {
  this.followers = args.followers;
  this.followees = args.followees;
},

SoapStone.User.prototype.loadFollows = function(id) {
  var self = this;
  return new Promise(function(resolve, reject) {
    $.ajax({
      type: "GET",
      url: "/users/" + id + "/follows",
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

SoapStone.UserView = function() {
  var showTemplateSource   = $("[data-template='show-user']").html();
  this.showTemplate = Handlebars.compile(showTemplateSource);
  // this.setUpEventHandlers();
};

SoapStone.Controller = function() {
  this.user = new SoapStone.User();
  this.userView = new SoapStone.UserView();
  this.loadFollows();
};

SoapStone.Controller.prototype.loadFollows = function() {
  var self = this;
  id = location.href.split('/').slice(-1)
  return this.user.loadFollows(id).then(function () {
    self.userView.showFollows(self.user);
  });
};

SoapStone.UserView.prototype.showFollows = function (user) {
  var followerItems = $(document.createDocumentFragment());
  var followeeItems = $(document.createDocumentFragment());
  var self = this;
  user.followers.forEach( function (follower) {
    followerItems.append(self.showTemplate(follower));
  });
  $("[data-role='follower-list']").html(followerItems);
  user.followees.forEach( function (followee) {
    followeeItems.append(self.showTemplate(followee));
  });
  $("[data-role='followee-list']").html(followeeItems);
};

// SoapStone.UserView.prototype.setUpEventHandlers = function(){
//   $("#follow_form").on('submit', function(event){
//     event.preventDefault();
//     debugger;
//     SoapStone.app.createFollow($(event.target).serializeArray()[2]);
//   });
// };

// SoapStone.Controller.prototype.createfollow = function(followParams) {
//   var follow = new SoapStone.Follow({followee_id: followParams.value});
//   debugger;
//   follow.save()
//   .then(function(response) {console.log(response);})
//   .fail(function(response) {console.log(response);});
// };

SoapStone.UserView.prototype.showFollowers = function(user) {
  var self = this;
  $('body').append(this.showTemplate(user));
};


