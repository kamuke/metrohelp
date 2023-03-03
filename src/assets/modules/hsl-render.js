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
  const target = document.querySelector('#routes');
  let maxRoutes = 0;
  for (const route of routes) {
    maxRoutes++;
    if (maxRoutes <= 5) {
      const routeContainer = document.createElement('li');
      routeContainer.classList = 'route-info';
      const stopContainer = document.createElement('div');
      stopContainer.classList = 'stop-info col';
      const routeDestination = document.createElement('div');
      routeDestination.classList = 'destination-info col';
      const stopCode = document.createElement('div');
      stopCode.id = 'stopcode';
      stopCode.classList = 'badge bg-secondary';
      const stopName = document.createElement('div');
      stopName.id = 'stopname';
      stopName.classList = 'fw-bold mb-3';
      const routeNumber = document.createElement('div');
      routeNumber.id = 'routenumber';
      if (route.mode == 'BUS') {
        routeNumber.classList = 'badge bg-info';
      } else if (route.mode == 'SUBWAY') {
        routeNumber.classList = 'badge bg-primary';
      } else if (route.mode == 'TRAM') {
        routeNumber.classList = 'badge bg-success';
      } else if (route.mode == 'RAIL') {
        routeNumber.classList = 'badge bg-light';
      }

      const destination = document.createElement('div');
      destination.id = 'destination';
      destination.classList = 'fw-bold mb-3';
      const routeRealtimeDeparture = document.createElement('div');
      routeRealtimeDeparture.id = 'departure';
      routeRealtimeDeparture.classList = 'fw-bold mb-3';
      stopCode.textContent = route.stopCode;
      stopName.textContent = route.stopName;
      routeNumber.textContent = route.routeNumber;
      destination.textContent = route.destination;
      routeRealtimeDeparture.textContent = convertTime(
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
  const mapContainer = document.querySelector('#routes-map');
  for (const campus of allCampuses) {
    if (selectedCampus === campus.name) {
      const map = L.map(mapContainer, {
        zoomControl: false,
      }).setView([campus.location.lat, campus.location.lon], 16);
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
          iconSize: [25, 25],
          alt: 'Campus marker',
        }
      ).addTo(map);
      const markers = L.featureGroup();
      campusMarker.bindTooltip(`${campus.name}`).openTooltip();
      for (const route of routes) {
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
      map.fitBounds(markers.getBounds());
    }
  }
};

const HSLRender = {getRoutes, renderRouteInfo, renderMap};
export default HSLRender;
