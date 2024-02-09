import { Router } from "express";
import { logoutUser, registerUser, userLogin } from "../../controllers/user/index";
import { upload } from "../../middlewares/multer/index";
import { validateUserLogin, validateUserRegister } from "../../middlewares/joiValidation/index";
import { verifyJWT } from "../../middlewares/jwtValidation";

const router = Router();

router.post("/register",upload.fields([{ name: "avatar", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]),validateUserRegister,registerUser)
router.post("/login",validateUserLogin,userLogin)



// protected routes
router.post("/logout",verifyJWT,logoutUser)


export default router
