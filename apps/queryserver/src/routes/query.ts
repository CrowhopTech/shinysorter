import express from 'express';
import controller from '../controllers/query';
const router = express.Router();

router.get('/query', controller.getQuery);

export = router;