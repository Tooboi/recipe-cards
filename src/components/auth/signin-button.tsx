import { signIn } from '../../lib/auth';

export default function SignInButton() {
  return (
    <form
      action={async () => {
        'use server';
        await signIn();
      }}
    >
      <button type="submit">Sign in</button>
    </form>
  );
}
