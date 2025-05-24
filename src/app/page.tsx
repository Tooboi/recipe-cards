import Link from "next/link";


export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* <div className="flex w-full flex-col rounded-xl border-4 border-stone-600 bg-stone-700 py-4 transition-all sm:w-1/2">
        <h1 className="text-center text-3xl tracking-wide">Recipe Card Generator</h1>
      </div> */}
      <div className="flex w-full flex-col  pt-6 transition-all sm:w-1/2">
        <Link
          className=" mx-auto mb-4 justify-center rounded-lg border-stone-600 bg-stone-700 text-lg font-medium text-stone-300 transition-all  hover:bg-tertiary-950 hover:text-tertiary-500"
          href={"/new-card"}
        >
          <h1 className="text-center w-full mx-auto p-2 justify-center rounded-md border-2 border-slate-600 bg-slate-300 text-lg font-medium text-slate-900 transition-all hover:bg-slate-400/80 hover:text-slate-700 active:bg-slate-500 active:text-slate-900 ">
            MAKE NEW RECIPE CARD
          </h1>
        </Link>
        
      </div>
    </div>
  );
}
