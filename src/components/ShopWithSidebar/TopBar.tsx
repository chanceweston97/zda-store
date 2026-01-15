type PropsType = {
  allProductsCount: number;
  showingProductsCount: number;
};

export default function TopBar({
  allProductsCount,
  showingProductsCount,
}: PropsType) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <p>
        Showing{' '}
        <span className="text-dark">
          {' '}
          {showingProductsCount} of {allProductsCount}{' '}
        </span>{' '}
        Products
      </p>
    </div>
  );
}
