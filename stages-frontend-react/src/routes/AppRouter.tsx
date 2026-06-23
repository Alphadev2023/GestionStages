import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { Spinner } from '../presentation/components/ui/Spinner';

const LoginPage    = lazy(() => import('../presentation/pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../presentation/pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));

const EtudiantDashboard    = lazy(() => import('../presentation/pages/etudiant/DashboardPage').then(m => ({ default: m.DashboardPage })));
const EtudiantOffres       = lazy(() => import('../presentation/pages/etudiant/OffresPage').then(m => ({ default: m.OffresPage })));
const EtudiantCandidatures = lazy(() => import('../presentation/pages/etudiant/CandidaturesPage').then(m => ({ default: m.CandidaturesPage })));

const EntrepriseDashboard   = lazy(() => import('../presentation/pages/entreprise/DashboardPage').then(m => ({ default: m.DashboardPage })));
const EntrepriseOffres      = lazy(() => import('../presentation/pages/entreprise/OffresPage').then(m => ({ default: m.OffresPage })));
const EntrepriseCandidatures= lazy(() => import('../presentation/pages/entreprise/CandidaturesPage').then(m => ({ default: m.CandidaturesPage })));

const EnseignantDashboard   = lazy(() => import('../presentation/pages/enseignant/DashboardPage').then(m => ({ default: m.DashboardPage })));
const EnseignantConventions = lazy(() => import('../presentation/pages/enseignant/ConventionsPage').then(m => ({ default: m.ConventionsPage })));

const AdminDashboard    = lazy(() => import('../presentation/pages/admin/DashboardPage').then(m => ({ default: m.DashboardPage })));
const AdminUtilisateurs = lazy(() => import('../presentation/pages/admin/UtilisateursPage').then(m => ({ default: m.UtilisateursPage })));
const AdminReporting    = lazy(() => import('../presentation/pages/admin/ReportingPage').then(m => ({ default: m.ReportingPage })));

const MessageriePage = lazy(() => import('../presentation/pages/messagerie/MessageriePage').then(m => ({ default: m.MessageriePage })));

const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Spinner />}>{children}</Suspense>
);

const router = createBrowserRouter([
  { path: '/',                  element: <Navigate to="/auth/login" replace /> },
  { path: '/auth/login',        element: <S><LoginPage /></S> },
  { path: '/auth/register',     element: <S><RegisterPage /></S> },

  { path: '/etudiant/dashboard',    element: <ProtectedRoute><RoleRoute roles={['ETUDIANT']}><S><EtudiantDashboard /></S></RoleRoute></ProtectedRoute> },
  { path: '/etudiant/offres',       element: <ProtectedRoute><RoleRoute roles={['ETUDIANT']}><S><EtudiantOffres /></S></RoleRoute></ProtectedRoute> },
  { path: '/etudiant/candidatures', element: <ProtectedRoute><RoleRoute roles={['ETUDIANT']}><S><EtudiantCandidatures /></S></RoleRoute></ProtectedRoute> },

  { path: '/entreprise/dashboard',    element: <ProtectedRoute><RoleRoute roles={['ENTREPRISE']}><S><EntrepriseDashboard /></S></RoleRoute></ProtectedRoute> },
  { path: '/entreprise/offres',       element: <ProtectedRoute><RoleRoute roles={['ENTREPRISE']}><S><EntrepriseOffres /></S></RoleRoute></ProtectedRoute> },
  { path: '/entreprise/candidatures', element: <ProtectedRoute><RoleRoute roles={['ENTREPRISE']}><S><EntrepriseCandidatures /></S></RoleRoute></ProtectedRoute> },

  { path: '/enseignant/dashboard',   element: <ProtectedRoute><RoleRoute roles={['ENSEIGNANT']}><S><EnseignantDashboard /></S></RoleRoute></ProtectedRoute> },
  { path: '/enseignant/conventions', element: <ProtectedRoute><RoleRoute roles={['ENSEIGNANT']}><S><EnseignantConventions /></S></RoleRoute></ProtectedRoute> },

  { path: '/admin/dashboard',    element: <ProtectedRoute><RoleRoute roles={['ADMIN']}><S><AdminDashboard /></S></RoleRoute></ProtectedRoute> },
  { path: '/admin/utilisateurs', element: <ProtectedRoute><RoleRoute roles={['ADMIN']}><S><AdminUtilisateurs /></S></RoleRoute></ProtectedRoute> },
  { path: '/admin/reporting',    element: <ProtectedRoute><RoleRoute roles={['ADMIN']}><S><AdminReporting /></S></RoleRoute></ProtectedRoute> },

  { path: '/messagerie', element: <ProtectedRoute><S><MessageriePage /></S></ProtectedRoute> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}