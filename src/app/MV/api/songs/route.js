import { NextResponse } from 'next/server';
import { verifyJwt } from '../../lib/jwt';
import { enforceRateLimit, getClientIp } from '../../lib/auth';
import db from '../../db/database';

function createMessageResponse(message, status = 400) {
  const messages = Array.isArray(message) ? message : [message];
  return NextResponse.json({ message: messages }, { status });
}

export async function GET(req) {
  const authToken = req.cookies.get('auth_token')?.value;
  const payload = verifyJwt(authToken);

  if (!payload?.sub) {
    return createMessageResponse('Not authenticated', 401);
  }

  try {
    const songs = await db.execute({
      sql: 'SELECT * FROM songs WHERE user_id = ?',
      args: [payload.sub],
    });

    return NextResponse.json(songs.rows);
  } catch (error) {
    console.error('songs fetch error:', error);
    return createMessageResponse('Unable to load your songs right now.', 500);
  }
}

export async function POST(req) {
  const authToken = req.cookies.get('auth_token')?.value;
  const payload = verifyJwt(authToken);

  if (!payload?.sub) {
    return createMessageResponse('Not authenticated', 401);
  }

  const ip = getClientIp(req);
  const rateLimitKey = `songs:${ip}`;
  const rateLimitError = enforceRateLimit(rateLimitKey, 1, 2);

  if (rateLimitError) {
    return createMessageResponse(rateLimitError, 429);
  }

  let body;

  try {
    body = await req.json();
  } catch {
    return createMessageResponse('Invalid request payload.', 400);
  }

  const { type, songID, title, artist, album, link } = body ?? {};
  const normalizedTitle = typeof title === 'string' ? title.trim() : '';
  const normalizedArtist = typeof artist === 'string' ? artist.trim() : '';
  const normalizedAlbum = typeof album === 'string' ? album.trim() : '';
  const normalizedLink = typeof link === 'string' ? link.trim() : '';

  try {
    if (type === 'add') {
      if (!normalizedTitle || !normalizedArtist) {
        return createMessageResponse('Title and artist are required.', 400);
      }

      await db.execute({
        sql: 'INSERT INTO songs (user_id, title, artist, album, link) VALUES (?, ?, ?, ?, ?)',
        args: [payload.sub, normalizedTitle, normalizedArtist, normalizedAlbum, normalizedLink],
      });

      return NextResponse.json(
        {
          success: true,
          message: ['Song successfully created.'],
        },
        { status: 201 }
      );
    }

    if (type === 'modify') {
      if (!songID) {
        return createMessageResponse('A song ID is required.', 400);
      }

      if (!normalizedTitle || !normalizedArtist) {
        return createMessageResponse('Title and artist are required.', 400);
      }

      await db.execute({
        sql: 'UPDATE songs SET title = ?, artist = ?, album = ?, link = ? WHERE id = ?',
        args: [normalizedTitle, normalizedArtist, normalizedAlbum, normalizedLink, songID],
      });

      return NextResponse.json(
        {
          success: true,
          message: ['Song successfully modified.'],
        },
        { status: 201 }
      );
    }

    if (type === 'delete') {
      if (!songID) {
        return createMessageResponse('A song ID is required.', 400);
      }

      await db.execute({
        sql: 'DELETE FROM songs WHERE id = ?',
        args: [songID],
      });

      return NextResponse.json(
        {
          success: true,
          message: ['Song successfully deleted.'],
        },
        { status: 201 }
      );
    }

    return createMessageResponse('Unknown song action.', 400);
  } catch (error) {
    console.error('song action error:', error);
    return createMessageResponse('An unexpected error occurred while updating your songs.', 500);
  }
}