export interface GuideContentImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}

export interface GuideContentSection {
  id: string;
  title: string;
  description?: string;
  paragraphs: string[];
  images?: GuideContentImage[];
}

export const GUIDE_CONTENT: GuideContentSection[] = [
  {
    id: "overview",
    title: "Overview",
    description: "Quick orientation for using Afrobeutic.",
    paragraphs: ["Content for this section will be added soon."],
    images: [
      {
        src: "/images/common/loader/loader.gif",
        alt: "Afrobeutic loading indicator",
        width: 640,
        height: 360,
        caption: "Example image entry. Replace with your guide screenshot.",
      },
    ],
  },
  {
    id: "accounts",
    title: "Accounts & Switching",
    description: "How to switch between accounts within one session.",
    paragraphs: ["Content for this section will be added soon."],
  },
  {
    id: "bookings",
    title: "Bookings",
    description: "Creating, viewing, and managing bookings.",
    paragraphs: ["Content for this section will be added soon."],
  },
  {
    id: "profile",
    title: "Profile",
    description: "Updating your personal details and preferences.",
    paragraphs: ["Content for this section will be added soon."],
  },
  {
    id: "support",
    title: "Support",
    description: "Where to go when something isn’t working.",
    paragraphs: ["Content for this section will be added soon."],
  },
];
