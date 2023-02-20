/**
 * Module for Sodexo menu data parsing
 *
 * @module: Sodexo
 * @author: Kerttu
 */

'use strict';

import {doFetch, getWeeklyIndex} from './network';

// DAILY URL:
// const today = new Date().toISOString().split('T')[0];
// const dailyUrl ='https://www.sodexo.fi/ruokalistat/output/daily_json/152/' + today;

// WEEKLY URL:
const weeklyUrl = 'https://www.sodexo.fi/ruokalistat/output/weekly_json/';

/**
 * Get daily menu from Sodexo API
 *
 * @param {int} restaurantId - The id of the restaurant to get daily menu from
 * @returns Menu object
 */
const getDailyMenu = async (restaurantId) => {
  try {
    let menuFi, menuEn;
    // using dailyUrl
    // const menu = await doFetch(dailyUrl);

    // using weeklyUrl
    const weeklyMenu = await doFetch(weeklyUrl + restaurantId);
    const menu = weeklyMenu.mealdates[getWeeklyIndex()];

    if (menu) {
      // Convert Menu.courses to array and get only titles
      menuFi = Object.values(menu.courses).map((course) => course.title_fi);
      menuEn = Object.values(menu.courses).map((course) => course.title_en);
    } else {
      menuFi = ['Ei menua tälle päivälle.'];
      menuEn = ['No menu for today.'];
    }

    return {
      fi: menuFi,
      en: menuEn,
    };
  } catch (e) {
    throw new Error('getDailyMenu error: ' + e);
  }
};

const Sodexo = {getDailyMenu};

export default Sodexo;
