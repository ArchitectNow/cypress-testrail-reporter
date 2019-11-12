export interface Suite {
  description: string;
  id: number;
  name: string;
  project_id: number;
  url: string;
}

export interface Case {
  created_by: number;
  created_on: number;
  custom_expected: string;
  custom_preconds: string;
  custom_steps: string;
  custom_steps_separated: CustomStepsSeparated[];
  estimate: string;
  estimate_forecast: null;
  id: number;
  milestone_id: number;
  priority_id: number;
  refs: string;
  section_id: number;
  suite_id: number;
  title: string;
  type_id: number;
  updated_by: number;
  updated_on: number;
}

export interface CustomStepsSeparated {
  content: string;
  expected: string;
}

export interface Entry {
  id: number;
  name: string;
  suite_id: number;
  runs: Plan[];
}

export interface Plan {
  assignedto_id: number | null;
  blocked_count: number;
  completed_on: null;
  created_by?: number;
  created_on?: number;
  custom_status1_count: number;
  custom_status2_count: number;
  custom_status3_count: number;
  custom_status4_count: number;
  custom_status5_count: number;
  custom_status6_count: number;
  custom_status7_count: number;
  description: null;
  entries?: Entry[];
  failed_count: number;
  id: number;
  is_completed: boolean;
  milestone_id: number;
  name: string;
  passed_count: number;
  project_id: number;
  retest_count: number;
  untested_count: number;
  url: string;
  config?: string;
  config_ids?: number[];
  entry_id?: string;
  entry_index?: number;
  include_all?: boolean;
  plan_id?: number;
  suite_id?: number;
}
