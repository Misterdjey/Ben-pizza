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

- `pizza-orange` → `#FF6B35`
- `pizza-red` → `#D72638`
- `charcoal` → `#1a1a1a`

**Typographies :**

- `font-bebas` (Bebas Neue) → titres de section
- `font-poppins` (Poppins) → corps de texte

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

| Date       | Type    | Description                                                           |
| ---------- | ------- | --------------------------------------------------------------------- |
| 2026-05-07 | Init    | Scaffold Angular 21, composants de base, pizzas.json, Tailwind        |
| 2026-05-07 | Feature | i18n FR/EN : LanguageService (signal), translations.ts, switch nav    |
| 2026-05-07 | Feature | Double thème CSS (Artisan par défaut / Classic) via CSS variables      |
| 2026-05-07 | Feature | FloatingToolbar : nav sections + switcher thème (responsive mob/desk) |
| 2026-05-07 | Fix     | Menu pizzas : migration getter → computed signal (fix zoneless CD)    |
| 2026-05-07 | Feature | Favicon SVG pizza + title page mis à jour                             |
| 2026-05-07 | Fix     | Responsive hero (image, titre) + footer padding mobile toolbar        |
