(function () {
    var header = document.querySelector("[data-site-header]");
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (toggle && mobileNav) {
        toggle.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    window.addEventListener("scroll", function () {
        if (!header) {
            return;
        }
        if (window.scrollY > 20) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    }, { passive: true });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        var showSlide = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, pos) {
                slide.classList.toggle("active", pos === current);
            });
            dots.forEach(function (dot, pos) {
                dot.classList.toggle("active", pos === current);
            });
        };

        var startTimer = function () {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        };

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        showSlide(0);
        startTimer();
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
    panels.forEach(function (panel) {
        var scope = panel.parentElement || document;
        var input = panel.querySelector("[data-search-input]");
        var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter]"));
        var grid = scope.querySelector("[data-grid]") || document.querySelector("[data-grid]");
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
        var empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = "没有找到匹配的影片";
        grid.parentElement.appendChild(empty);
        var currentFilter = "all";

        var textOf = function (card) {
            return [
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-year"),
                card.getAttribute("data-tags")
            ].join(" ").toLowerCase();
        };

        var apply = function () {
            var query = input ? input.value.trim().toLowerCase() : "";
            var visible = 0;
            cards.forEach(function (card) {
                var text = textOf(card);
                var passQuery = !query || text.indexOf(query) !== -1;
                var passFilter = currentFilter === "all" || text.indexOf(currentFilter.toLowerCase()) !== -1;
                var show = passQuery && passFilter;
                card.classList.toggle("is-hidden", !show);
                if (show) {
                    visible += 1;
                }
            });
            empty.classList.toggle("show", visible === 0);
        };

        if (input) {
            input.addEventListener("input", apply);
        }

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                currentFilter = button.getAttribute("data-filter") || "all";
                buttons.forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });
                apply();
            });
        });
    });
})();

function setupMoviePlayer(playerId, streamUrl) {
    var video = document.getElementById(playerId);
    var layer = document.querySelector('[data-play-layer="' + playerId + '"]');
    var hls = null;
    var ready = false;

    if (!video || !streamUrl) {
        return;
    }

    var playVideo = function () {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    };

    var attach = function () {
        if (ready) {
            playVideo();
            return;
        }
        ready = true;
        video.controls = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            video.addEventListener("loadedmetadata", playVideo, { once: true });
            video.load();
            playVideo();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    hls.destroy();
                    video.src = streamUrl;
                    video.load();
                    playVideo();
                }
            });
            return;
        }

        video.src = streamUrl;
        video.load();
        playVideo();
    };

    var start = function () {
        if (layer) {
            layer.classList.add("is-hidden");
        }
        attach();
    };

    if (layer) {
        layer.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
        if (!ready || video.paused) {
            start();
        }
    });

    video.addEventListener("play", function () {
        if (layer) {
            layer.classList.add("is-hidden");
        }
    });
}
