const { expect } = require('chai');
const factory = require('../helpers/request-factory');
const authStub = require('../helpers/auth-stub');
const setupCognito = require('../helpers/setup-cognito');
const setupDynamo = require('../helpers/setup-dynamo');
const AWS = require('aws-sdk');
const sinon = require('sinon');

describe('userStats', function() {
  let cognitoProvider = setupCognito();
  let dynamo = setupDynamo();

  beforeEach(function() {
    authStub.stub(sinon, 'admins');
  });

  afterEach(function() {
    sinon.restore();
  });

  it('fails when not admin', async function() {
    authStub.setUserGroup('hosts');

    let res = await factory.get('/userStats');
    expect(res).to.have.status(403);
  });

  it('works', async function() {
    cognitoProvider.testAddUsers({
      hosts: [ {}, {} ],
      caseworkers: [ {} ]
    });

    let client = new AWS.DynamoDB.DocumentClient({ service: dynamo });

    await client.batchWrite({
      RequestItems: {
        [process.env.RESIDENT_PROFILES_TABLE]: [
          { PutRequest: { Item: { id: '1', caseworker: 'a', email: 'steveholt@gmail.com' } } },
          { PutRequest: { Item: { id: '2', caseworker: 'b', email: 'oscar@bluth.com' } } },
          { PutRequest: { Item: { id: '3', caseworker: 'b', email: 'annyong@gmail.com' } } }
        ]
      }
    }).promise();

    let res = await factory.get('/userStats');
    expect(res).to.have.status(200);
    expect(res.body).to.deep.equal({ hosts: 2, residents: 3 });
  });
});
