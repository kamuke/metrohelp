/**
 * Module for Sodexo menu data parsing.
 *
 * @module: Sodexo
 * @author: Kerttu
 */

'use strict';

import {doFetch} from './network';

const today = new Date().toISOString().split('T')[0];
const dailyUrl = 'https://www.sodexo.fi/ruokalistat/output/daily_json/';

/**
 * Get daily menu from Sodexo API.
 *
 * @param {int} restaurantId - The id of the restaurant to get daily menu from
 * @returns Object
 */
const getDailyMenu = async (restaurantId) => {
  try {
    let menu;

    // Fetch the daily menu
    const dailyMenu = await doFetch(`${dailyUrl}${restaurantId}/${today}`);

    // If dailyMenu exists
    if (dailyMenu.courses) {
      // Create menu from courses
      menu = Object.values(dailyMenu.courses).map((course) => {
        // Dietcodes to array
        const dietcodes = course.dietcodes
          ? course.dietcodes.toUpperCase().split(', ')
          : [];

        // If the category has vegan, add VEG dietcode to dietcode array
        if (course.category.toLowerCase().includes('vegan')) {
          dietcodes.push('VEG');
        }

        return {
          fi: course.title_fi,
          en: course.title_en,
          dietcodes: dietcodes,
          price: course.price,
        };
      });
    } else {
      // If there is no menu for the day
      menu = [{fi: 'Ei menua tälle päivälle.', en: 'No menu for today.'}];
    }

    // Dietcode explanations from Sodexo's site
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
