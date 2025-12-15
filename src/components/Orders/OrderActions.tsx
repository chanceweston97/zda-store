import { EyeIcon, PencilIcon } from '@/assets/icons';
import { useSession } from 'next-auth/react';

const OrderActions = ({ toggleEdit, toggleDetails }: any) => {
  const { data: session } = useSession();

  return (
    <>
      <button
        onClick={toggleDetails}
        className="hover:bg-gray-2 rounded-xs p-2"
      >
        <EyeIcon width={18} height={16} />
      </button>

      {session?.user?.role === 'ADMIN' && (
        <button onClick={toggleEdit} className="hover:bg-gray-2 rounded-xs p-2">
          <PencilIcon />
        </button>
      )}
    </>
  );
};

export default OrderActions;
