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
const _Pact = /*#__PURE__*/(function() {
	function _Pact() {}
	_Pact.prototype.then = function(onFulfilled, onRejected) {
		const result = new _Pact();
		const state = this.s;
		if (state) {
			const callback = state & 1 ? onFulfilled : onRejected;
			if (callback) {
				try {
					_settle(result, 1, callback(this.v));
				} catch (e) {
					_settle(result, 2, e);
				}
				return result;
			} else {
				return this;
			}
		}
		this.o = function(_this) {
			try {
				const value = _this.v;
				if (_this.s & 1) {
					_settle(result, 1, onFulfilled ? onFulfilled(value) : value);
				} else if (onRejected) {
					_settle(result, 1, onRejected(value));
				} else {
					_settle(result, 2, value);
				}
			} catch (e) {
				_settle(result, 2, e);
			}
		};
		return result;
	};
	return _Pact;
})();

// Settles a pact synchronously
function _settle(pact, state, value) {
	if (!pact.s) {
		if (value instanceof _Pact) {
			if (value.s) {
				if (state & 1) {
					state = value.s;
				}
				value = value.v;
			} else {
				value.o = _settle.bind(null, pact, state);
				return;
			}
		}
		if (value && value.then) {
			value.then(_settle.bind(null, pact, state), _settle.bind(null, pact, 2));
			return;
		}
		pact.s = state;
		pact.v = value;
		const observer = pact.o;
		if (observer) {
			observer(pact);
		}
	}
}

function _isSettledPact(thenable) {
	return thenable instanceof _Pact && thenable.s & 1;
}

const _iteratorSymbol = /*#__PURE__*/ typeof Symbol !== "undefined" ? (Symbol.iterator || (Symbol.iterator = Symbol("Symbol.iterator"))) : "@@iterator";

const _asyncIteratorSymbol = /*#__PURE__*/ typeof Symbol !== "undefined" ? (Symbol.asyncIterator || (Symbol.asyncIterator = Symbol("Symbol.asyncIterator"))) : "@@asyncIterator";

// Asynchronously implement a generic for loop
function _for(test, update, body) {
	var stage;
	for (;;) {
		var shouldContinue = test();
		if (_isSettledPact(shouldContinue)) {
			shouldContinue = shouldContinue.v;
		}
		if (!shouldContinue) {
			return result;
		}
		if (shouldContinue.then) {
			stage = 0;
			break;
		}
		var result = body();
		if (result && result.then) {
			if (_isSettledPact(result)) {
				result = result.s;
			} else {
				stage = 1;
				break;
			}
		}
		if (update) {
			var updateValue = update();
			if (updateValue && updateValue.then && !_isSettledPact(updateValue)) {
				stage = 2;
				break;
			}
		}
	}
	var pact = new _Pact();
	var reject = _settle.bind(null, pact, 2);
	(stage === 0 ? shouldContinue.then(_resumeAfterTest) : stage === 1 ? result.then(_resumeAfterBody) : updateValue.then(_resumeAfterUpdate)).then(void 0, reject);
	return pact;
	function _resumeAfterBody(value) {
		result = value;
		do {
			if (update) {
				updateValue = update();
				if (updateValue && updateValue.then && !_isSettledPact(updateValue)) {
					updateValue.then(_resumeAfterUpdate).then(void 0, reject);
					return;
				}
			}
			shouldContinue = test();
			if (!shouldContinue || (_isSettledPact(shouldContinue) && !shouldContinue.v)) {
				_settle(pact, 1, result);
				return;
			}
			if (shouldContinue.then) {
				shouldContinue.then(_resumeAfterTest).then(void 0, reject);
				return;
			}
			result = body();
			if (_isSettledPact(result)) {
				result = result.v;
			}
		} while (!result || !result.then);
		result.then(_resumeAfterBody).then(void 0, reject);
	}
	function _resumeAfterTest(shouldContinue) {
		if (shouldContinue) {
			result = body();
			if (result && result.then) {
				result.then(_resumeAfterBody).then(void 0, reject);
			} else {
				_resumeAfterBody(result);
			}
		} else {
			_settle(pact, 1, result);
		}
	}
	function _resumeAfterUpdate() {
		if (shouldContinue = test()) {
			if (shouldContinue.then) {
				shouldContinue.then(_resumeAfterTest).then(void 0, reject);
			} else {
				_resumeAfterTest(shouldContinue);
			}
		} else {
			_settle(pact, 1, result);
		}
	}
}

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
          var suites = suiteResponse.data.filter(function (s) {
            return !s.name.includes('Master');
          }).sort(function (a, b) {
            if (a.name > b.name) return 1;
            if (a.name < b.name) return -1;
            return 0;
          });

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
            var runs = [];

            var _temp = function () {
              if (plan.entries && plan.entries.length) {
                runs = TestRail.flat(plan.entries.map(function (e) {
                  return e.runs;
                }));
              } else {
                return Promise.resolve(_this2.createRuns()).then(function (_this$createRuns) {
                  runs = _this$createRuns;
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
    try {
      var _this4 = this;

      var constructedResults = _this4.constructTestResult();

      var addResultPromises = Object.entries(constructedResults).map(function (_ref3) {
        var runId = _ref3[0],
            results = _ref3[1];
        return _this4.axiosInstance.post("/add_results_for_cases/" + runId, {
          results: results
        });
      });

      var _temp6 = _catch(function () {
        return Promise.resolve(Promise.all(addResultPromises)).then(function () {
          console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
          console.log('\n', " - Results are published to " + chalk.magenta("https://" + _this4.options.domain + "/index.php?/runs/plan/" + _this4.planId), '\n');
        });
      }, function (e) {
        console.error(e);
      });

      return Promise.resolve(_temp6 && _temp6.then ? _temp6.then(function () {}) : void 0);
    } catch (e) {
      return Promise.reject(e);
    }
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
      var _this6 = this;

      var _runs = [];
      var _i3 = 0;

      var _temp8 = _for(function () {
        return _i3 < _this6.suites.length;
      }, function () {
        return _i3++;
      }, function () {
        var suite = _this6.suites[_i3];
        return Promise.resolve(_this6.axiosInstance.post("/add_plan_entry/" + _this6.planId, {
          suite_id: suite.id,
          name: suite.name,
          description: suite.description + ' ' + _this6.today
        }).then(function (res) {
          return res.data.runs[0];
        })).then(function (run) {
          _runs.push(run);
        });
      });

      return Promise.resolve(_temp8 && _temp8.then ? _temp8.then(function () {
        return _runs;
      }) : _runs);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.getCases = function getCases() {
    try {
      var _this8 = this;

      var getCasesPromises = _this8.suites.map(function (s) {
        return _this8.axiosInstance.get("/get_cases/" + _this8.projectId + "&suite_id=" + s.id);
      });

      return Promise.resolve(Promise.all(getCasesPromises)).then(function (casesResponse) {
        var cases = TestRail.flat(casesResponse.map(function (cr) {
          return cr.data;
        }));

        var _loop2 = function _loop2() {
          if (_isArray3) {
            if (_i4 >= _iterator3.length) return "break";
            _ref4 = _iterator3[_i4++];
          } else {
            _i4 = _iterator3.next();
            if (_i4.done) return "break";
            _ref4 = _i4.value;
          }

          var c = _ref4;

          _this8.suites.forEach(function (s) {
            if (s.id === c.suite_id) {
              s.caseIds.push(c.id);
            }
          });
        };

        for (var _iterator3 = cases, _isArray3 = Array.isArray(_iterator3), _i4 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
          var _ref4;

          var _ret2 = _loop2();

          if (_ret2 === "break") break;
        }
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  TestRail.flat = function flat(arr) {
    return arr.reduce(function (acc, cur) {
      return acc.concat(cur);
    }, []);
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
      if (!_this.testRail.results.length) {
        console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
        console.warn('\n', 'No test cases were matched. Ensure that your tests are declared correctly and matches CXXXX', '\n');
        return;
      }

      _this.testRail.publish();
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

export default CypressTestrailReporter;
//# sourceMappingURL=cypress-testrail-reporter.esm.js.map
