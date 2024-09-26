const searchButton = document.querySelector(".search")
const weatherCardDiv = document.querySelector(".weather-cards")
const currentWeatherDiv = document.querySelector(".current-weather")
const locationButton = document.querySelector(".location")
const back = document.querySelector("#back-arrow")
const input_val = document.querySelector('.city-input')

//----to toggle the visibility-------------------------
const inputForm = document.querySelector(".input-form");
const weatherDataSection = document.querySelector(".weather-data");
//------------------------------------------------------

const API_KEY = "2a2825140e2a6e73d1d8b6003f582936";

const createWeatherCard = (cityName, weatherItem, index) => {

    if (index === 0) {
        return `<div class="details">
                    <h2>${cityName}</h2>
                    <h2>(${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature: ${((weatherItem.main.temp_max) - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`
    }
    else {
        return `         <li class="cards">
                                <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                                <h4>${(weatherItem.weather[0].description).toUpperCase()}</h4>
                                <h4>Temp: ${((weatherItem.main.temp_max) - 273.15).toFixed(2)}°C</h4>
                                <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                                <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                            </li>`
    }
}


const getWeatherDetails = (cityName, lat, lon) => {
    const weatherApiUrl = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;


    fetch(weatherApiUrl)
        .then(res => res.json())
        .then((data) => {

            const uniqueForecastDays = [];
            //filter the forecast to get only one forecast per day
            const fiveDayForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.
                    dt_txt).getDate();

                if (!uniqueForecastDays.includes(forecastDate)) {
                    return uniqueForecastDays.push(forecastDate)
                }

            })


            //clearing previous weather data
            cityName.value = ""
            weatherCardDiv.innerHTML = ""
            currentWeatherDiv.innerHTML = ""


            console.log(fiveDayForecast)

            fiveDayForecast.forEach((weatherItem, index) => {
                //adding forecast cards
                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index))
                }
                else {
                    weatherCardDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index))
                }
            })

            // Hide the input form and show the weather data section
            inputForm.style.display = 'none';
            weatherDataSection.style.display = 'block';
        })
        .catch((error) => {
            alert(`An error occured while fetching the weather forecast ${error}`)
        });
}

const getCityCoordinates = (e) => {
    e.preventDefault()
    const cityName = (document.querySelector(".city-input").value).trim();
    if (!cityName) return;
    // console.log(cityName);

    //this api return the name latitude and longitude of the entered cityname
    const getLocationUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;


    //get entered city coordinates from the Api response
    fetch(getLocationUrl).then((response) => {
        return response.json();
    })
        .then((data) => {
            // console.log(data)
            if (!data.length) return alert(`No Coordinates found for ${cityName}`)

            const lat = data[0].lat;
            const lon = data[0].lon;
            const name = data[0].name
            // console.log(name,lat,lon)
            getWeatherDetails(name, lat, lon);
        })
        .catch((error) => {
            alert(`An error occured while fetching the coordinates ${error}`)
        })
}

searchButton.addEventListener('click', getCityCoordinates)


//-------------------------------location using device location---------------


const getUserCoordinates = (e) => {
    e.preventDefault()
   
    navigator.geolocation.getCurrentPosition((position) => {
        // console.log(position)
        setTimeout(() => {
            const { latitude, longitude } = position.coords;
            const get_name_usingCoords = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`

            fetch(get_name_usingCoords)
                .then(response => response.json())
                .then(data => {
                    console.log(data)
                    getWeatherDetails(data[0].name, latitude, longitude)
                })
                .catch(error => {
                    console.log(`Error while getting the name using coordinates : ${error}`)
                })
        }, 1000)


    }, (error) => {
        if (error.code === error.PERMISSION_DENIED) {
            alert("permission denied")
        }
    })
}


locationButton.addEventListener('click', getUserCoordinates)


//-----------------------go back to input form-------------------

back.addEventListener('click', (e) => {
    e.preventDefault();
    input_val.value = ""
    inputForm.style.display = 'block';
    weatherDataSection.style.display = 'none';
})
