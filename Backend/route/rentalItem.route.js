import express from "express"
import { Router } from "express"
import {
    postItem, getAllItems, getUserItems, findByCategory, getItemDetails,
    deleteItem, getItemByName, getItemByCategory, getItemByCollege,
    updateItem
} from "../controller/rentalItem.controller.js"
import { authMiddleware } from "../middleware/userAuth.js"
import { upload } from "../middleware/cloudinary.js"

const router = express.Router();

router.get("/", getAllItems)

router.get("/itemdetails/:itemId", getItemDetails)
router.delete("/deleteitem/:itemId", deleteItem);
router.get("/itembyname/:name", getItemByName)
router.get("/itembycat/:category", getItemByCategory)
router.get("/itembycollege/:college", getItemByCollege)
router.put(
    "/updateitem/:itemId",
    upload.array("images", 5),
    updateItem
);



router.get("/useritem", authMiddleware, getUserItems)
router.get("/category/:category", authMiddleware, findByCategory)

router.post(
    "/postitem",
    authMiddleware,
    upload.array("images", 5),
    postItem
);


export default router;