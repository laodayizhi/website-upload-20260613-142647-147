(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var input = document.querySelector('[data-live-search-input]');
        var form = document.querySelector('[data-live-search-form]');
        var results = document.querySelector('[data-search-results]');
        var summary = document.querySelector('[data-search-summary]');
        var movies = window.MOVIE_DATA || [];
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        if (!input || !form || !results || !summary) {
            return;
        }

        input.value = initialQuery;
        render(initialQuery);

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var query = input.value.trim();
            var url = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
            window.history.replaceState(null, '', url);
            render(query);
        });

        input.addEventListener('input', function () {
            render(input.value.trim());
        });

        function render(query) {
            var lowered = query.toLowerCase();
            var matched = movies.filter(function (movie) {
                if (!lowered) {
                    return true;
                }

                return [
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.category,
                    movie.tags.join(' ')
                ].join(' ').toLowerCase().indexOf(lowered) !== -1;
            }).slice(0, 120);

            summary.textContent = query
                ? '共找到 ' + matched.length + ' 条相关结果，当前最多展示 120 条。'
                : '默认展示片库前 120 条影片，可输入关键词继续筛选。';

            results.innerHTML = matched.map(renderCard).join('');
        }

        function escapeHtml(value) {
            return String(value || '').replace(/[&<>"']/g, function (character) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                }[character];
            });
        }

        function renderCard(movie) {
            return '' +
                '<article class="movie-card">' +
                    '<a href="movie/' + movie.id4 + '.html" class="movie-card-link">' +
                        '<figure class="poster-wrap">' +
                            '<img src="./' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.style.opacity=\'0\';" />' +
                            '<span class="poster-badge">' + escapeHtml(movie.type) + '</span>' +
                            '<span class="poster-play">▶</span>' +
                        '</figure>' +
                        '<div class="movie-card-body">' +
                            '<div class="movie-meta-row">' +
                                '<span>' + escapeHtml(movie.region) + '</span>' +
                                '<span>' + escapeHtml(movie.year) + '</span>' +
                                '<span>' + escapeHtml(movie.score) + ' 分</span>' +
                            '</div>' +
                            '<h3>' + escapeHtml(movie.title) + '</h3>' +
                            '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                            '<div class="card-tags">' + movie.tags.slice(0, 3).map(function (tag) {
                                return '<span class="tag">#' + escapeHtml(tag) + '</span>';
                            }).join('') + '</div>' +
                        '</div>' +
                    '</a>' +
                '</article>';
        }
    });
})();
