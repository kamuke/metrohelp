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
 * Query to get all the stops from campus with radius and next departures from every stop.
 *
 * @param {number} lat - Campus latitude value
 * @param {number} lon - Campus longitude value
 * @param {number} maxDepartures - Max departures from stop
 * @param {number} radius - Radius in meters from campus
 * @returns GraphQl query
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
 * Fetch data from api.digitransit.fi
 *
 * @param {number} lat - Campus latitude value
 * @param {number} lon - Campus longitude value
 * @param {number} maxDepartures - Max departures from stop
 * @param {number} radius - Radius in meters from campus
 * @returns Object
 */
const getRoutesByLocation = async (lat, lon, maxDepartures, radius) => {
  try {
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
  } catch (e) {
    console.error('getRoutesByLocation error:', e);
    return [];
  }
};

const HSL = {getRoutesByLocation};
export default HSL;
