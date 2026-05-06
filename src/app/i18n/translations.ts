export type Lang = 'fr' | 'en';

export const translations = {
  en: {
    nav: {
      bookNow: 'Book now 🍕',
    },
    footer: {
      copyright: '© 2024 Benjamin Pizza Experience. All rights reserved.',
    },
    hero: {
      headline: 'A pizzaiolo at your place 🔥',
      subheadline: 'Real pizzas. Real show. An unforgettable night.',
      cta: 'Book your pizza night 🍕',
      badge: '+100 events done',
    },
    menu: {
      title: 'Our Pizzas',
      subtitle: 'Handcrafted pizzas made with passion and the finest ingredients',
      allPizzas: 'All Pizzas',
    },
    offers: {
      title: 'Special Offers',
      subtitle: 'Exclusive packages for unforgettable pizza experiences',
      popularBadge: 'Most Popular',
      bookNow: 'Book Now',
      tiers: [
        {
          name: 'Basic Experience',
          price: '€150',
          features: ['8-10 people', '6 pizzas + 2 desserts', 'Live cooking show', 'Setup & cleanup'],
        },
        {
          name: 'Premium Experience',
          price: '€250',
          features: ['12-15 people', '10 pizzas + 4 desserts', 'Interactive cooking workshop', 'Aperitif & drinks', 'Photo session'],
        },
        {
          name: 'VIP Experience',
          price: '€400',
          features: ['20+ people', 'Unlimited pizzas & desserts', 'Private chef experience', 'Premium drinks & cocktails', 'Professional photography', 'Custom menu creation'],
        },
      ],
    },
    howItWorks: {
      title: 'How It Works',
      subtitle: 'From booking to the first bite — your pizza experience made simple',
      steps: [
        { title: 'Book Your Date', description: "Contact us to choose your preferred date and package. We'll discuss your preferences and confirm availability." },
        { title: 'Customize Menu', description: 'Select your favorite pizzas from our menu or let us create custom recipes based on your preferences.' },
        { title: 'Live Cooking Show', description: 'Benjamin arrives with fresh ingredients and performs a spectacular live cooking demonstration right at your location.' },
        { title: 'Enjoy & Celebrate', description: 'Savor the freshly baked pizzas with your loved ones. Create unforgettable memories with family and friends.' },
      ],
      ctaTitle: 'Ready for Your Pizza Night?',
      ctaText: 'Book your private pizza experience today and create memories that will last a lifetime.',
      ctaButton: 'Start Booking Process',
    },
    gallery: {
      title: 'Gallery',
      subtitle: 'Moments captured from unforgettable pizza experiences',
      captions: ['Live Cooking Show', 'Fresh from the Oven', 'Happy Moments', 'Art of Pizza Making', 'Family Gathering', 'Sweet Endings'],
      alts: ['Live cooking demonstration', 'Freshly baked pizzas', 'Happy guests enjoying pizza', 'Pizza dough preparation', 'Family enjoying pizza night', 'Sweet pizza desserts'],
      instagramTitle: 'Follow Our Journey',
      instagramText: 'See more amazing moments on Instagram',
    },
    testimonials: {
      title: 'What Our Clients Say',
      subtitle: 'Real experiences from real pizza lovers',
      items: [
        { name: 'Sarah Martin', quote: "Benjamin's pizza experience was absolutely incredible! The live cooking show had everyone mesmerized, and the pizzas were out of this world. Our family gathering became an unforgettable event.", event: 'Birthday Celebration — 15 guests' },
        { name: 'Jean Dupont', quote: 'We hired Benjamin for our company team building event. The interactive workshop was engaging, and everyone learned something new. The food was exceptional!', event: 'Corporate Event — 25 guests' },
        { name: 'Marie Leroy', quote: 'The VIP experience exceeded all our expectations. Benjamin created custom pizzas for our dietary needs, and the photography captured every magical moment perfectly.', event: 'Wedding Anniversary — 30 guests' },
        { name: 'Thomas Chen', quote: "Benjamin transformed our backyard into a pizzeria! The kids were fascinated by the cooking process, and the adults couldn't stop raving about the flavors.", event: 'Family Reunion — 20 guests' },
        { name: 'Anna Rodriguez', quote: "The premium package was worth every euro. The aperitif selection was perfect, and Benjamin's storytelling during the cooking made it so entertaining.", event: 'Dinner Party — 12 guests' },
        { name: 'Pierre Kowalski', quote: "We've done this twice now — once for our engagement and once for our housewarming. Benjamin makes every celebration special with his passion and expertise.", event: 'Housewarming Party — 18 guests' },
      ],
      eventsLabel: 'Events Completed',
      ratingLabel: 'Average Rating',
      guestsLabel: 'Happy Guests',
    },
    cta: {
      titleLine1: 'Ready for Your',
      titleLine2: 'Pizza Experience?',
      subtitle: "Don't wait to create unforgettable memories. Book your private pizza night today!",
      phone: '📞 Call Now: +33 6 XX XX XX XX',
      email: '📧 Email: contact@benjaminpizza.com',
      urgencyTitle: 'Limited Availability!',
      urgencyText: 'Our calendar fills up quickly. Popular dates book months in advance.',
      response: 'Response within 24h',
      area: 'Serves your area',
      socialProof: 'Trusted by families, companies, and event planners',
    },
  },

  fr: {
    nav: {
      bookNow: 'Réserver 🍕',
    },
    footer: {
      copyright: '© 2024 Benjamin Pizza Experience. Tous droits réservés.',
    },
    hero: {
      headline: 'Un pizzaiolo chez vous 🔥',
      subheadline: 'De vraies pizzas. Un vrai show. Une soirée inoubliable.',
      cta: 'Réserver votre soirée pizza 🍕',
      badge: '+100 événements réalisés',
    },
    menu: {
      title: 'Nos Pizzas',
      subtitle: 'Des pizzas artisanales préparées avec passion et les meilleurs ingrédients',
      allPizzas: 'Toutes les pizzas',
    },
    offers: {
      title: 'Nos Formules',
      subtitle: 'Des formules exclusives pour des expériences pizza inoubliables',
      popularBadge: 'La plus demandée',
      bookNow: 'Réserver',
      tiers: [
        {
          name: 'Formule Essentielle',
          price: '150 €',
          features: ['8 à 10 personnes', '6 pizzas + 2 desserts', 'Show de cuisson en direct', 'Installation et nettoyage'],
        },
        {
          name: 'Formule Premium',
          price: '250 €',
          features: ['12 à 15 personnes', '10 pizzas + 4 desserts', 'Atelier de cuisine interactif', 'Apéritif & boissons', 'Séance photo'],
        },
        {
          name: 'Formule VIP',
          price: '400 €',
          features: ['20+ personnes', 'Pizzas & desserts à volonté', 'Expérience chef privé', 'Boissons premium & cocktails', 'Photographe professionnel', 'Menu personnalisé'],
        },
      ],
    },
    howItWorks: {
      title: 'Comment ça marche',
      subtitle: 'De la réservation à la première bouchée — votre expérience pizza en toute simplicité',
      steps: [
        { title: 'Choisissez votre date', description: "Contactez-nous pour choisir votre date et votre formule. Nous discuterons de vos préférences et confirmerons la disponibilité." },
        { title: 'Personnalisez le menu', description: 'Sélectionnez vos pizzas préférées ou laissez-nous créer des recettes sur mesure selon vos envies.' },
        { title: 'Show de cuisson en direct', description: 'Benjamin arrive avec des ingrédients frais et réalise un spectaculaire show de cuisine en direct chez vous.' },
        { title: 'Savourez & célébrez', description: 'Dégustez les pizzas fraîchement cuites avec vos proches. Créez des souvenirs inoubliables en famille et entre amis.' },
      ],
      ctaTitle: 'Prêt pour votre soirée pizza ?',
      ctaText: "Réservez votre expérience pizza privée dès aujourd'hui et créez des souvenirs qui dureront toute une vie.",
      ctaButton: 'Commencer la réservation',
    },
    gallery: {
      title: 'Galerie',
      subtitle: "Des moments capturés lors d'expériences pizza inoubliables",
      captions: ['Show de cuisson', 'Frais du four', 'Moments de bonheur', "L'art de la pizza", 'Soirée en famille', 'Douceurs finales'],
      alts: ['Démonstration de cuisson en direct', 'Pizzas fraîchement cuites', 'Convives heureux savourant la pizza', 'Préparation de la pâte à pizza', 'Famille savourant sa soirée pizza', 'Pizzas desserts sucrées'],
      instagramTitle: 'Suivez notre aventure',
      instagramText: 'Encore plus de moments magiques sur Instagram',
    },
    testimonials: {
      title: 'Ce que disent nos clients',
      subtitle: 'Des expériences vraies, vécues par de vrais amateurs de pizza',
      items: [
        { name: 'Sarah Martin', quote: "L'expérience pizza de Benjamin était absolument incroyable ! Le show de cuisson en direct a fasciné tout le monde, et les pizzas étaient à tomber. Notre réunion de famille est devenue un événement inoubliable.", event: 'Anniversaire — 15 invités' },
        { name: 'Jean Dupont', quote: "Nous avons fait appel à Benjamin pour notre team building. L'atelier interactif était très engageant, tout le monde a appris quelque chose de nouveau. La nourriture était exceptionnelle !", event: "Événement d'entreprise — 25 invités" },
        { name: 'Marie Leroy', quote: "La formule VIP a largement dépassé nos attentes. Benjamin a créé des pizzas adaptées à nos régimes alimentaires, et les photos ont capturé chaque moment magique à la perfection.", event: 'Anniversaire de mariage — 30 invités' },
        { name: 'Thomas Chen', quote: "Benjamin a transformé notre jardin en pizzeria ! Les enfants étaient fascinés par la préparation, et les adultes n'arrêtaient pas de se régaler.", event: 'Réunion de famille — 20 invités' },
        { name: 'Anna Rodriguez', quote: "La formule premium valait chaque euro. La sélection d'apéritifs était parfaite, et le storytelling de Benjamin pendant la cuisson rendait le tout très divertissant.", event: 'Dîner entre amis — 12 invités' },
        { name: 'Pierre Kowalski', quote: "On l'a fait deux fois — une fois pour nos fiançailles, une fois pour notre pendaison de crémaillère. Benjamin rend chaque célébration unique avec sa passion et son expertise.", event: 'Pendaison de crémaillère — 18 invités' },
      ],
      eventsLabel: 'Événements réalisés',
      ratingLabel: 'Note moyenne',
      guestsLabel: 'Convives ravis',
    },
    cta: {
      titleLine1: 'Prêt pour votre',
      titleLine2: 'soirée pizza ?',
      subtitle: "N'attendez plus pour créer des souvenirs inoubliables. Réservez votre soirée pizza privée dès aujourd'hui !",
      phone: '📞 Appeler : +33 6 XX XX XX XX',
      email: '📧 Email : contact@benjaminpizza.com',
      urgencyTitle: 'Disponibilités limitées !',
      urgencyText: "Notre calendrier se remplit vite. Les dates populaires sont réservées plusieurs mois à l'avance.",
      response: 'Réponse sous 24h',
      area: 'Intervient dans votre secteur',
      socialProof: "Choix des familles, entreprises et organisateurs d'événements",
    },
  },
};

export type Translations = typeof translations.en;
