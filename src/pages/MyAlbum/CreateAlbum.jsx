import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { authAPI } from "../../api/auth";
import { X } from "lucide-react";

// Validation schema
const AlbumSchema = Yup.object().shape({
  name: Yup.string().required("Album name is required"),
  description: Yup.string()
    .required("Description is required")
    .max(300, "Description must be at most 300 characters"),
});

const CreateAlbum = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [loading, setLoading] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-gray-500" />
        </button>

        <h2 className="text-xl font-bold mb-4">Create New Album</h2>

        <Formik
          initialValues={{ name: "", description: "" }}
          validationSchema={AlbumSchema}
          onSubmit={async (values, { resetForm, setSubmitting }) => {
            setLoading(true);
            try {
              await authAPI.createAlbum(values);
              toast.success("Album created successfully!");
              resetForm();
              onClose();
            } catch (error) {
              console.error("Failed to create album", error);
              toast.error("Failed to create album");
            } finally {
              setSubmitting(false);
              setLoading(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label className="block font-semibold">Album Name</label>
                <Field name="name" className="w-full border p-2 rounded" />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold">Description</label>
                <Field
                  name="description"
                  as="textarea"
                  className="w-full border p-2 rounded"
                />
                <ErrorMessage
                  name="description"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
                  disabled={isSubmitting || loading}
                >
                  {isSubmitting || loading ? "Creating..." : "Create Album"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreateAlbum;
