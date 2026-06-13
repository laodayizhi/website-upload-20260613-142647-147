(function () {
    function closestCardList(element) {
        var scope = element.closest("section") || document;
        if (!scope.querySelector("[data-card]")) {
            return document;
        }
        return scope;
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function filterCards(scope) {
        var queryInput = scope.querySelector("[data-page-search]") || document.querySelector("[data-page-search]");
        var query = normalize(queryInput ? queryInput.value : "");
        var activeButton = scope.querySelector(".filter-button.active");
        var filter = activeButton ? activeButton.getAttribute("data-filter") : "all";
        var cards = scope.querySelectorAll("[data-card]");

        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute("data-search"));
            var type = card.getAttribute("data-type") || "";
            var matchesQuery = !query || haystack.indexOf(query) !== -1;
            var matchesFilter = filter === "all" || type === filter;
            card.classList.toggle("is-hidden", !(matchesQuery && matchesFilter));
        });
    }

    function setupFilters() {
        document.querySelectorAll("[data-filter-bar]").forEach(function (bar) {
            var scope = closestCardList(bar);
            bar.querySelectorAll("[data-filter]").forEach(function (button) {
                button.addEventListener("click", function () {
                    bar.querySelectorAll("[data-filter]").forEach(function (item) {
                        item.classList.remove("active");
                    });
                    button.classList.add("active");
                    filterCards(scope);
                });
            });
        });
    }

    function setupSearch() {
        document.querySelectorAll("[data-page-search]").forEach(function (input) {
            var scope = closestCardList(input);
            input.addEventListener("input", function () {
                filterCards(scope);
            });
        });
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupSearch();
    });
})();
