/**
 * Module for registering the generated service worker.
 *
 * @module ServiceWorker
 * @author Kerttu
 */
'use strict';

/**
 * Register the generated service worker.
 */
const register = () => {
  // eslint-disable-next-line no-undef
  if (APP_CONF.productionMode && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./service-worker.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

const ServiceWorker = {register};
export default ServiceWorker;
