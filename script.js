let map, marker, markers = [];
let mapElement, listElement, sidedrawerElement;
let isOpenPanel, edited = false;
let lastWidth, sizeMin = 770;
let buildings, categories, places;

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

//map
function setMarker(coordinate) {

    marker = new google.maps.Marker({
        position: {
            lat: coordinate[0],
            lng: coordinate[1]
        },
        map: map
    });
    map.setCenter(marker.getPosition());
}

function initMap(latIn = 51.752845, lngIn = 19.453180, zoomIn = 18) {
    let welcomeText = /**/"Witaj na stronie mapy Politechniki Łódzkiej - online. Wybierz z menu po lewej stornie kategorię i miejsce jakie cię interesują albo wyszukaj za pomocą wyszukiwarki.";

    map = new google.maps.Map(mapElement, {
        zoom: zoomIn
    });
    updateMarker(welcomeText, latIn, lngIn);
}

function setMarkerExt(coordinate, infowindow) {
    markers.push(new google.maps.Marker({
        position: {
            lat: Number(coordinate[0]),
            lng: Number(coordinate[1])
        },
        map: map
    }));

    map.setCenter(markers[markers.length - 1].getPosition());

    google.maps.event.addListener(markers[markers.length - 1], 'click', (e) => {
        infowindow.open(map, markers[markers.length - 1]);
        // e.target.removeEventListener(e.type, arguments.callee);
    });

    infowindow.open(map, markers[markers.length - 1]);

    markers[markers.length - 1].setMap(map);
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

    let infowindow = new google.maps.InfoWindow({
        content: content
    });

    coordinate.forEach(x => {
        setMarkerExt(x, infowindow);
    });


    if (window.innerWidth < sizeMin) {
        closeSidedraver();
    }
}

function updateMarker(content, latIn, lngIn, ...rest) {
    if (rest.length != 0) {
        console.log(rest)
    }
    if (marker !== undefined) {
        marker.setMap(null);
    }
    setMarker([latIn, lngIn]);

    let infowindow = new google.maps.InfoWindow({
        content: content
    });

    google.maps.event.addListener(marker, 'click', (e) => {
        infowindow.open(map, marker);
        e.target.removeEventListener(e.type, arguments.callee);
    });

    infowindow.open(map, marker);

    marker.setMap(map);

    if (window.innerWidth < sizeMin) {
        closeSidedraver();
    }
}

function closeSidedraver() {
    isOpenPanel = false;
    sidedrawerElement.className = sidedrawerElement.className.replace(' active', '');
    document.body.appendChild(sidedrawerElement);
    mui.overlay('off');
}

//list
function printCategory(category) {
    let tmp = "";

    tmp += `<strong onclick='toggleListElement(this);'>${category.name}</strong>`;
    tmp += `<ul style='display:none;'>`;

    if (category.subcategory !== undefined) {
        tmp += printCategories(category.subcategory);
    }

    places.filter((x) => x.category.split(',').indexOf(category.id) != -1).forEach(place => {
        if (place.short == undefined) {
            place.short = ""
        }
        if (place.building != undefined) {

            let building = buildings.find(x => x.id == place.building.split(",")[0]);
            tmp += `<li><a href='javascript:updateMarker("${place.name}",${building.latitude},${building.longitude});'><b>${place.short}</b> ${place.name}</a></li>`;
        }
    });
    tmp += `</ul>`;
    return tmp;
}

function printCategories(categories) {
    return categories.reduce((a, b) => a + `<li>${printCategory(b)}</li>`, "");
}

function initList() {
    let tmp = ``;
    tmp += printCategories(categories);
    tmp += `<strong onclick='toggleListElement(this);'>Budynki</strong><ul style='display:none;'>`;
    tmp += buildings.reduce((a, b) => {
        return a + `<li><a href='javascript:updateMarker("${b.name}",${b.latitude},${b.longitude});'>${b.name}</a></li>`;
    }, "");
    tmp += "</ul></li>";
    listElement.innerHTML = tmp;
}

function filterPlaces(value) {
    if (value.length) {
        filterList(value);
    }
    else {
        if (edited) {
            edited = false;
            initList();
        }
    }
}

function isFunded(value, element) {
    return element.name.toLowerCase().search(value) != -1 || element.short.toLowerCase().search(value) != -1
}

function getSearchResult(value, collection, findInBuildingsCollection = false) {
    return collection.reduce((a, element) => {
        if (isFunded(value.toLowerCase(), element)) {
            if (findInBuildingsCollection) {
                let building = buildings.find(x => x.id == element.building.split(",")[0]);
                return a + `<li><a href='javascript:updateMarker("${element.name}",${building.latitude},${building.longitude});'><b>${element.short}</b> ${element.name}</a></li>`;
            }
            else {
                return a + `<li><a href='javascript:updateMarker("${element.name}",${element.latitude},${element.longitude});'><b>${element.short}</b> ${element.name}</a></li>`;
            }
        }
        else {
            return a;
        }
    }, "");
}

function filterList(value) {
    let tmp = ``, tmp2 = ``, tmp3 = ``;

    tmp2 += `<strong>Miejsca</strong><ul>`;
    tmp3 += getSearchResult(value, buildings);
    tmp3 += getSearchResult(value, places, true);

    if (tmp3 == "") {
        tmp2 = "";
    }
    else {
        tmp2 += tmp3 + "</ul>";
    }
    tmp += tmp2;

    if (tmp == "") {
        tmp = `<strong>Brak wyników</strong>`;
    }
    edited = true;
    listElement.innerHTML = tmp;
}

function toggleListElement(element) {
    element.nextSibling.style.display = element.nextSibling.style.display == "none" ? "block" : "none";
}

//view
function showSidedrawer() {
    let options = {
        onclose: () => {
            sidedrawerElement.className = sidedrawerElement.className.replace(' active', '');
            document.body.appendChild(sidedrawerElement);
            isOpenPanel = false;
        }
    };

    isOpenPanel = true;
    mui.overlay('on', options).appendChild(sidedrawerElement);
    setTimeout(() => sidedrawerElement.className += ' active', 20);
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
    mapElement.style.height = (window.innerHeight - magic2) + 'px';
    if (isOpenPanel) {
        mapElement.style.width = (window.innerWidth - magic1) + 'px';
        mapElement.style.marginLeft = magic3;
    }
    else {
        mapElement.style.width = (window.innerWidth) + 'px';
        mapElement.style.marginLeft = magic4;
    }
}

function resize() {
    isOpenPanel = window.innerWidth > sizeMin;
    updateMapSize()
}

function getQueryURL() {
    let queryString = getQueryString();
    if (queryString.placeId !== undefined) {
        let place = places.find(x => x.id == queryString.placeId);
        let coordinates = place.building.split(",").map(y => {
            let tmp = buildings.find(x => x.id == y);
            return [tmp.latitude, tmp.longitude];
        });
        updateMarkerExt(place.name, coordinates);
    }
    else if (queryString.buildingId !== undefined) {
        let building = buildings.find(x => x.id == queryString.buildingId);
        updateMarker(building.name, Number(building.latitude), Number(building.longitude));
    }
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