import React from 'react';
import './App.css';

function Button(props) {
  return <button onClick={props.onClick}>{props.text}</button>;
}

function Temp(props) {
  const convertToF = (k) => (k - 273.15) * 9 / 5 + 32;
  const convertToC = (k) => k - 273.15;

  let convertedTemp, unit;

  if (props.units === "imperial") {
    convertedTemp = Math.round(convertToF(props.temp))
    unit = "F"
  } else {
    convertedTemp = Math.round(convertToC(props.temp))
    unit = "C"
  }

  return (
    <p>{convertedTemp} &deg;{unit}</p>
  )

}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      zip: null,
      city: null,
      units: "imperial",
      weatherData: null,
    }
    this.key = "09040523d49139cfae82b17a00c7ec08"
  }

  getWithLocation() {
    navigator.geolocation.getCurrentPosition((position) => {
      fetch("http://api.openweathermap.org/geo/1.0/reverse?lat=" + position.coords.latitude + "&lon=" + position.coords.longitude + "&limit=1&appid=" + this.key)
      .then(response => response.json())
      .then(res => this.getWeather(res[0]))
    })
  }

  getWithZip() {
    let zip = document.querySelector("#getwzip").value;
    fetch("https://api.openweathermap.org/geo/1.0/zip?zip=" + zip + "&appid=" + this.key)
      .then(response => response.json())
      .then(res => this.getWeather(res));
  }

  getWithCity() {
    let city = document.querySelector("#getwcity").value;
    fetch("http://api.openweathermap.org/geo/1.0/direct?q=" + city + "&appid=" + this.key)
    .then(response => response.json())
    .then(res => this.getWeather(res[0]));
  }

  getWeather(res) {
    fetch("https://api.openweathermap.org/data/2.5/onecall?lat=" + res.lat + "&lon=" + res.lon + "&appid=" + this.key)
    .then(response => response.json())
    .then(data => this.setState({
      city: res.name,
      weatherData: data,
    }));
  }
  
  changeUnits() {
    if (this.state.units === "imperial") {
      this.setState({
        units: "metric"
      })
    } else {
      this.setState({
        units: "imperial"
      })
    }
  }

  render() {
    return (
      <div className="App">
        <div className="input">
          <Button onClick={() => this.getWithLocation()} text="Use My Location" />
          <br/>
          <input id="getwzip" type="text" aria-label="zip code input" placeholder="Zip Code" />
          <Button onClick={() => this.getWithZip()} text="Use My Zip" />
          <br/>
          <input id="getwcity" type="text" aria-label="city name input" placeholder="City Name" />
          <Button onClick={() => this.getWithCity()} text="Use My City" />
          <br/>
          <Button onClick={() => this.changeUnits()} text="Change Units" />
        </div>
        <div className="info">
          {this.state.weatherData && <Temp temp={this.state.weatherData.current.temp} units={this.state.units} />}
        </div>
      </div>
    );
  }
}

export default App;
