export type Language = 'en' | 'hi';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Nav & Tabs
    today: 'Today',
    habits: 'Habits',
    calendar: 'Calendar',
    analytics: 'Analytics',
    profile: 'Profile',
    streak: 'Streak',
    
    // Today View
    dailyProgress: 'Daily Progress',
    habitsCompleted: 'habits completed',
    todayHabits: "Today's Habits",
    searchPlaceholder: 'Search habits by title or category...',
    allCategories: 'All Categories',
    allStatus: 'All Status',
    incomplete: 'Incomplete',
    completed: 'Completed',
    noHabitsFound: 'No matching habits found',
    noHabitsCreated: 'No habits created yet',
    createFirstHabit: 'Create your first daily routine',
    markDone: 'Mark Done',
    testReminder: 'Test Push Reminder',
    addHabit: 'Add Habit',
    quickWidget: 'Android Widget',

    // Analytics
    progressAnalytics: 'Progress & Analytics',
    analyticsSubtitle: 'Comprehensive statistics, streak analysis and habit performance',
    timeframe: 'Timeframe',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    totalFinished: 'Total Finished',
    bestStreak: 'Best Streak',
    consistency: 'Consistency',
    activeRoutines: 'Active Routines',
    completionRate: 'Completion Rate',
    exportReport: 'Export Analytics Report',
    exportCsv: 'Export CSV',
    exportPdf: 'Print / Save PDF',

    // Calendar
    historyLog: 'History Log',
    heatmapLess: 'Less',
    heatmapFull: '100% Complete',
    score: 'Score',

    // Profile & Settings
    profileTitle: 'User Profile & Settings',
    appPreferences: 'Notification & Alert Center',
    languageSetting: 'App Language',
    exportBackup: 'Backup Data (JSON)',
    restoreBackup: 'Restore Data (JSON)',
    exportCsvData: 'Export History (CSV)',
    exportPdfData: 'Export Report (PDF)',
    androidFrame: 'Android Phone Frame',
    adMobTest: 'Google AdMob Banner',
    signOut: 'Sign Out Account',

    // Widget Simulator
    widgetTitle: 'My Habit Daily Home Widget',
    widgetSubtitle: 'Android 4x2 Interactive Quick Access',
    quickComplete: 'Quick Check-in',
    widgetPinned: 'Pinned to Android Launcher'
  },
  hi: {
    // Nav & Tabs
    today: 'आज',
    habits: 'आदतें',
    calendar: 'कैलेंडर',
    analytics: 'विश्लेषण',
    profile: 'प्रोफाइल',
    streak: 'निरंतरता',

    // Today View
    dailyProgress: 'दैनिक प्रगति',
    habitsCompleted: 'आदतें पूरी हुईं',
    todayHabits: 'आज की आदतें',
    searchPlaceholder: 'आदतों को नाम या श्रेणी से खोजें...',
    allCategories: 'सभी श्रेणियां',
    allStatus: 'सभी स्थिति',
    incomplete: 'अधूरी आदतें',
    completed: 'पूरी आदतें',
    noHabitsFound: 'कोई मेल खाती आदत नहीं मिली',
    noHabitsCreated: 'अभी तक कोई आदत नहीं बनाई गई',
    createFirstHabit: 'अपनी पहली दैनिक आदत बनाएं',
    markDone: 'पूरा करें',
    testReminder: 'रिमाइंडर टेस्ट करें',
    addHabit: 'आदत जोड़ें',
    quickWidget: 'एंड्रॉइड विजेट',

    // Analytics
    progressAnalytics: 'प्रगति एवं विश्लेषण',
    analyticsSubtitle: 'समग्र आंकड़े, स्ट्राइक विश्लेषण और प्रदर्शन',
    timeframe: 'समयावधि',
    daily: 'दैनिक',
    weekly: 'साप्ताहिक',
    monthly: 'मासिक',
    totalFinished: 'कुल पूर्ण आदतें',
    bestStreak: 'सर्वश्रेष्ठ स्ट्राइक',
    consistency: 'निरंतरता दर',
    activeRoutines: 'सक्रिय आदतें',
    completionRate: 'पूर्णता दर',
    exportReport: 'रिपोर्ट निर्यात करें',
    exportCsv: 'CSV डाउनलोड करें',
    exportPdf: 'PDF प्रिंट / सेव करें',

    // Calendar
    historyLog: 'इतिहास लॉग',
    heatmapLess: 'कम',
    heatmapFull: '100% पूर्ण',
    score: 'स्कोर',

    // Profile & Settings
    profileTitle: 'प्रोफ़ाइल और सेटिंग्स',
    appPreferences: 'सूचनाएं और अलर्ट सेंटर',
    languageSetting: 'ऐप भाषा',
    exportBackup: 'बैकअप डेटा (JSON)',
    restoreBackup: 'डेटा रिस्टोर (JSON)',
    exportCsvData: 'इतिहास निर्यात (CSV)',
    exportPdfData: 'रिपोर्ट डाउनलोड (PDF)',
    androidFrame: 'एंड्रॉइड फोन फ्रेम',
    adMobTest: 'गूगल विज्ञापन मोड',
    signOut: 'साइन आउट करें',

    // Widget Simulator
    widgetTitle: 'माय हैबिट डेली होम विजेट',
    widgetSubtitle: 'एंड्रॉइड 4x2 त्वरित पहुँच विजेट',
    quickComplete: 'त्वरित चेक-इन',
    widgetPinned: 'होम स्क्रीन पर पिन किया गया'
  }
};

export function getTranslation(key: string, lang: string | Language = 'en'): string {
  const languageKey: Language = lang === 'hi' ? 'hi' : 'en';
  const dict = TRANSLATIONS[languageKey] || TRANSLATIONS['en'];
  return dict[key] || TRANSLATIONS['en'][key] || key;
}
