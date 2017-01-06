let map, marker, markers = [];
let mapElement, listElement, sidedrawerElement;
let isOpenPanel, edited = false;
let lastWidth, sizeMin = 770;
let buildings, categories, places;
const pageUrl = "pooler22.github.io/MapaPL/index.html";
//json
function loadJSON(path) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
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
        let place = places.find(x => x.id == queryString.placeId);
        let coordinates = place.building.split(",").map(y => {
            let tmp = buildings.find(x => x.id == y);
            return [tmp.lat, tmp.lng];
        });
        updateMarkerExt(place.name + `<br><a href=${'?placeId=' + place.id}>Link</a>`, coordinates);
    }
    else if (queryString.buildingId !== undefined) {
        let building = buildings.find(x => x.id == queryString.buildingId);
        updateMarker(building.name + `<br><a href=${'?buildingId=' + building.id}>Link</a>`, {
            "lat": Number(building.lat),
            "lng": Number(building.lng)
        });
    }
}

//map
function initMap(latIn = 51.752845, lngIn = 19.453180, zoomIn = 18) {
    const welcomeText = "Witaj na stronie mapy Politechniki Łódzkiej - online. Wybierz z menu po lewej stornie " +
        "kategorię i miejsce jakie cię interesują albo wyszukaj za pomocą wyszukiwarki.";

    map = new google.maps.Map(mapElement, {
        zoom: zoomIn
    });
    updateMarker(welcomeText, {"lat": latIn, "lng": lngIn});
}

function updateMarker(content, position) {
    if (marker !== undefined) {
        marker.setMap(null);
    }
    setMarker(position);

    let infowindow = new google.maps.InfoWindow({content: content});

    google.maps.event.addListener(marker, 'click', () => infowindow.open(map, marker));
    infowindow.open(map, marker);
    if (window.innerWidth < sizeMin) {
        closeSidedraver();
    }
}

function setMarker(position) {
    marker = new google.maps.Marker({
        position: {
            lat: position.lat,
            lng: position.lng
        },
        map: map
    });
    map.setCenter(marker.getPosition());
}

function setMarkerExt(coordinate, content) {
    marker = new google.maps.Marker({
        position: {
            lat: Number(coordinate[0]),
            lng: Number(coordinate[1])
        },
        map: map
    });

    // map.setCenter(marker.getPosition());
    (function (marker) {
        google.maps.event.addListener(marker, 'click', (e) => {
            new google.maps.InfoWindow({content: content}).open(map, marker);
        });
        // infowindow.open(map, marker);
    })(marker);
}

function updateMarkerExt(content, coordinate) {
    if (marker !== undefined) {
        marker.setMap(null);
    }
    markers.forEach(marker1 => {
        if (marker1 !== undefined) {
            marker1.setMap(null);
        }
    });
    markers = [];


    coordinate.forEach(x => {
        console.log(x);
        setMarkerExt(x, content);
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

function printBuildings() {
    let tmp = ``;
    tmp += `<li><strong onclick='toggleListElement(this);'>Budynki</strong>`;
    tmp += `<ul style='display:none;'>`;
    tmp += buildings.reduce((a, building) => {
        return a + `<li><a href='javascript:updateMarker("${building.name}<br><a href=${'?buildingId=' + building.id}>Link</a>",{"lat":${building.lat}, "lng":${building.lng}});'>${building.name}</a></li>`;
    }, "");
    tmp += "</ul>";
    return tmp;
}

function printCategories(categories) {
    return categories.reduce((a, category) => a + `<li>${printCategory(category)}</li>`, "");
}

function printCategory(category) {
    let tmp = ``;
    tmp += `<strong onclick='toggleListElement(this);'>${category.name}</strong>`;
    tmp += `<ul style='display:none;'>`;

    if (category.subcategory !== undefined) {
        tmp += printCategories(category.subcategory);
    }
    category.places.forEach(place => {
        if (place.short == undefined) {
            place.short = ""
        }
        let building = buildings.find(x => x.id == place.building.split(",")[0]);
        tmp += `<li><a href='javascript:updateMarker("${place.name}<br>${building.name}<br><a href=${'?placeId=' + place.id}>Link</a>",{"lat":${building.lat}, "lng":${building.lng}});'><b>${place.short}</b> ${place.name}</a></li>`;
    });
    tmp += `</ul>`;
    return tmp;
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

    if (tmp == "") {
        tmp = `<strong>Brak wyników</strong>`;
    }
    else {
        tmp = `<strong>Wyniki wyszukiwania</strong><ul>${tmp}</ul>`;
    }
    edited = true;
    listElement.innerHTML = tmp;
}

function getSearchResult(searched, collection, findInBuildingsCollection = false) {
    return collection.reduce((a, element) => {
        if (isFunded(searched.toLowerCase(), element)) {
            if (findInBuildingsCollection) {
                let building = buildings.find(x => x.id == element.building.split(",")[0]);
                return a + `<li><a href='javascript:updateMarker("${element.name}<br>${building.name}<br><a href=${'?placeId=' + element.id}>Link</a>",{"lat":${building.lat}, "lng":${building.lng}});'><b>${element.short}</b> ${element.name}</a></li>`;
            }
            else {
                return a + `<li><a href='javascript:updateMarker("${element.name}<br><a href=${'?buildingId=' + element.id}>Link</a>",{"lat":${element.lat}, "lng":${element.lng}});'><b>${element.short}</b> ${element.name}</a></li>`;
            }
        }
        else {
            return a;
        }
    }, "");
}

function isFunded(value, element) {
    return element.name.toLowerCase().search(value) != -1
        || element.short.toLowerCase().search(value) != -1
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
    document.getElementById('js-show-sidedrawer').addEventListener('click', showSidedrawer, false);
    document.getElementById('js-hide-sidedrawer').addEventListener('click', toggleSidedrawer, false);

    updateMapSize();

    Promise.all([loadJSON('json/categories.json'), loadJSON('json/places.json'), loadJSON('json/buildings.json')]).then(values => {
        categories = values[0];
        places = values[1];
        buildings = values[2];
        initList();
        getQueryURL();
    }, reason => {
        console.log(reason)
    });
}

init();