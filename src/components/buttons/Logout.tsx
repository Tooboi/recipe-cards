import { doLogout } from "../../app/actions/index.js";

export default function Logout() {
  return (
    <form action={doLogout}>
      <button className="w-full text-left" type="submit">
        Logout
      </button>
    </form>
  );
}
