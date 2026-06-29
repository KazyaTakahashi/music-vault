"use client";
import styles from "./SongInput.module.css";
import { ErrorList } from "./ErrorList";
import { LinkAPI } from "./LinkAPI";
import { useState } from 'react';

export function SongInput() {
  const [showInput, setShowInput] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [artistInput, setArtistInput] = useState("");
  const [albumInput, setAlbumInput] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [feedback, setFeedback] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);

  function toggleInput() {
    setShowInput((current) => !current);
    setFeedback([]);
    setIsSuccess(false);
  }

  async function SongSubmit(e) {
    e.preventDefault();
    setFeedback([]);
    setIsSuccess(false);

    const formData = new FormData(e.target);
    const title = formData.get('songTitle')?.toString().trim() ?? '';
    const artist = formData.get('songArtist')?.toString().trim() ?? '';
    const album = formData.get('songAlbum')?.toString().trim() ?? '';
    const link = formData.get('songLink')?.toString().trim() ?? '';
    const type = "add";

    try {
      const res = await fetch("/MV/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title, artist, album, link }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setFeedback(Array.isArray(data?.message) ? data.message : ['Unable to add song right now.']);
        return;
      }

      setTitleInput("");
      setArtistInput("");
      setAlbumInput("");
      setLinkInput("");
      setFeedback(Array.isArray(data?.message) ? data.message : ['Song created successfully.']);
      setIsSuccess(true);
      window.dispatchEvent(new CustomEvent('songs:refresh'));
    } catch (error) {
      console.error('Failed to add song', error);
      setFeedback(['Unable to add song right now.']);
    }
  }

  return (
    <>
      <button onClick={toggleInput}>Add song</button>

      {showInput && (
        <>
          {feedback.length > 0 && (
            isSuccess ? (
              <p className={styles.feedbackSuccess}>{feedback[0]}</p>
            ) : (
              <div className={styles.feedbackError}>
                <ErrorList list={feedback} />
              </div>
            )
          )}

          <form onSubmit={SongSubmit} className={styles.SongInput}>
            <label>Song Title</label> <br />
            <input
              name="songTitle"
              onChange={(e) => setTitleInput(e.target.value)}
              value={titleInput}
              required
            />
            <label>Artist</label> <br />
            <input
              name="songArtist"
              onChange={(e) => setArtistInput(e.target.value)}
              value={artistInput}
              required
            />
            <label>Album</label> <br />
            <input
              name="songAlbum"
              onChange={(e) => setAlbumInput(e.target.value)}
              value={albumInput}
            />
            <label>Link to the Song</label> <br />
            <input
              name="songLink"
              onChange={(e) => setLinkInput(e.target.value)}
              value={linkInput}
            />
            <button type="submit">Add</button>
          </form>

          <LinkAPI />
        </>
      )}
    </>
  );
}