// @ts-check

import fastify from 'fastify';
import fastifyStatic from 'fastify-static';
import fastifyErrorPage from 'fastify-error-page';
import fastifyFormbody from 'fastify-formbody';
import fastifySecureSession from 'fastify-secure-session';
import fastifyPassport from 'fastify-passport';
import fastifySensible from 'fastify-sensible';
import fastifyMethodOverride from 'fastify-method-override';
import fastifyObjectionjs from 'fastify-objectionjs';
import { plugin as fastifyReverseRoutes } from 'fastify-reverse-routes';

import dotenv from 'dotenv';
import path from 'path';
import pointOfView from 'point-of-view';
import qs from 'qs';
import Pug from 'pug';
import i18next from 'i18next';
import Rollbar from 'rollbar';

// @ts-ignore
import webpackConfig from '../webpack.config.babel.js';

import ru from './locales/ru.js';
import addRoutes from './routes/index.js';
import addRepositories from './repositories/index.js';
import getHelpers from './helpers/index.js';
import knexConfig from '../knexfile.js';
import models from './models/index.js';
import FormStrategy from './lib/passportStrategies/FormStrategy.js';

dotenv.config();

const mode = process.env.NODE_ENV || 'development';
const isProduction = mode === 'production';
const isDevelopment = mode === 'development';

// console.log('-- mode --', mode);

const setUpViews = (app) => {
  const { devServer } = webpackConfig;
  const devHost = `http://${devServer.host}:${devServer.port}`;
  const domain = isDevelopment ? devHost : '';
  const helpers = getHelpers(app);
  app.register(pointOfView, {
    engine: {
      pug: Pug,
    },
    includeViewExtension: true,
    defaultContext: {
      ...helpers,
      assetPath: (filename) => `${domain}/assets/${filename}`,
    },
    templates: path.join(__dirname, '..', 'server', 'views'),
  });

  app.decorateReply('render', function render(viewPath, locals) {
    this.view(viewPath, { ...locals, reply: this });
  });
};

const setUpStaticAssets = (app) => {
  const pathPublic = isProduction
    ? path.join(__dirname, '..', 'public')
    : path.join(__dirname, '..', 'dist', 'public');
  app.register(fastifyStatic, {
    root: pathPublic,
    prefix: '/assets/',
  });
};

const setupLocalization = () => {
  i18next.init({
    lng: 'ru',
    fallbackLng: 'en',
    resources: { ru },
  });
};

const addHooks = (app) => {
  app.addHook('preHandler', async (req, reply) => {
    reply.locals = {
      isAuthenticated: () => req.isAuthenticated(),
    };
  });
};

const registerPlugins = (app) => {
  app.register(fastifySensible, { errorHandler: false });
  app.register(fastifyErrorPage);
  app.register(fastifyReverseRoutes);
  app.register(fastifyFormbody, { parser: qs.parse });

  app.register(fastifySecureSession, {
    secret: process.env.SESSION_KEY,
    cookie: { path: '/' },
  });

  fastifyPassport.registerUserDeserializer((user) => app.objection
    .models.user.query().findById(user.id));
  fastifyPassport.registerUserSerializer((user) => Promise.resolve(user));

  fastifyPassport.use(new FormStrategy('form', app));

  app.register(fastifyPassport.initialize());
  app.register(fastifyPassport.secureSession());

  app.decorate('fp', fastifyPassport);
  app.decorate('authenticate', (...args) => fastifyPassport.authenticate(
    'form',
    {
      failureRedirect: '/',
      failureFlash: i18next.t('flash.authError'),
    },
    // @ts-ignore
  )(...args));

  app.decorate('repositories', {});

  app.register(fastifyMethodOverride);
  app.register(fastifyObjectionjs, {
    knexConfig: knexConfig[mode],
    models,
  });
};

const setErrorHandler = (app) => {
  const rollbar = new Rollbar({
    accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
    enabled: true,
  });

  app.setErrorHandler((err, req, reply) => {
    rollbar.error(err, req, reply);
    reply.status(500).send(err);
  });
};

export default () => {
  const app = fastify({
    logger: { prettyPrint: isDevelopment },
  });

  setErrorHandler(app);
  registerPlugins(app);
  setupLocalization();
  setUpViews(app);
  setUpStaticAssets(app);
  addRoutes(app);
  addHooks(app);
  addRepositories(app);

  return app;
};
