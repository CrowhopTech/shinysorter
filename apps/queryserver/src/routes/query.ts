import express from 'express';
import controller from '../controllers/query';
const router = express.Router();

router.get('/query', controller.getQuery);
router.get('/query/random', controller.getRandomFile);

export = router;