import styles from "./Navbar.module.css"
import Link from "next/link"


export function Navbar(){
  return (
    <header className={styles.Navbar}>
      <Link style={{float:"left"}} href="/MV">Logo/Brand</Link>
      <Link href="/MV/logout">Dark/Light</Link>
      <Link href="/MV/logout">Logout</Link>
      <Link href="/MV/about">About</Link>
      <Link href="/MV/stats">Stats</Link>
      <Link href="/MV/vault">My Vault</Link>
    </header>
  )
}