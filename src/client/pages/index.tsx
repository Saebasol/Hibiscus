import { useEffect } from "react"
import { useNavigate } from "react-router"
import { Flex, Spinner } from "@radix-ui/themes"

const Index = () => {
  const navigate = useNavigate()

  useEffect(() => {
    navigate("/list/1", { replace: true })
  }, [navigate])

  return (
    <Flex align="center" justify="center" height="100vh">
      <Spinner />
    </Flex>
  )
}

export default Index