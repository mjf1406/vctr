const en = {
  common: {
    chooseLanguage: "Choose language",
  },
  home: {
    title: "UI playground",
    description: "Quick checks for badges, copy button, toast, icon picker, credenza, and theme.",
    language: "Language",
    badges: "Badges",
    roleBadges: "Role badges",
  },
  classes: {
    roleOwner: "Owner",
    roleTeacher: "Teacher",
    roleAssistantTeacher: "Assistant teacher",
    roleStudent: "Student",
    roleGuardian: "Guardian",
  },
} as const;

export default en;
export type TranslationCatalog = typeof en;
