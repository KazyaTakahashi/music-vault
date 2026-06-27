"use client";
import styles from "./YoutubeAPI.module.css";
import { useRef, useState } from 'react';

export function YoutubeAPI(){
  const formRef = useRef(null);


  async function handleLink(e){
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const url = formData.get('urlInput');
    
    
    
    console.log('Submitted URL:', url);


    
    

    

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

