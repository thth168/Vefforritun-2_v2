import express from 'express';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import moment from 'moment';

import router from './registration.js';

dotenv.config();

const port = process.env.PORT || 3000;
const appPath = dirname(fileURLToPath(import.meta.url));
const app = express();

app.set('view engine', 'ejs');
app.set('views', join(appPath, '../views'));
app.use(express.static(join(appPath, '../public')))

app.locals.timeformat = function(timestamp) {
  return moment(timestamp).format("DD.MM.YYYY");
}

app.use(router);
// Verðum að setja bara *port* svo virki á heroku
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
