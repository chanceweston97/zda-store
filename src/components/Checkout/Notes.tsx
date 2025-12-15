import { useCheckoutForm } from "./form";

export default function Notes() {
  const { register } = useCheckoutForm();

  return (
    <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5 break-after-column">
      <label htmlFor="notes" className="block mb-2.5">
        Other Notes (optional)
      </label>
      <textarea
        {...register("notes")}
        id="notes"
        rows={5}
        placeholder="Notes about your order, e.g. special notes for delivery."
        className="rounded-xl border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-hidden duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
      />
    </div>
  );
}
