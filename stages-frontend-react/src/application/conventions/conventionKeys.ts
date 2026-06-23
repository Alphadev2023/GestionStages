export const conventionKeys = {
  all:  ['conventions'] as const,
  list: (params?: unknown) => ['conventions', 'list', params] as const,
};