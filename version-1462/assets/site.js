(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-nav-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("open");
            });
        }

        setupHero();
        setupFilters();
        setupSecondaryPlayButton();
    });

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dotsWrap = hero.querySelector("[data-hero-dots]");
        if (slides.length <= 1 || !dotsWrap) {
            return;
        }
        var index = 0;
        var dots = slides.map(function (_, dotIndex) {
            var button = document.createElement("button");
            button.className = dotIndex === 0 ? "hero-dot active" : "hero-dot";
            button.type = "button";
            button.setAttribute("aria-label", "切换推荐内容");
            button.addEventListener("click", function () {
                setSlide(dotIndex);
            });
            dotsWrap.appendChild(button);
            return button;
        });
        function setSlide(next) {
            slides[index].classList.remove("active");
            dots[index].classList.remove("active");
            index = next;
            slides[index].classList.add("active");
            dots[index].classList.add("active");
        }
        window.setInterval(function () {
            setSlide((index + 1) % slides.length);
        }, 5200);
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var scope = panel.parentElement || document;
            var input = panel.querySelector("[data-search-input]");
            var yearFilter = panel.querySelector("[data-year-filter]");
            var typeFilter = panel.querySelector("[data-type-filter]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            var empty = scope.querySelector("[data-empty-state]");
            function matchesYear(year, value) {
                var number = parseInt(year, 10) || 0;
                if (value === "future") {
                    return number >= 2026;
                }
                if (value === "recent") {
                    return number >= 2020 && number <= 2025;
                }
                if (value === "2010s") {
                    return number >= 2010 && number <= 2019;
                }
                if (value === "2000s") {
                    return number >= 2000 && number <= 2009;
                }
                if (value === "classic") {
                    return number > 0 && number <= 1999;
                }
                return true;
            }
            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var yearValue = yearFilter ? yearFilter.value : "all";
                var typeValue = typeFilter ? typeFilter.value : "all";
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                    var year = card.getAttribute("data-year") || "";
                    var type = card.getAttribute("data-type") || "";
                    var ok = (!query || haystack.indexOf(query) !== -1) && matchesYear(year, yearValue) && (typeValue === "all" || type.indexOf(typeValue) !== -1);
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.style.display = visible === 0 ? "block" : "none";
                }
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            if (yearFilter) {
                yearFilter.addEventListener("change", apply);
            }
            if (typeFilter) {
                typeFilter.addEventListener("change", apply);
            }
        });
    }

    function setupSecondaryPlayButton() {
        var secondary = document.querySelector("[data-play-button-secondary]");
        var primary = document.querySelector("[data-play-button]");
        if (secondary && primary) {
            secondary.addEventListener("click", function () {
                primary.click();
            });
        }
    }

    window.initStaticPlayer = function (streamUrl) {
        ready(function () {
            var video = document.querySelector("[data-player]");
            var overlay = document.querySelector("[data-play-button]");
            if (!video || !overlay || !streamUrl) {
                return;
            }
            var isReady = false;
            function attach() {
                if (isReady) {
                    return;
                }
                isReady = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
                video.setAttribute("controls", "controls");
            }
            function start() {
                attach();
                overlay.classList.add("is-hidden");
                video.play().catch(function () {});
            }
            overlay.addEventListener("click", start);
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
        });
    };
})();
