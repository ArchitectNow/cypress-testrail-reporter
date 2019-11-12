import axios, { AxiosInstance } from 'axios';
import chalk from 'chalk';
import { format } from 'date-fns';
import { Case, Entry, Plan, Suite } from './api.types';
import { Status, TestRailOptions, TestRailResult } from './testrail.interface';

interface ConstructedTestResult {
  [runId: number]: Array<Omit<TestRailResult, 'run_id'>>;
}

class ReporterSuite {
  id: number;
  name: string;
  description: string;
  caseIds: number[];
  runId: number | null;

  constructor(id: number, name: string, description: string) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.caseIds = [];
    this.runId = null;
  }
}

export class TestRail {
  private axiosInstance: AxiosInstance;
  private readonly projectId: number;
  private readonly planId: number;
  private readonly today: string;
  private suites: ReporterSuite[] = [];
  private testResults: TestRailResult[] = [];

  constructor(private options: TestRailOptions) {
    this.axiosInstance = axios.create({
      baseURL: `https://${options.domain}/index.php?/api/v2`,
      headers: { 'Content-Type': 'application/json' },
      auth: {
        username: options.username,
        password: options.password,
      },
    });

    this.projectId = options.projectId;
    this.planId = options.planId;
    this.today = format(new Date().getTime(), 'yyyy/MM/dd');
  }

  public get results(): TestRailResult[] {
    return this.testResults;
  }

  public addFailedTest(caseId: number, test: Mocha.Test) {
    const runId = this.findRunIdForCase(caseId);
    if (runId) {
      this.testResults.push({
        case_id: caseId,
        status_id: Status.Failed,
        run_id: runId,
        comment: (test.err as Error).message,
      });
    }
  }

  public addPassedTest(caseId: number, test: Mocha.Test) {
    const runId = this.findRunIdForCase(caseId);
    if (runId) {
      this.testResults.push({
        case_id: caseId,
        status_id: Status.Passed,
        run_id: runId,
        comment: `Execution time: ${test.duration}ms`,
      });
    }
  }

  public async constructSuites(): Promise<void> {
    try {
      const suiteResponse = await this.axiosInstance.get<Suite[]>(`/get_suites/${this.projectId}`);
      const suites = suiteResponse.data
        .filter(s => !s.name.includes('Master'))
        .sort((a, b) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
          return 0;
        });

      for (const s of suites) {
        this.suites.push(new ReporterSuite(s.id, s.name, s.description));
      }

      const planResponse = await this.axiosInstance.get<Plan>(`/get_plan/${this.planId}`);
      const plan = planResponse.data;

      let runs: Plan[] = [];
      if (plan.entries && plan.entries.length) {
        runs = TestRail.flat(plan.entries.map(e => e.runs));
      } else {
        runs = await this.createRuns();
      }

      for (const r of runs) {
        this.suites.forEach(s => {
          if (s.id === r.suite_id) {
            s.runId = r.id;
          }
        });
      }
      await this.getCases();
    } catch (e) {
      console.log(chalk.redBright.underline.bold('Internal error', e));
    }
  }

  public async publish() {
    const constructedResults = this.constructTestResult();
    const addResultPromises = Object.entries(constructedResults).map(([runId, results]) => {
      return this.axiosInstance.post(`/add_results_for_cases/${runId}`, { results });
    });

    await Promise.all(addResultPromises);
    console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
    console.log(
      '\n',
      ` - Results are published to ${chalk.magenta(
        `https://${this.options.domain}/index.php?/runs/plan/${this.planId}`,
      )}`,
      '\n',
    );
  }

  private constructTestResult(): ConstructedTestResult {
    return this.testResults.reduce((acc: ConstructedTestResult, cur: TestRailResult) => {
      const { run_id, ...result } = cur;
      acc[run_id] = acc[run_id] ? [...acc[run_id], result] : [result];
      return acc;
    }, {});
  }

  private findRunIdForCase(caseId: number): number {
    const suite = this.suites.find(s => s.caseIds.includes(caseId));
    return suite ? (suite.runId as number) : 0;
  }

  private async createRuns() {
    let runs: Plan[] = [];
    for (let i = 0; i < this.suites.length; i++) {
      const suite = this.suites[i];
      const run = await this.axiosInstance
        .post<Entry>(`/add_plan_entry/${this.planId}`, {
          suite_id: suite.id,
          name: suite.name,
          description: suite.description + ' ' + this.today,
        })
        .then(res => res.data.runs[0]);
      runs.push(run);
    }

    return runs;
  }

  private async getCases() {
    const getCasesPromises = this.suites.map(s => {
      return this.axiosInstance.get<Case[]>(`/get_cases/${this.projectId}&suite_id=${s.id}`);
    });

    const casesResponse = await Promise.all(getCasesPromises);
    const cases = TestRail.flat(casesResponse.map(cr => cr.data));

    for (const c of cases) {
      this.suites.forEach(s => {
        if (s.id === c.suite_id) {
          s.caseIds.push(c.id);
        }
      });
    }
  }

  private static flat<T>(arr: T[][]): T[] {
    return arr.reduce((acc, cur) => acc.concat(cur), []);
  }
}
