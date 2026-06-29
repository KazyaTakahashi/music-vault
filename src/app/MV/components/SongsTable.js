"use client";
import styles from './SongsTable.module.css';
import { useEffect, useState } from 'react';
import { ErrorList } from './ErrorList';

const columns = [
  { key: 'title', label: 'Title' },
  { key: 'artist', label: 'Artist' },
  { key: 'album', label: 'Album' },
  { key: 'link', label: 'Link' },
];

function getSongId(song) {
  return song?.id ?? song?.songID ?? song?.songId ?? song?.uuid ?? null;
}

export function SongsTable({ songListProp }) {
  const [songs, setSongs] = useState(songListProp ?? []);
  const [loading, setLoading] = useState(!songListProp?.length);
  const [error, setError] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', artist: '', album: '', link: '' });
  const [feedback, setFeedback] = useState([]);
  const [feedbackType, setFeedbackType] = useState('error');

  useEffect(() => {
    let cancelled = false;

    async function fetchSongs() {
      setLoading(true);
      setError([]);
      setFeedback([]);

      try {
        const res = await fetch('/MV/api/songs');
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          const messages = Array.isArray(data?.message) ? data.message : ['Unable to load songs right now.'];
          throw new Error(messages[0]);
        }

        if (!cancelled) {
          setSongs(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError([err?.message ?? 'Failed to fetch songs']);
          setSongs([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    const handleRefresh = () => {
      if (!cancelled) {
        void fetchSongs();
      }
    };

    if (!songListProp?.length) {
      void fetchSongs();
    }

    window.addEventListener('songs:refresh', handleRefresh);

    return () => {
      cancelled = true;
      window.removeEventListener('songs:refresh', handleRefresh);
    };
  }, [songListProp]);

  function startEdit(song) {
    setEditingId(getSongId(song));
    setFeedback([]);
    setEditForm({
      title: song?.title ?? '',
      artist: song?.artist ?? '',
      album: song?.album ?? '',
      link: song?.link ?? '',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({ title: '', artist: '', album: '', link: '' });
    setFeedback([]);
  }

  function updateEditForm(field, value) {
    setEditForm((current) => ({ ...current, [field]: value }));
  }

  async function handleEditSubmit(event, song) {
    event.preventDefault();
    const songID = getSongId(song);

    if (!songID) {
      setFeedback(['Unable to identify the selected song.']);
      setFeedbackType('error');
      return;
    }

    try {
      const res = await fetch('/MV/api/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'modify',
          songID,
          title: editForm.title,
          artist: editForm.artist,
          album: editForm.album,
          link: editForm.link,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setFeedback(Array.isArray(data?.message) ? data.message : ['Unable to update song right now.']);
        setFeedbackType('error');
        return;
      }

      cancelEdit();
      setFeedback(Array.isArray(data?.message) ? data.message : ['Song updated successfully.']);
      setFeedbackType('success');
      window.dispatchEvent(new CustomEvent('songs:refresh'));
    } catch (err) {
      setFeedback(['Unable to update song right now.']);
      setFeedbackType('error');
    }
  }

  async function handleDelete(song) {
    const songID = getSongId(song);

    if (!songID) {
      setFeedback(['Unable to identify the selected song.']);
      setFeedbackType('error');
      return;
    }

    if (!window.confirm('Delete this song entry?')) {
      return;
    }

    try {
      const res = await fetch('/MV/api/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'delete', songID }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setFeedback(Array.isArray(data?.message) ? data.message : ['Unable to delete song right now.']);
        setFeedbackType('error');
        return;
      }

      setFeedback(Array.isArray(data?.message) ? data.message : ['Song deleted successfully.']);
      setFeedbackType('success');
      window.dispatchEvent(new CustomEvent('songs:refresh'));
    } catch (err) {
      setFeedback(['Unable to delete song right now.']);
      setFeedbackType('error');
    }
  }

  return (
    <div className={styles.tableWrapper}>
      <div className={[styles.tableRow, styles.headerRow].join(' ')}>
        {columns.map((column) => (
          <div key={column.key} className={[styles.tableCell, styles.tableHeader].join(' ')}>
            {column.label}
          </div>
        ))}
        <div className={[styles.tableCell, styles.tableHeader].join(' ')}>Actions</div>
      </div>

      {loading && <div className={styles.tableMessage}>Loading songs…</div>}
      {error.length > 0 && (
        <div className={styles.tableMessageError}>
          <ErrorList list={error} />
        </div>
      )}
      {!loading && error.length === 0 && songs.length === 0 && (
        <div className={styles.tableMessage}>No songs available yet.</div>
      )}
      {feedback.length > 0 && (
        feedbackType === 'success' ? (
          <div className={styles.tableMessageSuccess}>{feedback[0]}</div>
        ) : (
          <div className={styles.tableMessageError}>
            <ErrorList list={feedback} />
          </div>
        )
      )}

      {!loading && error.length === 0 && songs.map((song, index) => {
        const songId = getSongId(song) ?? index;
        const isEditing = editingId === songId;

        return (
          <div key={songId}>
            <div className={styles.tableRow}>
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

              <div className={[styles.tableCell, styles.tableData, styles.actionCell].join(' ')}>
                {!isEditing ? (
                  <div className={styles.actionButtons}>
                    <button type="button" className={styles.secondaryButton} onClick={() => startEdit(song)}>
                      Edit
                    </button>
                    <button type="button" className={styles.dangerButton} onClick={() => void handleDelete(song)}>
                      Delete
                    </button>
                  </div>
                ) : (
                  <span className={styles.editingLabel}>Editing…</span>
                )}
              </div>
            </div>

            {isEditing && (
              <form className={styles.editForm} onSubmit={(event) => void handleEditSubmit(event, song)}>
                <div className={styles.editFields}>
                  <label className={styles.editField}>
                    <span>Title</span>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(event) => updateEditForm('title', event.target.value)}
                      required
                    />
                  </label>
                  <label className={styles.editField}>
                    <span>Artist</span>
                    <input
                      type="text"
                      value={editForm.artist}
                      onChange={(event) => updateEditForm('artist', event.target.value)}
                      required
                    />
                  </label>
                  <label className={styles.editField}>
                    <span>Album</span>
                    <input
                      type="text"
                      value={editForm.album}
                      onChange={(event) => updateEditForm('album', event.target.value)}
                    />
                  </label>
                  <label className={styles.editField}>
                    <span>Link</span>
                    <input
                      type="text"
                      value={editForm.link}
                      onChange={(event) => updateEditForm('link', event.target.value)}
                    />
                  </label>
                </div>

                <div className={styles.editActions}>
                  <button type="submit" className={styles.primaryButton}>Save</button>
                  <button type="button" className={styles.secondaryButton} onClick={cancelEdit}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        );
      })}
    </div>
  );
}
