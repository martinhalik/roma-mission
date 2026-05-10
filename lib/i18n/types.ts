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
}

export type DictionaryKeyPath = NestedKeyOf<Dictionary>;

type NestedKeyOf<T> = {
  [K in keyof T & (string | number)]: T[K] extends object
    ? `${K}.${NestedKeyOf<T[K]>}`
    : `${K}`;
}[keyof T & (string | number)];
