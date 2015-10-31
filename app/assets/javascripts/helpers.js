Handlebars.registerHelper('pluralize', function(count, singular, plural) {
  console.log(arguments);
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