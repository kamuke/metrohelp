/**
 * Module for HSL data
 *
 * @module HSL
 * @author Eeli
 */

'use strict';
import {doFetch} from './network';
const apiUrl =
  'https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql';

/**
 *
 * @param {number} lat Campus latitude value
 * @param {number} lon Campus longitude value
 */
const getQueryRoutesByLocation = (lat, lon, maxDepartures, radius) => {
  return `{
  stopsByRadius(lat:${lat}, lon:${lon}, radius: ${radius}) {
    edges {
      node {
        stop {
          lat
          lon
          code
          name
          stoptimesWithoutPatterns(numberOfDepartures: ${maxDepartures}, startTime: ${Math.floor(
    new Date().getTime() / 1000 + 240
  )}) {
            realtimeDeparture
            serviceDay
            trip {
              route {
                shortName
                mode
              }
            }
            headsign
          }
        }
      }
    }
  }
}`;
};

/**
 *
 * @param {number} lat Campus latitude value
 * @param {number} lon Campus longitude value
 * @returns Route data
 */
const getRoutesByLocation = async (lat, lon, maxDepartures, radius) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/graphql',
    },
    body: getQueryRoutesByLocation(lat, lon, maxDepartures, radius),
  };
  const routeData = await doFetch(apiUrl, false, options);
  return routeData.data.stopsByRadius.edges.map((stops) => {
    return stops.node.stop.stoptimesWithoutPatterns.map((routes) => {
      return {
        mode: routes.trip.route.mode,
        stopCode: stops.node.stop.code,
        stopName: stops.node.stop.name,
        routeNumber: routes.trip.route.shortName,
        destination: routes.headsign,
        routeRealtimeDeparture: routes.realtimeDeparture,
        lat: stops.node.stop.lat,
        lon: stops.node.stop.lon,
      };
    });
  });
};

const HSL = {getRoutesByLocation};
export default HSL;
