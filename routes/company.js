const app = require('express');

const router = app.Router();

const controller = require('../controllers/companies');
const tokenMiddleware = require('../middleware/verifyToken');

router.post('/signup',controller.signup);
router.post('/login', controller.login);
router.put('/changedPassword', tokenMiddleware.verifyToken, controller.changedPassword);
router.put('/changeStatus', tokenMiddleware.verifyToken, controller.changeStatus)

module.exports = router;