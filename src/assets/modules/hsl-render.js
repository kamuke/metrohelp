/**
 * Module for HSL data rendering
 *
 * @module: HSLRender
 * @author: Eeli
 */

'use strict';

import HSL from './hsl-data';
import * as L from 'leaflet';
import settings from '/src/index';

/**
 * Converts HSL time from seconds to 00:00 format
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
        settings.departures,
        campus.routesRadius
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
  const target = document.querySelector('#routes');
  target.innerHTML = '';
  let maxRoutes = 0;
  for (const route of routes) {
    maxRoutes++;
    if (maxRoutes < 6) {
      const routeContainer = document.createElement('li');
      const routeHeading = document.querySelector('#hsl-heading');
      const stopContainer = document.createElement('div');
      const routeDestination = document.createElement('div');
      const stopName = document.createElement('div');
      const stopCode = document.createElement('div');
      const routeNumber = document.createElement('div');
      const destination = document.createElement('div');
      const routeRealtimeDeparture = document.createElement('div');

      routeContainer.classList = 'route-info';
      stopContainer.classList = 'stop-info col';
      routeDestination.classList = 'destination-info col';
      stopName.classList = 'fw-bold mb-3';
      stopCode.classList = 'badge bg-secondary';
      if (route.mode == 'BUS') {
        routeNumber.classList = 'badge bg-info';
      } else if (route.mode == 'SUBWAY') {
        routeNumber.classList = 'badge bg-primary';
      } else if (route.mode == 'TRAM') {
        routeNumber.classList = 'badge bg-success';
      } else if (route.mode == 'RAIL') {
        routeNumber.classList = 'badge bg-light';
      }
      destination.classList = 'fw-bold mb-3';
      routeRealtimeDeparture.classList = 'fw-bold mb-3';

      stopCode.id = 'stopcode';
      stopName.id = 'stopname';
      routeNumber.id = 'routenumber';
      destination.id = 'destination';
      routeRealtimeDeparture.id = 'departure';

      routeHeading.innerHTML =
        settings.lang === 'fi'
          ? `HSL - ${settings.campus} lähipysäkit ja linjat`
          : `HSL - ${settings.campus} nearby stops and routes`;

      stopCode.innerHTML = route.stopCode;
      stopName.innerHTML = route.stopName;
      routeNumber.innerHTML = route.routeNumber;
      destination.innerHTML = route.destination;
      routeRealtimeDeparture.innerHTML = convertTime(
        route.routeRealtimeDeparture
      );

      stopContainer.append(stopCode, stopName);
      routeDestination.append(routeNumber, destination);
      routeContainer.append(
        stopContainer,
        routeDestination,
        routeRealtimeDeparture
      );
      target.append(routeContainer);
    }
  }
};

/**
 * Render Leaflet.js map and markers for campus and stops.
 *
 * @author Eeli
 * @param {array} routes - Array of sorted routes
 * @param {string} selectedCampus - Selected campus to get HSL routes
 * @param {array} allCampuses - List of all campuses and infos.
 */

const mapContainer = document.querySelector('#routes-map');
const map = L.map(mapContainer, {
  zoomControl: false,
});

const renderMap = (routes, selectedCampus, allCampuses) => {
  const campusIcon = L.Icon.extend({
    options: {
      iconSize: [40, 40],
    },
  });
  const hslIcon = L.Icon.extend({
    options: {
      iconSize: [25, 25],
    },
  });
  const metropoliaIcon = new campusIcon({
    iconUrl: './assets/metropolia-marker.png',
  });
  const busIcon = new hslIcon({iconUrl: './assets/bus.png'});
  const subwayIcon = new hslIcon({iconUrl: './assets/subway.png'});
  const trainIcon = new hslIcon({iconUrl: './assets/train.png'});
  const tramIcon = new hslIcon({iconUrl: './assets/tram.png'});
  let maxMarkers = 0;
  for (const campus of allCampuses) {
    if (selectedCampus === campus.name) {
      map.setView([campus.location.lat, campus.location.lon], 16);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const campusMarker = L.marker(
        [campus.location.lat, campus.location.lon],
        {
          title: campus.name,
          icon: metropoliaIcon,
          alt: 'Campus marker',
        }
      ).addTo(map);
      campusMarker.bindTooltip(`${campus.name}`).openTooltip();

      const markers = L.featureGroup();

      for (const route of routes) {
        maxMarkers++;
        if (maxMarkers < 6) {
          const stopMarker = L.marker([route.lat, route.lon]).addTo(map);
          stopMarker.bindTooltip(`${route.stopCode}`).openTooltip();
          markers.addLayer(stopMarker);
          if (route.mode === 'BUS') {
            stopMarker.setIcon(busIcon);
          } else if (route.mode === 'SUBWAY') {
            stopMarker.setIcon(subwayIcon);
          } else if (route.mode === 'TRAIN') {
            stopMarker.setIcon(trainIcon);
          } else if (route.mode === 'TRAM') {
            stopMarker.setIcon(tramIcon);
          }
        }
      }
      map.fitBounds(markers.getBounds());
    }
  }
};

const removeMap = () => {
  map.remove();
};

const HSLRender = {getRoutes, renderRouteInfo, renderMap, removeMap};
export default HSLRender;
