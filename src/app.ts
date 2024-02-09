import express from 'express';
import cors from 'cors';
import { limitToUpload } from './constants';
import cookieParser from 'cookie-parser';
const app = express();

app.use(cors())
app.use(express.json({ limit: limitToUpload }));
app.use(express.urlencoded({ extended: true, limit: limitToUpload }));
app.use(express.static('public'));
app.use(cookieParser())


//import routes

import router from './routes/user/index';




//route declaration

app.use("/api/v1/users",router)


export { app }


