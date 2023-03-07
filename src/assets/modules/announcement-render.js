/**
 * Rendering functions for announcements.
 *
 * @module AnnouncementRender
 * @author Kerttu & Catrina
 */

'use strict';

/**
 * Set multipleattributes to a node element.
 *
 * @param {Node} element
 * @param {Object} attrs
 */
const setAttributes = (element, attrs) => {
  for (const key in attrs) {
    element.setAttribute(key, attrs[key]);
  }
};

/**
 * Render announcements' images.
 *
 * @param {Array} announcements
 */
const renderAnnouncements = (announcements) => {
  const parentNode = document.querySelector('#carousel');
  //loop through announcements in reverse so that imgs print in correct order
  for (let i = announcements.length - 1; i >= 0; i--) {
    const announcementEN = announcements[i].en;
    const announcementFI = announcements[i].fi;

    const announcement = {announcementEN, announcementFI};

    const section = document.createElement('section');
    const sectionEN = document.createElement('section');

    const img = document.createElement('img');
    const imgEN = document.createElement('img');

    setAttributes(img, {
      src: announcement.announcementFI.imgUrl,
      alt: announcement.announcementFI.title,
    });

    setAttributes(imgEN, {
      src: announcement.announcementEN.imgUrl,
      alt: announcement.announcementEN.title,
    });

    section.classList =
      'h-100 announcement-section align-items-center justify-content-end';
    sectionEN.classList =
      'h-100 announcement-section align-items-center justify-content-end';

    sectionEN.appendChild(imgEN);
    parentNode.insertBefore(sectionEN, parentNode.firstChild);

    section.appendChild(img);
    parentNode.insertBefore(section, parentNode.firstChild);
  }
};

const AnnouncementRender = {
  renderAnnouncements,
};

export default AnnouncementRender;
