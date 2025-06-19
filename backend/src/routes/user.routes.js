import { Router } from "express";
import { login, registerUser, validateCreateUser, logout, refreshAccessToken, updateAccount, changePassword, updateProfileImage, deleteProfileImage, deleteAccount, getUser, sendEmailVerification, verifyEmail, checkSession } from '../controllers/user.controller.js'
import { uploadMedia } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import extractClientIp from "../middlewares/clientIP.middleware.js";


const router = Router();

router.use(extractClientIp)

// Routes without AUTH:
router.route('/register').post(
    uploadMedia.fields([
        {
            name: "profileImage",
            maxCount: 1
        }
    ]),
    validateCreateUser, registerUser);

router.route('/login').post(login);
router.route('/auth/check-session').get(checkSession);

// Routes requiring AUTH:
router.route('/getuserdetails').get(verifyJWT,getUser);
router.route('/logout').post(verifyJWT, logout);
router.route('/refresh-token').post(refreshAccessToken); // no need to verify token as we have already done it at the method refreshAccessToken itself.
router.route('/updateDetails').patch(verifyJWT, updateAccount);
router.route('/changePassword').post(verifyJWT, changePassword);
router.route('/updateProfileImage')
  .post(
    verifyJWT,
    (req, res, next) => {
      uploadMedia.single("profilePicture")(req, res, (err) => {
        if (err) {
          if (err instanceof multer.MulterError) {
            return res.status(400).json(new ApiError(400, err.message));
          } else if (err) {
            return res.status(400).json(new ApiError(400, err.message));
          }
        }
        next();
      });
    },
    updateProfileImage
  );
router.route('/deleteProfileImage').delete(verifyJWT, deleteProfileImage);  
router.route('/deleteaccount').delete(verifyJWT, deleteAccount);
router.route('/sendMailVerification').post(verifyJWT, sendEmailVerification);
router.route('/verify-email').get(verifyJWT, verifyEmail);



export default router;