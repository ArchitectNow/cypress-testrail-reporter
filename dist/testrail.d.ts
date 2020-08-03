/// <reference types="mocha" />
import { TestRailOptions, TestRailResult } from './testrail.interface';
export declare class TestRail {
    private options;
    private axiosInstance;
    private readonly projectId;
    private readonly planId?;
    private readonly runId?;
    private readonly today;
    private suites;
    private testResults;
    constructor(options: TestRailOptions);
    get results(): TestRailResult[];
    addFailedTest(caseId: number, test: Mocha.Test): void;
    addPassedTest(caseId: number, test: Mocha.Test): void;
    constructSuites(): Promise<void>;
    publish(): Promise<void>;
    private getElapsedFromTest;
    private constructTestResult;
    private findRunIdForCase;
    private createRuns;
    private getCases;
    private static flat;
}
