/**
 * Pooler22 copyright. All right reserved
 */
let map, markers = [], infowindows = [];
let mapElement, listElement, sidedrawerElement;
let isOpenPanel, edited = false;
let lastWidth, sizeMin = 770;
let buildings, categories, places;

var a;


function hasClass(element, cls) {
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}

function addClass(ele, cls) {
    if (!this.hasClass(ele, cls)) ele.className += " " + cls;
}
function removeClass(ele, cls) {
    if (hasClass(ele, cls)) {
        var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
        ele.className = ele.className.replace(reg, ' ');
    }
}


//json
function loadJSON_promise(path) {
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

function loadJSON(path, success, error) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success)
                    success(JSON.parse(xhr.responseText));
            } else {
                if (error)
                    error(xhr);
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
        let place = places.find(x => x.id == queryString.placeId);
        let coordinates = getCoordinate(place.building);
        updateMarkerExt(prepareInfoContent(place, true), coordinates);
    }
    else if (queryString.buildingId !== undefined) {
        let building = buildings.find(x => x.id == queryString.buildingId);
        updateMarkerExt(prepareInfoContent(building, false), [{
            "lat": Number(building.lat),
            "lng": Number(building.lng)
        }]);
    }
}

function getCoordinate(building) {
    return building.split(",").map(y => {
        let tmp = buildings.find(x => x.id == y);
        return {"lat": Number(tmp.lat), "lng": Number(tmp.lng)};
    });
}

function prepareInfoContent(element, isPlace = false) {
    return `${element.name}<br><a  href=${isPlace ? '?placeId=' : '?buildingId='}${element.id}>Link do lokacji</a>`
}

// function prepareInfoContentExt(element, isPlace = false) {
//     if(isPlace){
//         let coordinates = getCoordinate(element);
//     }
//     let building = buildings.find(x => x.id == element.building.split(",")[0]);
//
//     return `{element.name}<br>`
//         + `<ul>{prepareLinkBuilding(building)}</ul>`
//         + `<a  class="mdl-navigation__link" href={isPlace ? '?placeId=' : '?buildingId='}{element.id}>Link do lokacji</a>`
// }

//map
function initMap(latIn = 51.752845, lngIn = 19.453180, zoomIn = 18) {
    const welcomeText = "Witaj na stronie mapy Politechniki Łódzkiej - online. Wybierz z menu po lewej stornie " +
        "kategorię i miejsce jakie cię interesują albo wyszukaj za pomocą wyszukiwarki.";

    map = new google.maps.Map(mapElement, {
        zoom: zoomIn
    });
    updateMarkerExt(welcomeText, [{"lat": latIn, "lng": lngIn}]);
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

function updateMarker(content, x, y) {
    updateMarkerExt(content, [{'lat': Number(x), 'lng': Number(y)}]);
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
    return `<li class="has-subnav"><a href="#" class="mdl-navigation__link js-toggle-subnav">Budynki</a><ul class="mdl-navigation__list">${buildings.reduce((a, building) => a + prepareLink(building), "")}</ul></li>`;
}

function printCategories(categories) {
    return categories.reduce((a, category) => a + `<li class="has-subnav">${printCategory(category)}</li>`, "");
}

function printCategory(category) {
    let tmp = ``;
    tmp += `<a href="#" class="mdl-navigation__link js-toggle-subnav" >${category.name}</a>`;
    tmp += `<ul class="mdl-navigation__list">`;

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
    listElement.innerHTML = tmp ? `<a href="#" class="mdl-navigation__link js-toggle-subnav">>Wyniki wyszukiwania</a><ul>${tmp}</ul>` : `<a href="#" class="mdl-navigation__link js-toggle-subnav">Brak wyników</a>`;
}

function prepareLink(element, isPlace = false) {
    if (isPlace) {
        return `<li><a  class="mdl-navigation__link" href='javascript:updateMarkerExt("${prepareInfoContent(element, true)}",${JSON.stringify(getCoordinate(element.building))});'>${element.name}</a></li>`;
    }
    else {
        return `<li><a class="mdl-navigation__link" href='javascript:updateMarker("${prepareInfoContent(element)}",${element.lat},${element.lng});'>${element.name}</a></li>`;
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
    // element.nextSibling.style.display = element.nextSibling.style.display == "none" ? "block" : "none";
}

function showSidedrawer() {
    // isOpenPanel = true;
    // mui.overlay('on', {
    //     onclose: () => {
    //         sidedrawerElement.className = sidedrawerElement.className.replace(' active', '');
    //         document.body.appendChild(sidedrawerElement);
    //         isOpenPanel = false;
    //     }
    // }).appendChild(sidedrawerElement);
    // setTimeout(() => sidedrawerElement.className += ' active', 20);
}

function closeSidedraver() {
    //isOpenPanel = false;
    // sidedrawerElement.className = sidedrawerElement.className.replace(' active', '');
    // document.body.appendChild(sidedrawerElement);
    // mui.overlay('off');
}

function toggleSidedrawer() {
    document.getElementsByClassName('mdl-layout').MaterialLayout.toggleDrawer();
    // if (document.body.className == 'hide-sidedrawer') {
    //     isOpenPanel = true;
    //     document.body.className = 'show-sidedrawer';
    // } else {
    //     isOpenPanel = false;
    //     document.body.className = 'hide-sidedrawer'
    // }
    // updateMapSize();
}

function updateMapSize() {
    // let magic1 = 300;
    let magic2 = 64;
    // let magic3 = "300px";
    // let magic4 = '0px';

    // if (lastWidth > sizeMin)
    //     mui.overlay('off', {
    //         onclose: () => {
    //             isOpenPanel = false;
    //         }
    //     });

    mapElement.style.height = `${window.innerHeight - magic2}px`;
    //
    // if (isOpenPanel) {
    //     mapElement.style.width = `{window.innerWidth - magic1}px`;
    //     mapElement.style.marginLeft = magic3;
    // }
    // else {
    //     mapElement.style.width = `{window.innerWidth}px`;
    //     mapElement.style.marginLeft = magic4;
    // }
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


                            let navListWithSubNav = document.querySelectorAll('.mdl-navigation__list .has-subnav');
                            a = navListWithSubNav;
                            navListWithSubNav.forEach(listItem => {
                                // console.log(a);
                                let toggleButton = listItem.querySelector('.js-toggle-subnav');
                                // console.log(toggleButton);
                                let subnav = listItem.querySelector('ul');
                                // console.log(subnav);

                                toggleButton.addEventListener('click', function (event) {
                                    // event.preventDefault();

                                    if (hasClass(listItem, 'is-opened')) {
                                        removeClass(listItem, 'is-opened');
                                        removeClass(toggleButton, 'is-active');
                                    } else {
                                        // close all other
                                        // removeClass(navListWithSubNav, 'is-opened');
                                        // removeClass(navListWithSubNav.find('.is-active'), 'is-active');
                                        // open this one
                                        addClass(listItem, 'is-opened');
                                        addClass(toggleButton, 'is-active');
                                    }
                                })
                            });



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