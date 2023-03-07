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
    console.log('darkmode true');
    document.documentElement.setAttribute('data-bs-theme', 'dark');
  } else {
    console.log('darkmode false');
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
 * @author Catrina
 * @param userSettings - current settings made by user
 */
const saveSettings = (userSettings) => {
  localStorage.setItem('settings', JSON.stringify(userSettings));
};

/**
 * Load user's settings from local storage
 *
 * @author Catrina
 */
const loadSettings = () => {
  //check that settings exists in localStorage and the settings are in JSON format
  if (checkIfJSON(localStorage.getItem('settings'))) {
    const tmpSettings = JSON.parse(localStorage.getItem('settings'));
    settings = {
      lang: tmpSettings.lang ? tmpSettings.lang : 'fi',
      campus: tmpSettings.campus ? tmpSettings.campus : 'Arabia',
      darkmode:
        typeof tmpSettings.darkmode === 'boolean'
          ? tmpSettings.darkmode
          : false,
      departures:
        typeof tmpSettings.departures === 'number' ? tmpSettings.departures : 1,
    };
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
  sloganParagraphEl.innerHTML =
    settings.lang === 'fi'
      ? 'Tiedotteet, ruokalistat ja joukkoliikenne helposti'
      : 'Find announcements, menus and public transportation easily';
  AnnouncementRender.renderAnnouncements(announcements, settings.lang);
  MenuRender.renderMenuSection(menu);
  HSLRender.renderRouteInfo(routes);
};

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

darkModeBtn.addEventListener('click', () => {
  settings.darkmode = settings.darkmode ? false : true;
  changeUIMode();
  saveSettings(settings);
});

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

/**
 * App initialization.
 */
const init = async () => {
  loadSettings();
  console.log('settings', settings);
  changeUIMode();
  updateData;
  menu = await MenuRender.getMenu(settings.campus, campuses);
  routes = await HSLRender.getRoutes(settings.campus, campuses);
  weather = await WeatherRender.getWeather(settings.campus, campuses);
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
  WeatherRender.renderWeather(weather);
  HSLRender.renderMap(routes, settings.campus, campuses);
  ServiceWorker.register();
};

init();

export default settings;
