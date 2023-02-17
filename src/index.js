/**
 * @author: Kerttu
 */
'use strict';

import './styles/style.scss';
import 'bootstrap';
import ServiceWorker from './assets/modules/service-worker';

/**
 * App initialization.
 */
const init = async () => {
  console.log('Testi!');
  ServiceWorker.register();
};

init();
