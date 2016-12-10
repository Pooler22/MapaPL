let map;
let marker;
let edited = false;
const campus = [
    {
        "name": "WEEIA",
        "short": "WEEIA",
        "places": [
            {
                "name": "DMCS",
                "short": "k12",
                "lat": 51.753845,
                "lng": 19.453180,
            },
            {
                "name": "IIS",
                "short": "k12",
                "lat": 51.754845,
                "lng": 19.453180,
            },
            {
                "name": "IMSI",
                "short": "k12",
                "lat": 51.755845,
                "lng": 19.453180,
            }
        ]
    }
];

function updateMarker(latIn, lngIn) {
    marker.setMap(null);
    marker = new google.maps.Marker({
        position: {
            lat: latIn,
            lng: lngIn
        },
        map: map
    });
    map.setCenter(marker.getPosition());
}

function initMap(latIn = 51.752845, lngIn = 19.453180, zoomIn = 18) {
    const position = {
        lat: latIn,
        lng: lngIn
    };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: zoomIn,
        center: position
    });
    marker = new google.maps.Marker({
        position: position,
        map: map
    });
}

function initList() {
    let tmp = "";
    for (let group of campus) {
        tmp += "<li>";
        tmp += "<strong onclick='toggleListElement(this);'>" + group.short + "</strong><ul style='display:none;'>";
        for (let place of group.places) {
            tmp += "<li><a href='javascript:updateMarker(" + place.lat + "," + place.lng + ");'>" + place.name + "</a></li>";
        }
        tmp += "</ul></li>";
    }
    document.getElementById("list").innerHTML = tmp;
}

function filterPlaces(value) {
    if (value.length != 0) {
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
    for (let group of campus) {
        let tmp2 = "", tmp3 = "";
        tmp2 += "<strong>" + group.short + "</strong><ul>";
        for (let place of group.places) {
            if (place.name.toLowerCase().search(value.toLowerCase()) != -1 || place.short.toLowerCase().search(value.toLowerCase()) != -1) {
                tmp3 += "<li><a href='javascript:updateMarker(" + place.lat + "," + place.lng + ");'>" + place.name + "</a></li>";
            }
        }
        if (tmp3 == "") {
            tmp2 = "";
        }
        else {
            tmp2 += tmp3 + "</ul>";
        }
        tmp += tmp2;
    }
    if (tmp == "") {
        tmp = "<strong>Brak wyników</strong>";
    }
    document.getElementById("list").innerHTML = tmp;
    edited = true;
}

function showSidedrawer() {
    let sidedrawerEl = document.getElementById('sidedrawer');
    let options = {
        onclose: function () {
            sidedrawerEl.className = sidedrawerEl.className.replace(' active', '');
            document.body.appendChild(sidedrawerEl);
        }
    };

    mui.overlay('on', options).appendChild(sidedrawerEl);
    setTimeout(() => sidedrawerEl.className += ' active', 20);
}

function toggleSidedrawer() {
    let body = document.getElementsByTagName('BODY')[0];
    if (body.className == 'hide-sidedrawer') {
        body.className = 'show-sidedrawer'
    } else {
        body.className = 'hide-sidedrawer'
    }
}

function toggleListElement(element) {
    let nextElement = element.nextSibling;
    if (nextElement.style.display != "none") {
        nextElement.style.display = "none";
        nextElement.className = "active";
    }
    else {
        nextElement.style.display = "block";
    }
}

function init() {
    initList();
    document.getElementsByClassName('js-show-sidedrawer')[0].addEventListener('click', showSidedrawer, false);
    document.getElementsByClassName('js-hide-sidedrawer')[0].addEventListener('click', toggleSidedrawer, false);
}

init();