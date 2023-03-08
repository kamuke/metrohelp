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
 * Rotate visibility of sections
 * @author Catrina
 * @param activeScreenIndex - index nmbr for section
 * @param delay - in seconds
 */
// eslint-disable-next-line no-unused-vars
const sectionCarousel = (activeScreenIndex, delay) => {
  const screens = document.querySelectorAll('section');

  for (const screen of screens) {
    screen.style.display = 'none';
  }

  //check if the screen is HSL, add flex as display
  if(screens[activeScreenIndex].id==='hsl-section'){
    screens[activeScreenIndex].style.display = 'flex';
  }else{
    screens[activeScreenIndex].style.display = 'inherit';
  }

  //add css animation styling
  screens[activeScreenIndex].classList.add('fade-in');

  //loop
  setTimeout(() => {
    let nextScreen = activeScreenIndex + 1;
    if (activeScreenIndex == screens.length-1) {
      nextScreen = 0;
    }
    sectionCarousel(nextScreen, delay);
  }, delay * 1000);
};

// Updates HSL routes and weather data every minute
const updateData = setInterval(async () => {
  routes = await HSLRender.getRoutes(settings.campus, campuses);
  HSLRender.renderRouteInfo(routes);
  WeatherRender.renderWeather(weather);
  HSLRender.renderMap(routes, settings.campus, campuses);
}, 60000);

/**
 * App initialization.
 */
const init = async () => {
  updateData;
  menu = await MenuRender.getMenu(settings.campus, campuses);
  routes = await HSLRender.getRoutes(settings.campus, campuses);
  weather = await WeatherRender.getWeather(settings.campus, campuses);
  announcements = await Announcement.getAnnouncements();
  NavRender.renderNav(
    settings.campus
  );
  AnnouncementRender.renderAnnouncements(announcements);
  MenuRender.renderMenuSection(menu);
  HSLRender.renderRouteInfo(routes);
  WeatherRender.renderWeather(weather);
  HSLRender.renderMap(routes, settings.campus, campuses);
  ServiceWorker.register();
  sectionCarousel(0,10);
};

init();

export default settings;
