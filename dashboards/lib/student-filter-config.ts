import type { StudentFilterClause, StudentFilterFieldMeta } from './api-client';

export type FilterRow = {
  id: string;
  field: string;
  operator: string;
  value: string | string[];
};

export const OPERATOR_LABELS: Record<string, string> = {
  equals: 'equals',
  not_equals: 'not equals',
  in: 'in',
  contains: 'contains',
  eq: '=',
  neq: '!=',
  gt: '>',
  lt: '<',
  gte: '>=',
  lte: '<=',
  between: 'between',
  before: 'before',
  after: 'after',
  is_true: 'is true',
  is_false: 'is false',
};

/** Static fallback if the metadata endpoint is unavailable */
export const STATIC_FILTER_FIELDS: StudentFilterFieldMeta[] = [
  { key: 'gender', label: 'Gender', type: 'enum', operators: ['equals', 'not_equals', 'in', 'contains'], enumOptions: [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }] },
  { key: 'university', label: 'University', type: 'string', operators: ['equals', 'not_equals', 'in', 'contains'] },
  { key: 'graduation_year', label: 'Graduation Year', type: 'number', operators: ['eq', 'neq', 'gt', 'lt', 'gte', 'lte', 'between'] },
  { key: 'platform', label: 'Platform', type: 'enum', operators: ['equals', 'not_equals', 'in', 'contains'], enumOptions: [{ value: 'ios', label: 'iOS' }, { value: 'android', label: 'Android' }, { value: 'web', label: 'Web' }] },
  { key: 'is_founders_club', label: 'Founders Club', type: 'boolean', operators: ['is_true', 'is_false'] },
  { key: 'verification_status', label: 'KYC Status', type: 'enum', operators: ['equals', 'not_equals', 'in', 'contains'], enumOptions: [{ value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }, { value: 'expired', label: 'Expired' }, { value: 'suspended', label: 'Suspended' }] },
  { key: 'created_at', label: 'Signup Date', type: 'date', operators: ['before', 'after', 'between'] },
  { key: 'date_of_birth', label: 'Date of Birth', type: 'date', operators: ['before', 'after', 'between'] },
  { key: 'degree', label: 'Degree', type: 'string', operators: ['equals', 'not_equals', 'in', 'contains'] },
  { key: 'year_of_study', label: 'Year of Study', type: 'string', operators: ['equals', 'not_equals', 'in', 'contains'] },
  { key: 'city', label: 'City', type: 'string', operators: ['equals', 'not_equals', 'in', 'contains'] },
  { key: 'lifetime_redemptions', label: 'Redemption Count', type: 'number', operators: ['eq', 'neq', 'gt', 'lt', 'gte', 'lte', 'between'] },
  { key: 'redemption_merchant', label: 'Redeemed at Merchant', type: 'nested', operators: ['equals', 'contains'], nested: true },
  { key: 'redemption_category', label: 'Redeemed Category', type: 'string', operators: ['equals', 'not_equals', 'in', 'contains'], nested: true },
  { key: 'redemption_subcategory', label: 'Redeemed Subcategory', type: 'string', operators: ['equals', 'not_equals', 'in', 'contains'], nested: true },
  { key: 'redemption_date', label: 'Redemption Date', type: 'date', operators: ['before', 'after', 'between'], nested: true },
];

export function createFilterRowId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

export function createEmptyFilterRow(): FilterRow {
  return { id: createFilterRowId(), field: '', operator: '', value: '' };
}

export function upsertFilterRow(
  rows: FilterRow[],
  field: string,
  operator: string,
  value: string | string[],
): FilterRow[] {
  const existingIdx = rows.findIndex((r) => r.field === field);
  const newRow: FilterRow = {
    id: existingIdx >= 0 ? rows[existingIdx].id : createFilterRowId(),
    field,
    operator,
    value,
  };
  if (existingIdx >= 0) {
    const updated = [...rows];
    updated[existingIdx] = newRow;
    return updated;
  }
  return [...rows, newRow];
}

export function removeFilterRowByField(rows: FilterRow[], field: string): FilterRow[] {
  return rows.filter((r) => r.field !== field);
}

export function getFilterRowByField(rows: FilterRow[], field: string): FilterRow | undefined {
  return rows.find((r) => r.field === field);
}

export function serializeFilters(rows: FilterRow[]): StudentFilterClause[] {
  return rows
    .filter((r) => r.field && r.operator)
    .filter((r) => {
      if (r.operator === 'is_true' || r.operator === 'is_false') return true;
      if (Array.isArray(r.value)) return r.value.length > 0 && r.value.some((v) => v !== '');
      return r.value !== '' && r.value !== undefined;
    })
    .map(({ field, operator, value }) => ({ field, operator, value }));
}

export function getDefaultOperator(fieldMeta?: StudentFilterFieldMeta): string {
  if (!fieldMeta || fieldMeta.operators.length === 0) return '';
  if (fieldMeta.type === 'boolean') return fieldMeta.operators[0];
  if (fieldMeta.type === 'date') return 'between';
  if (fieldMeta.type === 'number') return 'gte';
  return fieldMeta.operators.includes('contains') ? 'contains' : fieldMeta.operators[0];
}

export function isBooleanOperator(op: string): boolean {
  return op === 'is_true' || op === 'is_false';
}

export function isBetweenOperator(op: string): boolean {
  return op === 'between';
}

export function isInOperator(op: string): boolean {
  return op === 'in';
}
