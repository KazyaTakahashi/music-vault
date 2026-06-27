"use client";
import styles from './SongsTable.module.css';
import { useEffect, useState } from 'react';

const columns = [
  { key: 'title', label: 'Title' },
  { key: 'artist', label: 'Artist' },
  { key: 'album', label: 'Album' },
  { key: 'link', label: 'Link' },
];

export function SongsTable({ songListProp }) {
  const [songs, setSongs] = useState(songListProp ?? []);
  const [loading, setLoading] = useState(!songListProp?.length);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (songListProp?.length) return;

    let cancelled = false;

    async function fetchSongs() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/MV/api/songs');
        if (!res.ok) {
          throw new Error(`Unable to load songs (${res.status})`);
        }

        const data = await res.json();
        if (!cancelled) {
          setSongs(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message ?? 'Failed to fetch songs');
          setSongs([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchSongs();

    return () => {
      cancelled = true;
    };
  }, [songListProp]);

  return (
    <div className={styles.tableWrapper}>
      <div className={[styles.tableRow, styles.headerRow].join(' ')}>
        {columns.map((column) => (
          <div key={column.key} className={[styles.tableCell, styles.tableHeader].join(' ')}>
            {column.label}
          </div>
        ))}
      </div>

      {loading && <div className={styles.tableMessage}>Loading songs…</div>}
      {error && <div className={styles.tableMessageError}>{error}</div>}
      {!loading && !error && songs.length === 0 && (
        <div className={styles.tableMessage}>No songs available yet.</div>
      )}

      {!loading && !error && songs.map((song, index) => (
        <div key={song.id ?? index} className={styles.tableRow}>
          {columns.map((column) => (
            <div key={column.key} className={[styles.tableCell, styles.tableData].join(' ')}>
              {column.key === 'link' ? (
                <a
                  className={styles.linkText}
                  href={song[column.key] || '#'}
                  target="_blank"
                  rel="noreferrer"
                >
                  {song[column.key] || 'No link'}
                </a>
              ) : (
                <span>{song[column.key] ?? '-'}</span>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
