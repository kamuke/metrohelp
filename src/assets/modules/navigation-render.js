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
 * Render navigation selected campus.
 *
 * @param {String} campus
 */
const renderNav = (campus) => {

  const selectCampusEl = document.querySelector('#select-campus');
  selectCampusEl.innerHTML = campus+' | ';

  getTime();

};

/**
 * Get current time in Helsinki, update per minute
 */
const getTime = () => {
  const d = new Date();
  d.toLocaleString('fi', { timeZone: 'Europe/Helsinki' });
  let h = d.getHours();
  let m = d.getMinutes();
  m = checkTime(m);
  document.querySelector('#navi-clock').innerHTML =  h + ':' + m;
  setTimeout(getTime, 1000);
};

/**
 *
 * @param m - check minutes, if below 10 add a zero in front of minute nbmr
 * @returns {m} - minute
 */
const checkTime = (m) => {
  if (m < 10) {m = '0'+ m;}
  return m;
};

const NavRender = {
  changeActiveStateOnNavLinksWhenScrolling,
  renderNav,
};

export default NavRender;
