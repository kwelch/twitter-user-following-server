require('dotenv').config();
import * as express from 'express';
import fetch from 'node-fetch';

const morgan = require('morgan');

const PORT = process.env.PORT || 3000;

const app = express();

app.use(morgan('tiny'));

app.get('/', (req: express.Request, res: express.Response) => {
  res.send(`I built a TS server`);
});

app.listen(PORT);
console.log(`server started on port ${PORT}`);
console.log(`http://localhost:${PORT}/`);
