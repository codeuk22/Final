import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUSerChannelProfile, getUserWatchHistory, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateCoverImage, updateProfilePicture, userLogin } from "../../controllers/user/index";
import { upload } from "../../middlewares/multer/index";
import { validateUserLogin, validateUserPasswordUpdate, validateUserRegister, validateUserUpdate } from "../../middlewares/joiValidation/index";
import { verifyJWT } from "../../middlewares/jwtValidation/index";

const router = Router();

router.post("/register", upload.fields([{ name: "avatar", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]), validateUserRegister, registerUser)
router.post("/login", validateUserLogin, userLogin)

// protected routes
router.post("/logout", verifyJWT, logoutUser)
router.post("/refresh-token", refreshAccessToken)
router.post("/change-password", validateUserPasswordUpdate, verifyJWT, changeCurrentPassword)
router.put("/change-avatar-image", verifyJWT, upload.single("avatar"), updateProfilePicture)
router.put("/change-cover-image", verifyJWT, upload.single("coverImage"), updateCoverImage)
router.put("update-user", validateUserUpdate, verifyJWT, updateAccountDetails)
router.get("/profile", verifyJWT, getCurrentUser)

router.get("/channel/:username", verifyJWT, getUSerChannelProfile)
router.get("/history", verifyJWT, getUserWatchHistory)

export default router
