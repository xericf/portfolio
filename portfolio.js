

$("#scroll-me").on("click", function(e) {

  var height = window.innerHeight;

  window.scroll({
    top: height,
    left: 0,
    behavior: 'smooth'
  });
});



$("#scroll-top").on("click", function(e) {

  window.scroll({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
});
