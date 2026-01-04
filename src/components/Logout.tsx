import { doLogout } from "../app/actions/index.js";

export default function Logout() {
  return (
    <form action={doLogout}>
      <button className="bg-blue-500 my-2 rounded-md" type="submit">
        Logout
      </button>
    </form>
  );
}
