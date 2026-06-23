import { useQuery } from '@tanstack/react-query';
import { reportingService } from '../../infrastructure';

export function useStatistiques() {
  return useQuery({
    queryKey: ['reporting', 'statistiques'],
    queryFn:  () => reportingService.getStatistiques().then(r => r.data.data),
  });
}

export function useExportExcel() {
  return async () => {
    const res  = await reportingService.exporterExcel();
    const url  = URL.createObjectURL(res.data as Blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'stages_' + new Date().toISOString().slice(0,10) + '.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  };
}