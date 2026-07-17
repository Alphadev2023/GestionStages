import { getErrorMessage } from '../../../shared/errors';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { useRegister } from '../../../application/auth/useRegister';
import type { Role } from '../../../domain';

const schemaBase = {
  nom:        Yup.string().min(2, 'Minimum 2 caracteres').required('Nom obligatoire'),
  prenom:     Yup.string().min(2, 'Minimum 2 caracteres').required('Prenom obligatoire'),
  email:      Yup.string().email('Email invalide').required('Email obligatoire'),
  motDePasse: Yup.string().min(6, 'Minimum 6 caracteres').required('Mot de passe obligatoire'),
  role:       Yup.string().required('Role obligatoire'),
};

const schema = Yup.object(schemaBase);

const ROLES: { value: Role; label: string; desc: string }[] = [
  { value: 'ETUDIANT',   label: 'Etudiant',    desc: 'Je cherche un stage' },
  { value: 'ENTREPRISE', label: 'Entreprise',   desc: 'Je publie des offres' },
  { value: 'ENSEIGNANT', label: 'Enseignant',   desc: 'Je valide les conventions' },
];

export function RegisterPage() {
  const register_          = useRegister();
  const [role, setRole]    = useState<Role>('ETUDIANT');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">GS</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Creer un compte</h1>
          <p className="text-gray-500 mt-1 text-sm">Rejoignez la plateforme GestionStages</p>
        </div>

        {/* Selection du role */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {ROLES.map(r => (
            <button key={r.value} type="button" onClick={() => setRole(r.value)}
              className={'p-3 rounded-xl border-2 text-center transition-all ' +
                (role === r.value
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600')}>
              <p className="text-sm font-semibold">{r.label}</p>
              <p className="text-xs mt-0.5 opacity-70">{r.desc}</p>
            </button>
          ))}
        </div>

        <Formik
          initialValues={{
            nom:'', prenom:'', email:'', motDePasse:'', role: 'ETUDIANT' as Role,
            filiere:'', promotion:'', nomEntreprise:'', secteurActivite:'', departement:''
          }}
          validationSchema={schema}
          onSubmit={(values, { setSubmitting }) => {
            const id = toast.loading('Creation du compte...');
            register_.mutate({ ...values, role }, {
              onSuccess: () => { toast.dismiss(id); toast.success('Compte cree avec succes !'); },
              onError: (e: unknown) => {
                toast.dismiss(id);
                toast.error(getErrorMessage(e, 'Erreur lors de la creation'));
                setSubmitting(false);
              },
            });
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom <span className="text-danger-600">*</span>
                  </label>
                  <Field name="nom" placeholder="Ex: Diallo" className="input-field" />
                  <ErrorMessage name="nom" component="p" className="text-xs text-danger-600 mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prenom <span className="text-danger-600">*</span>
                  </label>
                  <Field name="prenom" placeholder="Ex: Mamadou" className="input-field" />
                  <ErrorMessage name="prenom" component="p" className="text-xs text-danger-600 mt-1" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse email <span className="text-danger-600">*</span>
                </label>
                <Field name="email" type="email" placeholder="Ex: mamadou@universite.com" className="input-field" />
                <ErrorMessage name="email" component="p" className="text-xs text-danger-600 mt-1" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe <span className="text-danger-600">*</span>
                </label>
                <Field name="motDePasse" type="password" placeholder="Minimum 6 caracteres" className="input-field" />
                <ErrorMessage name="motDePasse" component="p" className="text-xs text-danger-600 mt-1" />
                <p className="text-xs text-gray-400 mt-1">Utilisez au moins 6 caracteres avec des chiffres</p>
              </div>

              {role === 'ETUDIANT' && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filiere</label>
                    <Field name="filiere" placeholder="Ex: Informatique, Droit..." className="input-field" />
                    <p className="text-xs text-gray-400 mt-1">Votre domaine d etudes</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Promotion</label>
                    <Field name="promotion" placeholder="Ex: 2024-2026" className="input-field" />
                    <p className="text-xs text-gray-400 mt-1">Annee de votre promotion</p>
                  </div>
                </div>
              )}

              {role === 'ENTREPRISE' && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l entreprise</label>
                    <Field name="nomEntreprise" placeholder="Ex: TechCorp Guinee" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Secteur d activite</label>
                    <Field name="secteurActivite" placeholder="Ex: Informatique, Finance..." className="input-field" />
                  </div>
                </div>
              )}

              {role === 'ENSEIGNANT' && (
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departement</label>
                  <Field name="departement" placeholder="Ex: Informatique, Droit, Finance..." className="input-field" />
                  <p className="text-xs text-gray-400 mt-1">Votre departement d enseignement</p>
                </div>
              )}

              <button type="submit" disabled={isSubmitting}
                className="btn-primary w-full py-3 text-base font-semibold">
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creation du compte...
                  </span>
                ) : 'Creer mon compte'}
              </button>
            </Form>
          )}
        </Formik>

        <p className="text-center text-sm text-gray-500 mt-6">
          Deja un compte ?{' '}
          <Link to="/auth/login" className="text-primary-600 font-semibold hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}