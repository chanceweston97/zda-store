import Link from "next/link";
import { Highlight } from "react-instantsearch";

export default function LinkResult({ hit, setSearchModalOpen }: any) {
  return (
    <div className="w-full group">
      <Link
        href={hit?.objectID || hit?.url}
        onClick={() => setSearchModalOpen(false)}
        className="block rounded-xl p-3 text-base font-medium text-black duration-300 group-hover:bg-[#E8EAEF] group-hover:text-primary sm:text-lg"
      >
        <Highlight attribute="name" hit={hit} />
      </Link>
    </div>
  );
}
