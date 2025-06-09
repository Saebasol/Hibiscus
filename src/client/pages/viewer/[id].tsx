import { useState, useEffect, useRef, useMemo } from 'react'
// @ts-ignore
import { useRouteContext } from '@fastify/react/client'
import Viewer from '../../components/Viewer'

export const layout = 'viewer'

// @ts-ignore
export function getData({ req }) {
  return { id: req.params.id }
}


const Index = () => {
  const { data } = useRouteContext()

  const images = []

  return (
    <Viewer images={images} />

  )
}

export default Index