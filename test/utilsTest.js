const assert = require('assert');
const unitTestPoc = require('../src/utils');

const utilsTest = {
  'lib.simpleSum should return a number': function (done) {
    const sum = unitTestPoc.simpleSum(1, 1);
    assert.strictEqual(typeof (sum), 'number');
    done();
  },
  'lib.simpleSum should return a sum': function (done) {
    const sum = unitTestPoc.simpleSum(1, 1);
    assert.strictEqual(sum, 2);
    done();
  },
  'lib.simpleSum should fail': function (done) {
    const sum = unitTestPoc.simpleSum(` 1${1}`);
    assert.strictEqual(sum, ' 11undefined');
    done();
  },
  'lib.simpleSum should fail again': function (done) {
    const sum = unitTestPoc.simpleSum(` 1${null}`);
    assert.strictEqual(sum, ' 1nullundefined');
    done();
  },

  'lib.strictSum should return a number': function (done) {
    const sum = unitTestPoc.strictSum(1, 1);
    assert.strictEqual(typeof (sum), 'number');
    done();
  },
  'lib.strictSum should return a sum': function (done) {
    const sum = unitTestPoc.strictSum(1, 1);
    assert.strictEqual(sum, 2);
    done();
  },
  'lib.strictSum should fail': function (done) {
    try {
      const sum = unitTestPoc.strictSum(`1${1}`);
    } catch (e) {
      assert.strictEqual(e.message, 'Invalid Arguments');
    }
    done();
  },
  'lib.strictSum should fail again': function (done) {
    const expected = Error;
    const exercise = () => unitTestPoc.strictSum(` 1${null}`);
    assert.throws(exercise, expected);
    done();
  },

  'lib.promiseSum should return a number': async () => {
    const sum = await unitTestPoc.promiseSum(1, 1);
    assert.strictEqual(typeof (sum), 'number');
  },
  'lib.promiseSum should return a sum': async function () {
    unitTestPoc.promiseSum(1, 1).then((res) => {
      assert.strictEqual(res, NaN);
    });
  },
  'lib.promiseSum should fail': async function () {
    const expected = Error('Invalid Arguments');
    try {
      const sum = await unitTestPoc.promiseSum(' 1', 1);
    } catch (e) {
      assert.strictEqual(e.message, expected.message);
    }
  },
};

module.exports = utilsTest;
