/**
 * Module for Food & Co menu data parsing
 *
 * @module: Food & Co
 * @author: Kerttu
 */

'use strict';

import {doFetch, getWeeklyIndex} from './network';

const today = new Date().toISOString().split('T')[0];
const menuUrlFi = 'https://www.compass-group.fi/menuapi/week-menus?costCenter=';
const menuUrlEn = 'https://www.compass-group.fi/menuapi/week-menus?costCenter=';

// https://www.compass-group.fi/menuapi/week-menus?costCenter=3087&language=fi&date=2023-02-22
// https://www.compass-group.fi/menuapi/feed/json?costNumber=3087&language=fi

/**
 * Get daily menu from Food & Co API
 *
 * @param {int} restaurantId - The id of the restaurant to get daily menu from
 * @returns Menu object
 */
const getDailyMenu = async (restaurantId) => {
  try {
    let menuFi, menuEn;
    const weeklyMenuFi = await doFetch(
      `${menuUrlFi}${restaurantId}&language=fi&date=${today}`,
      true
    );
    const dailyMenuFi = weeklyMenuFi.menus[getWeeklyIndex()];
    const weeklyMenuEn = await doFetch(
      `${menuUrlEn}${restaurantId}&language=en&date=${today}`,
      true
    );
    const dailyMenuEn = weeklyMenuEn.menus[getWeeklyIndex()];

    if (dailyMenuFi) {
      menuFi = Object.values(dailyMenuFi.menuPackages).map((menuPackage) => {
        return menuPackage.meals.map((meal) => meal.name).join(', ');
      });
    } else {
      menuFi = ['Ei menua tälle päivälle.'];
    }

    if (dailyMenuEn) {
      menuEn = Object.values(dailyMenuEn.menuPackages).map((menuPackage) => {
        return menuPackage.meals.map((meal) => meal.name).join(', ');
      });
    } else {
      menuEn = ['No menu for today.'];
    }

    const dietExplanations = {
      fi: '(G) Gluteeniton, (L) Laktoositon, (VL) Vähälaktoosinen, (M) Maidoton, (*) Suomalaisten ravitsemussuositusten mukainen, (VEG) Soveltuu vegaaniruokavalioon, (ILM) Ilmastoystävällinen, (VS) Sis. tuoretta valkosipulia, (A) Sis. Allergeeneja',
      en: '(G) Gluten-free, (L) Lactose-free, (VL) Low lactose, (M) Dairy-free, (*) Comply with Finnish nutrition recommendations, (VEG) Suitable for vegans, (ILM) Climate-friendly, (VS) Contains fresh garlic, (A) Contains allergens',
    };

    // return {
    //   title: 'Food & Co',
    //   menus: menu,
    //   dietcode_explanations: dietExplanations,
    // };

    return {
      fi: menuFi,
      en: menuEn,
      dietcodeExplanations: dietExplanations,
    };
  } catch (e) {
    throw new Error('getDailyMenu error: ' + e);
  }
};

const FoodCo = {getDailyMenu};
export default FoodCo;
