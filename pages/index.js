import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [allPredictions, setAllPredictions] = useState(null);
  useEffect(() => {
    getAllPredictions();
  }, []);
  const getAllPredictions = async () => {
    const response = await fetch("/api/predictions/getAllPredictions");
    let allPredictions = await response.json();
    if (response.status !== 200) {
      setError(allPredictions.detail);
      return;
    }
    setAllPredictions(allPredictions);
    console.log({ allPredictions })
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: e.target.prompt.value,
      }),
    });
    let prediction = await response.json();
    if (response.status !== 201) {
      setError(prediction.detail);
      return;
    }
    setPrediction(prediction);

    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await sleep(1000);
      const response = await fetch("/api/predictions/" + prediction.id);
      prediction = await response.json();
      if (response.status !== 200) {
        setError(prediction.detail);
        return;
      }
      console.log({ prediction })
      setPrediction(prediction);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Replicate + Next.js</title>
      </Head>
      <div className={styles.header}>
        <h1>
          Diffusion AI
        </h1>
        <p>
          Designed by <a className={styles.a} href="https://stability.ai">Stability AI</a>, Stable Diffusion is a GPT-3 model that generates images from text prompts. This demo uses the <a href="https://replicate.com" className={styles.a}>Replicate</a> API to run the model.
        </p>
        <p style={
          {
          fontStyle: 'italic',
          }
        }>
          Website by Carson Rodrigues
        </p>
      </div>
      <div className={styles.body}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input type="text" name="prompt" placeholder="Enter a prompt to display an image" />
          <button type="submit">Go!</button>
        </form>

        {error && <div>{error}</div>}

        {prediction && (
          <div>
            {prediction.output && (
              <div className={styles.imageWrapper}>
                <Image
                  fill
                  src={prediction.output[prediction.output.length - 1]}
                  alt="output"
                  sizes='100vw'
                />
              </div>
            )}
            <p>status: {prediction.status}</p>
          </div>
        )}
      </div>
      <div className={styles.carousel}>
      <h2>
        Predictions from the past prompts:
        </h2>
        <div style={{
          margin: 'auto',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          alignContent: 'center',
          width: '100%',
        }}> 
        {allPredictions && allPredictions.map((prediction, i) => (
          <Image
            key={i}
            width={200}
            height={200}
            src={prediction.output[prediction.output.length - 1]}
            alt={`output ${i}`}
            style={{
              margin: '10px',
              borderRadius: '10px',
              boxShadow: '0 0 10px 0 rgba(0,0,0,0.5)'

            }}
            />
        ))}
          </div>
      </div>
      <div className={styles.footer}>

        Visit Carsons linkedin  <a className={styles.a} href="https://www.linkedin.com/in/rodriguescarson/">@rodriguescarson</a>

      </div>
    </div>
  );
}