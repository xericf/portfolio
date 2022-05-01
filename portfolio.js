

$("#scroll-me").on("click", function(e) {

  var height = window.innerHeight;

  window.scroll({
    top: height,
    left: 0,
    behavior: 'smooth'
  });
});
