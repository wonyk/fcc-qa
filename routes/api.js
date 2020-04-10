/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

let replyControl = require('../controllers/ReplyHandler')
let threadControl = require('../controllers/ThreadHandler')

module.exports = function(app) {
  app
    .route('/api/threads/:board')
    .post(threadControl.createThread)
    .put(threadControl.reportThread)
    .delete(threadControl.deleteThread)
    .get(threadControl.getRecentThreads)

  app
    .route('/api/replies/:board')
    .post(replyControl.createReply)
    .put(replyControl.reportReply)
    .delete(replyControl.deleteReply)
    .get(replyControl.getThreadDetails)
}
