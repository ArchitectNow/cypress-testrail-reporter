import chalk from 'chalk';
import { reporters } from 'mocha';
import axios from 'axios';
import { format } from 'date-fns';

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

// A type of promise-like that resolves synchronously and supports only one observer

const _iteratorSymbol = /*#__PURE__*/ typeof Symbol !== "undefined" ? (Symbol.iterator || (Symbol.iterator = Symbol("Symbol.iterator"))) : "@@iterator";

const _asyncIteratorSymbol = /*#__PURE__*/ typeof Symbol !== "undefined" ? (Symbol.asyncIterator || (Symbol.asyncIterator = Symbol("Symbol.asyncIterator"))) : "@@asyncIterator";

// Asynchronously call a function and send errors to recovery continuation
function _catch(body, recover) {
	try {
		var result = body();
	} catch(e) {
		return recover(e);
	}
	if (result && result.then) {
		return result.then(void 0, recover);
	}
	return result;
}

var Status;

(function (Status) {
  Status[Status["Passed"] = 1] = "Passed";
  Status[Status["Blocked"] = 2] = "Blocked";
  Status[Status["Untested"] = 3] = "Untested";
  Status[Status["Retest"] = 4] = "Retest";
  Status[Status["Failed"] = 5] = "Failed";
})(Status || (Status = {}));

var ReporterSuite = function ReporterSuite(id, name, description) {
  this.id = id;
  this.name = name;
  this.description = description;
  this.caseIds = [];
  this.runId = null;
};

var TestRail =
/*#__PURE__*/
function () {
  function TestRail(options) {
    this.options = options;
    this.suites = [];
    this.testResults = [];
    this.axiosInstance = axios.create({
      baseURL: "https://" + options.domain + "/index.php?/api/v2",
      headers: {
        'Content-Type': 'application/json'
      },
      auth: {
        username: options.username,
        password: options.password
      }
    });
    this.projectId = options.projectId;
    this.planId = options.planId;
    this.today = format(new Date().getTime(), 'yyyy/MM/dd');
  }

  var _proto = TestRail.prototype;

  _proto.addFailedTest = function addFailedTest(caseId, test) {
    var runId = this.findRunIdForCase(caseId);

    if (runId) {
      this.testResults.push({
        case_id: caseId,
        status_id: Status.Failed,
        run_id: runId,
        comment: test.err.message
      });
    }
  };

  _proto.addPassedTest = function addPassedTest(caseId, test) {
    var runId = this.findRunIdForCase(caseId);

    if (runId) {
      this.testResults.push({
        case_id: caseId,
        status_id: Status.Passed,
        run_id: runId,
        comment: "Execution time: " + test.duration + "ms"
      });
    }
  };

  _proto.constructSuites = function constructSuites() {
    try {
      var _this2 = this;

      var _temp4 = _catch(function () {
        return Promise.resolve(_this2.axiosInstance.get("/get_suites/" + _this2.projectId)).then(function (suiteResponse) {
          var suites = suiteResponse.data;

          for (var _iterator = suites, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
            var _ref;

            if (_isArray) {
              if (_i >= _iterator.length) break;
              _ref = _iterator[_i++];
            } else {
              _i = _iterator.next();
              if (_i.done) break;
              _ref = _i.value;
            }

            var s = _ref;

            _this2.suites.push(new ReporterSuite(s.id, s.name, s.description));
          }

          return Promise.resolve(_this2.axiosInstance.get("/get_plan/" + _this2.planId)).then(function (planResponse) {
            function _temp2() {
              var _loop = function _loop() {
                if (_isArray2) {
                  if (_i2 >= _iterator2.length) return "break";
                  _ref2 = _iterator2[_i2++];
                } else {
                  _i2 = _iterator2.next();
                  if (_i2.done) return "break";
                  _ref2 = _i2.value;
                }

                var r = _ref2;

                _this2.suites.forEach(function (s) {
                  if (s.id === r.suite_id) {
                    s.runId = r.id;
                  }
                });
              };

              for (var _iterator2 = runs, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
                var _ref2;

                var _ret = _loop();

                if (_ret === "break") break;
              }

              return Promise.resolve(_this2.getCases()).then(function () {});
            }

            var plan = planResponse.data;
            var runs;

            var _temp = function () {
              if (plan.entries && plan.entries.length) {
                runs = plan.entries;
              } else {
                return Promise.resolve(_this2.createRuns()).then(function (response) {
                  runs = response.map(function (r) {
                    return r.data.entries;
                  }).flat();
                });
              }
            }();

            return _temp && _temp.then ? _temp.then(_temp2) : _temp2(_temp);
          });
        });
      }, function (e) {
        console.log(chalk.redBright.underline.bold('Internal error', e));
      });

      return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(function () {}) : void 0);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.publish = function publish() {
    var _this3 = this;

    var constructedResults = this.constructTestResult();
    var addResultPromises = Object.entries(constructedResults).map(function (_ref3) {
      var runId = _ref3[0],
          results = _ref3[1];
      return _this3.axiosInstance.post("/add_results_for_cases/" + runId, {
        results: results
      });
    });
    Promise.all(addResultPromises).then(function () {
      console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
      console.log('\n', " - Results are published to " + chalk.magenta("https://" + _this3.options.domain + "/index.php?/runs/plan/" + _this3.planId), '\n');
    });
  };

  _proto.constructTestResult = function constructTestResult() {
    return this.testResults.reduce(function (acc, cur) {
      var run_id = cur.run_id,
          result = _objectWithoutPropertiesLoose(cur, ["run_id"]);

      acc[run_id] = acc[run_id] ? [].concat(acc[run_id], [result]) : [result];
      return acc;
    }, {});
  };

  _proto.findRunIdForCase = function findRunIdForCase(caseId) {
    var suite = this.suites.find(function (s) {
      return s.caseIds.includes(caseId);
    });
    return suite ? suite.runId : 0;
  };

  _proto.createRuns = function createRuns() {
    try {
      var _this5 = this;

      var createRunPromises = _this5.suites.map(function (s) {
        return _this5.axiosInstance.post("/add_plan_entry/" + _this5.planId, {
          suite_id: s.id,
          name: s.name,
          description: s.description + ' ' + _this5.today
        });
      });

      return Promise.all(createRunPromises);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.getCases = function getCases() {
    try {
      var _this7 = this;

      var getCasesPromises = _this7.suites.map(function (s) {
        return _this7.axiosInstance.get("/get_cases/" + _this7.projectId + "&suite_id=" + s.id);
      });

      return Promise.resolve(Promise.all(getCasesPromises)).then(function (casesResponse) {
        var cases = casesResponse.map(function (cr) {
          return cr.data;
        }).flat();

        var _loop2 = function _loop2() {
          if (_isArray3) {
            if (_i3 >= _iterator3.length) return "break";
            _ref4 = _iterator3[_i3++];
          } else {
            _i3 = _iterator3.next();
            if (_i3.done) return "break";
            _ref4 = _i3.value;
          }

          var c = _ref4;

          _this7.suites.forEach(function (s) {
            if (s.id === c.suite_id) {
              s.caseIds.push(c.id);
            }
          });
        };

        for (var _iterator3 = cases, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
          var _ref4;

          var _ret2 = _loop2();

          if (_ret2 === "break") break;
        }
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _createClass(TestRail, [{
    key: "results",
    get: function get() {
      return this.testResults;
    }
  }]);

  return TestRail;
}();

var titleToCaseId = function titleToCaseId(title) {
  var testCaseIdRegExp = /\bT?C(\d+)\b/g;
  var m;
  var caseId = null;

  while ((m = testCaseIdRegExp.exec(title)) !== null) {
    caseId = parseInt(m[1]);
  }

  return caseId;
};

var CypressTestrailReporter =
/*#__PURE__*/
function (_reporters$Base) {
  _inheritsLoose(CypressTestrailReporter, _reporters$Base);

  function CypressTestrailReporter(runner, options) {
    var _this;

    _this = _reporters$Base.call(this, runner, options) || this;

    _this.handleTest = function (status) {
      return function (test) {
        var caseId = titleToCaseId(test.title);

        if (caseId) {
          status === 'fail' ? _this.testRail.addFailedTest(caseId, test) : _this.testRail.addPassedTest(caseId, test);
        }
      };
    };

    _this.handleEnd = function () {
      _this.runner.off('fail', _this.handleTest('fail'));

      _this.runner.off('pass', _this.handleTest('pass'));

      if (!_this.testRail.results.length) {
        console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
        console.warn('\n', 'No testcases were matched. Ensure that your tests are declared correctly and matches Cxxx', '\n');
        return;
      }

      _this.testRail.publish();

      _this.runner.off('end', _this.handleEnd);
    };

    var reporterOptions = options.reporterOptions;
    CypressTestrailReporter.validate(reporterOptions);
    _this.testRail = new TestRail(reporterOptions);

    _this.report();

    return _this;
  }

  var _proto = CypressTestrailReporter.prototype;

  _proto.report = function report() {
    this.runner.once('start', this.testRail.constructSuites.bind(this.testRail));
    this.runner.on('fail', this.handleTest('fail'));
    this.runner.on('pass', this.handleTest('pass'));
    this.runner.on('end', this.handleEnd);
  };

  CypressTestrailReporter.validate = function validate(options) {
    if (options == null) {
      throw new Error('No reporterOptions');
    }

    for (var key in options) {
      if (options[key]) {
        continue;
      }

      throw new Error("Missing " + key + " value. Update repoterOptions");
    }
  };

  return CypressTestrailReporter;
}(reporters.Base);

export { CypressTestrailReporter };
//# sourceMappingURL=cypress-testrail-reporter.esm.js.map
