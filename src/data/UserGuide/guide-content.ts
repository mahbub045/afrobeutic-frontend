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
    paragraphs: [
      "Afrobeutic has two main experiences: a dashboard for business users (owners/admin/staff and management staff), and a customer portal for customers to view their bookings and profile.",
      "Business users sign in with email + password on the Log in page. After sign-in, you’re redirected based on your role: Management roles go to the Admin Panel, and salon roles go to the Client Panel.",
      "Customers sign in with phone + OTP on the Customer login page. Once verified, you’ll be taken to the customer portal where you can review bookings and update your profile.",
      "Tip: Most pages support light/dark mode. On the auth screens you’ll find a theme toggle in the top-right corner.",
    ],
    images: [
      {
        src: "/images/logo-light.png",
        alt: "Afrobeutic logo",
        width: 640,
        height: 240,
        caption: "Afrobeutic web app.",
      },
    ],
  },
  {
    id: "accounts",
    title: "Accounts & Switching",
    description: "How to switch between accounts within one session.",
    paragraphs: [
      "If you have access to multiple accounts, you can switch the account context without signing out. This is useful when you manage multiple salons or work with multiple businesses.",
      "Open the Client Panel, then navigate to Home → Switch Account. You’ll see a grid of account cards showing the owner name, email, role, and Account ID.",
      "To switch, click an account card. You’ll see a success message and you’ll be redirected back to the Client Panel home. The selected account is stored in your browser so it survives page reloads.",
      "When you are viewing a different account, a banner appears at the top of the Client Panel that says you are viewing a different account and shows the active Account ID. While the banner is visible, all data and actions use that account context.",
      "To return to your main account, click Back to My Account in the banner. Logging in also clears any previously selected account so you always start from your main account.",
      "Troubleshooting: If numbers or lists look “wrong”, first check whether the banner is showing a different account context.",
    ],
  },
  {
    id: "bookings",
    title: "Bookings",
    description: "Creating, viewing, and managing bookings.",
    paragraphs: [
      "Customer portal: After Customer login, you land on your bookings list. Each row shows Booking ID, salon, date/time, status, totals, and actions.",
      "To view details, click the Booking ID link or select View. The Booking Details page shows the booking overview, date/time, services and products included, a pricing summary, and any notes/cancellation reason when available.",
      "Downloading receipts: If a booking is marked COMPLETED, a Receipt button is available in the Actions column. Selecting it downloads your receipt file.",
      "Admin Panel (management users): You can review salon bookings from the Admin Panel by navigating to the salon’s Bookings table. Use the search input to filter bookings, then select View on a row to open booking details.",
    ],
  },
  {
    id: "profile",
    title: "Profile",
    description: "Updating your personal details and preferences.",
    paragraphs: [
      "Customer portal: Go to Profile to view your phone number, email (if set), and user ID. Select Edit profile to update your first name, last name, and email, then Save changes.",
      "Dashboard (business users): Open your dashboard Profile page to view your account details. Select Edit Profile to update your first name, last name, and country, and optionally upload an avatar. Saving updates your profile and refreshes your session information.",
      "If you don’t see an edit option, your role may not allow changes in that environment. In that case, contact your administrator.",
    ],
  },
  {
    id: "support",
    title: "Support",
    description: "Where to go when something isn’t working.",
    paragraphs: [
      "Session expired: If you see a “Session Expired” screen, your session ended (or you were logged out from another tab). Select Sign In Again to return to the login page.",
      "Access denied: If you try to open a dashboard panel you don’t have permission for, you’ll be redirected to Log in with an access denied message. Sign in with an account that has the correct role.",
      "Customer login issues: OTP must be 6 digits. Make sure your phone number is entered in E.164 format (starts with +). If you can’t receive the code, try again after a minute or confirm your number is correct.",
      "Wrong account context: If you’re seeing the wrong business data after switching accounts, click Back to My Account in the banner. As a last resort, you can clear the saved selection by removing the “activeAccountId” item from your browser storage and refreshing.",
      "PWA install: On supported browsers you may see an “Install App” prompt in the bottom-right. Installing adds Afrobeutic to your home screen/desktop and can improve return visits.",
    ],
  },
];
