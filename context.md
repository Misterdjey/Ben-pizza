# Benjamin Pizza — Contexte projet

## Présentation

Site plaquette one-page pour **Benjamin**, pizzaiolo à domicile. Il se déplace chez les particuliers et entreprises pour des soirées pizza en live cooking. Le site a pour objectif de présenter l'offre et de générer des réservations.

## Stack technique

| Outil           | Version         |
| --------------- | --------------- |
| Angular         | 21              |
| TypeScript      | 5.9             |
| Tailwind CSS    | 3 (via PostCSS) |
| Tests           | Vitest          |
| Formatage       | Prettier        |
| Package manager | npm 11          |

## Architecture

Application Angular mono-page (pas de routing). Chaque section est un composant standalone.

```text
src/app/
├── app.ts / app.html / app.css     — Root (navbar + footer)
├── hero/                           — Section hero avec photo de Benjamin
├── menu/                           — Grille de pizzas filtrée par catégorie
├── offers/                         — 3 formules tarifaires
├── how-it-works/                   — Process en 4 étapes
├── gallery/                        — Galerie photos
├── testimonials/                   — Avis clients + stats
├── cta/                            — Call-to-action final
└── services/pizza.service.ts       — Fetch HTTP de pizzas.json
```

**Données** : `public/pizzas.json` — 15 pizzas en 5 catégories :

- Base sauce tomate
- Base creme fraiche
- Spécialités du chef
- Sans fromage
- Desserts

## Design system

**Couleurs Tailwind custom :**

- `stone` → `#EDEAE5` (fond de page par défaut)
- `stone-mid` → `#D4CFC8`
- `stone-deep` → `#A39E97`
- `slate` → `#4A6272` (boutons primaires, accents)
- `slate-light` → `#7A9AAF`
- `slate-pale` → `#C8D8E4`
- `slate-dark` → `#2C3E4D` (hero, offres, footer, CTA)
- `ink` → `#1C1C1A`
- `cream` → `#F8F6F3`

**Typographies :**

- `font-playfair` (Playfair Display) → titres (600 fort, 400 italic accent)
- `font-dm` (DM Sans) → corps / nav / labels (300 body, 400 normal, 500 boutons)

**Principes de style :**

- Fond de page : `stone`, jamais blanc pur
- Sections alternées : cream / stone / slate-dark
- Border-radius : 2–3px max (`rounded-sm`)
- Boutons primaires : `bg-slate text-cream text-[11px] tracking-[0.12em] uppercase rounded-sm`
- Bouton ghost : `border border-slate/40 bg-transparent`
- Nav : sticky, `border-b border-stone-mid`, `px-8 md:px-16 py-5`
- FloatingToolbar : navigation sections uniquement (pas de switcher thème)

## i18n

Système de traduction maison basé sur les signals Angular 21.

- `src/app/i18n/translations.ts` — objet typé avec toutes les chaînes FR/EN
- `src/app/services/language.service.ts` — `LanguageService` : signal `lang`, computed `t`, méthode `toggle()`
- Langue par défaut : **FR**
- Switch visible dans la navbar (bouton 🇬🇧 EN / 🇫🇷 FR)

## Points d'attention

- Les images galerie sont dans `/public/images/gallery/` (6 fichiers PNG)
- L'image de Benjamin est en `/public/images/benjamin-pizzaiolo.png`
- Les coordonnées de contact dans le CTA sont fictives (à mettre à jour)

---

## Directives de travail

### Git

- **Toujours demander confirmation avant un `git commit` ou un `git push`**, même si les changements semblent évidents.

### Mise à jour du contexte

- **Mettre à jour ce fichier `context.md` après chaque feature développée ou bug corrigé**, et ce **avant le commit**.
- Décrire brièvement ce qui a changé dans la section "Historique des évolutions" ci-dessous.

---

## Historique des évolutions

| Date       | Type    | Description                                                                       |
| ---------- | ------- | --------------------------------------------------------------------------------- |
| 2026-05-07 | Init    | Scaffold Angular 21, composants de base, pizzas.json, Tailwind                    |
| 2026-05-07 | Feature | i18n FR/EN : LanguageService (signal), translations.ts, switch nav                |
| 2026-05-07 | Feature | Double thème CSS (Artisan par défaut / Classic) via CSS variables                 |
| 2026-05-07 | Feature | FloatingToolbar : nav sections + switcher thème (responsive mob/desk)             |
| 2026-05-07 | Fix     | Menu pizzas : migration getter → computed signal (fix zoneless CD)                |
| 2026-05-07 | Feature | Favicon SVG pizza + title page mis à jour                                         |
| 2026-05-07 | Fix     | Responsive hero (image, titre) + footer padding mobile toolbar                    |
| 2026-05-07 | Feature | Hero : vidéo benjamin-pizzaiolo-clip.mp4 (3.5s, autoplay, muted)                  |
| 2026-05-07 | Fix     | Hero vidéo : muted via ViewChild (attribut HTML ignoré par Angular)               |
| 2026-05-10 | Feature | Module admin : routing lazy-load, VitrinneComponent, AuthGuard, LoginGoogle       |
| 2026-05-10 | Feature | Supabase : projet benjamin-pizza (eu-west-3), 5 tables, RLS, seed offres+ingreds  |
| 2026-05-10 | Feature | Admin Dashboard : KPI CA, marge globale, marge par commande                       |
| 2026-05-10 | Feature | Admin Commandes : liste, CRUD, calcul prix auto par tranche offre                 |
| 2026-05-10 | Feature | Admin Dépenses : par commande, catalogue + hors catalogue, marge temps réel       |
| 2026-05-10 | Feature | Admin Clients : liste, CRUD, historique commandes, CA par client                  |
| 2026-05-10 | Feature | Admin Offres : CRUD barèmes avec tranches tarifaires                              |
| 2026-05-10 | Feature | Facture PDF (jsPDF) : téléchargement direct sur commandes terminées               |
| 2026-05-10 | Fix     | Auth guard : race condition OAuth + redirect URL localhost                        |
| 2026-05-10 | Fix     | Admin : texte blanc sur fond blanc (body color override → text-gray-900)          |
| 2026-05-10 | Feature | Clients : champs prénom + N° TVA (entreprise), format tél FR                      |
| 2026-05-10 | Feature | Admin Ingrédients : page CRUD catalogue (nom, unité, prix référence)              |
| 2026-05-10 | Feature | Vitrine : bouton Espace pro dans navbar (outline, hover orange)                   |
| 2026-05-10 | Fix     | Locale fr-FR : symbole euro à droite, virgule décimale                            |
| 2026-05-10 | Fix     | Suppression commande : ON DELETE CASCADE sur depenses (FK 23503)                  |
| 2026-05-10 | Feature | ToastService + modal confirm custom (remplace alert/confirm natifs)               |
| 2026-05-14 | Refonte | Refonte design vitrine : Playfair Display + DM Sans, palette stone/slate/cream    |
| 2026-05-14 | Refonte | Suppression double thème CSS (Artisan/Classic) et FloatingToolbar switcher thème  |
| 2026-05-14 | Refonte | Refonte templates vitrine sur mockup by_ben_v2 : hero, concept, offres, avis, CTA |
| 2026-05-14 | Refonte | Suppression section Menu (pizzas) de la vitrine — admin inchangé                  |
| 2026-05-14 | Feature | Gallery : grille 5 photos/page, pagination fleches+dots, hover overlay, lightbox  |
| 2026-05-14 | Feature | Gallery : animations slide CSS (220ms grille, 180ms lightbox) entre pages/photos  |
| 2026-05-14 | Refonte | Admin : redesign complet — palette slate-dark/cream/stone, Playfair/DM Sans       |
| 2026-05-14 | Feature | Gallery : chargement dynamique via gallery.json (pizzas inclus, 21 images)        |
| 2026-05-14 | Feature | Admin Ingredients : colonne poids_unitaire (g), migration BDD + modele + UI       |
| 2026-05-14 | Feature | Admin Recettes : liste + detail, tables Supabase, calculs couts/poids signals     |
| 2026-05-14 | Feature | Guard CanDeactivate recette-detail : modale confirm si modifs non enregistrées    |
