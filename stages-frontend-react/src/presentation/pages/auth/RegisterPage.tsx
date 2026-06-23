import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useRegister } from '../../../application/auth/useRegister';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import type { Role } from '../../../domain';

const schema = z.object({
  nom: z.string().min(1), prenom: z.string().min(1),
  email: z.string().email(), motDePasse: z.string().min(6),
  role: z.enum(['ETUDIANT','ENTREPRISE','ENSEIGNANT','ADMIN']),
  filiere: z.string().optional(), promotion: z.string().optional(),
  nomEntreprise: z.string().optional(), secteurActivite: z.string().optional(),
  departement: z.string().optional(),
});
type Form = z.infer<typeof schema>;

export function RegisterPage() {
  const register_  = useRegister();
  const [role, setRole] = useState<Role>('ETUDIANT');
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'ETUDIANT' },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Creer un compte</h1>
          <p className="text-gray-500 mt-2">Rejoignez la plateforme</p>
        </div>

        {register_.isError && (
          <div className="bg-danger-100 text-danger-700 rounded-lg p-3 mb-4 text-sm">
            {(register_.error as any)?.response?.data?.message ?? 'Erreur lors de la creation'}
          </div>
        )}

        <form onSubmit={handleSubmit(d => register_.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nom" error={errors.nom?.message} {...register('nom')} />
            <Input label="Prenom" error={errors.prenom?.message} {...register('prenom')} />
          </div>
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Input label="Mot de passe" type="password" error={errors.motDePasse?.message} {...register('motDePasse')} />

          <Select label="Role" {...register('role')} onChange={e => { setRole(e.target.value as Role); register('role').onChange(e); }}>
            <option value="ETUDIANT">Etudiant</option>
            <option value="ENTREPRISE">Entreprise</option>
            <option value="ENSEIGNANT">Enseignant</option>
          </Select>

          {role === 'ETUDIANT' && (
            <div className="grid grid-cols-2 gap-4">
              <Input label="Filiere" {...register('filiere')} />
              <Input label="Promotion" {...register('promotion')} />
            </div>
          )}
          {role === 'ENTREPRISE' && (
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nom entreprise" {...register('nomEntreprise')} />
              <Input label="Secteur" {...register('secteurActivite')} />
            </div>
          )}
          {role === 'ENSEIGNANT' && (
            <Input label="Departement" {...register('departement')} />
          )}

          <Button type="submit" className="w-full py-3" disabled={register_.isPending}>
            {register_.isPending ? 'Creation...' : 'Creer mon compte'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Deja un compte ?{' '}
          <Link to="/auth/login" className="text-primary-600 font-medium hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}