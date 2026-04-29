import React from "react";
import { X, User, Mail, Lock, Shield, Calendar, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { adminApiService } from "../../../../services/adminApiService";
import { toast } from "react-hot-toast";

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["user", "admin"]),
  age: z.coerce.number().min(1, "Age must be at least 1"),
  gender: z.enum(["Male", "Female", "Prefer not to say"]),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema) as any,
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
      age: 18,
      gender: "Male",
    },
  });

  const onSubmit = async (data: UserFormValues) => {
    try {
      await adminApiService.createUser(data);
      toast.success("User created successfully!");
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create user");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative h-32 bg-linear-to-br from-[#86B537] to-[#108ACB] p-8 flex items-end">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg">
              <User size={32} className="text-[#108ACB]" />
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-black tracking-tight">
                Add New User
              </h2>
              <p className="text-white/80 text-xs font-bold uppercase tracking-widest">
                Administrator Portal
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Name */}
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <User size={12} /> Full Name
              </label>
              <input
                {...register("name")}
                placeholder="Enter full name"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.name ? "border-red-500" : "border-gray-100"
                } bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#86B537]/20 focus:border-[#86B537] transition-all font-medium text-sm`}
              />
              {errors.name && (
                <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-tight">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Mail size={12} /> Email Address
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="email@example.com"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.email ? "border-red-500" : "border-gray-100"
                } bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#86B537]/20 focus:border-[#86B537] transition-all font-medium text-sm`}
              />
              {errors.email && (
                <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-tight">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Lock size={12} /> Password
              </label>
              <input
                {...register("password")}
                type="password"
                placeholder="Min 6 characters"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.password ? "border-red-500" : "border-gray-100"
                } bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#86B537]/20 focus:border-[#86B537] transition-all font-medium text-sm`}
              />
              {errors.password && (
                <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-tight">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Shield size={12} /> Role
              </label>
              <select
                {...register("role")}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#86B537]/20 focus:border-[#86B537] transition-all font-medium text-sm"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Age */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={12} /> Age
              </label>
              <input
                {...register("age")}
                type="number"
                placeholder="25"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.age ? "border-red-500" : "border-gray-100"
                } bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#86B537]/20 focus:border-[#86B537] transition-all font-medium text-sm`}
              />
              {errors.age && (
                <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-tight">
                  {errors.age.message}
                </p>
              )}
            </div>

            {/* Gender */}
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Users size={12} /> Gender
              </label>
              <select
                {...register("gender")}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#86B537]/20 focus:border-[#86B537] transition-all font-medium text-sm"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-2 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-white bg-[#86B537] hover:bg-[#75A030] shadow-lg shadow-[#86B537]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
