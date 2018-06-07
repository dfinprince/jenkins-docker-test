'use strict';
const app = require('../start-server');
const assert = require('assert');

if (!global.Promise) {
  console.log('No support for promises, using external from q');
  global.Promise = require('q');
}

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

chai.use(chaiHttp);
var server = null;

describe('Test API Routes', () => {
  before((done) => {
    app().start().then((s) => {
      server = s;
      done();
    });
  });
  after(() => {
    return app().stop();
  });

  it('should not get fileRequests without authentication', () => {
    return chai.request(server)
      .get('/api/fileRequests')
      .send()
      .then((res) => {
        expect(res).to.have.status(401);
      }).catch((err) => {
        console.log('error in fileRequests get');
        throw err;
      });
  });

  it('authenticate and get the fileRequests', () => {
    var agent = chai.request(server).keepOpen();
    return agent.post('/login')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send(app().data().user)
      .then((res) => {
        expect(res).to.have.status(200);
        var token = JSON.parse(res.text);
        expect(token).to.be.an('object');
        expect(token.id.length).to.be.greaterThan(0);
        return agent.get('/api/fileRequests/' + '?access_token=' + token.id)
          .then((res) => {
            expect(res).to.have.status(200);
            var frs = JSON.parse(res.text);
            expect(frs).to.be.an('array');
            expect(frs.length).to.equal(app().data().fileRequests.length);
            assert.equal(frs[0].title, app().data().fileRequests[0].title);
            assert.equal(frs[1].title, app().data().fileRequests[1].title);
          }).catch(((err) => {
            console.log('error in fileRequests get');
            throw err; // Required for mocha to treat it as fail.
          }));
      }).catch(((err) => {
        console.log('error in login call');
        throw err; // Required for mocha to treat it as fail.
      })).finally(() => {
        agent.close();
      });
  });
});
