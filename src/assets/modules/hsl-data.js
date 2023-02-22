/**
 * Module for HSL data
 *
 * @module: HSL
 * @author: Eeli
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
const getQueryRoutesByLocation = (lat, lon) => {
  return `{
  nearest(lat: ${lat}, lon: ${lon}, maxDistance: 400, filterByPlaceTypes: DEPARTURE_ROW) {
    edges {
      node {
        place {
          ...on DepartureRow {
            stop {
              lat
              lon
              code
              name
            }
            stoptimes {
              scheduledDeparture
              realtimeDeparture
              trip {
                route {
                  shortName
                  longName
                  mode
                }
              }
              headsign
            }
          }
        }
      }
    }
  }
}`;
};

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
 *
 * @param {number} lat Campus latitude value
 * @param {number} lon Campus longitude value
 * @returns Route data
 */
const getRoutesByLocation = async (lat, lon) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/graphql',
    },
    body: getQueryRoutesByLocation(lat, lon),
  };
  const routeData = await doFetch(apiUrl, false, options);
  return routeData.data.nearest.edges.map((routes) => {
    return {
      mode: routes.node.place.stoptimes[0].trip.route.mode,
      stopCode: routes.node.place.stop.code,
      stopName: routes.node.place.stop.name,
      routeNumber: routes.node.place.stoptimes[0].trip.route.shortName,
      destination: routes.node.place.stoptimes[0].headsign,
      routeScheduledDeparture: convertTime(
        routes.node.place.stoptimes[0].scheduledDeparture
      ),
      routeRealtimeDeparture: convertTime(
        routes.node.place.stoptimes[0].realtimeDeparture
      ),
    };
  });
};
const HSL = {getRoutesByLocation};
export default HSL;
