import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'



function HomePage() {
  return(
  <div>
  <Head>
    <title>Mental Hub</title>
    <meta name="description" content="MentalHub-landingPage" />
    <link rel="icon" href="/favicon.ico" />
  </Head>


  <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Mental Hub!</h1>
          <div className={styles.description}>
            what is mentalhub.
          </div>
          <div>
          <img className={styles.image} src="./crypto-devs.svg" />
        </div>
        </div>        
      </div>

  <footer className={styles.footer}>
    Made with &#10084; by MentalHub
  </footer>
</div>
)
        
}

export default HomePage