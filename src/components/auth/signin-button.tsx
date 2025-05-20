import { signIn } from "../../lib/auth"
 
export function SignIn() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn()
      }}
    >
      <button type="submit" className="btn">Sign in</button>
    </form>
  )
}