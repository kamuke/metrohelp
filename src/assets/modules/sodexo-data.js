/**
 * Module for Sodexo menu data parsing
 *
 * @module: Sodexo
 * @author: Kerttu
 */

'use strict';

import {doFetch} from './network';

// DAILY URL:
const today = new Date().toISOString().split('T')[0];
const dailyUrl = 'https://www.sodexo.fi/ruokalistat/output/daily_json/';

// WEEKLY URL:
// const weeklyUrl = 'https://www.sodexo.fi/ruokalistat/output/weekly_json/';

/**
 * Get daily menu from Sodexo API
 *
 * @param {int} restaurantId - The id of the restaurant to get daily menu from
 * @returns Object
 */
const getDailyMenu = async (restaurantId) => {
  try {
    let menu;

    // using dailyUrl
    const menuResponse = await doFetch(`${dailyUrl}${restaurantId}/${today}`);

    // using weeklyUrl
    // const weeklyMenu = await doFetch(weeklyUrl + restaurantId);
    // const menuResponse = weeklyMenu.mealdates[getWeeklyIndex()];

    if (menuResponse.courses) {
      // Convert menuResponse.courses to array of objects that have dish, dietcodes and price.
      menu = Object.values(menuResponse.courses).map((course) => {
        const dietcodes = course.dietcodes ? course.dietcodes.toUpperCase().split(', ') : [];

        if (course.category.toLowerCase().includes('vegan')) {
          dietcodes.push('VEG');
        }

        return {
          nameFi: course.title_fi,
          nameEn: course.title_en,
          dietcodes: dietcodes,
          price: course.price,
        };
      });
    } else {
      menu = [{fi: 'Ei menua tälle päivälle.', en: 'No menu for today.'}];
    }

    // const dietExplanations = {
    //   fi: [
    //     {code: 'G', explanation: 'Gluteeniton'},
    //     {code: 'L', explanation: 'Laktoositon'},
    //     {code: 'M', explanation: 'Maidoton'},
    //     {code: 'VEG', explanation: 'Vegaaninen'},
    //     {code: 'VL', explanation: 'Vähälaktoosinen'},
    //   ],
    //   en: [
    //     {code: 'G', explanation: 'Gluten free'},
    //     {code: 'L', explanation: 'Lactose free'},
    //     {code: 'M', explanation: 'Milk free'},
    //     {code: 'VEG', explanation: 'Vegan'},
    //     {code: 'VL', explanation: 'Low lactose'},
    //   ],
    // };

    const dietExplanations = {
      fi: '(G) Gluteeniton, (L) Laktoositon, (M) Maidoton, (VEG) Vegaaninen, (VL) Vähälaktoosinen',
      en: '(G) Gluten free, (L) Lactose free, (M) Milk free, (VEG) Vegan, (VL) Low lactose',
    };

    return {
      title: 'Sodexo',
      menu: menu,
      dietcodeExplanations: dietExplanations,
    };
  } catch (e) {
    throw new Error('getDailyMenu error: ' + e);
  }
};

const Sodexo = {getDailyMenu};

export default Sodexo;
