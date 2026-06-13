(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function text(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHeroSliders() {
    document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      if (slides.length <= 1) {
        return;
      }
      var current = 0;
      var timer = null;
      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }
      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }
      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          start();
        });
      });
      slider.addEventListener("mouseenter", stop);
      slider.addEventListener("mouseleave", start);
      start();
    });
  }

  function setupFilters() {
    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var typeFilter = scope.querySelector("[data-type-filter]");
      var yearFilter = scope.querySelector("[data-year-filter]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      var emptyState = scope.querySelector("[data-empty-state]");
      function apply() {
        var query = text(input && input.value);
        var typeValue = text(typeFilter && typeFilter.value);
        var yearValue = text(yearFilter && yearFilter.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = text(card.getAttribute("data-title") + " " + card.getAttribute("data-tags"));
          var cardType = text(card.getAttribute("data-type"));
          var cardYear = text(card.getAttribute("data-year"));
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var matchType = !typeValue || cardType.indexOf(typeValue) !== -1 || haystack.indexOf(typeValue) !== -1;
          var matchYear = !yearValue || cardYear === yearValue;
          var matched = matchQuery && matchType && matchYear;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (emptyState) {
          emptyState.classList.toggle("is-visible", visible === 0);
        }
      }
      [input, typeFilter, yearFilter].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupHeroSliders();
    setupFilters();
  });
})();
