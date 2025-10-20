import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { countries } from "@/data/countries";
import {
  ErrorMessage,
  Field,
  FieldArray,
  FieldProps,
  Formik,
  Form as FormikForm,
  FormikProps,
} from "formik";
import * as Yup from "yup";

interface AddSalonDialogProps {
  isOpen: boolean;
  onClose: () => void;
}
interface AddSalonProps {
  name: string;
  logo: null | string;
  salon_type: string;
  email: string;
  phone: number;
  website: string;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  latitude: number;
  longitude: number;
  opening_hours: OpeningHour[];
}

type OpeningHour = {
  day: string;
  opening_start_time: string;
  opening_end_time: string;
  break_start_time?: string;
  break_end_time?: string;
  is_closed: boolean;
};

type FormValues = {
  name: string;
  logo: string;
  salon_type: string;
  email: string;
  phone: number;
  website: string;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  latitude: number;
  longitude: number;
  opening_hours: OpeningHour[];
};

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Salon name is required"),
  logo: Yup.string(),
  salon_type: Yup.string(),
  email: Yup.string().required("Email is required").email("Invalid email"),
  phone: Yup.number().required("Phone number is required"),
  website: Yup.string().url("Invalid URL"),
  street: Yup.string().required("Street is required"),
  city: Yup.string().required("City is required"),
  postal_code: Yup.string().required("Postal code is required"),
  country: Yup.string().required("Country is required"),
  latitude: Yup.number().required("Latitude is required"),
  longitude: Yup.number().required("Longitude is required"),
  opening_hours: Yup.array().of(
    Yup.object().shape({
      day: Yup.string().required("Day is required"),
      opening_start_time: Yup.string(),
      opening_end_time: Yup.string(),
      break_start_time: Yup.string(),
      break_end_time: Yup.string(),
      is_closed: Yup.boolean(),
    }),
  ),
});

const AddSalonDialog: React.FC<AddSalonDialogProps> = ({ isOpen, onClose }) => {
  const handleSubmit = async (salonData: AddSalonProps) => {
    // Handle form submission logic here
  };
  const salonTypes = [
    { value: "UNISEX", label: "Unisex Salon" },
    { value: "MALE", label: "Male Salon" },
    { value: "FEMALE", label: "Female Salon" },
  ];
  const days = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];

  const hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0"),
  );
  const minutes = ["00", "15", "30", "45"];
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Make the dialog vertically scrollable when content exceeds the viewport */}
      <DialogContent className="max-h-[80vh] !max-w-4xl overflow-y-auto shadow-md sm:!max-w-4xl md:!max-w-5xl dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle>Add New Salon</DialogTitle>
          <DialogDescription className="text-xs">
            Fill in the details to add a new salon.
          </DialogDescription>
        </DialogHeader>
        {/* Formik form for adding a new salon goes here */}
        <Formik
          initialValues={{
            name: "",
            logo: null,
            salon_type: "",
            email: "",
            phone: 0,
            website: "",
            street: "",
            city: "",
            postal_code: "",
            country: "",
            latitude: 0,
            longitude: 0,
            opening_hours: days.map((d) => ({
              day: d,
              opening_start_time: "08:00",
              opening_end_time: "22:00",
              break_start_time: "14:00",
              break_end_time: "16:00",
              is_closed: false,
            })),
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          <FormikForm>
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name" className="mb-2">
                  Salon Name<span className="text-danger">*</span>
                </Label>
                <Field
                  name="name"
                  id="name"
                  as="input"
                  type="text"
                  placeholder="Salon Name"
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-danger mt-1 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="status" className="mb-2">
                  Status
                </Label>
                <Field id="status" name="status" as="select" required>
                  <option value="" disabled>
                    Select a status
                  </option>
                  <option value="OPEN">Open</option>
                  <option value="CLOSED">Closed</option>
                </Field>
                <ErrorMessage
                  name="status"
                  component="div"
                  className="text-danger mt-1 text-xs"
                />
              </div>
            </div>
            <div className="mb-4 grid grid-cols-1">
              <Label htmlFor="logo" className="mb-2">
                Salon Logo
              </Label>
              <Field
                name="logo"
                id="logo"
                as="input"
                type="file"
                placeholder="Salon Logo"
              />
              <ErrorMessage
                name="logo"
                component="div"
                className="text-danger mt-1 text-xs"
              />
            </div>
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="role" className="mb-2">
                  Salon Type<span className="text-danger">*</span>
                </Label>
                <Field id="role" name="role" as="select" required>
                  <option value="" disabled>
                    Select a role
                  </option>
                  {salonTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="role"
                  component="div"
                  className="text-danger mt-1 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="email" className="mb-2">
                  Email<span className="text-danger">*</span>
                </Label>
                <Field
                  name="email"
                  id="email"
                  as="input"
                  type="email"
                  placeholder="Email"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-danger mt-1 text-xs"
                />
              </div>
            </div>
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="phone" className="mb-2">
                  Phone<span className="text-danger">*</span>
                </Label>
                <Field
                  name="phone"
                  id="phone"
                  as="input"
                  type="number"
                  placeholder="Phone"
                />
                <ErrorMessage
                  name="phone"
                  component="div"
                  className="text-danger mt-1 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="website" className="mb-2">
                  Website
                </Label>
                <Field
                  name="website"
                  id="website"
                  as="input"
                  type="text"
                  placeholder="Website"
                />
                <ErrorMessage
                  name="website"
                  component="div"
                  className="text-danger mt-1 text-xs"
                />
              </div>
            </div>
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="street" className="mb-2">
                  Street<span className="text-danger">*</span>
                </Label>
                <Field
                  name="street"
                  id="street"
                  as="input"
                  type="text"
                  placeholder="Street"
                />
                <ErrorMessage
                  name="street"
                  component="div"
                  className="text-danger mt-1 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="city" className="mb-2">
                  City<span className="text-danger">*</span>
                </Label>
                <Field
                  name="city"
                  id="city"
                  as="input"
                  type="text"
                  placeholder="City"
                />
                <ErrorMessage
                  name="city"
                  component="div"
                  className="text-danger mt-1 text-xs"
                />
              </div>
            </div>
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="postal_code" className="mb-2">
                  Postal Code<span className="text-danger">*</span>
                </Label>
                <Field
                  name="postal_code"
                  id="postal_code"
                  as="input"
                  type="text"
                  placeholder="Postal Code"
                />
                <ErrorMessage
                  name="postal_code"
                  component="div"
                  className="text-danger mt-1 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="country" className="mb-2">
                  Country<span className="text-danger">*</span>
                </Label>
                <Field name="country" id="country" as="select">
                  <option value="" disabled>
                    Select a country
                  </option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="country"
                  component="div"
                  className="text-danger mt-1 text-xs"
                />
              </div>
            </div>
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="latitude" className="mb-2">
                  Latitude<span className="text-danger">*</span>
                </Label>
                <Field
                  name="latitude"
                  id="latitude"
                  as="input"
                  type="number"
                  placeholder="Latitude"
                />
                <ErrorMessage
                  name="latitude"
                  component="div"
                  className="text-danger mt-1 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="longitude" className="mb-2">
                  Longitude<span className="text-danger">*</span>
                </Label>
                <Field
                  name="longitude"
                  id="longitude"
                  as="input"
                  type="number"
                  placeholder="Longitude"
                />
                <ErrorMessage
                  name="longitude"
                  component="div"
                  className="text-danger mt-1 text-xs"
                />
              </div>
            </div>
            {/* Opening hours editor */}
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-medium">Opening Hours</h3>
              <div className="bg-card rounded-md border p-4">
                <FieldArray name="opening_hours">
                  {() => (
                    <div className="space-y-3">
                      {/** header row */}
                      <div className="text-muted-foreground grid grid-cols-12 gap-2 px-2 py-2 text-xs">
                        <div className="col-span-3">Day</div>
                        <div className="col-span-2">Opening</div>
                        <div className="col-span-2">Closing</div>
                        <div className="col-span-2">Break Start</div>
                        <div className="col-span-2">Break End</div>
                        <div className="col-span-1 text-right">Closed</div>
                      </div>

                      <Field name="opening_hours">
                        {({ form }: { form: FormikProps<FormValues> }) => (
                          <>
                            {form.values.opening_hours.map(
                              (oh: OpeningHour, idx: number) => (
                                <div
                                  key={oh.day || idx}
                                  className="grid grid-cols-12 items-center gap-2 rounded-sm border-t px-2 pt-2"
                                >
                                  <div className="col-span-3 text-sm">
                                    {oh.day}
                                  </div>

                                  {/* Opening time */}
                                  <div className="col-span-2 flex items-center gap-1">
                                    <Field
                                      as="select"
                                      name={`opening_hours.${idx}.opening_start_time`}
                                      className="w-full"
                                    >
                                      {hours.map((h) =>
                                        minutes.map((m) => (
                                          <option
                                            key={`${h}:${m}`}
                                            value={`${h}:${m}`}
                                          >{`${h}:${m}`}</option>
                                        )),
                                      )}
                                    </Field>
                                  </div>

                                  {/* Closing time */}
                                  <div className="col-span-2 flex items-center gap-1">
                                    <Field
                                      as="select"
                                      name={`opening_hours.${idx}.opening_end_time`}
                                      className="w-full"
                                    >
                                      {hours.map((h) =>
                                        minutes.map((m) => (
                                          <option
                                            key={`${h}:${m}`}
                                            value={`${h}:${m}`}
                                          >{`${h}:${m}`}</option>
                                        )),
                                      )}
                                    </Field>
                                  </div>

                                  {/* Break start */}
                                  <div className="col-span-2 flex items-center gap-1">
                                    <Field
                                      as="select"
                                      name={`opening_hours.${idx}.break_start_time`}
                                      className="w-full"
                                    >
                                      <option value="">-</option>
                                      {hours.map((h) =>
                                        minutes.map((m) => (
                                          <option
                                            key={`bs-${h}:${m}`}
                                            value={`${h}:${m}`}
                                          >{`${h}:${m}`}</option>
                                        )),
                                      )}
                                    </Field>
                                  </div>

                                  {/* Break end */}
                                  <div className="col-span-2 flex items-center gap-1">
                                    <Field
                                      as="select"
                                      name={`opening_hours.${idx}.break_end_time`}
                                      className="w-full"
                                    >
                                      <option value="">-</option>
                                      {hours.map((h) =>
                                        minutes.map((m) => (
                                          <option
                                            key={`be-${h}:${m}`}
                                            value={`${h}:${m}`}
                                          >{`${h}:${m}`}</option>
                                        )),
                                      )}
                                    </Field>
                                  </div>

                                  <div className="col-span-1 flex justify-end">
                                    <Field
                                      name={`opening_hours.${idx}.is_closed`}
                                    >
                                      {({ field }: FieldProps) => (
                                        <Switch
                                          checked={Boolean(field.value)}
                                          onCheckedChange={(v: boolean) =>
                                            form.setFieldValue(field.name, v)
                                          }
                                        />
                                      )}
                                    </Field>
                                  </div>
                                </div>
                              ),
                            )}
                          </>
                        )}
                      </Field>
                    </div>
                  )}
                </FieldArray>
              </div>
            </div>
          </FormikForm>
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default AddSalonDialog;
