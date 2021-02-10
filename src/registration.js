import express from 'express';

const router = express.Router();

async function registration(req, res) {
    const title = "TEST";
    const data = "";
    res.render('index', {title, data});
}

router.get('/', registration);

export default router;