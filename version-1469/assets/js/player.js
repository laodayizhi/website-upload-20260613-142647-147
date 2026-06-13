(function () {
  function initMoviePlayer(options) {
    var video = document.getElementById(options.videoId);
    var trigger = document.getElementById(options.triggerId);
    var source = options.source;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (video.getAttribute("data-ready") === "1") {
        return;
      }
      video.setAttribute("data-ready", "1");
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
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
      } else {
        video.src = source;
      }
    }

    function startPlayback() {
      attachSource();
      if (trigger) {
        trigger.classList.add("is-hidden");
      }
      var request = video.play();
      if (request && typeof request.catch === "function") {
        request.catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
