import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import routes from './routes.js';
import config from './config/env.js';
import { errorConverter, errorHandler } from './middleware/error.middleware.js';

const app = express();

if (config.env !== 'test') {
    app.use(morgan('combined'));
}

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cors({ origin: config.appUrl || '*' }));
app.options('*', cors());


app.use('/uploads', express.static('src/public/uploads'));

app.use('/v1', routes);

app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.statusCode = 404;
    next(error);
});

app.use(errorConverter);
app.use(errorHandler);

export default app;
