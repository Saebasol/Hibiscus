// @ts-ignore
import { useRouteContext } from '@fastify/react/client'
import InfoCard from '../../components/Info'
import { Flex } from '@radix-ui/themes'
import { use, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import Pagenator from '../../components/Pagenator'



// @ts-ignore
export function getData({ req }) {
  return { index: req.params.index }
}

const Index = () => {
  const { data } = useRouteContext()
  const [infos, setInfos] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchInfos = async () => {
      try {
        const response = await fetch(`/internal/list/${data.index}`)
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const result = await response.json()
        setInfos(result.list)
        setCount(result.total)
      } catch (error) {
        console.error('Failed to fetch infos:', error)
      }
    }
    fetchInfos()
  }, [data.index])

  const onPageChange = (page: number) => {
    navigate(`/list/${page}`)

  }

  return (
    <Flex
      m="4"
      direction="column"
      gap="4"
      align="center"
    >
      {
        infos.map((item) => (
          <InfoCard
            key={item.id}
            infoData={item}
          />
        ))
      }
      <Pagenator
        count={count}
        currentPage={Number(data.index)}
        onPageChange={onPageChange}
      />
    </Flex>
  )
}

export default Index
