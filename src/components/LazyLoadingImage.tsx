import * as React from 'react'
import api from '../api'
const LazyViewerImage = () => { // { imageUrl }: {imageUrl: string}
    const { useRef, useState, useEffect } = React
    const [ reload, setReload ] = useState<boolean>(false);
    const [ imgBlob, setBlob ] = useState<Blob>(new Blob());
    useEffect(() => {
        console.log('UseEffect with reload prop')
        if (confirm('Reload?')) {
            setReload(!reload);
            console.log('Reload! '+reload)
        } else {
            console.log('Not reload')
        }
    }, [ reload ])
    // const [ isIntersect, setIntersect ] = useState<boolean>()
    // const intersectionObserverRef = useRef<IntersectionObserver>()

    // const onIntersection = () => {
    //     console.log('Intersection!!!')
    // }
    // intersectionObserverRef.current = new IntersectionObserver(onIntersection, {})
    return (
        <a>ASDFASDF</a>
    )
}

export default LazyViewerImage