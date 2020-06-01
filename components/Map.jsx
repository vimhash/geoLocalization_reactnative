import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { db } from "./firebase";
import email from "react-native-email";
import Constants from "expo-constants";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";

export default class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hideMarkers: true,
      latitud: "",
      longitud: "",
      getLocations: [],
    };
  }

  render() {
    return (
      <MapView
        style={estilos.map1}
        initialRegion={{
          latitude: this.state.latitud,
          longitude: this.state.longitud,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {this.state.hideMarkers
          ? null
          : this.state.getLocations.map((item) => (
              <Marker
                key={item.id}
                coordinate={item.currentLocation}
                title={item.message}
              />
            ))}
      </MapView>
    );
  }
}

const estilos = StyleSheet.create({
  mapcontainer: {
    flex: 3,
    width: "100%",
  },
  map1: {
    height: "100%",
    width: "100%",
  },
});
