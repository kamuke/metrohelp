/**
 * Navigation render funtionalities.
 *
 * @module NavRender
 * @author Kerttu
 */

'use strict';

/**
 * Change navigation's active state when scrolling on page.
 *
 * @param {NodeList} navLinks
 * @param {NodeList} sections
 */
const changeActiveStateOnNavLinksWhenScrolling = (navLinks, sections) => {
  let current;

  // Loop sections
  for (const sec of sections) {
    const sectionTop = sec.offsetTop;

    if (scrollY >= sectionTop - 60) {
      // Set sec's id as current
      current = sec.getAttribute('id');
    }
  }

  for (const link of navLinks) {
    link.classList.remove('active');

    if (link.attributes.href.value.includes(current)) {
      link.classList.add('active');
    }
  }
};

/**
 * Render navigation link names, selected language and selected campus.
 *
 * @param {String} lang
 * @param {String} campus
 * @param {Node} selectLangEl - Language select node element
 * @param {Node} selectCampusEl - Language select node element
 */
const renderNav = (lang, campus, selectLangEl, selectCampusEl) => {
  // Navigation's link names
  const navLinkNames = {
    fi: ['Tiedotteet', 'Ruokalista', 'HSL'],
    en: ['Announcements', 'Menu', 'HSL'],
  };

  // Desktop nav links
  const desNavLinks = document.querySelectorAll(
    '#navbar-toggler .nav-link-name'
  );

  // Mobile nav links
  const mobNavLinks = document.querySelectorAll(
    '.navbar-mobile .nav-link-name'
  );

  // Loop link names to links
  for (let i = 0; i < desNavLinks.length; i++) {
    desNavLinks[i].innerHTML =
      lang === 'fi' ? navLinkNames.fi[i] : navLinkNames.en[i];
    mobNavLinks[i].innerHTML =
      lang === 'fi' ? navLinkNames.fi[i] : navLinkNames.en[i];
  }

  const langOptions = selectLangEl.options;
  const campusOptions = selectCampusEl.options;

  for (let i = 0; i < langOptions.length; i++) {
    if (langOptions[i].value === lang) {
      selectLangEl.selectedIndex = i;
      break;
    }
  }

  for (let i = 0; i < campusOptions.length; i++) {
    if (campusOptions[i].value === campus) {
      selectCampusEl.selectedIndex = i;
      break;
    }
  }
};
const NavRender = {
  changeActiveStateOnNavLinksWhenScrolling,
  renderNav,
};

export default NavRender;
