import express from 'express';
import { touristController } from './tourist.controller';
import { wishlistController } from './wishlist.controller';
import authHelper from '../../middleware/authHelper';
import { Role } from '@prisma/client';

const router = express.Router();
router.get("/getallwishlist", authHelper(Role.TOURIST), wishlistController.getWishlist);
router.get("/", touristController.getAllFromDB)
router.get("/:id", touristController.getSingleFromDB);
router.patch("/", authHelper(Role.TOURIST), touristController.updateSingleFromDB);


router.post("/wishlist", authHelper(Role.TOURIST), wishlistController.addToWishlist);
router.delete("/wishlist/:tourId", authHelper(Role.TOURIST), wishlistController.removeFromWishlist);

export const touristRoutes = router;
