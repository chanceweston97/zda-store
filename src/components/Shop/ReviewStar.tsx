import { StarIcon } from '@/assets/icons';

const ReviewStar = ({ reviews }: { reviews: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, index) => (
        <StarIcon
          key={index}
          className={reviews > 0 ? 'fill-[#FFA645]' : 'fill-gray-4'}
        />
      ))}
    </div>
  );
};

export default ReviewStar;
