(function() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function() {
            panel.classList.toggle('open');
        });
    }

    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    const dots = Array.from(document.querySelectorAll('.hero-dot'));
    let current = 0;
    let timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function(slide, idx) {
            slide.classList.toggle('is-active', idx === current);
        });
        dots.forEach(function(dot, idx) {
            dot.classList.toggle('is-active', idx === current);
        });
    }

    function playSlides() {
        if (timer) {
            window.clearInterval(timer);
        }
        if (slides.length > 1) {
            timer = window.setInterval(function() {
                showSlide(current + 1);
            }, 5600);
        }
    }

    dots.forEach(function(dot, index) {
        dot.addEventListener('click', function() {
            showSlide(index);
            playSlides();
        });
    });

    showSlide(0);
    playSlides();

    const forms = Array.from(document.querySelectorAll('[data-header-search]'));
    forms.forEach(function(form) {
        form.addEventListener('submit', function(event) {
            const input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                window.location.href = form.getAttribute('action') || 'movies.html';
            }
        });
    });

    const scope = document.querySelector('[data-filter-scope]');
    if (!scope) {
        return;
    }

    const searchInput = scope.querySelector('[data-page-search]');
    const yearFilter = scope.querySelector('[data-year-filter]');
    const clearButton = scope.querySelector('[data-clear-filter]');
    const categoryButtons = Array.from(scope.querySelectorAll('[data-filter-category]'));
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
    const emptyState = document.querySelector('[data-empty-state]');
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';
    let category = '';

    if (searchInput && initialQuery) {
        searchInput.value = initialQuery;
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function cardMatches(card) {
        const query = normalize(searchInput ? searchInput.value : '');
        const year = yearFilter ? yearFilter.value : '';
        const haystack = normalize([
            card.dataset.title,
            card.dataset.year,
            card.dataset.region,
            card.dataset.genre,
            card.dataset.tags,
            card.dataset.category
        ].join(' '));
        const categoryOk = !category || card.dataset.category === category;
        const yearOk = !year || card.dataset.year === year;
        const queryOk = !query || haystack.includes(query);
        return categoryOk && yearOk && queryOk;
    }

    function applyFilters() {
        let visible = 0;
        cards.forEach(function(card) {
            const match = cardMatches(card);
            card.style.display = match ? '' : 'none';
            if (match) {
                visible += 1;
            }
        });
        if (emptyState) {
            emptyState.classList.toggle('show', visible === 0);
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    if (yearFilter) {
        yearFilter.addEventListener('change', applyFilters);
    }

    categoryButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            category = button.dataset.filterCategory || '';
            categoryButtons.forEach(function(item) {
                item.classList.toggle('active', item === button);
            });
            applyFilters();
        });
    });

    if (clearButton) {
        clearButton.addEventListener('click', function() {
            if (searchInput) {
                searchInput.value = '';
            }
            if (yearFilter) {
                yearFilter.value = '';
            }
            category = '';
            categoryButtons.forEach(function(item, index) {
                item.classList.toggle('active', index === 0);
            });
            applyFilters();
        });
    }

    applyFilters();
})();
