$(window).scroll(function() {
  var hT = $('#section1').offset().top,
    hH = $('#section1').outerHeight(),
    wH = $(window).height(), // the window height (how much it could see)
    wS = $(this).scrollTop();

  if (wS + wH > hH) { // once it scrolls and the element is visible
    console.log('H1 on the view!');
  }
});

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
