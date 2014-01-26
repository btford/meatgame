  'use strict';

  function VideoShooter (videoElement) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.scale(-1, 1); // mirror flip preview back to the normal direction

    canvas.width = videoElement.width;
    canvas.height = videoElement.height;

    this.getShot = function (callback, numFrames, interval, progressCallback) {
      numFrames = numFrames !== undefined ? numFrames : 3;
      interval = interval !== undefined ? interval : 0.1; // In seconds

      var pendingFrames = numFrames;
      var ag = new Animated_GIF({workerPath: '/lib/Animated_GIF.worker.min.js'});
      ag.setSize(canvas.width, canvas.height);
      ag.setDelay(interval);

      captureFrame();

      function captureFrame() {
        ag.addFrame(videoElement);
        pendingFrames--;

        // Call back with an r value indicating how far along we are in capture
        // progressCallback((numFrames - pendingFrames) / numFrames);

        if(pendingFrames > 0) {
          setTimeout(captureFrame, interval * 1000); // timeouts are in milliseconds
        } else {
          ag.getBase64GIF(function(image) {
            
            // Ensure workers are freed-so we avoid bug #103 https://github.com/meatspaces/meatspace-chat/issues/103
            ag.destroy();

            callback(image);

          });
        }
      }
    };
  }
