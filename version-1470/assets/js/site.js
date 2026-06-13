(function () {
  var header = document.querySelector('[data-site-header]');
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', mobileNav.classList.contains('is-open'));
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startSlider() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startSlider();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startSlider();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startSlider();
      });
    });

    showSlide(0);
    startSlider();
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
  var yearFilters = Array.prototype.slice.call(document.querySelectorAll('[data-year-filter]'));
  var typeFilters = Array.prototype.slice.call(document.querySelectorAll('[data-type-filter]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

  function filterCards() {
    if (!cards.length) {
      return;
    }
    var query = searchInputs.map(function (input) {
      return input.value.trim().toLowerCase();
    }).filter(Boolean).pop() || '';
    var year = yearFilters.map(function (select) {
      return select.value;
    }).filter(Boolean).pop() || '';
    var type = typeFilters.map(function (select) {
      return select.value;
    }).filter(Boolean).pop() || '';

    cards.forEach(function (card) {
      var haystack = card.getAttribute('data-search') || '';
      var cardYear = card.getAttribute('data-year') || '';
      var cardType = card.getAttribute('data-type') || '';
      var matchesQuery = !query || haystack.indexOf(query) !== -1;
      var matchesYear = !year || (year === '2022' ? Number(cardYear) <= 2022 : cardYear === year);
      var matchesType = !type || cardType.indexOf(type) !== -1;
      card.classList.toggle('is-hidden', !(matchesQuery && matchesYear && matchesType));
    });
  }

  searchInputs.concat(yearFilters).concat(typeFilters).forEach(function (control) {
    control.addEventListener('input', filterCards);
    control.addEventListener('change', filterCards);
  });
})();

function initPlayer(url) {
  document.addEventListener('DOMContentLoaded', function () {
    var video = document.querySelector('[data-player-video]');
    var cover = document.querySelector('[data-player-cover]');
    var trigger = document.querySelector('[data-player-start]');
    var loaded = false;
    var hls;

    if (!video || !url) {
      return;
    }

    function playVideo() {
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    function hideCover() {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    }

    function loadVideo() {
      hideCover();
      if (loaded) {
        playVideo();
        return;
      }
      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
      } else {
        video.src = url;
        playVideo();
      }
    }

    if (cover) {
      cover.addEventListener('click', loadVideo);
    }

    if (trigger) {
      trigger.addEventListener('click', loadVideo);
    }

    video.addEventListener('click', function () {
      if (!loaded) {
        loadVideo();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
}
