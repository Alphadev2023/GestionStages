import { getErrorMessage } from '../../../shared/errors';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { useLogin } from '../../../application/auth/useLogin';
import type { LoginRequest } from '../../../domain';

const schema = Yup.object({
  email:      Yup.string().email('Adresse email invalide').required('Email obligatoire'),
  motDePasse: Yup.string().min(6, 'Minimum 6 caracteres').required('Mot de passe obligatoire'),
});

export function LoginPage() {
  const login = useLogin();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">GS</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Bienvenue</h1>
          <p className="text-gray-500 mt-1 text-sm">Connectez-vous a votre espace GestionStages</p>
        </div>

        <Formik
          initialValues={{ email: '', motDePasse: '' } as LoginRequest}
          validationSchema={schema}
          onSubmit={(values, { setSubmitting }) => {
            const id = toast.loading('Connexion en cours...');
            login.mutate(values, {
              onSuccess: () => { toast.dismiss(id); toast.success('Connexion reussie !'); },
              onError: (e: unknown) => {
                toast.dismiss(id);
                toast.error(getErrorMessage(e, 'Email ou mot de passe incorrect'));
                setSubmitting(false);
              },
            });
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse email <span className="text-danger-600">*</span>
                </label>
                <Field name="email" type="email" placeholder="exemple@universite.com"
                  className="input-field" />
                <ErrorMessage name="email" component="p" className="text-xs text-danger-600 mt-1" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe <span className="text-danger-600">*</span>
                </label>
                <Field name="motDePasse" type="password" placeholder="Votre mot de passe"
                  className="input-field" />
                <ErrorMessage name="motDePasse" component="p" className="text-xs text-danger-600 mt-1" />
              </div>

              <button type="submit" disabled={isSubmitting}
                className="btn-primary w-full py-3 text-base font-semibold">
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connexion...
                  </span>
                ) : 'Se connecter'}
              </button>
            </Form>
          )}
        </Formik>

        <p className="text-center text-sm text-gray-500 mt-6">
          Pas encore de compte ?{' '}
          <Link to="/auth/register" className="text-primary-600 font-semibold hover:underline">
            Creer un compte gratuitement
          </Link>
        </p>
      </div>
    </div>
  );
}