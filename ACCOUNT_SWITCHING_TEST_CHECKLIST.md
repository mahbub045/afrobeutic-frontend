# Account Switching - Testing Checklist

## Pre-requisites

- User must be logged in
- User must have access to multiple accounts

## Test Cases

### 1. Basic Account Switching

- [ ] Navigate to the switch account page
- [ ] Verify all accessible accounts are displayed
- [ ] Click on any account card
- [ ] Verify toast notification appears with success message
- [ ] Verify redirect to dashboard home (`/dashboard/client-panel`)
- [ ] Verify ActiveAccountBanner appears at the top
- [ ] Verify banner shows correct account ID
- [ ] Verify dashboard data reflects the selected account

### 2. Visual Indicators

- [ ] Active account card has primary border (2px)
- [ ] Active account card shows "Active" badge in top-left
- [ ] Active account card role badge uses "default" variant
- [ ] Inactive account cards have gray border
- [ ] Hover effects work on all cards

### 3. State Persistence

- [ ] Switch to a different account
- [ ] Refresh the page (F5 or Ctrl+R)
- [ ] Verify you're still viewing the selected account
- [ ] Verify ActiveAccountBanner still shows
- [ ] Verify dashboard data remains for the selected account
- [ ] Close the browser and reopen
- [ ] Navigate back to the app
- [ ] Verify the account selection is still active

### 4. API Calls

- [ ] Open browser DevTools Network tab
- [ ] Switch to a different account
- [ ] Verify all subsequent API requests include `X-ACCOUNT-ID` header
- [ ] Verify the header value matches the selected account ID
- [ ] Perform an action (e.g., view members, manage salons)
- [ ] Verify the API request uses the correct account ID

### 5. Return to Main Account

- [ ] While viewing a different account, click "Back to My Account" button
- [ ] Verify toast notification appears
- [ ] Verify redirect to dashboard
- [ ] Verify ActiveAccountBanner disappears
- [ ] Verify dashboard shows main account data
- [ ] Verify API requests use the original account ID

### 6. Multiple Switches

- [ ] Switch to Account A
- [ ] Verify data for Account A
- [ ] Switch to Account B (without returning to main first)
- [ ] Verify data for Account B
- [ ] Switch to Account C
- [ ] Verify data for Account C
- [ ] Return to main account
- [ ] Verify main account data

### 7. Pagination & Search

- [ ] If there are many accounts, test pagination
- [ ] Verify active account indicator persists across pages
- [ ] Test search functionality
- [ ] Verify you can switch to accounts found via search

### 8. Edge Cases

- [ ] Try switching to the same account twice
- [ ] Verify no errors occur
- [ ] Log out while viewing a different account
- [ ] Log back in
- [ ] Verify it returns to main account after login
- [ ] Clear localStorage manually (DevTools > Application > Local Storage)
- [ ] Refresh page
- [ ] Verify it defaults to main account

## Browser Compatibility

Test in the following browsers:

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## Mobile Testing

- [ ] Test on mobile viewport
- [ ] Verify banner is responsive
- [ ] Verify card layout works on mobile
- [ ] Verify click/tap works correctly

## Performance

- [ ] Verify no memory leaks
- [ ] Check Redux DevTools for proper state updates
- [ ] Verify localStorage is being used efficiently
- [ ] Check that page transitions are smooth

## Error Scenarios

- [ ] What happens if localStorage is disabled?
- [ ] What happens if an invalid account ID is in localStorage?
- [ ] What happens if the user loses access to an account they were viewing?

## Notes

- Document any issues found
- Note browser/device used for testing
- Record any unexpected behavior
