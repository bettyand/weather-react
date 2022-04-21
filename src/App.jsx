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
    <>{convertedTemp} &deg;{unit}</>
  )
}

function DisplayData(props) {
  const { data } = props;
  const { current, daily } = data;

  const dateTime = new Date(current.dt * 1000).toLocaleString();
  const sunrise = new Date(current.sunrise * 1000).toLocaleTimeString();
  const sunset = new Date(current.sunset * 1000).toLocaleTimeString();
  const windDir = (degrees) =>  {
    const directions = ['↑ N', '↗ NE', '→ E', '↘ SE', '↓ S', '↙ SW', '← W', '↖ NW'];
    return directions[Math.round(degrees / 45) % 8];
  }
  const windSpeed = (speed) => {
    if (props.units === "imperial") {
      return Math.round(speed * 2.23694);
    } else {
      return Math.round(speed);
    }
  }
  let windUnits;
  if (props.units === "imperial") {
    windUnits = "mph";
  } else {
    windUnits = "m/s";
  }

  const icon = `https://openweathermap.org/img/wn/${current.weather[0].icon}.png`;
  
  return (
    <div className="displayData">
      <h1>Weather in {props.city}</h1>
      <h2>{dateTime}</h2>
      <div className="currtemp">
        <p className="bigtemp"><Temp temp={data.current.temp} units={props.units}/></p>
        <p>Feels Like <Temp temp={current.feels_like}  units={props.units}/></p>
      </div>
      <div className="cond">
      <img id="cond-icon" src={icon} alt="" />
        <p id="cond-descrip">{current.weather[0].main}</p>
      </div>
      <div className="hilo">
        <p>High: <Temp temp={daily[0].temp.max}  units={props.units}/></p>
        <p>Low: <Temp temp={daily[0].temp.min}  units={props.units}/></p>
      </div>
      <p>Humidity: {current.humidity}%</p>
      <p>{windSpeed(current.wind_speed)}{windUnits} winds from the {windDir(current.wind_deg)}</p>
      <div className="sun">
        <p>Sunrise at {sunrise}</p>
        <p>Sunset at {sunset}</p>
      </div>
    </div>
  )
}

function FutureDay(props) {
  const { today } = props;

  const date = new Date(today.dt * 1000).toLocaleDateString();

  const icon = today.weather[0].icon;
  const iconURL = `https://openweathermap.org/img/wn/${icon}.png`;

  return (
  <div className="extend1">
    <p>{date}</p>
    <img src={iconURL} alt=""/>
    <p><Temp temp={today.temp.max} units={props.units}/> / <Temp temp={today.temp.min} units={props.units}/></p>
    <p>Feels Like <Temp temp={today.feels_like.day} units={props.units} /></p>
  </div>
  )
}

function ExtendedForecast(props) {
  const { daily } = props;

  return (
    <div className="extend3">
      <FutureDay today={daily[1]} units={props.units} />
      <hr />
      <FutureDay today={daily[2]} units={props.units} />
      <hr />
      <FutureDay today={daily[3]} units={props.units} />
    </div>
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
      extended: false,
    }
    this.key = "09040523d49139cfae82b17a00c7ec08"
  }

  getWithLocation() {
    navigator.geolocation.getCurrentPosition((position) => {
      fetch("https://api.openweathermap.org/geo/1.0/reverse?lat=" + position.coords.latitude + "&lon=" + position.coords.longitude + "&limit=1&appid=" + this.key)
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
    fetch("https://api.openweathermap.org/geo/1.0/direct?q=" + city + "&appid=" + this.key)
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

  showExtended() {
    this.setState({
      extended: true,
    })
  }

  render() {
    return (
      <div className="App">
        <div className="main">
          {!this.state.weatherData && <h2>How should I retrieve your weather?</h2>}
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
          {this.state.weatherData && <DisplayData units={this.state.units} city={this.state.city} data={this.state.weatherData} />}
        </div>
        <div>
          {this.state.weatherData && <ExtendedForecast daily={this.state.weatherData.daily} units={this.state.units}/>}
        </div>
      </div>
    );
  }
}

export default App;
