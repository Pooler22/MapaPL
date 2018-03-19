'use strict';
var _createClass = (function() {
  function b(c, d) {
    for (var g, f = 0; f < d.length; f++)
      (g = d[f]),
        (g.enumerable = g.enumerable || !1),
        (g.configurable = !0),
        'value' in g && (g.writable = !0),
        Object.defineProperty(c, g.key, g);
  }
  return function(c, d, f) {
    return d && b(c.prototype, d), f && b(c, f), c;
  };
})();
function _classCallCheck(b, c) {
  if (!(b instanceof c))
    throw new TypeError('Cannot call a class as a function');
}
var view,
  data,
  mapApi = void 0,
  map,
  markers = [],
  JSONHelper = (function() {
    function b() {
      _classCallCheck(this, b);
    }
    return (
      _createClass(b, null, [
        {
          key: 'loadJSON',
          value: function loadJSON(c, d, f) {
            var g = new XMLHttpRequest();
            (g.onreadystatechange = function() {
              g.readyState === XMLHttpRequest.DONE &&
                (200 === g.status
                  ? d && d(JSON.parse(g.responseText))
                  : f && f(g));
            }),
              g.open('GET', c, !0),
              g.send();
          },
        },
      ]),
      b
    );
  })(),
  QueryHelper = (function() {
    function b() {
      _classCallCheck(this, b);
    }
    return (
      _createClass(b, null, [
        {
          key: 'decodeQueryString',
          value: function decodeQueryString() {
            var c = {};
            return (
              window.location.search
                .substring(1)
                .split('&')
                .forEach(function(d) {
                  var f = d.split('=');
                  'undefined' == typeof c[f[0]]
                    ? (c[f[0]] = decodeURIComponent(f[1]))
                    : 'string' == typeof c[f[0]]
                      ? (c[f[0]] = [c[f[0]], decodeURIComponent(f[1])])
                      : c[f[0]].push(decodeURIComponent(f[1]));
                }),
              c
            );
          },
        },
        {
          key: 'getQueryURL',
          value: function getQueryURL() {
            View.initFromQuery(b.decodeQueryString());
          },
        },
        {
          key: 'UpdateURL',
          value: function UpdateURL(c, d) {
            if ('undefined' != typeof history.pushState) {
              var f = { Title: c, Url: d };
              history.pushState(f, f.Title, f.Url);
            } else console.error('Update url');
          },
        },
      ]),
      b
    );
  })(),
  Data = (function() {
    function b(c, d, f, g) {
      _classCallCheck(this, b),
        (this.listSearched = document.getElementById('listSearched')),
        (this.listElement = document.getElementById('list')),
        (this.campuses = g),
        (this.buildings = c),
        (this.categories = d),
        (this.places = f),
        this.correctFormatBuildings(this.buildings),
        this.extendCategories(this.categories);
    }
    return (
      _createClass(
        b,
        [
          {
            key: 'correctFormatBuildings',
            value: function correctFormatBuildings(c) {
              c.forEach(function(d) {
                return (d.coordinates = b.correctFormatPolygons(d.coordinates));
              });
            },
          },
          {
            key: 'campusToColor',
            value: function campusToColor(c) {
              return data.campuses.filter(function(d) {
                return d.name[d.name.length - 1] == c;
              })[0].color;
            },
          },
          {
            key: 'extendCategories',
            value: function extendCategories(c) {
              var d = this;
              c.forEach(function(f) {
                f.places = d.places.filter(function(g) {
                  return g.category == f.id;
                });
              });
            },
          },
          {
            key: 'preparePrintCategories',
            value: function preparePrintCategories() {
              this.listElement.innerHTML =
                "<p style='margin-left:10px'>Lista miejsc:</p>" +
                (view.printCategories(this.categories) +
                  view.printBuildings(this.buildings));
            },
          },
          {
            key: 'getPlacesById',
            value: function getPlacesById(c) {
              return this.places.filter(function(d) {
                return d.id == c;
              });
            },
          },
          {
            key: 'getBuildingsById',
            value: function getBuildingsById(c) {
              return this.buildings.filter(function(d) {
                return d.id == c;
              });
            },
          },
          {
            key: 'getCoordinate',
            value: function getCoordinate(c) {
              var d = this;
              return c.split(',').map(function(f) {
                return d.getBuildingsById(f)[0].latLng;
              });
            },
          },
          {
            key: 'getPolygons',
            value: function getPolygons(c) {
              var d = this;
              return c.split(',').map(function(f) {
                return d.getBuildingsById(f)[0].coordinates;
              });
            },
          },
          {
            key: 'getColors',
            value: function getColors(c) {
              var d = this;
              return c.split(',').map(function(f) {
                return d.getBuildingsById(f)[0].campus;
              });
            },
          },
          {
            key: 'filterPlaces',
            value: function filterPlaces(c) {
              c.length
                ? ((this.listSearched.style.display = 'block'),
                  (this.listElement.style.display = 'none'),
                  this.filterList(c))
                : ((this.listSearched.style.display = 'none'),
                  (this.listElement.style.display = 'block'));
            },
          },
          {
            key: 'filterList',
            value: function filterList(c) {
              var d =
                this.getSearchResult(c, this.buildings, !1) +
                this.getSearchResult(c, this.places, !0);
              this.listSearched.innerHTML = d
                ? '<strong>Wyniki wyszukiwania</strong><ul>' + d + '</ul>'
                : '<strong>Brak wynik\xF3w</strong>';
            },
          },
          {
            key: 'getSearchResult',
            value: function getSearchResult(c, d) {
              var f =
                2 < arguments.length && void 0 !== arguments[2] && arguments[2];
              return d.reduce(function(g, h) {
                return b.isFunded(c.toLowerCase().trim(), h)
                  ? f ? g + View.prepareLink(h, !0) : g + View.prepareLink(h)
                  : g;
              }, '');
            },
          },
        ],
        [
          {
            key: 'correctFormatPolygons',
            value: function correctFormatPolygons(c) {
              return c.map(function(d) {
                var f;
                return (f = [d[1], d[0]]), (d[0] = f[0]), (d[1] = f[1]), f;
              });
            },
          },
          {
            key: 'isFunded',
            value: function isFunded(c, d) {
              var f = !1,
                g = !1;
              return (
                d.tags && (f = -1 != d.tags.toLowerCase().search(c)),
                d.short_name &&
                  (g = -1 != d.short_name.toLowerCase().search(c)),
                d.short || (d.short = ''),
                -1 != d.name.toLowerCase().search(c) ||
                  -1 != d.short.toLowerCase().search(c) ||
                  f ||
                  g
              );
            },
          },
        ]
      ),
      b
    );
  })(),
  Modal = (function() {
    function b() {
      _classCallCheck(this, b);
    }
    return (
      _createClass(b, null, [
        {
          key: 'initModal',
          value: function initModal() {
            var c = document.createElement('div');
            return (
              (c.className = 'modal'),
              (c.innerHTML =
                '<div class=\'mui-container mui-panel\'><h2>Mapa Politechniki \u0141\xF3dzkiej</h2><p>Niniejsza strona jest projektem mapy online Politechniki \u0141\xF3dzkiej.</p><p>Je\u015Bli znalaz\u0142e\u015B b\u0142\u0105d lub masz jakie\u015B sugestie napisz!. Link poni\u017Cej:</p><div class="mui-row mui--text-center"><a class="mui-btn mui-btn--primary "  href=\'https://docs.google.com/forms/d/e/1FAIpQLSdSOC7mxqPRETVWX9-24MreBA9Rsj3vltYn9lQvl2yPhFvpAw/viewform?c=0&w=1\'><i class="fa fa-envelope-o"></i> Kontakt</a></div><div class="mui-row mui--text-center"><button class="mui-btn" onclick="view.overlayOff()"><i class="fa fa-close"></i> Zamknij</button></div></div>'),
              c
            );
          },
        },
        {
          key: 'initModalInfoPlace',
          value: function initModalInfoPlace(c) {
            var d = document.createElement('div');
            return (
              (d.className = 'modal'),
              (d.innerHTML =
                "<div class='mui-container mui-panel'><h1>" +
                View.getShort(c) +
                ' ' +
                c.name +
                '</h1>' +
                (' <dl>\n                      ' +
                  View.getCategory(c) +
                  '\n                      ' +
                  View.getElementLink(c, 'website', 'Strona www') +
                  '\n                       ' +
                  View.getElement(c, 'buildings', 'Budynki') +
                  '\n                      ' +
                  View.getElement(c, 'tags', 'Tagi') +
                  '\n                  </dl><div class="mui-row mui--text-center"><button class="mui-btn" onclick="view.overlayOff()"><i class="fa fa-close"></i> Zamknij</button></div></div>')),
              d
            );
          },
        },
        {
          key: 'initModalInfoBuilding',
          value: function initModalInfoBuilding(c) {
            var d = document.createElement('div');
            return (
              (d.className = 'modal'),
              (d.innerHTML =
                "<div class='mui-container mui-panel'><h1>" +
                View.getShort(c) +
                c.name +
                '</h1>' +
                (' <dl>' +
                  View.getElement(c, 'address', 'Adres') +
                  '\n                ' +
                  View.getPlaces(c) +
                  '\n                ' +
                  View.getElement(c, 'tags', 'Tagi') +
                  '</dl><div class="mui-row mui--text-center"><button class="mui-btn" onclick="view.overlayOff()"><i class="fa fa-close"></i> Zamknij</button></div></div>')),
              d
            );
          },
        },
      ]),
      b
    );
  })(),
  View = (function() {
    function b() {
      _classCallCheck(this, b),
        (this.sidedrawerElement = document.getElementById('sidedrawer')),
        (this.mapElement = document.getElementById('map')),
        (this.modal = Modal.initModal()),
        (this.sizeMin = 768),
        (this.lastWidth = window.innerWidth),
        (this.isOpenPanel = this.lastWidth > this.sizeMin),
        window.addEventListener('resize', this.updateMapSize),
        document.addEventListener('resize', this.updateMapSize);
      mapApi = new MapsApi(16, [51.749845, 19.45318]);
    }
    return (
      _createClass(
        b,
        [
          {
            key: 'initAllPolygons',
            value: function initAllPolygons() {
              data.buildings.forEach(function(c) {
                for (
                  var d = view.prepareInfoContent(c, !1, !1), f = 0;
                  f < d.length;
                  f++
                )
                  b.drawPolygon(c.coordinates, d[f], c.campus),
                    (markers[f]._latlng = {
                      lat: c.latLng[0],
                      lng: c.latLng[1],
                    });
              });
            },
          },
          {
            key: 'printBuildings',
            value: function printBuildings(c) {
              return (
                '<strong onclick=\'View.toggleListElement(this);\'> <span><i class="fa fa-building"></i> Budynki</span>' +
                b.arrowSpan() +
                "</strong><ul style='display:none;'>" +
                c.reduce(function(d, f) {
                  return d + b.prepareLink(f);
                }, '') +
                (b.arrowSpan() + '</ul>')
              );
            },
          },
          {
            key: 'printCategories',
            value: function printCategories(c) {
              var d = this;
              return c.reduce(function(f, g) {
                return (
                  f + (g.isSubCat ? '' : '<li>' + d.printCategory(g) + '</li>')
                );
              }, '');
            },
          },
          {
            key: 'printCategory',
            value: function printCategory(c) {
              var d = '';
              return (
                (d +=
                  "<strong onclick='View.toggleListElement(this);'><i class=\"fa " +
                  c.icon +
                  '"></i> ' +
                  (c.name + b.arrowSpan()) +
                  '</strong>'),
                (d += "<ul style='display:none;'>"),
                c.subcategory
                  ? c.subcategory.split(',').map(function(f) {
                      var g = data.categories.filter(function(h) {
                        return h.id == f;
                      });
                      (g[0].isSubCat = !1),
                        (d += view.printCategories(g)),
                        (g[0].isSubCat = !0);
                    })
                  : c.places.forEach(function(f) {
                      d += b.prepareLink(f, !0);
                    }),
                (d += '</ul>'),
                d
              );
            },
          },
          {
            key: 'prepareUpdateMarker',
            value: function prepareUpdateMarker(c) {
              var d =
                1 < arguments.length && void 0 !== arguments[1] && arguments[1];
              if (d) {
                var f = data.places.filter(function(k) {
                    return k.id == c;
                  })[0],
                  g = f.building.split(',').map(function(k) {
                    return data.getBuildingsById(k)[0].coordinates;
                  }),
                  h = f.building.split(',').map(function(k) {
                    return data.getBuildingsById(k)[0].campus;
                  });
                this.updatePolygon(
                  this.prepareInfoContent(f, !0),
                  data.getCoordinate(f.building),
                  g,
                  h
                );
              } else {
                var j = data.buildings.filter(function(k) {
                  return k.id == c;
                })[0];
                this.updatePolygon(
                  this.prepareInfoContent(j, !1),
                  [j.latLng],
                  [j.coordinates],
                  j.campus
                );
              }
              mui.overlay('off');
            },
          },
          {
            key: 'cleanUpMarkers',
            value: function cleanUpMarkers() {
              markers.forEach(function(c) {
                return mapApi.map.removeLayer(c);
              }),
                (markers = []);
            },
          },
          {
            key: 'isMobile',
            value: function isMobile() {
              return window.innerWidth < this.sizeMin;
            },
          },
          {
            key: 'updatePolygon',
            value: function updatePolygon(c, d, f, g) {
              this.cleanUpMarkers();
              for (var h = 0; h < c.length; h++)
                b.drawPolygon(f[h], c[h], g[h]),
                  (markers[h]._latlng = { lat: d[h][0], lng: d[h][1] });
              markers[0].openPopup(),
                mapApi.setCenter(d[0]),
                this.isMobile() && view.closeSidedraver();
            },
          },
          {
            key: 'activateModalPlace',
            value: function activateModalPlace(c) {
              var d = data.getPlacesById(c)[0];
              this.prepareUpdateMarker(c, !0),
                1 < d.building.split(',').length &&
                  mui.overlay('on', this.palceModal(d));
            },
          },
          {
            key: 'activateModalBuilding',
            value: function activateModalBuilding(c) {
              var d = data.getBuildingsById(c)[0];
              this.prepareUpdateMarker(c, !1), b.buildingModal(d);
            },
          },
          {
            key: 'activateModalInfo',
            value: function activateModalInfo(c, d) {
              if (d) {
                var f = data.getPlacesById(c)[0];
                mui.overlay('on', Modal.initModalInfoPlace(f));
              } else {
                var g = data.getBuildingsById(c)[0];
                mui.overlay('on', Modal.initModalInfoBuilding(g));
              }
            },
          },
          {
            key: 'setMarkerCloseModal',
            value: function setMarkerCloseModal(c, d) {
              QueryHelper.UpdateURL(c.name, '?placeId=' + c.id + '&index=' + d),
                mui.overlay('off'),
                b.setMarker(d);
            },
          },
          {
            key: 'palceModal',
            value: function palceModal(c) {
              QueryHelper.UpdateURL(c.name, '?placeId=' + c.id);
              var d = c.building.split(','),
                f = -1,
                g = d.map(function() {
                  var k = d.reduce(function(l, m) {
                    var n = data.buildings.filter(function(o) {
                      return o.id == m;
                    })[0];
                    return (
                      (f += 1),
                      l +
                        ('<div class="mui-divider"></div><a href=\'javascript:view.setMarkerCloseModal(' +
                          JSON.stringify({ id: c.id, name: c.name }) +
                          ',' +
                          f +
                          ")'>" +
                          n.name +
                          '</a><br><p>' +
                          n.address +
                          '</p>')
                    );
                  }, '');
                  return (f = -1), k;
                });
              f = -1;
              var h = g.map(function(k) {
                  return (
                    (f += 1),
                    '<strong>' +
                      c.name +
                      '</strong>' +
                      ('<p>Wybierz jeden z budynk\xF3w tej jednostki:</p>' + k)
                  );
                }),
                j = document.createElement('div');
              return (
                (j.innerHTML =
                  '<div class=\'mui-container mui--text-center mui-panel\'><div class="mui--text-center">' +
                  h[0] +
                  '</div><button class="mui-btn" onclick="view.overlayOff()"><i class="fa fa-close"></i> Zamknij</button></div>'),
                (j.style.margin = '10px auto auto auto'),
                j
              );
            },
          },
          {
            key: 'activateModal',
            value: function activateModal() {
              mui.overlay('on', this.modal);
            },
          },
          {
            key: 'overlayOff',
            value: function overlayOff() {
              mui.overlay('off');
            },
          },
          {
            key: 'prepareInfoContent',
            value: function prepareInfoContent(c, d) {
              var f =
                2 < arguments.length && void 0 !== arguments[2]
                  ? arguments[2]
                  : !0;
              if (d) {
                f && QueryHelper.UpdateURL(c.name, '?placeId=' + c.id);
                var g = c.building.split(',');
                if (1 < g.length) {
                  var h = -1,
                    j = g.map(function(l) {
                      var m = g.reduce(function(n, o) {
                        var p = data.buildings.filter(function(q) {
                          return q.id == o;
                        })[0];
                        return (
                          (h += 1),
                          l == o
                            ? n
                            : n +
                              ("<li><a href='javascript:View.setMarker(" +
                                h +
                                ")'>" +
                                p.name +
                                '</a></li>')
                        );
                      }, '');
                      return (h = -1), m;
                    });
                  return (
                    (h = -1),
                    j.map(function(l) {
                      h += 1;
                      var m = data.getBuildingsById(g[h])[0];
                      return (
                        '<p><strong>' +
                        c.name +
                        '</strong>' +
                        ('<br>' + b.getAddresExt(m) + '</p>') +
                        ('Pozosta\u0142e budynki tej jednostki:<ul>' +
                          l +
                          '</ul>') +
                        ("<a href='javascript:view.activateModalInfo(" +
                          c.id +
                          ",true);'>Wi\u0119cej informacji</a>")
                      );
                    })
                  );
                }
                var k = data.getBuildingsById(+g[0])[0];
                return [
                  '<p><strong>' +
                    c.name +
                    '</strong><br>' +
                    (k.name + '<br>') +
                    ('' + b.getAddresExt(k)) +
                    ("</br><a href='javascript:view.activateModalInfo(" +
                      c.id +
                      ",true);'>Wi\u0119cej informacji</a>"),
                ];
              }
              return (
                f && QueryHelper.UpdateURL(c.name, '?buildingId=' + c.id),
                [
                  '<p><strong>' +
                    c.name +
                    '</strong><br>' +
                    ('' + b.getAddresExt(c)) +
                    ("</p><a href='javascript:view.activateModalInfo(" +
                      c.id +
                      ",false);'>Wi\u0119cej informacji</a>"),
                ]
              );
            },
          },
          {
            key: 'showSidedrawer',
            value: function showSidedrawer() {
              var c = this;
              (this.isOpenPanel = !0),
                mui
                  .overlay('on', {
                    onclose: function onclose() {
                      (c.sidedrawerElement.className = c.sidedrawerElement.className.replace(
                        ' active',
                        ''
                      )),
                        document.body.appendChild(c.sidedrawerElement),
                        (c.isOpenPanel = !1);
                    },
                  })
                  .appendChild(this.sidedrawerElement),
                setTimeout(function() {
                  return (c.sidedrawerElement.className += ' active');
                }, 20);
            },
          },
          {
            key: 'closeSidedraver',
            value: function closeSidedraver() {
              (this.isOpenPanel = !1),
                (this.sidedrawerElement.className = this.sidedrawerElement.className.replace(
                  ' ',
                  'active'
                )),
                document.body.appendChild(this.sidedrawerElement),
                mui.overlay('off'),
                this.updateMapSize();
            },
          },
          {
            key: 'toggleSidedrawer',
            value: function toggleSidedrawer() {
              'hide-sidedrawer' == document.body.className
                ? ((this.isOpenPanel = !0),
                  (document.body.className = 'show-sidedrawer'))
                : ((this.isOpenPanel = !1),
                  (document.body.className = 'hide-sidedrawer')),
                this.updateMapSize();
            },
          },
          {
            key: 'openSidedrawerExt',
            value: function openSidedrawerExt() {
              (this.isOpenPanel = !0),
                (document.body.className = 'show-sidedrawer'),
                this.updateMapSize();
            },
          },
          {
            key: 'updateMapSize',
            value: function updateMapSize() {
              var f = this;
              this.mapElement = document.getElementById('map');
              var d = 70;
              this.lastWidth > this.sizeMin &&
                mui.overlay('off', {
                  onclose: function onclose() {
                    f.isOpenPanel = !1;
                  },
                }),
                this.isOpenPanel
                  ? ((this.mapElement.style.height =
                      window.innerHeight - d + 'px'),
                    (this.mapElement.style.width =
                      window.innerWidth - 300 + 'px'))
                  : ((this.mapElement.style.height =
                      window.innerHeight - d + 'px'),
                    (this.mapElement.style.width = window.innerWidth + 'px')),
                window.innerWidth > this.sizeMin
                  ? mui.overlay('off')
                  : ((this.isOpenPanel = !1),
                    (this.mapElement.style.height =
                      window.innerHeight - d + 'px'),
                    (this.mapElement.style.width = window.innerWidth + 'px')),
                mapApi.resizeMap();
            },
          },
          {
            key: 'searchExt',
            value: function searchExt() {
              this.openSidedrawerExt(),
                window.innerWidth < this.sizeMin && this.showSidedrawer(),
                document.getElementById('search-input').focus();
            },
          },
        ],
        [
          {
            key: 'getCategory',
            value: function getCategory(c) {
              return c.category
                ? '<dt>Kategoria</dt><dd>' +
                    data.categories.filter(function(d) {
                      return (
                        d.id == c.category ||
                        void (
                          c.subcategory &&
                          c.subcategory.some(function(f) {
                            return (
                              f.id == c.category ||
                              (c.subcategory
                                ? c.subcategory.some(function(g) {
                                    return g.id == c.category;
                                  })
                                : void 0)
                            );
                          })
                        )
                      );
                    })[0].name +
                    '</dd>'
                : '';
            },
          },
          {
            key: 'getElement',
            value: function getElement(c, d, f) {
              return c[d] ? '<dt>' + f + '</dt><dd>' + c[d] + '</dd>' : '';
            },
          },
          {
            key: 'getElementLink',
            value: function getElementLink(c, d, f) {
              return c[d]
                ? '<dt>' +
                    f +
                    '</dt><dd><a href="' +
                    c[d] +
                    '" target="_blank">Strona WWW</a></dd>'
                : '';
            },
          },
          {
            key: 'getShort',
            value: function getShort(c) {
              return c.short ? c.short + ' - ' : '';
            },
          },
          {
            key: 'getPlaces',
            value: function getPlaces(c) {
              var d = data.places.filter(function(f) {
                return f.building.split(',').some(function(g) {
                  return g == c.id;
                });
              });
              return 0 < d.length
                ? '<dt>Jednostki w budynku</dt><dd>' +
                    d.reduce(function(f, g) {
                      return (
                        f +
                        ('<a href="?placeId=' +
                          g.id +
                          '">' +
                          g.name +
                          '</a><br>')
                      );
                    }, '') +
                    '</dd>'
                : '';
            },
          },
          {
            key: 'getAddresExt',
            value: function getAddresExt(c) {
              return c.address ? c.address : '';
            },
          },
          {
            key: 'prepareLink',
            value: function prepareLink(c) {
              var d =
                1 < arguments.length && void 0 !== arguments[1] && arguments[1];
              return d
                ? "<li><a href='javascript:view.activateModalPlace(" +
                    c.id +
                    ");'>" +
                    c.name +
                    '</a></li>'
                : '<li><a href=\'javascript:view.activateModalBuilding("' +
                    c.id +
                    '");\'>' +
                    c.name +
                    '</a></li>';
            },
          },
          {
            key: 'arrowSpan',
            value: function arrowSpan() {
              return '<span class="mui--pull-right mui-caret"></span>';
            },
          },
          {
            key: 'drawPolygon',
            value: function drawPolygon(c, d, f) {
              var g =
                3 < arguments.length && void 0 !== arguments[3]
                  ? arguments[3]
                  : '';
              c.url = g;
              var h = L.polygon(c)
                .addTo(mapApi.map)
                .bindPopup(d)
                .on('click', mapApi.onPolyClick);
              if (f) {
                var j = data.campusToColor(f);
                h.setStyle({
                  color: '#fff',
                  fillColor: j,
                  fillOpacity: 1,
                  opacity: 0.5,
                });
              }
              markers.push(h);
            },
          },
          {
            key: 'buildingModal',
            value: function buildingModal(c) {
              QueryHelper.UpdateURL(c.name, '?buildingId=' + c.id);
            },
          },
          {
            key: 'setMarker',
            value: function setMarker(c) {
              var d = markers[c]._latlng;
              mapApi.setCenter([d.lat, d.lng]), markers[c].openPopup();
            },
          },
          {
            key: 'toggleListElement',
            value: function toggleListElement(c) {
              var d = c.nextSibling;
              d.style.display = 'none' == d.style.display ? 'block' : 'none';
            },
          },
          {
            key: 'initFromQuery',
            value: function initFromQuery(c) {
              if (c.placeId) {
                var d = data.getPlacesById(c.placeId)[0],
                  f = data.getCoordinate(d.building),
                  g = data.getPolygons(d.building);
                if (c.index && 0 != c.index) {
                  var _ref2 = [f[0], f[c.index]];
                  (f[c.index] = _ref2[0]), (f[0] = _ref2[1]);
                  var _ref3 = [g[0], g[c.index]];
                  (g[c.index] = _ref3[0]), (g[0] = _ref3[1]);
                }
                var h = data.getColors(d.building);
                view.updatePolygon(view.prepareInfoContent(d, !0), f, g, h);
              } else if (c.buildingId) {
                var j = data.getBuildingsById(c.buildingId)[0];
                view.updatePolygon(
                  view.prepareInfoContent(j, !1),
                  [j.latLng],
                  [j.coordinates],
                  j.campus
                );
              } else view.initAllPolygons();
            },
          },
        ]
      ),
      b
    );
  })(),
  MapsApi = (function() {
    function b(c, d) {
      var k = this;
      _classCallCheck(this, b);
      var g = {};
      (g.Eduroam = new L.LayerGroup()),
        [
          'A1',
          'A2',
          'A3',
          'A4',
          'A5',
          'A10',
          'A12',
          'A27',
          'A28',
          'A33',
          'B1',
          'B2',
          'B3',
          'B6',
          'B7',
          'B9',
          'B19',
          'B22',
          'B24',
          'B25',
          'C15',
          'D1',
          'D2',
          'D3',
        ].forEach(function(v) {
          var w = data.buildings.filter(function(B) {
              return B.short == v;
            })[0],
            A = L.polygon(w.coordinates).bindPopup('Eduroam');
          A.setStyle({
            color: '#3C3F41',
            fillColor: '#3C3F41',
            fillOpacity: 0.5,
            weight: 6,
          }),
            A.addTo(g.Eduroam);
        });
      var h = {},
        j = data.campuses.map(function(v) {
          v.coordinates = Data.correctFormatPolygons(v.coordinates);
        });
      data.campuses.forEach(function(v) {
        h[v.name] = new L.LayerGroup();
        var w = L.polygon(v.coordinates).bindPopup(b.getPopoutText(v.name));
        w.on('click', k.onPolyClick),
          w.setStyle({ color: v.color, fillColor: v.color }),
          w.addTo(h[v.name]);
      });
      var n = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
          attribution:
            '&copy;<a href="https://www.google.com/intl/en_en/help/terms_maps.html">Google layer</a> &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        }),
        o = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
          attribution:
            '&copy;<a href="https://www.google.com/intl/en_en/help/terms_maps.html">Google layer</a> &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        }),
        p = L.tileLayer(
          'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw',
          {
            id: 'mapbox.streets',
            attribution:
              'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery \xA9 <a href="http://mapbox.com">Mapbox</a>',
          }
        ),
        q = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        });
      this.map = L.map('map', {
        layers: [q, h.A, h.B, h.C, h.D, h.E, h.F],
      }).setView(d, c);
      var u = L.control.groupedLayers(
        { Pełna: q, Hybrydowa: o, Satelitarna: n },
        { 'Wszystkie Kampusy': h, 'Inne warstwy': g },
        { collapsed: !0, groupCheckboxes: !0 }
      );
      this.map.addControl(u),
        L.control.locate().addTo(this.map),
        L.control
          .fullscreen({
            position: 'topleft',
            forceSeparateButton: !0,
            forcePseudoFullscreen: !0,
            fullscreenElement: !1,
          })
          .addTo(this.map),
        this.map.on('enterFullscreen', b.enterFullscreen),
        this.map.on('exitFullscreen', b.exitFullscreen),
        b.setAllCampusesSelected();
    }
    return (
      _createClass(
        b,
        [
          {
            key: 'setCenter',
            value: function setCenter(c) {
              this.map.panTo(new L.LatLng(c[0], c[1]));
            },
          },
          {
            key: 'resizeMap',
            value: function resizeMap() {
              this.map.invalidateSize();
            },
          },
          {
            key: 'onPolyClick',
            value: function onPolyClick(c) {
              console.log(c.target.options);
            },
          },
        ],
        [
          {
            key: 'enterFullscreen',
            value: function enterFullscreen() {
              view.mapElement.style.top = '0';
            },
          },
          {
            key: 'exitFullscreen',
            value: function exitFullscreen() {
              view.mapElement.style.top = '64px';
            },
          },
          {
            key: 'setAllCampusesSelected',
            value: function setAllCampusesSelected() {
              document.getElementsByClassName(
                'leaflet-control-layers-group-selector'
              )[0].checked = !0;
            },
          },
          {
            key: 'getPopoutText',
            value: function getPopoutText(c) {
              return 'Kampus ' + c;
            },
          },
        ]
      ),
      b
    );
  })();
function init() {
  JSONHelper.loadJSON(
    'json/categories.json',
    function(g) {
      JSONHelper.loadJSON(
        'json/places.json',
        function(h) {
          JSONHelper.loadJSON(
            'json/buildings.json',
            function(j) {
              JSONHelper.loadJSON(
                'json/campuses.json',
                function(k) {
                  (data = new Data(j, g, h, k)),
                    (view = new View()),
                    data.preparePrintCategories(),
                    view.updateMapSize(),
                    QueryHelper.getQueryURL();
                },
                function(k) {
                  return console.error(k);
                }
              );
            },
            function(j) {
              return console.error(j);
            }
          );
        },
        function(h) {
          return console.error(h);
        }
      );
    },
    function(g) {
      return console.error(g);
    }
  );
}
Array.prototype.forEach.call(
  document.querySelectorAll('.clearable-input>[data-clear-input]'),
  function(b) {
    b.addEventListener('click', function(c) {
      data.filterPlaces(''),
        (c.target.previousElementSibling.value = ''),
        document.getElementById('search-input').focus();
    });
  }
),
  init();
