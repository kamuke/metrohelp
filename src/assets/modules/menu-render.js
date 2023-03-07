/**
 * Module for Sodexo/Food & Co data rendering.
 *
 * @module MenuRender
 * @author Kerttu & Catrina
 */

'use strict';

import Sodexo from './sodexo-data';
import FoodCo from './food-co-data';
//import settings from '/src/index';

/**
 * Get menu from Sodexo or Food & Co module.
 *
 * @author Kerttu
 * @param {string} selectedCampus - Selected campus to get it's restaurant's menu.
 * @param {array} allCampuses - List of all campuses and infos.
 * @returns Object
 */
const getMenu = async (selectedCampus, allCampuses) => {
  for (const campus of allCampuses) {
    if (selectedCampus === campus.name) {
      if (campus.restaurant.chain === 'Sodexo') {
        return await Sodexo.getDailyMenu(campus.restaurant.id);
      } else if (campus.restaurant.chain === 'Food & Co') {
        return await FoodCo.getDailyMenu(campus.restaurant.id);
      }
    }
  }
};

/**
 * Render menu params values in list element to targeted element.
 *
 * @author Kerttu
 * @param {Object} menu - Object which values are appended to targetElement.
 * @param {Node} targetElement - Node element to append menu params values in list element.
 */
const renderMenuListItem = async (menu, targetElement) => {
  const menuList = document.createElement('li');
  const menuBody = document.createElement('div');
  const menuNameFI = document.createElement('p');
  const menuNameEN = document.createElement('p');

  menuList.classList = 'menu list-group-item';
  menuBody.classList = 'menu-body';
  menuNameFI.classList = 'menu-name';
  menuNameEN.classList = 'menu-name';

  menuNameFI.textContent = menu.fi;
  menuNameEN.textContent = menu.en;

  menuBody.append(menuNameFI, menuNameEN);

  if (menu.price) {
    const menuPrice = document.createElement('p');
    menuPrice.classList = 'menu-price';
    menuPrice.textContent = menu.price;
    menuBody.append(menuPrice);
  }

  menuList.append(menuBody);

  if (menu.dietcodes) {
    const menuDietcodes = document.createElement('div');
    menuDietcodes.classList = 'menu-dietcodes';

    for (const dietcode of menu.dietcodes) {
      const dietcodeBadge = document.createElement('span');
      dietcodeBadge.classList = 'badge bg-primary';
      dietcodeBadge.textContent = dietcode;
      menuDietcodes.append(dietcodeBadge);
    }
    menuList.append(menuDietcodes);
  }

  targetElement.append(menuList);
};

/**
 * Render all menu list items to menus ul element.
 *
 * @author Kerttu
 * @param {Object} menu - Menu to render.
 */
const renderAllMenuListItems = async (menu) => {
  const menusUl = document.querySelector('#menus-list');
  menusUl.innerHTML = '';

  // Loop menus to menusUl
  for (const menuItem of menu.menu) {
    renderMenuListItem(menuItem, menusUl);
  }
};

/**
 * Render menu section: heading, date, menu ul list and dietcode explanations.
 *
 * @author Kerttu
 * @param {Object} menu - Menu to render to menu ul list.
 */
const renderMenuSection = async (menu) => {
  const menusHeading = document.querySelector('#menus-heading');

  const dietcodeBodyFI = document.querySelector('#dietcode-exp-body-fi');
  const dietcodeBodyEN = document.querySelector('#dietcode-exp-body-en');

  const menusHeadingTitle = document.createTextNode(' - ' + menu.title);

  menusHeading.appendChild(menusHeadingTitle);

  dietcodeBodyFI.innerHTML = menu.dietcodeExplanations.fi;
  dietcodeBodyEN.innerHTML = menu.dietcodeExplanations.en;

  renderAllMenuListItems(menu);
};

const MenuRender = {
  getMenu,
  renderMenuListItem,
  renderAllMenuListItems,
  renderMenuSection,
};

export default MenuRender;
