export const titleToCaseId: (title: string) => number | null = title => {
  const testCaseIdRegExp: RegExp = /\bT?C(\d+)\b/g;

  let m: RegExpExecArray | null;
  let caseId: number | null = null;

  while ((m = testCaseIdRegExp.exec(title)) !== null) {
    caseId = parseInt(m[1]);
  }

  return caseId;
};
