import './vault.css';
import { SongsTable } from '../components/SongsTable';
import { SongInput } from '../components/SongInput';
import { cookies } from 'next/headers';
import { verifyJwt } from '../lib/jwt';

export default async function VaultPage() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;
  const payload = verifyJwt(authToken);
  const isLoggedIn = Boolean(payload?.sub);
  const title = isLoggedIn ? `${payload.username}'s Music Vault` : 'Music Vault';

  return (
    <>
      {isLoggedIn ? (
        <>
          <h1>{title}</h1>
          <SongInput />
          <SongsTable />
        </>
      ) : (
        <h1>Please log in to view your vault.</h1>
      )}
    </>
  );
}