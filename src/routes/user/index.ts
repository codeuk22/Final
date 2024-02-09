import { Router } from "express";
import { logoutUser, refreshAccessToken, registerUser, userLogin } from "../../controllers/user/index";
import { upload } from "../../middlewares/multer/index";
import { validateUserLogin, validateUserRegister } from "../../middlewares/joiValidation/index";
import { verifyJWT } from "../../middlewares/jwtValidation/index";

const router = Router();

router.post("/register",upload.fields([{ name: "avatar", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]),validateUserRegister,registerUser)
router.post("/login",validateUserLogin,userLogin)



// protected routes
router.post("/logout",verifyJWT,logoutUser)
router.post("/refresh-token",refreshAccessToken)

export default router
