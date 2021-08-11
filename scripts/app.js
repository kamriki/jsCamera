angular
.module('myApp', ['webcam'])
.controller('mainController', function($scope, $http) {
    var _video = null,
        patData = null;

    $scope.patOpts = {x: 0, y: 0, w: 25, h: 25};
    
    // Setup a channel to receive a video property
    // with a reference to the video element
    // See the HTML binding in main.html
    $scope.channel = {};

    $scope.webcamError = false;
    $scope.onError = function (err) {
        $scope.$apply(
            function() {
                $scope.webcamError = err;
            }
        );
    };

    $scope.onSuccess = function () {
        // The video element contains the captured camera data
        _video = $scope.channel.video;
        $scope.$apply(function() {
            $scope.patOpts.w = _video.width;
            $scope.patOpts.h = _video.height;
            //$scope.showDemos = true;
        });
    };

    $scope.onStream = function (stream) {
        // You could do something manually with the stream.
    };

	$scope.makeSnapshot = function() {
        if (_video) {
            var patCanvas = document.querySelector('#snapshot');
            if (!patCanvas) return;

            patCanvas.width = _video.width;
            patCanvas.height = _video.height;
            var ctxPat = patCanvas.getContext('2d');

            var idata = getVideoData($scope.patOpts.x, $scope.patOpts.y, $scope.patOpts.w, $scope.patOpts.h);
            ctxPat.putImageData(idata, 0, 0);

            //sendSnapshotToServer(patCanvas.toDataURL().replace('\n',''));
            // sendSnapshotToServer(patCanvas.toDataURL().toString('base64'));
            sendSnapshotToServer(patCanvas.toDataURL('image/png'));
            // sendSnapshotToServer(patCanvas.toDataURL('image/jpeg'));
            patData = idata;
        }
    };
    

    function tick() {
        //get the mins of the current time
        var mins = new Date().getMinutes();
        var sec = new Date().getSeconds();
        if ((mins == "00" || mins == "15" || mins == "30" || mins == "45") && sec == "00") {
            console.log('send photo');
            $scope.makeSnapshot();
        }
        console.log('Tick ' + mins);
      }
      
    setInterval(tick, 1000);

    /**
     * Redirect the browser to the URL given.
     * Used to download the image by passing a dataURL string
     */
    $scope.downloadSnapshot = function downloadSnapshot(dataURL) {
        window.location.href = dataURL;
    };
    
    var getVideoData = function getVideoData(x, y, w, h) {
        var hiddenCanvas = document.createElement('canvas');
        hiddenCanvas.width = _video.width;
        hiddenCanvas.height = _video.height;
        var ctx = hiddenCanvas.getContext('2d');
        ctx.drawImage(_video, 0, 0, _video.width, _video.height);
        return ctx.getImageData(x, y, w, h);
    };

    /**
     * This function could be used to send the image data
     * to a backend server that expects base64 encoded images.
     */
    var sendSnapshotToServer = function sendSnapshotToServer(imgBase64) {
        $scope.snapshotData = imgBase64;
        console.log($scope.snapshotData);

        $http(
            { 
                method: 'POST', data: 'R=updCoffeePhoto&photoCoffee=' + imgBase64, 
                url: 'https://apis.k-amriki.net/projects/expences/default.aspx', 
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
            })
        .then(function(response) {
            console.log(response);
        });
    };
});
