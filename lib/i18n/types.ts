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
  stories: {
    hero: {
      label: string;
      titleLine1: string;
      titleLine2: string;
      subtitle: string;
    };
    featured: {
      label: string;
      watchOverlay: string;
      watchAria: string;
      quoteSource: string;
      quoteTranslation: string;
      attribution: string;
      context: string;
      watchCta: string;
    };
    stats: {
      fathersStat: string;
      fathersLabel: string;
      fathersSub: string;
      yearsStat: string;
      yearsLabel: string;
      yearsSub: string;
      workshopsStat: string;
      workshopsLabel: string;
      workshopsSub: string;
    };
    founder: {
      label: string;
      eyebrow: string;
      title: string;
      body: string;
      cta: string;
    };
    more: {
      label: string;
      titleLine1: string;
      titleLine2: string;
    };
    testimonies: {
      cibul: {
        country: string;
        quoteSource: string;
        quoteTranslation: string;
        author: string;
        context: string;
      };
      fathers: {
        country: string;
        quoteSource: string;
        quoteTranslation: string;
        author: string;
        context: string;
      };
      adrianDominik: {
        country: string;
        quoteSource: string;
        quoteTranslation: string;
        author: string;
        context: string;
      };
      miroslava: {
        country: string;
        quoteSource: string;
        quoteTranslation: string;
        author: string;
        context: string;
      };
      gemer: {
        country: string;
        quoteSource: string;
        quoteTranslation: string;
        author: string;
        context: string;
      };
    };
    anonymous: {
      eyebrow: string;
      lead: string;
      paragraph1: string;
      paragraph2: string;
      closing: string;
    };
    closing: {
      label: string;
      title: string;
      paragraph1: string;
      paragraph2: string;
      ctaSupport: string;
      ctaLearn: string;
    };
  };
}

export type DictionaryKeyPath = NestedKeyOf<Dictionary>;

type NestedKeyOf<T> = {
  [K in keyof T & (string | number)]: T[K] extends object
    ? `${K}.${NestedKeyOf<T[K]>}`
    : `${K}`;
}[keyof T & (string | number)];
