"use client";
import styles from "./SongInput.module.css"
import { YoutubeAPI } from "./YoutubeAPI"
import { useState } from 'react';



export function SongInput()
{
  const [showInput, setShowInput] = useState(false)



  function toggleInput(e)
  {
    setShowInput(!showInput)
  }

  async function SongSubmit(e)
  {
    e.preventDefault();

    const formData = new FormData(e.target);
    const title  = formData.get('songTitle')
    const artist = formData.get('songArtist');
    const album  = formData.get('songAlbum');
    const link   = formData.get('songLink');
    const type = "add"


    try
    {
      const res = await fetch("/MV/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({type, title, artist, album, link})
      });


    }
    catch(error)
    {

    }




  }


  return (
    <>
    <button onClick={toggleInput}>Add song</button>

    {showInput &&
      <>
      <form onSubmit={SongSubmit} className={styles.SongInput}>
        <label>Song Title</label> <br />
          <input 
            name="songTitle"
            required
          />
        <label>Artist</label> <br />
          <input 
            name="songArtist"
            required
          />
        <label>Album</label> <br />
          <input 
            name="songAlbum"
          />
        <label>Link to the Song</label> <br />
          <input 
            name="songLink"
          />
      </form>

      <YoutubeAPI />
      </>
    }
    </>
  )
}