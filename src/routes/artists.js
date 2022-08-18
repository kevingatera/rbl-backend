import { required } from '../middleware';
import artistController from '../controllers/artist.js';

function setupRoutes(router) {
  // Apply auth middleware to ALL routes
  router.use(required.auth);
  
  // create
  router.post('/', artistController.create);

  // retrieve
  router.get('/', artistController.get)
  router.get('/:artistId', required.params('artistId'), artistController.getById);

  // update
  router.put('/:artistId', required.params('artistId'), required.body('artist'), artistController.update);

  router.patch('/:artistId/payout', required.params('artistId'), artistController.payout);
  router.patch('/:artistId/changeRate', required.params('artistId'), required.query('newRate'), artistController.changeRate);

  // delete
  router.delete('/:artistId', required.params('artistId'), artistController.deleteById);

}


export default setupRoutes;
