export interface SignUpFormValues {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  account_timezone?: string;
  account_type?: string;
  password: string;
  confirmPassword: string;
}

export interface FormikHelpers {
  setSubmitting: (isSubmitting: boolean) => void;
  resetForm: () => void;
}
