let map, marker;
let mapElement, listElement, sidedrawerElement;
let isOpenPanel, edited = false;
let lastWidth, sizeMin = 770;
let buildings, categories, places;

//json
function loadJSON(path, success) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200 && success) {
            success(JSON.parse(xhr.responseText));
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}

//map

function setMarker(latIn, lngIn, label = "") {
    marker = new google.maps.Marker({
        position: {
            lat: latIn,
            lng: lngIn
        },
        label: label,
        map: map
    });
    map.setCenter(marker.getPosition());
}

function initMap(latIn = 51.752845, lngIn = 19.453180, zoomIn = 18, label = "PŁ") {
    map = new google.maps.Map(mapElement, {
        zoom: zoomIn
    });
    setMarker(latIn, lngIn, label);
}

function updateMarker(latIn, lngIn, name = "", label = "") {
    marker.setMap(null);
    setMarker(latIn, lngIn, label);

    let infowindow = new google.maps.InfoWindow({
        content: name
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

    for (let place of places.filter((x) => x.category.split(',').indexOf(category.id) != -1)) {
        if (place.short == undefined) {
            place.short = ""
        }
        if (place.building != undefined) {
            let building = buildings.find(x => x.id == place.building.split(",")[0]);
            tmp += `<li><a href='javascript:updateMarker(${building.latitude},${building.longitude},"${place.name}","${place.short}");'><b>${place.short}</b>${place.name}</a></li>`;
        }
    }
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
        return a + `<li><a href='javascript:updateMarker(${b.latitude},${b.longitude},"${b.name}","${b.short}");'><b>${b.short}</b>${b.name}</a></li>`;
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

function getSearchResult(value, collection) {
    return collection.reduce((a, element) => {
        if (isFunded(value.toLowerCase(), element)) {
            return a + `<li><a href='javascript:updateMarker(${element.latitude},${element.longitude},"${element.name}","${element.short}");'><b>${element.short}</b> ${element.name}</a></li>`;
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
    tmp3 += getSearchResult(value, places);

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
    let magic1 = 200;
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

//init
function init() {
    lastWidth = window.innerWidth;
    isOpenPanel = window.innerWidth > sizeMin;
    mapElement = document.getElementById('map');
    listElement = document.getElementById("list");
    sidedrawerElement = document.getElementById('sidedrawer');

    window.addEventListener('resize', resize);
    document.getElementById('js-show-sidedrawer').addEventListener('click', showSidedrawer, false);
    document.getElementById('js-hide-sidedrawer').addEventListener('click', toggleSidedrawer, false);

    updateMapSize();

    loadJSON('json/categories.json', data => {
        categories = data;
        loadJSON('json/places.json', data => {
            places = data;
            loadJSON('json/buildings.json', data => {
                buildings = data;
                initList();
            });
        });
    });
}

init();