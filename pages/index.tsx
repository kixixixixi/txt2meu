import { useState, useEffect } from "react"
import type { FormEvent } from "react"
import { NextPage } from "next"
import axios from "axios"

const LOCAL_STORAGE_KEY_API_KEY = "OPENAI_API_KEY" as const

type ImageGenerationResponse = {
  created: number
  data: {
    url: string
  }[]
}

const IndexPage: NextPage = () => {
  const [apiKey, setApiKey] = useState<string>()
  const [poem, setPoem] = useState<string>()
  const [message, setMessage] = useState<string>()
  const [url, setUrl] = useState<string>()
  useEffect(() => {
    const storageApiKey = localStorage.getItem(LOCAL_STORAGE_KEY_API_KEY)
    if (storageApiKey) setApiKey(storageApiKey)
  }, [])
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!apiKey) return
    setMessage("Requesting...")
    setUrl(undefined)
    localStorage.setItem(LOCAL_STORAGE_KEY_API_KEY, apiKey)
    try {
      const {
        data: { data },
      } = await axios.post<ImageGenerationResponse>(
        "https://api.openai.com/v1/images/generations",
        {
          prompt: `以下の歌詞を使った楽曲のジャケット写真を生成: \`${poem}\``,
          size: "256x256",
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      )
      if (data.length == 1) {
        setMessage("Succeed generate.")
        setUrl(data[0].url)
      } else {
        throw "Invalid response"
      }
    } catch (e) {
      setMessage(`Error: ${e}`)
    }
  }
  return (
    <>
      <section style={{ padding: "2rem" }}>
        <h1 style={{ textAlign: "center" }}>Poem to Image</h1>
        <form
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: "720px",
            margin: "auto",
          }}
          onSubmit={submit}
        >
          <input
            placeholder="APIKey"
            type="password"
            style={{
              fontSize: "1.5rem",
              padding: ".5rem 1rem",
              width: "100%",
              marginBottom: "10px",
            }}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <textarea
            rows={4}
            placeholder="Poem"
            style={{
              fontSize: "1.5rem",
              padding: ".5rem 1rem",
              width: "100%",
              marginBottom: "10px",
            }}
            value={poem}
            onChange={(e) => setPoem(e.target.value)}
          />
          <button
            style={{
              padding: "1rem 2rem",
              backgroundColor: "green",
              color: "white",
              borderRadius: "5px",
              border: "none",
              fontSize: "1.5rem",
            }}
            disabled={!poem || !apiKey}
          >
            Generate
          </button>
        </form>
        <div style={{ maxWidth: "720px", margin: "1rem auto" }}>
          {message && (
            <p
              style={{
                display: "inline-block",
                color: "red",
                fontSize: "1.25rem",
                padding: ".5rem",
              }}
            >
              {message}
            </p>
          )}
          {url && (
            <img
              alt="Generated image"
              src={url}
              style={{
                display: "block",
                width: "100%",
                maxHeight: "720px",
              }}
            />
          )}
        </div>
      </section>
    </>
  )
}

export default IndexPage
