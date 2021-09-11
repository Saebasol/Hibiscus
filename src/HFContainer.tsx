import Footer from "./Footer"
import Header from "./Header"
import React from "react"

const HFContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <Header/>
                {children}
            <Footer/>
        </>
    )
}
export default HFContainer