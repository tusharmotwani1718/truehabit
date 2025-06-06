import React, { useEffect, useState, useRef } from 'react'
import { motion, useAnimation, useInView } from 'framer-motion';
import useTheme from '../context/Theme/ThemeContext';


function Reveal({
    children,
    width = "fit-content",
    animateOnce = true,
    slideAnimation = true
}) {

    const { theme } = useTheme();

    

    const ref = useRef(null);
    const isInView = useInView(ref, { once: animateOnce });

    const mainControls = useAnimation();
    const slideControls = useAnimation();


    useEffect(() => {
        if (isInView) {
            mainControls.start("visible")
            slideControls.start("visible")
        }
    }, [isInView])
    return (
        <div ref={ref} style={{ position: "relative", width, overflow: "hidden" }}>
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: 75 },
                    visible: { opacity: 1, y: 0 }
                }}
                initial="hidden"
                animate={mainControls}
                transition={{ duration: .5, delay: .25 }}
                viewport={{
                    margin: "-1000px"
                }}
            >
                {children}
            </motion.div>
            {
                slideAnimation && (
                    <motion.div
                        variants={{
                            hidden: { left: 0 },
                            visible: { left: "100%" }
                        }}
                        initial="hidden"
                        animate={slideControls}
                        transition={{ duration: .5, ease: "easeIn" }}
                        viewport={{
                            margin: "-1000px"
                        }}
                        style={{
                            position: "absolute",
                            top: 4,
                            bottom: 4,
                            left: 0,
                            right: 0,
                            background: theme=='light' ? "#673AB7" : "#BB86FC" ,
                            zIndex: 20
                        }}
                    />
                )
            }
        </div>
    )
}

export default Reveal
