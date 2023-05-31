import { useState, useEffect } from "react"
import type { FormEvent } from "react"
import { NextPage } from "next"
import axios from "axios"

const LOCAL_STORAGE_KEY_API_KEY = "OPENAI_API_KEY" as const

type ImageGenerationResponse = {
  object: "edit"
  created: number
  choices: {
    text: string
    index: number
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

const IndexPage: NextPage = () => {
  const [apiKey, setApiKey] = useState<string>()
  const [body, setBody] = useState<string>()
  const [message, setMessage] = useState<string>()
  const [response, setResponse] = useState<ImageGenerationResponse>()
  useEffect(() => {
    const storageApiKey = localStorage.getItem(LOCAL_STORAGE_KEY_API_KEY)
    if (storageApiKey) setApiKey(storageApiKey)
  }, [])
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!apiKey) return
    setMessage("Requesting...")
    setResponse(undefined)
    localStorage.setItem(LOCAL_STORAGE_KEY_API_KEY, apiKey)
    try {
      const { data } = await axios.post<ImageGenerationResponse>(
        "https://api.openai.com/v1/edits",
        {
          model: "text-davinci-edit-001",
          input: body,
          instruction:
            "語尾の敬語を除き、連体形に変更し最後に「めう」とつける。わたしなどの一人称を「めう」に変更。",
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      )
      if (data.choices.length > 0) {
        setMessage("Succeed generate.")
        setResponse(data)
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
        <h1 style={{ textAlign: "center" }}>Text to Meu Meu</h1>
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
            value={body}
            onChange={(e) => setBody(e.target.value)}
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
            disabled={!body || !apiKey}
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
          {response && response.choices.length > 0 && (
            <>
              {response.choices.map((choice) => (
                <p key={choice.index} style={{ fontSize: "2rem" }}>
                  {choice.text}
                </p>
              ))}
            </>
          )}
        </div>
      </section>
    </>
  )
}

export default IndexPage
