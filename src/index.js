/**
 * @author: Kerttu
 */
'use strict';

import './styles/style.scss';
import 'bootstrap';
import ServiceWorker from './assets/modules/service-worker';
import Sodexo from './assets/modules/sodexo-data';

let restaurants = [
  {name: 'Karaportti', id: 3208, chain: 'Food & Co'},
  {name: 'Myyrmäki Leiritie', id: 152, chain: 'Sodexo'},
  {name: 'Myllypuro', id: 158, chain: 'Sodexo'},
];

/**
 * App initialization.
 */
const init = async () => {
  const menu = await Sodexo.getDailyMenu(restaurants[1].id);
  console.log(menu);
  ServiceWorker.register();
};

init();
