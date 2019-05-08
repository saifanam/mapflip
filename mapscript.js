
(function() {

    const mapUtilities = {
        isCenterInPolygon: function(map, HK) {
            return google.maps.geometry.poly.containsLocation(map.getCenter(), new google.maps.Polygon({paths: HK}));
        },

        inViewport: function(map, polygon) {
            polygon = new google.maps.Polygon({ paths: polygon });
            return polygon.getPaths().getArray().every(function (path) {
                return path.getArray().every(function(coord) {
                    return map.getBounds().contains(coord);
                });
            });
        },

        placeMarker: function(location) {
            const noiseMarker = "static.png";
            const marker = new google.maps.Marker({
                position:location,
                map: map,
                icon: noiseMarker,
                draggable: false
            });
            return marker;
        },

        plotRandom: function(sliderValue, map) {
            const bounds = map.getBounds();
            const southWest = bounds.getSouthWest();
            const northEast = bounds.getNorthEast();
            const lngSpan = northEast.lng() - southWest.lng();
            const latSpan = northEast.lat() - southWest.lat();

            for(let i=0; i<sliderValue; ++i) {
                const point = new google.maps.LatLng(southWest.lat() + latSpan * Math.random(), southWest.lng() + lngSpan * Math.random());
                const marker = this.placeMarker(point);
                randomNoise.push(marker);
                marker.setMap(map);
            }
        }
    };

    const mapModule = {
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoom: 5,
        HK: [
            { lat: 22.419973, lng: 113.864704 },
            { lat: 22.508174, lng: 114.001347 },
            { lat: 22.589346, lng: 114.418827 },
            { lat: 22.541156, lng: 114.452473 },
            { lat: 22.147402, lng: 114.455219 },
            { lat: 22.195728, lng: 113.806339 },
            { lat: 22.419973, lng: 113.864704 }
        ],
        mapCenter: { lat: 22.296778, lng: 113.619572 },

        initGoogleMap: function(mapElement, mapTypeId, mapCenter, zoom) {
            let map = new google.maps.Map(mapElement, {
                center: mapCenter,
                zoom: zoom,
                mapTypeId: mapTypeId,
                mapTypeControl: false,
                streetViewControl: false
            });
            return map;
        },

        initOSM: function(map) {
            map.mapTypes.set("OSM", new google.maps.ImageMapType({
                getTileUrl: function(coord, zoom) {
                    let tilesPerGlobe = 1 << zoom;
                    let x = coord.x % tilesPerGlobe;
                    if (x < 0) {
                        x = tilesPerGlobe+x;
                    }
                    return "http://tile.openstreetmap.org/" + zoom + "/" + x + "/" + coord.y + ".png";
                },
                tileSize: new google.maps.Size(256, 256),
                name: "OpenStreetMap",
                maxZoom: 18
            }));
        },

        flipMapType: function(map) {
            if(map.getZoom() >= 10) {
                if(mapUtilities.inViewport(map, this.HK) || mapUtilities.isCenterInPolygon(map, this.HK) ) {
                    map.setMapTypeId("OSM");
                    this.initOSM(map);
                    return;
                }
            }
            map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
        },

        createNoise: function(sliderValue, map) {
            if(sliderValue == 9) {
                sliderValue *= 100;
            }
            else {
                sliderValue *= 3;
            }
            if (randomNoise) {
                for (i in randomNoise) {
                    randomNoise[i].setMap(null);
                }
            }
            randomNoise = new Array(0);
            mapUtilities.plotRandom(sliderValue, map);
        }
    };

    let randomNoise = new Array(0);
    const mapElement = document.getElementById("map");
    const noiseControl = document.querySelector("#noise-control input");
    const mapInstance = Object.create(mapModule);
    const map = mapInstance.initGoogleMap(mapElement, mapInstance.mapTypeId, mapInstance.mapCenter, mapInstance.zoom);

    google.maps.event.addListener(map, "idle", function() {
        mapInstance.flipMapType(map);
        const sliderValue = noiseControl.value;
        mapInstance.createNoise(sliderValue, map);
    });

    noiseControl.onchange = function() {
        mapInstance.createNoise(this.value, map);
    };

})();