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

    return {
      fi: menuFi,
      en: menuEn,
    };
  } catch (e) {
    throw new Error('getDailyMenu error: ' + e);
  }
};

const FoodCo = {getDailyMenu};
export default FoodCo;
