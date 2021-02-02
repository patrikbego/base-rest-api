const app = {
  tests: {},
};
app.tests.utils = require('./utilsTest');
app.tests.restApi = require('./rest-api');

app.countTests = function () {
  let counter = 0;
  for (const key in app.tests) {
    if (app.tests.hasOwnProperty(key)) {
      const subTests = app.tests[key];
      for (const subTest in subTests) {
        if (subTests.hasOwnProperty(subTest)) {
          counter++;
        }
      }
    }
  }
  return counter;
};
app.runTests = async function () {
  const errors = [];
  const promises = [];
  let successes = 0;
  const limit = app.countTests();
  let counter = 0;
  await (async () => {
    for (const key in app.tests) {
      if (app.tests.hasOwnProperty(key)) {
        const subTests = app.tests[key];
        for (const testName in subTests) {
          if (subTests.hasOwnProperty(testName)) {
            const tmpTestName = testName;
            const testValue = subTests[testName];
            console.log('About to test : ', testValue);
            if (testValue.constructor.name === 'AsyncFunction') {
              promises.push(testValue);
              await (async () => {
                try {
                  await testValue();
                  // If it calls back without throwing, then it succeeded, so log it in green
                  console.log('\x1b[32m%s\x1b[0m', tmpTestName);
                  counter++;
                  successes++;
                  app.produceTestReport(limit, successes, errors,
                    counter === limit);
                } catch (e) {
                  // If it throws, then it failed, so capture the error thrown and log it in red
                  errors.push({
                    name: testName,
                    error: e,
                  });
                  console.log('\x1b[31m%s\x1b[0m', tmpTestName);
                  counter++;
                  app.produceTestReport(limit, successes, errors,
                    counter === limit);
                }
              })();
            } else {
              (function () {
                try {
                  testValue(() => {
                    // If it calls back without throwing, then it succeeded, so log it in green
                    console.log('\x1b[32m%s\x1b[0m', tmpTestName);
                    counter++;
                    successes++;
                    app.produceTestReport(limit, successes, errors,
                      counter === limit);
                  });
                } catch (e) {
                  // If it throws, then it failed, so capture the error thrown and log it in red
                  errors.push({
                    name: testName,
                    error: e,
                  });
                  console.log('\x1b[31m%s\x1b[0m', tmpTestName);
                  counter++;
                  app.produceTestReport(limit, successes, errors,
                    counter === limit);
                }
              }());
            }
          }
        }
      }
    }
  })();
};

// Product a test outcome report
app.produceTestReport = function (limit, successes, errors, counterEqLimit) {
  if (counterEqLimit) {
    console.log('');
    console.log('--------BEGIN TEST REPORT--------');
    console.log('');
    console.log('Total Tests: ', limit);
    console.log('Pass: ', successes);
    console.log('Fail: ', errors.length);
    console.log('');

    // If there are errors, print them in detail
    if (errors.length > 0) {
      console.log('--------BEGIN ERROR DETAILS--------');
      console.log('');
      errors.forEach((testError) => {
        console.log('\x1b[31m%s\x1b[0m', testError.name);
        console.log(testError.error);
        console.log('');
      });
      console.log('');
      console.log('--------END ERROR DETAILS--------');
    }
    console.log('');
    console.log('--------END TEST REPORT--------');
    process.exit(0);
  }
};

// Run the tests
app.runTests();
