type JsonLike =
  | string
  | number
  | boolean
  | null
  | undefined
  | JsonLike[]
  | { [key: string]: JsonLike };

const OMITTED_KEYS = new Set(["_id", "__v", "createdAt", "updatedAt"]);
const PRIORITY_KEYS = ["name", "title", "description", "status"] as const;

type MongooseLikeDocument = {
  toObject?: () => Record<string, unknown>;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeDocument(input: unknown): JsonLike {
  if (Array.isArray(input)) {
    return input.map(normalizeDocument);
  }

  if (isPlainObject(input)) {
    const maybeDocument = input as MongooseLikeDocument;
    const source = maybeDocument.toObject ? maybeDocument.toObject() : input;

    return Object.fromEntries(
      Object.entries(source)
        .filter(([key]) => !OMITTED_KEYS.has(key))
        .map(([key, value]) => [key, normalizeDocument(value)]),
    );
  }

  if (input instanceof Date) {
    return input.toISOString();
  }

  return input as JsonLike;
}

function toLabel(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function toShortValue(value: JsonLike) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

function orderEntries(record: Record<string, JsonLike>) {
  return Object.entries(record).sort(([left], [right]) => {
    const leftIndex = PRIORITY_KEYS.indexOf(left as (typeof PRIORITY_KEYS)[number]);
    const rightIndex = PRIORITY_KEYS.indexOf(
      right as (typeof PRIORITY_KEYS)[number],
    );

    if (leftIndex !== -1 || rightIndex !== -1) {
      if (leftIndex === -1) return 1;
      if (rightIndex === -1) return -1;
      return leftIndex - rightIndex;
    }

    return left.localeCompare(right);
  });
}

function formatObject(
  record: Record<string, JsonLike>,
  entityLabel: string,
  depth = 0,
): string[] {
  const lines: string[] = [];
  const entries = orderEntries(record);
  const primaryValue =
    toShortValue(record.name) || toShortValue(record.title) || "";

  if (depth === 0 && primaryValue) {
    lines.push(`${entityLabel}: ${primaryValue}`);
  }

  for (const [key, value] of entries) {
    if (
      depth === 0 &&
      primaryValue &&
      (key === "name" || key === "title")
    ) {
      continue;
    }

    if (value === null || value === undefined || value === "") {
      continue;
    }

    const label = toLabel(key);

    if (Array.isArray(value)) {
      if (value.length === 0) {
        continue;
      }

      lines.push(`${label}:`);

      value.forEach((item, index) => {
        if (isPlainObject(item)) {
          const itemLabel =
            toShortValue((item as Record<string, JsonLike>).name) ||
            toShortValue((item as Record<string, JsonLike>).title) ||
            `${label} ${index + 1}`;
          const itemLines = formatObject(
            item as Record<string, JsonLike>,
            itemLabel,
            depth + 1,
          );

          if (itemLines.length > 0) {
            lines.push(...itemLines.map((line) => `- ${line}`));
          }
        } else {
          lines.push(`- ${toShortValue(item)}`);
        }
      });

      continue;
    }

    if (isPlainObject(value)) {
      const nestedLines = formatObject(
        value as Record<string, JsonLike>,
        label,
        depth + 1,
      );

      if (nestedLines.length > 0) {
        lines.push(`${label}:`);
        lines.push(...nestedLines.map((line) => `- ${line}`));
      }

      continue;
    }

    lines.push(`${label}: ${toShortValue(value)}`);
  }

  return lines;
}

export function formatContext(
  input: unknown,
  entityLabel = "Record",
): string {
  const normalized = normalizeDocument(input);

  if (Array.isArray(normalized)) {
    return normalized
      .map((item, index) => {
        if (isPlainObject(item)) {
          return formatObject(
            item as Record<string, JsonLike>,
            `${entityLabel} ${index + 1}`,
          ).join("\n");
        }

        return `${entityLabel} ${index + 1}: ${toShortValue(item)}`;
      })
      .filter(Boolean)
      .join("\n\n");
  }

  if (isPlainObject(normalized)) {
    return formatObject(
      normalized as Record<string, JsonLike>,
      entityLabel,
    ).join("\n");
  }

  return `${entityLabel}: ${toShortValue(normalized)}`;
}

export function sanitizeContextDocument(input: unknown): JsonLike {
  return normalizeDocument(input);
}
