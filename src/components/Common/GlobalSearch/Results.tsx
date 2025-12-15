import { Hits } from 'react-instantsearch';
import SingleProductResult from './SingleProductResult';

const Results = (props: any) => {
  const { setSearchModalOpen, filterValue } = props;

  return (
    <div className="w-full px-4">
      {(filterValue === 'all' || filterValue === 'products') && (
        <>
          {filterValue === 'all' && (
            <h2 className="mb-2 text-xl text-dark font-bold">Products</h2>
          )}
          <Hits
            hitComponent={(props) => {
              return (
                props?.hit?.type === 'products' && (
                  <SingleProductResult
                    showImage={true}
                    hit={props?.hit}
                    setSearchModalOpen={setSearchModalOpen}
                    isProduct={true}
                  />
                )
              );
            }}
          />
        </>
      )}

      {(filterValue === 'all' || filterValue === 'blogs') && (
        <>
          {filterValue === 'all' && (
            <h2 className="mb-2 text-xl text-dark font-bold">Blogs</h2>
          )}
          <Hits
            hitComponent={(props) => {
              return (
                props?.hit?.type === 'blogs' && (
                  <SingleProductResult
                    showImage={true}
                    hit={props?.hit}
                    setSearchModalOpen={setSearchModalOpen}
                    isProduct={false}
                  />
                )
              );
            }}
          />
        </>
      )}
    </div>
  );
};

export default Results;
