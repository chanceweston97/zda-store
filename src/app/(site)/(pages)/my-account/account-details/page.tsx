import { AccountInfo } from './_components/account-info';
import { PasswordChange } from './_components/password-change';

export default function Page() {
  return (
    <div className="xl:max-w-[770px] w-full">
      <AccountInfo />
      <PasswordChange />
    </div>
  );
}
