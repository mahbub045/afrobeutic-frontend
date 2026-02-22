"use client";
import AddressPickerDialog from "@/components/Location/AddressPickerDialog";
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
} from "formik";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import React, { useState } from "react";
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

  const [isAddressPickerOpen, setIsAddressPickerOpen] = useState(false);

  // RTK hooks
  const [editProfile, { isLoading }] = useEditSingleSalonMutation();

  const basicSchema = Yup.object().shape({
    formatted_address: Yup.string(),
    city: Yup.string().required("City is required"),
    postal_code: Yup.string().required("Postal code is required"),
    country: Yup.string().required("Country is required"),
    latitude: Yup.number()
      .typeError("Latitude is required")
      .required("Latitude is required"),
    longitude: Yup.number()
      .typeError("Longitude is required")
      .required("Longitude is required"),
  });

  const handleSubmit = async (
    values: AddressFormValues,
    { setSubmitting }: FormikHelpers<AddressFormValues>,
  ) => {
    setSubmitting(true);
    try {
      const payload: Partial<SalonProps> = {
        formatted_address: values.formatted_address || "",
        google_place_id: values.google_place_id,
        city: values.city,
        postal_code: values.postal_code,
        country: values.country,
        latitude: values.latitude,
        longitude: values.longitude,
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

        <Formik<AddressFormValues>
          enableReinitialize
          initialValues={{
            formatted_address: singleSalonData?.formatted_address || "",
            google_place_id: singleSalonData?.google_place_id || undefined,
            city: singleSalonData?.city || "",
            postal_code: singleSalonData?.postal_code || "",
            country: singleSalonData?.country || "",
            latitude: singleSalonData?.latitude,
            longitude: singleSalonData?.longitude,
          }}
          validationSchema={basicSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue }) => (
            <FormikForm>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label htmlFor="formatted_address" className="mb-2">
                          Address
                        </Label>
                        <Field
                          id="formatted_address"
                          name="formatted_address"
                          type="text"
                          as="input"
                          readOnly
                        />
                        <ErrorMessage
                          name="formatted_address"
                          component="div"
                          className="text-danger mt-1 text-xs"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddressPickerOpen(true)}
                        disabled={isLoading}
                      >
                        Get Address
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="city" className="mb-2">
                      City
                    </Label>
                    <Field
                      id="city"
                      name="city"
                      type="text"
                      as="input"
                      readOnly
                    />
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
                      readOnly
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
                    <Field id="country" name="country" as="select" disabled>
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

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="latitude" className="mb-2">
                      Latitude
                    </Label>
                    <Field
                      id="latitude"
                      name="latitude"
                      type="number"
                      as="input"
                      readOnly
                    />
                    <ErrorMessage
                      name="latitude"
                      component="div"
                      className="text-danger mt-1 text-xs"
                    />
                  </div>

                  <div>
                    <Label htmlFor="longitude" className="mb-2">
                      Longitude
                    </Label>
                    <Field
                      id="longitude"
                      name="longitude"
                      type="number"
                      as="input"
                      readOnly
                    />
                    <ErrorMessage
                      name="longitude"
                      component="div"
                      className="text-danger mt-1 text-xs"
                    />
                  </div>
                </div>

                <AddressPickerDialog
                  open={isAddressPickerOpen}
                  onOpenChange={setIsAddressPickerOpen}
                  initialCenter={
                    values.latitude != null && values.longitude != null
                      ? { lat: values.latitude, lng: values.longitude }
                      : undefined
                  }
                  onSelect={(selection) => {
                    setFieldValue(
                      "formatted_address",
                      selection.formatted_address || "",
                    );
                    setFieldValue(
                      "google_place_id",
                      selection.google_place_id || "",
                    );
                    setFieldValue("city", selection.city || "");
                    setFieldValue("postal_code", selection.postal_code || "");
                    setFieldValue("country", selection.country || "");
                    setFieldValue("latitude", selection.latitude);
                    setFieldValue("longitude", selection.longitude);
                  }}
                />

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
