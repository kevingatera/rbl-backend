/* istanbul ignore file */
import controller from '../controllers/auth.js';

function setupRoutes(router) {

  router.post('/login', controller.login);
  // TODO: Add logout for testing purposes
  // router.post('/logout', controller.logout);

}

export default setupRoutes;
