import React from 'react'
import dynamic from 'next/dynamic'
import Meta from '@/Components/Seo/Meta'

const CompareProperties = dynamic(() => import('@/Components/CompareProperties/CompareProperties'), { ssr: false })

const index = () => {
  return (
    <div>
      <Meta
        title=""
        description=""
        keywords=""
        ogImage=""
        pathName=""
      />
      <CompareProperties />
    </div>
  )
}

export default index
