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
 * Renders route info from HSL-data
 *
 * @author Eeli
 */
const renderRouteInfo = async () => {
  //TODO: campusInfo lat and lon values by campus name
  const routeData = await HSL.getRoutesByLocation(
    60.223603108546165,
    25.077924598408583
  );
  const target = document.querySelector('.hsl-container');

  for (const route of routeData) {
    const routeContainer = document.createElement('div');
    routeContainer.classList = 'route-info container-fluid';
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
    routeRealtimeDeparture.textContent = route.routeRealtimeDeparture;
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
  console.log('Testi!');
  console.log(
    'HSL Testi',
    HSL.getRoutesByLocation(60.223603108546165, 25.077924598408583)
  );
  renderRouteInfo();
  ServiceWorker.register();
};

init();
