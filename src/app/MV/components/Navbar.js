import Link from 'next/link';
import { cookies } from 'next/headers';
import { LogoutButton } from './Logout';
import { verifyJwt } from '../lib/jwt';
import navbarStyles from './Navbar.module.css';

export async function Navbar() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;
  const payload = verifyJwt(authToken);
  const isLoggedIn = !!payload?.sub;

  return (
    <header className={navbarStyles.Navbar}>
      <Link className={navbarStyles.brand} href="/MV">
        Logo/Brand
      </Link>

      <nav className={navbarStyles.navLinks}>
        <Link href="/MV/vault">My Vault</Link>
        <Link href="/MV/stats">Stats</Link>
        <Link href="/MV/about">About</Link>

        {isLoggedIn ? (
          <LogoutButton className={navbarStyles.logoutButton} />
        ) : (
          <div className={navbarStyles.authLinks}>
            <Link href="/MV/login">Login</Link>
            <Link href="/MV/register">Register</Link>
          </div>
        )}
      </nav>
    </header>
  );
}