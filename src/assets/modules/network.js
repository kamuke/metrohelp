/**
 * Network functions and API calls.
 *
 * @module Network
 * @author Kerttu
 */
'use strict';

/**
 * Fetch request to a given API url.
 *
 * @param {String} url - API url
 * @param {Noolean} useProxy - Use allorigins proxy
 * @param {Object} options - Fetch options
 * @returns JSON data
 */
const doFetch = async (url, useProxy = false, options) => {
  if (useProxy) {
    url = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
  }
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error('doFetch http, code:' + response.status);
    }
    if (useProxy) {
      const responseJson = await response.json();
      return JSON.parse(responseJson.contents);
    }
    return await response.json();
  } catch (error) {
    throw new Error('doFetch error: ' + error.message);
  }
};

/**
 * Get index of weekday.
 *
 * @returns int - API friendly index of weekday. 0 as monday
 */
const getWeeklyIndex = () => {
  const index = new Date().getDay() - 1;
  return index === -1 ? 6 : index;
};

export {doFetch, getWeeklyIndex};
