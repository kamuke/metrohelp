/**
 * Navigation funtionalities.
 *
 * @author Kerttu
 */

'use strict';

const mobileNavLinks = document.querySelectorAll(
  '.navbar-mobile-nav .nav-link'
);
const desktopNavLinks = document.querySelectorAll('#navbar-toggler .nav-link');
const sections = document.querySelectorAll('section');

/**
 * Adds cliks event listeners to toggle active state on links.
 */
const addClickListenersToNavLinks = () => {
  for (const link of desktopNavLinks) {
    link.addEventListener('click', () => {
      changeActiveStateOnNavLinks(desktopNavLinks, mobileNavLinks, link);
    });
  }

  for (const link of mobileNavLinks) {
    link.addEventListener('click', () => {
      changeActiveStateOnNavLinks(mobileNavLinks, desktopNavLinks, link);
    });
  }
};

/**
 * Change navigation's active state when scrolling on page.
 */
const changeActiveStateOnNavLinksWhenScrolling = () => {
  let current;

  for (const sec of sections) {
    const sectionTop = sec.offsetTop;

    if (scrollY >= sectionTop - 60) {
      current = sec.getAttribute('id');
    }
  }

  for (const link of mobileNavLinks) {
    link.classList.remove('active');

    if (link.attributes.href.value.includes(current)) {
      link.classList.add('active');
    }
  }

  for (const link of desktopNavLinks) {
    link.classList.remove('active');

    if (link.attributes.href.value.includes(current)) {
      link.classList.add('active');
    }
  }
};

/**
 * Check if url has # and change navigation's link active states according to #.
 */
const checkIfUrlHasHash = () => {
  // Check if url has # and then add active class to the nav link
  if (window.location.hash) {
    // Store hash
    const hash = window.location.hash;

    // Loop nav links, find links that have the same href as hash and add active class

    for (const link of mobileNavLinks) {
      link.classList.remove('active');
      if (link.attributes.href.value === hash) {
        link.classList.add('active');
      }
    }

    for (const link of desktopNavLinks) {
      link.classList.remove('active');
      if (link.attributes.href.value === hash) {
        link.classList.add('active');
      }
    }
  }
};

/**
 * Change active state on navigation.
 *
 * @param {array} removeActiveArr - Array of node elements to remove active state.
 * @param {array} addActiveArr - Array of node elements to remove and ADD active state.
 * @param {node} target
 */
const changeActiveStateOnNavLinks = (removeActiveArr, addActiveArr, target) => {
  for (const link of removeActiveArr) {
    link.classList.remove('active');
  }

  for (const link of addActiveArr) {
    link.classList.remove('active');

    if (link.href === target.href) {
      link.classList.add('active');
    }
  }

  target.classList.add('active');
};

const Navigation = {
  addClickListenersToNavLinks,
  checkIfUrlHasHash,
  changeActiveStateOnNavLinksWhenScrolling,
};
export default Navigation;
