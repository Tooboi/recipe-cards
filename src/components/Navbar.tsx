import Link from "next/link";

export default function Navbar() {

  return (
    <div className="bg-slate-300 py-1 px-2">
      <div className="navbar m-auto max-w-7xl flex-row gap-2">
        <div className="flex-1">
          <Link
            href="/"
            className="text-3xl mx-auto xs:mx-0 normal-case hover:bg-transparent tracking-wide xs:tracking-wide "
          >
            {/* <Image src={logo} height={40} width={40} alt="GAMMA2DOT2" /> */}
            RECIPE BOX
          </Link>
        </div>
        <div className=" hidden lg:flex">
          {/* <Tabs /> */}
        </div>
        <div className="flex-none gap-2 hidden xs:flex">
          {/* <form action={searchProducts}>
            <div className="form-control">
              <input
                name="searchQuery"
                placeholder="Search"
                className="input placeholder-brand-500 h-[2.5rem] w-full min-w-[100px] border-2 border-brand-800 bg-transparent backdrop-blur-sm "
              />
            </div>
          </form> */}
          {/* <UserMenuButton session={session} /> */}
        </div>
      </div>
    </div>
  );
}
