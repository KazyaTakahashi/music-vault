import { NextResponse } from 'next/server';
import { verifyJwt } from '../../lib/jwt';
import { enforceRateLimit, clearRateLimit, validateRegisterPayload, getClientIp } from '../../lib/auth';
import db from '../../db/database';

export async function GET(req)
{
  const authToken = req.cookies.get('auth_token')?.value;
  const payload = verifyJwt(authToken);
  if (!payload?.sub) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const songs = await db.execute({
    sql: 'SELECT * FROM songs WHERE user_id = ?',
    args: [payload.sub]
  });
  
  return NextResponse.json(songs.rows);
}

export async function POST(req)
{
  const authToken = req.cookies.get('auth_token')?.value;
  const payload = verifyJwt(authToken);
  if (!payload?.sub) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const ip = getClientIp(req);
  const rateLimitKey = `songs:${ip}`;
  const rateLimitError = enforceRateLimit(rateLimitKey, 3, 60 * 10);

  if (rateLimitError) {
    return NextResponse.json({ message: [rateLimitError] }, { status: 429 });
  }
  

  const { type } = await req.json();


  if (type == "add")
  {
    const { title, artist, album, link } = await req.json();

    try
    {
      const insert = await db.execute({
        sql: 'INSERT INTO songs (user_id, title, artist, album, link) VALUES (?, ?, ?, ?, ?)',
        args: [payload.sub, title, artist, album, link]
      });
    }
    catch (error)
    {
      console.error('song add error:', error);
      return NextResponse.json({ message: ['An unknown error occurred. Please try again.'] }, { status: 500 });
    }


  }
  else if (type == "modify")
  {
    const { songID, title, artist, album, link } = await req.json();

    try
    {
          await db.execute({
      sql: "UPDATE users SET twofa_secret = ? WHERE id = ?",
      args: [tempSecret, id]
    });
      const insert = await db.execute({
        sql: 'UPDATE songs SET (title = ?, artist = ?, album = ?, link = ?) WHERE id = ?',
        args: [title, artist, album, link, songID]
      });
    }
    catch (error)
    {
      console.error('song add error:', error);
      return NextResponse.json({ message: ['An unknown error occurred. Please try again.'] }, { status: 500 });
    }

  }
  else if (type == "delete")
  {
    const { songID } = await req.json();

    try
    {
      const insert = await db.execute({
        sql: 'DELETE FROM songs WHERE id = ?',
        args: [songID]
      });
    }
    catch (error)
    {
      console.error('song add error:', error);
      return NextResponse.json({ message: ['An unknown error occurred. Please try again.'] }, { status: 500 });
    }
  }



}