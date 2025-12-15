import React, { useState } from "react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

const EditOrder = ({ order, toggleModal }: any) => {
  const { data: session } = useSession();

  const [currentStatus, setCurrentStatus] = useState(order?.status);
  const handleChanege = (e: any) => {
    setCurrentStatus(e.target.value);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (!currentStatus) {
      toast.error("Please select a status");
      return;
    }

    if (session?.user?.role !== "ADMIN") {
      toast.error("You are not authorized to perform this action");
      return;
    }

    try {
      fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: order?.id, status: currentStatus }),
      });

      toast.success("Order status updated successfully");
      toggleModal();
      window.location.reload();
    } catch (error) {
      toast.error("Something went wrong");
      toggleModal();
      console.log(error);
    }
  };

  return (
    <div className="w-full px-10">
      <p className="pb-2 font-medium text-dark">Order Status</p>
      <div className="w-full">
        <select
          className="w-full rounded-[10px] border border-gray-3 bg-gray-1 text-dark py-3.5 px-5 text-custom-sm"
          name="status"
          id="status"
          required
          onChange={handleChanege}
        >
          <option value="processing">Processing</option>
          <option value="on-hold">On Hold</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <button
          className="mt-5 w-full rounded-[10px] border border-blue-1 bg-blue-1 text-white py-3.5 px-5 text-custom-sm bg-blue"
          onClick={handleSubmit}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditOrder;
