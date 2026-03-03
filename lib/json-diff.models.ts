import _ from "lodash";

export type DifferenceStatus = "added" | "removed" | "updated" | "unchanged" | "children-updated";

export interface ObjectDifference {
  key: string | number;
  type: "object";
  children: Difference[];
  status: DifferenceStatus;
  oldValue: unknown;
  value: unknown;
}

export interface ValueDifference {
  key: string | number;
  type: "value";
  value: unknown;
  oldValue: unknown;
  status: DifferenceStatus;
}

export interface ArrayDifference {
  key: number | string;
  type: "array";
  children: Difference[];
  status: DifferenceStatus;
  oldValue: unknown;
  value: unknown;
}

export type Difference = ObjectDifference | ValueDifference | ArrayDifference;

function getType(value: unknown): "object" | "array" | "value" {
  if (value === null) return "value";
  if (Array.isArray(value)) return "array";
  if (typeof value === "object") return "object";
  return "value";
}

function getStatus(value: unknown, newValue: unknown): DifferenceStatus {
  if (value === undefined) return "added";
  if (newValue === undefined) return "removed";
  const bothAreObjects = getType(value) === "object" && getType(newValue) === "object";
  const bothAreArrays = getType(value) === "array" && getType(newValue) === "array";
  if (_.isEqual(value, newValue)) return "unchanged";
  if (bothAreObjects || bothAreArrays) return "children-updated";
  return "updated";
}

function createDifference(
  value: unknown,
  newValue: unknown,
  key: string | number,
  opts: { onlyShowDifferences?: boolean } = {},
): Difference {
  const type = getType(value);

  if (type === "object") {
    return {
      key,
      type,
      children: diffObjects(value as Record<string, unknown>, newValue as Record<string, unknown>, opts),
      oldValue: value,
      value: newValue,
      status: getStatus(value, newValue),
    };
  }
  if (type === "array") {
    return {
      key,
      type,
      children: diffArrays(value as unknown[], newValue as unknown[], opts),
      value: newValue,
      oldValue: value,
      status: getStatus(value, newValue),
    };
  }
  const diff: ValueDifference = {
    key,
    type: "value",
    value: newValue,
    oldValue: value,
    status: getStatus(value, newValue),
  };
  return diff;
}

function diffObjects(
  obj: Record<string, unknown>,
  newObj: Record<string, unknown>,
  opts: { onlyShowDifferences?: boolean } = {},
): Difference[] {
  const keys = Object.keys({ ...obj, ...newObj });
  return keys
    .map((key) => createDifference(obj?.[key], newObj?.[key], key, opts))
    .filter((d) => !opts.onlyShowDifferences || d.status !== "unchanged");
}

function diffArrays(
  arr: unknown[],
  newArr: unknown[],
  opts: { onlyShowDifferences?: boolean } = {},
): Difference[] {
  const maxLength = Math.max(0, arr?.length ?? 0, newArr?.length ?? 0);
  return Array.from({ length: maxLength }, (_, i) =>
    createDifference(arr?.[i], newArr?.[i], i, opts),
  ).filter((d) => !opts.onlyShowDifferences || d.status !== "unchanged");
}

export function diff(
  obj: unknown,
  newObj: unknown,
  opts: { onlyShowDifferences?: boolean } = {},
): Difference {
  if (Array.isArray(obj) && Array.isArray(newObj)) {
    return {
      key: "",
      type: "array",
      children: diffArrays(obj, newObj, opts),
      oldValue: obj,
      value: newObj,
      status: getStatus(obj, newObj),
    };
  }
  if (_.isObject(obj) && _.isObject(newObj)) {
    return {
      key: "",
      type: "object",
      children: diffObjects(obj as Record<string, unknown>, newObj as Record<string, unknown>, opts),
      oldValue: obj,
      value: newObj,
      status: getStatus(obj, newObj),
    };
  }
  return {
    key: "",
    type: "value",
    oldValue: obj,
    value: newObj,
    status: getStatus(obj, newObj),
  };
}
