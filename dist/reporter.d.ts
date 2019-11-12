import { reporters } from 'mocha';
export default class CypressTestrailReporter extends reporters.Base {
    private readonly testRail;
    constructor(runner: Mocha.Runner, options: Mocha.MochaOptions);
    private report;
    private handleTest;
    private handleEnd;
    private static validate;
}
