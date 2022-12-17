import type { LoaderFunction } from "@remix-run/node"

import { json } from '@remix-run/node'
import { useLoaderData } from "@remix-run/react"
import { gql } from 'graphql-request'
import { hygraph } from '~/lib/hygraph.server'

import { isPreviewMode } from '~/utils/preview-mode.server'
import { PreviewBanner } from '~/components/preview-banner'
import { Button } from "@mui/material"

import {styled} from "@mui/material/styles"

type Article = {
  id: string
  title: string
  url: string
  createdAt: string
}

type LoaderData = {
  articles: Article[]
  isInPreview: boolean
}

const allArticlesQuery = gql`
  {
    articles {
      id
      title
      url
      createdAt
    }
  }
`

export const loader: LoaderFunction = async ({ request }) => {
  const preview = await isPreviewMode(request)

  const API_TOKEN = preview
    ? process.env.HYGRAPH_DEV_TOKEN
    : process.env.HYGRAPH_PROD_TOKEN

  const data = await hygraph.request(allArticlesQuery, {}, {

    authorization: `Bearer ${API_TOKEN}`
  })

  // console.log('dafdasfasdfasvadcacasccssac', data)
  return json({ ...data, isInPreview: preview })
}

const StyledButton = styled(Button)`
  border: 3px solid red;
`


export default function Index() {
  const { articles, isInPreview } = useLoaderData<LoaderData>()

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      {isInPreview && <PreviewBanner />}
      <h1>Welcome to Remix</h1>
      <StyledButton>Hello</StyledButton>
      <ul>
        {articles.map((article) => (
          <li key={article.id}>
            <a href={`/${article.url}`}>{article.title}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}
