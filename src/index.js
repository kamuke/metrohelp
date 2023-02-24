/**
 * @author Kerttu
 */
'use strict';

import './styles/style.scss';
import 'bootstrap';
import ServiceWorker from './assets/modules/service-worker';
import HSL from './assets/modules/hsl-data';

/* Later use???
const campusInfo = [
  {name: 'Karaportti', lat: 60.22415039513893, lon: 24.75847098313348},
  {name: 'Myyrmäki', lat: , lon: },
  {name: 'Myllypuro', lat: 60.223603108546165, lon: 25.077924598408583,},
  {name: 'Arabia', lat: , lon: 2},
];
*/

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

/**
 * Renders route info from HSL-data
 *
 * @author Eeli
 */
const renderRouteInfo = async () => {
  //TODO: campusInfo lat and lon values by campus name
  const routeData = await HSL.getRoutesByLocation(60.223, 25.077);

  const target = document.querySelector('.hsl-container');

  for (const stop of routeData) {
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
  console.log('Karaportti', HSL.getRoutesByLocation(60.224, 24.758));
  console.log('Myllypuro', HSL.getRoutesByLocation(60.223, 25.077));
  renderRouteInfo();
  ServiceWorker.register();
};

init();
