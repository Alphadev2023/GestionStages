-- Comptes de demonstration. Mot de passe commun : Passer@123
-- Hash BCrypt cost 10, prefixe $2a$ compatible BCryptPasswordEncoder.

INSERT INTO users (email, mot_de_passe, nom, prenom, telephone, role, actif,
                   filiere, promotion, nom_entreprise, secteur_activite, departement,
                   created_at, updated_at)
VALUES
    ('admin@stages.com',
     '$2a$10$AvCWelq1Mp.9coCpEesUW.Rm8dPonoKlETE0a0MKuSTmBNtdH0xV6',
     'Admin', 'Systeme', '+224600000001', 'ADMIN', TRUE,
     NULL, NULL, NULL, NULL, NULL,
     NOW(), NOW()),

    ('enseignant@stages.com',
     '$2a$10$AvCWelq1Mp.9coCpEesUW.Rm8dPonoKlETE0a0MKuSTmBNtdH0xV6',
     'Barry', 'Mamadou', '+224600000002', 'ENSEIGNANT', TRUE,
     NULL, NULL, NULL, NULL, 'Informatique',
     NOW(), NOW()),

    ('etudiant@stages.com',
     '$2a$10$AvCWelq1Mp.9coCpEesUW.Rm8dPonoKlETE0a0MKuSTmBNtdH0xV6',
     'Diallo', 'Fatoumata', '+224600000003', 'ETUDIANT', TRUE,
     'Genie Logiciel', '2025-2026', NULL, NULL, NULL,
     NOW(), NOW()),

    ('entreprise@stages.com',
     '$2a$10$AvCWelq1Mp.9coCpEesUW.Rm8dPonoKlETE0a0MKuSTmBNtdH0xV6',
     'Sow', 'Aissatou', '+224600000004', 'ENTREPRISE', TRUE,
     NULL, NULL, 'Sabari Tech', 'Informatique', NULL,
     NOW(), NOW())
    ON CONFLICT (email) DO UPDATE
                               SET mot_de_passe = EXCLUDED.mot_de_passe,
                               role = EXCLUDED.role,
                               actif = TRUE,
                               updated_at = NOW();