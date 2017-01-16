/**
 * Pooler22 copyright. all right reserved
 */
let map, markers = [], infowindows = [];
let mapElement, listElement, sidedrawerElement;
let isOpenPanel, edited = false;
let lastWidth, sizeMin = 770;
let buildings, categories, places;

function activateModal() {
    let modalEl = document.createElement('div');
    modalEl.innerHTML = `<div class='mui-panel'><h1>Mapa Politechniki Łódzkiej</h1><br>` +
        `<p>Niniejsza strona jest projektem od studentów dla studentów i nie tylko.</p>` +
        `<p>Jeśli znalazłeś błąd lub masz jakieś sugestie napisz, link poniżej:</p>` +
        `<button class="mui-btn"><a href='https://docs.google.com/forms/d/e/1FAIpQLSdSOC7mxqPRETVWX9-24MreBA9Rsj3vltYn9lQvl2yPhFvpAw/viewform?c=0&w=1'><i class="fa fa-envelope-o"></i> Kontakt</a></button>` +
        `</div>`;
    modalEl.style.width = '400px';
    modalEl.style.margin = '100px auto';
    modalEl.style.backgroundColor = '#fff';

    mui.overlay('on', modalEl);
}

//json
function loadJSON(path, success, error) {
    let xhr = new XMLHttpRequest();
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

function getQueryURL() {
    let queryString = getQueryString();
    if (queryString.placeId !== undefined) {
        let place = places.filter(x => x.id == queryString.placeId);
        let coordinates = getCoordinate(place[0].building);
        updateMarkerExt(prepareInfoContent(place[0], true), coordinates);
    }
    else if (queryString.buildingId !== undefined) {
        let building = buildings.filter(x => x.id == queryString.buildingId);
        updateMarkerExt(prepareInfoContent(building[0]), [{
            "lat": Number(building[0].lat),
            "lng": Number(building[0].lng)
        }]);
    }
}

function getCoordinate(building) {
    return building.split(",").map(y => {
        let tmp = buildings.filter(x => x.id == y);
        return {"lat": Number(tmp[0].lat), "lng": Number(tmp[0].lng)};
    });
}

function prepareInfoContent(element, isPlace = false) {
    if (isPlace) {
        return `${element.name}<br>`
            + `<a href=?placeId=${element.id}>Link do lokacji</a>`
    }
    else {
        return `${element.name}<br>`
            + `<a href=?buildingId=${element.id}>Link do budynku</a>`
    }
}

//map
function initMap(latIn = 51.752845, lngIn = 19.453180, zoomIn = 18) {
    const welcomeText = "Witaj na stronie mapy Politechniki Łódzkiej - online. Wybierz z menu po lewej stornie " +
        "kategorię i miejsce jakie cię interesują albo wyszukaj za pomocą wyszukiwarki.";

    map = new google.maps.Map(mapElement, {
        zoom: zoomIn
    });
    updateMarkerExt(welcomeText, [{"lat": latIn, "lng": lngIn}]);
}

function updateMarkerExt1(content, latIn, lngIn) {
    updateMarkerExt(content, [{"lat": Number(latIn), "lng": Number(lngIn)}]);
}

function updateMarkerExt(content, coordinate) {
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

    if (window.innerWidth < sizeMin) {
        closeSidedraver();
    }
}

//list
function extendCategories(categories) {
    categories.forEach(category => {
        category.places = places.filter(place => place.category == category.id);
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
    return `<span class="mui--pull-right mui-caret"></span>`;
}

function printBuildings() {
    return `<strong onclick='toggleListElement(this);'>Budynki${arrowSpan()}</strong>`
        + `<ul style='display:none;'>`
        + buildings.reduce((a, building) => a + prepareLink(building), "")
        + "${arrowSpan()}</ul>";
}

function printCategories(categories) {
    return categories.reduce((a, category) => a + `<li>${printCategory(category)}</li>`, "");
}

function printCategory(category) {
    let tmp = ``;
    tmp += `<strong onclick='toggleListElement(this);'>${category.name + arrowSpan()}</strong>`;
    tmp += `<ul style='display:none;'>`;

    if (category.subcategory !== undefined) {
        tmp += printCategories(category.subcategory);
    }
    category.places.forEach(place => {
        if (place.short == undefined) {
            place.short = ""
        }
        tmp += prepareLink(place, true);
    });
    tmp += `</ul>`;
    return tmp;
}

function search() {
    if (!isOpenPanel) {
        document.getElementById("js-hide-sidedrawer").click();
        if (window.innerWidth < 768) {
            showSidedrawer();
        }
    }
    document.getElementById("search-input").focus();

}

function filterPlaces(searched) {
    if (searched.length) {
        filterList(searched);
    }
    else {
        if (edited) {
            edited = false;
            initList();
        }
    }
}

function filterList(searched) {
    let tmp = getSearchResult(searched, buildings, false) + getSearchResult(searched, places, true);
    edited = true;
    listElement.innerHTML = tmp ? `<strong>Wyniki wyszukiwania</strong><ul>${tmp}</ul>` : `<strong>Brak wyników</strong>`;
}

function prepareUpdateMarker(id, isPlace = false) {
    if (isPlace) {
        let element = places.filter(place => place.id == id);
        updateMarkerExt(prepareInfoContent(element[0], true), (getCoordinate(element[0].building)));
    }
    else {
        // prepareInfoContent(element, true)},JSON.stringify(getCoordinate(element.building));
    }
}

function prepareLink(element, isPlace = false) {
    if (isPlace) {
        return `<li><a href='javascript:prepareUpdateMarker(${element.id},true);'>${element.name}</a></li>`;
    }
    else {
        return `<li><a href='javascript:updateMarkerExt1("${prepareInfoContent(element)}",${element.lat},${element.lng});'><b>${element.short}</b> ${element.name}</a></li>`;
    }
}

function getSearchResult(searched, collection, findInBuildingsCollection = false) {
    return collection.reduce((a, element) => {
        if (isFunded(searched.toLowerCase().trim(), element)) {
            if (findInBuildingsCollection) {
                return a + prepareLink(element, true);
            }
            else {
                return a + prepareLink(element);
            }
        }
        else {
            return a;
        }
    }, "");
}

function isFunded(searched, element) {
    let tmp1 = false, tmp2 = false;
    if (element.tags !== undefined) {
        tmp1 = element.tags.toLowerCase().search(searched) != -1
    }
    if (element.short_name !== undefined) {
        tmp2 = element.short_name.toLowerCase().search(searched) != -1
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
        onclose: () => {
            sidedrawerElement.className = sidedrawerElement.className.replace(' active', '');
            document.body.appendChild(sidedrawerElement);
            isOpenPanel = false;
        }
    }).appendChild(sidedrawerElement);
    setTimeout(() => sidedrawerElement.className += ' active', 20);
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
        document.body.className = 'hide-sidedrawer'
    }
    updateMapSize();
}

function updateMapSize() {

    let magic1 = 300;
    let magic2 = 64;
    let magic3 = "300px";
    let magic4 = '0px';

    if (lastWidth > sizeMin)
        mui.overlay('off', {
            onclose: () => {
                isOpenPanel = false;
            }
        });

    mapElement.style.height = `${window.innerHeight - magic2}px`;

    if (isOpenPanel) {
        mapElement.style.width = `${window.innerWidth - magic1}px`;
        mapElement.style.marginLeft = magic3;
    }
    else {
        mapElement.style.width = `${window.innerWidth}px`;
        mapElement.style.marginLeft = magic4;
    }
    try {
        google.maps.event.trigger(mapElement, 'resize');
    } catch (e) {

    }
}

function resize() {
    isOpenPanel = window.innerWidth > sizeMin;
    updateMapSize()
}

//init
function init() {
    lastWidth = window.innerWidth;
    isOpenPanel = lastWidth > sizeMin;
    mapElement = document.getElementById('map');
    listElement = document.getElementById("list");
    sidedrawerElement = document.getElementById('sidedrawer');

    window.addEventListener('resize', resize);
    document.getElementById('activateModal').addEventListener('click', activateModal, false);
    document.getElementById('js-show-sidedrawer').addEventListener('click', showSidedrawer, false);
    document.getElementById('js-hide-sidedrawer').addEventListener('click', toggleSidedrawer, false);


    updateMapSize();
    loadJSON('json/categories.json',
        (data) => {
            categories = data;
            loadJSON('json/places.json',
                (data) => {
                    places = data;

                    loadJSON('json/buildings.json',
                        (data) => {
                            buildings = data;

                            initList();
                            getQueryURL();
                        },
                        (xhr) => {
                            console.error(xhr);
                        }
                    );
                },
                (xhr) => {
                    console.error(xhr);
                }
            );
        },
        (xhr) => {
            console.error(xhr);
        }
    );
}

init();