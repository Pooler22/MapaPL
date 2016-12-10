let map;
let marker;
let edited = false;
const data = [
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
    },
    {
        "name": "FTIMS",
        "short": "FTIMS",
        "places": [{
            "name": "IMSI",
            "short": "k12",
            "lat": 51.755845,
            "lng": 19.453180,
        }]
    },
    {
        "name": "OIZ",
        "short": "OIZ",
        "places": [{
            "name": "IMSI",
            "short": "k12",
            "lat": 51.755845,
            "lng": 19.453180,
        }]
    },
];

function updateMarker(latIn = 51.752845, lngIn = 19.453180) {
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

function initMap(latIn = 51.752845, lngIn = 19.453180) {
    const uluru = {
        lat: latIn,
        lng: lngIn
    };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 18,
        center: uluru
    });
    marker = new google.maps.Marker({
        position: uluru,
        map: map
    });
}

function initList() {
    var list = document.getElementById("list");
    let tmp = "";
    for (let group of data) {
        tmp += "<li>";
        tmp += "<strong onclick='toggleListElement(this);'>" + group.short + "</strong><ul style='display:none;'>";
        for (let place of group.places) {
            tmp += "<li><a href='javascript:updateMarker(" + place.lat + "," + place.lng + ");'>" + place.name + "</a></li>";
        }
        tmp += "</ul></li>";

    }
    list.innerHTML = tmp;
}

function filterPlaces(value) {
    if (value.length > 1) {
        filterList(value);
    }
    else {
        if (edited) {
            initList();
            edited = false;
        }
    }
}

function filterList(value) {
    let list = document.getElementById("list");
    let tmp = "";
    for (let group of data) {
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
        list.innerHTML = "<p>Brak wyników.</p>";
    }
    else {
        list.innerHTML = tmp;
    }
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

    let overlayEl = mui.overlay('on', options);

    overlayEl.appendChild(sidedrawerEl);
    setTimeout(function () {
        sidedrawerEl.className += ' active';
    }, 20);
}

function toggleSidedrawer() {
    var body = document.getElementsByTagName('BODY')[0];
    if (body.className == 'hide-sidedrawer') {
        body.className = 'show-sidedrawer'
    } else {
        body.className = 'hide-sidedrawer'
    }
}

function toggleListElement(element) {
    if (element.nextSibling.style.display != "none") {
        element.nextSibling.style.display = "none";
    }
    else {
        element.nextSibling.style.display = "block";
    }
}

function init() {
    initList();
    for (i of document.getElementsByClassName('js-show-sidedrawer')) {
        i.addEventListener('click', showSidedrawer, false);
    }
    for (i of document.getElementsByClassName('js-hide-sidedrawer')) {
        i.addEventListener('click', toggleSidedrawer, false);
    }
}

init();
