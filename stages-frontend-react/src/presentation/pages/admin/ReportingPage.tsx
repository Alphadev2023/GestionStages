import { Sidebar } from '../../components/Sidebar';
import { Navbar } from '../../components/Navbar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useState } from 'react';
import { useStatistiques, useExportExcel } from '../../../application/reporting/useReporting';

export function ReportingPage() {
  const { data: stats } = useStatistiques();
  const exportExcel     = useExportExcel();
  const [exporting, setExporting] = useState(false);
  const [success,   setSuccess]   = useState(false);

  const raw = stats ?? {};
  const offres = raw['totalOffres'] ?? 0;
  const cands  = raw['totalCandidatures'] ?? 0;
  const convs  = raw['totalConventions'] ?? 0;

  async function handleExport() {
    setExporting(true); setSuccess(false);
    try { await exportExcel(); setSuccess(true); setTimeout(()=>setSuccess(false),3000); }
    finally { setExporting(false); }
  }

  return (
    <>
      <Sidebar />
      <div className="ml-64 min-h-screen bg-gray-50">
        <Navbar title="Reporting et statistiques" />
        <main className="p-6">

          <div className="grid grid-cols-3 gap-6 mb-6">
            {[
              { label:'Offres publiees',    value:offres, color:'text-primary-600', bar:'bg-primary-600' },
              { label:'Candidatures',       value:cands,  color:'text-warning-600', bar:'bg-warning-600' },
              { label:'Conventions',        value:convs,  color:'text-success-600', bar:'bg-success-600' },
            ].map(s=>(
              <Card key={s.label}>
                <p className="text-sm font-medium text-gray-500 mb-2">{s.label}</p>
                <p className={'text-4xl font-bold mb-1 '+s.color}>{s.value}</p>
                <div className={'h-1 rounded-full mt-3 '+s.bar} />
              </Card>
            ))}
          </div>

          <Card className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Taux de conversion</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label:'Candidatures / Offres',     value: offres ? Math.round((cands/offres)*100)  : 0, color:'text-primary-600' },
                { label:'Conventions / Candidatures',value: cands  ? Math.round((convs/cands)*100)   : 0, color:'text-success-600' },
                { label:'Taux global de placement',  value: offres ? Math.round((convs/offres)*100)  : 0, color:'text-warning-600' },
              ].map(s=>(
                <div key={s.label} className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className={'text-2xl font-bold '+s.color}>{s.value}%</p>
                  <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 mb-2">Exports de donnees</h3>
            <p className="text-sm text-gray-500 mb-4">Telecharger les donnees au format Excel pour analyse</p>
            <Button onClick={handleExport} disabled={exporting}>
              {exporting ? 'Export en cours...' : 'Exporter les stages (Excel)'}
            </Button>
            {success && <p className="text-sm text-success-600 mt-3">Fichier telecharge avec succes</p>}
          </Card>
        </main>
      </div>
    </>
  );
}