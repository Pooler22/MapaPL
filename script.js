'use strict';

/**
 * Pooler22 copyright. all right reserved
 */
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

function activateModal() {
    var modalEl = document.createElement('div');
    modalEl.innerHTML = '<div class=\'mui-container mui-panel\'><h1>Mapa Politechniki \u0141\xF3dzkiej</h1><br>' + '<p>Niniejsza strona jest projektem od student\xF3w dla student\xF3w i nie tylko.</p>' + '<p>Je\u015Bli znalaz\u0142e\u015B b\u0142\u0105d lub masz jakie\u015B sugestie napisz!. Link poni\u017Cej:</p>' + '<div class="mui-row mui--text-center">' + '<a class="mui-btn mui-btn--primary "  href=\'https://docs.google.com/forms/d/e/1FAIpQLSdSOC7mxqPRETVWX9-24MreBA9Rsj3vltYn9lQvl2yPhFvpAw/viewform?c=0&w=1\'><i class="fa fa-envelope-o"></i> Kontakt</a>' + '</div>' + '<div class="mui-row mui--text-center">' + '<button class="mui-btn" onclick="closePanel()">Zamknij</button>' + '</div>' + '</div>';
    modalEl.style.margin = '10px auto auto auto';
    mui.overlay('on', modalEl);
}

function closePanel() {
    mui.overlay('off');
}

//json
function loadJSON(path, success, error) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success) {
                    success(JSON.parse(xhr.responseText));
                }
            } else {
                if (error) {
                    error(xhr);
                }
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
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
        var place = places.filter(function (x) {
            return x.id == queryString.placeId;
        });
        var coordinates = getCoordinate(place[0].building);
        updateMarkerExt(prepareInfoContent(place[0], true), coordinates);
    } else if (queryString.buildingId !== undefined) {
        var building = buildings.filter(function (x) {
            return x.id == queryString.buildingId;
        });
        updateMarkerExt(prepareInfoContent(building[0]), [{
            "lat": Number(building[0].lat),
            "lng": Number(building[0].lng)
        }]);
    }
}

function getCoordinate(building) {
    return building.split(",").map(function (y) {
        var tmp = buildings.filter(function (x) {
            return x.id == y;
        });
        return {"lat": Number(tmp[0].lat), "lng": Number(tmp[0].lng)};
    });
}

function prepareInfoContent(element) {
    var isPlace = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if (isPlace) {
        return element.name + '<br>' + ('<a href=?placeId=' + element.id + '>Link do lokacji</a>');
    } else {
        return element.name + '<br>' + ('<a href=?buildingId=' + element.id + '>Link do budynku</a>');
    }
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

function updateMarkerExt1(content, latIn, lngIn) {
    updateMarkerExt(content, [{"lat": Number(latIn), "lng": Number(lngIn)}]);
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

function arrowSpan() {
    return '<span class="mui--pull-right mui-caret"></span>';
}

function printBuildings() {
    return '<strong onclick=\'toggleListElement(this);\'>Budynki' + arrowSpan() + '</strong>' + '<ul style=\'display:none;\'>' + buildings.reduce(function (a, building) {
            return a + prepareLink(building);
        }, "") + "${arrowSpan()}</ul>";
}

function printCategories(categories) {
    return categories.reduce(function (a, category) {
        return a + ('<li>' + printCategory(category) + '</li>');
    }, "");
}

function printCategory(category) {
    var tmp = '';
    tmp += '<strong onclick=\'toggleListElement(this);\'>' + (category.name + arrowSpan()) + '</strong>';
    tmp += '<ul style=\'display:none;\'>';

    if (category.subcategory !== undefined) {
        tmp += printCategories(category.subcategory);
    }
    category.places.forEach(function (place) {
        if (place.short == undefined) {
            place.short = "";
        }
        tmp += prepareLink(place, true);
    });
    tmp += '</ul>';
    return tmp;
}

function search() {
    if (!isOpenPanel) {
        toggleSidedrawer();
        if (window.innerWidth < 768) {
            showSidedrawer();
        }
    }
    document.getElementById("search-input").focus();
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
    listElement.innerHTML = tmp ? '<strong>Wyniki wyszukiwania</strong><ul>' + tmp + '</ul>' : '<strong>Brak wynik\xF3w</strong>';
}

function prepareUpdateMarker(id) {
    var isPlace = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if (isPlace) {
        var element = places.filter(function (place) {
            return place.id == id;
        });
        updateMarkerExt(prepareInfoContent(element[0], true), getCoordinate(element[0].building));
    } else {
        // prepareInfoContent(element, true)},JSON.stringify(getCoordinate(element.building));
    }
}

function prepareLink(element) {
    var isPlace = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if (isPlace) {
        return '<li><a href=\'javascript:prepareUpdateMarker(' + element.id + ',true);\'>' + element.name + '</a></li>';
    } else {
        return '<li><a href=\'javascript:updateMarkerExt1("' + prepareInfoContent(element) + '",' + element.lat + ',' + element.lng + ');\'><b>' + element.short + '</b> ' + element.name + '</a></li>';
    }
}

function getSearchResult(searched, collection) {
    var findInBuildingsCollection = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    return collection.reduce(function (a, element) {
        if (isFunded(searched.toLowerCase().trim(), element)) {
            if (findInBuildingsCollection) {
                return a + prepareLink(element, true);
            } else {
                return a + prepareLink(element);
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
    sidedrawerElement.className = sidedrawerElement.className.replace(' ', 'active');
    document.body.appendChild(sidedrawerElement);
    mui.overlay('off');
    updateMapSize();
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
    var magic2 = 70;

    if (lastWidth > sizeMin) mui.overlay('off', {
        onclose: function onclose() {
            isOpenPanel = false;
        }
    });
    if (isOpenPanel) {
        mapElement.style.height = window.innerHeight - magic2 + 'px';
        mapElement.style.width = window.innerWidth - magic1 + 'px';
    } else {
        mapElement.style.height = window.innerHeight - magic2 + 'px';
        mapElement.style.width = window.innerWidth + 'px';
    }

    if (isOpenPanel) {
        if (window.innerWidth > 768) {
            mui.overlay('off');
        } else {
            mapElement.style.height = window.innerHeight - magic2 + 'px';
            mapElement.style.width = window.innerWidth + 'px';
        }
    }
    try {
        google.maps.event.trigger(mapElement, 'resize');
    } catch (e) {
    }
}

function resize() {
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
    // document.getElementById('search-icon').addEventListener('click', search, false);
    // document.getElementById('activateModal').addEventListener('click', activateModal, false);
    // document.getElementById('js-show-sidedrawer').addEventListener('click', showSidedrawer, false);
    // document.getElementById('js-hide-sidedrawer').addEventListener('click', toggleSidedrawer, false);


    updateMapSize();
    loadJSON('json/categories.json', function (data) {
        categories = data;
        loadJSON('json/places.json', function (data) {
            places = data;

            loadJSON('json/buildings.json', function (data) {
                buildings = data;

                initList();
                getQueryURL();
            }, function (xhr) {
                console.error(xhr);
            });
        }, function (xhr) {
            console.error(xhr);
        });
    }, function (xhr) {
        console.error(xhr);
    });
}

init();