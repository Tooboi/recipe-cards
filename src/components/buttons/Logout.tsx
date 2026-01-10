import { doLogout } from "../../app/actions/index.js";

export default function Logout() {
  return (
    <form action={doLogout}>
      <button className="" type="submit">
        Logout
      </button>
    </form>
  );
}
