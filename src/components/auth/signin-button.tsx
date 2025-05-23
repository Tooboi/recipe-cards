import { signIn } from '../../lib/auth';

export default function SignInButton() {
  return (
    <form
      action={async () => {
        'use server';
        await signIn();
      }}
    >
      <button className='font-semibold' type="submit">SIGN IN</button>
    </form>
  );
}
