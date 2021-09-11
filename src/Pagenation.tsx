import { Button, ButtonProps, Flex } from "@chakra-ui/react"
import React from "react"
import { useParams } from "react-router"
import { Link } from "react-router-dom"

const buttonStyles: ButtonProps = {
    as: "a",
    minW: "auto",
    rounded:"none",
    border: "1px",
    borderColor:"blackAlpha.300",
    px: 2,
    h: 9,
    _hover:{ bg: "whiteAlpha.400" },
    _focus:{}
}

const LinkButton = ({page}: {page:number}) =>{
    return (
        <Link to={`/list/${page}`}>
            <Button {...buttonStyles}>
                {page}
            </Button>
        </Link>
    )
}

const Pagination = ({ total, maxPage, currentPage }: { total: number, maxPage: number, currentPage: number }) => {
    return (
        <Flex>
            {[...new Array(maxPage).keys()].map(i => <LinkButton page={i+1}/>)}
        </Flex>
    )
}

export default Pagination