/**
 * Module for Sodexo/Food & Co data rendering.
 *
 * @module MenuRender
 * @author Kerttu
 */

'use strict';

import Sodexo from './sodexo-data';
import FoodCo from './food-co-data';
import settings from '/src/index';

/**
 * Get menus from Sodexo and Food & Co module.
 *
 * @author Kerttu
 * @param {array} allCampuses - List of all campuses and infos.
 * @returns Array of objects or an empty array
 */
const getMenus = async (allCampuses) => {
  try {
    const menus = [];
    for (const campus of allCampuses) {
      if (campus.restaurant.chain === 'Sodexo') {
        const sodexo = await Sodexo.getDailyMenu(campus.restaurant.id);
        menus.push({campusName: campus.name, menu: sodexo});
      } else if (campus.restaurant.chain === 'Food & Co') {
        const foodCo = await FoodCo.getDailyMenu(campus.restaurant.id);
        menus.push({campusName: campus.name, menu: foodCo});
      }
    }
    return menus;
  } catch (e) {
    return [];
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
  const menuName = document.createElement('p');

  menuList.classList = 'menu list-group-item';
  menuBody.classList = 'menu-body';
  menuName.classList = 'menu-name';

  menuName.textContent = settings.lang === 'fi' ? menu.fi : menu.en;

  menuBody.append(menuName);

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
  const menusDate = document.querySelector('#menus-date');
  const dietcodeBtn = document.querySelector('#dietcode-exp-btn');
  const dietcodeBody = document.querySelector('#dietcode-exp-body');

  const title = menu.title ? `- ${menu.title}` : '';

  menusHeading.innerHTML =
    settings.lang === 'fi' ? `Ruokalista ${title}` : `Menu ${title}`;

  let date = `${new Date().toLocaleDateString(settings.lang, {
    weekday: 'long',
  })} ${new Date().toLocaleDateString(settings.lang)}`;

  date = date.charAt(0).toUpperCase() + date.slice(1);

  menusDate.innerHTML = date;

  // If menu is empty
  if (menu.length === 0) {
    renderAllMenuListItems({
      menu: [
        {
          fi: 'Ruokalistatietoja ei ole saatavilla.',
          en: 'No menu information available.',
        },
      ],
    });
    document.querySelector('#dietcode-explanations').style.display = 'none';
    return;
  }

  document.querySelector('#dietcode-explanations').style.display = 'inline';

  dietcodeBtn.innerHTML =
    settings.lang === 'fi' ? 'Ruokavaliokoodit' : 'Dietcodes';

  dietcodeBody.innerHTML =
    settings.lang === 'fi'
      ? menu.dietcodeExplanations.fi
      : menu.dietcodeExplanations.en;

  renderAllMenuListItems(menu);
};

const MenuRender = {
  getMenus,
  renderMenuListItem,
  renderAllMenuListItems,
  renderMenuSection,
};

export default MenuRender;
