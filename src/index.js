/**
 * @author Kerttu
 */
'use strict';

import './styles/style.scss';
import 'bootstrap';
import ServiceWorker from './assets/modules/service-worker';
import HSL from './assets/modules/hsl-data';
import Sodexo from './assets/modules/sodexo-data';
import FoodCo from './assets/modules/food-co-data';

// Metropolia's campuses and needed info
const campuses = [
  {
    name: 'Arabia',
    restaurant: {
      id: 1251,
      chain: 'Food & Co',
    },
    location: {lat: 60.2100515020518, lon: 24.97677582883559},
  },
  {
    name: 'Karaportti',
    restaurant: {id: 3208, chain: 'Food & Co'},
    location: {lat: 60.22412908302269, lon: 24.7584602544428},
  },
  {
    name: 'Myllypuro',
    restaurant: {id: 158, chain: 'Sodexo'},
    location: {lat: 60.223621756949434, lon: 25.077913869785164},
  },
  {
    name: 'Myyrmäki',
    restaurant: {id: 152, chain: 'Sodexo'},
    location: {lat: 60.258843352326785, lon: 24.84484968512866},
  },
];

// User settings
// TODO: Save to localStorage + load from localStorage
let settings = {
  lang: 'fi',
  campus: 'Myllypuro',
  darkmode: false,
  departures: 2,
};

// To store menu and routes
let menu;
let routes;

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
 * Converts HSL time from secconds to 00:00 format
 * @param {number} seconds
 * @returns time string in 00:00 format
 */
const convertTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours == 24 ? '00' : hours}:${mins < 10 ? '0' + mins : mins}`;
};

/**
 * @author Eeli
 * @param {string} selectedCampus - Selected campus to get HSL routes
 * @param {array} allCampuses - List of all campuses and infos.
 * @returns Sorted array
 */

const getRoutes = async (selectedCampus, allCampuses) => {
  for (const campus of allCampuses) {
    if (selectedCampus === campus.name) {
      const routesData = await HSL.getRoutesByLocation(
        campus.location.lat,
        campus.location.lon,
        settings.departures
      );
      let routesArray = [];
      for (const route of routesData) {
        for (let i = 0; i < settings.departures; i++) {
          routesArray.push(route[i]);
        }
      }
      return routesArray.sort((a, b) => {
        return a.routeRealtimeDeparture - b.routeRealtimeDeparture;
      });
    }
  }
};

/**
 *
 * @param {array} routes - Array of sorted routes
 */
const renderRouteInfo = async (routes) => {
  const target = document.querySelector('#hsl-section');
  for (const route of routes) {
    const routeContainer = document.createElement('div');
    routeContainer.classList = 'route-info container';
    const stopCode = document.createElement('p');
    stopCode.classList = 'badge bg-secondary';
    // const stopName = document.createElement('p');
    const routeNumber = document.createElement('p');
    if (route.mode == 'BUS') {
      routeNumber.classList = 'badge bg-info';
    } else if (route.mode == 'SUBWAY') {
      routeNumber.classList = 'badge bg-primary';
    } else if (route.mode == 'TRAM') {
      routeNumber.classList = 'badge bg-success';
    } else if (route.mode == 'RAIL') {
      routeNumber.classList = 'badge bg-light';
    }

    const destination = document.createElement('p');
    destination.classList = 'badge bg-dark';
    const routeRealtimeDeparture = document.createElement('p');
    routeRealtimeDeparture.classList = 'badge bg-success';
    stopCode.textContent = route.stopCode;
    // stopName.textContent = route.stopName;
    routeNumber.textContent = route.routeNumber;
    destination.textContent = route.destination;
    routeRealtimeDeparture.textContent = convertTime(
      route.routeRealtimeDeparture
    );
    routeContainer.append(
      stopCode,
      routeNumber,
      //stopName,
      destination,
      routeRealtimeDeparture
    );
    target.append(routeContainer);
  }
};
/**
 * App initialization.
 */
const init = async () => {
  menu = await getMenu(settings.campus, campuses);
  routes = await getRoutes(settings.campus, campuses);
  renderMenuSection(menu);
  renderRouteInfo(routes);
  ServiceWorker.register();
};

init();
