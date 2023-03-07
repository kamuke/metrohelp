/**
 * Navigation render funtionalities.
 *
 * @module NavRender
 * @author Kerttu & Catrina
 */

'use strict';

/**
 * Render navigation selected campus.
 *
 * @param {String} campus
 */
const renderNav = (campus) => {
  const selectCampusEl = document.querySelector('#select-campus');
  const date = document.querySelector('#navi-date');

  selectCampusEl.innerHTML = campus;

  let dateFi = `${new Date().toLocaleDateString('fi', {
    weekday: 'long',
  })}`;
  let dateEn = `${new Date().toLocaleDateString('en', {
    weekday: 'long',
  })}`;

  let dateDate = `${new Date().toLocaleDateString('fi')}`;

  dateFi = dateFi.charAt(0).toUpperCase() + dateFi.slice(1);
  dateEn = dateEn.charAt(0).toUpperCase() + dateEn.slice(1);

  date.innerHTML = `${dateFi}` + ' / ' + `${dateEn}` + ' ' + dateDate;
  
  getTime();
};

/**
 * Get current time in Helsinki, update per minute
 */
const getTime = () => {
  const d = new Date();
  d.toLocaleString('fi', {timeZone: 'Europe/Helsinki'});
  let h = d.getHours();
  let m = d.getMinutes();
  m = checkTime(m);
  document.querySelector('#navi-clock').innerHTML = h + ':' + m;
  setTimeout(getTime, 1000);
};

/**
 * @param m - check minutes, if below 10 add a zero in front of minute nbmr
 * @returns {number} m - minute
 */
const checkTime = (m) => {
  if (m < 10) {
    m = '0' + m;
  }
  return m;
};

const NavRender = {
  renderNav,
};

export default NavRender;
