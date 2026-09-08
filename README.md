\# GestionStages



Plateforme de gestion des stages universitaires : publication d'offres par

les entreprises, candidatures des étudiants, conventions validées par les

enseignants et l'administration, messagerie et reporting.



Deux interfaces consomment la même API : un front Angular et un front React.



\## Architecture



| Composant | Technologie | Dossier |

|---|---|---|

| API | Spring Boot 3.5 / Java 21, JWT, WebSocket | `stages-backend` |

| Front Angular | Angular | `stages-frontend` |

| Front React | React, Vite | `stages-frontend-react` |

| Base de données | PostgreSQL 17 | conteneur |

| Stockage de fichiers | MinIO | conteneur |



Les migrations de schéma sont gérées par Flyway et s'appliquent

automatiquement au démarrage.



\## Prérequis



\- Docker Desktop (avec Docker Compose v2)

\- Les ports 4206, 4207, 8084, 5435, 9000 et 9001 libres



\## Démarrage



copy .env.example .env





Sous Linux ou macOS : `cp .env.example .env`



Deux variables sont obligatoires et bloquent le démarrage si elles sont vides :



| Variable | Description |

|---|---|

| `DB\_PASS` | Mot de passe PostgreSQL, libre |

| `JWT\_SECRET` | Clé de signature des jetons, encodée en Base64 |



Le `JWT\_SECRET` doit être une chaîne Base64 valide, car l'application la

décode au démarrage. Pour en générer une sous PowerShell :



$bytes = New-Object byte\[] 48

\[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)

\[Convert]::ToBase64String($bytes)





Coller le résultat sur une seule ligne dans le `.env`.



Puis :



docker compose up -d --build

docker compose ps





Attendre que `stages\_backend` affiche `healthy`. Le backend attend que

PostgreSQL et MinIO soient prêts avant de démarrer.



\## URLs d'accès



| Interface | URL |

|---|---|

| Front Angular | http://localhost:4206 |

| Front React | http://localhost:4207 |

| Documentation API (Swagger) | http://localhost:8084/swagger-ui.html |

| Console MinIO | http://localhost:9001 |



La console MinIO utilise les identifiants `MINIO\_ACCESS\_KEY` et

`MINIO\_SECRET\_KEY` du `.env`, par défaut `minioadmin` pour les deux.



\## Comptes de test



Créés par la migration `V4\_\_seed\_test\_accounts.sql`, donc recréés

automatiquement après un `docker compose down -v`.



| Email | Mot de passe | Rôle |

|---|---|---|

| admin@stages.com | Passer@123 | ADMIN |

| enseignant@stages.com | Passer@123 | ENSEIGNANT |

| etudiant@stages.com | Passer@123 | ETUDIANT |

| entreprise@stages.com | Passer@123 | ENTREPRISE |



Les comptes étudiant, enseignant et entreprise sont renseignés avec leurs

champs spécifiques (filière, département, nom d'entreprise) afin d'être

directement exploitables.



L'envoi d'emails est optionnel : sans `MAIL\_USERNAME` ni `MAIL\_PASSWORD`,

les notifications par email sont simplement inactives.



\## Arrêt



docker compose down





Pour tout supprimer, base de données et fichiers compris :



docker compose down -v





\## Dépannage



\*\*Un port est déjà occupé\*\*



Modifier les ports dans le `.env` :



ANGULAR\_PORT=4206

REACT\_PORT=4207

API\_PORT=8084

DB\_PORT=5435

MINIO\_PORT=9000

MINIO\_CONSOLE\_PORT=9001





\*\*Le démarrage échoue avec `DB\_PASS manquant`\*\*



Le `.env` n'a pas été créé ou la variable est vide. Reprendre l'étape de

copie du `.env.example`.



\*\*`password authentication failed for user "postgres"`\*\*



Le volume PostgreSQL conserve le mot de passe de sa première

initialisation. Après un changement de `DB\_PASS` :



docker compose down -v

docker compose up -d





\*\*Flyway échoue avec `Validate failed` ou un checksum différent\*\*



Une migration déjà appliquée a été modifiée. Les fichiers de migration

sont immuables une fois exécutés. Repartir d'une base vierge avec

`docker compose down -v`.



\*\*Le login renvoie une erreur 500\*\*



Le `JWT\_SECRET` n'est pas du Base64 valide. Les caractères comme le tiret

ne font pas partie de l'alphabet Base64. Regénérer avec la commande

ci-dessus, puis `docker compose up -d backend`.



\*\*Erreur 502 depuis un front\*\*



Le backend ne répond pas au proxy. Vérifier son état avec

`docker compose ps` et ses journaux avec `docker compose logs backend`.

Les `nginx.conf` des fronts pointent sur `http://backend:8082`, port

interne du conteneur, à ne pas confondre avec `API\_PORT` côté hôte.



\*\*Une modification du code n'a aucun effet\*\*



Les fronts et la configuration sont compilés dans les images. Après toute

modification, reconstruire :



docker compose up -d --build





Si le cache persiste : `docker compose build --no-cache <service>`.

Penser aussi au rechargement forcé du navigateur (Ctrl+Maj+R).



\*\*Le champ du mot de passe dans l'API\*\*



L'endpoint `/api/auth/login` attend `email` et `motDePasse`. Le schéma

complet est consultable sur `http://localhost:8084/v3/api-docs`.

