/**
 * Pooler22 copyright. all right reserved
 */
let view;
let data;

let map, markers = [], infowindows = [];
let mapElement, listElement, sidedrawerElement;

//tood: api google class
//tood: map class

//class helper
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
    static getQueryString() {
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
        let queryString = QueryHelper.getQueryString();
        if (queryString.placeId !== undefined) {
            let place = data.places.filter(x => x.id == queryString.placeId);
            let coordinates = data.getCoordinate(place[0].building);
            View.updateMarkerExt(View.prepareInfoContent(place[0], true), coordinates);
        }
        else if (queryString.buildingId !== undefined) {
            let building = data.buildings.filter(x => x.id == queryString.buildingId);
            View.updateMarkerExt(View.prepareInfoContent(building[0]), [{
                "lat": Number(building[0].lat),
                "lng": Number(building[0].lng)
            }]);
        }
    }
}

//data class
class Data {
    constructor(buildings, categories, places) {
        this.edited = false;
        this.buildings = buildings;
        this.categories = categories;
        this.places = places;
        this.initList();
    }

    getCoordinate(building) {
        return building.split(",").map(y => {
            let tmp = this.buildings.filter(x => x.id == y);
            return {"lat": Number(tmp[0].lat), "lng": Number(tmp[0].lng)};
        });
    }


    extendCategories(categories) {
        categories.forEach(category => {
            category.places = this.places.filter(place => place.category == category.id);
            if (category.subcategory !== undefined) {
                this.extendCategories(category.subcategory);
            }
        });
    }

    initList() {
        this.extendCategories(this.categories);
        listElement.innerHTML = this.printCategories(this.categories) + this.printBuildings();
    }

    arrowSpan() {
        return `<span class="mui--pull-right mui-caret"></span>`;
    }

    printBuildings() {
        return `<strong onclick='View.toggleListElement(this);'>Budynki${this.arrowSpan()}</strong>`
            + `<ul style='display:none;'>`
            + this.buildings.reduce((a, building) => a + this.prepareLink(building), "")
            + "${this.arrowSpan()}</ul>";
    }

    printCategories(categories) {
        return categories.reduce((a, category) => a + `<li>${this.printCategory(category)}</li>`, "");
    }

    printCategory(category) {
        let tmp = ``;
        tmp += `<strong onclick='View.toggleListElement(this);'>${category.name + this.arrowSpan()}</strong>`;
        tmp += `<ul style='display:none;'>`;

        if (category.subcategory !== undefined) {
            tmp += this.printCategories(category.subcategory);
        }
        category.places.forEach(place => {
            if (place.short == undefined) {
                place.short = ""
            }
            tmp += this.prepareLink(place, true);
        });
        tmp += `</ul>`;
        return tmp;
    }

    filterPlaces(searched) {
        if (searched.length) {
            this.filterList(searched);
        }
        else {
            if (this.edited) {
                this.edited = false;
                this.initList();
            }
        }
    }

    filterList(searched) {
        let tmp = this.getSearchResult(searched, this.buildings, false) + this.getSearchResult(searched, this.places, true);
        this.edited = true;
        listElement.innerHTML = tmp ? `<strong>Wyniki wyszukiwania</strong><ul>${tmp}</ul>` : `<strong>Brak wyników</strong>`;
    }


    prepareLink(element, isPlace = false) {
        if (isPlace) {
            return `<li><a href='javascript:View.prepareUpdateMarker(${element.id},true);'>${element.name}</a></li>`;
        }
        else {
            return `<li><a href='javascript:View.updateMarkerExt1("${View.prepareInfoContent(element)}",${element.lat},${element.lng});'><b>${element.short}</b> ${element.name}</a></li>`;
        }
    }

    getSearchResult(searched, collection, findInBuildingsCollection = false) {
        return collection.reduce((a, element) => {
            if (this.isFunded(searched.toLowerCase().trim(), element)) {
                if (findInBuildingsCollection) {
                    return a + this.prepareLink(element, true);
                }
                else {
                    return a + this.prepareLink(element);
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

//view class
class View {
    constructor() {
        this.modal = View.initModal();
        this.sizeMin = 770;
        this.lastWidth = window.innerWidth;
        this.isOpenPanel = this.lastWidth > this.sizeMin;
        window.addEventListener('resize', this.updateMapSize);

    }

    static initMap(latIn = 51.752845, lngIn = 19.453180, zoomIn = 18) {
        const welcomeText = "Witaj na stronie mapy Politechniki Łódzkiej - online. Wybierz z menu po lewej stornie " +
            "kategorię i miejsce jakie cię interesują albo wyszukaj za pomocą wyszukiwarki.";

        map = new google.maps.Map(mapElement, {
            zoom: zoomIn
        });
        View.updateMarkerExt(welcomeText, [{"lat": latIn, "lng": lngIn}]);
    }

    static prepareUpdateMarker(id, isPlace = false) {
        if (isPlace) {
            console.log(data);
            let element = data.places.filter(place => place.id == id);
            View.updateMarkerExt(View.prepareInfoContent(element[0], true), (data.getCoordinate(element[0].building)));
        }
        else {
            // View.prepareInfoContent(element, true)},JSON.stringify(this.getCoordinate(element.building));
        }
    }

    static updateMarkerExt1(content, latIn, lngIn) {
        View.updateMarkerExt(content, [{"lat": Number(latIn), "lng": Number(lngIn)}]);
    }

    static updateMarkerExt(content, coordinate) {
        markers.forEach(x => {
            x.setMap(null);
        });
        markers = [];

        coordinate.forEach(coordinate => {
            let marker = new google.maps.Marker({
                position: {
                    lat: (coordinate.lat),
                    lng: (coordinate.lng)
                },
                map: map
            });
            marker.setMap(map);
            let infowindow = new google.maps.InfoWindow({content: content});
            google.maps.event.addListener(marker, 'click', () => {
                infowindows.forEach(x => x.close());
                infowindow.open(map, marker);
            });
            if (markers.length == 0) {
                infowindow.open(map, marker);
                map.setCenter(marker.getPosition());
            }
            infowindows.push(infowindow);
            markers.push(marker);
        });

        if (window.innerWidth < view.sizeMin) {
            view.closeSidedraver();
        }
    }

    static initModal() {
        let modalEl = document.createElement('div');
        modalEl.innerHTML = `<div class='mui-container mui-panel'><h1>Mapa Politechniki Łódzkiej</h1><br>` +
            `<p>Niniejsza strona jest projektem od studentów dla studentów i nie tylko.</p>` +
            `<p>Jeśli znalazłeś błąd lub masz jakieś sugestie napisz!. Link poniżej:</p>` +
            `<div class="mui-row mui--text-center">` +
            `<a class="mui-btn mui-btn--primary "  href='https://docs.google.com/forms/d/e/1FAIpQLSdSOC7mxqPRETVWX9-24MreBA9Rsj3vltYn9lQvl2yPhFvpAw/viewform?c=0&w=1'><i class="fa fa-envelope-o"></i> Kontakt</a>` +
            `</div>` +
            `<div class="mui-row mui--text-center">` +
            `<button class="mui-btn" onclick="view.overlayOff()">Zamknij</button>` +
            `</div>` +
            `</div>`;
        modalEl.style.margin = '10px auto auto auto';
        return modalEl;
    }

    activateModal() {
        mui.overlay('on', this.modal);
    }

    overlayOff() {
        mui.overlay('off');
    }

    static prepareInfoContent(element, isPlace = false) {
        if (isPlace) {
            return `${element.name}<br>`
                + `<a href=?placeId=${element.id}>Link do lokacji</a>`
        }
        else {
            return `${element.name}<br>`
                + `<a href=?buildingId=${element.id}>Link do budynku</a>`
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
                sidedrawerElement.className = sidedrawerElement.className.replace(' active', '');
                document.body.appendChild(sidedrawerElement);
                this.isOpenPanel = false;
            }
        }).appendChild(sidedrawerElement);
        setTimeout(() => sidedrawerElement.className += ' active', 20);
    }

    closeSidedraver() {
        this.isOpenPanel = false;
        sidedrawerElement.className = sidedrawerElement.className.replace(' ', 'active');
        document.body.appendChild(sidedrawerElement);
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

    updateMapSize() {
        let magic1 = 300;
        let magic2 = 70;

        if (this.lastWidth > this.sizeMin)
            mui.overlay('off', {
                onclose: () => {
                    this.isOpenPanel = false;
                }
            });
        if (this.isOpenPanel) {
            mapElement.style.height = `${window.innerHeight - magic2}px`;
            mapElement.style.width = `${window.innerWidth - magic1}px`;
        }
        else {
            mapElement.style.height = `${window.innerHeight - magic2}px`;
            mapElement.style.width = `${window.innerWidth}px`;

        }

        if (this.isOpenPanel) {
            if (window.innerWidth > 768) {
                mui.overlay('off')
            }
            else {
                mapElement.style.height = `${window.innerHeight - magic2}px`;
                mapElement.style.width = `${window.innerWidth}px`;
            }
        }
        try {
            google.maps.event.trigger(mapElement, 'resize');
        } catch (e) {
            console.log(e)
        }
    }

    searchExt() {
        if (!this.isOpenPanel) {
            this.toggleSidedrawer();
            if (window.innerWidth < 768) {
                this.showSidedrawer();
            }
        }
        document.getElementById("search-input").focus();
    }
}


function init() {
    var buildings, categories, places;
    mapElement = document.getElementById('map');
    listElement = document.getElementById("list");
    sidedrawerElement = document.getElementById('sidedrawer');

    JSONHelper.loadJSON('json/categories.json',
        (data1) => {
            categories = data1;
            JSONHelper.loadJSON('json/places.json',
                (data2) => {
                    places = data2;
                    JSONHelper.loadJSON('json/buildings.json',
                        (data3) => {
                            buildings = data3;
                            data = new Data(buildings, categories, places);
                            view = new View();
                            View.initMap();
                            QueryHelper.getQueryURL();
                            view.updateMapSize();
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


