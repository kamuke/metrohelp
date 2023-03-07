/**
 * Module for Weather data rendering
 *
 * @module WeatherRender
 * @author Catrina
 */

/**
 * Get current weather from the selected campus' city
 *
 * @param {string} selectedCampus - Selected campus to get it's city
 * @param {array} allCampuses - List of all campuses and infos.
 * @returns Selected campus' weather
 */
const getWeather = async (selectedCampus, allCampuses) => {
  for (const campus of allCampuses) {
    if (selectedCampus === campus.name) {
      try {
        //start fetch
        const response = await fetch(
          'https://api.weatherapi.com/v1/forecast.json?key=70ce88e5c2634487b5675944232702&q=' +
            campus.city +
            '&days=1&aqi=no&alerts=no'
        );
        //If error
        if (!response.ok) throw new Error('Something went wrong.');
        const weather = await response.json();
        //return weather json
        return weather;
      } catch (error) {
        console.log(error.message);
      }
    }
  }
};

/**
 * Render current weather
 *
 * @param weather - current weather
 */
const renderWeather = async (weather) => {
  const weatherImg = document.querySelector('.weather-img');
  const weatherCaption = document.querySelector('.weather-degree');

  //insert img and alt txt (in english)
  weatherImg.src = 'https:' + weather.current.condition.icon;
  weatherImg.alt = weather.current.condition.text;
  weatherImg.setAttribute('height', '35');
  weatherImg.setAttribute('width', '35');
  //current weather
  weatherCaption.textContent = weather.current.temp_c + ' °C ';
};

const WeatherRender = {getWeather, renderWeather};
export default WeatherRender;
