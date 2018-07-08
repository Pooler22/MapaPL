import React, { Component } from 'react';
import { compose, withProps } from 'recompose';
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
  InfoWindow,
  Polygon,
} from 'react-google-maps';

export const MyMapComponent = compose(
  withProps(props => ({
    googleMapURL:
      'https://maps.googleapis.com/maps/api/js?v=3.exp&key=AIzaSyCapXeQpDbR-lLk-6bw5cHTkTNnhd1NMyo&libraries=geometry,drawing,places',
    loadingElement: <div style={{ height: `100%`, width: `100%` }} />,
    containerElement: (
      <div
        style={{
          height: `100%`,
          width: `100%`,
          paddingBottom: `64px`,
          paddingLeft: `${props.drawerWidth}px`,
        }}
      />
    ),
    mapElement: <div style={{ height: `100%`, width: `100%` }} />,
  })),
  withScriptjs,
  withGoogleMap
)(({ selectedPlace, selectedBuildings }) => (
  <GoogleMap
    defaultZoom={16}
    defaultCenter={{ lat: 51.749845, lng: 19.45318 }}
    center={
      selectedBuildings
        ? {
            lat: selectedBuildings[0].latLng[0],
            lng: selectedBuildings[0].latLng[1],
          }
        : { lat: 51.749845, lng: 19.45318 }
    }
  >
    {selectedBuildings !== null &&
      selectedBuildings.map(building => (
        <React.Fragment>
          <MyMarker
            key={building.id}
            building={building}
            selectedPlace={selectedPlace}
          />
          <Polygon
            paths={[building.coordinates.map(([lng, lat]) => ({ lat, lng }))]}
            options={{
              fillColor: `red`,
              fillOpacity: 0.2,
              strokeColor: `red`,
              strokeOpacity: 1,
              strokeWeight: 1,
            }}
          />
        </React.Fragment>
      ))}
  </GoogleMap>
));

class MyMarker extends Component {
  constructor(props) {
    super(props);
    this.state = { visibleInfo: false };

    this.toggleInfo = this.toggleInfo.bind();
  }

  toggleInfo = () => {
    this.setState({ visibleInfo: !this.state.visibleInfo });
  };

  render() {
    const { building, selectedPlace } = this.props;
    const { visibleInfo } = this.state;
    const [lat, lng] = building.latLng;

    return (
      <Marker position={{ lat, lng }} onClick={this.toggleInfo}>
        {visibleInfo && (
          <InfoWindow onCloseClick={this.toggleInfo}>
            <div>
              {!!selectedPlace.name && <p>{selectedPlace.name}</p>}
              {!!selectedPlace.website && (
                <a href={selectedPlace.website}>{selectedPlace.website}</a>
              )}
              {!!building.name && <p>{building.name}</p>}
              {!!building.address && <p>{building.address}</p>}
            </div>
          </InfoWindow>
        )}
      </Marker>
    );
  }
}
