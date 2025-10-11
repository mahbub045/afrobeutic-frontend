export interface SignUpFormValues {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  password: string;
  confirmPassword: string;
}

export interface FormikHelpers {
  setSubmitting: (isSubmitting: boolean) => void;
  resetForm: () => void;
}
