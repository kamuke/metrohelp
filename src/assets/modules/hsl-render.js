/**
 * Module for HSL data rendering
 *
 * @module HSLRender
 * @author Eeli
 */

'use strict';

import HSL from './hsl-data';
import L from 'leaflet';
import settings from '/src/index';

// Leaflet.js variables
const mapContainer = document.querySelector('#routes-map');
const markers = L.featureGroup();
const map = L.map(mapContainer, {
  zoomControl: false,
});
const mapLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
});

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
  iconUrl: './assets/metropolia-marker.webp',
});
const busIcon = new hslIcon({iconUrl: './assets/bus.webp'});
const subwayIcon = new hslIcon({iconUrl: './assets/subway.webp'});
const trainIcon = new hslIcon({iconUrl: './assets/train.webp'});
const tramIcon = new hslIcon({iconUrl: './assets/tram.webp'});

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
 * Gets data from HSL data module and convert it to and array.
 * The array is sorted by departuretime.
 *
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
 * Renders HSL route info from sorted HSL data.
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
      stopName.classList = 'stopname';
      stopCode.classList = 'badge bg-secondary stopcode';
      if (route.mode == 'BUS') {
        routeNumber.classList = 'badge bg-info routenumber';
      } else if (route.mode == 'SUBWAY') {
        routeNumber.classList = 'badge bg-primary routenumber';
      } else if (route.mode == 'TRAM') {
        routeNumber.classList = 'badge bg-success routenumber';
      } else if (route.mode == 'RAIL') {
        routeNumber.classList = 'badge bg-light routenumber';
      }
      destination.classList = 'destinationname';
      routeRealtimeDeparture.classList = 'fw-bold departure';

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
 * Renders Leaflet.js map and custom markers for campus and each stops nearby.
 * Map gets all the marker locations and fit them in to the view.
 *
 * @param {array} routes - Array of sorted routes
 * @param {string} selectedCampus - Selected campus to get HSL routes
 * @param {array} allCampuses - List of all campuses and infos.
 */
const renderMap = (routes, selectedCampus, allCampuses) => {
  let maxMarkers = 0;
  markers.clearLayers();
  mapLayer.remove();
  for (const campus of allCampuses) {
    if (selectedCampus === campus.name) {
      map.setView([campus.location.lat, campus.location.lon], 10);
      mapLayer.addTo(map);
      const campusMarker = L.marker(
        [campus.location.lat, campus.location.lon],
        {
          title: campus.name,
          icon: metropoliaIcon,
          alt: `Metropolia ${campus.name} marker`,
        }
      );
      campusMarker.bindTooltip(`Metropolia ${campus.name}`, {
        permanent: true,
      });
      markers.addLayer(campusMarker);
      for (const route of routes) {
        maxMarkers++;
        if (maxMarkers < 6) {
          const stopMarker = L.marker([route.lat, route.lon], {
            title: route.stopCode,
            alt: `${route.stopName} stop marker`,
          });
          stopMarker.bindTooltip(route.stopCode, {
            permanent: true,
          });
          if (route.mode === 'BUS') {
            stopMarker.setIcon(busIcon);
          } else if (route.mode === 'SUBWAY') {
            stopMarker.setIcon(subwayIcon);
          } else if (route.mode === 'TRAIN') {
            stopMarker.setIcon(trainIcon);
          } else if (route.mode === 'TRAM') {
            stopMarker.setIcon(tramIcon);
          }
          markers.addLayer(stopMarker);
        }
      }
      markers.addTo(map);
      map.fitBounds(markers.getBounds());
    }
  }
};

const HSLRender = {getRoutes, renderRouteInfo, renderMap};
export default HSLRender;
