/**
 * @author Kerttu
 */
'use strict';

import './styles/style.scss';
import 'bootstrap';
import ServiceWorker from './assets/modules/service-worker';
// import HSL from './assets/modules/hsl-data';
import Sodexo from './assets/modules/sodexo-data';
import FoodCo from './assets/modules/food-co-data';
import Announcement from './assets/modules/announcement';

// Metropolia's campuses and needed info
const campuses = [
  {
    name: 'Arabia',
    restaurant: {
      id: 1251,
      chain: 'Food & Co',
    },
    location: {lat: 60.2100515020518, lon: 24.97677582883559},
  },
  {
    name: 'Karaportti',
    restaurant: {id: 3208, chain: 'Food & Co'},
    location: {lat: 60.22412908302269, lon: 24.7584602544428},
  },
  {
    name: 'Myllypuro',
    restaurant: {id: 158, chain: 'Sodexo'},
    location: {lat: 60.223621756949434, lon: 25.077913869785164},
  },
  {
    name: 'Myyrmäki',
    restaurant: {id: 152, chain: 'Sodexo'},
    location: {lat: 60.258843352326785, lon: 24.84484968512866},
  },
];

// User settings
// TODO: Save to localStorage + load from localStorage
let settings = {
  lang: 'en',
  campus: 'Myllypuro',
  darkmode: false,
  departures: 2,
};

// To store menu, routes and annoucements
let menu;
// let routes;
let annoucements;

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
      dietcodeBadge.classList = 'badge rounded-pill bg-primary';
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

  menusHeading.innerHTML =
    settings.lang === 'fi'
      ? `Ruokalista - ${menu.title}`
      : `Menu - ${menu.title}`;

  let date = `${new Date().toLocaleDateString(settings.lang, {
    weekday: 'long',
  })} ${new Date().toLocaleDateString(settings.lang)}`;

  date = date.charAt(0).toUpperCase() + date.slice(1);

  menusDate.innerHTML = date;

  dietcodeBtn.innerHTML =
    settings.lang === 'fi' ? 'Ruokavaliokoodit' : 'Dietcodes';

  dietcodeBody.innerHTML =
    settings.lang === 'fi'
      ? menu.dietcodeExplanations.fi
      : menu.dietcodeExplanations.en;

  renderAllMenuListItems(menu);
};

/**
 * Converts HSL time from secconds to 00:00 format
 * @param {number} seconds
 * @returns time string in 00:00 format
 */
// const convertTime = (seconds) => {
//   const hours = Math.floor(seconds / 3600);
//   const mins = Math.floor((seconds % 3600) / 60);
//   return `${hours == 24 ? '00' : hours}:${mins < 10 ? '0' + mins : mins}`;
// };

/**
 * @author Eeli
 * @param {string} selectedCampus - Selected campus to get HSL routes
 * @param {array} allCampuses - List of all campuses and infos.
 * @returns Sorted array
 */
// const getRoutes = async (selectedCampus, allCampuses) => {
//   for (const campus of allCampuses) {
//     if (selectedCampus === campus.name) {
//       const routesData = await HSL.getRoutesByLocation(
//         campus.location.lat,
//         campus.location.lon,
//         settings.departures
//       );
//       let routesArray = [];
//       for (const route of routesData) {
//         for (let i = 0; i < settings.departures; i++) {
//           routesArray.push(route[i]);
//         }
//       }
//       return routesArray.sort((a, b) => {
//         return a.routeRealtimeDeparture - b.routeRealtimeDeparture;
//       });
//     }
//   }
// };

/**
 *
 * @param {array} routes - Array of sorted routes
 */
// const renderRouteInfo = async (routes) => {
//   const target = document.querySelector('#hsl-section');
//   for (const route of routes) {
//     const routeContainer = document.createElement('div');
//     routeContainer.classList = 'route-info container';
//     const stopCode = document.createElement('p');
//     stopCode.classList = 'badge bg-secondary';
//     // const stopName = document.createElement('p');
//     const routeNumber = document.createElement('p');
//     if (route.mode == 'BUS') {
//       routeNumber.classList = 'badge bg-info';
//     } else if (route.mode == 'SUBWAY') {
//       routeNumber.classList = 'badge bg-primary';
//     } else if (route.mode == 'TRAM') {
//       routeNumber.classList = 'badge bg-success';
//     } else if (route.mode == 'RAIL') {
//       routeNumber.classList = 'badge bg-light';
//     }

//     const destination = document.createElement('p');
//     destination.classList = 'badge bg-dark';
//     const routeRealtimeDeparture = document.createElement('p');
//     routeRealtimeDeparture.classList = 'badge bg-success';
//     stopCode.textContent = route.stopCode;
//     // stopName.textContent = route.stopName;
//     routeNumber.textContent = route.routeNumber;
//     destination.textContent = route.destination;
//     routeRealtimeDeparture.textContent = convertTime(
//       route.routeRealtimeDeparture
//     );
//     routeContainer.append(
//       stopCode,
//       routeNumber,
//       //stopName,
//       destination,
//       routeRealtimeDeparture
//     );
//     target.append(routeContainer);
//   }
// };

/**
 * Helper for setting different attributes to an element.
 *
 */
const setAttributes = (element, attrs) => {
  for (const key in attrs) {
    element.setAttribute(key, attrs[key]);
  }
};

const renderAnnouncementCarouselSlide = (
  announcement,
  index,
  targetElement
) => {
  const rowDiv = document.createElement('div');
  const colDivImg = document.createElement('div');
  const colDivContent = document.createElement('div');
  const cardBodyDiv = document.createElement('div');
  const aLink = document.createElement('a');
  const img = document.createElement('img');
  const title = document.createElement('h3');
  const text = document.createElement('p');
  const showMore = document.createElement('p');

  aLink.classList =
    index === 0 ? 'card carousel-item active' : 'card carousel-item';
  rowDiv.classList = 'row g-1';
  colDivImg.classList = 'col-md-8 card-img-container';
  colDivContent.classList = 'col-md-4 card-content';
  cardBodyDiv.classList = 'card-body';
  img.classList = 'img-fluid';
  title.classList = 'card-title fs-4';
  text.classList = 'card-text';
  showMore.classList = 'text-primary fs-6';

  setAttributes(img, {
    src: announcement.imgUrl,
    alt: announcement.title,
  });
  setAttributes(aLink, {
    'data-bs-toggle': 'modal',
    'data-bs-target': '#modal-' + (index + 1),
  });

  text.textContent = announcement.body;
  title.textContent = announcement.title;
  showMore.innerHTML = `<u> ${
    settings.lang && settings.lang === 'en' ? 'Show more' : 'Näytä lisää'
  } <i class="bi bi-arrow-right"></i> </u>`;

  cardBodyDiv.append(title, text, showMore);
  colDivContent.append(cardBodyDiv);
  colDivImg.append(img);
  rowDiv.append(colDivImg, colDivContent);
  aLink.append(rowDiv);
  targetElement.append(aLink);
};

const renderAnnouncementCarousel = (announcements) => {
  const annCarousel = document.querySelector('#announcements-carousel-inner');
  const carouselNavBtns = document.querySelector('#carousel-navigation');
  annCarousel.innerHTML = '';
  carouselNavBtns.innerHTML = '';

  for (let i = 0; i < announcements.length; i++) {
    const announcement =
      settings.lang && settings.lang === 'en'
        ? announcements[i].en
        : announcements[i].fi;
    renderAnnouncementCarouselSlide(announcement, i, annCarousel);
    const li = document.createElement('li');
    const button = document.createElement('button');
    li.classList = 'page-item';
    button.classList = i === 0 ? 'page-link active' : 'page-link';
    setAttributes(button, {
      type: 'button',
      'data-bs-target': '#announcements-carousel',
      'data-bs-slide-to': i,
      'aria-label': 'Slide ' + (i + 1),
    });
    if (i === 0) {
      button.setAttribute('aria-current', 'true');
    }
    button.innerHTML = i + 1;
    li.append(button);
    carouselNavBtns.append(li);
  }

  console.log(announcements.length);

  if (announcements.length > 1) {
    const previousLi = document.createElement('li');
    const previousBtn = document.createElement('button');
    const nextLi = document.createElement('li');
    const nextBtn = document.createElement('button');
    previousLi.classList = 'page-item';
    nextLi.classList = 'page-item';
    previousBtn.classList = 'page-link';
    nextBtn.classList = 'page-link';
    setAttributes(previousBtn, {
      type: 'button',
      'data-bs-target': '#announcements-carousel',
      'data-bs-slide': 'prev',
      'aria-label': 'Edellinen/Previous',
    });
    setAttributes(nextBtn, {
      type: 'button',
      'data-bs-target': '#announcements-carousel',
      'data-bs-slide': 'next',
      'aria-label': 'Seuraava/Next',
    });
    previousBtn.innerHTML = '<span aria-hidden="true">&laquo;</span>';
    nextBtn.innerHTML = '<span aria-hidden="true">&raquo;</span>';
    previousLi.append(previousBtn);
    nextLi.append(nextBtn);
    carouselNavBtns.prepend(previousLi);
    carouselNavBtns.append(nextLi);
  }
};

/**
 * App initialization.
 */
const init = async () => {
  menu = await getMenu(settings.campus, campuses);
  // routes = await getRoutes(settings.campus, campuses);
  annoucements = await Announcement.getAnnouncements();
  console.log(annoucements);
  renderMenuSection(menu);
  renderAnnouncementCarousel(annoucements);
  // renderRouteInfo(routes);
  ServiceWorker.register();
};

init();
