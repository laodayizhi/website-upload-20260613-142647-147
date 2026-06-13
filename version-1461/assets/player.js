(function () {
    function attachStream(video, source, onReady) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            onReady();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                maxBufferLength: 60,
                enableWorker: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                onReady();
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    try {
                        hls.destroy();
                    } catch (error) {
                    }
                    video.src = source;
                    onReady();
                }
            });
            return;
        }

        video.src = source;
        onReady();
    }

    window.initMoviePlayer = function (videoId, overlayId, source) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var ready = false;

        if (!video || !overlay || !source) {
            return;
        }

        function play() {
            function startPlayback() {
                var attempt = video.play();
                if (attempt && typeof attempt.catch === "function") {
                    attempt.catch(function () {
                    });
                }
            }

            overlay.classList.add("hidden");

            if (ready) {
                startPlayback();
                return;
            }

            attachStream(video, source, function () {
                ready = true;
                startPlayback();
            });
        }

        overlay.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            overlay.classList.add("hidden");
        });
        video.addEventListener("pause", function () {
            overlay.classList.remove("hidden");
        });
        video.addEventListener("ended", function () {
            overlay.classList.remove("hidden");
        });
    };
})();
