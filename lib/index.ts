require('dotenv').config();
import * as express from 'express';
import fetch from 'node-fetch';

const morgan = require('morgan');

const { TWITTER_API_KEY, TWITTER_API_SECRET_KEY } = process.env;
const TWITTER_BASE_URL = 'https://api.twitter.com';

/**
 * converts data to a base64 encoded string
 * @param data string to encode
 */
const base64Encode = data => new Buffer(data).toString('base64');

/**
 * Centralizing error handling back to the user
 * @param res express response object
 * @param err throw error
 */
const handleThrowException = (res: express.Response, err: Error) =>
  res
    .status(500)
    .json({
      error: err.message,
    })
    .end();

/**
 * add twitter token as local to the application
 *
 * @param app Express Application
 */
const loadTwitterToken = async (app: express.Application) => {
  if (app.locals.twitterToken) {
    return app.locals.twitterToken;
  }
  app.locals.twitterToken = await getTwitterToken();
  return app.locals.twitterToken;
};
/**
 * make API call to convert basic token to OAuth bearer
 */
const getTwitterToken = () => {
  const base64Token = base64Encode(
    `${TWITTER_API_KEY}:${TWITTER_API_SECRET_KEY}`
  );

  return fetch(`${TWITTER_BASE_URL}/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      Authorization: `Basic ${base64Token}`,
    },
  }).then(resp => {
    return resp.json();
  });
};

const getTwitterFriends = ({ access_token }, username) => {
  console.log({ access_token, username });
  return fetch(
    `${TWITTER_BASE_URL}/1.1/friends/list.json?screen_name=${username}`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  ).then(resp => {
    return resp.json();
  });
};

// real server stuff

const PORT = process.env.PORT || 3000;
const app = express();

// initialization
app.use(morgan('tiny'));
loadTwitterToken(app);

app.get('/', (req: express.Request, res: express.Response) => {
  res.send(`I built a TS server`);
});

const apiRouter = express.Router();

apiRouter.get(
  '/following',
  async (req: express.Request, res: express.Response) => {
    let friends;
    try {
      const { users } = await getTwitterFriends(
        req.app.locals.twitterToken,
        'kylewelch'
      );
      friends = users;
    } catch (ex) {
      handleThrowException(res, ex);
    }
    res.send(friends);
  }
);

app.use('/api', apiRouter);

app.listen(PORT);
console.log(`server started on port ${PORT}`);
console.log(`http://localhost:${PORT}/`);
