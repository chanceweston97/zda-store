import ResetPassword from '@/components/Auth/ResetPassword';

const ResetPasswordPage = async ({
  params,
}: {
  params: Promise<{ token: string }>;
}) => {
  const { token } = await params;
  return (
    <main>
      <ResetPassword token={token} />
    </main>
  );
};

export default ResetPasswordPage;
