/**
 * Module for Food & Co menu data parsing.
 *
 * @module: Food & Co
 * @author: Kerttu
 */

'use strict';

import {doFetch} from './network';

// If testing on weekend, use hard coded date as '2023-02-16'
const today = new Date().toISOString().split('T')[0];
const weeklyUrl = 'https://www.compass-group.fi/menuapi/week-menus?costCenter=';

/**
 * Get daily menu from Food & Co API.
 *
 * @param {int} restaurantId - The id of the restaurant to get daily menu from
 * @returns Object
 */
const getDailyMenu = async (restaurantId) => {
  try {
    let menu;

    // Fetch the finnish weekly menu
    const weeklyMenuFi = await doFetch(
      `${weeklyUrl}${restaurantId}&language=fi&date=${today}`,
      true
    );

    // Get the finnish daily menu according to the date
    const dailyMenuFi = weeklyMenuFi.menus.filter((menu) =>
      menu.date.includes(today)
    );

    // Fetch the english weekly menu
    const weeklyMenuEn = await doFetch(
      `${weeklyUrl}${restaurantId}&language=en&date=${today}`,
      true
    );

    // Get the english daily menu according to the date
    const dailyMenuEn = weeklyMenuEn.menus.filter((menu) =>
      menu.date.includes(today)
    );

    // Check if menus exists
    if (dailyMenuFi[0] && dailyMenuEn[0]) {
      // Create menu from menuPackages
      menu = dailyMenuFi[0].menuPackages.map((menuPackage) => {
        const name = getFormattedStringFromArray(
          'fi',
          menuPackage.meals.map((meal) => meal.name)
        );

        // Dietcodes to array
        let dietcodes = getCommonValues(
          menuPackage.meals.map((meal) => meal.diets)
        );

        dietcodes = dietcodes.map((dietcode) => dietcode.toUpperCase());

        // Price in '2,95 € / 6,50 € / 7,85 €' format
        // Note: Arabia's restaurant doesn't have prices
        const price = menuPackage.price
          ? menuPackage.price.split('/').join(' € / ') + ' €'
          : '2,95 € / 6,50 € / 7,85 €';

        return {
          fi: name,
          dietcodes: dietcodes,
          price: price,
        };
      });

      // Get the english menu from dailyMenuEn
      const menuEn = dailyMenuEn[0].menuPackages.map((menuPackage) => {
        return getFormattedStringFromArray(
          'en',
          menuPackage.meals.map((meal) => meal.name)
        );
      });

      // Loop the english menu names to menu
      for (let i = 0; i < menu.length; i++) {
        menu[i].en = menuEn[i];
      }
    } else {
      // If there is no menu for the day
      menu = [{fi: 'Ei menua tälle päivälle.', en: 'No menu for today.'}];
    }

    // Dietcode explanations from Food & Co's site
    const dietExplanations = {
      fi: '(G) Gluteeniton, (L) Laktoositon, (VL) Vähälaktoosinen, (M) Maidoton, (*) Suomalaisten ravitsemussuositusten mukainen, (VEG) Soveltuu vegaaniruokavalioon, (ILM) Ilmastoystävällinen, (VS) Sis. tuoretta valkosipulia, (A) Sis. Allergeeneja',
      en: '(G) Gluten-free, (L) Lactose-free, (VL) Low lactose, (M) Dairy-free, (*) Comply with Finnish nutrition recommendations, (VEG) Suitable for vegans, (ILM) Climate-friendly, (VS) Contains fresh garlic, (A) Contains allergens',
    };

    return {
      title: 'Food & Co',
      menu: menu,
      dietcodeExplanations: dietExplanations,
    };
  } catch (e) {
    throw new Error('getDailyMenu error: ' + e);
  }
};

/**
 * Get values that are included in all arrays of the array param.
 *
 * @param {array} array - An array containing arrays.
 * @returns Array
 */
const getCommonValues = (array) => {
  // Create an array to hold the common values
  let commonValues = [];

  // Loop through each value in the first array
  for (const arr of array[0]) {
    let value = arr;
    let isInAllArrays = true;

    // Loop through each of the other arrays and check if the value is present
    for (let i = 1; i < array.length; i++) {
      if (!array[i].includes(value)) {
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
 * Get array as a one string in language sensitive format.
 * Example output: "Hash, chili mayonnaise and pickled cucumber"
 *
 * @param {string} lang - String, example 'fi', 'en'
 * @param {array} array - The array to format into one string
 * @returns String
 */
const getFormattedStringFromArray = (lang, array) => {
  // Create the formatter
  const formatter = new Intl.ListFormat(lang, {
    style: 'long',
    type: 'conjunction',
  });

  // Format the array and make it lower case
  const formatted = formatter.format(array).toLowerCase();

  // Return formatted with capitalized first letter
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const FoodCo = {getDailyMenu};
export default FoodCo;
