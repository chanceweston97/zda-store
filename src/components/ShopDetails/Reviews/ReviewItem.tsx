import { StarIcon } from '@/assets/icons';
import type { Review } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';

const ReviewItem = ({ review }: { review: Review }) => {
  return (
    <div className="rounded-xl bg-white shadow-1 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <Link href="#" className="flex items-center gap-4">
          <div className="w-12.5 h-12.5 rounded-full overflow-hidden">
            <Image
              src="/images/users/user-01.jpg"
              alt="author"
              className="w-12.5 h-12.5 rounded-full overflow-hidden"
              width={50}
              height={50}
            />
          </div>

          <div>
            <h3 className="font-medium text-dark">{review?.name}</h3>
            <p className="text-custom-sm">User</p>
          </div>
        </Link>

        {/* make the star interactive */}

        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, index) => {
            return (
              <span
                key={index}
                className={`${
                  index + 1 <= (review?.ratings || 0)
                    ? 'text-[#FBB040]'
                    : 'text-gray-5'
                }`}
              >
                <StarIcon />
              </span>
            );
          })}
        </div>
      </div>

      <p className="text-dark mt-6">{review?.comment}</p>
    </div>
  );
};

export default ReviewItem;
