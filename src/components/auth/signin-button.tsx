// import Link from 'next/link';
// import { signIn } from '../../lib/auth';

export default function SignInButton() {
  return (
    // <div>
    //   <Link href="/signin">SIGN IN</Link>
    // </div>

    <form
      action={async () => {
        'use server';
        // await signIn();
      }}
    >
      <button className='font-semibold' type="submit">SIGN IN</button>
    </form>
  );
}
