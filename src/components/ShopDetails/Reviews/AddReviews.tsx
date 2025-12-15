'use client';

import { StarIcon } from '@/assets/icons';
import { InputGroup } from '@/components/ui/input';
import { useAddProductReviewMutation } from '@/redux/features/api/product';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

type PropsType = {
  productId: string;
};

type Input = {
  comment: string;
  name: string;
  email: string;
  ratings: number;
};

const AddReviews = ({ productId }: PropsType) => {
  const [hover, setHover] = useState(0);
  const [mutate, { isSuccess, isError, isLoading }] =
    useAddProductReviewMutation();

  const form = useForm<Input>();
  const commentLength = form.watch('comment')?.trim()?.length;

  const onSubmit = async (data: Input) => {
    if (data.ratings === undefined) {
      form.setError('ratings', {
        type: 'value',
        message: 'Rating is required',
      });
    }

    mutate({ ...data, comment: data.comment.trim(), productID: productId });

    if (isSuccess) {
      form.reset({
        ratings: 0,
        comment: '',
        name: '',
        email: '',
      });
    }

    if (isError) {
      toast.error('Failed to add review');
    }
  };

  return (
    <div className="max-w-[550px] w-full">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <h2 className="font-medium text-2xl text-dark mb-3.5">Add a Review</h2>

        <p className="mb-6">
          Your email address will not be published. Required fields are marked *
        </p>

        <div className="mb-7.5">
          <div className="flex items-center gap-3">
            <span>Your Rating*</span>

            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, index) => {
                index += 1;
                return (
                  <button
                    type="button"
                    key={index}
                    onClick={() => {
                      form.setValue('ratings', index);
                      form.clearErrors('ratings');
                    }}
                    onMouseEnter={() => setHover(index)}
                    onMouseLeave={() =>
                      setHover(() => form.getValues('ratings'))
                    }
                    className="disabled:pointer-events-none disabled:opacity-50"
                    disabled={isLoading}
                  >
                    <span
                      className={`cursor-pointer ${
                        index <= (hover || form.getValues('ratings'))
                          ? 'text-[#FBB040]'
                          : 'text-gray-5'
                      }`}
                    >
                      <StarIcon />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {form.formState.errors.ratings && (
            <p className="text-sm text-red mt-1.5">
              {form.formState.errors.ratings.message}
            </p>
          )}
        </div>

        <div className="rounded-xl bg-white shadow-1 p-4 sm:p-6">
          <div className="mb-5">
            <label htmlFor="comment" className="block mb-2.5">
              Comment
            </label>

            <textarea
              id="comment"
              placeholder="Your review"
              {...form.register('comment', {
                required: 'Comment is required',
                maxLength: 250,
              })}
              rows={5}
              maxLength={250}
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-hidden duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-70 disabled:bg-gray-3/80"
              required
              disabled={isLoading}
            />

            {form.formState.errors.comment && (
              <p className="text-sm text-red mt-1.5">
                {form.formState.errors.comment.message}
              </p>
            )}

            <div className="flex items-center justify-between mt-2.5 text-custom-sm text-dark-4">
              <span>Maximum</span>
              <span className={commentLength > 250 ? 'text-red' : ''}>
                {commentLength || 0}/250
              </span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-5 sm:gap-7.5 mb-5.5">
            <Controller
              control={form.control}
              name="name"
              rules={{ required: 'Name is required' }}
              render={({ fieldState, field }) => (
                <InputGroup
                  label="Name"
                  placeholder="Your name"
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isLoading}
                />
              )}
            />

            <Controller
              control={form.control}
              name="email"
              rules={{ required: 'Email is required' }}
              render={({ fieldState, field }) => (
                <InputGroup
                  type="email"
                  label="Email"
                  placeholder="Your email"
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isLoading}
                />
              )}
            />
          </div>

          <button
            className="font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-70 disabled:pointer-events-none"
            disabled={isLoading}
          >
            Submit Review
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddReviews;
