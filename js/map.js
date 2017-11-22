var map;
var baseUrl = 'https://razortracking.net'

function loadMapScenario() {
    // Coordinates will need to come from the field record in Dynamics
    var fieldGeo = [[46.65326757894689, -96.42025035713709],[46.652448813710876, -96.42023384116604],[46.65244575870562, -96.42093202940694],[46.653262927370356, -96.42127000481528]];
    var polyPoints = [];
    for (i = 0; i < fieldGeo.length; i++) {
      var latitude = fieldGeo[i][0];
      var longitude = fieldGeo[i][1];
      var polyPoint = new Microsoft.Maps.Location(latitude,longitude);
      polyPoints.push(polyPoint);
    }
    var polygon = new Microsoft.Maps.Polygon(polyPoints, null);
    var geoCenter = Microsoft.Maps.LocationRect.fromLocations(polyPoints);
    map = new Microsoft.Maps.Map(document.getElementById('myMap'), {
      center : geoCenter.center,
      zoom : 15
    });
    map.entities.push(polygon);
}

function getRazorToken(){
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

      $("#status").text(result.AuthenticationStatus.toString());
      $("#token").text(result.Token.toString());
      $("#tokenInput, #locationTokenInput").val(result.Token.toString());
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
        // $("#positionsList").append("[" + i + "]:" + JSON.stringify(result[i]) + "<br/>");
        console.log(JSON.stringify(result[i]));
        console.log(JSON.stringify(result[i][currentLongitude]));
      }
    },
    error: function(response) {
      console.log(response);
    }
  });
}

var razor = getRazorToken();
