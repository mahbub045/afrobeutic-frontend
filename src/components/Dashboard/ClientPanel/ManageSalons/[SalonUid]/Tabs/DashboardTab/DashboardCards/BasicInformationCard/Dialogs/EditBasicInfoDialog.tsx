import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { countries } from "@/data/countries";
import { useEditSingleSalonMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/SingleSalon/SingleSalonApi";
import {
  BasicInfoFormValues,
  EditDashboardProps,
  SalonProps,
} from "@/Types/ClientPanel/ManageSalonTypes/SalonListType";
import {
  ErrorMessage,
  Field,
  Formik,
  Form as FormikForm,
  FormikHelpers,
  FormikProps,
} from "formik";
import { Scissors } from "lucide-react";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import React from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as Yup from "yup";

const EditBasicInfoDialog: React.FC<EditDashboardProps> = ({
  singleSalonData,
  isOpen,
  onClose,
}) => {
  const { salonuid } = useParams();
  const { resolvedTheme } = useTheme();

  // RTK hooks
  const [editBasicInfo, { isLoading }] = useEditSingleSalonMutation();

  const basicSchema = Yup.object().shape({
    name: Yup.string().required("Salon name is required"),
    salon_type: Yup.string().required("Salon type is required"),
    street: Yup.string().required("Street is required"),
    city: Yup.string().required("City is required"),
    postal_code: Yup.string().required("Postal code is required"),
    country: Yup.string().required("Country is required"),
    address: Yup.string().nullable(),
  });

  const handleSubmit = async (
    values: BasicInfoFormValues,
    { setSubmitting }: FormikHelpers<BasicInfoFormValues>,
  ) => {
    setSubmitting(true);
    try {
      if (values.logoFile) {
        const formData = new FormData();
        formData.append("logo", values.logoFile);
        formData.append("name", values.name);
        formData.append("salon_type", values.salon_type);
        formData.append("street", values.street);
        formData.append("city", values.city);
        formData.append("postal_code", values.postal_code);
        formData.append("country", values.country);
        formData.append("address", values.address || "");

        await editBasicInfo({
          salonUid: salonuid as string,
          salonData: formData,
        }).unwrap();
      } else {
        const payload: Partial<SalonProps> = {
          name: values.name,
          salon_type: values.salon_type,
          street: values.street,
          city: values.city,
          postal_code: values.postal_code,
          country: values.country,
        };

        await editBasicInfo({
          salonUid: salonuid as string,
          salonData: payload,
        }).unwrap();
      }

      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Updated",
        html: `Successfully updated <b class="text-primary">${values.name}</b>`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 3000,
      });
      onClose();
    } catch (error) {
      console.error("Failed to update salon", error);
      toast.error("Failed to update salon. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] !max-w-2xl overflow-y-auto shadow-md dark:shadow-gray-600">
        <DialogHeader>
          <DialogTitle className="text-primary">Edit Basic Info</DialogTitle>
          <DialogDescription className="text-xs">
            Update salon basic information.
          </DialogDescription>
        </DialogHeader>

        <Formik
          enableReinitialize
          initialValues={{
            logoFile: null as File | null,
            logoPreview: singleSalonData?.logo || "",
            name: singleSalonData?.name || "",
            salon_type: singleSalonData?.salon_type || "",
            street: singleSalonData?.street || "",
            city: singleSalonData?.city || "",
            postal_code: singleSalonData?.postal_code || "",
            country: singleSalonData?.country || "",
            address: singleSalonData?.address || "",
          }}
          validationSchema={basicSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue }: FormikProps<BasicInfoFormValues>) => (
            <FormikForm>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="size-14">
                    {values.logoPreview ? (
                      <AvatarImage src={values.logoPreview} alt="logo" />
                    ) : (
                      <AvatarFallback>
                        <Scissors className="size-6" />
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="flex-1">
                    <Label className="mb-2">Logo</Label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.currentTarget.files?.[0] || null;
                        setFieldValue("logoFile", file);
                        if (file) {
                          try {
                            const reader = new FileReader();
                            reader.onload = () =>
                              setFieldValue(
                                "logoPreview",
                                String(reader.result),
                              );
                            reader.readAsDataURL(file);
                          } catch (err) {
                            console.error(err);
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name" className="mb-2">
                      Salon Name
                    </Label>
                    <Field id="name" name="name" type="text" as="input" />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="text-danger mt-1 text-xs"
                    />
                  </div>

                  <div>
                    <Label htmlFor="salon_type" className="mb-2">
                      Salon Type
                    </Label>
                    <Field id="salon_type" name="salon_type" as="select">
                      <option value="" disabled>
                        Select a salon type
                      </option>
                      <option value="UNISEX">Unisex Salon</option>
                      <option value="MALE">Male Salon</option>
                      <option value="FEMALE">Female Salon</option>
                    </Field>
                    <ErrorMessage
                      name="salon_type"
                      component="div"
                      className="text-danger mt-1 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="street" className="mb-2">
                      Street
                    </Label>
                    <Field id="street" name="street" type="text" as="input" />
                    <ErrorMessage
                      name="street"
                      component="div"
                      className="text-danger mt-1 text-xs"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city" className="mb-2">
                      City
                    </Label>
                    <Field id="city" name="city" type="text" as="input" />
                    <ErrorMessage
                      name="city"
                      component="div"
                      className="text-danger mt-1 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="postal_code" className="mb-2">
                      Postal Code
                    </Label>
                    <Field
                      id="postal_code"
                      name="postal_code"
                      type="text"
                      as="input"
                    />
                    <ErrorMessage
                      name="postal_code"
                      component="div"
                      className="text-danger mt-1 text-xs"
                    />
                  </div>

                  <div>
                    <Label htmlFor="country" className="mb-2">
                      Country
                    </Label>
                    <Field id="country" name="country" as="select">
                      <option value="" disabled>
                        Select a country
                      </option>
                      {countries.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name}
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
                <div className="grid grid-cols-1">
                  <Label htmlFor="address" className="mb-2">
                    Google Location Link
                  </Label>
                  <Field id="address" name="address" type="text" as="input" />
                  <ErrorMessage
                    name="address"
                    component="div"
                    className="text-danger mt-1 text-xs"
                  />
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-40 text-white"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </FormikForm>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default EditBasicInfoDialog;
