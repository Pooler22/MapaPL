/**
 * Pooler22 copyright. all right reserved
 */


let view, data, googleApi;
let map, markers = [];
// let markers2 = L.markerClusterGroup({
//     spiderLegPolylineOptions: {weight: 1.5, color: '#222', opacity: 0.1},
//     // maxClusterRadius: 120,
//     // iconCreateFunction: function (cluster) {
//     //     var markers = cluster.getAllChildMarkers();
//     //     return L.divIcon({ className: 'mycluster'});
//     // },
// });
var tmp;


class JSONHelper {
    static loadJSON(path, success, error) {
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
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
}

class QueryHelper {
    static decodeQueryString() {
        let query_string = {};
        window.location.search.substring(1).split("&").forEach(item => {
            let pair = item.split("=");
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

    static getQueryURL() {
        let queryString = QueryHelper.decodeQueryString();
        if (queryString.placeId !== undefined) {
            if (queryString.index !== undefined) {
                let place = data.getPlacesById(queryString.placeId)[0];

                // view.prepareUpdateMarker(queryString.placeId, true);

                let coordinates = data.getCoordinate(place.building);
                let tmp = coordinates[queryString.index];
                coordinates[queryString.index] = coordinates[0];
                coordinates[0] = tmp;

                view.updateMarkerExt(view.prepareInfoContent(place, true), coordinates);
            }
            else {
                view.activateModalPlace(queryString.placeId); // todo wex poprawke na nr lindexu
            }
        }
        else if (queryString.buildingId !== undefined) {
            let building = data.getBuildingsById(queryString.buildingId)[0];
            view.updateMarkerExt(view.prepareInfoContent(building, false), [{
                "lat": Number(building.lat),
                "lng": Number(building.lng)
            }]);
        }
    }

    static ChangeUrl(title, url) {
        if (typeof (history.pushState) != "undefined") {
            let obj = {Title: title, Url: url};
            history.pushState(obj, obj.Title, obj.Url);
        } else {
            console.error("Error: Change url");
        }
    }
}

class Data {
    constructor(buildings, categories, places) {
        this.listSearched = document.getElementById("listSearched");
        this.listElement = document.getElementById("list");

        this.buildings = buildings;
        this.categories = categories;
        this.places = places;
        this.htmlCategoriesList = "";

        this.extendCategories(this.categories);
    }

    extendCategories(categories) {
        categories.forEach(category => {
            category.places = this.places.filter(place => place.category == category.id);
        });
    }

    preparePrintCategories() {
        this.htmlCategoriesList = "<p style='margin-left:10px'>Lista miejsc:</p>" + view.printCategories(this.categories) + view.printBuildings(this.buildings);
        this.listElement.innerHTML = this.htmlCategoriesList;
    }

    getPlacesById(id) {
        return this.places.filter(x => x.id == id);
    }

    getBuildingsById(id) {
        return this.buildings.filter(x => x.id == id)
    }

    getCoordinate(buildingIds) {
        return buildingIds.split(",").map(buildingId => {
            let coordinate = this.getBuildingsById(buildingId)[0];
            return {"lat": Number(coordinate.lat), "lng": Number(coordinate.lng)};
        });
    }

    filterPlaces(searched) {
        if (searched.length) {
            this.listSearched.style.display = "block";
            this.listElement.style.display = "none";
            this.filterList(searched);
        }
        else {
            this.listSearched.style.display = "none";
            this.listElement.style.display = "block";
        }
    }

    filterList(searched) {
        let tmp = this.getSearchResult(searched, this.buildings, false) + this.getSearchResult(searched, this.places, true);
        this.listSearched.innerHTML = tmp ? `<strong>Wyniki wyszukiwania</strong><ul>${tmp}</ul>` : `<strong>Brak wyników</strong>`;
    }

    getSearchResult(searched, collection, findInBuildingsCollection = false) {
        return collection.reduce((a, element) => {
            if (this.isFunded(searched.toLowerCase().trim(), element)) {
                if (findInBuildingsCollection) {
                    return a + view.prepareLink(element, true);
                }
                else {
                    return a + view.prepareLink(element);
                }
            }
            else {
                return a;
            }
        }, "");
    }

    isFunded(searched, element) {
        let tmp1 = false, tmp2 = false;
        if (element.tags !== undefined) {
            tmp1 = element.tags.toLowerCase().search(searched) != -1
        }
        if (element.short_name !== undefined) {
            tmp2 = element.short_name.toLowerCase().search(searched) != -1
        }
        return element.name.toLowerCase().search(searched) != -1 || element.short.toLowerCase().search(searched) != -1 || tmp1 || tmp2;
    }
}

class View {
    constructor() {
        this.sidedrawerElement = document.getElementById('sidedrawer');
        this.mapElement = document.getElementById('map');
        this.modal = this.initModal();
        this.sizeMin = 768;
        this.lastWidth = window.innerWidth;
        this.isOpenPanel = this.lastWidth > this.sizeMin;
        window.addEventListener('resize', this.updateMapSize);
        document.addEventListener('resize', this.updateMapSize);
        this.initMap()
    }

    initModal() {
        let modal = document.createElement('div');
        modal.innerHTML = `<div class='mui-container mui-panel'><h2>Mapa Politechniki Łódzkiej</h2>` +
            `<p>Niniejsza strona jest projektem od studentów dla studentów i nie tylko.</p>` +
            `<p>Jeśli znalazłeś błąd lub masz jakieś sugestie napisz!. Link poniżej:</p>` +
            `<div class="mui-row mui--text-center">` +
            `<a class="mui-btn mui-btn--primary "  href='https://docs.google.com/forms/d/e/1FAIpQLSdSOC7mxqPRETVWX9-24MreBA9Rsj3vltYn9lQvl2yPhFvpAw/viewform?c=0&w=1'><i class="fa fa-envelope-o"></i> Kontakt</a>` +
            `</div>` +
            `<div class="mui-row mui--text-center">` +
            `<button class="mui-btn" onclick="view.overlayOff()">Zamknij</button>` +
            `</div>` +
            `</div>`;
        modal.style.margin = '10px auto auto auto';
        return modal;
    }

    static getCategory(element) {

        //todo
        if (element.category !== undefined && element.category !== "") {
            return "<dt>Kategoria</dt><dd>" + data.categories.filter(x => {
                    if (x.id == element.category) {
                        return true;
                    }
                    if (element.subcategory !== undefined) {
                        element.subcategory.some(y => {
                            if (y.id == element.category) {
                                return true;
                            }
                            else {
                                if (element.subcategory !== undefined) {
                                    return element.subcategory.some(z => {
                                        if (z.id == element.category) {
                                            return true;
                                        }
                                        else {
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

    static getWebsite(element) {
        if (element.website !== undefined && element.website !== "") {
            return "<dt>Strona www</dt><dd>" + element.website + "</dd>";
        } else {
            return "";
        }
    }

    static getPhone(element) {
        if (element.phone !== undefined && element.phone !== "") {
            return "<dt>Numer telefonu</dt><dd>" + element.phone + "</dd>";
        } else {
            return "";
        }
    }

    static getBuildings(element) {
        if (element.buildings !== undefined && element.buildings !== "") {
            return "<dt>Numer telefonu</dt><dd>" + element.buildings + "</dd>";
        } else {
            return "";
        }
    }

    static getShort(element) {
        if (element.short !== undefined && element.short.trim() !== "") {
            return element.short + " - ";
        } else {
            return "";
        }
    }

    initModalInfoPlace(element) {
        let modal = document.createElement('div');
        modal.innerHTML = `<div class='mui-container mui-panel'>` +
            `<h1>${View.getShort(element)}${element.name}</h1>` +
            ` <dl>
                      ${View.getCategory(element)}
                      ${View.getWebsite(element)}
                      ${View.getPhone(element)}
                       ${View.getBuildings(element)}
                      ${View.getTags(element)}
                  </dl>` +
            `<div class="mui-row mui--text-center">` +
            `<button class="mui-btn" onclick="view.overlayOff()">Zamknij</button>` +
            `</div>` +
            `</div>`;
        modal.style.margin = '10px auto auto auto';
        return modal;
    }

    static getTags(element) {
        if (element.tags !== undefined) {
            return "<dt>Tagi</dt><dd>" + element.tags.split(",").map(x => {
                    return '#' + x + " ";
                }) + "</dd>";
        } else {
            return "";
        }
    }

    static getPlaces(element) {
        let places = data.places.filter(x => x.building.split(",").some(y => y == element.id));
        if (places.length > 0) {
            return "<dt>Jednostki w budynku</dt><dd>" + places.reduce((x, y) => {
                    return x + `<a href="?placeId=${y.id}">${y.name}</a><br>`;
                }, "") + "</dd>";
        } else {
            return "";
        }
    }

    static getAddres(element) {
        if (element.address !== "") {
            return "<dt>Adres</dt><dd>" + element.address + "</dd>";
        } else {
            return "";
        }
    }

    static getAddresExt(element) {
        if (element.address !== "") {
            return element.address;
        } else {
            return "";
        }
    }

    initModalInfoBuilding(element) {
        let modal = document.createElement('div');
        modal.innerHTML = `<div class='mui-container mui-panel'>` +
            `<h1>${View.getShort(element)}${element.name}</h1>` +
            ` <dl>${View.getAddres(element)}
                ${View.getPlaces(element)}
                ${View.getTags(element)}</dl>` +
            `<div class="mui-row mui--text-center">` +
            `<button class="mui-btn" onclick="view.overlayOff()">Zamknij</button>` +
            `</div>` +
            `</div>`;
        modal.style.margin = '10px auto auto auto';
        return modal;
    }

    initMap(latIn = 51.752845, lngIn = 19.553180, zoom = 16) {
        // const welcomeText = "Witaj na stronie mapy Politechniki Łódzkiej - online. Wybierz z menu po lewej stornie " +
        //     "kategorię i miejsce jakie cię interesują albo wyszukaj za pomocą wyszukiwarki.";
        googleApi = new GoogleMapsApi(this.mapElement, zoom, [51.749845, 19.453180]);
        //map = googleApi.map;
        // this.updateMarkerExt([welcomeText], [{"lat": latIn, "lng": lngIn}]);
    }

    printBuildings(buildings) {
        return `<strong onclick='view.toggleListElement(this);'>Budynki${view.arrowSpan()}</strong>`
            + `<ul style='display:none;'>`
            + buildings.reduce((a, building) => a + this.prepareLink(building), "")
            + `${this.arrowSpan()}</ul>`;
    }

    printCategories(categories1) {
        return categories1.reduce((a, category) => {
            if (category.isSubCat) {
                return a;
            }
            else {
                return a + `<li>${this.printCategory(category)}</li>`
            }
        }, "");
    }

    printCategory(category) {
        let tmp = ``;
        tmp += `<strong onclick='view.toggleListElement(this);'>${category.name + this.arrowSpan()}</strong>`;
        tmp += `<ul style='display:none;'>`;

        if (category.subcategory !== undefined) {
            // tmp += `<ul style='display:none;'>`;
            category.subcategory.split(",").map(x => {

                let tmp1 = data.categories.filter(a => a.id == x);
                tmp1[0].isSubCat = false;
                tmp += view.printCategories(tmp1);
                tmp1[0].isSubCat = true;

            });
            // tmp += `</ul>`;
        }
        else {
            category.places.forEach(place => {
                if (place.short == undefined) {
                    place.short = ""
                }
                tmp += this.prepareLink(place, true);
            });

        }

        tmp += `</ul>`;
        return tmp;
    }

    prepareLink(element, isPlace = false) {
        if (isPlace) {
            return `<li><a href='javascript:view.activateModalPlace(${element.id});'>${element.name}</a></li>`;
        }
        else {
            return `<li><a href='javascript:view.activateModalBuilding("${element.id}");'>${element.name}</a></li>`;
        }
    }

    arrowSpan() {
        return `<span class="mui--pull-right mui-caret"></span>`;
    }

    prepareUpdateMarker(id, isPlace = false) {
        if (isPlace) {
            let element = data.places.filter(place => place.id == id)[0];
            this.updateMarkerExt(this.prepareInfoContent(element, true), (data.getCoordinate(element.building)));
        }
        else {
            let element = data.buildings.filter(building => building.id == id)[0];
            this.updateMarkerExt1(this.prepareInfoContent(element, false), element.lat, element.lng);
        }
        mui.overlay('off');
    }

    updateMarkerExt1(content, latIn, lngIn) {
        this.updateMarkerExt(content, [{"lat": Number(latIn), "lng": Number(lngIn)}]);
    }

    updateMarkerExt(content, coordinate) {
        // todo: setmap

        markers.forEach(x => googleApi.map.removeLayer(x));
        // markers2.clearLayers();
        markers = [];
        let index = 0;
        coordinate.forEach(coordinate => {
            let marker = googleApi.createMarker(coordinate.lat, coordinate.lng, googleApi.map);
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
        // googleApi.map.addLayer(markers);
    }

    activateModalPlace(id) {
        let place = data.getPlacesById(id)[0];
        this.prepareUpdateMarker(id, true);
        if (place.building.split(",").length > 1) {
            mui.overlay('on', this.palceModal(place));
        }
    }

    activateModalBuilding(id) {
        let building = data.getBuildingsById(id)[0];
        this.prepareUpdateMarker(id, false);
        this.buildingModal(building)
    }

    activateModalInfo(id, isPlace) {
        if (isPlace) {
            let place = data.getPlacesById(id)[0];
            mui.overlay('on', this.initModalInfoPlace(place));

        }
        else {
            let building = data.getBuildingsById(id)[0];
            mui.overlay('on', this.initModalInfoBuilding(building));

        }
    }

    setMarkerCloseModal(element, index) {
        QueryHelper.ChangeUrl(element.name, "?placeId=" + element.id + "&index=" + index);

        mui.overlay('off');
        this.setMarker(index);
    }

    palceModal(element) {
        QueryHelper.ChangeUrl(element.name, "?placeId=" + element.id);

        let idBuildings = element.building.split(',');
        let index = -1;

        let tmp = idBuildings.map(y => {
            let result = idBuildings.reduce((a, x) => {
                let tmp = data.buildings.filter(y => y.id == x)[0];
                index += 1;
                return a + `<div class="mui-divider"></div><a href='javascript:view.setMarkerCloseModal(${JSON.stringify({
                        id: element.id,
                        name: element.name
                    })},${index})'>${tmp.name}</a><br><p>${tmp.address}</p>`
            }, "");
            index = -1;
            return result;
        });

        index = -1;

        let next = tmp.map(x => {
            index += 1;
            return `<strong>${element.name}</strong>`
                + `<p>Wybierz jeden z budynków tej jednostki:</p>${x}`;
        });

        let modal = document.createElement('div');
        modal.innerHTML = `<div class='mui-container mui--text-center mui-panel'><div class="mui--text-center">${next[0]}</div>`
            + `<button class="mui-btn" onclick="view.overlayOff()">Zamknij</button>`
            + `</div>`;
        modal.style.margin = '10px auto auto auto';
        return modal;
    }


    buildingModal(element) {
        QueryHelper.ChangeUrl(element.name, "?buildingId=" + element.id);

        let idBuildings = element.id;
        let index = -1;
        let building = data.getBuildingsById(idBuildings);

        let tmp = `<div class="mui-divider"></div><a href='javascript:view.setMarkerCloseModal(${JSON.stringify({
            id: element.id,
            name: element.name
        })},${index})'>${building.name}</a><br><p>${building.address}</p>`;


    }

    activateModal() {
        mui.overlay('on', this.modal);
    }

    overlayOff() {
        mui.overlay('off');
    }

    setMarker(index) {
        let position = markers[index]._latlng;
        googleApi.setCenter(position.lat, position.lng);
        markers[index].openPopup();
    }

    prepareInfoContent(element, isPlace, text = "Link do lokacji") {
        if (isPlace) {
            QueryHelper.ChangeUrl(element.name, "?placeId=" + element.id);

            let idBuildings = element.building.split(',');
            if (idBuildings.length > 1) {
                let index = -1;
                let tmp = idBuildings.map(y => {
                    let result = idBuildings.reduce((a, x) => {
                        let tmp = data.buildings.filter(y => y.id == x)[0];
                        index += 1;
                        if (y != x) {
                            return a + `<li><a href='javascript:view.setMarker(${index})'>${tmp.name}</a></li>`
                        }
                        else {
                            return a;
                        }
                    }, "");
                    index = -1;
                    return result;
                });

                index = -1;

                return tmp.map(x => {
                    index += 1;
                    let building = data.getBuildingsById(idBuildings[index])[0];
                    return `<p><strong>${element.name}</strong>`
                        // + `<a href=?placeId=${element.id}>${text}</a>`
                        + `<br>${View.getAddresExt(building)}</p>`
                        + `Pozostałe budynki tej jednostki:<ul>${x}</ul>`
                        + `<a href='javascript:view.activateModalInfo(${element.id},true);'>Więcej informacji</a>`;
                });
            }
            else {

                let building = data.getBuildingsById(idBuildings[0])[0];
                return [`<p><strong>${element.name}</strong><br>`
                // + `<a href=?placeId=${element.id}>${text}</a>`
                + `${building.name}<br>`
                + `${View.getAddresExt(building)}`
                + `</br><a href='javascript:view.activateModalInfo(${element.id},true);'>Więcej informacji</a>`];
            }
        }
        else {
            QueryHelper.ChangeUrl(element.name, "?buildingId=" + element.id);

            return [`<p><strong>${element.name}</strong><br>`
            // + `<a href=?buildingId=${element.id}>${text}</a><br>`
            + `${View.getAddresExt(element)}`
            + `</p><a href='javascript:view.activateModalInfo(${element.id},false);'>Więcej informacji</a>`];
        }
    }

    toggleListElement(element) {
        let tmp = element.nextSibling;
        tmp.style.display = tmp.style.display == "none" ? "block" : "none";
    }

    showSidedrawer() {
        this.isOpenPanel = true;
        mui.overlay('on', {
            onclose: () => {
                this.sidedrawerElement.className = this.sidedrawerElement.className.replace(' active', '');
                document.body.appendChild(this.sidedrawerElement);
                this.isOpenPanel = false;
            }
        }).appendChild(this.sidedrawerElement);
        setTimeout(() => this.sidedrawerElement.className += ' active', 20);
    }

    closeSidedraver() {
        this.isOpenPanel = false;
        this.sidedrawerElement.className = this.sidedrawerElement.className.replace(' ', 'active');
        document.body.appendChild(this.sidedrawerElement);
        mui.overlay('off');
        this.updateMapSize();
    }

    toggleSidedrawer() {
        if (document.body.className == 'hide-sidedrawer') {
            this.isOpenPanel = true;
            document.body.className = 'show-sidedrawer';
        } else {
            this.isOpenPanel = false;
            document.body.className = 'hide-sidedrawer'
        }
        this.updateMapSize();
    }

    openSidedrawerExt() {
            this.isOpenPanel = true;
            document.body.className = 'show-sidedrawer';
        this.updateMapSize();
    }


    updateMapSize() {
        this.mapElement = document.getElementById("map");
        let sideListWidth = 300;
        let navbarHeight = 70;

        if (this.lastWidth > this.sizeMin)
            mui.overlay('off', {
                onclose: () => {
                    this.isOpenPanel = false;
                }
            });
        if (this.isOpenPanel) {
            this.mapElement.style.height = `${window.innerHeight - navbarHeight}px`;
            this.mapElement.style.width = `${window.innerWidth - sideListWidth}px`;
        }
        else {
            this.mapElement.style.height = `${window.innerHeight - navbarHeight}px`;
            this.mapElement.style.width = `${window.innerWidth}px`;
        }

        if (window.innerWidth > this.sizeMin) {
            mui.overlay('off')
        }
        else {
            this.isOpenPanel = false;
            this.mapElement.style.height = `${window.innerHeight - navbarHeight}px`;
            this.mapElement.style.width = `${window.innerWidth}px`;
        }

        googleApi.resizeMap(this.mapElement);
    }

    searchExt() {
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
}

class GoogleMapsApi {
    constructor(mapElement, zoom, initCoordinate) {

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
            minZoom: 7,
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

    createMarker(x, y, map1) {
        return L.marker([x, y]).addTo(map1);
    }

    createInfoWindow(marker, content) {
        marker.bindPopup(content);
        // return new google.maps.InfoWindow({content: content});

    }

    addEventListenerInfoWindow() {
        // return google.maps.event.addListener(marker, 'click', () => {
        //     infowindow.open(map, marker);
        // });
    }

    setZoom(zoom) {
        // map.setZoom(zoom);
    }

    setCenter(x, y) {
        this.map.panTo(new L.LatLng(x, y));
        // map.setCenter(new google.maps.LatLng(x, y));

    }

    resizeMap(mapElement) {
        try {
            this.map.invalidateSize();
            // google.maps.event.trigger(mapElement, 'resize');
        } catch (e) {
            console.error(e)
        }
    }

    addListener(marker, eventType, fun) {
        // google.maps.event.addListener(marker, eventType, fun);
    }


}

function init() {
    let buildings, categories, places;
    JSONHelper.loadJSON('json/categories.json',
        (categories) => {
            JSONHelper.loadJSON('json/places.json',
                (places) => {
                    JSONHelper.loadJSON('json/buildings.json',
                        (buildings) => {
                            data = new Data(buildings, categories, places);
                            view = new View();
                            data.preparePrintCategories();
                            view.updateMapSize();
                            QueryHelper.getQueryURL();
                        },
                        (xhr) => console.error(xhr)
                    );
                },
                (xhr) => console.error(xhr)
            );
        },
        (xhr) => console.error(xhr)
    );
}

init();
