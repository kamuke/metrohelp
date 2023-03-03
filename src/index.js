/**
 * @author Kerttu
 */
'use strict';

import './styles/style.scss';
import 'bootstrap';
import ServiceWorker from './assets/modules/service-worker';
import Sodexo from './assets/modules/sodexo-data';
import FoodCo from './assets/modules/food-co-data';
import HSLRender from './assets/modules/hsl-render';
import Announcement from './assets/modules/announcement';
import {renderAnnouncements} from './assets/modules/announcement-render';
import Navigation from './assets/modules/navigation';

// Metropolia's campuses and needed info
const campuses = [
  {
    name: 'Arabia',
    city: 'Helsinki',
    restaurant: {
      id: 1251,
      chain: 'Food & Co',
    },
    location: {lat: 60.2100515020518, lon: 24.97677582883559},
  },
  {
    name: 'Karaportti',
    city: 'Espoo',
    restaurant: {id: 3208, chain: 'Food & Co'},
    location: {lat: 60.22412908302269, lon: 24.7584602544428},
  },
  {
    name: 'Myllypuro',
    city: 'Helsinki',
    restaurant: {id: 158, chain: 'Sodexo'},
    location: {lat: 60.223621756949434, lon: 25.077913869785164},
  },
  {
    name: 'Myyrmäki',
    city: 'Vantaa',
    restaurant: {id: 152, chain: 'Sodexo'},
    location: {lat: 60.258843352326785, lon: 24.84484968512866},
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
let menu;
let routes;
let weather;
let announcements;

/**
 * Get menu from Sodexo or Food & Co module.
 *
 * @author Kerttu
 * @param {string} selectedCampus - Selected campus to get it's restaurant's menu.
 * @param {array} allCampuses - List of all campuses and infos.
 * @returns Object
 */
const getMenu = async (selectedCampus, allCampuses) => {
  for (const campus of allCampuses) {
    if (selectedCampus === campus.name) {
      if (campus.restaurant.chain === 'Sodexo') {
        return await Sodexo.getDailyMenu(campus.restaurant.id);
      } else if (campus.restaurant.chain === 'Food & Co') {
        return await FoodCo.getDailyMenu(campus.restaurant.id);
      }
    }
  }
};

/**
 * Render menu params values in list element to targeted element.
 *
 * @author Kerttu
 * @param {Object} menu - Object which values are appended to targetElement.
 * @param {Node} targetElement - Node element to append menu params values in list element.
 */
const renderMenuListItem = async (menu, targetElement) => {
  const menuList = document.createElement('li');
  const menuBody = document.createElement('div');
  const menuName = document.createElement('p');

  menuList.classList = 'menu list-group-item';
  menuBody.classList = 'menu-body';
  menuName.classList = 'menu-name';

  menuName.textContent = settings.lang === 'fi' ? menu.fi : menu.en;

  menuBody.append(menuName);

  if (menu.price) {
    const menuPrice = document.createElement('p');
    menuPrice.classList = 'menu-price';
    menuPrice.textContent = menu.price;
    menuBody.append(menuPrice);
  }

  menuList.append(menuBody);

  if (menu.dietcodes) {
    const menuDietcodes = document.createElement('div');
    menuDietcodes.classList = 'menu-dietcodes';

    for (const dietcode of menu.dietcodes) {
      const dietcodeBadge = document.createElement('span');
      dietcodeBadge.classList = 'badge rounded-pill bg-primary';
      dietcodeBadge.textContent = dietcode;
      menuDietcodes.append(dietcodeBadge);
    }
    menuList.append(menuDietcodes);
  }

  targetElement.append(menuList);
};

/**
 * Render all menu list items to menus ul element.
 *
 * @author Kerttu
 * @param {Object} menu - Menu to render.
 */
const renderAllMenuListItems = async (menu) => {
  const menusUl = document.querySelector('#menus-list');
  menusUl.innerHTML = '';

  // Loop menus to menusUl
  for (const menuItem of menu.menu) {
    renderMenuListItem(menuItem, menusUl);
  }
};

/**
 * Render menu section: heading, date, menu ul list and dietcode explanations.
 *
 * @author Kerttu
 * @param {Object} menu - Menu to render to menu ul list.
 */
const renderMenuSection = async (menu) => {
  const menusHeading = document.querySelector('#menus-heading');
  const menusDate = document.querySelector('#menus-date');
  const dietcodeBtn = document.querySelector('#dietcode-exp-btn');
  const dietcodeBody = document.querySelector('#dietcode-exp-body');

  menusHeading.innerHTML =
    settings.lang === 'fi'
      ? `Ruokalista - ${menu.title}`
      : `Menu - ${menu.title}`;

  let date = `${new Date().toLocaleDateString(settings.lang, {
    weekday: 'long',
  })} ${new Date().toLocaleDateString(settings.lang)}`;

  date = date.charAt(0).toUpperCase() + date.slice(1);

  menusDate.innerHTML = date;

  dietcodeBtn.innerHTML =
    settings.lang === 'fi' ? 'Ruokavaliokoodit' : 'Dietcodes';

  dietcodeBody.innerHTML =
    settings.lang === 'fi'
      ? menu.dietcodeExplanations.fi
      : menu.dietcodeExplanations.en;

  renderAllMenuListItems(menu);
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
  const weatherImg = document.querySelector('#weather-img');
  const weatherCaption = document.querySelector('#weather-caption');
  const weatherCity = document.createElement('p');

  //insert img and alt txt (in english) TODO: translate current condition text into finnish?
  weatherImg.src = weather.current.condition.icon;
  weatherImg.alt = weather.current.condition.text;
  //current weather
  weatherCaption.textContent = weather.current.temp_c + ' °C';
  //display selected campus' city
  weatherCaption.appendChild(weatherCity);
  weatherCity.textContent = weather.location.name;
};

// When window scrolls
window.addEventListener('scroll', () =>
  Navigation.changeActiveStateOnNavLinksWhenScrolling()
);

/**
 * App initialization.
 */
const init = async () => {
  menu = await getMenu(settings.campus, campuses);
  routes = await HSLRender.getRoutes(settings.campus, campuses);
  weather = await getWeather(settings.campus, campuses);
  announcements = await Announcement.getAnnouncements();
  renderAnnouncements(announcements, settings.lang);
  renderMenuSection(menu);
  HSLRender.renderRouteInfo(routes);
  renderWeather(weather);
  HSLRender.renderMap(routes, settings.campus, campuses);
  ServiceWorker.register();
};

init();

export default settings;
