// app/routes/$slug.tsx

import type { LoaderFunction } from '@remix-run/node'

import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { gql } from 'graphql-request'
import { hygraph } from '~/lib/hygraph.server'

import { RichText } from '@graphcms/rich-text-react-renderer'
import type { ElementNode } from '@graphcms/rich-text-types'

import { isPreviewMode } from '~/utils/preview-mode.server'
import { PreviewBanner } from '~/components/preview-banner'

const getArticleQuery = gql`
  query Article($url: String!) {
    article(where: { url: $url }) {
      title
      url
      content {
        ... on ArticleContentRichText {
          json
        }
      }
    }
  }
`

export const loader: LoaderFunction = async ({ params, request }) => {
    const { slug } = params
    const preview = await isPreviewMode(request)

    const API_TOKEN = preview
        ? process.env.HYGRAPH_DEV_TOKEN
        : process.env.HYGRAPH_PROD_TOKEN

    const data = await hygraph.request(
        getArticleQuery,
        {
            url: slug,
        },
        {
            authorization: `Bearer ${API_TOKEN}`,
        },
    )
    // console.log('dynamic routes data', data)
    return json({ ...data, isInPreview: preview })
}


type Article = {
    title: string
    content: {
        json: {
            children: ElementNode[]
        }
    }
}

type LoaderData = {
    article: Article
    isInPreview: boolean
}

export default function Index() {
    const { article, isInPreview } = useLoaderData<LoaderData>()

    return (
        <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
            {isInPreview && <PreviewBanner />}
            <h1>{article.title}</h1>
            <RichText content={article.content.json} />
        </div>
    )
}