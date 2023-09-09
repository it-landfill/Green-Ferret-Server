import Link from 'next/link';

export default function MyNavbar() {
  return (
    <nav>
      <div className=" flex max-w-screen-xl flex-wrap items-center justify-between p-4">
        <Link href="/" className="flex items-center">
          <span className="self-center whitespace-nowrap text-4xl font-bold text-green-600">
            Green-Ferret Admin
          </span>
        </Link>
      </div>
    </nav>
  );
}
