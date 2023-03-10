/**
 * Rendering functions for announcements.
 *
 * @module AnnouncementRender
 * @author Kerttu
 */

'use strict';

/**
 * Render announcements carousel slides and modals.
 *
 * @param {Array} announcements
 * @param {String} lang - 'fi'/'en'
 */
const renderAnnouncements = (announcements, lang) => {
  const heading = document.querySelector('#announcements-heading');
  const carousel = document.querySelector('#announcements-carousel-inner');
  const modalContainer = document.querySelector('#announcement-modals');
  const carouselNavBtns = document.querySelector('#carousel-navigation');

  heading.innerHTML = lang === 'fi' ? 'Tiedotteet' : 'Announcements';
  carousel.innerHTML = '';
  carouselNavBtns.innerHTML = '';
  modalContainer.innerHTML = '';

  // If announcements is empty and there is no announcements
  if (announcements.length === 0) {
    const paragraph = document.createElement('p');
    paragraph.classList = 'p-3 m-0 no-announcements';
    paragraph.textContent =
      lang === 'fi'
        ? 'Tiedotteita ei ole saatavilla.'
        : 'No announcements available.';
    carousel.append(paragraph);
    return;
  }

  for (let i = 0; i < announcements.length; i++) {
    const announcement =
      lang === 'fi' ? announcements[i].fi : announcements[i].en;

    renderAnnCarouselSlide(announcement, i, carousel, lang);
    renderAnnModal(announcement, i, modalContainer);

    const li = document.createElement('li');
    const button = document.createElement('button');

    setAttributes(button, {
      class: i === 0 ? 'page-link active' : 'page-link',
      type: 'button',
      'data-bs-target': '#announcements-carousel',
      'data-bs-slide-to': i,
      'aria-label': 'Slide ' + (i + 1),
    });

    li.classList = 'page-item';

    button.innerHTML = i + 1;

    li.append(button);
    carouselNavBtns.append(li);
  }

  // Render navigation for carousel
  if (announcements.length > 1) {
    const previousLi = document.createElement('li');
    const previousBtn = document.createElement('button');
    const nextLi = document.createElement('li');
    const nextBtn = document.createElement('button');

    previousLi.classList = 'page-item';
    nextLi.classList = 'page-item';

    setAttributes(previousBtn, {
      class: 'page-link',
      type: 'button',
      'data-bs-target': '#announcements-carousel',
      'data-bs-slide': 'prev',
      'aria-label': 'Edellinen/Previous',
    });

    setAttributes(nextBtn, {
      class: 'page-link',
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
 * Render carousel slide for an announcement to a target element.
 *
 * @param {Object} announcement
 * @param {Number} index
 * @param {Node} targetElement
 * @param {String} lang - 'fi'/'en'
 */
const renderAnnCarouselSlide = (announcement, index, targetElement, lang) => {
  const rowDiv = document.createElement('div');
  const colDivImg = document.createElement('div');
  const colDivContent = document.createElement('div');
  const cardBodyDiv = document.createElement('div');
  const aLink = document.createElement('a');
  const img = document.createElement('img');
  const title = document.createElement('h3');
  const showMore = document.createElement('p');

  setAttributes(aLink, {
    class: index === 0 ? 'card carousel-item active' : 'card carousel-item',
    'data-bs-toggle': 'modal',
    'data-bs-target': '#modal-' + (index + 1),
    href: '',
  });

  setAttributes(img, {
    class: 'img-fluid',
    src: announcement.smallerImgUrl,
    alt: announcement.title,
    // loading: index === 0 ? 'auto' : 'lazy',
    width: '866',
    height: '487',
  });

  rowDiv.classList = 'row g-1';
  colDivImg.classList = 'col-md-8 card-img-container';
  colDivContent.classList = 'col-md-4 card-content';
  cardBodyDiv.classList = 'card-body';
  title.classList = 'card-title fs-4';
  showMore.classList = 'text-primary fs-6';

  title.textContent = announcement.title;
  showMore.innerHTML = `<u> ${
    lang === 'fi' ? 'N??yt?? lis????' : 'Show more'
  } <i class="bi bi-arrow-right"></i> </u>`;

  cardBodyDiv.append(title, showMore);
  colDivContent.append(cardBodyDiv);
  colDivImg.append(img);
  rowDiv.append(colDivImg, colDivContent);
  aLink.append(rowDiv);
  targetElement.append(aLink);
};

/**
 * Render modal for an announcement to a target element.
 *
 * @param {Object} announcement
 * @param {Number} index
 * @param {Node} targetElement
 */
const renderAnnModal = (announcement, index, targetElement) => {
  const modal = document.createElement('div');
  const article = document.createElement('article');
  const modalContent = document.createElement('div');
  const modalHeader = document.createElement('div');
  const h3 = document.createElement('h3');
  const closeBtn = document.createElement('button');
  const modalBody = document.createElement('div');
  const img = document.createElement('img');

  setAttributes(modal, {
    class: 'modal fade',
    id: `modal-${index + 1}`,
    tabindex: '-1',
    'aria-labelledby': `modal-${index + 1}-label`,
    'aria-hidden': 'true',
  });

  setAttributes(h3, {
    class: 'modal-title',
    id: `modal-${index + 1}-label`,
  });

  setAttributes(closeBtn, {
    type: 'button',
    class: 'btn-close',
    'data-bs-dismiss': 'modal',
    'aria-label': 'Close',
  });

  setAttributes(img, {
    src: announcement.smallerImgUrl,
    class: 'd-block w-100 h-100',
    alt: announcement.title,
    loading: 'lazy',
    width: '935',
    height: '526',
  });

  article.classList = 'modal-dialog';
  modalContent.classList = 'modal-content';
  modalHeader.classList = 'modal-header';
  modalBody.classList = 'modal-body';

  modalBody.innerHTML = announcement.body;

  modalBody.prepend(img);
  h3.textContent = announcement.title;
  modalHeader.append(h3, closeBtn);
  modalContent.append(modalHeader, modalBody);
  article.append(modalContent);
  modal.append(article);
  targetElement.append(modal);
};

/**
 * Set multiple attributes to a node element.
 *
 * @param {Node} element
 * @param {Object} attrs
 */
const setAttributes = (element, attrs) => {
  for (const key in attrs) {
    element.setAttribute(key, attrs[key]);
  }
};

const AnnouncementRender = {
  renderAnnouncements,
};

export default AnnouncementRender;
