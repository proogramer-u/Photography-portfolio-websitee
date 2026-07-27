import { motion as Motion } from "framer-motion"

const PageTransition = ({ children }) => {
  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      {children}
    </Motion.div>
  )
}

export default PageTransition
