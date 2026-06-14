export interface Dictionary {
  nav: {
    home: string;
    mission: string;
    locations: string;
    media: string;
    stories: string;
    heritage: string;
    activity: string;
    more: string;
    share: string;
    contact: string;
    contactWhatsapp: string;
    supportMission: string;
    donate: string;
    toggleMenu: string;
    selectLanguage: string;
    resources: string;
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
    linkResources: string;
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
    imageAlt: {
      urgencyFuture: string;
      populationGrowing: string;
      education: string;
      dignity: string;
      approach: string;
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
    mapSection: {
      label: string;
      title: string;
      intro: string;
    };
    centersSection: {
      label: string;
      title: string;
      intro: string;
      capacity: string;
      weeklyAvg: string;
      established: string;
      programsLabel: string;
    };
    plantedSection: {
      label: string;
      title: string;
      intro: string;
      yearsActive: string;
      ongoing: string;
      weeklyAvg: string;
    };
    activeSection: {
      label: string;
      title: string;
      intro: string;
      activeBadge: string;
      started: string;
      inField: string;
      yearShort: string;
      yearsShort: string;
      yearLessThan: string;
    };
    endedSection: {
      label: string;
      countryLabel: string;
      carryForward: string;
    };
    supportedSection: {
      label: string;
      title: string;
      intro: string;
      footnote: string;
    };
    map: {
      klenovec: { subtitle: string; description: string; status: string };
      markovce: { subtitle: string; description: string; status: string };
      kacanov: { subtitle: string; description: string; status: string };
      mutnik: { subtitle: string; description: string; status: string };
      "rimavska-pila": { subtitle: string; description: string; status: string };
      zemjastrabie: { subtitle: string; description: string; status: string };
      hnusta: { subtitle: string; description: string; status: string };
      hacava: { subtitle: string; description: string; status: string };
      varadka: { subtitle: string; description: string; status: string };
      supportedStatus: string;
    };
    centers: {
      klenovec: {
        subtitle: string;
        region: string;
        description: string;
        badge: string;
        program1: string;
        program2: string;
        program3: string;
        program4: string;
        program5: string;
      };
      markovce: {
        subtitle: string;
        region: string;
        description: string;
        badge: string;
        program1: string;
        program2: string;
        program3: string;
      };
    };
    planted: {
      klenovec: { name: string; note: string; status: string };
      kacanov: { name: string; note: string; status: string };
      mutnik: { name: string; note: string; status: string };
    };
    activePlants: {
      "rimavska-pila": { description: string };
      zemjastrabie: { description: string };
    };
    endedPlant: {
      years: string;
      description: string;
      learned: string;
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
  ourStory: {
    hero: {
      backToMission: string;
      label: string;
      titleLine1: string;
      titleLine2: string;
      titleLine3: string;
      subtitle: string;
    };
    authorMartin: string;
    authorMartinFounder: string;
    timeline: {
      yearLabel: {
        before2016: string;
        y2016: string;
        y2017: string;
        y2018: string;
        y2019: string;
        y2020: string;
        today: string;
      };
      before2016: {
        heading: string;
        pullQuote: string;
        pullQuoteOriginal: string;
        body1: string;
        body2: string;
      };
      year2016: {
        heading: string;
        body1: string;
        body2: string;
        photoAlt: string;
        photoCaption: string;
        pullQuote: string;
        pullQuoteOriginal: string;
        body3: string;
      };
      year2017: {
        heading: string;
        body1: string;
        pullQuote: string;
        pullQuoteOriginal: string;
        videoCaptionUkulele: string;
        photoAlt: string;
        photoCaption: string;
        videoCaptionSettlement: string;
      };
      movingIn: {
        heading: string;
        body1: string;
        pullQuote: string;
        pullQuoteOriginal: string;
        body2: string;
      };
      year2018: {
        heading: string;
        body1: string;
        bibleRef: string;
        bibleQuote: string;
        body2: string;
        body3: string;
        michalkaQuote: string;
      };
      year2019: {
        photoAlt: string;
        photoCaption: string;
        body1: string;
        body2: string;
      };
      year2020: {
        heading: string;
        photoAlt: string;
        photoCaption: string;
        body1: string;
        body2: string;
      };
      today: {
        heading: string;
        body1: string;
        body2: string;
      };
    };
    documentary: {
      label: string;
      watchAria: string;
      imageAlt: string;
      tag: string;
      title: string;
      subtitle: string;
    };
    videoPlayAria: string;
    cta: {
      seeMission: string;
      readStories: string;
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
  media: {
    hero: {
      label: string;
      titleLine1: string;
      titleLine2: string;
      subtitle: string;
    };
    documentarySection: {
      label: string;
      watchAria: string;
      watchCta: string;
    };
    interviewsSection: {
      label: string;
      title: string;
      intro: string;
    };
    presentationsSection: {
      label: string;
      title: string;
      intro: string;
    };
    testimoniesSection: {
      label: string;
      title: string;
      intro: string;
    };
    card: {
      watchAria: string;
      withGuest: string;
    };
    filters: {
      title: string;
      all: string;
      en: string;
      skCs: string;
      ro: string;
      de: string;
      sr: string;
      ru: string;
      mk: string;
      el: string;
      comingSoon: string;
      emptyTitle: string;
      emptyBody: string;
    };
    items: {
      documentary: {
        title: string;
        shortDesc: string;
        fullDesc: string;
        source: string;
        badgeLabel: string;
        audioBadge: string;
      };
      "int-1": {
        title: string;
        shortDesc: string;
        fullDesc: string;
        source: string;
        guest: string;
        badgeLabel: string;
      };
      "int-2": {
        title: string;
        shortDesc: string;
        fullDesc: string;
        source: string;
        guest: string;
        badgeLabel: string;
      };
      "testimony-laco": {
        title: string;
        shortDesc: string;
        fullDesc: string;
        source: string;
        guest: string;
        badgeLabel: string;
      };
      "pres-usa": {
        title: string;
        shortDesc: string;
        fullDesc: string;
        source: string;
        badgeLabel: string;
      };
    };
  };
  heritage: {
    hero: {
      label: string;
      titleLine1: string;
      titleLine2: string;
      subtitle: string;
      shareLabel: string;
      scrollHint: string;
    };
    toc: {
      label: string;
      origins: string;
      timeline: string;
      voices: string;
      faith: string;
      traditions: string;
      today: string;
      continue: string;
    };
    origins: {
      label: string;
      title: string;
      intro: string;
      body1: string;
      body2: string;
      factCards: {
        a: { stat: string; title: string; body: string };
        b: { stat: string; title: string; body: string };
        c: { stat: string; title: string; body: string };
      };
    };
    timeline: {
      label: string;
      title: string;
      intro: string;
      eras: {
        era1: { range: string; heading: string; body: string };
        era2: { range: string; heading: string; body: string };
        era3: { range: string; heading: string; body: string };
        era4: { range: string; heading: string; body: string };
        era5: { range: string; heading: string; body: string };
      };
    };
    faith: {
      label: string;
      title: string;
      intro: string;
      catechumenLabel: string;
      catechumenBody: string;
      columns: {
        byzantium: { title: string; body: string };
        balkans: { title: string; body: string };
        liturgy: { title: string; body: string };
      };
      pullQuote: string;
      pullQuoteAttribution: string;
    };
    voices: {
      label: string;
      title: string;
      intro: string;
      footnote: string;
      sourceLabel: string;
      readSourceLabel: string;
      expandAllLabel?: string;
      collapseAllLabel?: string;
      entries: {
        e1054: { date: string; source: string; quote: string; body: string; url: string };
        eBalsamon?: { date: string; source: string; quote: string; body: string; url: string };
        eCanon: { date: string; source: string; quote: string; body: string; url: string };
        e1322: { date: string; source: string; quote: string; body: string; url: string };
        e1385: { date: string; source: string; quote: string; body: string; url: string };
        e1416?: { date: string; source: string; quote: string; body: string; url: string };
        e1422?: { date: string; source: string; quote: string; body: string; url: string };
        eParis: { date: string; source: string; quote: string; body: string; url: string };
        eStoglav: { date: string; source: string; quote: string; body: string; url: string };
        eAthos?: { date: string; source: string; quote: string; body: string; url: string };
        e1764?: { date: string; source: string; quote: string; body: string; url: string };
        eAbolition: { date: string; source: string; quote: string; body: string; url: string };
      };
    };
    traditions: {
      label: string;
      title: string;
      intro: string;
      tapHint: string;
      closing: string;
      cards: {
        fourNails: { title: string; subtitle: string; body: string };
        thirdDay: { title: string; subtitle: string; body: string };
        byzantineChant: { title: string; subtitle: string; body: string };
        roundDance: { title: string; subtitle: string; body: string };
        iconsHome: { title: string; subtitle: string; body: string };
        greekBones: { title: string; subtitle: string; body: string };
      };
    };
    today: {
      label: string;
      title: string;
      intro: string;
      footnote: string;
      countries: {
        ro: string;
        bg: string;
        rs: string;
        mk: string;
        gr: string;
        ua: string;
        ru: string;
        sk: string;
      };
    };
    closing: {
      label: string;
      title: string;
      body: string;
      ctaMission: string;
      ctaSupport: string;
    };
    shareNudge: {
      text: string;
      shareLabel: string;
    };
  };
  resources: {
    hero: {
      label: string;
      titleLine1: string;
      titleLine2: string;
      subtitle: string;
    };
    usage: {
      label: string;
      title: string;
      body: string;
      point1Title: string;
      point1Body: string;
      point2Title: string;
      point2Body: string;
      point3Title: string;
      point3Body: string;
      contactPrefix: string;
      contactSuffix: string;
    };
    ui: {
      availableIn: string;
      download: string;
      comingSoon: string;
      printReady: string;
      freeToShare: string;
      translatedByOthers: string;
      viewSource: string;
      opensExternal: string;
      langRomani: string;
    };
    categories: {
      liturgy: { label: string; title: string; intro: string };
      scripture: { label: string; title: string; intro: string };
      book: { label: string; title: string; intro: string };
      teaching: { label: string; title: string; intro: string };
    };
    items: {
      "divine-liturgy": { title: string; desc: string };
      "gospel-mark-romani": { title: string; desc: string };
      "founder-book": { title: string; desc: string };
      "catechesis-worksheets": { title: string; desc: string };
      "childrens-bible": { title: string; desc: string };
    };
    closing: {
      scripture: string;
      scriptureRef: string;
      note: string;
    };
  };
  getInvolved: {
    hero: {
      label: string;
      titleLine1: string;
      titleLine2: string;
    };
    waysSection: {
      label: string;
      title: string;
      intro: string;
    };
    ways: {
      financial: {
        title: string;
        subtitle: string;
        desc: string;
        point1: string;
        point2: string;
        point3: string;
        cta: string;
      };
      volunteer: {
        title: string;
        subtitle: string;
        desc: string;
        point1: string;
        point2: string;
        point3: string;
        cta: string;
      };
      share: {
        title: string;
        subtitle: string;
        desc: string;
        point1: string;
        point2: string;
        point3: string;
        cta: string;
      };
      trip: {
        title: string;
        subtitle: string;
        desc: string;
        point1: string;
        point2: string;
        point3: string;
        cta: string;
      };
    };
    faq: {
      label: string;
      titleLine1: string;
      titleLine2: string;
      contactIntro: string;
      items: {
        donation: { q: string; a: string };
        volunteer: { q: string; a: string };
        parish: { q: string; a: string };
        contact: { q: string; a: string };
      };
    };
  };
  privacyPolicy: {
    eyebrow: string;
    title: string;
    lastUpdated: string;
    intro: {
      heading: string;
      body: string;
    };
    dataCollected: {
      heading: string;
      lead: string;
      item1: string;
      item2: string;
      item3: string;
      item4: string;
    };
    dataUse: {
      heading: string;
      lead: string;
      item1: string;
      item2: string;
      item3: string;
      item4: string;
      item5: string;
    };
    sharing: {
      heading: string;
      body: string;
    };
    retention: {
      heading: string;
      body: string;
    };
    rights: {
      heading: string;
      bodyBefore: string;
      bodyAfter: string;
    };
    cookies: {
      heading: string;
      body: string;
    };
    security: {
      heading: string;
      body: string;
    };
    changes: {
      heading: string;
      body: string;
    };
    contact: {
      heading: string;
      bodyBefore: string;
    };
  };
  termsOfUse: {
    eyebrow: string;
    title: string;
    lastUpdated: string;
    acceptance: {
      heading: string;
      body: string;
    };
    use: {
      heading: string;
      lead: string;
      item1: string;
      item2: string;
      item3: string;
      item4: string;
    };
    intellectualProperty: {
      heading: string;
      body: string;
    };
    donations: {
      heading: string;
      body: string;
    };
    thirdParty: {
      heading: string;
      body: string;
    };
    disclaimer: {
      heading: string;
      body: string;
    };
    liability: {
      heading: string;
      body: string;
    };
    governingLaw: {
      heading: string;
      body: string;
    };
    changes: {
      heading: string;
      body: string;
    };
    contact: {
      heading: string;
      bodyBefore: string;
      bodyAfter: string;
    };
  };
  thankYou: {
    eyebrow: string;
    headlineLine1: string;
    headlineLine2: string;
    intro: string;
    taxNoticeCountryPrefix: string;
    taxNoticeCountry: string;
    taxNoticeCountrySuffix: string;
    taxNoticeDeductPrefix: string;
    taxNoticeDeductBold: string;
    taxNoticeDeductSuffix: string;
    scripture: string;
    scriptureRef: string;
    oneMoreThing: string;
    helpSpread: string;
    helpSpreadDesc: string;
    shareText: string;
    shareTitle: string;
    shareCta: string;
    postX: string;
    whatsapp: string;
    facebook: string;
    backHome: string;
    learnMission: string;
  };
  cta: {
    title: string;
    subtitle: string;
    supportMission: string;
    joinMissionTrip: string;
    becomeVolunteer: string;
  };
  donation: {
    eyebrow: string;
    title: string;
    close: string;
    monthly: string;
    oneTime: string;
    customPlaceholder: string;
    impactHigh: string;
    impactMid: string;
    impactLow: string;
    impactBase: string;
    error: string;
    preparing: string;
    giveMonthly: string;
    giveOnce: string;
    giveInvalid: string;
    bankToggle: string;
    bankUs: string;
    bankIntl: string;
    or: string;
    copyField: string;
    paymentLabel: string;
    bankFields: {
      accountName: string;
      accountType: string;
      accountTypeValue: string;
      routingNumber: string;
      accountNumber: string;
      bank: string;
      swiftBic: string;
      bankAddress: string;
    };
    taxNoticePrefix: string;
    taxNoticeCountry: string;
    taxNoticeMid: string;
    taxNoticeBold: string;
    taxNoticeTail: string;
  };
  application: {
    eyebrow: string;
    close: string;
    titleVolunteer: string;
    titleTrip: string;
    subtitleVolunteer: string;
    subtitleTrip: string;
    descriptionVolunteer: string;
    descriptionTrip: string;
    whatHappensNext: string;
    step1: string;
    step2: string;
    step3: string;
    scheduleCall: string;
    takesLittleTime: string;
    bookingOpenedTitle: string;
    bookingOpenedBody: string;
    closeButton: string;
  };
  video: {
    close: string;
  };
  map: {
    legend: string;
    romaDensity: string;
    loading: string;
    unavailable: string;
    unavailableHint: string;
    close: string;
    hoverPopulation: string;
    markers: {
      missionCenter: string;
      parish: string;
      collaborating: string;
      planting: string;
      failed: string;
    };
    popup: {
      supportThisParish: string;
      preventThis: string;
    };
  };
  countries: {
    SK: string;
    CZ: string;
    RO: string;
    MD: string;
    RS: string;
    GR: string;
    HU: string;
    BG: string;
    MK: string;
    AL: string;
    ME: string;
    ES: string;
    TR: string;
    FR: string;
    UA: string;
    GB: string;
    DE: string;
    IT: string;
    SE: string;
    BA: string;
    XK: string;
    AT: string;
    PT: string;
    NL: string;
    BE: string;
    CH: string;
    BY: string;
    HR: string;
    PL: string;
    LV: string;
    LT: string;
    EE: string;
    SI: string;
  };
  metadata: {
    home: MetadataEntry;
    mission: MetadataEntry;
    ourStory: MetadataEntry;
    locations: MetadataEntry;
    stories: MetadataEntry;
    media: MetadataEntry;
    resources: MetadataEntry;
    heritage: MetadataEntry;
    activity: MetadataEntry;
    getInvolved: MetadataEntry;
    thankYou: MetadataEntry;
    privacy: MetadataEntry;
    terms: MetadataEntry;
  };
  activity: {
    nav: string;
    hero: {
      eyebrow: string;
      titleLine1: string;
      titleLine2: string;
      subtitle: string;
      ctaJoin: string;
      ctaFeed: string;
      subscriberBadge: string;
      channelHandle: string;
    };
    channel: {
      label: string;
      title: string;
      intro: string;
      liveDot: string;
      channelName: string;
      channelTagline: string;
      memberCount: string;
      openInTelegram: string;
      viewLabel: string;
      seeAllOnTelegram: string;
      viewPost: string;
      morePhotos: string;
      instagramTagline: string;
      photoFallbackTelegram: string;
      photoFallbackInstagram: string;
      posts: {
        post1: { date: string; place: string; body: string; views: string };
        post2: { date: string; place: string; body: string; views: string };
        post3: { date: string; place: string; body: string; views: string };
        post4: { date: string; place: string; body: string; views: string };
        post5: { date: string; place: string; body: string; views: string };
        post6: { date: string; place: string; body: string; views: string };
      };
    };
    why: {
      label: string;
      titleLine1: string;
      titleLine2: string;
      intro: string;
      pillarPrayTitle: string;
      pillarPrayBody: string;
      pillarWitnessTitle: string;
      pillarWitnessBody: string;
      pillarShareTitle: string;
      pillarShareBody: string;
    };
    stats: {
      label: string;
      title: string;
      stat1Value: string;
      stat1Label: string;
      stat1Sub: string;
      stat2Value: string;
      stat2Label: string;
      stat2Sub: string;
      stat3Value: string;
      stat3Label: string;
      stat3Sub: string;
      stat4Value: string;
      stat4Label: string;
      stat4Sub: string;
    };
    witnesses: {
      label: string;
      title: string;
      intro: string;
      items: {
        anna: { quote: string; author: string; context: string };
        thomas: { quote: string; author: string; context: string };
        eleni: { quote: string; author: string; context: string };
      };
    };
    cta: {
      label: string;
      titleLine1: string;
      titleLine2: string;
      body: string;
      primary: string;
      shareLabel: string;
      shareWhatsapp: string;
      shareTelegram: string;
      scripture: string;
      scriptureRef: string;
    };
  };
}

export interface MetadataEntry {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
}

export type DictionaryKeyPath = NestedKeyOf<Dictionary>;

type NestedKeyOf<T> = {
  [K in keyof T & (string | number)]: T[K] extends object
    ? `${K}.${NestedKeyOf<T[K]>}`
    : `${K}`;
}[keyof T & (string | number)];
