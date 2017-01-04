let map, marker;
let mapElement, listElement, sidedrawerElement;
let options = {
    onclose: () => {
        isOpenPanel = false;
    }
};
let isOpenPanel, edited = false;
let lastWidth, sizeMin = 770;
let building, categories, units;

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
function initMap(latIn = 51.752845, lngIn = 19.453180, zoomIn = 18, label = "PŁ") {
    const position = {
        lat: latIn,
        lng: lngIn
    };
    map = new google.maps.Map(mapElement, {
        zoom: zoomIn,
        center: position
    });

    marker = new google.maps.Marker({
        position: position,
        label: label,
        map: map
    });
}

function updateMarker(latIn, lngIn, name, label = "") {
    marker.setMap(null);
    marker = new google.maps.Marker({
        position: {
            lat: latIn,
            lng: lngIn
        },
        label: label,
        map: map
    });

    map.setCenter(marker.getPosition());

    let infowindow = new google.maps.InfoWindow({
        content: name
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
    let tmp = "<strong onclick='toggleListElement(this);'>" + category.name + "</strong>";

    tmp += "<ul style='display:none;'>";
    if (category.subcategory !== undefined) {
        tmp += printCategories(category.subcategory);
    }
    for (let place of building.filter((x) => x.place_category.split(',').indexOf(category.id) != -1)) {
        if (place.short == undefined) {
            place.short = ""
        }
        tmp += "<li><a href='javascript:updateMarker(" + place.latitude + "," + place.longitude + ",\"" + place.name + "\",\"" + place.short + "\");'>" + "<b>" + place.short + "</b> " + place.name + "</a></li>";
    }
    tmp += "</ul>";
    return tmp;
}

function printCategories(categories) {
    let tmp = "";
    for (let category of categories) {
        tmp += "<li>";
        tmp += printCategory(category);
        tmp += "</li>";
    }
    return tmp;
}

function initList() {
    let tmp = "";
    tmp += printCategories(categories);
    tmp += "<strong onclick='toggleListElement(this);'>" + "Budynki" + "</strong><ul style='display:none;'>";
    for (let place of building) {
        tmp += "<li><a href='javascript:updateMarker(" + place.latitude + "," + place.longitude + ",\"" + place.name + "\",\"" + place.short + "\");'>" + "<b>" + place.short + "</b> " + place.name + "</a></li>";
    }
    listElement.innerHTML = tmp + "</ul></li>";
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

function filterList(value) {
    let tmp = "";

    // for (let group of campus) {
    let tmp2 = "", tmp3 = "";

    tmp2 += "<strong>" + "Miejsca" + "</strong><ul>";
    for (let place of building) {
        if (place.name.toLowerCase().search(value.toLowerCase()) != -1 || place.symbol.toLowerCase().search(value.toLowerCase()) != -1) {
            tmp3 += "<li><a href='javascript:updateMarker(" + place.latitude + "," + place.longitude + ",\"" + place.name + "\",\"" + place.symbol + "\");'>" + "<b>" + place.symbol + "</b> " + place.name + "</a></li>";
        }
    }
    if (tmp3 == "") {
        tmp2 = "";
    }
    else {
        tmp2 += tmp3 + "</ul>";
    }
    tmp += tmp2;
    // }
    if (tmp == "") {
        tmp = "<strong>Brak wyników</strong>";
    }
    listElement.innerHTML = tmp;
    edited = true;
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
    if (lastWidth > sizeMin)
        mui.overlay('off', options);
    mapElement.style.height = (window.innerHeight - 64) + 'px';
    if (isOpenPanel) {
        mapElement.style.width = (window.innerWidth - 200) + 'px';
        mapElement.style.marginLeft = '300px';
    }
    else {
        mapElement.style.width = (window.innerWidth) + 'px';
        mapElement.style.marginLeft = '0px';
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

    loadJSON('json/categories.json', data => categories = data);
    loadJSON('json/places.json', data => units = data);
    loadJSON('json/building.json',
        (data) => {
            building = data;
            initList();
        });
}

init();