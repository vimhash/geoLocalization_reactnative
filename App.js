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

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hideMarkers: true,
      hideApp: true,
      hideError: true,
      hideCoords: true,
      loading: "Cargando ...",
      latitud: "",
      longitud: "",
      getLocations: [],
      userName: "",
      secuencia: "",
      location: null,
      errorMessage: null,
    };
  }

  componentDidMount() {
    if (Platform.OS === "android" && !Constants.isDevice) {
      this.setState({
        errorMessage: "Oops, GPS no funciona en un emulador de Android",
        hideError: false,
      });
    } else {
      this._getLocationAsync();
      db.ref("locations").on("value", (element) => {
        let locations = [];
        let id = [];
        element.forEach((item) => {
          locations.push(item.val());
        });
        locations.map((element) => id.push(element.id));
        id.reverse();
        this.setState({ secuencia: id[0] + 1 });
      });
      db.ref("locations").on("value", (element) => {
        let getLocations = [];
        element.forEach((item) => {
          getLocations.push(item.val());
        });

        this.setState({ getLocations });
      });
    }
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== "granted") {
      this.setState({
        errorMessage: "Permiso de localización denegado",
        hideError: false,
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    this.setState({ location, hideApp: false, loading: "" });
  };

  handleText = (text) => {
    this.setState({ userName: text });
  };

  realTimeLocation = () => {
    setInterval(() => {
      this.geo();
    }, 1000);
  };

  geo = () => {
    this._getLocationAsync();
    const longitud = this.state.location.coords.longitude;
    const latitud = this.state.location.coords.latitude;

    this.setState({
      longitud,
      latitud,
      hideCoords: false,
    });
  };

  saveData = () => {
    if (
      (this.state.userName === "",
      this.state.latitud === "",
      this.state.longitud === "")
    ) {
      alert("Ingrese su nombre antes de continuar");
    } else {
      db.ref("locations/" + this.state.userName + "_location")
        .set({
          id: this.state.secuencia,
          message: this.state.userName,
          currentLocation: {
            latitude: this.state.latitud,
            longitude: this.state.longitud,
          },
        })
        .then(this.setState({ hideMarkers: false }, this.updateData()))
        .catch((error) => {
          console.log(error);
        });
    }
  };

  updateData = () => {
    setInterval(() => {
      db.ref("locations/" + this.state.userName + "_location")
        .update({
          currentLocation: {
            latitude: this.state.latitud,
            longitude: this.state.longitud,
          },
        })
        .then(this.setState({ hideMarkers: false }))
        .catch((error) => {
          console.log(error);
        });
    }, 5000);
  };

  handleEmail = () => {
    const to = [];
    email(to, {
      subject: `Ubicación`,
      body: `Ubicación registrada a las ${this.date()}. <br>
      Latitud: ${this.state.latitud} <br>
      Longitud: ${this.state.longitud}`,
    }).catch(console.error);
  };

  date = () => {
    var date = new Date();
    var minutes = date.getMinutes();
    var hour = date.getHours();
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();
    return `${year}/${month}/${day} ${hour}:${minutes}`;
  };

  render() {
    return (
      <View style={estilos.screen}>
        {this.state.hideApp ? (
          <Text
            style={{
              color: "green",
              fontSize: 50,
            }}
          >
            {this.state.loading}
          </Text>
        ) : (
          <View
            style={{
              height: "100%",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <View style={{ marginTop: 50, flex: 1 }}>
              {this.state.hideCoords ? (
                <Button
                  title="Empezar"
                  onPress={() => this.realTimeLocation()}
                />
              ) : null}
              {this.state.hideError ? null : (
                <Text
                  style={{
                    color: "blue",
                    fontSize: 50,
                  }}
                >
                  {this.state.errorMessage}
                </Text>
              )}
              {this.state.hideCoords ? null : (
                <View style={{ flexDirection: "row" }}>
                  <View style={{ paddingVertical: 10, paddingHorizontal: 10 }}>
                    <Text>Latitud: {this.state.latitud}</Text>
                    <Text>Longitud: {this.state.longitud}</Text>
                    <View style={{ paddingVertical: 10 }}>
                      <Button
                        title="Enviar Coordenadas"
                        onPress={() => this.handleEmail()}
                      />
                    </View>
                  </View>

                  {this.state.hideMarkers ? (
                    <View
                      style={{ paddingVertical: 10, paddingHorizontal: 10 }}
                    >
                      <TextInput
                        placeholder="username"
                        underlineColorAndroid="transparent"
                        style={{
                          borderColor: "gray",
                          borderWidth: 1,
                        }}
                        onChangeText={this.handleText}
                      />
                      <View style={{ paddingVertical: 10 }}>
                        <Button
                          title="Compartir Ubicación"
                          onPress={() => this.saveData()}
                        />
                      </View>
                    </View>
                  ) : null}
                </View>
              )}
            </View>

            <View style={estilos.mapcontainer}>
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
            </View>
          </View>
        )}
      </View>
    );
  }
}

const estilos = StyleSheet.create({
  screen: {
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  mapcontainer: {
    flex: 3,
    width: "100%",
  },
  map1: {
    height: "100%",
    width: "100%",
  },
});
