/**
 * @author Kerttu
 */
'use strict';

import './styles/style.scss';
import 'bootstrap';
import ServiceWorker from './assets/modules/service-worker';
import NavRender from './assets/modules/navigation-render';
import MenuRender from './assets/modules/menu-render';
import HSLRender from './assets/modules/hsl-render';
import Announcement from './assets/modules/announcement-data';
import AnnouncementRender from './assets/modules/announcement-render';

// Select language and select campus node elements
const selectLangEl = document.querySelector('#select-lang');
const selectCampusEl = document.querySelector('#select-campus');
// All links in navigation
const navLinks = document.querySelectorAll('.nav-link');
// All sections
const sections = document.querySelectorAll('section');
// Metropolia's campuses and needed info
const campuses = [
  {
    name: 'Arabia',
    city: 'Helsinki',
    restaurant: {id: 1251, chain: 'Food & Co'},
    location: {lat: 60.2100515020518, lon: 24.97677582883559},
    routesRadius: 400,
  },
  {
    name: 'Karaportti',
    city: 'Espoo',
    restaurant: {id: 3208, chain: 'Food & Co'},
    location: {lat: 60.22412908302269, lon: 24.7584602544428},
    routesRadius: 450,
  },
  {
    name: 'Myllypuro',
    city: 'Helsinki',
    restaurant: {id: 158, chain: 'Sodexo'},
    location: {lat: 60.223621756949434, lon: 25.077913869785164},
    routesRadius: 400,
  },
  {
    name: 'Myyrmäki',
    city: 'Vantaa',
    restaurant: {id: 152, chain: 'Sodexo'},
    location: {lat: 60.258843352326785, lon: 24.84484968512866},
    routesRadius: 300,
  },
];

// User settings
let settings = {
  lang: 'fi',
  campus: 'Karaportti',
  darkmode: false,
  departures: 1,
};

// To store menu, routes, weather and announcements
let menu;
let routes;
let weather;
let announcements;

/**
 * Stores user's settings into local storage
 * @author Catrina
 * @param userSettings - current settings made by user
 */
// eslint-disable-next-line no-unused-vars
const saveSettings = (userSettings) => {
  localStorage.setItem('settings', JSON.stringify(userSettings));
};

/**
 * Load user's settings from local storage
 * TODO: make sure this one executes first?
 * @author Catrina
 */
const loadSettings = () => {
  //check that settings exists in localStorage
  if (localStorage.getItem('settings')) {
    settings = JSON.parse(localStorage.getItem('settings'));
  }
};

/**
 * Change UI language between 'fi' and 'en'
 *
 * @author Kerttu
 */
const changeLang = (selectedLang) => {
  settings.lang = selectedLang;
  NavRender.renderNav(
    settings.lang,
    settings.campus,
    selectLangEl,
    selectCampusEl
  );
  AnnouncementRender.renderAnnouncements(announcements, settings.lang);
  MenuRender.renderMenuSection(menu);
  HSLRender.renderRouteInfo(routes);
};

const changeLocation = async (selectedLocation) => {
  settings.campus = selectedLocation;
  menu = await MenuRender.getMenu(settings.campus, campuses);
  routes = await HSLRender.getRoutes(settings.campus, campuses);
  weather = await getWeather(settings.campus, campuses);
  MenuRender.renderMenuSection(menu);
  HSLRender.renderRouteInfo(routes);
  HSLRender.renderMap(routes, settings.campus, campuses);
  renderWeather(weather);
};

/**
 * Get current weather from the selected campus' city
 *
 * @author Catrina
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
 * @author Catrina
 * @param weather - current weather
 */
const renderWeather = async (weather) => {
  const weatherImg = document.querySelector('.weather-img');
  const weatherCaption = document.querySelector('.weather-degree');

  //insert img and alt txt (in english) TODO: translate current condition text into finnish?
  weatherImg.src = weather.current.condition.icon;
  weatherImg.alt = weather.current.condition.text;
  //current weather
  weatherCaption.textContent = weather.current.temp_c + ' °C ';
};

// When window scrolls
window.addEventListener('scroll', () =>
  NavRender.changeActiveStateOnNavLinksWhenScrolling(navLinks, sections)
);

selectLangEl.addEventListener('change', () => {
  changeLang(selectLangEl.value);
  //save settings
  saveSettings(settings);
});

selectCampusEl.addEventListener('change', () => {
  changeLocation(selectCampusEl.value);
  saveSettings(settings);
});

// Updates HSL routes data every minute
const updateRoutes = setInterval(async () => {
  routes = await HSLRender.getRoutes(settings.campus, campuses);
  HSLRender.renderRouteInfo(routes);
  renderWeather(weather);
  HSLRender.renderMap(routes, settings.campus, campuses);
}, 60000);

/**
 * App initialization.
 */
const init = async () => {
  loadSettings();
  updateRoutes;
  menu = await MenuRender.getMenu(settings.campus, campuses);
  routes = await HSLRender.getRoutes(settings.campus, campuses);
  weather = await getWeather(settings.campus, campuses);
  announcements = await Announcement.getAnnouncements();
  NavRender.renderNav(
    settings.lang,
    settings.campus,
    selectLangEl,
    selectCampusEl
  );
  AnnouncementRender.renderAnnouncements(announcements, settings.lang);
  MenuRender.renderMenuSection(menu);
  HSLRender.renderRouteInfo(routes);
  renderWeather(weather);
  HSLRender.renderMap(routes, settings.campus, campuses);
  ServiceWorker.register();
};

init();

export default settings;
