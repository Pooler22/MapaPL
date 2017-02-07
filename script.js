"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Pooler22 copyright. all right reserved
 */

var view = void 0,
    data = void 0,
    googleApi = void 0;
var map = void 0,
    markers = [];
// let markers2 = L.markerClusterGroup({
//     spiderLegPolylineOptions: {weight: 1.5, color: '#222', opacity: 0.1},
//     // maxClusterRadius: 120,
//     // iconCreateFunction: function (cluster) {
//     //     var markers = cluster.getAllChildMarkers();
//     //     return L.divIcon({ className: 'mycluster'});
//     // },
// });
var tmp;

var JSONHelper = function () {
    function JSONHelper() {
        _classCallCheck(this, JSONHelper);
    }

    _createClass(JSONHelper, null, [{
        key: "loadJSON",
        value: function loadJSON(path, success, error) {
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
    }]);

    return JSONHelper;
}();

var QueryHelper = function () {
    function QueryHelper() {
        _classCallCheck(this, QueryHelper);
    }

    _createClass(QueryHelper, null, [{
        key: "decodeQueryString",
        value: function decodeQueryString() {
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
    }, {
        key: "getQueryURL",
        value: function getQueryURL() {
            var queryString = QueryHelper.decodeQueryString();
            if (queryString.placeId !== undefined) {
                if (queryString.index !== undefined) {
                    var place = data.getPlacesById(queryString.placeId)[0];

                    // view.prepareUpdateMarker(queryString.placeId, true);

                    var coordinates = data.getCoordinate(place.building);
                    var _tmp = coordinates[queryString.index];
                    coordinates[queryString.index] = coordinates[0];
                    coordinates[0] = _tmp;

                    view.updateMarkerExt(view.prepareInfoContent(place, true), coordinates);
                } else {
                    view.activateModalPlace(queryString.placeId); // todo wex poprawke na nr lindexu
                }
            } else if (queryString.buildingId !== undefined) {
                var building = data.getBuildingsById(queryString.buildingId)[0];
                view.updateMarkerExt(view.prepareInfoContent(building, false), [{
                    "lat": Number(building.lat),
                    "lng": Number(building.lng)
                }]);
            }
        }
    }, {
        key: "UpdateURL",
        value: function ChangeUrl(title, url) {
            if (typeof history.pushState != "undefined") {
                var obj = { Title: title, Url: url };
                history.pushState(obj, obj.Title, obj.Url);
            } else {
                console.error("Error: Change url");
            }
        }
    }]);

    return QueryHelper;
}();

var Data = function () {
    function Data(buildings, categories, places) {
        _classCallCheck(this, Data);

        this.listSearched = document.getElementById("listSearched");
        this.listElement = document.getElementById("list");

        this.buildings = buildings;
        this.categories = categories;
        this.places = places;
        this.htmlCategoriesList = "";

        this.extendCategories(this.categories);
    }

    _createClass(Data, [{
        key: "extendCategories",
        value: function extendCategories(categories) {
            var _this = this;

            categories.forEach(function (category) {
                category.places = _this.places.filter(function (place) {
                    return place.category == category.id;
                });
            });
        }
    }, {
        key: "preparePrintCategories",
        value: function preparePrintCategories() {
            this.htmlCategoriesList = "<p style='margin-left:10px'>Lista miejsc:</p>" + view.printCategories(this.categories) + view.printBuildings(this.buildings);
            this.listElement.innerHTML = this.htmlCategoriesList;
        }
    }, {
        key: "getPlacesById",
        value: function getPlacesById(id) {
            return this.places.filter(function (x) {
                return x.id == id;
            });
        }
    }, {
        key: "getBuildingsById",
        value: function getBuildingsById(id) {
            return this.buildings.filter(function (x) {
                return x.id == id;
            });
        }
    }, {
        key: "getCoordinate",
        value: function getCoordinate(buildingIds) {
            var _this2 = this;

            return buildingIds.split(",").map(function (buildingId) {
                var coordinate = _this2.getBuildingsById(buildingId)[0];
                return { "lat": Number(coordinate.lat), "lng": Number(coordinate.lng) };
            });
        }
    }, {
        key: "filterPlaces",
        value: function filterPlaces(searched) {
            if (searched.length) {
                this.listSearched.style.display = "block";
                this.listElement.style.display = "none";
                this.filterList(searched);
            } else {
                this.listSearched.style.display = "none";
                this.listElement.style.display = "block";
            }
        }
    }, {
        key: "filterList",
        value: function filterList(searched) {
            var tmp = this.getSearchResult(searched, this.buildings, false) + this.getSearchResult(searched, this.places, true);
            this.listSearched.innerHTML = tmp ? "<strong>Wyniki wyszukiwania</strong><ul>" + tmp + "</ul>" : "<strong>Brak wynik\xF3w</strong>";
        }
    }, {
        key: "getSearchResult",
        value: function getSearchResult(searched, collection) {
            var _this3 = this;

            var findInBuildingsCollection = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            return collection.reduce(function (a, element) {
                if (_this3.isFunded(searched.toLowerCase().trim(), element)) {
                    if (findInBuildingsCollection) {
                        return a + View.prepareLink(element, true);
                    } else {
                        return a + View.prepareLink(element);
                    }
                } else {
                    return a;
                }
            }, "");
        }
    }, {
        key: "isFunded",
        value: function isFunded(searched, element) {
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
    }]);

    return Data;
}();

var View = function () {
    function View() {
        _classCallCheck(this, View);

        this.sidedrawerElement = document.getElementById('sidedrawer');
        this.mapElement = document.getElementById('map');
        this.modal = View.initModal();
        this.sizeMin = 768;
        this.lastWidth = window.innerWidth;
        this.isOpenPanel = this.lastWidth > this.sizeMin;
        window.addEventListener('resize', this.updateMapSize);
        document.addEventListener('resize', this.updateMapSize);
        this.initMap();
    }

    _createClass(View, [{
        key: "initModal",
        value: function initModal() {
            var modal = document.createElement('div');
            modal.innerHTML = "<div class='mui-container mui-panel'><h2>Mapa Politechniki \u0141\xF3dzkiej</h2>" + "<p>Niniejsza strona jest projektem od student\xF3w dla student\xF3w i nie tylko.</p>" + "<p>Je\u015Bli znalaz\u0142e\u015B b\u0142\u0105d lub masz jakie\u015B sugestie napisz!. Link poni\u017Cej:</p>" + "<div class=\"mui-row mui--text-center\">" + "<a class=\"mui-btn mui-btn--primary \"  href='https://docs.google.com/forms/d/e/1FAIpQLSdSOC7mxqPRETVWX9-24MreBA9Rsj3vltYn9lQvl2yPhFvpAw/viewform?c=0&w=1'><i class=\"fa fa-envelope-o\"></i> Kontakt</a>" + "</div>" + "<div class=\"mui-row mui--text-center\">" + "<button class=\"mui-btn\" onclick=\"view.overlayOff()\">Zamknij</button>" + "</div>" + "</div>";
            modal.style.margin = '10px auto auto auto';
            return modal;
        }
    }, {
        key: "initModalInfoPlace",
        value: function initModalInfoPlace(element) {
            var modal = document.createElement('div');
            modal.innerHTML = "<div class='mui-container mui-panel'>" + ("<h1>" + View.getShort(element) + element.name + "</h1>") + (" <dl>\n                      " + View.getCategory(element) + "\n                      " + View.getWebsite(element) + "\n                      " + View.getPhone(element) + "\n                       " + View.getBuildings(element) + "\n                      " + View.getTags(element) + "\n                  </dl>") + "<div class=\"mui-row mui--text-center\">" + "<button class=\"mui-btn\" onclick=\"view.overlayOff()\">Zamknij</button>" + "</div>" + "</div>";
            modal.style.margin = '10px auto auto auto';
            return modal;
        }
    }, {
        key: "initModalInfoBuilding",
        value: function initModalInfoBuilding(element) {
            var modal = document.createElement('div');
            modal.innerHTML = "<div class='mui-container mui-panel'>" + ("<h1>" + View.getShort(element) + element.name + "</h1>") + (" <dl>" + View.getAddres(element) + "\n                " + View.getPlaces(element) + "\n                " + View.getTags(element) + "</dl>") + "<div class=\"mui-row mui--text-center\">" + "<button class=\"mui-btn\" onclick=\"view.overlayOff()\">Zamknij</button>" + "</div>" + "</div>";
            modal.style.margin = '10px auto auto auto';
            return modal;
        }
    }, {
        key: "initMap",
        value: function initMap() {
            var latIn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 51.752845;
            var lngIn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 19.553180;
            var zoom = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 16;

            // const welcomeText = "Witaj na stronie mapy Politechniki Łódzkiej - online. Wybierz z menu po lewej stornie " +
            //     "kategorię i miejsce jakie cię interesują albo wyszukaj za pomocą wyszukiwarki.";
            googleApi = new GoogleMapsApi(this.mapElement, zoom, [51.749845, 19.453180]);
            //map = mapApi.map;
            // this.updateMarkerExt([welcomeText], [{"lat": latIn, "lng": lngIn}]);
        }
    }, {
        key: "printBuildings",
        value: function printBuildings(buildings) {
            var _this4 = this;

            return "<strong onclick='View.toggleListElement(this);'>Budynki" + View.arrowSpan() + "</strong>" + "<ul style='display:none;'>" + buildings.reduce(function (a, building) {
                    return a + _this4.prepareLink(building);
                }, "") + (View.arrowSpan() + "</ul>");
        }
    }, {
        key: "printCategories",
        value: function printCategories(categories1) {
            var _this5 = this;

            return categories1.reduce(function (a, category) {
                if (category.isSubCat) {
                    return a;
                } else {
                    return a + ("<li>" + _this5.printCategory(category) + "</li>");
                }
            }, "");
        }
    }, {
        key: "printCategory",
        value: function printCategory(category) {
            var _this6 = this;

            var tmp = "";
            tmp += "<strong onclick='View.toggleListElement(this);'>" + (category.name + View.arrowSpan()) + "</strong>";
            tmp += "<ul style='display:none;'>";

            if (category.subcategory !== undefined) {
                category.subcategory.split(",").map(function (x) {

                    var tmp1 = data.categories.filter(function (a) {
                        return a.id == x;
                    });
                    tmp1[0].isSubCat = false;
                    tmp += view.printCategories(tmp1);
                    tmp1[0].isSubCat = true;
                });
            } else {
                category.places.forEach(function (place) {
                    if (place.short == undefined) {
                        place.short = "";
                    }
                    tmp += _this6.prepareLink(place, true);
                });
            }

            tmp += "</ul>";
            return tmp;
        }
    }, {
        key: "prepareLink",
        value: function prepareLink(element) {
            var isPlace = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            if (isPlace) {
                return "<li><a href='javascript:view.activateModalPlace(" + element.id + ");'>" + element.name + "</a></li>";
            } else {
                return "<li><a href='javascript:view.activateModalBuilding(\"" + element.id + "\");'>" + element.name + "</a></li>";
            }
        }
    }, {
        key: "arrowSpan",
        value: function arrowSpan() {
            return "<span class=\"mui--pull-right mui-caret\"></span>";
        }
    }, {
        key: "prepareUpdateMarker",
        value: function prepareUpdateMarker(id) {
            var isPlace = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            if (isPlace) {
                var element = data.places.filter(function (place) {
                    return place.id == id;
                })[0];
                this.updateMarkerExt(this.prepareInfoContent(element, true), data.getCoordinate(element.building));
            } else {
                var _element = data.buildings.filter(function (building) {
                    return building.id == id;
                })[0];
                this.updateMarkerExt1(this.prepareInfoContent(_element, false), _element.lat, _element.lng);
            }
            mui.overlay('off');
        }
    }, {
        key: "updateMarkerExt1",
        value: function updateMarkerExt1(content, latIn, lngIn) {
            this.updateMarkerExt(content, [{ "lat": Number(latIn), "lng": Number(lngIn) }]);
        }
    }, {
        key: "updateMarkerExt",
        value: function updateMarkerExt(content, coordinate) {
            // todo: setmap

            markers.forEach(function (x) {
                return googleApi.map.removeLayer(x);
            });
            // markers2.clearLayers();
            markers = [];
            var index = 0;
            coordinate.forEach(function (coordinate) {
                var marker = googleApi.createMarker(coordinate.lat, coordinate.lng, googleApi.map);
                // let marker = L.marker(new L.LatLng(coordinate.lat, coordinate.lng), {});
                googleApi.createInfoWindow(marker, content[index]);
                if (markers.length == 0) {
                    marker.openPopup();
                }
                markers.push(marker);
                // markers2.addLayer(marker);
                index += 1;
            });

            googleApi.setZoom(16);
            googleApi.setCenter(coordinate[0].lat, coordinate[0].lng);

            if (window.innerWidth < this.sizeMin) {
                view.closeSidedraver();
            }
            // mapApi.map.addLayer(markers);
        }
    }, {
        key: "activateModalPlace",
        value: function activateModalPlace(id) {
            var place = data.getPlacesById(id)[0];
            this.prepareUpdateMarker(id, true);
            if (place.building.split(",").length > 1) {
                mui.overlay('on', this.palceModal(place));
            }
        }
    }, {
        key: "activateModalBuilding",
        value: function activateModalBuilding(id) {
            var building = data.getBuildingsById(id)[0];
            this.prepareUpdateMarker(id, false);
            View.buildingModal(building);
        }
    }, {
        key: "activateModalInfo",
        value: function activateModalInfo(id, isPlace) {
            if (isPlace) {
                var place = data.getPlacesById(id)[0];
                mui.overlay('on', View.initModalInfoPlace(place));
            } else {
                var building = data.getBuildingsById(id)[0];
                mui.overlay('on', View.initModalInfoBuilding(building));
            }
        }
    }, {
        key: "setMarkerCloseModal",
        value: function setMarkerCloseModal(element, index) {
            QueryHelper.UpdateURL(element.name, "?placeId=" + element.id + "&index=" + index);

            mui.overlay('off');
            View.setMarker(index);
        }
    }, {
        key: "palceModal",
        value: function palceModal(element) {
            QueryHelper.UpdateURL(element.name, "?placeId=" + element.id);

            var idBuildings = element.building.split(',');
            var index = -1;

            var tmp = idBuildings.map(function (y) {
                var result = idBuildings.reduce(function (a, x) {
                    var tmp = data.buildings.filter(function (y) {
                        return y.id == x;
                    })[0];
                    index += 1;
                    return a + ("<div class=\"mui-divider\"></div><a href='javascript:view.setMarkerCloseModal(" + JSON.stringify({
                            id: element.id,
                            name: element.name
                        }) + "," + index + ")'>" + tmp.name + "</a><br><p>" + tmp.address + "</p>");
                }, "");
                index = -1;
                return result;
            });

            index = -1;

            var next = tmp.map(function (x) {
                index += 1;
                return "<strong>" + element.name + "</strong>" + ("<p>Wybierz jeden z budynk\xF3w tej jednostki:</p>" + x);
            });

            var modal = document.createElement('div');
            modal.innerHTML = "<div class='mui-container mui--text-center mui-panel'><div class=\"mui--text-center\">" + next[0] + "</div>" + "<button class=\"mui-btn\" onclick=\"view.overlayOff()\">Zamknij</button>" + "</div>";
            modal.style.margin = '10px auto auto auto';
            return modal;
        }
    }, {
        key: "buildingModal",
        value: function buildingModal(element) {
            QueryHelper.UpdateURL(element.name, "?buildingId=" + element.id);

            var idBuildings = element.id;
            var index = -1;
            var building = data.getBuildingsById(idBuildings);

            var tmp = "<div class=\"mui-divider\"></div><a href='javascript:view.setMarkerCloseModal(" + JSON.stringify({
                    id: element.id,
                    name: element.name
                }) + "," + index + ")'>" + building.name + "</a><br><p>" + building.address + "</p>";
        }
    }, {
        key: "activateModal",
        value: function activateModal() {
            mui.overlay('on', this.modal);
        }
    }, {
        key: "overlayOff",
        value: function overlayOff() {
            mui.overlay('off');
        }
    }, {
        key: "setMarker",
        value: function setMarker(index) {
            var position = markers[index]._latlng;
            googleApi.setCenter(position.lat, position.lng);
            markers[index].openPopup();
        }
    }, {
        key: "prepareInfoContent",
        value: function prepareInfoContent(element, isPlace) {
            var text = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "Link do lokacji";

            if (isPlace) {
                var _ret = function () {
                    QueryHelper.UpdateURL(element.name, "?placeId=" + element.id);

                    var idBuildings = element.building.split(',');
                    if (idBuildings.length > 1) {
                        var _ret2 = function () {
                            var index = -1;
                            var tmp = idBuildings.map(function (y) {
                                var result = idBuildings.reduce(function (a, x) {
                                    var tmp = data.buildings.filter(function (y) {
                                        return y.id == x;
                                    })[0];
                                    index += 1;
                                    if (y != x) {
                                        return a + ("<li><a href='javascript:view.setMarker(" + index + ")'>" + tmp.name + "</a></li>");
                                    } else {
                                        return a;
                                    }
                                }, "");
                                index = -1;
                                return result;
                            });

                            index = -1;

                            return {
                                v: {
                                    v: tmp.map(function (x) {
                                        index += 1;
                                        var building = data.getBuildingsById(idBuildings[index])[0];
                                        return "<p><strong>" + element.name + "</strong>"
                                            // + `<a href=?placeId=${element.id}>${text}</a>`
                                            + ("<br>" + View.getAddresExt(building) + "</p>") + ("Pozosta\u0142e budynki tej jednostki:<ul>" + x + "</ul>") + ("<a href='javascript:view.activateModalInfo(" + element.id + ",true);'>Wi\u0119cej informacji</a>");
                                    })
                                }
                            };
                        }();

                        if ((typeof _ret2 === "undefined" ? "undefined" : _typeof(_ret2)) === "object") return _ret2.v;
                    } else {

                        var building = data.getBuildingsById(idBuildings[0])[0];
                        return {
                            v: ["<p><strong>" + element.name + "</strong><br>"
                            // + `<a href=?placeId=${element.id}>${text}</a>`
                            + (building.name + "<br>") + ("" + View.getAddresExt(building)) + ("</br><a href='javascript:view.activateModalInfo(" + element.id + ",true);'>Wi\u0119cej informacji</a>")]
                        };
                    }
                }();

                if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
            } else {
                QueryHelper.UpdateURL(element.name, "?buildingId=" + element.id);

                return ["<p><strong>" + element.name + "</strong><br>"
                // + `<a href=?buildingId=${element.id}>${text}</a><br>`
                + ("" + View.getAddresExt(element)) + ("</p><a href='javascript:view.activateModalInfo(" + element.id + ",false);'>Wi\u0119cej informacji</a>")];
            }
        }
    }, {
        key: "toggleListElement",
        value: function toggleListElement(element) {
            var tmp = element.nextSibling;
            tmp.style.display = tmp.style.display == "none" ? "block" : "none";
        }
    }, {
        key: "showSidedrawer",
        value: function showSidedrawer() {
            var _this7 = this;

            this.isOpenPanel = true;
            mui.overlay('on', {
                onclose: function onclose() {
                    _this7.sidedrawerElement.className = _this7.sidedrawerElement.className.replace(' active', '');
                    document.body.appendChild(_this7.sidedrawerElement);
                    _this7.isOpenPanel = false;
                }
            }).appendChild(this.sidedrawerElement);
            setTimeout(function () {
                return _this7.sidedrawerElement.className += ' active';
            }, 20);
        }
    }, {
        key: "closeSidedraver",
        value: function closeSidedraver() {
            this.isOpenPanel = false;
            this.sidedrawerElement.className = this.sidedrawerElement.className.replace(' ', 'active');
            document.body.appendChild(this.sidedrawerElement);
            mui.overlay('off');
            this.updateMapSize();
        }
    }, {
        key: "toggleSidedrawer",
        value: function toggleSidedrawer() {
            if (document.body.className == 'hide-sidedrawer') {
                this.isOpenPanel = true;
                document.body.className = 'show-sidedrawer';
            } else {
                this.isOpenPanel = false;
                document.body.className = 'hide-sidedrawer';
            }
            this.updateMapSize();
        }
    }, {
        key: "openSidedrawerExt",
        value: function openSidedrawerExt() {
            this.isOpenPanel = true;
            document.body.className = 'show-sidedrawer';
            this.updateMapSize();
        }
    }, {
        key: "updateMapSize",
        value: function updateMapSize() {
            var _this8 = this;

            this.mapElement = document.getElementById("map");
            var sideListWidth = 300;
            var navbarHeight = 70;

            if (this.lastWidth > this.sizeMin) mui.overlay('off', {
                onclose: function onclose() {
                    _this8.isOpenPanel = false;
                }
            });
            if (this.isOpenPanel) {
                this.mapElement.style.height = window.innerHeight - navbarHeight + "px";
                this.mapElement.style.width = window.innerWidth - sideListWidth + "px";
            } else {
                this.mapElement.style.height = window.innerHeight - navbarHeight + "px";
                this.mapElement.style.width = window.innerWidth + "px";
            }

            if (window.innerWidth > this.sizeMin) {
                mui.overlay('off');
            } else {
                this.isOpenPanel = false;
                this.mapElement.style.height = window.innerHeight - navbarHeight + "px";
                this.mapElement.style.width = window.innerWidth + "px";
            }

            googleApi.resizeMap(this.mapElement);
        }
    }, {
        key: "searchExt",
        value: function searchExt() {
            // this.isOpenPanel = window.innerWidth < this.sizeMin;
            //
            // if (!this.isOpenPanel) {
            this.openSidedrawerExt();
            if (window.innerWidth < this.sizeMin) {
                this.showSidedrawer();
            }
            // }
            document.getElementById("search-input").focus();
        }
    }], [{
        key: "getCategory",
        value: function getCategory(element) {

            //todo
            if (element.category !== undefined && element.category !== "") {
                return "<dt>Kategoria</dt><dd>" + data.categories.filter(function (x) {
                        if (x.id == element.category) {
                            return true;
                        }
                        if (element.subcategory !== undefined) {
                            element.subcategory.some(function (y) {
                                if (y.id == element.category) {
                                    return true;
                                } else {
                                    if (element.subcategory !== undefined) {
                                        return element.subcategory.some(function (z) {
                                            if (z.id == element.category) {
                                                return true;
                                            } else {
                                                return false;
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    })[0].name + "</dd>";
            } else {
                return "";
            }
        }
    }, {
        key: "getWebsite",
        value: function getWebsite(element) {
            if (element.website !== undefined && element.website !== "") {
                return "<dt>Strona www</dt><dd>" + element.website + "</dd>";
            } else {
                return "";
            }
        }
    }, {
        key: "getPhone",
        value: function getPhone(element) {
            if (element.phone !== undefined && element.phone !== "") {
                return "<dt>Numer telefonu</dt><dd>" + element.phone + "</dd>";
            } else {
                return "";
            }
        }
    }, {
        key: "getBuildings",
        value: function getBuildings(element) {
            if (element.buildings !== undefined && element.buildings !== "") {
                return "<dt>Numer telefonu</dt><dd>" + element.buildings + "</dd>";
            } else {
                return "";
            }
        }
    }, {
        key: "getShort",
        value: function getShort(element) {
            if (element.short !== undefined && element.short.trim() !== "") {
                return element.short + " - ";
            } else {
                return "";
            }
        }
    }, {
        key: "getTags",
        value: function getTags(element) {
            if (element.tags !== undefined) {
                return "<dt>Tagi</dt><dd>" + element.tags.split(",").map(function (x) {
                        return '#' + x + " ";
                    }) + "</dd>";
            } else {
                return "";
            }
        }
    }, {
        key: "getPlaces",
        value: function getPlaces(element) {
            var places = data.places.filter(function (x) {
                return x.building.split(",").some(function (y) {
                    return y == element.id;
                });
            });
            if (places.length > 0) {
                return "<dt>Jednostki w budynku</dt><dd>" + places.reduce(function (x, y) {
                        return x + ("<a href=\"?placeId=" + y.id + "\">" + y.name + "</a><br>");
                    }, "") + "</dd>";
            } else {
                return "";
            }
        }
    }, {
        key: "getAddres",
        value: function getAddres(element) {
            if (element.address !== "") {
                return "<dt>Adres</dt><dd>" + element.address + "</dd>";
            } else {
                return "";
            }
        }
    }, {
        key: "getAddresExt",
        value: function getAddresExt(element) {
            if (element.address !== "") {
                return element.address;
            } else {
                return "";
            }
        }
    }]);

    return View;
}();

var GoogleMapsApi = function () {
    function GoogleMapsApi(mapElement, zoom, initCoordinate) {
        _classCallCheck(this, GoogleMapsApi);

        //todo
        var eduroam = "A1,A2,A3,A4,A5,A10,A12,A27,A28,A33, B1,B2,B3,B6,B7,B9,B19,B22,B24,B25, C15, D1,D2,D3";

        var OpenStreetMap_HOT = L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            fullscreenControl: true,
            fullscreenControlOptions: {
                position: 'topleft'
            },
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
        });

        this.map = L.map('map').setView(initCoordinate, zoom);
        L.control.locate().addTo(this.map);

        L.control.fullscreen({
            position: 'topleft', // change the position of the button can be topleft, topright, bottomright or bottomleft, defaut topleft
            title: 'Show me the fullscreen !', // change the title of the button, default Full Screen
            titleCancel: 'Exit fullscreen mode', // change the title of the button when fullscreen is on, default Exit Full Screen
            forceSeparateButton: true, // force seperate button to detach from zoom buttons, default false
            forcePseudoFullscreen: true, // force use of pseudo full screen even if full screen API is available, default false
            fullscreenElement: false // Dom element to render in full screen, false by default, fallback to map._container
        }).addTo(this.map);

        this.map.on('enterFullscreen', function () {
            view.mapElement.style.top = '0';
        });

        this.map.on('exitFullscreen', function () {
            view.mapElement.style.top = '64px';
            // view.resizeMap();
        });

        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            minZoom: 7
        }).addTo(this.map);

        // JSONHelper.loadJSON('json/buildings.geojson', (myRegions) => {
        //     // var myRegions = ;
        //
        //     var myStyle = {
        //         "color": "#730007",
        //         "opacity": 1,
        //         "fillColor": "#fc0005",
        //         "fillOpacity": 0.1
        //     };
        //
        //     L.geoJson(myRegions, {style: myStyle}).addTo(this.map);
        // });

        // this.map.setView([41.8758,-87.6189], 16);
        // var layer = Tangram.leafletLayer({
        //     scene: 'https://raw.githubusercontent.com/tangrams/cinnabar-style/gh-pages/cinnabar-style.yaml',
        //     attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | <a href="http://www.openstreetmap.org/about" target="_blank">&copy; OSM contributors | <a href="https://mapzen.com/" target="_blank">Mapzen</a>',
        // });
        // layer.addTo(this.map);
    }

    _createClass(GoogleMapsApi, [{
        key: "createMarker",
        value: function createMarker(x, y, map1) {
            return L.marker([x, y]).addTo(map1);
        }
    }, {
        key: "createInfoWindow",
        value: function createInfoWindow(marker, content) {
            marker.bindPopup(content);
            // return new google.maps.InfoWindow({content: content});
        }
    }, {
        key: "addEventListenerInfoWindow",
        value: function addEventListenerInfoWindow() {
            // return google.maps.event.addListener(marker, 'click', () => {
            //     infowindow.open(map, marker);
            // });
        }
    }, {
        key: "setZoom",
        value: function setZoom(zoom) {
            // map.setZoom(zoom);
        }
    }, {
        key: "setCenter",
        value: function setCenter(x, y) {
            this.map.panTo(new L.LatLng(x, y));
            // map.setCenter(new google.maps.LatLng(x, y));
        }
    }, {
        key: "resizeMap",
        value: function resizeMap(mapElement) {
            try {
                this.map.invalidateSize();
                // google.maps.event.trigger(mapElement, 'resize');
            } catch (e) {
                console.error(e);
            }
        }
    }, {
        key: "addListener",
        value: function addListener(marker, eventType, fun) {
            // google.maps.event.addListener(marker, eventType, fun);
        }
    }]);

    return GoogleMapsApi;
}();

function init() {
    var buildings = void 0,
        categories = void 0,
        places = void 0;
    JSONHelper.loadJSON('json/categories.json', function (categories) {
        JSONHelper.loadJSON('json/places.json', function (places) {
            JSONHelper.loadJSON('json/buildings.json', function (buildings) {
                data = new Data(buildings, categories, places);
                view = new View();
                data.preparePrintCategories();
                view.updateMapSize();
                QueryHelper.getQueryURL();
            }, function (xhr) {
                return console.error(xhr);
            });
        }, function (xhr) {
            return console.error(xhr);
        });
    }, function (xhr) {
        return console.error(xhr);
    });
}

init();