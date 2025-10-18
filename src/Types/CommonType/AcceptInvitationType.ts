export interface AcceptInvitationPayloadProps {
  token: string;
  first_name: string;
  last_name: string;
  email: string;
  country?: string;
  password: string;
  confirm_password: string;
}