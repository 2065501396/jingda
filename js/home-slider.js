// ===== 首页图片轮播 =====
(function () {
  var frame = document.getElementById('jdSliderFrame');
  var dotsBox = document.getElementById('jdDots');
  if (!frame || !dotsBox) return;

  var slides = frame.querySelectorAll('.jd-slide');
  var dots = dotsBox.querySelectorAll('button');
  if (slides.length < 2) return;

  var index = 0;
  var timer = null;
  var INTERVAL = 5000;

  function show(n) {
    index = (n + slides.length) % slides.length;
    for (var i = 0; i < slides.length; i++) {
      slides[i].classList.toggle('active', i === index);
      if (dots[i]) dots[i].classList.toggle('active', i === index);
    }
  }

  function next() { show(index + 1); }
  function prev() { show(index - 1); }

  function start() { stop(); timer = setInterval(next, INTERVAL); }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  var prevBtn = frame.querySelector('.jd-prev');
  var nextBtn = frame.querySelector('.jd-next');
  if (prevBtn) prevBtn.addEventListener('click', function () { prev(); start(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { next(); start(); });

  for (var i = 0; i < dots.length; i++) {
    (function (i) {
      dots[i].addEventListener('click', function () { show(i); start(); });
    })(i);
  }

  frame.addEventListener('mouseenter', stop);
  frame.addEventListener('mouseleave', start);

  // 移动端左右滑动
  var startX = 0;
  frame.addEventListener('touchstart', function (e) {
    startX = e.changedTouches[0].clientX;
    stop();
  }, { passive: true });
  frame.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
    start();
  }, { passive: true });

  // 标签页隐藏时暂停
  document.addEventListener('visibilitychange', function () {
    document.hidden ? stop() : start();
  });

  show(0);
  start();
})();
