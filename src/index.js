/**
 * @author: Kerttu
 */
'use strict';

import './styles/style.scss';
import 'bootstrap';
import ServiceWorker from './assets/modules/service-worker';
import Sodexo from './assets/modules/sodexo-data';
import FoodCo from './assets/modules/food-co-data';

// let restaurants = [
//   {name: 'Arabia', id: 1251, chain: 'Food & Co'},
//   {name: 'Karaportti', id: 3208, chain: 'Food & Co'},
//   {name: 'Myyrmäki Leiritie', id: 152, chain: 'Sodexo'},
//   {name: 'Myllypuro', id: 158, chain: 'Sodexo'},
// ];

/**
 * App initialization.
 */
const init = async () => {
  const menu1 = await FoodCo.getDailyMenu(3208);
  const menu2 = await Sodexo.getDailyMenu(152);
  console.log('Food & Co', menu1);
  console.log('Sodexo', menu2);
  ServiceWorker.register();
};

init();
