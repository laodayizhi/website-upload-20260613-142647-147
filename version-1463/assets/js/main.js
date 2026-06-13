(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        initNavigation();
        initHeroSlider();
        initSearchForms();
        initCardFilters();
    });

    function initNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var links = document.querySelector('[data-nav-links]');

        if (!toggle || !links) {
            return;
        }

        toggle.addEventListener('click', function () {
            links.classList.toggle('open');
            toggle.textContent = links.classList.contains('open') ? '×' : '☰';
        });
    }

    function initHeroSlider() {
        var hero = document.querySelector('[data-hero]');

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var timer = null;

        if (slides.length < 2) {
            return;
        }

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
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
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot') || 0));
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function initSearchForms() {
        var forms = document.querySelectorAll('[data-site-search]');

        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                var query = input ? input.value.trim() : '';

                if (!query) {
                    event.preventDefault();
                    return;
                }
            });
        });
    }

    function initCardFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        var grid = document.querySelector('[data-card-grid]');

        if (!panel || !grid) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var state = {
            region: '',
            type: '',
            year: '',
            query: ''
        };

        var searchInput = panel.querySelector('[data-card-search]');
        var resetButton = panel.querySelector('[data-reset-filters]');

        panel.addEventListener('click', function (event) {
            var button = event.target.closest('[data-filter-kind]');

            if (!button) {
                return;
            }

            var kind = button.getAttribute('data-filter-kind');
            var value = button.getAttribute('data-filter-value') || '';
            state[kind] = value;

            panel.querySelectorAll('[data-filter-kind="' + kind + '"]').forEach(function (item) {
                item.classList.toggle('active', item === button);
            });

            applyFilters();
        });

        if (searchInput) {
            searchInput.addEventListener('input', function () {
                state.query = searchInput.value.trim().toLowerCase();
                applyFilters();
            });
        }

        if (resetButton) {
            resetButton.addEventListener('click', function () {
                state.region = '';
                state.type = '';
                state.year = '';
                state.query = '';

                if (searchInput) {
                    searchInput.value = '';
                }

                panel.querySelectorAll('[data-filter-kind]').forEach(function (button) {
                    var value = button.getAttribute('data-filter-value') || '';
                    button.classList.toggle('active', value === '');
                });

                applyFilters();
            });
        }

        function applyFilters() {
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-category')
                ].join(' ').toLowerCase();

                var matched = true;

                if (state.region && card.getAttribute('data-region') !== state.region) {
                    matched = false;
                }

                if (state.type && card.getAttribute('data-type') !== state.type) {
                    matched = false;
                }

                if (state.year && card.getAttribute('data-year') !== state.year) {
                    matched = false;
                }

                if (state.query && text.indexOf(state.query) === -1) {
                    matched = false;
                }

                card.classList.toggle('hidden-by-filter', !matched);
            });
        }
    }
})();
