'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { RiAdminFill } from 'react-icons/ri';

interface NavbarLink {
  href: string;
  label: string;
}

const navLinks: NavbarLink[] = [{ href: '/', label: 'Home' }];

export default function MyNavbar() {
  {
    /* Get the current route */
  }
  const currentRoute = usePathname();

  return (
    <nav className="border-gray-200 bg-white">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4">
        <Link href="/" className="flex items-center">
          <RiAdminFill className="mr-3 h-8 text-2xl " />
          <span className="self-center whitespace-nowrap text-2xl font-semibold ">
            Green-Ferret Admin
          </span>
        </Link>
        <div className="hidden w-full md:block md:w-auto" id="navbar-default">
          <ul className="mt-4 flex flex-col rounded-lg border border-gray-100 bg-gray-50 p-4 font-medium  md:mt-0 md:flex-row md:space-x-8 md:border-0 md:bg-white md:p-0">
            {
              /* Loop over the navLinks array and show a link for each */
              navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={
                      currentRoute === href
                        ? 'navbar_selected'
                        : 'navbar_unselected'
                    }
                    aria-current={currentRoute === href ? 'page' : undefined}
                  >
                    {label}
                  </Link>
                </li>
              ))
            }
          </ul>
        </div>
      </div>
    </nav>
  );
}
