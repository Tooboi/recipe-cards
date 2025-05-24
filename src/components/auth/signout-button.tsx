// import { signOut } from '../../lib/auth';

export default function SignOutButton() {
  return (
    <form
      action={async () => {
        'use server';
        // await signOut();
      }}
    >
      <button className='font-semibold' type="submit">SIGN OUT</button>
    </form>
  );
}
