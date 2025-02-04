const express = require('express')
const router = express.Router()
const tweetController = require('../../controllers/tweet-controller')


router.post('/:TweetId/replies', tweetController.postReply)
router.get('/:TweetId/replies', tweetController.getReplies)
router.post('/:TweetId/like', tweetController.postLike)
router.post('/:TweetId/unlike', tweetController.postUnlike)
router.get('/:TweetId', tweetController.getTweet)
router.post('/', tweetController.postTweet)
router.get('/', tweetController.getTweets)


module.exports = router