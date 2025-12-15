'use client';

import { CallIcon, EmailIcon, MapIcon } from '@/assets/icons';
import AddressModal from '@/components/MyAccount/AddressModal';
import { SquarePencilIcon, UserIcon } from '@/components/MyAccount/icons';
import axios from 'axios';
import { useEffect, useState } from 'react';

type AddressType = {
  name: string;
  email: string;
  phone: string;
  address: string;
  id: string;
};

type PropsType = {
  userId?: string;
};

export function ShippingAddress({ userId }: PropsType) {
  const [data, setData] = useState<AddressType>();
  const [addressModal, setAddressModal] = useState(false);

  const openAddressModal = () => {
    setAddressModal(true);
  };

  const closeAddressModal = () => {
    setAddressModal(false);
  };

  function fetchAddress() {
    if (!userId) return;

    axios
      .get(`/api/user/${userId}/address?type=SHIPPING`)
      .then(({ data }) => setData(data))
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    fetchAddress();
  }, [userId]);

  return (
    <>
      <div className="xl:max-w-[370px] w-full bg-white shadow-1 rounded-xl">
        <div className="flex items-center justify-between py-5 px-4 sm:pl-7.5 sm:pr-6 border-b border-gray-3">
          <p className="font-medium text-xl text-dark">Shipping Address</p>

          <button
            className="text-dark ease-out duration-200 hover:text-blue"
            onClick={openAddressModal}
          >
            <span className="sr-only">Open edit info modal</span>
            <SquarePencilIcon />
          </button>
        </div>

        <div className="p-4 sm:p-7.5">
          {
            data ? <div className="flex flex-col gap-4">
              <p className="flex items-center gap-2.5 text-custom-sm">
                <UserIcon className="shrink-0" />
                Name: {data?.name}
              </p>

              <p className="flex items-center gap-2.5 text-custom-sm">
                <EmailIcon className="shrink-0" />
                Email: {data?.email}
              </p>

              <p className="flex items-center gap-2.5 text-custom-sm">
                <CallIcon className="shrink-0" />
                Phone: {data?.phone}
              </p>

              <p className="flex gap-2.5 text-custom-sm">
                <MapIcon className="mt-0.5 shrink-0" />
                Address: {data?.address}
              </p>
            </div> : <div className='flex flex-col gap-4 items-center'>
              <p className="text-center text-dark-4">No address set yet</p>
              <button
                className="inline-flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue items-center gap-2"
                onClick={openAddressModal}
              >
                Add Address
              </button>
            </div>
          }
        </div>
      </div>

      <AddressModal
        isOpen={addressModal}
        closeModal={closeAddressModal}
        onSubmitSuccess={fetchAddress}
        addressType="SHIPPING"
        data={data}
        userId={userId}
        key={data?.id}
      />
    </>
  );
}
