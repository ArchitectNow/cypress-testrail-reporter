# @architectnow/cypress-testrail-reporter



A Reporter that will push **Test Results** automatically to **TestRail**. This package is tailored specifically to work with our **Test Management** strategy by creating **Test Plans**, add **Test Runs** (for each **Suite**) to the **Plan** then publish **Results** (based on **Cases**) to the **Runs**

Manual steps required: Create a Test Plan periodically. We create a Test Plan for each environment at the beginning of each Sprint. Then get a hold of that `PlanId`. Using the `PlanId` and `ProjectId`, the Reporter will fetch all **Suites** and **Cases** from the **Project** then create a **Run** for each **Suite** then publish **Results** appropriately.

### Install

```
npm i -D @architectnow/cypress-testrail-reporter
```
or

```
yarn add --dev @architectnow/cypress-testrail-reporter
```

### Configuration

We would recommend you to get familiar with [Using Reporter in Cypress](https://docs.cypress.io/guides/tooling/reporters.html). 

1. Use `@architectnow/cypress-testrail-reporter` in `cypress.json`

```typescript
{
  "reporter": "@architectnow/cypress-testrail-reporter"
}
```

2. Provide `reporterOptions`

```typescript
{
  "reporter": "@architectnow/cypress-testrail-reporter",
  "reporterOptions": {
    "domain": string // Your TestRail domain
    "username": string // Your TestRail username
    "password": string // Your Testrail password
    "projectId": number,
    "planId": number
  }
}
```

3. Follow the convention of writing test cases from the original `cypress-testrail-reporter` [https://github.com/Vivify-Ideas/cypress-testrail-reporter](https://github.com/Vivify-Ideas/cypress-testrail-reporter)

### Authentication note

We would recommend that you create a generic account for your Test Rail domain to be used by the Reporter so that Test Results aren't bound to anyone specific. Also use API Key instead of using `password`.

### Usage with `cypress-multi-reporters`

If you want to use Multi Reporters with Cypress, consider using `cypress-multi-reporters` because it's actively maintained. Setup as follow:

```
npm i -D cypress-multi-reporters
```

```typescript
// cypress.json
{
  "reporter": "cypress-multi-reporters",
  "reporterOptions": {
    "configFile": "path/to/configFile.json"
  } 
}

// configFile.json
{
  "reporterEnabled": "@architectnow/cypress-testrail-reporter, some-other-reporter",
  "architectnowCypressTestrailReporterReporterOptions": {
    "domain": string // Your TestRail domain
    "username": string // Your TestRail username
    "password": string // Your Testrail password
    "projectId": number,
    "planId": number
  }
}
```

### Credits
* [Pierre Awaragi](https://github.com/awaragi), owner of the [mocha-testrail-reporter](https://github.com/awaragi/mocha-testrail-reporter) repository that was forked.
* [Valerie Thoma](https://github.com/ValerieThoma) and [Aileen Santos](https://github.com/asantos3026) for proofreading the README.md file and making it more understandable.
* [Vivify Ideas](https://github.com/Vivify-Ideas) for the `cypress-testrail-reporter` repo. 
