import type { Dictionary } from "../types";

const en: Dictionary = {
  nav: {
    mission: "MISSION",
    locations: "LOCATIONS",
    media: "MEDIA",
    stories: "STORIES",
    share: "SHARE",
    contact: "CONTACT",
    supportMission: "SUPPORT THE MISSION",
    toggleMenu: "Toggle menu",
    selectLanguage: "Select language",
  },
  footer: {
    brand: "Christian Roma Mission",
    tagline: "Planting parishes. Forming disciples.\nTransforming communities.",
    colMission: "Mission",
    colMedia: "Media",
    colInvolved: "Get Involved",
    colInvolvedShort: "Involved",
    colContact: "Contact",
    linkOurMission: "Our Mission",
    linkOurStory: "Our Story",
    linkStories: "Stories",
    linkMedia: "Media",
    linkDocumentary: "Documentary",
    linkNews: "News",
    linkSupport: "Support",
    linkVolunteer: "Volunteer",
    linkMissionTrips: "Mission Trips",
    linkTrips: "Trips",
    director: "Director",
    copyright: "© 2026 Christian Roma Mission. All rights reserved.",
    copyrightShort: "© 2026 Christian Roma Mission.",
    privacyPolicy: "Privacy Policy",
    termsOfUse: "Terms of Use",
    light: "Light",
    dark: "Dark",
    switchToLight: "Switch to light mode",
    switchToDark: "Switch to dark mode",
  },
  share: {
    title: "Share the Mission",
    subtitle: "Help others discover what God is doing among the Roma.",
    copyLink: "Copy link",
    copyLinkLabel: "Copy Link",
    copyAction: "COPY",
    copied: "COPIED",
    shareVia: "Share via",
    shareOn: "Share on {network}",
    close: "Close",
  },
  home: {
    hero: {
      label: "Orthodox Roma Mission Europe",
      titleLine1: "When Christ Is Present,",
      titleLine2: "Everything Changes.",
      subtitle:
        "Serving Roma communities in Slovakia for 10 years through education, activities, parish life, discipleship, and church planting.",
      ctaSupport: "SUPPORT THE MISSION",
      ctaVolunteer: "VOLUNTEER",
      ctaLearnMore: "LEARN MORE",
    },
    urgency: {
      label: "The Urgency",
      titleLine1: "The Future Is Being",
      titleLine2: "Formed Now",
      body:
        "Roma communities are the youngest and fastest-growing population in Europe — nearly 5 million people. Slovakia has the highest concentration in the world.",
      statement1:
        "In many areas, parish life is weak or absent. Children are graduating unable to read or write.",
      statement2: "A generation is growing up without guidance.",
      absentLead: "If Christ is absent,",
      absentEmph: "instability grows.",
      presentLead: "If Christ is present,",
      presentEmph: "families stabilize.",
    },
    results: {
      label: "The Results",
      titleLine1: "What Happens When",
      titleLine2: "a Parish Is Planted",
      cardFathers: "Fathers begin working and providing for their families.",
      cardChildren: "Children learn to read and write through church programs.",
      cardDignity: "Public behavior changes — dignity returns.",
      cardAddiction: "Addiction decreases.",
      cardFamilies: "Families reconcile.",
    },
    approach: {
      label: "Our Approach",
      title: "Our Approach",
      subtitle: "Five pillars that ground every mission parish we plant.",
      pillar1Title: "YOUTH AND CHILDREN\nFORMATION",
      pillar1Desc:
        "Teaching young people through catechism, literacy, and structured programs rooted in the Church.",
      pillar2Title: "REMOVE SINS\nNOT CULTURE",
      pillar2Desc:
        "We learn their language, way of speaking, cooking and culture. They learn our faith.",
      pillar3Title: "PRAYERS AND \nCHURCH INTEGRATION",
      pillar3Desc:
        "We live a Eucharistic life, invite to church, and connect with other believers.",
      pillar4Title: "DISCIPLESHIP OF\nMEN AND FATHERS",
      pillar4Desc:
        "Forming male leadership within the community through accountability and mentorship.",
      pillar5Title: "CHURCH PLANTING WITH\nLONG-TERM PRESENCE",
      pillar5Desc:
        "Establishing permanent parishes, not short-term projects. We stay until the community owns its parish.",
    },
    testimony: {
      label: "Testimony",
      quote:
        "That's why we were angry with him for not doing anything and he left us.",
      attribution: "— Laco, Slovakia",
      watchLabel: "WATCH HIS STORY",
      watchAria: "Watch Laco's story",
    },
    missionField: {
      label: "Mission Field",
      titleLine1: "Where We Serve.",
      titleLine2: "What’s At Stake.",
      descriptionBefore:
        "Slovakia has the highest Roma concentration per capita in Central Europe. We operate ",
      descriptionHighlight: "12 active locations",
      descriptionAfter:
        " — 8 parishes supported, 3 planted, 1 mission center, and another being built.",
      statParishes: "Parishes supported",
      statChurches: "Churches planted",
      statSince: "Active in Slovakia",
      cta: "VIEW ALL LOCATIONS →",
    },
    featuredMedia: {
      label: "Media Library",
      titleLine1: "Documented. Recorded.",
      titleLine2: "Transparent.",
      watchAria: "Watch: {title}",
      cta: "EXPLORE MEDIA LIBRARY",
    },
  },
  locations: {
    hero: {
      label: "Our Field of Work",
      titleLine1: "Every village on this map",
      titleLine2: "is a name we pray.",
      subtitle:
        "Two mission centers. Planted churches. Active church plants. Parishes across eastern and southern Slovakia where Roma families have heard the Gospel — many for the first time in their family line.",
    },
    stats: {
      missionCenters: "Mission Centers",
      plantedChurches: "Planted Churches",
      activePlants: "Active Church Plants",
      parishesSupported: "Parishes Supported",
      primaryField: "Primary Field",
      primaryFieldValue: "Slovakia",
    },
    map: {
      label: "Mission Field",
      sectionTitle: "Slovakia — Where We Work",
      sectionSubtitle:
        "Southern and eastern Slovakia holds the highest concentration of Roma settlements in the country. We go where established churches do not.",
      loading: "LOADING MAP…",
      unavailable: "MAP UNAVAILABLE",
      addToken: "Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local",
      legendTitle: "Legend",
      legendDensity: "Roma density",
      legendMissionCenter: "Mission Center",
      legendParish: "Active Parish",
      legendCollaborating: "Collaborating Parish",
      legendPlanting: "Planting Parish",
      legendFailed: "Discontinued",
      closeAria: "Close",
      supportCta: "SUPPORT THIS PARISH →",
      preventCta: "PREVENT THIS → GIVE NOW",
    },
    centersSection: {
      label: "Mission Centers",
      title: "Two operational bases",
      subtitle:
        "A mission center is a permanent, full-time presence — not just a program we run, but a place where our people live, work, and worship among the Roma community.",
    },
    plantedSection: {
      label: "Planted Churches",
      title: "Communities we planted",
      subtitle:
        "A planted church is a congregation that did not exist before we arrived. We enter, we disciple, we raise leadership, we step back. Some become mission centers. Some run for years and conclude. Both outcomes matter.",
    },
    activeSection: {
      label: "Currently Planting",
      title: "Where we are right now",
      subtitle:
        "These are not programs. These are our missionaries showing up week after week in villages where Roma families have no church, no pastor, and often no one who comes just for them. Your support keeps them going.",
    },
    endedSection: {
      label: "Honest Accounting",
      locationCountry: "Slovakia",
      carryForward: "What we carry forward:",
    },
    supportedSection: {
      label: "Parishes We Have Supported",
      title: "Serving alongside local priests",
      subtitle:
        "Not every Roma community needs a new church. Sometimes a local parish already exists but lacks the people and tools to reach the Roma settlement next door. We go in, do the ministry, and support the priest who is already there. Below are the parishes where we have served — some briefly, some for years.",
      more: "and more — the list grows as new doors open.",
    },
    cards: {
      capacity: "Capacity",
      weeklyAvg: "Weekly Avg",
      established: "Est.",
      programsRunning: "Programs Running",
      yearsActive: "years active",
      ongoing: "ongoing",
      started: "Started",
      inField: "In field",
      badgeActive: "Active",
    },
    statuses: {
      missionCenter: "MISSION CENTER",
      developingCenter: "DEVELOPING CENTER",
      firstChapel: "FIRST CHAPEL",
      concluded2026: "CONCLUDED 2026",
      planting: "PLANTING",
      concluded: "CONCLUDED",
      supported: "SUPPORTED",
    },
    centers: {
      klenovec: {
        subtitle: "Parish Planted · Mission Center Built",
        region: "Banská Bystrica Region, SK",
        description:
          "Klenovec is where the mission took root. A Roma family opened their home for prayer, a parish was planted, and over the years a full mission center was built on that foundation. Today it serves as our primary operational base — chapel, community space, and the daily work of being present among the people.",
        badge: "PLANTED PARISH · MISSION CENTER",
        programs: [
          "Sunday Liturgy",
          "Children's Bible club",
          "Leadership training",
          "Home visits",
          "Baptism prep",
        ],
      },
      markovce: {
        subtitle: "Parish in Transition → Mission Center",
        region: "Prešov Region, SK",
        description:
          "Markovce began as a supported parish — one of many places where our team showed up, ran programs, and helped a local congregation reach its Roma neighbors. The roots have gone deep enough that we are now building this location into a full mission center. The transition is underway.",
        badge: "DEVELOPING CENTER",
        programs: [
          "Roma outreach",
          "Sunday ministry support",
          "Community formation",
        ],
      },
    },
    planted: {
      klenovec: {
        name: "Klenovec Roma Sub-parish",
        note: "Planted as a parish, a physical mission center was later built on the same foundation. Now our primary base.",
      },
      kacanov: {
        name: "Kačanov Roma Community",
        note: "The community is strong and gathering regularly. We are now building a church — the people came first, the building follows.",
      },
      mutnik: {
        name: "Mútnik Roma Community",
        note: "Nine years of faithful presence. A community formed, believers were baptized, and local leaders emerged. This chapter concluded in 2026.",
      },
    },
    active: {
      rimavskaPila: {
        description:
          "Two years in. Regular gatherings established, a core group forming. The most mature of our current planting efforts.",
      },
      zemjastrabie: {
        description:
          "A settlement we've prayed over for years. We finally have a door open. Early outreach underway.",
      },
    },
    ended: {
      name: "Hačava",
      years: "2017 — not continued",
      village: "Hačava",
      description:
        "We entered Hačava with a genuine open door and early fruit. But we could not sustain a consistent missionary presence — our team in Klenovec simply did not have enough volunteers to keep covering this village on top of everything else. Without someone going week after week, the community could not hold together. We had to stop.",
      learned:
        "If you are considering joining our volunteer team in Klenovec, Hačava is why it matters. Every person we add to our base expands how far we can reach. A village like this is waiting for someone with enough time to go.",
    },
    items: {
      klenovec: {
        subtitle: "St. Nicholas Mission Center",
        description:
          "Our primary mission base in central Slovakia — the operational hub for training, community formation, and regional coordination.",
        region: "Banská Bystrica Region, SK",
      },
      markovce: {
        subtitle: "Roma Parish & Developing Mission Center",
        description:
          "An active Orthodox Roma parish with regular Liturgy, youth programs, and growing local lay leadership. Transitioning into a full mission center.",
        region: "Prešov Region, SK",
      },
      kacanov: {
        subtitle: "Planting Parish",
        description:
          "A new church being established near Markovce. Services have begun. A permanent home and ongoing support are needed.",
      },
      mutnik: {
        subtitle: "Concluded — 2026",
        description:
          "Nine years of faithful presence. A community formed, believers were baptized, and local leaders emerged. This chapter concluded in 2026.",
      },
      rimavskaPila: {
        subtitle: "Active Church Plant",
        description:
          "A new parish taking root near Klenovec. Services have begun. A permanent home and ongoing support are needed.",
      },
      zemjastrabie: {
        subtitle: "Active Church Plant",
        description:
          "A settlement prayed over for years. We finally have a door open. Early outreach underway.",
      },
      hnusta: {
        subtitle: "Not continued — 2017",
        description:
          "An early outreach effort in the Hnúšťa area that could not be sustained without consistent missionary presence on the ground.",
      },
      hacava: {
        subtitle: "Not continued — 2017",
        description:
          "A genuine open door with early fruit, but we could not sustain consistent missionary presence. Without someone going week after week, the community could not hold together.",
      },
      varadka: {
        subtitle: "Collaborating Parish",
        description:
          "A partner parish in the Bardejov district supporting the mission network through shared resources and pastoral cooperation.",
      },
    },
  },
};

export default en;
