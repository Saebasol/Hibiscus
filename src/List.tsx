import { Flex, Box, Image, Text, Link, Container, Center} from '@chakra-ui/react'
import * as React from 'react'
import api from './api'
import type { heliotropeList, heliotropeInfo } from './types'

const initInfo = {
    title: "title",
    thumbnail: "https://media.discordapp.net/attachments/745844596176715806/885093528424833024/92565412_p0_master1200.png",
    artist: [{value: "value", url:"url"}],
    group: [{value: "value", url:"url"}],
    type: null,
    language: null,
    series: [{value: "value", url:"url"}],
    character: [{value: "value", url:"url"}],
    tags: [{value: "value", url:"url"}],
    date: "date",
}

const List = () => {

    const { useState, useEffect } = React
    const [info, setInfo] = useState<heliotropeInfo>(initInfo)


    // const fetchHeliotropeList = async () => {
    //     const response = await fetch(api + "/hitomi/list/1")
    //     const heliotropeListResponse: heliotropeList = await response.json()

    //     const info = heliotropeListResponse.list[0]
    //     setInfo(info)
    
    // }

    useEffect(() => {

    }, [])

    return (
        // 컨테이너 나중에 옮겨야함
        <Container 
            w="100%" 
            maxW={{lg: "1140px"}}
            p={4}
        >
            <Box 
                display={{ md: "flex" }}
                padding="0.3125rem" 
                borderRadius="0.1875rem"
                boxShadow="rgb(0 0 0 / 16%) 0px 0.1875rem 0.1875rem 0px, rgb(0 0 0 / 8%) 0px 0px 0px 0.0625rem"
                border="0.0625rem solid rgba(0,0,0, 0.16)" 
                alignItems="stretch" 
                marginBottom="1.5rem"
             >
                <Center
                    backgroundColor="rgb(34, 36, 38)" 
                    flexShrink={0}
                >
                    <Image
                        maxW="100%" 
                        maxH="300px"
                        width={{ md: 40 }}
                        alt="thumbnail"
                        src={info.thumbnail}
                    />
                </Center>
                <Box 
                    mt={{ base: 4, md: 0 }}
                    ml={{ md: 6 }}
                >
                    <Link
                        mt={1}
                        display="block"
                        fontSize="lg"
                        lineHeight="normal"
                        fontWeight="semibold"
                        // 여기에 reader 리다이렉트
                        href="#"
                    >
                        {info.title}
                    </Link>
                    <Text
                        // 최적화가 필요한곳.
                        mt={2} 
                        color="gray.500"
                    >
                        작가: {info.artist.map(e => e.value)}
                    </Text>
                    <Text 
                        mt={2} 
                        color="gray.500"
                    >
                        원작: {info.series.map(e => e.value)}
                    </Text>
                    <Text 
                        mt={2} 
                        color="gray.500"
                    >
                        종류: {info.type ? info.series.map(e => e.value) : "N/A"}
                    </Text>
                    <Text 
                        mt={2} 
                        color="gray.500"
                    >
                        캐릭터: {info.series.map(e => e.value)}
                    </Text>
                    <Text 
                        mt={2} 
                        color="gray.500"
                    >
                        태그: {info.tags.map(e => e.value)}
                    </Text>
                </Box>
            </Box>
        </Container>
    )
}


export default List;