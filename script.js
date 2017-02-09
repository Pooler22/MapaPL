"use strict";var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(b){return typeof b}:function(b){return b&&"function"==typeof Symbol&&b.constructor===Symbol&&b!==Symbol.prototype?"symbol":typeof b},_createClass=function(){function b(c,d){for(var f,e=0;e<d.length;e++)f=d[e],f.enumerable=f.enumerable||!1,f.configurable=!0,"value"in f&&(f.writable=!0),Object.defineProperty(c,f.key,f)}return function(c,d,e){return d&&b(c.prototype,d),e&&b(c,e),c}}();function _classCallCheck(b,c){if(!(b instanceof c))throw new TypeError("Cannot call a class as a function")}var view,data,mapApi=void 0,map,markers=[],JSONHelper=function(){function b(){_classCallCheck(this,b)}return _createClass(b,null,[{key:"loadJSON",value:function loadJSON(c,d,e){var f=new XMLHttpRequest;f.onreadystatechange=function(){f.readyState===XMLHttpRequest.DONE&&(200===f.status?d&&d(JSON.parse(f.responseText)):e&&e(f))},f.open("GET",c,!0),f.send()}}]),b}(),QueryHelper=function(){function b(){_classCallCheck(this,b)}return _createClass(b,null,[{key:"decodeQueryString",value:function decodeQueryString(){var c={};return window.location.search.substring(1).split("&").forEach(function(d){var e=d.split("=");"undefined"==typeof c[e[0]]?c[e[0]]=decodeURIComponent(e[1]):"string"==typeof c[e[0]]?c[e[0]]=[c[e[0]],decodeURIComponent(e[1])]:c[e[0]].push(decodeURIComponent(e[1]))}),c}},{key:"getQueryURL",value:function getQueryURL(){View.initFromQuery(b.decodeQueryString())}},{key:"UpdateURL",value:function UpdateURL(c,d){if("undefined"!=typeof history.pushState){var e={Title:c,Url:d};history.pushState(e,e.Title,e.Url)}else console.error("Update url")}}]),b}(),Data=function(){function b(c,d,e,f){_classCallCheck(this,b),this.listSearched=document.getElementById("listSearched"),this.listElement=document.getElementById("list"),this.campuses=f,this.buildings=c,this.categories=d,this.places=e,this.correctFormatBuildings(this.buildings),this.extendCategories(this.categories)}return _createClass(b,[{key:"correctFormatBuildings",value:function correctFormatBuildings(c){c.forEach(function(d){return d.coordinates=b.correctFormatPolygons(d.coordinates)})}},{key:"campusToColor",value:function campusToColor(c){return data.campuses.filter(function(d){return d.name[d.name.length-1]==c})[0].color}},{key:"extendCategories",value:function extendCategories(c){var d=this;c.forEach(function(e){e.places=d.places.filter(function(f){return f.category==e.id})})}},{key:"preparePrintCategories",value:function preparePrintCategories(){this.listElement.innerHTML="<p style='margin-left:10px'>Lista miejsc:</p>"+(view.printCategories(this.categories)+view.printBuildings(this.buildings))}},{key:"getPlacesById",value:function getPlacesById(c){return this.places.filter(function(d){return d.id==c})}},{key:"getBuildingsById",value:function getBuildingsById(c){return this.buildings.filter(function(d){return d.id==c})}},{key:"getCoordinate",value:function getCoordinate(c){var d=this;return c.split(",").map(function(e){return d.getBuildingsById(e)[0].latLng})}},{key:"getPolygons",value:function getPolygons(c){var d=this;return c.split(",").map(function(e){return d.getBuildingsById(e)[0].coordinates})}},{key:"getColors",value:function getColors(c){var d=this;return c.split(",").map(function(e){return d.getBuildingsById(e)[0].campus})}},{key:"filterPlaces",value:function filterPlaces(c){c.length?(this.listSearched.style.display="block",this.listElement.style.display="none",this.filterList(c)):(this.listSearched.style.display="none",this.listElement.style.display="block")}},{key:"filterList",value:function filterList(c){var d=this.getSearchResult(c,this.buildings,!1)+this.getSearchResult(c,this.places,!0);this.listSearched.innerHTML=d?"<strong>Wyniki wyszukiwania</strong><ul>"+d+"</ul>":"<strong>Brak wynik\xF3w</strong>"}},{key:"getSearchResult",value:function getSearchResult(c,d){var e=2<arguments.length&&void 0!==arguments[2]&&arguments[2];return d.reduce(function(f,g){return b.isFunded(c.toLowerCase().trim(),g)?e?f+View.prepareLink(g,!0):f+View.prepareLink(g):f},"")}}],[{key:"correctFormatPolygons",value:function correctFormatPolygons(c){return c.map(function(d){var e;return e=[d[1],d[0]],d[0]=e[0],d[1]=e[1],e})}},{key:"isFunded",value:function isFunded(c,d){var e=!1,f=!1;return d.tags&&(e=-1!=d.tags.toLowerCase().search(c)),d.short_name&&(f=-1!=d.short_name.toLowerCase().search(c)),d.short||(d.short=""),-1!=d.name.toLowerCase().search(c)||-1!=d.short.toLowerCase().search(c)||e||f}}]),b}(),Modal=function(){function b(){_classCallCheck(this,b)}return _createClass(b,null,[{key:"initModal",value:function initModal(){var c=document.createElement("div");return c.className="modal",c.innerHTML="<div class='mui-container mui-panel'><h2>Mapa Politechniki \u0141\xF3dzkiej</h2><p>Niniejsza strona jest projektem mapy online Politechniki \u0141\xF3dzkiej.</p><p>Je\u015Bli znalaz\u0142e\u015B b\u0142\u0105d lub masz jakie\u015B sugestie napisz!. Link poni\u017Cej:</p><div class=\"mui-row mui--text-center\"><a class=\"mui-btn mui-btn--primary \"  href='https://docs.google.com/forms/d/e/1FAIpQLSdSOC7mxqPRETVWX9-24MreBA9Rsj3vltYn9lQvl2yPhFvpAw/viewform?c=0&w=1'><i class=\"fa fa-envelope-o\"></i> Kontakt</a></div><div class=\"mui-row mui--text-center\"><button class=\"mui-btn\" onclick=\"view.overlayOff()\"><i class=\"fa fa-close\"></i> Zamknij</button></div></div>",c}},{key:"initModalInfoPlace",value:function initModalInfoPlace(c){var d=document.createElement("div");return d.className="modal",d.innerHTML="<div class='mui-container mui-panel'><h1>"+View.getShort(c)+" "+c.name+"</h1>"+(" <dl>\n                      "+View.getCategory(c)+"\n                      "+View.getElementLink(c,"website","Strona www")+"\n                       "+View.getElement(c,"buildings","Budynki")+"\n                      "+View.getElement(c,"tags","Tagi")+"\n                  </dl><div class=\"mui-row mui--text-center\"><button class=\"mui-btn\" onclick=\"view.overlayOff()\"><i class=\"fa fa-close\"></i> Zamknij</button></div></div>"),d}},{key:"initModalInfoBuilding",value:function initModalInfoBuilding(c){var d=document.createElement("div");return d.className="modal",d.innerHTML="<div class='mui-container mui-panel'><h1>"+View.getShort(c)+c.name+"</h1>"+(" <dl>"+View.getElement(c,"address","Adres")+"\n                "+View.getPlaces(c)+"\n                "+View.getElement(c,"tags","Tagi")+"</dl><div class=\"mui-row mui--text-center\"><button class=\"mui-btn\" onclick=\"view.overlayOff()\"><i class=\"fa fa-close\"></i> Zamknij</button></div></div>"),d}}]),b}(),View=function(){function b(){_classCallCheck(this,b),this.sidedrawerElement=document.getElementById("sidedrawer"),this.mapElement=document.getElementById("map"),this.modal=Modal.initModal(),this.sizeMin=768,this.lastWidth=window.innerWidth,this.isOpenPanel=this.lastWidth>this.sizeMin,window.addEventListener("resize",this.updateMapSize),document.addEventListener("resize",this.updateMapSize);mapApi=new MapsApi(16,[51.749845,19.45318])}return _createClass(b,[{key:"initAllPolygons",value:function initAllPolygons(){data.buildings.forEach(function(c){for(var d=view.prepareInfoContent(c,!1,!1),e=0;e<d.length;e++)b.drawPolygon(c.coordinates,d[e],c.campus),markers[e]._latlng={lat:c.latLng[0],lng:c.latLng[1]}})}},{key:"printBuildings",value:function printBuildings(c){return"<strong onclick='View.toggleListElement(this);'> <span><i class=\"fa fa-building\"></i> Budynki</span>"+b.arrowSpan()+"</strong><ul style='display:none;'>"+c.reduce(function(d,e){return d+b.prepareLink(e)},"")+(b.arrowSpan()+"</ul>")}},{key:"printCategories",value:function printCategories(c){var d=this;return c.reduce(function(e,f){return e+(f.isSubCat?"":"<li>"+d.printCategory(f)+"</li>")},"")}},{key:"printCategory",value:function printCategory(c){var d="";return d+="<strong onclick='View.toggleListElement(this);'><i class=\"fa "+c.icon+"\"></i> "+(c.name+b.arrowSpan())+"</strong>",d+="<ul style='display:none;'>",c.subcategory?c.subcategory.split(",").map(function(e){var f=data.categories.filter(function(g){return g.id==e});f[0].isSubCat=!1,d+=view.printCategories(f),f[0].isSubCat=!0}):c.places.forEach(function(e){d+=b.prepareLink(e,!0)}),d+="</ul>",d}},{key:"prepareUpdateMarker",value:function prepareUpdateMarker(c){var d=1<arguments.length&&void 0!==arguments[1]&&arguments[1];if(d){var e=data.places.filter(function(j){return j.id==c})[0],f=e.building.split(",").map(function(j){return data.getBuildingsById(j)[0].coordinates}),g=e.building.split(",").map(function(j){return data.getBuildingsById(j)[0].campus});this.updatePolygon(this.prepareInfoContent(e,!0),data.getCoordinate(e.building),f,g)}else{var h=data.buildings.filter(function(j){return j.id==c})[0];this.updatePolygon(this.prepareInfoContent(h,!1),[h.latLng],[h.coordinates],h.campus)}mui.overlay("off")}},{key:"cleanUpMarkers",value:function cleanUpMarkers(){markers.forEach(function(c){return mapApi.map.removeLayer(c)}),markers=[]}},{key:"isMobile",value:function isMobile(){return window.innerWidth<this.sizeMin}},{key:"updatePolygon",value:function updatePolygon(c,d,e,f){this.cleanUpMarkers();for(var g=0;g<c.length;g++)b.drawPolygon(e[g],c[g],f[g]),markers[g]._latlng={lat:d[g][0],lng:d[g][1]};markers[0].openPopup(),mapApi.setCenter(d[0]),this.isMobile()&&view.closeSidedraver()}},{key:"activateModalPlace",value:function activateModalPlace(c){var d=data.getPlacesById(c)[0];this.prepareUpdateMarker(c,!0),1<d.building.split(",").length&&mui.overlay("on",this.palceModal(d))}},{key:"activateModalBuilding",value:function activateModalBuilding(c){var d=data.getBuildingsById(c)[0];this.prepareUpdateMarker(c,!1),b.buildingModal(d)}},{key:"activateModalInfo",value:function activateModalInfo(c,d){if(d){var e=data.getPlacesById(c)[0];mui.overlay("on",Modal.initModalInfoPlace(e))}else{var f=data.getBuildingsById(c)[0];mui.overlay("on",Modal.initModalInfoBuilding(f))}}},{key:"setMarkerCloseModal",value:function setMarkerCloseModal(c,d){QueryHelper.UpdateURL(c.name,"?placeId="+c.id+"&index="+d),mui.overlay("off"),b.setMarker(d)}},{key:"palceModal",value:function palceModal(c){QueryHelper.UpdateURL(c.name,"?placeId="+c.id);var d=c.building.split(","),e=-1,f=d.map(function(){var j=d.reduce(function(k,l){var m=data.buildings.filter(function(n){return n.id==l})[0];return e+=1,k+("<div class=\"mui-divider\"></div><a href='javascript:view.setMarkerCloseModal("+JSON.stringify({id:c.id,name:c.name})+","+e+")'>"+m.name+"</a><br><p>"+m.address+"</p>")},"");return e=-1,j});e=-1;var g=f.map(function(j){return e+=1,"<strong>"+c.name+"</strong>"+("<p>Wybierz jeden z budynk\xF3w tej jednostki:</p>"+j)}),h=document.createElement("div");return h.innerHTML="<div class='mui-container mui--text-center mui-panel'><div class=\"mui--text-center\">"+g[0]+"</div><button class=\"mui-btn\" onclick=\"view.overlayOff()\"><i class=\"fa fa-close\"></i> Zamknij</button></div>",h.style.margin="10px auto auto auto",h}},{key:"activateModal",value:function activateModal(){mui.overlay("on",this.modal)}},{key:"overlayOff",value:function overlayOff(){mui.overlay("off")}},{key:"prepareInfoContent",value:function prepareInfoContent(c,d){var e=2<arguments.length&&void 0!==arguments[2]?arguments[2]:!0;if(d){var _ret=function(){e&&QueryHelper.UpdateURL(c.name,"?placeId="+c.id);var f=c.building.split(",");if(1<f.length){var _ret2=function(){var h=-1,j=f.map(function(k){var l=f.reduce(function(m,n){var o=data.buildings.filter(function(p){return p.id==n})[0];return h+=1,k==n?m:m+("<li><a href='javascript:View.setMarker("+h+")'>"+o.name+"</a></li>")},"");return h=-1,l});return h=-1,{v:{v:j.map(function(k){h+=1;var l=data.getBuildingsById(f[h])[0];return"<p><strong>"+c.name+"</strong>"+("<br>"+b.getAddresExt(l)+"</p>")+("Pozosta\u0142e budynki tej jednostki:<ul>"+k+"</ul>")+("<a href='javascript:view.activateModalInfo("+c.id+",true);'>Wi\u0119cej informacji</a>")})}}}();if("object"===("undefined"==typeof _ret2?"undefined":_typeof(_ret2)))return _ret2.v}else{var g=data.getBuildingsById(+f[0])[0];return{v:["<p><strong>"+c.name+"</strong><br>"+(g.name+"<br>")+(""+b.getAddresExt(g))+("</br><a href='javascript:view.activateModalInfo("+c.id+",true);'>Wi\u0119cej informacji</a>")]}}}();if("object"===("undefined"==typeof _ret?"undefined":_typeof(_ret)))return _ret.v}else return e&&QueryHelper.UpdateURL(c.name,"?buildingId="+c.id),["<p><strong>"+c.name+"</strong><br>"+(""+b.getAddresExt(c))+("</p><a href='javascript:view.activateModalInfo("+c.id+",false);'>Wi\u0119cej informacji</a>")]}},{key:"showSidedrawer",value:function showSidedrawer(){var c=this;this.isOpenPanel=!0,mui.overlay("on",{onclose:function onclose(){c.sidedrawerElement.className=c.sidedrawerElement.className.replace(" active",""),document.body.appendChild(c.sidedrawerElement),c.isOpenPanel=!1}}).appendChild(this.sidedrawerElement),setTimeout(function(){return c.sidedrawerElement.className+=" active"},20)}},{key:"closeSidedraver",value:function closeSidedraver(){this.isOpenPanel=!1,this.sidedrawerElement.className=this.sidedrawerElement.className.replace(" ","active"),document.body.appendChild(this.sidedrawerElement),mui.overlay("off"),this.updateMapSize()}},{key:"toggleSidedrawer",value:function toggleSidedrawer(){"hide-sidedrawer"==document.body.className?(this.isOpenPanel=!0,document.body.className="show-sidedrawer"):(this.isOpenPanel=!1,document.body.className="hide-sidedrawer"),this.updateMapSize()}},{key:"openSidedrawerExt",value:function openSidedrawerExt(){this.isOpenPanel=!0,document.body.className="show-sidedrawer",this.updateMapSize()}},{key:"updateMapSize",value:function updateMapSize(){var e=this;this.mapElement=document.getElementById("map");var d=70;this.lastWidth>this.sizeMin&&mui.overlay("off",{onclose:function onclose(){e.isOpenPanel=!1}}),this.isOpenPanel?(this.mapElement.style.height=window.innerHeight-d+"px",this.mapElement.style.width=window.innerWidth-300+"px"):(this.mapElement.style.height=window.innerHeight-d+"px",this.mapElement.style.width=window.innerWidth+"px"),window.innerWidth>this.sizeMin?mui.overlay("off"):(this.isOpenPanel=!1,this.mapElement.style.height=window.innerHeight-d+"px",this.mapElement.style.width=window.innerWidth+"px"),mapApi.resizeMap()}},{key:"searchExt",value:function searchExt(){this.openSidedrawerExt(),window.innerWidth<this.sizeMin&&this.showSidedrawer(),document.getElementById("search-input").focus()}}],[{key:"getCategory",value:function getCategory(c){return c.category?"<dt>Kategoria</dt><dd>"+data.categories.filter(function(d){return d.id==c.category||void(c.subcategory&&c.subcategory.some(function(e){return e.id==c.category||(c.subcategory?c.subcategory.some(function(f){return f.id==c.category}):void 0)}))})[0].name+"</dd>":""}},{key:"getElement",value:function getElement(c,d,e){return c[d]?"<dt>"+e+"</dt><dd>"+c[d]+"</dd>":""}},{key:"getElementLink",value:function getElementLink(c,d,e){return c[d]?"<dt>"+e+"</dt><dd><a href=\""+c[d]+"\" target=\"_blank\">Strona WWW</a></dd>":""}},{key:"getShort",value:function getShort(c){return c.short?c.short+" - ":""}},{key:"getPlaces",value:function getPlaces(c){var d=data.places.filter(function(e){return e.building.split(",").some(function(f){return f==c.id})});return 0<d.length?"<dt>Jednostki w budynku</dt><dd>"+d.reduce(function(e,f){return e+("<a href=\"?placeId="+f.id+"\">"+f.name+"</a><br>")},"")+"</dd>":""}},{key:"getAddresExt",value:function getAddresExt(c){return c.address?c.address:""}},{key:"prepareLink",value:function prepareLink(c){var d=1<arguments.length&&void 0!==arguments[1]&&arguments[1];return d?"<li><a href='javascript:view.activateModalPlace("+c.id+");'>"+c.name+"</a></li>":"<li><a href='javascript:view.activateModalBuilding(\""+c.id+"\");'>"+c.name+"</a></li>"}},{key:"arrowSpan",value:function arrowSpan(){return"<span class=\"mui--pull-right mui-caret\"></span>"}},{key:"drawPolygon",value:function drawPolygon(c,d,e){var f=L.polygon(c).addTo(mapApi.map).bindPopup(d);if(e){var g=data.campusToColor(e);f.setStyle({color:"#fff",fillColor:g,fillOpacity:1,opacity:0.5})}markers.push(f)}},{key:"buildingModal",value:function buildingModal(c){QueryHelper.UpdateURL(c.name,"?buildingId="+c.id)}},{key:"setMarker",value:function setMarker(c){var d=markers[c]._latlng;mapApi.setCenter([d.lat,d.lng]),markers[c].openPopup()}},{key:"toggleListElement",value:function toggleListElement(c){var d=c.nextSibling;d.style.display="none"==d.style.display?"block":"none"}},{key:"initFromQuery",value:function initFromQuery(c){if(c.placeId){var d=data.getPlacesById(c.placeId)[0],e=data.getCoordinate(d.building),f=data.getPolygons(d.building);if(c.index&&0!=c.index){var _ref2=[e[0],e[c.index]];e[c.index]=_ref2[0],e[0]=_ref2[1];var _ref3=[f[0],f[c.index]];f[c.index]=_ref3[0],f[0]=_ref3[1]}var g=data.getColors(d.building);view.updatePolygon(view.prepareInfoContent(d,!0),e,f,g)}else if(c.buildingId){var h=data.getBuildingsById(c.buildingId)[0];view.updatePolygon(view.prepareInfoContent(h,!1),[h.latLng],[h.coordinates],h.campus)}else view.initAllPolygons()}}]),b}(),MapsApi=function(){function b(c,d){_classCallCheck(this,b);var f={};f.Eduroam=new L.LayerGroup,["A1","A2","A3","A4","A5","A10","A12","A27","A28","A33","B1","B2","B3","B6","B7","B9","B19","B22","B24","B25","C15","D1","D2","D3"].forEach(function(r){var s=data.buildings.filter(function(u){return u.short==r})[0],t=L.polygon(s.coordinates).bindPopup("Eduroam");t.setStyle({color:"#3C3F41",fillColor:"#3C3F41",fillOpacity:0.5,weight:6}),t.addTo(f.Eduroam)});var g={},h=data.campuses.map(function(r){r.coordinates=Data.correctFormatPolygons(r.coordinates)});data.campuses.forEach(function(r){g[r.name]=new L.LayerGroup;var s=L.polygon(r.coordinates).bindPopup(b.getPopoutText(r.name));s.setStyle({color:r.color,fillColor:r.color}),s.addTo(g[r.name])});var l=L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw",{id:"mapbox.streets",attribution:"Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery \xA9 <a href=\"http://mapbox.com\">Mapbox</a>"}),m=L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png",{attribution:"&copy; <a href=\"http://osm.org/copyright\">OpenStreetMap</a> contributors"});this.map=L.map("map",{layers:[m,g.A,g.B,g.C,g.D,g.E,g.F]}).setView(d,c);var q=L.control.groupedLayers({Standardowa:l,Pełna:m},{"Wszystkie Kampusy":g,"Inne warstwy":f},{collapsed:!0,groupCheckboxes:!0});this.map.addControl(q),L.control.locate().addTo(this.map),L.control.fullscreen({position:"topleft",forceSeparateButton:!0,forcePseudoFullscreen:!0,fullscreenElement:!1}).addTo(this.map),this.map.on("enterFullscreen",b.enterFullscreen),this.map.on("exitFullscreen",b.exitFullscreen),b.setAllCampusesSelected()}return _createClass(b,[{key:"setCenter",value:function setCenter(c){this.map.panTo(new L.LatLng(c[0],c[1]))}},{key:"resizeMap",value:function resizeMap(){this.map.invalidateSize()}}],[{key:"enterFullscreen",value:function enterFullscreen(){view.mapElement.style.top="0"}},{key:"exitFullscreen",value:function exitFullscreen(){view.mapElement.style.top="64px"}},{key:"setAllCampusesSelected",value:function setAllCampusesSelected(){document.getElementsByClassName("leaflet-control-layers-group-selector")[0].checked=!0}},{key:"getPopoutText",value:function getPopoutText(c){return"Kampus "+c}}]),b}();function init(){JSONHelper.loadJSON("json/categories.json",function(f){JSONHelper.loadJSON("json/places.json",function(g){JSONHelper.loadJSON("json/buildings.json",function(h){JSONHelper.loadJSON("json/campuses.json",function(j){data=new Data(h,f,g,j),view=new View,data.preparePrintCategories(),view.updateMapSize(),QueryHelper.getQueryURL()},function(j){return console.error(j)})},function(h){return console.error(h)})},function(g){return console.error(g)})},function(f){return console.error(f)})}init();