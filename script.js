(function () {
    "use strict";
    "use strict";

    var map = void 0,
        markers = [],
        infowindows = [];
    var mapElement = void 0,
        listElement = void 0,
        sidedrawerElement = void 0;
    var isOpenPanel = void 0,
        edited = false;
    var lastWidth = void 0,
        sizeMin = 770;
    var buildings = void 0,
        categories = void 0,
        places = void 0;

    //json
    function loadJSON(path) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                }
            };
            xhr.onerror = function () {
                reject(Error("Network Error"));
            };
            xhr.open("GET", path, true);
            xhr.send();
        });
    }

    //url query
    function getQueryString() {
        var query_string = {};
        window.location.search.substring(1).split("&").forEach(function (item) {
            var pair = item.split("=");
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = decodeURIComponent(pair[1]);
            } else if (typeof query_string[pair[0]] === "string") {
                query_string[pair[0]] = [query_string[pair[0]], decodeURIComponent(pair[1])];
            } else {
                query_string[pair[0]].push(decodeURIComponent(pair[1]));
            }
        });
        return query_string;
    }

    function getQueryURL() {
        var queryString = getQueryString();
        if (queryString.placeId !== undefined) {
            var place = places.find(function (x) {
                return x.id == queryString.placeId;
            });
            var coordinates = place.building.split(",").map(function (y) {
                var tmp = buildings.find(function (x) {
                    return x.id == y;
                });
                return {"lat": Number(tmp.lat), "lng": Number(tmp.lng)};
            });
            updateMarkerExt(prepareInfoContent(place, true), coordinates);
        } else if (queryString.buildingId !== undefined) {
            var building = buildings.find(function (x) {
                return x.id == queryString.buildingId;
            });
            updateMarkerExt(prepareInfoContent(building), [{"lat": Number(building.lat), "lng": Number(building.lng)}]);
        }
    }

    function prepareInfoContent(element) {
        var isPlace = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        return element.name + "<br>" + ("<a href=" + (isPlace ? '?placeId=' : '?buildingId=') + element.id + ">Link do lokacji</a>");
    }

    function prepareInfoContentExt(element) {
        var isPlace = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        var building = buildings.find(function (x) {
            return x.id == element.building.split(",")[0];
        });

        return element.name + "<br>" + ("<ul>" + prepareLinkBuilding(building) + "</ul>") + ("<a href=" + (isPlace ? '?placeId=' : '?buildingId=') + element.id + ">Link do lokacji</a>");
    }

    //map
    function initMap() {
        var latIn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 51.752845;
        var lngIn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 19.453180;
        var zoomIn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 18;

        var welcomeText = "Witaj na stronie mapy Politechniki Łódzkiej - online. Wybierz z menu po lewej stornie " + "kategorię i miejsce jakie cię interesują albo wyszukaj za pomocą wyszukiwarki.";

        map = new google.maps.Map(mapElement, {
            zoom: zoomIn
        });
        updateMarkerExt(welcomeText, [{"lat": latIn, "lng": lngIn}]);
    }

    function updateMarkerExt(content, coordinate) {
        markers.forEach(function (x) {
            x.setMap(null);
        });
        markers = [];

        coordinate.forEach(function (coordinate) {
            var marker = new google.maps.Marker({
                position: {
                    lat: coordinate.lat,
                    lng: coordinate.lng
                },
                map: map
            });
            marker.setMap(map);
            var infowindow = new google.maps.InfoWindow({content: content});
            google.maps.event.addListener(marker, 'click', function () {
                infowindows.forEach(function (x) {
                    return x.close();
                });
                infowindow.open(map, marker);
            });
            if (markers.length == 0) {
                infowindow.open(map, marker);
                map.setCenter(marker.getPosition());
            }
            infowindows.push(infowindow);
            markers.push(marker);
        });

        if (window.innerWidth < sizeMin) {
            closeSidedraver();
        }
    }

    //list
    function extendCategories(categories) {
        categories.forEach(function (category) {
            category.places = places.filter(function (place) {
                return place.category == category.id;
            });
            if (category.subcategory !== undefined) {
                extendCategories(category.subcategory);
            }
        });
    }

    function initList() {
        extendCategories(categories);
        listElement.innerHTML = printCategories(categories) + printBuildings();
    }

    function printBuildings() {
        return "<strong onclick='toggleListElement(this);'>Budynki</strong>" + "<ul style='display:none;'>" + buildings.reduce(function (a, building) {
                return a + prepareLinkBuilding(building);
            }, "") + "</ul>";
    }

    function printCategories(categories) {
        return categories.reduce(function (a, category) {
            return a + ("<li>" + printCategory(category) + "</li>");
        }, "");
    }

    function printCategory(category) {
        var tmp = "";
        tmp += "<strong onclick='toggleListElement(this);'>" + category.name + "</strong>";
        tmp += "<ul style='display:none;'>";

        if (category.subcategory !== undefined) {
            tmp += printCategories(category.subcategory);
        }
        category.places.forEach(function (place) {
            if (place.short == undefined) {
                place.short = "";
            }
            var building = buildings.find(function (x) {
                return x.id == place.building.split(",")[0];
            });
            tmp += prepareLinkPlace(place, building);
        });
        tmp += "</ul>";
        return tmp;
    }

    function filterPlaces(searched) {
        if (searched.length) {
            filterList(searched);
        } else {
            if (edited) {
                edited = false;
                initList();
            }
        }
    }

    function filterList(searched) {
        var tmp = getSearchResult(searched, buildings, false) + getSearchResult(searched, places, true);
        edited = true;
        listElement.innerHTML = tmp ? "<strong>Wyniki wyszukiwania</strong><ul>" + tmp + "</ul>" : "<strong>Brak wynik\xF3w</strong>";
    }

    function prepareLinkPlace(place, building) {
        var buildingsInfo = [];
        var coordinates = place.building.split(",").map(function (y) {
            var tmp = buildings.find(function (x) {
                return x.id == y;
            });
            return {"lat": Number(tmp.lat), "lng": Number(tmp.lng)};
        });
        return "<li><a href='javascript:updateMarkerExt(\"" + prepareInfoContent(place, true) + "\"," + JSON.stringify(coordinates) + ");'>" + place.name + "</a></li>";
    }

    function prepareLinkBuilding(element) {
        return "<li><a href='javascript:updateMarkerExt(\"" + prepareInfoContent(element) + "\",[{\"lat\":" + element.lat + ", \"lng\":" + element.lng + "}]);'><b>" + element.short + "</b> " + element.name + "</a></li>";
    }

    function getSearchResult(searched, collection) {
        var findInBuildingsCollection = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        return collection.reduce(function (a, element) {
            if (isFunded(searched.toLowerCase().trim(), element)) {
                if (findInBuildingsCollection) {
                    var building = buildings.find(function (x) {
                        return x.id == element.building.split(",")[0];
                    });
                    return a + prepareLinkPlace(element, building);
                } else {
                    return a + prepareLinkBuilding(element);
                }
            } else {
                return a;
            }
        }, "");
    }

    function isFunded(searched, element) {
        var tmp1 = false,
            tmp2 = false;
        if (element.tags !== undefined) {
            tmp1 = element.tags.toLowerCase().search(searched) != -1;
        }
        if (element.short_name !== undefined) {
            tmp2 = element.short_name.toLowerCase().search(searched) != -1;
        }
        return element.name.toLowerCase().search(searched) != -1 || element.short.toLowerCase().search(searched) != -1 || tmp1 || tmp2;
    }

    //view
    function toggleListElement(element) {
        element.nextSibling.style.display = element.nextSibling.style.display == "none" ? "block" : "none";
    }

    function showSidedrawer() {
        isOpenPanel = true;
        mui.overlay('on', {
            onclose: function onclose() {
                sidedrawerElement.className = sidedrawerElement.className.replace(' active', '');
                document.body.appendChild(sidedrawerElement);
                isOpenPanel = false;
            }
        }).appendChild(sidedrawerElement);
        setTimeout(function () {
            return sidedrawerElement.className += ' active';
        }, 20);
    }

    function closeSidedraver() {
        isOpenPanel = false;
        sidedrawerElement.className = sidedrawerElement.className.replace(' active', '');
        document.body.appendChild(sidedrawerElement);
        mui.overlay('off');
    }

    function toggleSidedrawer() {
        if (document.body.className == 'hide-sidedrawer') {
            isOpenPanel = true;
            document.body.className = 'show-sidedrawer';
        } else {
            isOpenPanel = false;
            document.body.className = 'hide-sidedrawer';
        }
        updateMapSize();
    }

    function updateMapSize() {
        var magic1 = 300;
        var magic2 = 64;
        var magic3 = "300px";
        var magic4 = '0px';

        if (lastWidth > sizeMin) mui.overlay('off', {
            onclose: function onclose() {
                isOpenPanel = false;
            }
        });

        mapElement.style.height = window.innerHeight - magic2 + "px";

        if (isOpenPanel) {
            mapElement.style.width = window.innerWidth - magic1 + "px";
            mapElement.style.marginLeft = magic3;
        } else {
            mapElement.style.width = window.innerWidth + "px";
            mapElement.style.marginLeft = magic4;
        }
    }

    function resize() {
        isOpenPanel = window.innerWidth > sizeMin;
        updateMapSize();
    }

    //init
    function init() {
        lastWidth = window.innerWidth;
        isOpenPanel = lastWidth > sizeMin;
        mapElement = document.getElementById('map');
        listElement = document.getElementById("list");
        sidedrawerElement = document.getElementById('sidedrawer');

        window.addEventListener('resize', resize);
        document.getElementById('js-show-sidedrawer').addEventListener('click', showSidedrawer, false);
        document.getElementById('js-hide-sidedrawer').addEventListener('click', toggleSidedrawer, false);

        updateMapSize();

        categories = loadJSON('json/categories.json');
        places = loadJSON('json/places.json');
        buildings = loadJSON('json/buildings.json');;;
        initList();
        getQueryURL();
    }

    init();
}).call(this);