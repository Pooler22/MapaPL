
let view, data, mapApi;
let map, markers = [];

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
        View.initFromQuery(QueryHelper.decodeQueryString());
    }

    static UpdateURL(title, url) {
        if (typeof (history.pushState) != "undefined") {
            let objUrl = {Title: title, Url: url};
            history.pushState(objUrl, objUrl.Title, objUrl.Url);
        } else {
            console.error("Update url");
        }
    }
}

class Data {
    constructor(buildings, categories, places, campuses) {
        this.listSearched = document.getElementById("listSearched");
        this.listElement = document.getElementById("list");

        this.campuses = campuses;
        this.buildings = buildings;
        this.categories = categories;
        this.places = places;
        this.buildings.forEach(
            x => {
                x.polygon = Data.convertToCorrectFormat(x.polygon);
            }
        );
        this.extendCategories(this.categories);
    }

    static convertToCorrectFormat(polygon) {
        return polygon.map((x) => [x[0], x[1]] = [x[1], x[0]]);
    }

    extendCategories(categories) {
        categories.forEach(category => {
            category.places = this.places.filter(place => place.category == category.id);
        });
    }

    preparePrintCategories() {
        this.listElement.innerHTML = this.htmlCategoriesList = `<p style='margin-left:10px'>Lista miejsc:</p>${view.printCategories(this.categories) + view.printBuildings(this.buildings)}`;
    }

    getPlacesById(id) {
        return this.places.filter(x => x.id == id);
    }

    getBuildingsById(id) {
        return this.buildings.filter(x => x.id == id)
    }

    getCoordinate(buildingIds) {
        return buildingIds.split(",").map(buildingId => {
            return this.getBuildingsById(buildingId)[0].latLng;
        });
    }

    getPolygons(buildingIds) {
        return buildingIds.split(",").map(buildingId => {
            return this.getBuildingsById(buildingId)[0].polygon;
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
        let tmp = this.getSearchResult(searched, this.buildings, false)
            + this.getSearchResult(searched, this.places, true);
        this.listSearched.innerHTML = tmp ? `<strong>Wyniki wyszukiwania</strong><ul>${tmp}</ul>` : `<strong>Brak wyników</strong>`;
    }

    getSearchResult(searched, collection, findInBuildingsCollection = false) {
        return collection.reduce((a, element) => {
            if (Data.isFunded(searched.toLowerCase().trim(), element)) {
                if (findInBuildingsCollection) {
                    return a + View.prepareLink(element, true);
                }
                else {
                    return a + View.prepareLink(element);
                }
            }
            else {
                return a;
            }
        }, "");
    }

    static isFunded(searched, element) {
        let tmp1 = false, tmp2 = false;
        if (element.tags) {
            tmp1 = element.tags.toLowerCase().search(searched) != -1
        }
        if (element.short_name) {
            tmp2 = element.short_name.toLowerCase().search(searched) != -1
        }
        if (!element.short) {
            element.short = "";
        }
        return element.name.toLowerCase().search(searched) != -1 || element.short.toLowerCase().search(searched) != -1 || tmp1 || tmp2;
    }
}

class Modal {
    static initModal() {
        let modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML =
            `<div class='mui-container mui-panel'>` +
            `<h2>Mapa Politechniki Łódzkiej</h2>` +
            `<p>Niniejsza strona jest projektem od studentów dla studentów i nie tylko.</p>` +
            `<p>Jeśli znalazłeś błąd lub masz jakieś sugestie napisz!. Link poniżej:</p>` +
            `<div class="mui-row mui--text-center">` +
            `<a class="mui-btn mui-btn--primary "  href='https://docs.google.com/forms/d/e/1FAIpQLSdSOC7mxqPRETVWX9-24MreBA9Rsj3vltYn9lQvl2yPhFvpAw/viewform?c=0&w=1'><i class="fa fa-envelope-o"></i> Kontakt</a>` +
            `</div>` +
            `<div class="mui-row mui--text-center">` +
            `<button class="mui-btn" onclick="view.overlayOff()">Zamknij</button>` +
            `</div>` +
            `</div>`;
        return modal;
    }

    static initModalInfoPlace(element) {
        let modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `<div class='mui-container mui-panel'>` +
            `<h1>${View.getShort(element)} ${element.name}</h1>` +
            ` <dl>
                      ${View.getCategory(element)}
                      ${View.getElement(element, "website", "Strona www")}
                       ${View.getElement(element, "buildings", "Budynki")}
                      ${View.getElement(element, "tags", "Tagi")}
                  </dl>` +
            `<div class="mui-row mui--text-center">` +
            `<button class="mui-btn" onclick="view.overlayOff()">Zamknij</button>` +
            `</div>` +
            `</div>`;
        return modal;
    }

    static initModalInfoBuilding(element) {
        let modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `<div class='mui-container mui-panel'>` +
            `<h1>${View.getShort(element)}${element.name}</h1>` +
            ` <dl>${View.getElement(element, "address", "Adres")}
                ${View.getPlaces(element)}
                ${View.getElement(element, "tags", "Tagi")}</dl>` +
            `<div class="mui-row mui--text-center">` +
            `<button class="mui-btn" onclick="view.overlayOff()">Zamknij</button>` +
            `</div>` +
            `</div>`;
        return modal;
    }

}

class View {
    constructor() {
        this.sidedrawerElement = document.getElementById('sidedrawer');
        this.mapElement = document.getElementById('map');
        this.modal = Modal.initModal();
        this.sizeMin = 768;
        this.lastWidth = window.innerWidth;
        this.isOpenPanel = this.lastWidth > this.sizeMin;
        window.addEventListener('resize', this.updateMapSize);
        document.addEventListener('resize', this.updateMapSize);
        const zoom = 16;
        const initPosition = [51.749845, 19.453180];
        mapApi = new MapsApi(this.mapElement, zoom, initPosition);
    }

    static getCategory(element) {
        if (element.category) {
            return "<dt>Kategoria</dt><dd>" + data.categories.filter(x => {
                    if (x.id == element.category) {
                        return true;
                    }
                    if (element.subcategory) {
                        element.subcategory.some(y => {
                            if (y.id == element.category) {
                                return true;
                            }
                            else {
                                if (element.subcategory) {
                                    return element.subcategory.some(z => {
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

    static getElement(element, propertyName, propertText) {
        return element[propertyName] ? `<dt>${propertText}</dt><dd>${element[propertyName]}</dd>` : ``;
    }

    static getShort(element) {
        return element.short ? `${element.short} - ` : ``;
    }

    static getPlaces(element) {
        let placess = data.places.filter(x => x.building.split(",").some(y => y == element.id));
        if (placess.length > 0) {
            return "<dt>Jednostki w budynku</dt><dd>" +
                placess.reduce((x, y) => x + `<a href="?placeId=${y.id}">${y.name}</a><br>`, ``) +
                "</dd>";
        } else {
            return ``;
        }
    }

    static getAddresExt(element) {
        return element.address ? element.address : ``;
    }

    printBuildings(buildings) {
        return `<strong onclick='View.toggleListElement(this);'>Budynki${View.arrowSpan()}</strong>`
            + `<ul style='display:none;'>`
            + buildings.reduce((a, building) => a + View.prepareLink(building), "")
            + `${View.arrowSpan()}</ul>`;
    }

    printCategories(categories1) {
        return categories1.reduce(
            (a, category) => a + (!category.isSubCat ? `<li>${this.printCategory(category)}</li>` : ``)
            , ``);
    }

    printCategory(category) {
        let tmp = ``;
        tmp += `<strong onclick='View.toggleListElement(this);'>${category.name + View.arrowSpan()}</strong>`;
        tmp += `<ul style='display:none;'>`;

        if (category.subcategory) {
            category.subcategory.split(",").map(x => {
                let tmp1 = data.categories.filter(a => a.id == x);
                tmp1[0].isSubCat = false;
                tmp += view.printCategories(tmp1);
                tmp1[0].isSubCat = true;
            });
        }
        else {
            category.places.forEach(place => {
                tmp += View.prepareLink(place, true);
            });
        }
        tmp += `</ul>`;
        return tmp;
    }

    static prepareLink(element, isPlace = false) {
        if (isPlace) {
            return `<li><a href='javascript:view.activateModalPlace(${element.id});'>${element.name}</a></li>`;
        }
        else {
            return `<li><a href='javascript:view.activateModalBuilding("${element.id}");'>${element.name}</a></li>`;
        }
    }

    static arrowSpan() {
        return `<span class="mui--pull-right mui-caret"></span>`;
    }

    prepareUpdateMarker(id, isPlace = false) {
        if (isPlace) {
            let element = data.places.filter(place => place.id == id)[0];
            let polygons = element.building.split(",").map(x => data.getBuildingsById(x)[0].polygon);
            this.updatePolygon(this.prepareInfoContent(element, true), data.getCoordinate(element.building), polygons);
        }
        else {
            let building = data.buildings.filter(building => building.id == id)[0];
            this.updatePolygon(this.prepareInfoContent(building, false), [building.latLng], [building.polygon]);
        }
        mui.overlay('off');
    }

    cleanUpMarkers() {
        markers.forEach(x => mapApi.map.removeLayer(x));
        markers = [];
    }

    isMobile() {
        return window.innerWidth < this.sizeMin
    }

    updatePolygon(content, coordinate, polygons) {
        this.cleanUpMarkers();

        let index = 0;
        polygons.forEach(polygon => {
            let markerPolygon = L.polygon(polygon).addTo(mapApi.map).bindPopup(content[index]);
            markers.push(markerPolygon);
            markers[index]._latlng = {lat: coordinate[index][0], lng: coordinate[index][1]};
            index += 1;
        });

        markers[0].openPopup();

        mapApi.setCenter(coordinate[0]);

        if (this.isMobile()) {
            view.closeSidedraver();
        }
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
        View.buildingModal(building)
    }

    activateModalInfo(id, isPlace) {
        if (isPlace) {
            let place = data.getPlacesById(id)[0];
            mui.overlay('on', Modal.initModalInfoPlace(place));
        }
        else {
            let building = data.getBuildingsById(id)[0];
            mui.overlay('on', Modal.initModalInfoBuilding(building));
        }
    }

    setMarkerCloseModal(element, index) {
        QueryHelper.UpdateURL(element.name, "?placeId=" + element.id + "&index=" + index);
        mui.overlay('off');
        View.setMarker(index);
    }

    palceModal(element) {
        QueryHelper.UpdateURL(element.name, "?placeId=" + element.id);

        let idBuildings = element.building.split(',');
        let index = -1;

        let tmp = idBuildings.map(() => {
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


    static buildingModal(element) {
        QueryHelper.UpdateURL(element.name, "?buildingId=" + element.id);
    }

    activateModal() {
        mui.overlay('on', this.modal);
    }

    overlayOff() {
        mui.overlay('off');
    }

    static setMarker(index) {
        let position = markers[index]._latlng;
        mapApi.setCenter([position.lat, position.lng]);
        markers[index].openPopup();
    }

    prepareInfoContent(element, isPlace) {
        if (isPlace) {
            QueryHelper.UpdateURL(element.name, "?placeId=" + element.id);

            let idBuildings = element.building.split(',');
            if (idBuildings.length > 1) {
                let index = -1;
                let tmp = idBuildings.map(y => {
                    let result = idBuildings.reduce((a, x) => {
                        let tmp = data.buildings.filter(y => y.id == x)[0];
                        index += 1;
                        if (y != x) {
                            return a + `<li><a href='javascript:View.setMarker(${index})'>${tmp.name}</a></li>`
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
                        + `<br>${View.getAddresExt(building)}</p>`
                        + `Pozostałe budynki tej jednostki:<ul>${x}</ul>`
                        + `<a href='javascript:view.activateModalInfo(${element.id},true);'>Więcej informacji</a>`;
                });
            }
            else {
                let building = data.getBuildingsById(Number(idBuildings[0]))[0];
                return [`<p><strong>${element.name}</strong><br>`
                + `${building.name}<br>`
                + `${View.getAddresExt(building)}`
                + `</br><a href='javascript:view.activateModalInfo(${element.id},true);'>Więcej informacji</a>`];
            }
        }
        else {
            QueryHelper.UpdateURL(element.name, "?buildingId=" + element.id);
            return [`<p><strong>${element.name}</strong><br>`
            + `${View.getAddresExt(element)}`
            + `</p><a href='javascript:view.activateModalInfo(${element.id},false);'>Więcej informacji</a>`];
        }
    }

    static toggleListElement(element) {
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
        const sideListWidth = 300;
        const navbarHeight = 70;

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
        mapApi.resizeMap();
    }

    searchExt() {
        this.openSidedrawerExt();
        if (window.innerWidth < this.sizeMin) {
            this.showSidedrawer();
        }
        document.getElementById("search-input").focus();
    }

    static initFromQuery(queryString) {
        if (queryString.placeId) {
            let place = data.getPlacesById(queryString.placeId)[0];
            let coordinates = data.getCoordinate(place.building);
            let polygons = data.getPolygons(place.building);
            if (queryString.index && queryString.index != 0) {
                [coordinates[queryString.index], coordinates[0]] = [coordinates[0], coordinates[queryString.index]];
                [polygons[queryString.index], polygons[0]] = [polygons[0], polygons[queryString.index]];
            }
            view.updatePolygon(view.prepareInfoContent(place, true), coordinates, polygons);
        }
        else if (queryString.buildingId) {
            let building = data.getBuildingsById(queryString.buildingId)[0];
            view.updatePolygon(view.prepareInfoContent(building, false), [building.latLng], [building.polygon]);
        }
    }
}

class MapsApi {
    constructor(mapElement, zoom, initCoordinate) {
//todo
        let eduroam = "A1,A2,A3,A4,A5,A10,A12,A27,A28,A33, B1,B2,B3,B6,B7,B9,B19,B22,B24,B25, C15, D1,D2,D3";

        let cities = new L.LayerGroup();

        L.marker([51.7547082, 19.4532694]).bindPopup('This is Littleton, CO.').addTo(cities);

        let overlays = {
            "Cities": cities
        };

        data.campuses.forEach(x => {

            overlays[x.name] = cities;//x.name;
            //todo
            // overlays[x.name] = data.buildings.filter(x=>{
            //     let tmpGroup = new L.LayerGroup();
            //     if(x.short[0] == x.element[x.element.length-1]){
            //         L.polygon(x.polygon).bindPopup(this.getPopout(x.id)).addTo(tmpGroup);
            //     }
            // });
        });


        let mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw';


        let streets = L.tileLayer(mbUrl, {id: 'mapbox.streets', attribution: mbAttr}),
            full = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png');

        let baseLayers = {
            "Standardowa": streets,
            "Pełna": full
        };

        this.map = L.map('map', {layers: [full]}).setView(initCoordinate, zoom);

        L.control.layers(baseLayers).addTo(this.map);

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

        // L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        //     maxZoom: 19,
        //     minZoom: 7,
        // }).addTo(this.map);

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

    getPopout(tmpGroup) {
        return "tekst";
    }

    setCenter(latLng) {
        this.map.panTo(new L.LatLng(latLng[0], latLng[1]));
    }

    resizeMap() {
        this.map.invalidateSize();
    }
}

function init() {
    let buildings, categories, places, campuses;
    JSONHelper.loadJSON('json/categories.json',
        (categories) => {
            JSONHelper.loadJSON('json/places.json',
                (places) => {
                    JSONHelper.loadJSON('json/buildings.json',
                        (buildings) => {
                            JSONHelper.loadJSON('json/campuses.json',
                                (campuses) => {
                                    data = new Data(buildings, categories, places, campuses);
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
        },
        (xhr) => console.error(xhr)
    );
}

init();
