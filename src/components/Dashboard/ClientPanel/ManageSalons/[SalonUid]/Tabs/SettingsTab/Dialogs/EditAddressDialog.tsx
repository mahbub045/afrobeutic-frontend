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
  AddressFormValues,
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
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import React from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as Yup from "yup";

const EditAddressDialog: React.FC<EditDashboardProps> = ({
  singleSalonData,
  isOpen,
  onClose,
}) => {
  const { salonuid } = useParams();
  const { resolvedTheme } = useTheme();

  // RTK hooks
  const [editProfile, { isLoading }] = useEditSingleSalonMutation();

  const basicSchema = Yup.object().shape({
    address_one: Yup.string(),
    address_two: Yup.string(),
    city: Yup.string().required("City is required"),
    postal_code: Yup.string().required("Postal code is required"),
    country: Yup.string().required("Country is required"),
    address: Yup.string().nullable(),
  });

  const handleSubmit = async (
    values: AddressFormValues,
    { setSubmitting }: FormikHelpers<AddressFormValues>,
  ) => {
    setSubmitting(true);
    try {
      const payload: Partial<SalonProps> = {
        address_one: values.address_one,
        address_two: values.address_two,
        city: values.city,
        postal_code: values.postal_code,
        country: values.country,
        address: values.address || "",
      };

      await editProfile({
        salonUid: salonuid as string,
        salonData: payload,
      }).unwrap();
      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Updated",
        html: `Successfully updated address for <b class="text-primary">${singleSalonData?.name || "Salon"}</b>`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 2000,
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
          <DialogTitle className="text-primary">Edit Address</DialogTitle>
          <DialogDescription className="text-xs">
            Update salon address information.
          </DialogDescription>
        </DialogHeader>

        <Formik
          enableReinitialize
          initialValues={{
            address_one: singleSalonData?.address_one || "",
            address_two: singleSalonData?.address_two || "",
            city: singleSalonData?.city || "",
            postal_code: singleSalonData?.postal_code || "",
            country: singleSalonData?.country || "",
            address: singleSalonData?.address || "",
          }}
          validationSchema={basicSchema}
          onSubmit={handleSubmit}
        >
          {({ values }: FormikProps<AddressFormValues>) => (
            <FormikForm>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="address_one" className="mb-2">
                      Address Line 1
                    </Label>
                    <Field
                      id="address_one"
                      name="address_one"
                      type="text"
                      as="input"
                    />
                    <ErrorMessage
                      name="address_one"
                      component="div"
                      className="text-danger mt-1 text-xs"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address_two" className="mb-2">
                      Address Line 2
                    </Label>
                    <Field
                      id="address_two"
                      name="address_two"
                      type="text"
                      as="input"
                    />
                    <ErrorMessage
                      name="address_two"
                      component="div"
                      className="text-danger mt-1 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

export default EditAddressDialog;
