var map;
var baseUrl = 'https://razortracking.net'

function loadMapScenario() {
    // Coordinates will need to come from the field record in Dynamics
    var fieldGeo = [[46.65326757894689, -96.42025035713709],[46.652448813710876, -96.42023384116604],[46.65244575870562, -96.42093202940694],[46.653262927370356, -96.42127000481528]];
    var polyPoints = [];
    for (i = 0; i < fieldGeo.length; i+=1) {
      var latitude = fieldGeo[i][0];
      var longitude = fieldGeo[i][1];
      var polyPoint = new Microsoft.Maps.Location(latitude,longitude);
      polyPoints.push(polyPoint);
    }

    var polygon = new Microsoft.Maps.Polygon(polyPoints, null);
    var geoCenter = Microsoft.Maps.LocationRect.fromLocations(polyPoints);
    var razor = getRazorData();


    map = new Microsoft.Maps.Map(document.getElementById('myMap'), {
      center : geoCenter.center,
      zoom : 18
    });


    var pushpin = new Microsoft.Maps.Pushpin(map.getCenter(), null);
    map.entities.push(pushpin);
    var weather = loadWeather();
    map.entities.push(polygon);

}

function getRazorData(){
  var request = {
    // Will need to come from Dynamics solution settings
    "userName": '9990-admin',
    "password": '9990-admin'
  };
  $.ajax({
    url: baseUrl + '/Services/API/RazorTrackingApi.svc/Authenticate',
    crossDomain: true,
    type: 'POST',
    contentType: "application/json;charset=utf-8",
    cache: false,
    datatype: 'json',
    data: JSON.stringify(request),
    dataFilter: function(data) {
      var unwrapped = eval('(' + data + ')');
      if (unwrapped.hasOwnProperty('d'))
        return unwrapped.d;
      else
        return unwrapped;
    },
    success: function(result) {
      if (result.ErrorDetail) {
        alert(result.ErrorDetail.toString());
      }

      var token = result.Token.toString();
      var currentPosition = getCurrentPosition(token);
    },
    error: function(response) {
      console.log(response);
    }
  });
};

function getCurrentPosition(token) {
  var request = {
    "token": token,
    //Can be multiple vehicle ids in an array
    "vehicleIds": ['a3afb791-0239-401f-af76-b30c36e30230']
  };
  $.ajax({
    url: baseUrl + '/Services/API/RazorTrackingApi.svc/GetCurrentPosition',
    crossDomain: true,
    type: 'POST',
    contentType: "application/json;charset=utf-8",
    traditional: true,
    cache: false,
    datatype: 'json',
    data: JSON.stringify(request),
    dataFilter: function(data) {
      var unwrapped = eval('(' + data + ')');
      if (unwrapped.hasOwnProperty('d'))
        return unwrapped.d;
      else
        return unwrapped;
    },
    success: function(result) {
      if (result.ErrorDetail) {
        alert(result.ErrorDetail.toString());
      }

      for (var i = 0; i < result.length; i++) {
        console.log(JSON.stringify(result[i]));
        var latitude = result[i]['CurrentLatitude'];
        var longitude = result[i]['CurrentLongitude'];
        var assetGeo = new Microsoft.Maps.Location(latitude,longitude);
        var assetPin = new Microsoft.Maps.Pushpin(assetGeo, { icon: 'img/tractor32.png' });
        map.entities.push(assetPin);
      }
    },
    error: function(response) {
      console.log(response);
    }
  });
}

function loadWeather(){
  // tile url from Iowa Environmental Mesonet of Iowa State University
  var urlTemplate = 'https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-{timestamp}/{zoom}/{x}/{y}.png';
  var timestamps = ['900913-m50m', '900913-m45m', '900913-m40m', '900913-m35m', '900913-m30m', '900913-m25m', '900913-m20m', '900913-m15m', '900913-m10m', '900913-m05m', '900913'];
  var tileSources = [];
  for (var i = 0; i < timestamps.length; i++) {
      var tileSource = new Microsoft.Maps.TileSource({
          uriConstructor: urlTemplate.replace('{timestamp}', timestamps[i])
      });
      tileSources.push(tileSource);
  }
  var animatedLayer = new Microsoft.Maps.AnimatedTileLayer({ mercator: tileSources, frameRate: 500 });
  map.layers.insert(animatedLayer);
}
