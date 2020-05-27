import React, { Component } from "react";
import { StyleSheet, Text, View, Alert, Button, TextInput } from "react-native";
import { Permissions } from "expo";
import MapView, { Marker } from "react-native-maps";
import { db } from "./firebase";
import email from "react-native-email";

export default class App extends Component {
  state = {
    title: "Mi ubicacion",
    hideMap: true,
    hideMarkers: true,
    longitud: null,
    latitud: null,
    locations: [],
    userName: "",
    secuencia: "",
  };

  componentDidMount() {
    // this._enableGPS();
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
      let locations = [];
      element.forEach((item) => {
        locations.push(item.val());
      });

      this.setState({ locations });
    });
  }

  _enableGPS = async () => {
    const { status } = await Permissions.askAsync(Permissions.LOCATION);

    if (status !== "granted") {
      console.log("Sin permiso");
    }
  };

  handleText = (text) => {
    this.setState({ userName: text });
  };

  geo = () => {
    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        const longitud = posicion.coords.longitude;
        const latitud = posicion.coords.latitude;

        this.setState({
          longitud,
          latitud,
          hideMap: false,
          title: "Refrescar Ubicación",
        });
      },
      (error) => Alert(error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  shareLocation = () => {
    if (this.state.userName === "") {
      alert("Ingrese un nombre de usuario");
    } else {
      db.ref("/locations")
        .push({
          id: this.state.secuencia,
          message: this.state.userName,
          currentLocation: {
            latitude: this.state.latitud,
            longitude: this.state.longitud,
          },
        })
        .then(
          this.setState({ hideMarkers: false }),
          alert("Ubicación compartida con éxito")
        )
        .catch((error) => {
          console.log(error);
        });
    }
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
      <View style={estilos.contenedor}>
        <Button title={this.state.title} onPress={this.geo} />
        {this.state.hideMap ? null : (
          <View style={estilos.map}>
            <View style={estilos.header}>
              <Text style={estilos.text1}>Latitud: {this.state.latitud}</Text>
              <Text style={estilos.text1}>Longitud: {this.state.longitud}</Text>
              <Button
                title="Enviar ubicación al Correo"
                onPress={this.handleEmail}
              />
            </View>
            <View
              style={{
                marginHorizontal: 25,
                flexDirection: "row",
              }}
            >
              <TextInput
                placeholder="username"
                underlineColorAndroid="transparent"
                style={{
                  height: 40,
                  width: "50%",
                  borderColor: "gray",
                  borderWidth: 1,
                  padding: 5,
                }}
                keyboardType={"default"}
                onChangeText={this.handleText}
              />
              <Button
                title="Compartir Ubicación"
                onPress={this.shareLocation}
              />
            </View>
            <MapView
              style={estilos.map1}
              region={{
                latitude: this.state.latitud,
                longitude: this.state.longitud,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              {/* <Marker
                coordinate={{
                  latitude: this.state.latitud,
                  longitude: this.state.longitud,
                }}
                title="Mi Ubicación Actual"
              /> */}
              {this.state.hideMarkers
                ? null
                : this.state.locations.map((item) => (
                    <Marker
                      key={item.id}
                      coordinate={item.currentLocation}
                      title={item.message}
                    />
                  ))}
            </MapView>
          </View>
        )}
      </View>
    );
  }
}

const estilos = StyleSheet.create({
  contenedor: {
    marginTop: 125,
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },
  header: {
    width: "100%",
    padding: 25,
  },
  text: {
    fontSize: 20,
    textAlign: "center",
    padding: 10,
    margin: 10,
    borderRadius: 10,
    backgroundColor: "blue",
    color: "white",
  },
  text1: {
    fontSize: 15,
    textAlign: "center",
    margin: 10,
    color: "red",
  },
  map: {
    height: "100%",
    width: "100%",
    position: "relative",
  },
  map1: {
    flex: 1,
    height: 400,
    width: "100%",
  },
});
