import chalk from 'chalk';
import { reporters } from 'mocha';
import { TestRail } from './testrail';
import { TestRailOptions } from './testrail.interface';
import { titleToCaseId } from './utils';

export default class CypressTestrailReporter extends reporters.Base {
  private readonly testRail: TestRail;

  constructor(runner: Mocha.Runner, options: Mocha.MochaOptions) {
    super(runner, options);
    const reporterOptions = options.reporterOptions as TestRailOptions;
    CypressTestrailReporter.validate(reporterOptions);
    this.testRail = new TestRail(reporterOptions);
    this.report();
  }

  private report() {
    this.runner.once('start', this.testRail.constructSuites.bind(this.testRail));
    this.runner.on('fail', this.handleTest('fail'));
    this.runner.on('pass', this.handleTest('pass'));
    this.runner.on('end', this.handleEnd);
  }

  private handleTest = (status: 'fail' | 'pass') => (test: Mocha.Test) => {
    const caseId = titleToCaseId(test.title);
    if (caseId) {
      status === 'fail' ? this.testRail.addFailedTest(caseId, test) : this.testRail.addPassedTest(caseId, test);
    }
  };

  private handleEnd = () => {
    this.runner.off('fail', this.handleTest('fail'));
    this.runner.off('pass', this.handleTest('pass'));

    if (!this.testRail.results.length) {
      console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
      console.warn(
        '\n',
        'No testcases were matched. Ensure that your tests are declared correctly and matches Cxxx',
        '\n',
      );
      return;
    }

    this.testRail.publish();
    this.runner.off('end', this.handleEnd);
  };

  private static validate(options: TestRailOptions) {
    if (options == null) {
      throw new Error('No reporterOptions');
    }

    for (const key in options) {
      if ((options as any)[key]) {
        continue;
      }

      throw new Error(`Missing ${key} value. Update repoterOptions`);
    }
  }
}
