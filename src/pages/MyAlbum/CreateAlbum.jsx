import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { authAPI } from "../../api/auth";
import { X } from "lucide-react";

// Validation schema
const AlbumSchema = Yup.object().shape({
  name: Yup.string().required("Hãy nhập tên album").max(100, "Tên album không được quá 100 ký tự"),
  description: Yup.string()
    .required("Hãy nhập mô tả")
    .max(1000, "Mô ta mô tả không được quá 1000 ký tự"),
});

const CreateAlbum = ({ isOpen, onClose, onCreate }) => {
  if (!isOpen) return null;

  const [loading, setLoading] = useState(false);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[95vh] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-pink-500 to-rose-400 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Tạo Album Mới</h2>
              <p className="text-pink-100 text-sm mt-1">Thêm một Album</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(95vh-120px)]">
          <Formik
            initialValues={{ name: "", description: "" }}
            validationSchema={AlbumSchema}
            onSubmit={async (values, { resetForm, setSubmitting }) => {
              setLoading(true);
              try {
                await authAPI.createAlbum(values);
                toast.success("Tạo album thành công!");
                if (onCreate) await onCreate();
                resetForm();
                onClose();
              } catch (error) {
                console.error("Failed to create album", error);
                toast.error("Gặp lỗi khi tạo album. Vui lòng thử lại.");
              } finally {
                setSubmitting(false);
                setLoading(false);
              }
            }}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                <div>
                  <label className="block font-semibold">Tên Album</label>
                  <Field
                    name="name"
                    placeholder="Kỉ niệm ngày cưới, Sinh nhật..."
                    className="w-full border p-2 rounded"
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold">Mô Tả</label>
                  <Field
                    name="description"
                    as="textarea"
                    placeholder="Tổng hợp sự kiện năm...."
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
                    {isSubmitting || loading ? "Đang tải..." : "Tạo Album"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default CreateAlbum;
