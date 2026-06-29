"use client";
import styles from "./LinkAPI.module.css";
import { useRef, useState } from 'react';

export function LinkAPI()
{
  const formRef = useRef(null);


  async function handleLink(e){
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const url = formData.get('urlInput');
    

    var source = -1; //0=yt, 1=spotify
    var truncURL = [""];

    //www.youtube, music.youtube OR youtu.be
    if (url.includes("youtube") || url.includes("youtu.be"))
    {
      //                                     v         v
      //eg   https://www.youtube.com/watch?v=F8QHHliMe3A&list=RDGMEMJQXQAmqrnmK1SEjY_rKBGAVMF8QHHliMe3A&start_radio=1
      //eg https://music.youtube.com/watch?v=7TovqLDCosk&si=LG-ASLoJp5W1Qof9
      //                    v         v
      //eg https://youtu.be/79vTeZzLmcY?t=39

      truncURL = url.match(/([a-z0-9_-]{11})/i);
      source = 0;
    }
    else if (url.includes("track") && url.includes("spotify"))
    {
      //                                  v                    v
      //eg https://open.spotify.com/track/0RNtI4N0Ox6dnsruL9i0gp?
      
      truncURL = url.match(/([a-z0-9_-]{22})/i);
      source = 1;
    
    }

    console.log(truncURL[0]);
    
    if (source == 0)
    {

    }
    else if (source == 1)
    {

    }
    else
    {
      
    }


    
    

    

  }



  return (
    <>
    <form className={styles.Link} onSubmit={handleLink}>
      <input
        name="urlInput"
        placeholder="Youtube link"
      />
    </form>
    </>
  )
}

