import { required } from '../middleware';
import userController from '../controllers/user.js';
import artistController from '../controllers/artist.js';

function setupRoutes(router) {
  router.post('/register', required.body('username', 'password'), userController.register);

}


export default setupRoutes;
