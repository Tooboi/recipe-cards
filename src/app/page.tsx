import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full flex-col rounded-xl border-4 border-stone-700 bg-stone-900 py-4 transition-all sm:w-1/2">
        <h1 className="text-center text-3xl tracking-wide">Recipe Card Generator</h1>
      </div>
      <div className="flex w-full flex-col  pt-6 transition-all sm:w-1/2">
        <Link
          className=" btn-block btn mx-auto mb-4 h-24 justify-center rounded-lg border-2 border-stone-600 bg-stone-700 text-lg font-medium text-stone-300 transition-all hover:border-2 hover:border-tertiary-600 hover:bg-tertiary-950 hover:text-tertiary-500"
          href={"/new-card"}
        >
          <h1 className="text-center text-3xl transition-all xs:text-4xl">
            Make New Card
          </h1>
        </Link>
      </div>
    </div>
  );
}
