/**
 * @author Kerttu
 */
'use strict';

import './styles/style.scss';
import 'bootstrap';
import ServiceWorker from './assets/modules/service-worker';
import HSL from './assets/modules/hsl-data';

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

/**
 * Converts HSL time from secconds to 00:00 format
 * @param {number} seconds
 * @returns time string in 00:00 format
 */
const convertTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3606) / 60);
  return `${hours == 24 ? '00' : hours}:${mins < 10 ? '0' + mins : mins}`;
};

// User settings
// TODO: Save to localStorage + load from localStorage
let settings = {
  lang: 'fi',
  campus: 'Karaportti',
  darkmode: false,
};

// To store routes
let routes;

/**
 * @author Eeli
 * @param {string} selectedCampus - Selected campus to get HSL routes
 * @param {array} allCampuses - List of all campuses and infos.
 * @returns Object
 */
const getRoutes = async (selectedCampus, allCampuses) => {
  for (const campus of allCampuses) {
    if (selectedCampus === campus.name) {
      return await HSL.getRoutesByLocation(
        campus.location.lat,
        campus.location.lon
      );
    }
  }
};

/**
 *
 * @param {Object} routes - Object containing HSL routes data from specific location.
 */
const renderRouteInfo = async (routes) => {
  const target = document.querySelector('#hsl-section');
  for (const stop of routes) {
    for (const route of stop) {
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
  }
};

/**
 * App initialization.
 */
const init = async () => {
  routes = await getRoutes(settings.campus, campuses);
  renderRouteInfo(routes);
  ServiceWorker.register();
};

init();
