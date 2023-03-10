/**
 * @author Kerttu, Eeli & Catrina
 */
'use strict';

import './styles/style.scss';
import 'bootstrap/js/dist/collapse';
import 'bootstrap/js/dist/carousel';
import 'bootstrap/js/dist/modal';
import ServiceWorker from './modules/service-worker';
import NavRender from './modules/navigation-render';
import MenuRender from './modules/menu-render';
import HSLRender from './modules/hsl-render';
import WeatherRender from './modules/weather-render';
import Announcement from './modules/announcement-data';
import AnnouncementRender from './modules/announcement-render';

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
  campus: 'Myyrmäki',
  darkmode: false,
  departures: 1,
};
// To store menu, routes, weather and announcements
let menus;
let activeMenu;
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
  MenuRender.renderMenuSection(activeMenu);
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
  activeMenu = getCampusMenu(menus, settings.campus);
  routes = await HSLRender.getRoutes(settings.campus, campuses);
  weather = await WeatherRender.getWeather(settings.campus, campuses);
  MenuRender.renderMenuSection(activeMenu);
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

/**
 * Update menus and start new iteration on timeoutTo7AM()
 *
 * @author Kerttu
 */
const updateMenus = async () => {
  // Start a new iteration of the timer
  timeoutTo7AM();
  // Update menus
  menus = loadAndSaveMenusToLocalStorage(await MenuRender.getMenus(campuses));
  activeMenu = getCampusMenu(menus, settings.campus);
  MenuRender.renderMenuSection(activeMenu);
};

/**
 * Create timeout at 7AM
 *
 * @author Kerttu
 */
const timeoutTo7AM = () => {
  let millisecondsTill7AM;
  const timeCurrent = new Date();
  // Create date and set time to 7AM
  const time7AM = new Date(
    timeCurrent.getFullYear(),
    timeCurrent.getMonth(),
    timeCurrent.getDate(),
    7,
    0,
    0,
    0
  );

  // If current time is after 7am
  if (timeCurrent.getTime() > time7AM.getTime()) {
    // Add +1 day to date
    time7AM.setDate(time7AM.getDate() + 1);
  }

  // Count millisecond between time7AM and timeCurrent
  millisecondsTill7AM = time7AM.getTime() - timeCurrent.getTime();
  // Timeout with the relevant duration
  setTimeout(updateMenus, millisecondsTill7AM);
};

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

/**
 * Filter menu from menus array depending on which campus is selected, and return the menu.
 *
 * @author Kerttu
 * @param {Array} menus
 * @param {String} selectedCampus
 * @returns
 */
const getCampusMenu = (menus, selectedCampus) => {
  const menu = menus.filter((menu) => menu.campusName === selectedCampus);
  return menu[0].menu;
};

/**
 * If menus are empty, load them from localStorage and save menus to localStorage.
 *
 * @author Kerttu
 */
const loadAndSaveMenusToLocalStorage = (menus) => {
  if (
    menus[0].menu.length === 0 ||
    menus[1].menu.length === 0 ||
    menus[2].menu.length === 0 ||
    menus[3].menu.length === 0
  ) {
    let tmp = localStorage.getItem('metrohelp_menus');
    if (tmp && checkIfJSON(tmp)) {
      return JSON.parse(tmp);
    }
  }

  localStorage.setItem('metrohelp_menus', JSON.stringify(menus));
  return menus;
};

window.addEventListener('scroll', () =>
  NavRender.changeActiveStateOnNavLinksWhenScrolling(navLinks, sections)
);

selectLangEl.addEventListener('change', () => {
  changeLang(selectLangEl.value);
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
  timeoutTo7AM();
  menus = loadAndSaveMenusToLocalStorage(await MenuRender.getMenus(campuses));
  routes = await HSLRender.getRoutes(settings.campus, campuses);
  weather = await WeatherRender.getWeather(settings.campus, campuses);
  announcements = await Announcement.getAnnouncements();
  activeMenu = getCampusMenu(menus, settings.campus);
  renderHeaderSlogan(settings.lang);
  NavRender.renderNav(
    settings.lang,
    settings.campus,
    selectLangEl,
    selectCampusEl
  );
  AnnouncementRender.renderAnnouncements(announcements, settings.lang);
  MenuRender.renderMenuSection(activeMenu);
  HSLRender.renderRouteInfo(routes);
  WeatherRender.renderWeather(weather);
  HSLRender.renderMap(routes, settings.campus, campuses);
};

init();

export default settings;
