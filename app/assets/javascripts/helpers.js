Handlebars.registerHelper('pluralize', function(count, singular, plural) {
  if (count === 1) {
    return String(count) + " " + singular;
  } else {
    if (typeof plural === "string") {
      return String(count) + " " + plural;
    } else {
      return String(count) + " " + singular + "s";
    }
  }
});

Handlebars.registerHelper('dist', function(miles) {
  var MILES_TO_FEET = 5280;
  if (miles >= 1) {
    return  miles.toFixed(1) + " miles";
  }
  else{
    var feet = Math.round(miles * MILES_TO_FEET);
    return (feet == 1) ? "1 foot" : feet + " feet";
  }
});

Handlebars.registerHelper('timeAgo', function(time) {
  var units = [
    { name: "second", limit: 60, in_seconds: 1 },
    { name: "minute", limit: 3600, in_seconds: 60 },
    { name: "hour", limit: 86400, in_seconds: 3600  },
    { name: "day", limit: 604800, in_seconds: 86400 },
    { name: "week", limit: 2629743, in_seconds: 604800  },
    { name: "month", limit: 31556926, in_seconds: 2629743 },
    { name: "year", limit: null, in_seconds: 31556926 }
  ];
  var diff = (new Date() - new Date(time)) / 1000;
  if (diff < 5) return "now";

  var i = 0, unit;
  while (unit = units[i++]) {
    if (diff < unit.limit || !unit.limit){
      diff =  Math.floor(diff / unit.in_seconds);
      return diff + " " + unit.name + (diff>1 ? "s" : "");
    }
  }
});
