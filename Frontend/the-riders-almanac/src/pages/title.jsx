import { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import '../index.css';

function Title() {
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowContent(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (

        <>
    <div className="pagefadein"></div>
        <div className="title-page">
            <video className="titlebackgroundvideo"
            autoPlay
            muted
            loop
            playsInline
            >
                <source src="https://res.cloudinary.com/dqg9xe92b/video/upload/v1763042702/202511130803_dja9y0.mp4" type="video/mp4" alt="Cycling"
                />
                Sorry it looks like your browser doesn't like videos very much..
            </video>
                    
                    <img src={logo} className="title-logo fade-in-logo" alt="The Rider's Almanac Logo" title="click to enter" />


                </div >
        </>
    );
};



export default Title;