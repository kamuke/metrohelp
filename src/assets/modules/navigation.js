/**
 * Navigation funtionalities.
 *
 * @author Kerttu
 */

'use strict';

const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section');

/**
 * Change navigation's active state when scrolling on page.
 */
const changeActiveStateOnNavLinksWhenScrolling = () => {
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

const Navigation = {
  changeActiveStateOnNavLinksWhenScrolling,
};

export default Navigation;
