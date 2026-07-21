import { Link } from "react-router-dom";
import { Sidebar } from "../../components/Sidebar";
import { Navbar } from "../../components/Navbar";
import { Card } from "../../components/ui/Card";
import { useStatistiques } from "../../../application/reporting/useReporting";
import { useAllUsers } from "../../../application/users/useUsers";
import type { User } from "../../../domain";

export function DashboardPage() {
  const { data: stats } = useStatistiques();
  const { data: users } = useAllUsers();

  const ROLES = ["ETUDIANT", "ENTREPRISE", "ENSEIGNANT", "ADMIN"];
  const COLORS: Record<string, string> = {
    ETUDIANT: "bg-blue-500",
    ENTREPRISE: "bg-green-600",
    ENSEIGNANT: "bg-purple-600",
    ADMIN: "bg-red-600",
  };

  const rolesStats = ROLES.map((r) => ({
    role: r,
    count: (users ?? []).filter((u: User) => u.role === r).length,
    color: COLORS[r],
  }));

  const maxCount = Math.max(...rolesStats.map((r) => r.count), 1);

  return (
    <>
      <Sidebar />
      <div className="ml-64 min-h-screen bg-gray-50">
        <Navbar title="Administration" />
        <main className="p-6">
          <div className="grid grid-cols-3 gap-6 mb-6">
            {[
              {
                label: "Offres publiees",
                key: "totalOffres",
                color: "text-primary-600",
                bg: "bg-primary-100",
                tc: "text-primary-600",
                abbr: "OF",
                sub: "Offres sur la plateforme",
              },
              {
                label: "Candidatures",
                key: "totalCandidatures",
                color: "text-warning-600",
                bg: "bg-warning-100",
                tc: "text-warning-600",
                abbr: "CA",
                sub: "Candidatures deposees",
              },
              {
                label: "Conventions",
                key: "totalConventions",
                color: "text-success-600",
                bg: "bg-success-100",
                tc: "text-success-600",
                abbr: "CV",
                sub: "Conventions en cours",
              },
            ].map((s) => (
              <Card key={s.label}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-500">{s.label}</p>
                  <div
                    className={
                      "w-8 h-8 rounded-lg flex items-center justify-center " +
                      s.bg
                    }
                  >
                    <span className={"text-xs font-bold " + s.tc}>
                      {s.abbr}
                    </span>
                  </div>
                </div>
                <p className={"text-3xl font-bold " + s.color}>
                  {stats?.[s.key] ?? 0}
                </p>
                <p className="text-xs text-gray-400 mt-2">{s.sub}</p>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">
                Utilisateurs par role
              </h3>
              <div className="space-y-3">
                {rolesStats.map((r) => (
                  <div key={r.role}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{r.role}</span>
                      <span className="font-medium text-gray-900">
                        {r.count}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={
                          "h-full rounded-full transition-all duration-500 " +
                          r.color
                        }
                        style={{
                          width: Math.round((r.count / maxCount) * 100) + "%",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">
                Acces rapides
              </h3>
              <div className="space-y-3">
                {[
                  {
                    to: "/admin/utilisateurs",
                    label: "Gerer les utilisateurs",
                    sub: (users ?? []).length + " comptes enregistres",
                    bg: "bg-blue-100",
                    tc: "text-blue-600",
                    abbr: "US",
                  },
                  {
                    to: "/admin/reporting",
                    label: "Reporting et exports",
                    sub: "Statistiques et Excel",
                    bg: "bg-green-100",
                    tc: "text-green-600",
                    abbr: "RP",
                  },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className={
                        "w-8 h-8 rounded-lg flex items-center justify-center " +
                        item.bg
                      }
                    >
                      <span className={"text-xs font-bold " + item.tc}>
                        {item.abbr}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-500">{item.sub}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}
