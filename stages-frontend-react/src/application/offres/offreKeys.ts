export const offreKeys = {
  all:      ['offres'] as const,
  list:     (params?: unknown) => ['offres', 'list', params] as const,
  mesOffres:(params?: unknown) => ['offres', 'mes-offres', params] as const,
  detail:   (id: number)       => ['offres', id] as const,
};