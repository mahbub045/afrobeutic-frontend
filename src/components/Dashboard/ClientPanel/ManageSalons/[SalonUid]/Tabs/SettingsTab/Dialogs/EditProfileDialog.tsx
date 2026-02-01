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
import { useEditSingleSalonMutation } from "@/Redux/Reducers/ClientPanel/ManageSalons/SingleSalon/SingleSalonApi";
import {
  EditDashboardProps,
  ProfileInfoFormValues,
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

const EditProfileDialog: React.FC<EditDashboardProps> = ({
  singleSalonData,
  isOpen,
  onClose,
}) => {
  const { salonuid } = useParams();
  const { resolvedTheme } = useTheme();

  // RTK hooks
  const [editProfile, { isLoading }] = useEditSingleSalonMutation();

  const basicSchema = Yup.object().shape({
    name: Yup.string().required("Salon name is required"),
    salon_type: Yup.string().required("Salon type is required"),
  });

  const handleSubmit = async (
    values: ProfileInfoFormValues,
    { setSubmitting }: FormikHelpers<ProfileInfoFormValues>,
  ) => {
    setSubmitting(true);
    try {
      if (values.logoFile) {
        const formData = new FormData();
        formData.append("logo", values.logoFile);
        formData.append("name", values.name);
        formData.append("salon_type", values.salon_type);

        await editProfile({
          salonUid: salonuid as string,
          salonData: formData,
        }).unwrap();
      } else {
        const payload: Partial<SalonProps> = {
          name: values.name,
          salon_type: values.salon_type,
        };

        await editProfile({
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
          }}
          validationSchema={basicSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue }: FormikProps<ProfileInfoFormValues>) => (
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
                      <option value="BARBERSHOP">
                        Barbershop / Men’s Salon
                      </option>
                      <option value="UNISEX_SALON">Unisex Salon</option>
                      <option value="LADIES_SALON">Ladies Salon</option>
                    </Field>
                    <ErrorMessage
                      name="salon_type"
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

export default EditProfileDialog;
