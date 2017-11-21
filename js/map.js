var map;
function loadMapScenario() {
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
