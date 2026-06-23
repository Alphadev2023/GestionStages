import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useLogin } from '../../../application/auth/useLogin';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const schema = z.object({
  email:      z.string().email('Email invalide'),
  motDePasse: z.string().min(1, 'Mot de passe requis'),
});
type Form = z.infer<typeof schema>;

export function LoginPage() {
  const login = useLogin();
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">GestionStages</h1>
          <p className="text-gray-500 mt-2">Connectez-vous a votre espace</p>
        </div>

        {login.isError && (
          <div className="bg-danger-100 text-danger-700 rounded-lg p-3 mb-4 text-sm">
            {(login.error as any)?.response?.data?.message ?? 'Email ou mot de passe incorrect'}
          </div>
        )}

        <form onSubmit={handleSubmit(d => login.mutate(d))} className="space-y-4">
          <Input label="Email" type="email" placeholder="vous@exemple.com"
            error={errors.email?.message} {...register('email')} />
          <Input label="Mot de passe" type="password" placeholder="••••••••"
            error={errors.motDePasse?.message} {...register('motDePasse')} />
          <Button type="submit" className="w-full py-3 mt-2" disabled={login.isPending}>
            {login.isPending ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Pas encore de compte ?{' '}
          <Link to="/auth/register" className="text-primary-600 font-medium hover:underline">
            S inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}