import express from 'express';
import { select, insert } from './db.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();
router.use(express.urlencoded({ extended: true }));

function catchErrors(fn) {
    return (req, res, next) => fn(req, res, next).catch(next);
}

async function renderPage(res, errors = null) {
    const title = "Undirskriftalisti";
    const data = await select();
    res.render('index', { title, data, errors });
}

async function registration(req, res) {
    renderPage(res);
}

async function formSubmit(req, res) {
    const {
        name = '',
        social_id = '',
        comment = '',
        anonymous = false
    } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(i => i.msg);
        return renderPage(res, errorMessages);
    }
    const successful = await insert(name, social_id, comment, anonymous === 'on');
    if (!successful) {
        return renderPage(res, ['Gat ekki skráð, þú hefur skrifað undir áður!!!'])
    }
    return res.redirect('/');
}

const validation = [
    body('name')
        .isLength({min: 1})
        .withMessage('Nafn má ekki vera tómt'),
    body('name')
        .trim().escape(),
    body('social_id')
        .isLength({min: 1})
        .withMessage('Kennitala má ekki vera tóm'),
    body('social_id')
        .matches(new RegExp('^[0-9]{6}-?[0-9]{4}$'))
        .withMessage('Kennitala verður að vera á formi 000000-0000 eða 0000000000'),
    body('social_id')
        .blacklist('-').escape(),
    body('comment')
        .trim().escape()
]

router.get('/', catchErrors(registration));

router.post('/', validation, catchErrors(formSubmit));

export default router;