'use client';

import { XIcon } from '@/assets/icons';
import cn from '@/utils/cn';
import axios, { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Loader from '../Common/Loader';
import { InputGroup } from '../ui/input';

type Input = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

type PropsType = {
  userId?: string;
  isOpen: boolean;
  closeModal: () => void;
  addressType: 'SHIPPING' | 'BILLING';
  data?: Input & {
    id: string;
  };
  onSubmitSuccess?: () => void;
};

const AddressModal = ({
  isOpen,
  closeModal,
  addressType,
  data,
  userId,
  onSubmitSuccess,
}: PropsType) => {
  const { register, ...form } = useForm<Input>({
    defaultValues: {
      name: data?.name,
      email: data?.email,
      phone: data?.phone,
      address: data?.address,
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // closing modal while clicking outside
    function handleClickOutside(event: any) {
      if (!event.target.closest('.modal-content')) {
        closeModal();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeModal]);

  const onSubmit = async (inputData: Input) => {
    if (data === null) {
      setIsLoading(true);
      // create new address
      try {
        await axios.post(`/api/user/${userId}/address`, {
          address: {
            ...inputData,
            type: addressType,
          },
        });

        toast.success('Address added successfully');
        onSubmitSuccess?.();
      } catch (error) {
        toast.error('Failed to add address');
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);
      // update address
      try {
        await axios.patch(`/api/user/${userId}/address`, {
          id: data?.id,
          address: inputData,
        });

        toast.success('Address updated successfully');
        onSubmitSuccess?.();
      } catch (error) {
        if (error instanceof AxiosError) {
          console.log(error.response?.data);
        }
        toast.error('Failed to update address');
      } finally {
        setIsLoading(false);
      }
    }

    closeModal();
  };

  return (
    <div
      className={`fixed top-0 left-0 overflow-y-auto no-scrollbar w-full h-screen sm:py-20 xl:py-25 2xl:py-[230px] bg-dark/70 sm:px-8 px-4 py-5 ${isOpen ? 'block z-99999' : 'hidden'
        }`}
    >
      <div className="flex items-center justify-center ">
        <div
          x-show="addressModal"
          className="w-full max-w-[1100px] rounded-xl shadow-3 bg-white p-7.5 relative modal-content"
        >
          <button
            onClick={closeModal}
            aria-label="button for close modal"
            className="absolute top-0 right-0 sm:top-3 sm:right-3 flex items-center justify-center w-10 h-10 rounded-full ease-in duration-150 bg-meta text-body hover:text-dark"
          >
            <XIcon />
          </button>

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
              <div className="w-full">
                <Controller
                  control={form.control}
                  name="name"
                  rules={{ required: 'Name is required' }}
                  render={({ field, fieldState }) => (
                    <InputGroup
                      label="Name"
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      error={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                      required
                    />
                  )}
                />
              </div>

              <div className="w-full">
                <Controller
                  control={form.control}
                  name="email"
                  rules={{ required: 'Email is required' }}
                  render={({ field, fieldState }) => (
                    <InputGroup
                      type="email"
                      label="Email"
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      error={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                      required
                    />
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
              <div className="w-full">
                <Controller
                  control={form.control}
                  name="phone"
                  rules={{ required: 'Phone number is required' }}
                  render={({ field, fieldState }) => (
                    <InputGroup
                      type="tel"
                      label="Phone"
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      error={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                      required
                    />
                  )}
                />
              </div>

              <div className="w-full">
                <Controller
                  control={form.control}
                  name="address"
                  rules={{ required: 'Address is required' }}
                  render={({ field, fieldState }) => (
                    <InputGroup
                      label="Address"
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      error={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                      required
                    />
                  )}
                />
              </div>
            </div>

            <button className={cn("inline-flex items-center gap-2 font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark", {
              "opacity-80 pointer-events-none": isLoading,
            })}
              disabled={isLoading}
            >
              Save Changes {isLoading && <Loader />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;
