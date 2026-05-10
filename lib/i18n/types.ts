export interface Dictionary {
  nav: {
    mission: string;
    locations: string;
    media: string;
    stories: string;
    share: string;
    contact: string;
    supportMission: string;
    toggleMenu: string;
    selectLanguage: string;
  };
  footer: {
    brand: string;
    tagline: string;
    colMission: string;
    colMedia: string;
    colInvolved: string;
    colInvolvedShort: string;
    colContact: string;
    linkOurMission: string;
    linkOurStory: string;
    linkStories: string;
    linkMedia: string;
    linkDocumentary: string;
    linkNews: string;
    linkSupport: string;
    linkVolunteer: string;
    linkMissionTrips: string;
    linkTrips: string;
    director: string;
    copyright: string;
    copyrightShort: string;
    privacyPolicy: string;
    termsOfUse: string;
    light: string;
    dark: string;
    switchToLight: string;
    switchToDark: string;
  };
  share: {
    title: string;
    subtitle: string;
    copyLink: string;
    copyLinkLabel: string;
    copyAction: string;
    copied: string;
    shareVia: string;
    shareOn: string;
    close: string;
  };
  home: {
    hero: {
      label: string;
      titleLine1: string;
      titleLine2: string;
      subtitle: string;
      ctaSupport: string;
      ctaVolunteer: string;
      ctaLearnMore: string;
    };
    urgency: {
      label: string;
      titleLine1: string;
      titleLine2: string;
      body: string;
      statement1: string;
      statement2: string;
      absentLead: string;
      absentEmph: string;
      presentLead: string;
      presentEmph: string;
    };
    results: {
      label: string;
      titleLine1: string;
      titleLine2: string;
      cardFathers: string;
      cardChildren: string;
      cardDignity: string;
      cardAddiction: string;
      cardFamilies: string;
    };
    approach: {
      label: string;
      title: string;
      subtitle: string;
      pillar1Title: string;
      pillar1Desc: string;
      pillar2Title: string;
      pillar2Desc: string;
      pillar3Title: string;
      pillar3Desc: string;
      pillar4Title: string;
      pillar4Desc: string;
      pillar5Title: string;
      pillar5Desc: string;
    };
    testimony: {
      label: string;
      quote: string;
      attribution: string;
      watchLabel: string;
      watchAria: string;
    };
    missionField: {
      label: string;
      titleLine1: string;
      titleLine2: string;
      descriptionBefore: string;
      descriptionHighlight: string;
      descriptionAfter: string;
      statParishes: string;
      statChurches: string;
      statSince: string;
      cta: string;
    };
    featuredMedia: {
      label: string;
      titleLine1: string;
      titleLine2: string;
      watchAria: string;
      cta: string;
    };
  };
  locations: {
    hero: {
      label: string;
      titleLine1: string;
      titleLine2: string;
      subtitle: string;
    };
    stats: {
      missionCenters: string;
      plantedChurches: string;
      activePlants: string;
      parishesSupported: string;
      primaryField: string;
      primaryFieldValue: string;
    };
    map: {
      label: string;
      sectionTitle: string;
      sectionSubtitle: string;
      loading: string;
      unavailable: string;
      addToken: string;
      legendTitle: string;
      legendDensity: string;
      legendMissionCenter: string;
      legendParish: string;
      legendCollaborating: string;
      legendPlanting: string;
      legendFailed: string;
      closeAria: string;
      supportCta: string;
      preventCta: string;
    };
    centersSection: { label: string; title: string; subtitle: string };
    plantedSection: { label: string; title: string; subtitle: string };
    activeSection: { label: string; title: string; subtitle: string };
    endedSection: {
      label: string;
      locationCountry: string;
      carryForward: string;
    };
    supportedSection: {
      label: string;
      title: string;
      subtitle: string;
      more: string;
    };
    cards: {
      capacity: string;
      weeklyAvg: string;
      established: string;
      programsRunning: string;
      yearsActive: string;
      ongoing: string;
      started: string;
      inField: string;
      badgeActive: string;
    };
    statuses: {
      missionCenter: string;
      developingCenter: string;
      firstChapel: string;
      concluded2026: string;
      planting: string;
      concluded: string;
      supported: string;
    };
    centers: {
      klenovec: {
        subtitle: string;
        region: string;
        description: string;
        badge: string;
        programs: string[];
      };
      markovce: {
        subtitle: string;
        region: string;
        description: string;
        badge: string;
        programs: string[];
      };
    };
    planted: {
      klenovec: { name: string; note: string };
      kacanov: { name: string; note: string };
      mutnik: { name: string; note: string };
    };
    active: {
      rimavskaPila: { description: string };
      zemjastrabie: { description: string };
    };
    ended: {
      name: string;
      years: string;
      village: string;
      description: string;
      learned: string;
    };
    items: {
      klenovec: { subtitle: string; description: string; region: string };
      markovce: { subtitle: string; description: string; region: string };
      kacanov: { subtitle: string; description: string };
      mutnik: { subtitle: string; description: string };
      rimavskaPila: { subtitle: string; description: string };
      zemjastrabie: { subtitle: string; description: string };
      hnusta: { subtitle: string; description: string };
      hacava: { subtitle: string; description: string };
      varadka: { subtitle: string; description: string };
    };
  };
}

export type DictionaryKeyPath = NestedKeyOf<Dictionary>;

type NestedKeyOf<T> = {
  [K in keyof T & (string | number)]: T[K] extends object
    ? `${K}.${NestedKeyOf<T[K]>}`
    : `${K}`;
}[keyof T & (string | number)];
