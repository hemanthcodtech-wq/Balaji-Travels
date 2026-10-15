import { Router } from 'express';
import {
  getFleets, createFleet, updateFleet, deleteFleet,
  getTours, createTour, updateTour, deleteTour,
  getDestinations, createDestination, updateDestination, deleteDestination,
  getBlogs, createBlog, updateBlog, deleteBlog,
  getCabRoutes, getServicePages
} from '../controllers/contentController.js';

const router = Router();

// Fleets
router.get('/fleets', getFleets);
router.post('/fleets', createFleet);
router.put('/fleets/:id', updateFleet);
router.delete('/fleets/:id', deleteFleet);

// Tours
router.get('/tours', getTours);
router.post('/tours', createTour);
router.put('/tours/:id', updateTour);
router.delete('/tours/:id', deleteTour);

// Destinations
router.get('/destinations', getDestinations);
router.post('/destinations', createDestination);
router.put('/destinations/:slug', updateDestination);
router.delete('/destinations/:slug', deleteDestination);

// Blogs
router.get('/blogs', getBlogs);
router.post('/blogs', createBlog);
router.put('/blogs/:id', updateBlog);
router.delete('/blogs/:id', deleteBlog);

// Cab Routes & Service Pages
router.get('/cab-routes', getCabRoutes);
router.get('/service-pages', getServicePages);

export default router;
