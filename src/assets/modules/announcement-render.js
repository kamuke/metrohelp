/**
 * Rendering functions for announcements.
 *
 * @module AnnouncementRender
 * @author Kerttu
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
  const parentNode = document.querySelector('main');
  //loop through announcements in reverse so that imgs print in correct order
  for(let i = announcements.length-1; i>=0; i--) {

    const announcementEN = announcements[i].en;
    const announcementFI = announcements[i].fi;

    const announcement = {announcementEN, announcementFI};

    const section = document.createElement('section');
    const sectionEN = document.createElement('section');

    const carousel = document.createElement('div');
    const carouselEN = document.createElement('div');


    const img = document.createElement('img');
    const imgEN = document.createElement('img');

    setAttributes(img, {
      class: 'img-fluid img-carousel',
      src: announcement.announcementFI.imgUrl,
      alt: announcement.announcementFI.title,
    });

    setAttributes(imgEN, {
      class: 'img-fluid img-carousel',
      src: announcement.announcementEN.imgUrl,
      alt: announcement.announcementEN.title,
    });
    carousel.classList.add('img-div');
    carouselEN.classList.add('img-div');
    section.class = 'announcements-section pt-3 pb-4 pt-md-5 pb-md-0';
    sectionEN.class = 'announcements-section pt-3 pb-4 pt-md-5 pb-md-0';

    carouselEN.appendChild(imgEN);
    sectionEN.appendChild(carouselEN);
    parentNode.insertBefore(sectionEN, parentNode.firstChild);

    carousel.appendChild(img);
    section.appendChild(carousel);
    parentNode.insertBefore(section, parentNode.firstChild);

  }

};

const AnnouncementRender = {
  renderAnnouncements,
};

export default AnnouncementRender;
