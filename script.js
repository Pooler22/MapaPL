"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var view = void 0,
    data = void 0,
    mapApi = void 0;
var map = void 0,
    markers = [];

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
            View.initFromQuery(QueryHelper.decodeQueryString());
        }
    }, {
        key: "UpdateURL",
        value: function UpdateURL(title, url) {
            if (typeof history.pushState != "undefined") {
                var objUrl = {Title: title, Url: url};
                history.pushState(objUrl, objUrl.Title, objUrl.Url);
            } else {
                console.error("Update url");
            }
        }
    }]);

    return QueryHelper;
}();

var Data = function () {
    function Data(buildings, categories, places, campuses) {
        _classCallCheck(this, Data);

        this.listSearched = document.getElementById("listSearched");
        this.listElement = document.getElementById("list");

        this.campuses = campuses;
        this.buildings = buildings;
        this.categories = categories;
        this.places = places;
        this.buildings.forEach(function (x) {
            x.polygon = Data.convertToCorrectFormat(x.polygon);
        });
        this.extendCategories(this.categories);
    }

    _createClass(Data, [{
        key: "campusToColor",
        value: function campusToColor(campus) {
            return data.campuses.filter(function (x) {
                return x.name[x.name.length - 1] == campus;
            })[0].color;
        }
    }, {
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
            this.listElement.innerHTML = "<p style='margin-left:10px'>Lista miejsc:</p>" + (view.printCategories(this.categories) + view.printBuildings(this.buildings));
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
                return _this2.getBuildingsById(buildingId)[0].latLng;
            });
        }
    }, {
        key: "getPolygons",
        value: function getPolygons(buildingIds) {
            var _this3 = this;

            return buildingIds.split(",").map(function (buildingId) {
                return _this3.getBuildingsById(buildingId)[0].polygon;
            });
        }
    }, {
        key: "getColors",
        value: function getColors(buildingIds) {
            var _this4 = this;

            return buildingIds.split(",").map(function (buildingId) {
                return _this4.getBuildingsById(buildingId)[0].campus;
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
            var findInBuildingsCollection = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            return collection.reduce(function (a, element) {
                if (Data.isFunded(searched.toLowerCase().trim(), element)) {
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
    }], [{
        key: "convertToCorrectFormat",
        value: function convertToCorrectFormat(polygon) {
            return polygon.map(function (x) {
                var _ref;

                return _ref = [x[1], x[0]], x[0] = _ref[0], x[1] = _ref[1], _ref;
            });
        }
    }, {
        key: "isFunded",
        value: function isFunded(searched, element) {
            var tmp1 = false,
                tmp2 = false;
            if (element.tags) {
                tmp1 = element.tags.toLowerCase().search(searched) != -1;
            }
            if (element.short_name) {
                tmp2 = element.short_name.toLowerCase().search(searched) != -1;
            }
            if (!element.short) {
                element.short = "";
            }
            return element.name.toLowerCase().search(searched) != -1 || element.short.toLowerCase().search(searched) != -1 || tmp1 || tmp2;
        }
    }]);

    return Data;
}();

var Modal = function () {
    function Modal() {
        _classCallCheck(this, Modal);
    }

    _createClass(Modal, null, [{
        key: "initModal",
        value: function initModal() {
            var modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = "<div class='mui-container mui-panel'>" + "<h2>Mapa Politechniki \u0141\xF3dzkiej</h2>" + "<p>Niniejsza strona jest projektem od student\xF3w dla student\xF3w i nie tylko.</p>" + "<p>Je\u015Bli znalaz\u0142e\u015B b\u0142\u0105d lub masz jakie\u015B sugestie napisz!. Link poni\u017Cej:</p>" + "<div class=\"mui-row mui--text-center\">" + "<a class=\"mui-btn mui-btn--primary \"  href='https://docs.google.com/forms/d/e/1FAIpQLSdSOC7mxqPRETVWX9-24MreBA9Rsj3vltYn9lQvl2yPhFvpAw/viewform?c=0&w=1'><i class=\"fa fa-envelope-o\"></i> Kontakt</a>" + "</div>" + "<div class=\"mui-row mui--text-center\">" + "<button class=\"mui-btn\" onclick=\"view.overlayOff()\">Zamknij</button>" + "</div>" + "</div>";
            return modal;
        }
    }, {
        key: "initModalInfoPlace",
        value: function initModalInfoPlace(element) {
            var modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = "<div class='mui-container mui-panel'>" + ("<h1>" + View.getShort(element) + " " + element.name + "</h1>") + (" <dl>\n                      " + View.getCategory(element) + "\n                      " + View.getElement(element, "website", "Strona www") + "\n                       " + View.getElement(element, "buildings", "Budynki") + "\n                      " + View.getElement(element, "tags", "Tagi") + "\n                  </dl>") + "<div class=\"mui-row mui--text-center\">" + "<button class=\"mui-btn\" onclick=\"view.overlayOff()\">Zamknij</button>" + "</div>" + "</div>";
            return modal;
        }
    }, {
        key: "initModalInfoBuilding",
        value: function initModalInfoBuilding(element) {
            var modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = "<div class='mui-container mui-panel'>" + ("<h1>" + View.getShort(element) + element.name + "</h1>") + (" <dl>" + View.getElement(element, "address", "Adres") + "\n                " + View.getPlaces(element) + "\n                " + View.getElement(element, "tags", "Tagi") + "</dl>") + "<div class=\"mui-row mui--text-center\">" + "<button class=\"mui-btn\" onclick=\"view.overlayOff()\">Zamknij</button>" + "</div>" + "</div>";
            return modal;
        }
    }]);

    return Modal;
}();

var View = function () {
    function View() {
        _classCallCheck(this, View);

        this.sidedrawerElement = document.getElementById('sidedrawer');
        this.mapElement = document.getElementById('map');
        this.modal = Modal.initModal();
        this.sizeMin = 768;
        this.lastWidth = window.innerWidth;
        this.isOpenPanel = this.lastWidth > this.sizeMin;
        window.addEventListener('resize', this.updateMapSize);
        document.addEventListener('resize', this.updateMapSize);
        var zoom = 16;
        var initPosition = [51.749845, 19.453180];
        mapApi = new MapsApi(this.mapElement, zoom, initPosition);
    }

    _createClass(View, [{
        key: "initAllPolygons",
        value: function initAllPolygons() {
            data.buildings.forEach(function (building) {
                var content = view.prepareInfoContent(building, false, false);
                for (var index = 0; index < content.length; index++) {
                    View.drawPolygon(building.polygon, content[index], building.campus);
                    markers[index]._latlng = {lat: building.latLng[0], lng: building.latLng[1]};
                }
            });
        }
    }, {
        key: "printBuildings",
        value: function printBuildings(buildings) {
            return "<strong onclick='View.toggleListElement(this);'>Budynki" + View.arrowSpan() + "</strong>" + "<ul style='display:none;'>" + buildings.reduce(function (a, building) {
                    return a + View.prepareLink(building);
                }, "") + (View.arrowSpan() + "</ul>");
        }
    }, {
        key: "printCategories",
        value: function printCategories(categories1) {
            var _this5 = this;

            return categories1.reduce(function (a, category) {
                return a + (!category.isSubCat ? "<li>" + _this5.printCategory(category) + "</li>" : "");
            }, "");
        }
    }, {
        key: "printCategory",
        value: function printCategory(category) {
            var tmp = "";
            tmp += "<strong onclick='View.toggleListElement(this);'>" + (category.name + View.arrowSpan()) + "</strong>";
            tmp += "<ul style='display:none;'>";

            if (category.subcategory) {
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
                    tmp += View.prepareLink(place, true);
                });
            }
            tmp += "</ul>";
            return tmp;
        }
    }, {
        key: "prepareUpdateMarker",
        value: function prepareUpdateMarker(id) {
            var isPlace = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            if (isPlace) {
                var element = data.places.filter(function (place) {
                    return place.id == id;
                })[0];
                var polygons = element.building.split(",").map(function (x) {
                    return data.getBuildingsById(x)[0].polygon;
                });
                var colors = element.building.split(",").map(function (x) {
                    return data.getBuildingsById(x)[0].campus;
                });
                this.updatePolygon(this.prepareInfoContent(element, true), data.getCoordinate(element.building), polygons, colors);
            } else {
                var building = data.buildings.filter(function (building) {
                    return building.id == id;
                })[0];
                this.updatePolygon(this.prepareInfoContent(building, false), [building.latLng], [building.polygon], building.campus);
            }
            mui.overlay('off');
        }
    }, {
        key: "cleanUpMarkers",
        value: function cleanUpMarkers() {
            markers.forEach(function (x) {
                return mapApi.map.removeLayer(x);
            });
            markers = [];
        }
    }, {
        key: "isMobile",
        value: function isMobile() {
            return window.innerWidth < this.sizeMin;
        }
    }, {
        key: "updatePolygon",
        value: function updatePolygon(content, coordinate, polygons, colors) {
            this.cleanUpMarkers();

            for (var index = 0; index < content.length; index++) {
                View.drawPolygon(polygons[index], content[index], colors[index]);
                markers[index]._latlng = {lat: coordinate[index][0], lng: coordinate[index][1]};
            }

            markers[0].openPopup();

            mapApi.setCenter(coordinate[0]);

            if (this.isMobile()) {
                view.closeSidedraver();
            }
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
                mui.overlay('on', Modal.initModalInfoPlace(place));
            } else {
                var building = data.getBuildingsById(id)[0];
                mui.overlay('on', Modal.initModalInfoBuilding(building));
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

            var tmp = idBuildings.map(function () {
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
        key: "prepareInfoContent",
        value: function prepareInfoContent(element, isPlace) {
            var normal = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

            if (isPlace) {
                var _ret = function () {
                    if (normal) {
                        QueryHelper.UpdateURL(element.name, "?placeId=" + element.id);
                    }

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
                                        return a + ("<li><a href='javascript:View.setMarker(" + index + ")'>" + tmp.name + "</a></li>");
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
                                        return "<p><strong>" + element.name + "</strong>" + ("<br>" + View.getAddresExt(building) + "</p>") + ("Pozosta\u0142e budynki tej jednostki:<ul>" + x + "</ul>") + ("<a href='javascript:view.activateModalInfo(" + element.id + ",true);'>Wi\u0119cej informacji</a>");
                                    })
                                }
                            };
                        }();

                        if ((typeof _ret2 === "undefined" ? "undefined" : _typeof(_ret2)) === "object") return _ret2.v;
                    } else {
                        var building = data.getBuildingsById(Number(idBuildings[0]))[0];
                        return {
                            v: ["<p><strong>" + element.name + "</strong><br>" + (building.name + "<br>") + ("" + View.getAddresExt(building)) + ("</br><a href='javascript:view.activateModalInfo(" + element.id + ",true);'>Wi\u0119cej informacji</a>")]
                        };
                    }
                }();

                if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
            } else {
                if (normal) {
                    QueryHelper.UpdateURL(element.name, "?buildingId=" + element.id);
                }
                return ["<p><strong>" + element.name + "</strong><br>" + ("" + View.getAddresExt(element)) + ("</p><a href='javascript:view.activateModalInfo(" + element.id + ",false);'>Wi\u0119cej informacji</a>")];
            }
        }
    }, {
        key: "showSidedrawer",
        value: function showSidedrawer() {
            var _this6 = this;

            this.isOpenPanel = true;
            mui.overlay('on', {
                onclose: function onclose() {
                    _this6.sidedrawerElement.className = _this6.sidedrawerElement.className.replace(' active', '');
                    document.body.appendChild(_this6.sidedrawerElement);
                    _this6.isOpenPanel = false;
                }
            }).appendChild(this.sidedrawerElement);
            setTimeout(function () {
                return _this6.sidedrawerElement.className += ' active';
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
            var _this7 = this;

            this.mapElement = document.getElementById("map");
            var sideListWidth = 300;
            var navbarHeight = 70;

            if (this.lastWidth > this.sizeMin) mui.overlay('off', {
                onclose: function onclose() {
                    _this7.isOpenPanel = false;
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
            mapApi.resizeMap();
        }
    }, {
        key: "searchExt",
        value: function searchExt() {
            this.openSidedrawerExt();
            if (window.innerWidth < this.sizeMin) {
                this.showSidedrawer();
            }
            document.getElementById("search-input").focus();
        }
    }], [{
        key: "getCategory",
        value: function getCategory(element) {
            if (element.category) {
                return "<dt>Kategoria</dt><dd>" + data.categories.filter(function (x) {
                        if (x.id == element.category) {
                            return true;
                        }
                        if (element.subcategory) {
                            element.subcategory.some(function (y) {
                                if (y.id == element.category) {
                                    return true;
                                } else {
                                    if (element.subcategory) {
                                        return element.subcategory.some(function (z) {
                                            return z.id == element.category;
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
        key: "getElement",
        value: function getElement(element, propertyName, propertText) {
            return element[propertyName] ? "<dt>" + propertText + "</dt><dd>" + element[propertyName] + "</dd>" : "";
        }
    }, {
        key: "getShort",
        value: function getShort(element) {
            return element.short ? element.short + " - " : "";
        }
    }, {
        key: "getPlaces",
        value: function getPlaces(element) {
            var placess = data.places.filter(function (x) {
                return x.building.split(",").some(function (y) {
                    return y == element.id;
                });
            });
            if (placess.length > 0) {
                return "<dt>Jednostki w budynku</dt><dd>" + placess.reduce(function (x, y) {
                        return x + ("<a href=\"?placeId=" + y.id + "\">" + y.name + "</a><br>");
                    }, "") + "</dd>";
            } else {
                return "";
            }
        }
    }, {
        key: "getAddresExt",
        value: function getAddresExt(element) {
            return element.address ? element.address : "";
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
        key: "drawPolygon",
        value: function drawPolygon(polygon, content, campus) {
            var markerPolygon = L.polygon(polygon).addTo(mapApi.map).bindPopup(content);
            if (campus) {
                var color = data.campusToColor(campus);
                markerPolygon.setStyle({color: "#fff", fillColor: color, fillOpacity: 1});
            }
            markers.push(markerPolygon);
        }
    }, {
        key: "buildingModal",
        value: function buildingModal(element) {
            QueryHelper.UpdateURL(element.name, "?buildingId=" + element.id);
        }
    }, {
        key: "setMarker",
        value: function setMarker(index) {
            var position = markers[index]._latlng;
            mapApi.setCenter([position.lat, position.lng]);
            markers[index].openPopup();
        }
    }, {
        key: "toggleListElement",
        value: function toggleListElement(element) {
            var tmp = element.nextSibling;
            tmp.style.display = tmp.style.display == "none" ? "block" : "none";
        }
    }, {
        key: "initFromQuery",
        value: function initFromQuery(queryString) {
            if (queryString.placeId) {
                var place = data.getPlacesById(queryString.placeId)[0];
                var coordinates = data.getCoordinate(place.building);
                var polygons = data.getPolygons(place.building);
                if (queryString.index && queryString.index != 0) {
                    var _ref2 = [coordinates[0], coordinates[queryString.index]];
                    coordinates[queryString.index] = _ref2[0];
                    coordinates[0] = _ref2[1];
                    var _ref3 = [polygons[0], polygons[queryString.index]];
                    polygons[queryString.index] = _ref3[0];
                    polygons[0] = _ref3[1];
                }
                var colors = data.getColors(place.building);
                view.updatePolygon(view.prepareInfoContent(place, true), coordinates, polygons, colors);
            } else if (queryString.buildingId) {
                var building = data.getBuildingsById(queryString.buildingId)[0];
                view.updatePolygon(view.prepareInfoContent(building, false), [building.latLng], [building.polygon], building.campus);
            } else {
                view.initAllPolygons();
            }
        }
    }]);

    return View;
}();

var MapsApi = function () {
    function MapsApi(mapElement, zoom, initCoordinate) {
        _classCallCheck(this, MapsApi);

        //todo
        var eduroam = "A1,A2,A3,A4,A5,A10,A12,A27,A28,A33, B1,B2,B3,B6,B7,B9,B19,B22,B24,B25, C15, D1,D2,D3";

        // L.marker([51.7547082, 19.4532694]).bindPopup('This is Littleton, CO.').addTo(cities);

        var overlays = {};

        var x = data.campuses.map(function (x) {
            x.coordinates = Data.convertToCorrectFormat(x.coordinates);
        });

        data.campuses.forEach(function (x) {
            // let markerPolygon = L.polygon(polygon).addTo(mapApi.map).bindPopup(content);
            // markers.push(markerPolygon);

            overlays[x.name] = new L.LayerGroup();
            var tmpPolygo = L.polygon(x.coordinates).bindPopup(MapsApi.getPopoutText(x.name));
            tmpPolygo.setStyle({color: x.color, fillColor: x.color});
            tmpPolygo.addTo(overlays[x.name]);
        });

        var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' + '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' + 'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw';

        var streets = L.tileLayer(mbUrl, {id: 'mapbox.streets', attribution: mbAttr}),
            full = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png');

        var baseLayers = {
            "Standardowa": streets,
            "Pełna": full
        };
        var overlaysL = {
            "Wszystkie Kampusy": overlays
        };
        this.map = L.map('map', {layers: [full, overlays["Kampus A"], overlays["Kampus B"], overlays["Kampus C"], overlays["Kampus D"], overlays["Kampus E"], overlays["Kampus F"]]}).setView(initCoordinate, zoom);
        var options = {
            // Make the "Landmarks" group exclusive (use radio inputs)
            // exclusiveGroups: ["Landmarks"],
            // Show a checkbox next to non-exclusive group labels for toggling all
            groupCheckboxes: true
        };

        var layerControl = L.control.groupedLayers(baseLayers, overlaysL, options);
        this.map.addControl(layerControl);

        // L.control.layers(baseLayers).addTo(this.map);

        L.control.locate().addTo(this.map);

        L.control.fullscreen({
            position: 'topleft',
            forceSeparateButton: true,
            forcePseudoFullscreen: true,
            fullscreenElement: false
        }).addTo(this.map);

        this.map.on('enterFullscreen', function () {
            view.mapElement.style.top = '0';
        });

        this.map.on('exitFullscreen', function () {
            view.mapElement.style.top = '64px';
        });
    }

    _createClass(MapsApi, [{
        key: "setCenter",
        value: function setCenter(latLng) {
            this.map.panTo(new L.LatLng(latLng[0], latLng[1]));
        }
    }, {
        key: "resizeMap",
        value: function resizeMap() {
            this.map.invalidateSize();
        }
    }], [{
        key: "getPopoutText",
        value: function getPopoutText(tmpGroup) {
            return "Kampus" + tmpGroup;
        }
    }]);

    return MapsApi;
}();

function init() {
    var buildings = void 0,
        categories = void 0,
        places = void 0,
        campuses = void 0;
    JSONHelper.loadJSON('json/categories.json', function (categories) {
        JSONHelper.loadJSON('json/places.json', function (places) {
            JSONHelper.loadJSON('json/buildings.json', function (buildings) {
                JSONHelper.loadJSON('json/campuses.json', function (campuses) {
                    data = new Data(buildings, categories, places, campuses);
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
    }, function (xhr) {
        return console.error(xhr);
    });
}

init();