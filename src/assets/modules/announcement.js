/**
 * Module for announcement data.
 *
 * @module: Network
 * @author: Kerttu
 */
'use strict';

import {doFetch} from './network';

const url =
  'https://users.metropolia.fi/~veerakek/metrohelp_announcements/announcement.json';

/**
 * Get announcements from annoucements url.
 *
 * @returns Array of objects
 */
const getAnnouncements = async () => {
  try {
    const announcements = await doFetch(url, true);
    return announcements;
  } catch (e) {
    throw new Error('getAnnoucements error: ' + e);
  }
};

const Announcement = {getAnnouncements};
export default Announcement;
