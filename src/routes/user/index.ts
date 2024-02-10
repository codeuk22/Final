import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateCoverImage, updateProfilePicture, userLogin } from "../../controllers/user/index";
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
router.post("/change-avatar-image", upload.fields([{ name: "avatar", maxCount: 1 }]), verifyJWT, updateProfilePicture)
router.post("/change-cover-image", upload.fields([{ name: "coverImage", maxCount: 1 }]), verifyJWT, updateCoverImage)
router.post("update-user",validateUserUpdate, verifyJWT, updateAccountDetails)
router.get("/profile", verifyJWT, getCurrentUser)


export default router
