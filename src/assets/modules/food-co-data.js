/**
 * Module for Food & Co menu data parsing
 *
 * @module: Food & Co
 * @author: Kerttu
 */

'use strict';

import {doFetch} from './network';

const today = '2023-02-16'; // TODO: Change the real date, this is only for developing.
// new Date().toISOString().split('T')[0];
const menuUrlFi = 'https://www.compass-group.fi/menuapi/week-menus?costCenter=';
// const menuUrlEn = 'https://www.compass-group.fi/menuapi/week-menus?costCenter=';
// https://www.compass-group.fi/menuapi/week-menus?costCenter=3087&language=fi&date=2023-02-22
// https://www.compass-group.fi/menuapi/feed/json?costNumber=3087&language=fi

/**
 * Get values that are included in all arrays of the array param.
 *
 * @param {*} arrays - An array of containing arrays
 * @returns Array
 */
const getCommonValues = (arrays) => {
  // Create an array to hold the common values
  let commonValues = [];

  // Loop through each value in the first array
  for (const array of arrays[0]) {
    let value = array;
    let isInAllArrays = true;

    // Loop through each of the other arrays and check if the value is present
    for (let i = 1; i < arrays.length; i++) {
      if (!arrays[i].includes(value)) {
        isInAllArrays = false;
        break;
      }
    }

    // If the value is present in all arrays, add it to the commonValues array
    if (isInAllArrays) {
      commonValues.push(value);
    }
  }

  return commonValues;
};

/**
 * Get daily menu from Food & Co API.
 *
 * @param {int} restaurantId - The id of the restaurant to get daily menu from
 * @returns Object
 */
const getDailyMenu = async (restaurantId) => {
  try {
    let menu;

    // Get the finnish weekly meny
    const weeklyMenuFi = await doFetch(
      `${menuUrlFi}${restaurantId}&language=fi&date=${today}`,
      true
    );

    // Get the daily menu filtering with date
    const dailyMenuFi = weeklyMenuFi.menus.filter((menu) =>
      menu.date.includes(today)
    );

    // Get the english weekly meny
    const weeklyMenuEn = await doFetch(
      `${menuUrlFi}${restaurantId}&language=en&date=${today}`,
      true
    );

    // Get the daily menu filtering with date
    const dailyMenuEn = weeklyMenuEn.menus.filter((menu) =>
      menu.date.includes(today)
    );

    if (dailyMenuFi && dailyMenuEn) {
      menu = dailyMenuFi[0].menuPackages.map((menuPackage) => {
        // The formatter to format meals to "Meal1, meal2 and meal3" format
        const formatter = new Intl.ListFormat('fi', {
          style: 'long',
          type: 'conjunction',
        });

        let fi = formatter.format(
          menuPackage.meals.map((meal) => meal.name.toLowerCase())
        );

        fi = fi.charAt(0).toUpperCase() + fi.slice(1);

        let dietcodes = getCommonValues(
          menuPackage.meals.map((meal) => meal.diets)
        );

        return {
          nameFi: fi,
          nameEn: fi,
          dietcodes: dietcodes,
          price: menuPackage.price,
        };
      });
    } else {
      console.log('Ei menua!');
    }

    // const dailyMenuFi = weeklyMenuFi.menus[getWeeklyIndex()];

    // const weeklyMenuEn = await doFetch(
    //   `${menuUrlEn}${restaurantId}&language=en&date=${today}`,
    //   true
    // );

    // const dailyMenuEn = weeklyMenuEn.menus[getWeeklyIndex()];

    // if (dailyMenuFi) {
    //   menuFi = Object.values(dailyMenuFi.menuPackages).map((menuPackage) => {
    //     return menuPackage.meals.map((meal) => meal.name).join(', ');
    //   });
    // } else {
    //   menuFi = ['Ei menua tälle päivälle.'];
    // }

    // if (dailyMenuEn) {
    //   menuEn = Object.values(dailyMenuEn.menuPackages).map((menuPackage) => {
    //     return menuPackage.meals.map((meal) => meal.name).join(', ');
    //   });
    // } else {
    //   menuEn = ['No menu for today.'];
    // }

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
      title: 'Food & Co',
      menu: menu,
      dietcodeExplanations: dietExplanations,
    };
  } catch (e) {
    throw new Error('getDailyMenu error: ' + e);
  }
};

const FoodCo = {getDailyMenu};
export default FoodCo;
