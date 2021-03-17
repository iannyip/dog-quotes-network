// import db from './models/index.mjs';

// import the controller
import initItemsController from './controllers/items.mjs';

export default function bindRoutes(app, pool) {
  // pass in the db for all items callbacks
  const ItemsController = initItemsController(app, pool);

  app.get('/items', ItemsController.index);
}