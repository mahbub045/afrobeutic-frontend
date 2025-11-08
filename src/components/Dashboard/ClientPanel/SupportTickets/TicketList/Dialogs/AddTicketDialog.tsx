"use client";

import { useAddSupportTicketMutation } from "@/Redux/Reducers/ClientPanel/SupportTickets/SupportTicketsApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ErrorMessage, Field, FieldProps, Form, Formik } from "formik";
import { Plus } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as Yup from "yup";

interface AddTicketFormValues {
  subject: string;
  queries: string;
  level: string;
  topic: string;
}

const schema = Yup.object().shape({
  subject: Yup.string().max(255).required("Subject is required"),
  queries: Yup.string().required("Queries are required"),
  level: Yup.string().required("Level is required"),
  topic: Yup.string().required("Topic is required"),
});

const AddTicketDialog: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [addTicket, { isLoading }] = useAddSupportTicketMutation();

  const levels = [
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
    { value: "URGENT", label: "Urgent" },
  ];
  const topics = [
    { value: "ACCOUNT", label: "Account" },
    { value: "SALON_MANAGEMENT", label: "Salon Management" },
    { value: "CHATBOTS", label: "Chatbots" },
    { value: "CLIENT_REQUESTS", label: "Client Requests" },
    { value: "OTHERS", label: "Others" },
  ];

  useEffect(() => {
    // generate previews as data URLs (so next/image can display them)
    let mounted = true;
    if (selectedFiles.length === 0) {
      setPreviews([]);
      return;
    }
    Promise.all(
      selectedFiles.map(
        (f) =>
          new Promise<string>((res, rej) => {
            const reader = new FileReader();
            reader.onload = () => res(String(reader.result));
            reader.onerror = rej;
            reader.readAsDataURL(f);
          }),
      ),
    )
      .then((urls) => {
        if (mounted) setPreviews(urls);
      })
      .catch(() => {
        if (mounted) setPreviews([]);
      });
    return () => {
      mounted = false;
    };
  }, [selectedFiles]);

  const handleFilesChange = (files: FileList | null) => {
    if (!files) return;

    // Reject if more than 3 images are selected
    if (files.length > 3) {
      toast.error(
        "You can only select up to 3 images. Please select 3 or fewer.",
      );
      return;
    }

    const arr = Array.from(files);
    setSelectedFiles(arr);
  };

  const handleSubmit = async (
    values: AddTicketFormValues,
    { resetForm }: { resetForm: () => void },
  ) => {
    try {
      const form = new FormData();
      form.append("subject", values.subject);
      form.append("queries", values.queries);
      form.append("level", values.level);
      form.append("topic", values.topic);
      selectedFiles.slice(0, 3).forEach((f) => {
        // use the same field name for multiple files
        form.append("uploaded_images", f);
      });

      await addTicket(form).unwrap();
      Swal.fire({
        icon: "success",
        iconColor: "#037375",
        title: "Added successfully",
        html: `Successfully added <b class="text-primary">${values.subject}</b> ticket`,
        background: resolvedTheme === "dark" ? "#0f1724" : undefined,
        color: resolvedTheme === "dark" ? "#e6eef0" : undefined,
        confirmButtonColor: "#037375",
        timer: 3000,
      });
      resetForm();
      setSelectedFiles([]);
      setOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to add support ticket. Please try again.");
    }
  };

  // no-op: we will upload files as multipart/form-data instead of base64

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          Create Ticket
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Support Ticket</DialogTitle>
        </DialogHeader>

        <Formik
          initialValues={
            {
              subject: "",
              queries: "",
              level: "LOW",
              topic: "ACCOUNT",
            } as AddTicketFormValues
          }
          validationSchema={schema}
          onSubmit={handleSubmit}
        >
          {({ values, handleChange, setFieldValue, isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <Label htmlFor="subject" className="mb-1">
                  Subject
                </Label>
                <Field
                  name="subject"
                  as="input"
                  type="text"
                  value={values.subject}
                  onChange={handleChange}
                />
                <div className="text-destructive text-sm">
                  <ErrorMessage name="subject" />
                </div>
              </div>

              <div>
                <Label htmlFor="queries" className="mb-1">
                  Queries
                </Label>
                <Field name="queries">
                  {({ field }: FieldProps) => (
                    <Textarea {...field} onChange={handleChange} />
                  )}
                </Field>
                <div className="text-destructive text-sm">
                  <ErrorMessage name="queries" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="topic" className="mb-1">
                    Topic
                  </Label>
                  <Field name="topic" as="select">
                    <option value="">Select a topic</option>
                    {topics.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Field>
                  <div className="text-destructive text-sm">
                    <ErrorMessage name="topic" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="level" className="mb-1">
                    Level
                  </Label>
                  <Field name="level" as="select">
                    <option value="">Select a level</option>
                    {levels.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </Field>
                  <div className="text-destructive text-sm">
                    <ErrorMessage name="level" />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="uploaded_images" className="mb-1">
                  Images (max 3)
                </Label>
                <Field name="uploaded_images">
                  {({ form }: FieldProps) => (
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = e.target.files;
                        handleFilesChange(files);
                        // also set Formik field value if needed
                        form.setFieldValue(
                          "uploaded_images",
                          files ? Array.from(files).slice(0, 3) : [],
                        );
                      }}
                    />
                  )}
                </Field>
                <div className="mt-2 flex gap-2">
                  {previews.map((p, i) => (
                    <div key={p} className="relative h-20 w-20">
                      <Image
                        src={p}
                        alt={`preview-${i}`}
                        fill
                        className="rounded border object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <div className="flex w-full justify-end gap-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || isLoading}>
                    {isLoading || isSubmitting ? "Creating..." : "Create"}
                  </Button>
                </div>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default AddTicketDialog;
