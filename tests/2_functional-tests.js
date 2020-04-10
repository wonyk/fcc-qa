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
let id, id1

chai.use(chaiHttp)

suite('Functional Tests', function() {
  suite('POST /api/issues/{project} => object with issue data', function() {
    test('Every field filled in', function(done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200)
          assert.equal(res.body.open, true)
          assert.equal(res.body.issue_title, 'Title')
          assert.equal(res.body.issue_text, 'text')
          assert.equal(
            res.body.created_by,
            'Functional Test - Every field filled in'
          )
          assert.equal(res.body.assigned_to, 'Chai and Mocha')
          assert.equal(res.body.status_text, 'In QA')
          assert.exists(res.body._id)
          assert.approximately(
            new Date(res.body.created_on).getTime(),
            new Date().getTime(),
            5000
          )
          assert.approximately(
            new Date(res.body.updated_on).getTime(),
            new Date().getTime(),
            5000
          )
          id = res.body._id
          done()
        })
    })

    test('Required fields filled in', function(done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Required Fields',
          issue_text: 'Only required fields',
          created_by: 'Chai and Mocha tests'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200)
          assert.equal(res.body.open, true)
          assert.equal(res.body.issue_title, 'Required Fields')
          assert.equal(res.body.issue_text, 'Only required fields')
          assert.equal(res.body.created_by, 'Chai and Mocha tests')
          assert.equal(res.body.assigned_to, '')
          assert.equal(res.body.status_text, '')
          assert.exists(res.body._id)
          assert.approximately(
            new Date(res.body.created_on).getTime(),
            new Date().getTime(),
            5000
          )
          assert.approximately(
            new Date(res.body.updated_on).getTime(),
            new Date().getTime(),
            5000
          )
          id1 = res.body._id
          done()
        })
    })

    test('Missing required fields', function(done) {
      chai
        .request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Missing required fields',
          assigned_to: 'Everyone'
        })
        .end((err, res) => {
          assert.equal(res.status, 400)
          assert.equal(res.body.error, 'Please provide all the required fields')
          done()
        })
    })
  })

  suite('PUT /api/issues/{project} => text', function() {
    test('No body', function(done) {
      chai
        .request(server)
        .put('/api/issues/test')
        .send()
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.equal(res.body, 'no updated field sent')
          done()
        })
    })

    test('One field to update', function(done) {
      chai
        .request(server)
        .put('/api/issues/test')
        .send({
          _id: id,
          created_by: 'One field to update'
        })
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.equal(res.body, 'successfully updated ' + id)
          chai
            .request(server)
            .get('/api/issues/test?_id=' + id)
            .end((err, res) => {
              let {
                _id: resId,
                assigned_to,
                created_by,
                issue_title,
                issue_text,
                open,
                status_text,
                updated_on
              } = res.body[0]
              assert.equal(res.status, 200)
              assert.equal(resId, id)
              assert.equal(assigned_to, 'Chai and Mocha')
              assert.equal(status_text, 'In QA')
              assert.equal(created_by, 'One field to update')
              assert.equal(open, true)
              assert.equal(issue_title, 'Title')
              assert.equal(issue_text, 'text')
              assert.approximately(
                new Date(updated_on).getTime(),
                new Date().getTime(),
                5000
              )
              done()
            })
        })
    })

    test('Multiple fields to update', function(done) {
      chai
        .request(server)
        .put('/api/issues/test')
        .send({
          _id: id1,
          created_by: 'Multiple field to update',
          assigned_to: 'Jason',
          status_text: 'nofix',
          open: false,
          issue_title: 'I can edit multiple fields',
          issue_text: 'It is intended to work this way'
        })
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.equal(res.body, 'successfully updated ' + id1)
          chai
            .request(server)
            .get('/api/issues/test?_id=' + id1)
            .end((err, res) => {
              console.log('res', res.body)
              let {
                _id: resId,
                assigned_to,
                created_by,
                issue_title,
                issue_text,
                open,
                status_text,
                updated_on
              } = res.body[0]
              assert.equal(res.status, 200)
              assert.equal(resId, id1)
              assert.equal(assigned_to, 'Jason')
              assert.equal(status_text, 'nofix')
              assert.equal(created_by, 'Multiple field to update')
              assert.equal(open, false)
              assert.equal(issue_title, 'I can edit multiple fields')
              assert.equal(issue_text, 'It is intended to work this way')
              assert.approximately(
                new Date(updated_on).getTime(),
                new Date().getTime(),
                5000
              )
              done()
            })
        })
    })
  })

  suite(
    'GET /api/issues/{project} => Array of objects with issue data',
    function() {
      test('No filter', function(done) {
        chai
          .request(server)
          .get('/api/issues/test')
          .query({})
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.isArray(res.body)
            assert.property(res.body[0], 'issue_title')
            assert.property(res.body[0], 'issue_text')
            assert.property(res.body[0], 'created_on')
            assert.property(res.body[0], 'updated_on')
            assert.property(res.body[0], 'created_by')
            assert.property(res.body[0], 'assigned_to')
            assert.property(res.body[0], 'open')
            assert.property(res.body[0], 'status_text')
            assert.property(res.body[0], '_id')
            done()
          })
      })

      test('One filter', function(done) {
        chai
          .request(server)
          .get('/api/issues/test')
          .query({
            open: false
          })
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.isArray(res.body)
            assert.property(res.body[0], 'issue_title')
            assert.property(res.body[0], 'issue_text')
            assert.property(res.body[0], 'created_on')
            assert.property(res.body[0], 'updated_on')
            assert.property(res.body[0], 'created_by')
            assert.property(res.body[0], 'assigned_to')
            assert.property(res.body[0], 'open')
            assert.property(res.body[0], 'status_text')
            assert.property(res.body[0], '_id')
            done()
          })
      })

      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai
          .request(server)
          .get('/api/issues/test')
          .query({
            open: false,
            _id: id1,
            assigned_to: 'jas',
            issue_title: 'edit',
            issue_text: 'intended'
          })
          .end((err, res) => {
            assert.equal(res.status, 200)
            assert.isArray(res.body)
            assert.property(res.body[0], 'issue_title')
            assert.property(res.body[0], 'issue_text')
            assert.property(res.body[0], 'created_on')
            assert.property(res.body[0], 'updated_on')
            assert.property(res.body[0], 'created_by')
            assert.property(res.body[0], 'assigned_to')
            assert.property(res.body[0], 'open')
            assert.property(res.body[0], 'status_text')
            assert.property(res.body[0], '_id')
            done()
          })
      })
    }
  )

  suite('DELETE /api/issues/{project} => text', function() {
    test('No _id', function(done) {
      chai
        .request(server)
        .delete('/api/issues/test')
        .send({})
        .end((err, res) => {
          assert.equal(res.status, 400)
          assert.equal(res.body, '_id error')
          done()
        })
    })

    test('Valid _id', function(done) {
      chai
        .request(server)
        .delete('/api/issues/test')
        .send({
          _id: id
        })
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.equal(res.body, 'deleted ' + id)
          done()
        })
    })
  })
  after(done => {
    chai
      .request(server)
      .delete('/api/issues/test')
      .send({
        _id: id1
      })
      .end((err, res) => {
        console.log('clean up database for tests')
        done()
      })
  })
})
