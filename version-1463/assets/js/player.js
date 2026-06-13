(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var shell = document.querySelector('[data-player-shell]');
        var video = document.querySelector('[data-hls-video]');
        var button = document.querySelector('[data-play-button]');

        if (!shell || !video || !button) {
            return;
        }

        var source = video.getAttribute('data-src');
        var hlsInstance = null;

        button.addEventListener('click', function () {
            if (!source) {
                return;
            }

            shell.classList.add('is-playing');
            attachSource(source);
        });

        function attachSource(url) {
            if (window.Hls && window.Hls.isSupported()) {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }

                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo();
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        video.src = url;
                        playVideo();
                    }
                });
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                video.addEventListener('loadedmetadata', playVideo, { once: true });
                return;
            }

            video.src = url;
            playVideo();
        }

        function playVideo() {
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    video.controls = true;
                });
            }
        }
    });
})();
