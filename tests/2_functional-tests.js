/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

let chaiHttp = require('chai-http')
let chai = require('chai')
let assert = chai.assert
let server = require('../server')
let sample = require('./sampleOut')

chai.use(chaiHttp)

suite('Functional Tests', function () {
  let threadUrl = `/api/threads/general`
  let replyUrl = `/api/replies/general`
  let postThreadObj
  let postReplyObj

  suite('API ROUTING FOR /api/threads/:board', function () {
    suite('POST a THREAD for a BOARD', function () {
      test('POST fails due to missing fields', function (done) {
        chai
          .request(server)
          .post(threadUrl)
          .send()
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 400)
            assert.equal(
              res.body.error,
              'Missing required fields: text and delete_password'
            )
            done()
          })
      })

      test('POST fails with missing delete_password', function (done) {
        chai
          .request(server)
          .post(threadUrl)
          .send({ text: 'This is a test thread' })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 400)
            assert.equal(
              res.body.error,
              'Missing required fields: text and delete_password'
            )
            done()
          })
      })

      test('POST fails with missing / empty text', function (done) {
        chai
          .request(server)
          .post(threadUrl)
          .send({ delete_password: 'password', text: '' })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 400)
            assert.equal(
              res.body.error,
              'Missing required fields: text and delete_password'
            )
            done()
          })
      })

      test('POST succeed', function (done) {
        chai
          .request(server)
          .post(threadUrl)
          .send({ delete_password: 'password', text: 'A test thread' })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 200)
            assert.hasAllKeys(res.body, [
              '_id',
              'text',
              'created_on',
              'bumped_on'
            ])
            assert.exists(res.body._id)
            postThreadObj = res.body
            assert.equal(res.body.text, 'A test thread')
            assert.closeTo(
              new Date(res.body.created_on).getTime(),
              new Date().getTime(),
              3000
            )
            assert.equal(res.body.created_on, res.body.bumped_on)
            done()
          })
        this.timeout(3000)
        
      })
    })

    suite('GET', function () {
      test('GET 10 most recent THREADS with 3 most recent REPLIES', function (done) {
        // Set up sample file by adding in the most recent POST
        let uniqueSample = [
          {
            replies: [],
            ...postThreadObj
          },
          ...sample.fullThread
        ]

        chai
          .request(server)
          .get(threadUrl)
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 200)
            // Fixed _id because of the use of Mongorestore. _id belongs to the "general" board
            assert.equal(res.body._id, '5e882ae5d0eb41b3c5bfebbd')
            assert.isArray(res.body.threads)
            assert.lengthOf(res.body.threads, 10)
            assert.sameDeepOrderedMembers(res.body.threads, uniqueSample)
            done()
          })
      })
    })

    suite('DELETE', function () {
      test('DELETE fails with missing fields', function (done) {
        chai
          .request(server)
          .delete(threadUrl)
          .send()
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 400)
            assert.equal(
              res.body.error,
              'Missing required fields: thread_id, delete_password'
            )
            done()
          })
      })

      test('DELETE fails with missing thread_id', function (done) {
        chai
          .request(server)
          .delete(threadUrl)
          .send({ delete_password: 'password' })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 400)
            assert.equal(
              res.body.error,
              'Missing required fields: thread_id, delete_password'
            )
            done()
          })
      })

      test('DELETE fails with missing delete_password and empty thread_id', function (done) {
        chai
          .request(server)
          .delete(threadUrl)
          .send({ thread_id: '' })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 400)
            assert.equal(
              res.body.error,
              'Missing required fields: thread_id, delete_password'
            )
            done()
          })
      })

      test('DELETE fails with invalid thread_id format', function (done) {
        chai
          .request(server)
          .delete(threadUrl)
          .send({ thread_id: 'thisisnotvalid', delete_password: 'password' })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 400)
            assert.equal(res.body.error, 'Invalid thread_id')
            done()
          })
      })

      test('DELETE fails with nonexistent thread_id', function (done) {
        chai
          .request(server)
          .delete(threadUrl)
          .send({
            thread_id: '5e882af723d3ce2040fe24e2',
            delete_password: 'password'
          })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 400)
            assert.equal(res.body.error, 'Thread not found')
            done()
          })
      })

      test('DELETE fails with wrong delete_password', function (done) {
        chai
          .request(server)
          .delete(threadUrl)
          .send({
            thread_id: '5e882af923d3ce2040f22d2e',
            delete_password: 'password123'
          })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 401)
            assert.equal(res.text, 'incorrect password')
            done()
          })
      })

      // Thread 4 deleted
      test('DELETE succeed with all fields', function (done) {
        chai
          .request(server)
          .delete(threadUrl)
          .send({
            thread_id: '5e882af923d3ce2040f22d2e',
            delete_password: 'password'
          })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 200)
            console.log('DELETE success', res.text)
            assert.equal(res.text, 'delete success')
            done()
          })
      })
    })

    suite('PUT', function () {
      test('PUT fails with missing thread_id', function (done) {
        chai
          .request(server)
          .put(threadUrl)
          .send()
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 400)
            assert.equal(res.body.error, 'Invalid thread_id')
            done()
          })
      })

      test('PUT fails with invalid thread_id', function (done) {
        chai
          .request(server)
          .put(threadUrl)
          .send({ thread_id: 'thisisnotvalid' })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 400)
            assert.equal(res.body.error, 'Invalid thread_id')
            done()
          })
      })

      // Thread 2 is reported
      test('PUT succeed', function (done) {
        chai
          .request(server)
          .put(threadUrl)
          .send({ thread_id: '5e8a830245818926149b1f63' })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 200)
            console.log('PUT success', res.text)
            assert.equal(res.text, 'success')
            done()
          })
      })
    })
  })

  suite('API ROUTING FOR /api/replies/:board', function () {
    suite('POST', function () {
      test('POST fails with missing fields', function (done) {
        chai
          .request(server)
          .post(replyUrl)
          .send()
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 400)
            assert.equal(
              res.body.error,
              'Missing required fields: text, delete_password, thread_id'
            )
            done()
          })
      })

      test('POST fails with missing thread_id', function (done) {
        chai
          .request(server)
          .post(replyUrl)
          .send({
            text: 'Thread 3 Reply 1',
            delete_password: 'password123'
          })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 400)
            assert.equal(
              res.body.error,
              'Missing required fields: text, delete_password, thread_id'
            )
            done()
          })
      })

      test('POST fails with invalid thread_id', function (done) {
        chai
          .request(server)
          .post(replyUrl)
          .send({
            text: 'Thread 3 Reply 1',
            delete_password: 'password123',
            thread_id: 'thisisnotvalid'
          })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 400)
            assert.equal(res.body.error, 'Invalid thread_id')
            done()
          })
      })

      test('POST fails with nonexistent thread_id', function (done) {
        chai
          .request(server)
          .post(replyUrl)
          .send({
            text: 'Thread 3 Reply 1',
            delete_password: 'password123',
            thread_id: '5e882af923d3ce2040fee434'
          })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 400)
            assert.equal(res.body.error, 'Thread not found')
            done()
          })
      })

      // _id belongs to thread 3
      test('POST succeed', function (done) {
        chai
          .request(server)
          .post(replyUrl)
          .send({
            text: 'Thread 3 Reply 1',
            delete_password: 'password123',
            thread_id: '5e882af723d3ce2040f22d2d'
          })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 200)
            assert.equal(res.body.text, 'Thread 3 Reply 1')
            assert.exists(res.body._id)
            assert.closeTo(
              new Date(res.body.created_on).getTime(),
              new Date().getTime(),
              1000
            )
            postReplyObj = res.body
            done()
          })
      })
    })

    suite('GET', function () {
      test('GET replies fails due to missing thread_id', function (done) {
        chai
          .request(server)
          .get(replyUrl)
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 400)
            assert.equal(res.body.error, 'Missing required fields: thread_id')
            done()
          })
      })

      test('GET replies fails due to invalid thread_id', function (done) {
        chai
          .request(server)
          .get(replyUrl)
          .query({ thread_id: 'thisisnotvalid' })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 400)
            assert.equal(res.body.error, 'Invalid thread_id')
            done()
          })
      })

      // GET thread 4
      test('GET replies fails due to nonexistent thread_id', function (done) {
        chai
          .request(server)
          .get(replyUrl)
          .query({ thread_id: '5e882af923d3ce2040fee434' })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 400)
            assert.equal(res.body.error, 'Thread not found')
            done()
          })
      })

      // GET thread 3 to test the reply is really added
      test('GET replies succeed', function (done) {
        chai
          .request(server)
          .get(replyUrl)
          .query({ thread_id: '5e882af723d3ce2040f22d2d' })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 200)
            assert.equal(res.body._id, '5e882af723d3ce2040f22d2d')
            assert.equal(res.body.text, 'Thread 3')
            console.log('GET replies', res.body)
            assert.equal(res.body.created_on, '2020-04-04T06:36:39.325Z')
            // The bumped date should be the creation date of the reply
            assert.equal(res.body.bumped_on, postReplyObj.created_on)
            assert.deepEqual(res.body.replies, [postReplyObj])
            done()
          })
      })
    })

    suite('PUT', function () {
      test('PUT fails due to missing fields', function (done) {
        chai
          .request(server)
          .put(replyUrl)
          .send()
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 400)
            assert.equal(
              res.body.error,
              'Missing required fields: thread_id, reply_id'
            )
            done()
          })
      })

      test('PUT fails due to missing reply_id', function (done) {
        chai
          .request(server)
          .put(replyUrl)
          .send({
            thread_id: '5e882ae423d3ce2040f22d2b'
          })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 400)
            assert.equal(
              res.body.error,
              'Missing required fields: thread_id, reply_id'
            )
            done()
          })
      })

      test('PUT fails due to missing thread_id', function (done) {
        chai
          .request(server)
          .put(replyUrl)
          .send({
            reply_id: '5e884f6588e74938b4a20129'
          })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 400)
            assert.equal(
              res.body.error,
              'Missing required fields: thread_id, reply_id'
            )
            done()
          })
      })

      test('PUT fails due to invalid thread_id', function (done) {
        chai
          .request(server)
          .put(replyUrl)
          .send({
            thread_id: 'thisisnotvalid',
            reply_id: '5e884f6588e74938b4a20129'
          })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 400)
            assert.equal(res.body.error, 'Invalid thread_id or reply_id')
            done()
          })
      })

      test('PUT fails due to invalid reply_id', function (done) {
        chai
          .request(server)
          .put(replyUrl)
          .send({
            thread_id: '5e882ae423d3ce2040f22d2b',
            reply_id: 'thisisnotvalid'
          })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 400)
            assert.equal(res.body.error, 'Invalid thread_id or reply_id')
            done()
          })
      })

      // This thread_id belongs to Thread 4 which is deleted earlier
      test('PUT fails due to nonexistent thread_id', function (done) {
        chai
          .request(server)
          .put(replyUrl)
          .send({
            thread_id: '5e882af923d3ce2040f22d2e',
            reply_id: '5e884f6588e74938b4a20129'
          })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 400)
            assert.equal(res.body.error, 'Thread or Reply not found')
            done()
          })
      })

      test('PUT fails due to nonexistent reply_id', function (done) {
        chai
          .request(server)
          .put(replyUrl)
          .send({
            thread_id: '5e882ae423d3ce2040f22d2b',
            reply_id: '5e884f6588e74938b4a2e2ed'
          })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 400)
            assert.equal(res.body.error, 'Thread or Reply not found')
            done()
          })
      })

      test('PUT succeed', function (done) {
        chai
          .request(server)
          .put(replyUrl)
          .send({
            thread_id: '5e882ae423d3ce2040f22d2b',
            reply_id: '5e884f6588e74938b4a20129'
          })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 200)
            assert.equal(res.text, 'success')
            done()
          })
      })
    })

    suite('DELETE', function () {
      test('DELETE fails due to missing fields', function (done) {
        chai
          .request(server)
          .delete(replyUrl)
          .send()
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 400)
            assert.equal(
              res.body.error,
              'Missing required fields: thread_id, reply_id, delete_password'
            )
            done()
          })
      })

      test('DELETE fails due to missing reply_id', function (done) {
        chai
          .request(server)
          .delete(replyUrl)
          .send({
            thread_id: '5e882ae423d3ce2040f22d2b',
            delete_password: 'password123'
          })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 400)
            assert.equal(
              res.body.error,
              'Missing required fields: thread_id, reply_id, delete_password'
            )
            done()
          })
      })

      test('DELETE fails due to missing thread_id', function (done) {
        chai
          .request(server)
          .delete(replyUrl)
          .send({
            reply_id: '5e884f6588e74938b4a20129',
            delete_password: 'password123'
          })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 400)
            assert.equal(
              res.body.error,
              'Missing required fields: thread_id, reply_id, delete_password'
            )
            done()
          })
      })

      test('DELETE fails due to missing delete_password', function (done) {
        chai
          .request(server)
          .delete(replyUrl)
          .send({
            reply_id: '5e884f6588e74938b4a20129',
            thread_id: '5e882ae423d3ce2040f22d2b'
          })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 400)
            assert.equal(
              res.body.error,
              'Missing required fields: thread_id, reply_id, delete_password'
            )
            done()
          })
      })

      test('DELETE fails due to invalid thread_id', function (done) {
        chai
          .request(server)
          .delete(replyUrl)
          .send({
            thread_id: 'thisisnotvalid',
            reply_id: '5e884f6588e74938b4a20129',
            delete_password: 'password123'
          })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 400)
            assert.equal(res.body.error, 'Invalid thread_id or reply_id')
            done()
          })
      })

      test('DELETE fails due to invalid reply_id', function (done) {
        chai
          .request(server)
          .delete(replyUrl)
          .send({
            thread_id: '5e882ae423d3ce2040f22d2b',
            reply_id: 'thisisnotvalid',
            delete_password: 'password123'
          })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 400)
            assert.equal(res.body.error, 'Invalid thread_id or reply_id')
            done()
          })
      })

      // thread_id belongs to Thread 4 which is deleted
      test('DELETE fails due to nonexistent thread_id', function (done) {
        chai
          .request(server)
          .delete(replyUrl)
          .send({
            thread_id: '5e882af923d3ce2040f22d2e',
            reply_id: '5e884f6588e74938b4a20129',
            delete_password: 'password123'
          })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 400)
            assert.equal(res.body.error, 'Thread or Reply not found')
            done()
          })
      })

      test('DELETE fails due to nonexistent reply_id', function (done) {
        chai
          .request(server)
          .delete(replyUrl)
          .send({
            thread_id: '5e882ae423d3ce2040f22d2b',
            reply_id: '5e884f6588e74938b4a2e2ed',
            delete_password: 'password123'
          })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 400)
            assert.equal(res.body.error, 'Thread or Reply not found')
            done()
          })
      })

      test('DELETE fails due to wrong delete_password', function (done) {
        chai
          .request(server)
          .delete(replyUrl)
          .send({
            thread_id: '5e882ae423d3ce2040f22d2b',
            reply_id: '5e884f6588e74938b4a20129',
            delete_password: 'password'
          })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 401)
            assert.equal(res.text, 'incorrect password')
            done()
          })
      })

      test('DELETE succeed', function (done) {
        chai
          .request(server)
          .delete(replyUrl)
          .send({
            thread_id: '5e882ae423d3ce2040f22d2b',
            reply_id: '5e884f6588e74938b4a20129',
            delete_password: 'password123'
          })
          .end((err, res) => {
            assert.isNull(err)
            assert.equal(res.status, 200)
            assert.equal(res.text, 'success')

            // Get the whole thread 1 to make sure it is deleted
            chai
              .request(server)
              .get(replyUrl)
              .query({ thread_id: '5e882ae423d3ce2040f22d2b' })
              .end((err, res) => {
                assert.isNull(err)
                let index = res.body.replies.findIndex(
                  a => a._id === '5e884f6588e74938b4a20129'
                )
                assert.equal(res.body.replies[index].text, "['Deleted']")
                done()
              })
          })
      })
    })
  })
})