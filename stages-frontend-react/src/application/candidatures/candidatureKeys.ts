export const candidatureKeys = {
  all:              ['candidatures'] as const,
  mesCandidatures:  (params?: unknown) => ['candidatures', 'mes', params] as const,
  parOffre:         (offreId: number)  => ['candidatures', 'offre', offreId] as const,
};