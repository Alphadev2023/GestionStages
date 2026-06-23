CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    telephone VARCHAR(20),
    role VARCHAR(20) NOT NULL,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    filiere VARCHAR(100),
    promotion VARCHAR(50),
    nom_entreprise VARCHAR(200),
    secteur_activite VARCHAR(100),
    departement VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE offres (
    id BIGSERIAL PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    domaine VARCHAR(50) NOT NULL,
    localisation VARCHAR(255) NOT NULL,
    duree_mois INTEGER NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE,
    date_expiration DATE NOT NULL,
    remuneration DECIMAL(10,2),
    competences_requises TEXT,
    statut VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    entreprise_id BIGINT NOT NULL REFERENCES users(id),
    nombre_postes INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE INDEX idx_offres_domaine ON offres(domaine);
CREATE INDEX idx_offres_localisation ON offres(localisation);
CREATE INDEX idx_offres_statut ON offres(statut);

CREATE TABLE candidatures (
    id BIGSERIAL PRIMARY KEY,
    etudiant_id BIGINT NOT NULL REFERENCES users(id),
    offre_id BIGINT NOT NULL REFERENCES offres(id),
    cv_url VARCHAR(500) NOT NULL,
    lettre_motivation TEXT,
    statut VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE',
    feedback_entreprise TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    UNIQUE(etudiant_id, offre_id)
);

CREATE TABLE conventions (
    id BIGSERIAL PRIMARY KEY,
    candidature_id BIGINT NOT NULL UNIQUE REFERENCES candidatures(id),
    enseignant_id BIGINT REFERENCES users(id),
    statut VARCHAR(30) NOT NULL DEFAULT 'EN_ATTENTE',
    convention_url VARCHAR(500),
    date_validation_enseignant TIMESTAMP,
    date_approuve_admin TIMESTAMP,
    commentaire_enseignant TEXT,
    commentaire_admin TEXT,
    date_debut_stage DATE,
    date_fin_stage DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    expediteur_id BIGINT NOT NULL REFERENCES users(id),
    destinataire_id BIGINT NOT NULL REFERENCES users(id),
    contenu TEXT NOT NULL,
    lu BOOLEAN NOT NULL DEFAULT FALSE,
    candidature_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    destinataire_id BIGINT NOT NULL REFERENCES users(id),
    titre VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    lue BOOLEAN NOT NULL DEFAULT FALSE,
    reference_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);
