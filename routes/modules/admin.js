const express = require('express')
const router = express.Router()
const passport = require('../../config/passport')
const userController = require('../../controllers/user-controller')
const adminController = require('../../controllers/admin-controller')
const { authenticated, authenticatedAdmin } = require('../../middleware/auth')


router.delete('/tweets/:TweetId', authenticated, authenticatedAdmin, adminController.deleteTweet)
router.get('/tweets', authenticated, authenticatedAdmin, adminController.getTweets)
router.get('/users', authenticated, authenticatedAdmin, adminController.getUsers)
router.post(
  '/signin',
  passport.authenticate('local', { session: false }),
  userController.signin
)


module.exports = router