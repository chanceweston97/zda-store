import { useGetProductReviewsQuery } from '@/redux/features/api/product';
import { Product } from '@/types/product';
import AddReviews from './AddReviews';
import ReviewItem from './ReviewItem';

const Reviews = ({ product }: { product: Product }) => {
  const { data: reviews = [], isLoading } = useGetProductReviewsQuery(
    product._id
  );

  if (isLoading) {
    return <p>Loading reviews...</p>;
  }

  return (
    <>
      <div className="max-w-[570px] w-full">
        <h2 className="font-medium text-2xl text-dark mb-9">
          {reviews.length} Review{reviews.length > 1 && 's'} for this product
        </h2>

        <div className="flex flex-col gap-6">
          {reviews?.map((review) => (
            <ReviewItem review={review} key={review.id} />
          ))}
        </div>
      </div>

      <AddReviews productId={product._id} />
    </>
  );
};

export default Reviews;
