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
  mission: {
    hero: {
      label: string;
      titleLine1: string;
      titleLine2: string;
      subtitle: string;
    };
    whyRoma: {
      label: string;
      titleLine1: string;
      titleLine2: string;
      pullStatValue: string;
      pullStatLabel: string;
      aside: string;
      reason1Title: string;
      reason1Body: string;
      reason2Title: string;
      reason2Body: string;
      reason3Title: string;
      reason3Body: string;
    };
    ourStory: {
      label: string;
      titleLine1: string;
      titleLine2: string;
      paragraph1: string;
      paragraph2: string;
      paragraph3: string;
      quote: string;
      attribution: string;
      cta: string;
    };
    whatWeDo: {
      label: string;
      titleLine1: string;
      titleLine2: string;
      intro: string;
      plantingTitle: string;
      plantingBody: string;
      plantingStatPlanted: string;
      plantingStatLost: string;
      plantingStatProgress: string;
      parishTitle: string;
      parishBody: string;
      parishStatSupported: string;
      parishStatTransformed: string;
      parishStatFathers: string;
      childrenTitle: string;
      childrenBody: string;
      childrenStatReached: string;
      childrenStatLearned: string;
      childrenStatJoined: string;
      centersTitle: string;
      centersBody: string;
      centersStatBuilt: string;
      centersStatProgress: string;
    };
    vision: {
      label: string;
      titleLine1: string;
      titleLine2: string;
      body: string;
      statParishesSupported: string;
      statChurchesActive: string;
      statCenterBuilt: string;
      statCenterInProgress: string;
    };
    countries: {
      label: string;
      title: string;
      intro: string;
      legendPrefix: string;
      legendActive: string;
      legendOrthodox: string;
      legendNextSteps: string;
      legendOpportunity: string;
      cardOfficial: string;
      cardEstimated: string;
      cardOfPopulation: string;
      cardScripture: string;
      cardLiturgy: string;
      cardKnownWorkers: string;
      cardSource: string;
      badgeAvailable: string;
      badgePartial: string;
      badgeProgress: string;
      badgeNeeded: string;
      footnote: string;
    };
    beliefs: {
      label: string;
      title: string;
      sacramentalTitle: string;
      sacramentalDesc: string;
      longTermTitle: string;
      longTermDesc: string;
      communityTitle: string;
      communityDesc: string;
    };
    shareNudge: {
      text: string;
      shareLabel: string;
    };
  };
}

export type DictionaryKeyPath = NestedKeyOf<Dictionary>;

type NestedKeyOf<T> = {
  [K in keyof T & (string | number)]: T[K] extends object
    ? `${K}.${NestedKeyOf<T[K]>}`
    : `${K}`;
}[keyof T & (string | number)];
