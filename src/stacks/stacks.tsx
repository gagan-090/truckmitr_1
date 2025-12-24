
export type NavigatorParams = {
    welcome: undefined;
    introVideo: undefined
    login: undefined;
    otp: undefined
    approval: undefined
    language: undefined
    languageMain: undefined
    preferredColor: undefined
    paymentSuccess: any
    signup: undefined
    phone: undefined;
    countries: undefined;
    name: undefined
    gender: any;
    birthday: any
    dashboard: undefined
    training: undefined
    job: undefined
    healthHygiene: undefined
    profile: undefined
    modules: undefined
    quiz: any
    quizResult: undefined
    player: any
    availableJob: any
    suitsJob: undefined
    appliedJob: undefined
    search: undefined
    profileEdit: undefined
    drivingDetails: any
    uploadDocuments: any
    settings: undefined
    notification: undefined
    rating: undefined
    contactUs: undefined
    privacy: undefined
    terms: undefined
    transporterConsent: undefined,
    driverConsent: undefined,
    verification: undefined
    paymentScreen: undefined
    doucmentUploadScreen: undefined
    verificationStatusScreen: undefined
    subscriptionConsent: undefined

    addJob: undefined
    jobStep2: undefined
    jobStep3: undefined
    viewJobs: undefined
    addDriver: undefined
    excelImport: undefined
    transporterAppliedJob: undefined
    driverList: undefined

    profileEditTransporter: undefined
    drivingDetailsTransporter: any
    uploadDocumentsTransporter: any

    driverProfileEditByTransporter: any
    driverDrivingDetailsByTransporter: any
    driverUploadDocumentsByTransporter: any

    addLoad: any
    locationSearch: any
    mapView: any

    stream: undefined
    chat: undefined
    join: any;
    shorts: undefined
    account: undefined
    discover: undefined
    friends: undefined
    nearby: undefined
    bottomTab: any
    main: undefined
    all: any
    moment: any
    play: any
    Exclusive: any

    // MODALS
    genderModal: any
    loadingModal: any
    VerificationDriversByTransporter: undefined
    invites: undefined
    "All Drivers": undefined
    Verification: undefined
    referral: undefined
};

export const STACKS = {
    NAMASTE: 'namaste',
    INTRO_VIDEO: `introVideo`,
    WELCOME: 'welcome',
    LOGIN: 'login',
    OTP: 'otp',
    APPROVAL: 'approval',
    LANGUAGE: 'language',
    LANGUAGE_MAIN: 'languageMain',
    PREFERRED_COLOR: 'preferredColor',
    PAYMENT_SUCCESS: 'paymentSuccess',
    SIGNUP: 'signup',
    PHONE: 'phone',
    COUNTRIES: 'countries',
    NAME: 'name',
    GENDER: 'gender',
    BIRTHDAY: 'birthday',
    HOME: 'home',
    DASHBOARD: 'dashboard',
    TRAINING: 'training',
    JOB: 'job',
    HEALTH_HYGIENE: 'healthHygiene',
    PROFILE: 'profile',
    MODULES: 'modules',
    QUIZ: 'quiz',
    QUIZ_RESULT: 'quizResult',
    PLAYER: 'player',
    AVAILABLE_JOB: 'availableJob',
    SUITS_JOB: 'suitsJob',
    APPLIED_JOB: 'appliedJob',
    SEARCH: 'search',
    PROFILE_EDIT: 'profileEdit',
    DRIVING_DETAILS: 'drivingDetails',
    UPLOAD_DOCUMENTS: 'uploadDocuments',
    SETTINGS: 'settings',
    NOTIFICATION: 'notification',
    RATING: 'rating',
    CONTACT_US: 'contactUs',
    PRIVACY: 'privacy',
    TERMS: 'terms',
    TRANSPORTER_CONSENT: 'transporterConsent',
    DRIVER_CONSENT: 'driverConsent',
    SUBSCRIPTION_CONSENT: 'subscriptionConsent',
    VERIFICATION: 'verification',
    DOCUMENTUPLOAD: 'doucmentUploadScreen',
    VERIFICATIONSTATUS: 'verificationStatusScreen',
    DRIVERINVITES: 'invites',

    ADD_JOB: 'addJob',
    JOB_STEP2: 'jobStep2',
    JOB_STEP3: 'jobStep3',
    VIEW_JOBS: 'viewJobs',
    TRANSPORTER_APPLIED_JOB: 'transporterAppliedJob',
    ADD_DRIVER: 'addDriver',
    EXCEL_IMPORT: 'excelImport',
    DRIVER_LIST: 'driverList',
    VERIFICATIONDRIVER: 'Verification Driver',
    ALLDRIVERLIST: 'All Drivers List',
    ALLDRIVER_LIST_WITH_TABS: 'All Drivers',

    PROFILE_EDIT_TRANSPORTER: 'profileEditTransporter',
    DRIVING_DETAILS_TRANSPORTER: 'drivingDetailsTransporter',
    UPLOAD_DOCUMENTS_TRANSPORTER: 'uploadDocumentsTransporter',

    DRIVER_PROFILE_EDIT_BY_TRANSPORTER: 'driverProfileEditByTransporter',
    DRIVER_DRIVING_DETAILS_BY_TRANSPORTER: 'driverDrivingDetailsByTransporter',
    DRIVER_UPLOAD_DOCUMENTS_BY_TRANSPORTER: 'driverUploadDocumentsByTransporter',
    VERIFIED_DRIVERS_DOCUMENTS_UPLOAD: 'verifyDriversDocumentUploadByTransporter',
    PAYMENT_HISTORY_SCREEN: 'paymentHistoryScreen',

    TRANSPORTER_VERIFICATION: 'Verification',
    TRANSPORTER_VERIFICATION_STATUS: 'transporterVerificationStatus',
    VERIFICATIONDRIVERSBYTRANSPORTER: 'VerificationDriversByTransporter',

    REFERRAL: 'referral',

    ADD_LOAD: `addLoad`,
    LOCATION_SEARCH: `locationSearch`,
    MAP_VIEW: `mapView`,

    LIVE: 'live',
    STREAM: 'stream',
    CHAT: 'chat',

    JOIN: 'join',
    SHORTS: 'shorts',
    ACCOUNT: 'account',
    DISCOVER: 'discover',
    FRIENDS: 'friends',
    NEARBY: 'nearby',
    BOTTOM_TAB: 'bottomTab',
    MAIN: 'main',
    ALL: 'all',
    MOMENT: 'moment',
    PLAY: 'play',
    EXCLUSIVE: 'Exclusive',

    // MODALS
    GENDER_MODAL: 'genderModal',
    LOADING_MODAL: 'loadingModal',
} as const;