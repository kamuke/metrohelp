/**
 * @author Kerttu, Eeli & Catrina
 */
'use strict';

import './styles/style.scss';
import 'bootstrap/js/dist/collapse';
import 'bootstrap/js/dist/carousel';
import 'bootstrap/js/dist/modal';
import ServiceWorker from './assets/modules/service-worker';
import NavRender from './assets/modules/navigation-render';
import MenuRender from './assets/modules/menu-render';
import HSLRender from './assets/modules/hsl-render';
import WeatherRender from './assets/modules/weather-render';
import Announcement from './assets/modules/announcement-data';
import AnnouncementRender from './assets/modules/announcement-render';

// Select language and select campus node elements
const selectLangEl = document.querySelector('#select-lang');
const selectCampusEl = document.querySelector('#select-campus');
// All links in navigation
const navLinks = document.querySelectorAll('.nav-link');
// All sections
const sections = document.querySelectorAll('section');
// Slogan paragraph in header
const sloganParagraphEl = document.querySelector('#slogan');
// Dark mode toggler button
const darkModeBtn = document.querySelector('#darkmode-btn');
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
  campus: 'Arabia',
  darkmode: false,
  departures: 1,
};
// To store menu, routes, weather and announcements
let menu;
let routes;
let weather;
let announcements;

/**
 * Change UI mode between dark and light mode.
 *
 * @author Kerttu
 */
const changeUIMode = () => {
  if (settings.darkmode) {
    document.documentElement.setAttribute('data-bs-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-bs-theme', '');
  }
};

/**
 * Check if given string is in JSON format.
 *
 * @author Kerttu
 * @param {String} str
 * @returns boolean
 */
const checkIfJSON = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Stores user's settings into local storage
 *
 * @author Catrina
 * @param userSettings - current settings made by user
 */
const saveSettings = (userSettings) => {
  localStorage.setItem('metrohelp_settings', JSON.stringify(userSettings));
};

/**
 * Load user's settings from local storage
 *
 * @author Catrina
 */
const loadSettings = () => {
  //check that settings exists in localStorage and the settings are in JSON format
  let tmp = localStorage.getItem('metrohelp_settings');
  if (tmp && checkIfJSON(tmp)) {
    tmp = JSON.parse(tmp);
    settings = {
      lang: tmp.lang ? tmp.lang : 'fi',
      campus: tmp.campus ? tmp.campus : 'Arabia',
      darkmode: typeof tmp.darkmode === 'boolean' ? tmp.darkmode : false,
      departures: typeof tmp.departures === 'number' ? tmp.departures : 1,
    };
  }
};

/**
 * Change UI language between 'fi' and 'en'
 *
 * @author Kerttu
 * @param {string} selectedLang - 'fi'/'en
 */
const changeLang = (selectedLang) => {
  settings.lang = selectedLang;
  NavRender.renderNav(
    settings.lang,
    settings.campus,
    selectLangEl,
    selectCampusEl
  );
  renderHeaderSlogan(settings.lang);
  AnnouncementRender.renderAnnouncements(announcements, settings.lang);
  MenuRender.renderMenuSection(menu);
  HSLRender.renderRouteInfo(routes);
};

/**
 * Change location and render data from it
 *
 * @author Eeli
 * @param {string} selectedLocation - Selected campus
 */
const changeLocation = async (selectedLocation) => {
  settings.campus = selectedLocation;
  menu = await MenuRender.getMenu(settings.campus, campuses);
  routes = await HSLRender.getRoutes(settings.campus, campuses);
  weather = await WeatherRender.getWeather(settings.campus, campuses);
  MenuRender.renderMenuSection(menu);
  HSLRender.renderRouteInfo(routes);
  HSLRender.renderMap(routes, settings.campus, campuses);
  WeatherRender.renderWeather(weather);
};

/**
 * Updates HSL routes and weather data every minute
 *
 * @author Eeli
 */
const updateData = setInterval(async () => {
  routes = await HSLRender.getRoutes(settings.campus, campuses);
  weather = await WeatherRender.getWeather(settings.campus, campuses);
  HSLRender.renderRouteInfo(routes);
  WeatherRender.renderWeather(weather);
  HSLRender.renderMap(routes, settings.campus, campuses);
}, 60000);

window.addEventListener('scroll', () =>
  NavRender.changeActiveStateOnNavLinksWhenScrolling(navLinks, sections)
);

/**
 * Render header's slogan according to selected language.
 *
 * @author Kerttu
 * @param {String} selectedLang - 'fi'/'en'
 */
const renderHeaderSlogan = (selectedLang) => {
  sloganParagraphEl.innerHTML =
    selectedLang === 'fi'
      ? 'Tiedotteet, ruokalistat ja joukkoliikenne helposti'
      : 'Find announcements, menus and public transportation easily';
};

selectLangEl.addEventListener('change', () => {
  changeLang(selectLangEl.value);
  //save settings
  saveSettings(settings);
});

selectCampusEl.addEventListener('change', () => {
  changeLocation(selectCampusEl.value);
  saveSettings(settings);
});

darkModeBtn.addEventListener('click', () => {
  settings.darkmode = settings.darkmode ? false : true;
  changeUIMode();
  saveSettings(settings);
});

/**
 * App initialization.
 */
const init = async () => {
  ServiceWorker.register();
  loadSettings();
  changeUIMode();
  updateData;
  menu = await MenuRender.getMenu(settings.campus, campuses);
  routes = await HSLRender.getRoutes(settings.campus, campuses);
  weather = await WeatherRender.getWeather(settings.campus, campuses);
  announcements = await Announcement.getAnnouncements();
  renderHeaderSlogan();
  renderHeaderSlogan(settings.lang);
  NavRender.renderNav(
    settings.lang,
    settings.campus,
    selectLangEl,
    selectCampusEl
  );
  AnnouncementRender.renderAnnouncements(announcements, settings.lang);
  MenuRender.renderMenuSection(menu);
  HSLRender.renderRouteInfo(routes);
  WeatherRender.renderWeather(weather);
  HSLRender.renderMap(routes, settings.campus, campuses);
};

init();

export default settings;
